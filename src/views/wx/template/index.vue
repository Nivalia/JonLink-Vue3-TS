<template>
  <div class="app-container">
    <el-form :model="quejlParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="quejlParams.title" placeholder="请输入模板标题" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="模板ID" prop="templateId">
        <el-input v-model="quejlParams.templateId" placeholder="请输入微信模板ID" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Refresh" @click="onSync">同步模板</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="onAdd">新建模板</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="dataList" row-key="id" @row-click="onRowClick">
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="expand">
            <div><span class="lbl">完整模板ID：</span>{{ row.templateId }}</div>
            <div><span class="lbl">关键词顺序：</span>{{ row.keywordOrder || '-' }}</div>
            <div><span class="lbl">自定义URL：</span>{{ row.customUrl || '-' }}</div>
            <div><span class="lbl">备注：</span>{{ row.remark || '-' }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="模板标题" min-width="240">
        <template #default="{ row }">
          <div class="title-cell">
            <div class="t">{{ row.title }}</div>
            <div class="tid" @click.stop="copyTid(row.templateId)">{{ row.templateId }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="关键词" min-width="260">
        <template #default="{ row }">
          <el-tag v-for="(k, i) in parseKeywords(row)" :key="i" class="kw" effect="plain">
            {{ k.name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="跳转链接" min-width="220">
        <template #default="{ row }">
          <template v-if="row.urlType === '1' && row.h5PageId">
            <div class="h5page" @click.stop="openH5(row)">
              <div class="h5name">📄 {{ h5PageName(row.h5PageId) }}</div>
              <div class="h5path">{{ h5PagePath(row.h5PageId) }}</div>
            </div>
          </template>
          <template v-else-if="row.urlType === '2' && row.customUrl">
            <div class="custom-url" @click.stop="openH5(row)">
              <div class="h5name">🔗 自定义URL</div>
              <div class="h5path">{{ row.customUrl }}</div>
            </div>
          </template>
          <span v-else class="unset">未设置链接</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === '1' ? 'success' : 'info'">
            {{ row.status === '1' ? '已启用' : '未启用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="170" align="center">
        <template #default="{ row }">
          {{ formatTime(row.updateTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click.stop="onPreview(row)">预览</el-button>
          <el-button link type="primary" @click.stop="onEdit(row)">编辑</el-button>
          <el-button link type="danger" @click.stop="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="quejlParams.pageNum" v-model:limit="quejlParams.pageSize" @pagination="getList" />

    <!-- 预览弹窗 -->
    <el-dialog v-model="previewVisible" title="模板消息预览" width="420px" :close-on-click-modal="false">
      <div class="phone-frame">
        <div class="phone-top">微信服务通知</div>
        <div class="phone-card">
          <div class="phone-title">{{ previewRow?.title || '-' }}</div>
          <div v-for="(k, i) in previewKeywords" :key="i" class="phone-kw">
            <span class="k">{{ k.name }}</span>
            <span class="v" :class="{ red: k.bizField === 'amount' }">
              {{ formSample[k.fieldKey] || k.sample || '-' }}
            </span>
          </div>
          <div class="phone-action">查看详情 &gt;</div>
          <div class="phone-time">{{ formatTime(new Date()) }}</div>
        </div>
      </div>
    </el-dialog>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="editVisible" :title="editForm.id ? '编辑模板' : '新建模板'" width="960px" :close-on-click-modal="false">
      <el-row :gutter="20">
        <el-col :span="13">
          <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px" label-position="top">
            <el-form-item label="模板标题" prop="title">
              <el-input v-model="editForm.title" placeholder="请输入模板标题" />
            </el-form-item>
            <el-form-item label="模板ID" prop="templateId">
              <el-input v-model="editForm.templateId" placeholder="请输入微信模板ID" />
            </el-form-item>
            <el-form-item label="关键词配置">
              <div class="kw-edit-list">
                <div v-for="(k, idx) in editForm.kwList" :key="idx" class="kw-edit-row">
                  <el-input v-model="k.key" placeholder="key" style="width: 110px" />
                  <el-input v-model="k.name" placeholder="中文名" style="width: 140px" />
                  <el-input v-model="k.sample" placeholder="示例值" style="width: 140px" />
                  <el-select v-model="k.bizField" placeholder="业务字段" style="width: 130px" clearable>
                    <el-option v-for="o in bizFieldOptions" :key="o.value" :label="o.label" :value="o.value" />
                  </el-select>
                  <el-button link type="danger" @click="editForm.kwList.splice(idx, 1)">删</el-button>
                </div>
                <el-button type="primary" link @click="addKwRow">+ 加一行</el-button>
              </div>
            </el-form-item>
            <el-form-item label="跳转链接">
              <el-radio-group v-model="editForm.urlType">
                <el-radio value="0">无链接</el-radio>
                <el-radio value="1">关联H5页面</el-radio>
                <el-radio value="2">自定义URL</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="editForm.urlType === '1'" label="H5页面">
              <el-select v-model="editForm.h5PageId" placeholder="请选择" style="width: 100%">
                <el-option v-for="p in h5PageOpts" :key="p.id" :label="`${p.pageName} (${p.pagePath})`" :value="p.id" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="editForm.urlType === '2'" label="URL">
              <el-input v-model="editForm.customUrl" placeholder="支持 {ticket} 占位, 例: https://example.com/p/{ticket}" />
            </el-form-item>
            <el-form-item label="状态">
              <el-radio-group v-model="editForm.status">
                <el-radio value="1">启用</el-radio>
                <el-radio value="0">停用</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="editForm.remark" type="textarea" :rows="2" />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="11">
          <div class="phone-frame">
            <div class="phone-top">微信服务通知</div>
            <div class="phone-card">
              <div class="phone-title">{{ editForm.title || '模板标题' }}</div>
              <div v-for="(k, i) in editForm.kwList" :key="i" class="phone-kw">
                <span class="k">{{ k.name || '关键词' + (i + 1) }}</span>
                <span class="v" :class="{ red: k.bizField === 'amount' }">
                  {{ k.sample || '-' }}
                </span>
              </div>
              <div class="phone-action" v-if="editForm.urlType !== '0'">查看详情 &gt;</div>
              <div class="phone-time">{{ formatTime(new Date()) }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="editSaving" @click="onSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listTemplate, addTemplate, updateTemplate, delTemplate, syncTemplate, h5PageOptions } from '@/api/wx/template'
import type { WxMpTemplate, TemplateQuejlParams } from '@/types/api/wx/template'
import { parseTime } from '@/utils/jonlink'

const quejlParams = reactive<TemplateQuejlParams>({ pageNum: 1, pageSize: 10 })
const showSearch = ref(true)
const loading = ref(false)
const dataList = ref<WxMpTemplate[]>([])
const total = ref(0)
const h5PageOpts = ref<{ id: number; pageName: string; pagePath: string }[]>([])

const bizFieldOptions = [
  { label: '订单号', value: 'order_no' },
  { label: '手机号', value: 'phone' },
  { label: '金额', value: 'amount' },
  { label: '车牌', value: 'car_no' },
  { label: '客户名', value: 'customer_name' },
  { label: '项目类型', value: 'service_type' },
  { label: '核销时间', value: 'verify_time' },
  { label: '无', value: 'none' }
]

function parseKeywords(row: WxMpTemplate) {
  if (!row.keywordMeta) return []
  try {
    const arr = JSON.parse(row.keywordMeta)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function h5PageName(id: number) {
  const p = h5PageOpts.value.find(x => x.id === id)
  return p ? p.pageName : `页面#${id}`
}

function h5PagePath(id: number) {
  const p = h5PageOpts.value.find(x => x.id === id)
  return p ? p.pagePath : '-'
}

function copyTid(tid: string) {
  if (!tid) return
  navigator.clipboard?.writeText(tid).then(
    () => ElMessage.success('已复制模板ID'),
    () => ElMessage.warning('复制失败')
  )
}

function openH5(row: WxMpTemplate) {
  let url = ''
  if (row.urlType === '1' && row.h5PageId) {
    const p = h5PageOpts.value.find(x => x.id === row.h5PageId)
    if (p) url = window.location.origin + p.pagePath
  } else if (row.urlType === '2' && row.customUrl) {
    url = row.customUrl.replace('{ticket}', 'preview')
  }
  if (url) window.open(url, '_blank')
}

function onRowClick(_row: WxMpTemplate) { /* 占位, 行点击不展开 */ }

function formatTime(t: any) {
  if (!t) return '-'
  return parseTime(t, '{y}-{m}-{d} {h}:{i}:{s}')
}

async function getList() {
  loading.value = true
  try {
    const res = await listTemplate(quejlParams)
    if (res.code === 200) {
      dataList.value = res.rows || []
      total.value = res.total || 0
    }
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  quejlParams.pageNum = 1
  getList()
}

function resetQuery() {
  quejlParams.title = ''
  quejlParams.templateId = ''
  handleQuery()
}

async function onSync() {
  const res = await syncTemplate()
  if (res.code === 200) {
    ElMessage.success(res.msg || '同步完成')
    getList()
  } else {
    ElMessage.error(res.msg || '同步失败')
  }
}

function onAdd() {
  editVisible.value = true
  Object.assign(editForm, {
    id: undefined,
    title: '',
    templateId: '',
    kwList: [{ key: 'keyword1', name: '', sample: '', bizField: '' }],
    urlType: '0',
    h5PageId: undefined,
    customUrl: '',
    status: '1',
    remark: ''
  })
}

async function onEdit(row: WxMpTemplate) {
  editVisible.value = true
  const kws = parseKeywords(row)
  Object.assign(editForm, {
    id: row.id,
    title: row.title,
    templateId: row.templateId,
    kwList: kws.length ? kws.map((k: any) => ({ ...k })) : [{ key: 'keyword1', name: '', sample: '', bizField: '' }],
    urlType: row.urlType || '0',
    h5PageId: row.h5PageId,
    customUrl: row.customUrl || '',
    status: row.status || '1',
    remark: row.remark || ''
  })
}

async function onDelete(row?: WxMpTemplate) {
  const _id = (row && row.id) || ids.value[0]
  if (!_id) return
  await ElMessageBox.confirm(`确认删除模板"${row?.title || ''}"?`, '提示', { type: 'warning' })
  const res = await delTemplate(_id as number)
  if (res.code === 200) {
    ElMessage.success('已删除')
    getList()
  }
}

const previewVisible = ref(false)
const previewRow = ref<WxMpTemplate | null>(null)
const previewKeywords = computed(() => previewRow.value ? parseKeywords(previewRow.value) : [])
const formSample = reactive<Record<string, string>>({})

function onPreview(row: WxMpTemplate) {
  previewRow.value = row
  const kws = parseKeywords(row)
  const samples: Record<string, string> = {}
  for (const k of kws) {
    samples[k.key] = k.sample || '-'
  }
  Object.keys(formSample).forEach(k => delete formSample[k])
  Object.assign(formSample, samples)
  previewVisible.value = true
}

const editVisible = ref(false)
const editSaving = ref(false)
const editFormRef = ref()
const editRules = {
  title: [{ required: true, message: '请输入模板标题', trigger: 'blur' }],
  templateId: [{ required: true, message: '请输入微信模板ID', trigger: 'blur' }]
}
const editForm = reactive<any>({
  id: undefined,
  title: '',
  templateId: '',
  kwList: [],
  urlType: '0',
  h5PageId: undefined,
  customUrl: '',
  status: '1',
  remark: ''
})

function addKwRow() {
  const next = (editForm.kwList?.length || 0) + 1
  editForm.kwList.push({ key: 'keyword' + next, name: '', sample: '', bizField: '' })
}

async function onSave() {
  await editFormRef.value.validate()
  editSaving.value = true
  try {
    const body: any = {
      id: editForm.id,
      title: editForm.title,
      templateId: editForm.templateId,
      keywordMeta: JSON.stringify(editForm.kwList),
      urlType: editForm.urlType,
      h5PageId: editForm.urlType === '1' ? editForm.h5PageId : null,
      customUrl: editForm.urlType === '2' ? editForm.customUrl : null,
      status: editForm.status,
      remark: editForm.remark
    }
    const res = editForm.id ? await updateTemplate(body) : await addTemplate(body)
    if (res.code === 200) {
      ElMessage.success('保存成功')
      editVisible.value = false
      getList()
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } finally {
    editSaving.value = false
  }
}

onMounted(async () => {
  getList()
  try {
    const r = await h5PageOptions()
    if (r.code === 200) h5PageOpts.value = (r.data as any) || []
  } catch { /* 静默 */ }
})
</script>

<style scoped>
.app-container { padding: 16px; }
.mb8 { margin-bottom: 8px; }
.title-cell .t { font-size: 15px; font-weight: 600; }
.title-cell .tid { font-size: 12px; color: #909399; cursor: pointer; }
.title-cell .tid:hover { color: #409eff; }
.kw { margin: 2px 4px 2px 0; }
.h5page, .custom-url { cursor: pointer; }
.h5name { color: #67c23a; font-size: 13px; }
.h5path { color: #909399; font-size: 12px; }
.unset { color: #c0c4cc; font-size: 12px; }
.expand { padding: 4px 8px; font-size: 13px; line-height: 22px; }
.expand .lbl { color: #909399; margin-right: 6px; }
.kw-edit-list { width: 100%; }
.kw-edit-row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
.phone-frame { background: #ededed; border-radius: 12px; padding: 16px; min-height: 360px; }
.phone-top { text-align: center; font-size: 12px; color: #888; margin-bottom: 12px; }
.phone-card { background: #fff; border-radius: 6px; padding: 14px 16px; border-left: 4px solid #07c160; }
.phone-title { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #333; }
.phone-kw { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
.phone-kw .k { color: #888; }
.phone-kw .v { color: #333; }
.phone-kw .v.red { color: #f56c6c; font-weight: 600; }
.phone-action { text-align: right; color: #07c160; font-size: 13px; margin-top: 8px; }
.phone-time { text-align: right; color: #aaa; font-size: 11px; margin-top: 6px; }
</style>
