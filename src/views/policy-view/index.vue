<template>
   <div class="policy-view">
      <div class="left-pane">
         <div class="left-header">政策分类</div>
         <el-input v-model="search" placeholder="搜索分类" clearable size="small" style="margin-bottom: 8px" />
         <el-tree
            ref="treeRef"
            :data="treeData"
            :props="{ label: 'categoryName', children: 'children' }"
            node-key="id"
            highlight-current
            :filter-node-method="filterNode"
            :default-expand-all="false"
            @node-click="onNodeClick"
         >
            <template #default="{ node, data }">
               <span class="tree-label">{{ data.categoryName }}</span>
            </template>
         </el-tree>
      </div>

      <div class="right-pane">
         <div v-if="!current" class="empty-state">
            <el-empty description="请选择 2 级分类查看政策" />
         </div>

         <template v-else>
            <div class="article-header">
               <h2 class="article-title">{{ current.title }}</h2>
               <div class="article-meta">
                  <el-tag size="small" type="info">v{{ current.versionNo }}</el-tag>
                  <span class="meta-item">浏览 {{ current.viewCount }}</span>
                  <span class="meta-item">更新 {{ current.updateTime }}</span>
               </div>
            </div>
            <el-divider />
            <div class="article-pics">
               <el-image
                  v-for="(u, i) in pics"
                  :key="i"
                  :src="u"
                  :preview-src-list="pics"
                  :initial-index="i"
                  fit="contain"
                  class="policy-img"
               />
            </div>

            <el-divider><span class="divider-text">历史版本</span></el-divider>
            <el-timeline>
               <el-timeline-item v-for="v in versions" :key="v.id" :timestamp="'版本 v' + v.versionNo + ' · ' + v.createTime" placement="top">
                  <el-card shadow="hover" @click="loadVersionDetail(v.id)" class="version-card">
                     <div class="version-title">{{ v.title }}</div>
                     <div class="version-meta">操作人:{{ v.createBy || 'system' }}</div>
                  </el-card>
               </el-timeline-item>
            </el-timeline>

            <!-- 详情大图 -->
            <el-dialog v-model="detailVisible" width="800px" :title="detailTitle">
               <el-image v-for="(u, i) in detailPics" :key="i" :src="u" :preview-src-list="detailPics" :initial-index="i" fit="contain" class="policy-img" />
            </el-dialog>
         </template>
      </div>
   </div>
</template>

<script setup lang="ts" name="PolicyView">
import { ref, onMounted, nextTick } from 'vue'
import { treePolicyCategory } from '@/api/policy/category'
import { getCurrentByCategory, getHistory, getHistoryDetail } from '@/api/policy/article'
import type { PolicyCategory, PolicyArticle, PolicyArticleVersion } from '@/types'

const treeData = ref<PolicyCategory[]>([])
const search = ref('')
const treeRef = ref()
const current = ref<PolicyArticle | null>(null)
const versions = ref<PolicyArticleVersion[]>([])
const pics = ref<string[]>([])

const detailVisible = ref(false)
const detailTitle = ref('')
const detailPics = ref<string[]>([])

function parsePics(json?: string | null): string[] {
  if (!json) return []
  try { const a = JSON.parse(json); return Array.isArray(a) ? a : [] } catch { return [] }
}

function loadTree() {
  treePolicyCategory().then((res: any) => {
    treeData.value = (res.data ?? []) as PolicyCategory[]
  })
}

function filterNode(value: string, data: any) {
  if (!value) return true
  return (data.categoryName || '').indexOf(value) >= 0
}

function onNodeClick(node: PolicyCategory) {
  if (!node.id) return
  // 只对 2 级分类(叶子)响应
  if (node.children && node.children.length > 0) return
  loadCurrent(node.id)
}

function loadCurrent(categoryId: number) {
  getCurrentByCategory(categoryId).then((res: any) => {
    current.value = res.data ?? null
    pics.value = parsePics(current.value?.pics)
    if (current.value?.id) loadHistory(current.value.id)
    else versions.value = []
  })
}

function loadHistory(articleId: number) {
  getHistory(articleId).then((res: any) => {
    versions.value = res.data ?? []
  })
}

function loadVersionDetail(versionId: number) {
  getHistoryDetail(versionId).then((res: any) => {
    const v = res.data
    if (!v) return
    detailTitle.value = (v.title || '') + ' (版本 v' + v.versionNo + ')'
    detailPics.value = parsePics(v.pics)
    detailVisible.value = true
  })
}

onMounted(() => {
  loadTree()
})
</script>

<style scoped>
.policy-view { display: flex; height: calc(100vh - 84px); padding: 12px; gap: 12px; background: #f5f7fa; }
.left-pane { width: 280px; background: #fff; padding: 16px; border-radius: 4px; overflow-y: auto; }
.left-header { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #303133; }
.tree-label { font-size: 13px; }
.right-pane { flex: 1; background: #fff; padding: 24px; border-radius: 4px; overflow-y: auto; }
.empty-state { display: flex; height: 100%; justify-content: center; align-items: center; }
.article-title { margin: 0 0 8px 0; color: #303133; font-size: 20px; }
.article-meta { display: flex; gap: 12px; align-items: center; color: #909399; font-size: 13px; }
.meta-item { color: #909399; }
.divider-text { color: #909399; font-weight: normal; font-size: 13px; }
.article-pics { display: flex; flex-direction: column; gap: 8px; }
.policy-img { width: 100%; max-height: 600px; }
.version-card { cursor: pointer; transition: all .2s; }
.version-card:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.08); }
.version-title { font-weight: 600; color: #303133; }
.version-meta { font-size: 12px; color: #909399; margin-top: 4px; }
</style>
