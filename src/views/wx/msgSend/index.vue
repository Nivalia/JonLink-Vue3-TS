<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 左侧：发送表单 -->
      <el-col :span="14">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>发送模板消息</span>
              <el-button type="primary" link @click="showHistory = !showHistory">
                {{ showHistory ? '返回发送' : '发送记录' }}
              </el-button>
            </div>
          </template>

          <!-- 发送表单 -->
          <div v-if="!showHistory">
            <el-form ref="sendFormRef" :model="sendForm" :rules="sendRules" label-width="100px" label-position="top">

              <el-form-item label="选择模板" prop="templateId">
                <el-select v-model="sendForm.templateId" placeholder="请选择消息模板" filterable style="width:100%" @change="onTemplateChange">
                  <el-option v-for="t in templateList" :key="t.templateId" :label="t.title" :value="t.templateId">
                    <div style="display:flex;justify-content:space-between;align-items:center">
                      <span>{{ t.title }}</span>
                      <span style="font-size:12px;color:#909399">{{ t.templateId.substring(0, 16) }}...</span>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>

              <!-- 选中模板的内置字段预览 -->
              <div v-if="selectedTemplate && templateKeywords.length" class="template-preview">
                <div class="tpl-title">模板内置字段</div>
                <div v-for="(k, i) in templateKeywords" :key="i" class="tpl-kw">
                  <span class="k">{{ k.name || k.key }}</span>
                  <span class="v">{{ k.sample || '-' }}</span>
                </div>
              </div>

              <!-- 模板没有配置关键词时的提示 -->
              <div v-if="selectedTemplate && !templateKeywords.length" class="template-preview warn">
                <div class="tpl-title">⚠️ 模板未配置关键词</div>
                <div style="font-size:13px;color:#909399">
                  请先在「模板管理」页面编辑此模板，配置关键词映射。
                  或者在下方手动添加关键词。
                </div>
              </div>

              <el-divider content-position="left">填写关键词内容</el-divider>

              <!-- 有预配置关键词时显示 -->
              <div v-if="templateKeywords.length">
                <div v-for="(k, i) in templateKeywords" :key="k.key" class="kw-form-row">
                  <el-form-item :label="k.name || '关键词' + (i + 1)">
                    <el-input v-model="sendForm.kw[k.key]" :placeholder="k.bizField === 'amount' ? '如：128.00' : '请输入' + (k.name || k.key)" />
                  </el-form-item>
                </div>
              </div>

              <!-- 没有预配置关键词时，手动添加 -->
              <div v-else>
                <div v-for="(item, idx) in sendForm.manualKw" :key="idx" class="manual-kw-row">
                  <el-input v-model="item.key" placeholder="关键词key (如 keyword1)" style="width:150px" />
                  <el-input v-model="item.value" placeholder="关键词值" style="width:250px" />
                  <el-button link type="danger" @click="sendForm.manualKw.splice(idx, 1)">删除</el-button>
                </div>
                <el-button type="primary" link @click="sendForm.manualKw.push({ key: '', value: '' })">+ 添加关键词</el-button>
              </div>

              <el-divider content-position="left">跳转链接</el-divider>
              <el-form-item label="链接类型">
                <el-radio-group v-model="sendForm.urlType">
                  <el-radio value="none">无链接</el-radio>
                  <el-radio value="h5">H5页面</el-radio>
                  <el-radio value="custom">自定义URL</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item v-if="sendForm.urlType === 'h5'" label="选择页面">
                <el-select v-model="sendForm.h5PageId" placeholder="请选择" style="width:100%">
                  <el-option v-for="p in h5PageList" :key="p.id" :label="`${p.pageName} (${p.pagePath})`" :value="p.id" />
                </el-select>
              </el-form-item>
              <el-form-item v-if="sendForm.urlType === 'custom'" label="URL">
                <el-input v-model="sendForm.customUrl" placeholder="支持 {ticket} 占位符" />
              </el-form-item>

              <el-divider content-position="left">接收人</el-divider>
              <el-form-item label="发送方式">
                <el-radio-group v-model="sendForm.targetType">
                  <el-radio value="phone">手机号</el-radio>
                  <el-radio value="openid">openid</el-radio>
                  <el-radio value="batch">批量导入</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item v-if="sendForm.targetType === 'phone'" label="手机号" prop="phone">
                <el-input v-model="sendForm.phone" placeholder="请输入手机号" />
              </el-form-item>
              <el-form-item v-if="sendForm.targetType === 'openid'" label="openid" prop="openid">
                <el-input v-model="sendForm.openid" placeholder="请输入openid" />
              </el-form-item>
              <el-form-item v-if="sendForm.targetType === 'batch'" label="批量数据">
                <el-input v-model="sendForm.batchData" type="textarea" :rows="5" placeholder="每行一条，格式：手机号,关键词1,关键词2,...&#10;如：13800138000,张三,保单号123,128.00" />
                <div style="margin-top:8px">
                  <el-button type="primary" link icon="Upload" @click="importExcel">从Excel导入</el-button>
                  <el-button type="primary" link icon="Download" @click="exportTemplate">下载导入模板</el-button>
                </div>
                <input ref="fileInput" type="file" accept=".xlsx,.xls,.csv" style="display:none" @change="onFileChange" />
              </el-form-item>

              <el-form-item label="业务单号">
                <el-input v-model="sendForm.bizNo" placeholder="可选，用于幂等去重" />
              </el-form-item>

              <el-form-item>
                <el-button type="primary" :loading="sending" @click="handleSend" style="width:120px">
                  {{ sendForm.targetType === 'batch' ? '批量发送' : '发送' }}
                </el-button>
                <el-button @click="handlePreview" style="margin-left:12px">预览</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 发送记录 -->
          <div v-else>
            <el-form :inline="true" :model="historyQuery" style="margin-bottom:12px">
              <el-form-item label="批次号">
                <el-input v-model="historyQuery.batchNo" placeholder="批次号" clearable />
              </el-form-item>
              <el-form-item label="状态">
                <el-select v-model="historyQuery.status" placeholder="全部" clearable style="width:120px">
                  <el-option label="待发送" value="0" />
                  <el-option label="成功" value="1" />
                  <el-option label="失败" value="2" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="getHistoryList">搜索</el-button>
              </el-form-item>
            </el-form>
            <el-table :data="historyList" v-loading="historyLoading" max-height="500">
              <el-table-column label="手机号" prop="phone" min-width="120" />
              <el-table-column label="模板" min-width="160">
                <template #default="{ row }">{{ getTemplateName(row.templateId) }}</template>
              </el-table-column>
              <el-table-column label="状态" width="90" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.status === '1' ? 'success' : row.status === '2' ? 'danger' : 'info'" size="small">
                    {{ statusMap[row.status] || row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="错误信息" prop="errMsg" min-width="150" show-overflow-tooltip />
              <el-table-column label="时间" min-width="140">
                <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
              </el-table-column>
            </el-table>
            <pagination v-show="historyTotal > 0" :total="historyTotal" v-model:page="historyQuery.pageNum" v-model:limit="historyQuery.pageSize" @pagination="getHistoryList" />
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：预览 -->
      <el-col :span="10">
        <el-card shadow="never" class="preview-card">
          <template #header><span>消息预览</span></template>
          <div class="phone-frame">
            <div class="phone-top">微信服务通知</div>
            <div class="phone-card">
              <div class="phone-title">{{ selectedTemplate?.title || '模板标题' }}</div>
              <!-- 预配置关键词预览 -->
              <template v-if="templateKeywords.length">
                <div v-for="(k, i) in templateKeywords" :key="i" class="phone-kw">
                  <span class="k">{{ k.name || k.key }}</span>
                  <span class="v" :class="{ red: k.bizField === 'amount' }">
                    {{ sendForm.kw[k.key] || k.sample || '-' }}
                  </span>
                </div>
              </template>
              <!-- 手动关键词预览 -->
              <template v-else>
                <div v-for="(item, i) in sendForm.manualKw" :key="i" class="phone-kw">
                  <span class="k">{{ item.key || '关键词' + (i + 1) }}</span>
                  <span class="v">{{ item.value || '-' }}</span>
                </div>
              </template>
              <div class="phone-action" v-if="sendForm.urlType !== 'none'">查看详情 &gt;</div>
              <div class="phone-time">{{ formatTime(new Date()) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 确认弹窗 -->
    <el-dialog v-model="previewVisible" title="确认发送" width="400px">
      <div style="text-align:center">
        <div style="font-size:16px;margin-bottom:8px">确认发送模板消息？</div>
        <div style="color:#909399;font-size:13px">
          模板：{{ selectedTemplate?.title }}<br>
          {{ sendForm.targetType === 'batch' ? '批量发送' : '接收人：' + (sendForm.phone || sendForm.openid) }}
        </div>
      </div>
      <template #footer>
        <el-button @click="previewVisible = false">取消</el-button>
        <el-button type="primary" :loading="sending" @click="doSend">确认发送</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { listTemplate, h5PageOptions } from '@/api/wx/template'
import { listMsg } from '@/api/wx/msg'
import { parseTime } from '@/utils/jonlink'
import request from '@/utils/request'

const sendFormRef = ref()
const fileInput = ref<HTMLInputElement>()
const templateList = ref<any[]>([])
const h5PageList = ref<any[]>([])
const selectedTemplate = ref<any>(null)
const sending = ref(false)
const previewVisible = ref(false)
const showHistory = ref(false)

const sendForm = reactive({
  templateId: '', phone: '', openid: '', bizNo: '',
  kw: {} as Record<string, string>,
  manualKw: [{ key: '', value: '' }] as { key: string; value: string }[],
  urlType: 'none', h5PageId: undefined, customUrl: '',
  targetType: 'phone', batchData: ''
})

const sendRules = {
  templateId: [{ required: true, message: '请选择模板', trigger: 'change' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  openid: [{ required: true, message: '请输入openid', trigger: 'blur' }]
}

const statusMap: Record<string, string> = { '0': '待发送', '1': '成功', '2': '失败', '3': '超限', '4': '已放弃', '5': '未找到' }

const templateKeywords = computed(() => {
  if (!selectedTemplate.value?.keywordMeta) return []
  try { const arr = JSON.parse(selectedTemplate.value.keywordMeta); return Array.isArray(arr) ? arr : [] } catch { return [] }
})

function parseKeywords(meta: string): any[] {
  try { const arr = JSON.parse(meta); return Array.isArray(arr) ? arr : [] } catch { return [] }
}

function getTemplateName(id: string) {
  const t = templateList.value.find(x => x.templateId === id)
  return t ? t.title : id
}

function formatTime(t: any) { return parseTime(t, '{y}-{m}-{d} {h}:{i}:{s}') }

function onTemplateChange(tid: string) {
  selectedTemplate.value = templateList.value.find(t => t.templateId === tid) || null
  sendForm.kw = {}
  sendForm.manualKw = [{ key: '', value: '' }]
  if (selectedTemplate.value) {
    const kws = templateKeywords.value
    if (kws.length) {
      for (const k of kws) { sendForm.kw[k.key] = '' }
    }
    // 预填示例值（去掉中文前缀标签，只保留实际值部分）
    for (const k of templateKeywords.value) {
      if (k.sample) {
        // 去掉 "保单编号:" "收款金额:" 等中文前缀标签
        const stripped = k.sample.replace(/^[\u4e00-\u9fa5]+[:：]\s*/, '')
        sendForm.kw[k.key] = stripped || k.sample
      }
    }
  }
}

function getKwData(): Record<string, string> {
  if (templateKeywords.value.length) {
    return { ...sendForm.kw }
  } else {
    const data: Record<string, string> = {}
    for (const item of sendForm.manualKw) {
      if (item.key) data[item.key] = item.value
    }
    return data
  }
}

async function handleSend() {
  await sendFormRef.value.validate()
  // 验证关键词
  const kwData = getKwData()
  if (!Object.keys(kwData).length) { ElMessage.warning('请至少填写一个关键词'); return }
  previewVisible.value = true
}

async function doSend() {
  sending.value = true
  try {
    const kwData = getKwData()
    if (sendForm.targetType === 'batch') {
      const lines = sendForm.batchData.split('\n').filter(l => l.trim())
      if (!lines.length) { ElMessage.warning('请输入至少一条数据'); return }
      let okCount = 0, failCount = 0
      for (const line of lines) {
        const parts = line.split(',').map(s => s.trim())
        const phone = parts[0]
        const data: Record<string, string> = {}
        // 用第一行的 key 顺序匹配
        const keys = Object.keys(kwData)
        keys.forEach((k, i) => { data[k] = parts[i + 1] || '' })
        try {
          await request({ url: '/wx/msg/send', method: 'post', data: { phone, templateId: sendForm.templateId, data, bizNo: sendForm.bizNo } })
          okCount++
        } catch { failCount++ }
      }
      ElMessage.success(`批量发送完成：成功 ${okCount}，失败 ${failCount}`)
    } else {
      const body: any = { templateId: sendForm.templateId, data: kwData, bizNo: sendForm.bizNo }
      if (sendForm.targetType === 'phone') body.phone = sendForm.phone
      else body.openid = sendForm.openid
      const res = await request({ url: '/wx/msg/send', method: 'post', data: body })
      if ((res as any).code === 200) ElMessage.success('发送成功')
      else ElMessage.error((res as any).msg || '发送失败')
    }
    previewVisible.value = false
  } finally { sending.value = false }
}

function handlePreview() { ElMessage.info('预览在右侧面板实时显示') }

function importExcel() { fileInput.value?.click() }
function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    const text = ev.target?.result as string
    const lines = text.split('\n').filter(l => l.trim()).slice(1)
    sendForm.batchData = lines.map(l => l.replace(/\r/g, '')).join('\n')
    ElMessage.success(`导入 ${lines.length} 条数据`)
  }
  reader.readAsText(file)
  if (fileInput.value) fileInput.value.value = ''
}

function exportTemplate() {
  const kws = templateKeywords.value.length ? templateKeywords.value : sendForm.manualKw.filter(k => k.key)
  const header = ['手机号', ...kws.map(k => k.name || k.key)]
  const csv = '\uFEFF' + header.join(',') + '\n'
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = '模板消息导入模板.csv'; a.click()
  URL.revokeObjectURL(url)
}

// 历史记录
const historyQuery = reactive({ pageNum: 1, pageSize: 10, batchNo: '', status: '' })
const historyList = ref<any[]>([])
const historyTotal = ref(0)
const historyLoading = ref(false)

async function getHistoryList() {
  historyLoading.value = true
  try {
    const res = await listMsg(historyQuery)
    if (res.code === 200) {
      historyList.value = res.rows || []
      historyTotal.value = res.total || 0
    } else {
      ElMessage.error(res.msg || '加载历史记录失败')
    }
  } finally { historyLoading.value = false }
}

onMounted(async () => {
  try {
    const [tplRes, h5Res] = await Promise.all([listTemplate({ pageNum: 1, pageSize: 200 }), h5PageOptions()])
    if (tplRes.code === 200) templateList.value = tplRes.rows || []
    else ElMessage.error(tplRes.msg || '加载模板列表失败')
    if (h5Res.code === 200) h5PageList.value = (h5Res.data as any) || []
    else ElMessage.error(h5Res.msg || '加载 H5 页面失败')
  } catch (e: any) {
    ElMessage.error(e?.message || '初始化失败')
  }
})
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
.template-preview { background: #f5f7fa; border-radius: 8px; padding: 14px; margin-bottom: 16px; }
.template-preview.warn { background: #fdf6ec; border: 1px solid #faecd8; }
.tpl-title { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
.tpl-kw { display: flex; justify-content: space-between; padding: 3px 0; font-size: 13px; }
.tpl-kw .k { color: #909399; }
.tpl-kw .v { color: #606266; }
.kw-form-row { margin-bottom: 0; }
.manual-kw-row { display: flex; gap: 8px; align-items: center; margin-bottom: 10px; }
.phone-frame { background: #ededed; border-radius: 12px; padding: 16px; min-height: 300px; }
.phone-top { text-align: center; font-size: 12px; color: #888; margin-bottom: 12px; }
.phone-card { background: #fff; border-radius: 6px; padding: 14px 16px; border-left: 4px solid #07c160; }
.phone-title { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #333; }
.phone-kw { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
.phone-kw .k { color: #888; }
.phone-kw .v { color: #333; }
.phone-kw .v.red { color: #f56c6c; font-weight: 600; }
.phone-action { text-align: right; color: #07c160; font-size: 13px; margin-top: 8px; }
.phone-time { text-align: right; color: #aaa; font-size: 11px; margin-top: 6px; }
.preview-card { position: sticky; top: 20px; }
</style>
