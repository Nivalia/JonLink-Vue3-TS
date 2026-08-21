<template>
   <div class="app-container">
      <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
         <el-form-item label="分类" prop="categoryId">
            <el-cascader v-model="quejlParams.parentAndChild" :options="categoryTree" :props="{ value: 'id', label: 'categoryName', checkStrictly: true, emitPath: false }" clearable placeholder="选择 2 级分类" @change="onCascaderChange" style="width: 280px" />
         </el-form-item>
         <el-form-item label="标题" prop="title">
            <el-input v-model="quejlParams.title" placeholder="政策标题关键词" clearable style="width: 240px" @keyup.enter="handleQuery" />
         </el-form-item>
         <el-form-item label="状态" prop="status">
            <el-select v-model="quejlParams.status" placeholder="发布状态" clearable style="width: 200px">
               <el-option label="草稿" value="0" />
               <el-option label="已发布" value="1" />
            </el-select>
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['policy:article:add']">新增</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['policy:article:edit']">修改</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['policy:article:remove']">删除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['policy:article:export']">导出</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="info" plain icon="Document" :disabled="single" @click="handleVersions" v-hasPermi="['policy:article:query']">历史版本</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="articleList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="分类" prop="categoryName" show-overflow-tooltip min-width="120" />
         <el-table-column label="政策标题" prop="title" show-overflow-tooltip min-width="220" />
         <el-table-column label="图片数" prop="pics" align="center" width="80">
            <template #default="scope">{{ parsePics(scope.row.pics).length }} 张</template>
         </el-table-column>
         <el-table-column label="版本号" prop="versionNo" align="center" width="80" />
         <el-table-column label="浏览数" prop="viewCount" align="center" width="80" />
         <el-table-column label="状态" prop="status" align="center" width="100">
            <template #default="scope">
               <el-tag :type="scope.row.status === '1' ? 'success' : 'info'">{{ scope.row.status === '1' ? '已发布' : '草稿' }}</el-tag>
            </template>
         </el-table-column>
         <el-table-column label="更新时间" prop="updateTime" align="center" width="180" />
         <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="220">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['policy:article:edit']">修改</el-button>
               <el-button link type="primary" :icon="scope.row.status === '1' ? 'Lock' : 'Unlock'" @click="handleToggleStatus(scope.row)" v-hasPermi="['policy:article:edit']">{{ scope.row.status === '1' ? '下架' : '发布' }}</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['policy:article:remove']">删除</el-button>
            </template>
         </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="quejlParams.pageNum" v-model:limit="quejlParams.pageSize" @pagination="getList" />

      <!-- 添加/修改 -->
      <el-dialog :title="title" v-model="open" width="780px" append-to-body>
         <el-form ref="articleRef" :model="form" :rules="rules" label-width="100px">
            <el-form-item label="政策分类" prop="categoryId">
               <el-cascader v-model="form.parentAndChild" :options="categoryTree" :props="{ value: 'id', label: 'categoryName', checkStrictly: true, emitPath: false }" placeholder="选择 2 级分类" style="width: 100%" @change="onFormCascaderChange" />
            </el-form-item>
            <el-form-item label="政策标题" prop="title">
               <el-input v-model="form.title" placeholder="请输入政策标题" />
            </el-form-item>
            <el-form-item label="图片" prop="pics">
               <ImageUpload v-model="form.pics" :limit="20" />
               <div class="form-tip">支持多图上传,顺序按添加顺序展示</div>
            </el-form-item>
            <el-form-item label="状态" prop="status">
               <el-radio-group v-model="form.status">
                  <el-radio value="0">草稿</el-radio>
                  <el-radio value="1">已发布</el-radio>
               </el-radio-group>
            </el-form-item>
            <el-form-item label="备注" prop="remark">
               <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
            </el-form-item>
         </el-form>
         <template #footer>
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
         </template>
      </el-dialog>

      <!-- 历史版本抽屉 -->
      <el-drawer v-model="versionDrawer" direction="rtl" size="540px" title="历史版本" :with-header="true">
         <div v-loading="versionLoading">
            <el-empty v-if="!versions.length" description="暂无历史版本" />
            <el-timeline v-else>
               <el-timeline-item v-for="v in versions" :key="v.id" :timestamp="'版本 v' + v.versionNo" placement="top">
                  <el-card shadow="hover">
                     <div class="version-meta">
                        <span class="title">{{ v.title }}</span>
                        <span class="time">{{ v.createTime }}</span>
                     </div>
                     <div class="version-imgs">
                        <el-image v-for="(u, i) in parsePics(v.pics)" :key="i" :src="u" :preview-src-list="parsePics(v.pics)" :initial-index="i" fit="cover" style="width: 100px; height: 60px; margin-right: 4px" />
                     </div>
                     <div class="version-actions">
                        <el-button type="primary" link @click="restoreVersion(v.id)">恢复为当前</el-button>
                     </div>
                  </el-card>
               </el-timeline-item>
            </el-timeline>
         </div>
      </el-drawer>
   </div>
</template>

<script setup lang="ts" name="PolicyArticle">
import { ref, reactive, getCurrentInstance, toRefs } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { treePolicyCategory } from '@/api/policy/category'
import {
  listPolicyArticle, addPolicyArticle, updatePolicyArticle, delPolicyArticle,
  changePolicyArticleStatus, listVersions, restoreVersion as restoreVersionApiCall
} from '@/api/policy/article'
import type { PolicyArticle, PolicyArticleQuejlParams, PolicyArticleVersion, PolicyCategory } from '@/types'
import ImageUpload from '@/components/ImageUpload/index.vue'

const { proxy } = getCurrentInstance() as any

const articleList = ref<PolicyArticle[]>([])
const total = ref(0)
const categoryTree = ref<PolicyCategory[]>([])
const loading = ref(true)
const showSearch = ref(true)
const single = ref(true)
const multiple = ref(true)
const open = ref(false)
const title = ref('')
const ids = ref<number[]>([])
const currentArticleId = ref<number | null>(null)

const versionDrawer = ref(false)
const versionLoading = ref(false)
const versions = ref<PolicyArticleVersion[]>([])

const data = reactive<{
  form: any
  quejlParams: PolicyArticleQuejlParams
  rules: any
}>({
  form: { status: '1', pics: '' } as any,
  quejlParams: { pageNum: 1, pageSize: 10 },
  rules: {
    categoryId: [{ required: true, message: '请选择 2 级分类', trigger: 'change' }],
    title: [{ required: true, message: '请输入政策标题', trigger: 'blur' }],
    status: [{ required: true, message: '请选择发布状态', trigger: 'change' }]
  }
})
const { form, quejlParams, rules } = toRefs(data)

function parsePics(picsJson: string | undefined | null): string[] {
  if (!picsJson) return []
  try { const j = JSON.parse(picsJson); return Array.isArray(j) ? j : [] } catch { return [] }
}

function loadCategories() {
  treePolicyCategory().then((res: any) => {
    categoryTree.value = (res.data ?? []) as PolicyCategory[]
  })
}

function onCascaderChange(v: number | undefined) {
  if (v != null) quejlParams.value.categoryId = v
  else delete quejlParams.value.categoryId
}
function onFormCascaderChange(v: number | undefined) {
  form.value.categoryId = v
}

function getList() {
  loading.value = true
  listPolicyArticle(quejlParams.value).then((res: any) => {
    articleList.value = res.data?.rows ?? []
    total.value = res.data?.total ?? 0
    loading.value = false
  })
}

function handleQuery() {
  quejlParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  quejlParams.value = { pageNum: 1, pageSize: 10 }
  getList()
}

function handleSelectionChange(sel: PolicyArticle[]) {
  ids.value = sel.map((s) => s.id!).filter(Boolean)
  single.value = sel.length !== 1
  multiple.value = sel.length === 0
}

function reset() {
  form.value = { status: '1', pics: '', parentAndChild: undefined } as any
  proxy.$refs['articleRef']?.resetFields()
}

function handleAdd() {
  reset()
  loadCategories()
  open.value = true
  title.value = '新增政策'
}

function handleUpdate(row?: PolicyArticle) {
  const _id = (row && row.id) || ids.value[0]
  if (!_id) { ElMessage.warning('请选择要修改的项'); return }
  reset()
  loadCategories()
  // get detail (we already have row if passed)
  const data = row && row.id === _id ? Promise.resolve(row) : (proxy as any) // 不重要,直接重拉
  data.then((r: PolicyArticle) => {
    form.value = {
      id: r.id, categoryId: r.categoryId, parentAndChild: r.categoryId,
      title: r.title, pics: r.pics || '', status: r.status, remark: r.remark
    }
    open.value = true
    title.value = '修改政策'
  })
}

function submitForm() {
  proxy.$refs['articleRef'].validate((valid: boolean) => {
    if (!valid) return
    const payload: any = { ...form.value }
    delete payload.parentAndChild
    if (payload.id == null) {
      addPolicyArticle(payload).then(() => { ElMessage.success('新增成功'); open.value = false; getList() })
    } else {
      updatePolicyArticle(payload).then(() => { ElMessage.success('修改成功'); open.value = false; getList() })
    }
  })
}

function handleDelete(row?: PolicyArticle) {
  const _ids = (row && row.id) || ids.value
  if (!_ids || (Array.isArray(_ids) && _ids.length === 0)) { ElMessage.warning('请选择要删除的项'); return }
  ElMessageBox.confirm('确认删除所选政策?删除后历史版本保留,但当前版不可恢复', '提示', { type: 'warning' })
    .then(() => delPolicyArticle(_ids as any))
    .then(() => { getList(); ElMessage.success('删除成功') })
    .catch(() => {})
}

function handleToggleStatus(row: PolicyArticle) {
  const next = row.status === '1' ? '0' : '1'
  const msg = next === '1' ? '发布' : '下架'
  ElMessageBox.confirm(`确认${msg}该政策?`, '提示', { type: 'warning' })
    .then(() => changePolicyArticleStatus(row.id!, next))
    .then(() => { getList(); ElMessage.success(`${msg}成功`) })
    .catch(() => {})
}

function handleExport() {
  proxy.download('policy/article/export', { ...quejlParams.value }, `policy_article_${Date.now()}.xlsx`)
}

function handleVersions(row?: PolicyArticle) {
  const _id = (row && row.id) || ids.value[0]
  if (!_id) { ElMessage.warning('请选择查看版本的项'); return }
  currentArticleId.value = _id
  versionDrawer.value = true
  versionLoading.value = true
  listVersions(_id).then((res: any) => {
    versions.value = res.data ?? []
    versionLoading.value = false
  })
}

function restoreVersion(versionId: number) {
  ElMessageBox.confirm('恢复此历史版本为当前版?当前版的内容会自动归档。', '提示', { type: 'warning' })
    .then(() => restoreVersionApiCall(versionId))
    .then(() => {
      ElMessage.success('恢复成功,已切换为当前版')
      versionDrawer.value = false
      getList()
    })
    .catch(() => {})
}

function cancel() { open.value = false; reset() }

loadCategories()
getList()
</script>

<style scoped>
.version-meta { display: flex; justify-content: space-between; margin-bottom: 8px; }
.version-meta .title { font-weight: 600; color: #303133; }
.version-meta .time { color: #909399; font-size: 12px; }
.version-imgs { display: flex; flex-wrap: wrap; gap: 4px; }
.version-actions { text-align: right; margin-top: 8px; }
.form-tip { font-size: 12px; color: #909399; margin-top: 4px; }
</style>
