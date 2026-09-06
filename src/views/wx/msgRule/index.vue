<template>
  <div class="app-container">
    <!-- 搜索区 -->
    <el-card shadow="never" class="search-card" v-show="showSearch">
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="queryParams.ruleName" placeholder="请输入规则名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-select v-model="queryParams.enabled" placeholder="全部" clearable style="width:120px">
            <el-option label="已启用" value="Y" />
            <el-option label="已停用" value="N" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增规则</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <!-- 表格 -->
    <el-card shadow="never">
      <el-table v-loading="loading" :data="dataList" row-key="id" style="width:100%">
        <el-table-column label="规则名称" min-width="180">
          <template #default="{ row }">
            <div>
              <div style="font-weight:600;font-size:14px">{{ row.ruleName }}</div>
              <div style="font-size:12px;color:#909399;margin-top:2px">{{ row.ruleCode }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="业务类型" min-width="110" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.bizType" size="small" :type="bizTypeTag[row.bizType] || ''" effect="light">
              {{ bizTypeMap[row.bizType] || row.bizType }}
            </el-tag>
            <span v-else class="text-hint">-</span>
          </template>
        </el-table-column>
        <el-table-column label="关联模板" min-width="200">
          <template #default="{ row }">
            <div v-if="row.templateTitle">
              <div style="font-size:13px">{{ row.templateTitle }}</div>
            </div>
            <span v-else class="text-hint">-</span>
          </template>
        </el-table-column>
        <el-table-column label="内容映射" min-width="220">
          <template #default="{ row }">
            <div v-if="row.contentMap && row.contentMap.length" class="kw-list">
              <div v-for="(k, i) in row.contentMap.slice(0, 3)" :key="i" class="kw-item">
                <span class="kw-key">{{ k.keyword }}</span>
                <span class="kw-arrow">→</span>
                <span class="kw-val">{{ k.fixedValue || k.source || '-' }}</span>
              </div>
              <div v-if="row.contentMap.length > 3" class="kw-more">+{{ row.contentMap.length - 3 }}项</div>
            </div>
            <span v-else class="text-hint">-</span>
          </template>
        </el-table-column>
        <el-table-column label="受众" min-width="140">
          <template #default="{ row }">
            <div class="audience-cell">
              <el-tag size="small" effect="plain" :type="row.audienceType === 'dist' ? '' : 'info'">
                {{ audienceLabel(row.audienceType) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" active-value="Y" inactive-value="N" size="small" @change="toggleEnabled(row)" />
          </template>
        </el-table-column>
        <el-table-column label="排序" width="65" align="center" prop="sortOrder" />
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 新增/编辑弹窗 - 左右分栏 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="960px" :close-on-click-modal="false" destroy-on-close top="5vh">
      <el-row :gutter="0" class="dialog-body">
        <!-- 左侧：表单 -->
        <el-col :span="13" class="form-col">
          <el-form ref="formRef" :model="form" :rules="rules" label-width="90px" label-position="left" class="rule-form">

            <div class="section-title">基本信息</div>
            <el-form-item label="规则名称" prop="ruleName">
              <el-input v-model="form.ruleName" placeholder="如：出单成功通知" />
            </el-form-item>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="规则编码" prop="ruleCode">
                  <el-select v-model="form.ruleCode" placeholder="请选择触发事件" style="width:100%">
                    <el-option label="出单完成" value="POLICY_CREATED" />
                    <el-option label="下游结算完成" value="DOWN_SETTLED" />
                    <el-option label="上游结算完成" value="UP_SETTLED" />
                    <el-option label="佣金到账" value="COMMISSION_PAID" />
                    <el-option label="自定义" value="" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="业务类型" prop="bizType">
                  <el-select v-model="form.bizType" placeholder="请选择" clearable style="width:100%">
                    <el-option v-for="(v, k) in bizTypeMap" :key="k" :label="v" :value="k" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <div class="section-title">关联模板</div>
            <el-form-item label="选择模板" prop="templateId">
              <el-select v-model="form.templateId" placeholder="请选择消息模板" filterable style="width:100%" @change="onTemplateChange">
                <el-option v-for="t in templateList" :key="t.id" :label="t.title" :value="t.id">
                  <div style="display:flex;justify-content:space-between;align-items:center">
                    <span>{{ t.title }}</span>
                    <span style="font-size:11px;color:#c0c4cc">{{ parseKeywords(t.keywordMeta).length }}个关键词</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>

            <div class="section-title">内容规则</div>
            <div class="content-rule-section">
              <div v-for="(item, idx) in form.contentMap" :key="idx" class="content-map-row">
                <el-select v-model="item.keyword" placeholder="选择关键词" style="width:130px" size="small">
                  <el-option v-for="k in currentKeywords" :key="k.key" :label="k.name" :value="k.key" />
                </el-select>
                <span style="color:#c0c4cc">→</span>
                <el-select v-model="item.source" placeholder="取值来源" style="width:150px" size="small" clearable>
                  <el-option-group label="固定值">
                    <el-option label="固定值" value="fixed" />
                  </el-option-group>
                  <el-option-group label="台账字段">
                    <el-option label="保单号" value="ledger_policy_no" />
                    <el-option label="投保人" value="ledger_applicant" />
                    <el-option label="被保人" value="ledger_insured" />
                    <el-option label="险种名称" value="ledger_insurance_type" />
                    <el-option label="保险公司" value="ledger_insurance_company" />
                    <el-option label="产品名称" value="ledger_product_name" />
                    <el-option label="保费金额" value="ledger_premium" />
                    <el-option label="出单日期" value="ledger_date" />
                    <el-option label="渠道名称" value="ledger_channel_name" />
                    <el-option label="上游渠道" value="ledger_up_channel" />
                    <el-option label="上游费率" value="ledger_up_rate" />
                    <el-option label="下游费率" value="ledger_down_rate" />
                    <el-option label="上游佣金" value="ledger_up_commission" />
                    <el-option label="下游佣金" value="ledger_down_commission" />
                    <el-option label="净费" value="ledger_net_fee" />
                    <el-option label="利润" value="ledger_profit" />
                  </el-option-group>
                  <el-option-group label="联系人">
                    <el-option label="联系人姓名" value="contact_name" />
                    <el-option label="联系人手机" value="contact_phone" />
                    <el-option label="联系人地址" value="contact_address" />
                  </el-option-group>
                </el-select>
                <el-input v-if="item.source === 'fixed'" v-model="item.fixedValue" placeholder="固定值" size="small" style="width:130px" />
                <el-button link type="danger" size="small" @click="form.contentMap.splice(idx, 1)" :disabled="form.contentMap.length <= 1">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <el-button type="primary" link size="small" @click="addContentRow">+ 添加关键词映射</el-button>
            </div>

            <div class="section-title">跳转链接</div>
            <el-form-item label="类型">
              <el-radio-group v-model="form.urlType">
                <el-radio value="none">无</el-radio>
                <el-radio value="h5">H5页面</el-radio>
                <el-radio value="custom">自定义URL</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="form.urlType === 'h5'" label="H5页面">
              <el-select v-model="form.h5PageId" placeholder="请选择" style="width:100%">
                <el-option v-for="p in h5PageList" :key="p.id" :label="`${p.pageName} (${p.pagePath})`" :value="p.id" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="form.urlType === 'custom'" label="URL">
              <el-input v-model="form.customUrl" placeholder="支持 {ticket} 占位符" />
            </el-form-item>

            <div class="section-title">受众规则</div>
            <el-form-item label="推送对象">
              <el-radio-group v-model="form.audienceType" class="audience-radio">
                <el-radio-button value="dist">业务员+上级</el-radio-button>
                <el-radio-button value="phone">指定手机号</el-radio-button>
                <el-radio-button value="all">全部粉丝</el-radio-button>
              </el-radio-group>
              <div class="form-tip">业务员+上级：自动从台账获取业务员，通过手机号匹配openid推送</div>
            </el-form-item>
            <el-form-item v-if="form.audienceType === 'phone'" label="手机号">
              <el-input v-model="form.audiencePhones" type="textarea" :rows="3" placeholder="每行一个手机号" />
            </el-form-item>

            <div class="section-title">其他设置</div>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="状态">
                  <el-switch v-model="form.enabled" active-value="Y" inactive-value="N" active-text="启用" inactive-text="停用" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="排序">
                  <el-input-number v-model="form.sortOrder" :min="0" :max="999" style="width:100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="可选" />
            </el-form-item>
          </el-form>
        </el-col>

        <!-- 右侧：模板预览 -->
        <el-col :span="11" class="preview-col">
          <div class="preview-header">模板消息预览</div>
          <div v-if="previewTemplate" class="phone-frame">
            <div class="phone-top">微信服务通知</div>
            <div class="phone-card">
              <div class="phone-title">{{ previewTemplate.title }}</div>
              <div v-for="(k, i) in previewKeywords" :key="i" class="phone-kw">
                <span class="k">{{ k.name }}</span>
                <span class="v" :class="{ red: k.bizField === 'amount' }">
                  {{ getPreviewValue(k) }}
                </span>
              </div>
              <div class="phone-action" v-if="form.urlType !== 'none'">查看详情 &gt;</div>
              <div class="phone-time">刚刚</div>
            </div>
          </div>
          <div v-else class="empty-preview">
            <el-icon size="48" color="#dcdfe6"><ChatDotRound /></el-icon>
            <div>请选择模板后预览</div>
          </div>
        </el-col>
      </el-row>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, ChatDotRound } from '@element-plus/icons-vue'
import { listMsgRule, getMsgRule, addMsgRule, updateMsgRule, delMsgRule } from '@/api/wx/msgRule'
import { listTemplate, h5PageOptions } from '@/api/wx/template'

const queryParams = reactive({ pageNum: 1, pageSize: 10, ruleName: undefined as string | undefined, enabled: undefined as string | undefined })
const showSearch = ref(true)
const loading = ref(false)
const dataList = ref<any[]>([])
const total = ref(0)
const saving = ref(false)

const bizTypeMap: Record<string, string> = {
  policy: '出单通知', renewal: '续保提醒', claim: '理赔通知', settle: '结算通知',
  verify: '核销通知', commission: '佣金通知', birthday: '生日祝福', custom: '自定义'
}
const bizTypeTag: Record<string, string> = {
  policy: '', renewal: 'warning', claim: 'danger', settle: 'success',
  verify: 'info', commission: '', birthday: 'warning', custom: 'info'
}

const audienceTypeMap: Record<string, string> = {
  dist: '业务员+上级', phone: '指定手机号', all: '全部粉丝'
}

const templateList = ref<any[]>([])
const h5PageList = ref<any[]>([])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()

const defaultForm = {
  id: undefined, ruleCode: '', ruleName: '', bizType: '', templateId: '',
  contentMap: [{ keyword: 'keyword1', source: 'fixed', fixedValue: '' }],
  urlType: 'none', h5PageId: undefined, customUrl: '',
  audienceType: 'dist', audiencePhones: '',
  enabled: 'Y', sortOrder: 0, remark: ''
}
const form = reactive({ ...defaultForm } as typeof defaultForm)

const rules = {
  ruleName: [{ required: true, message: '规则名称不能为空', trigger: 'blur' }],
  ruleCode: [{ required: true, message: '规则编码不能为空', trigger: 'blur' }],
  templateId: [{ required: true, message: '请选择关联模板', trigger: 'change' }]
}

function parseKeywords(meta: string): any[] {
  try { const arr = JSON.parse(meta); return Array.isArray(arr) ? arr : [] } catch { return [] }
}

function audienceLabel(type: string) { return audienceTypeMap[type] || type }

// 当前选中模板的关键词
const previewTemplate = ref<any>(null)
const previewKeywords = computed(() => previewTemplate.value ? parseKeywords(previewTemplate.value.keywordMeta) : [])
const currentKeywords = computed(() => previewKeywords.value)

function getPreviewValue(kw: any): string {
  const mapped = form.contentMap.find(c => c.keyword === kw.key)
  if (!mapped) return kw.sample || '-'
  if (mapped.source === 'fixed' && mapped.fixedValue) return mapped.fixedValue
  if (mapped.source) {
    const sourceLabels: Record<string, string> = {
      ledger_policy_no: 'PO202608001', ledger_applicant: '张三', ledger_insured: '李四',
      ledger_insurance_type: '交强险', ledger_insurance_company: '人保财险',
      ledger_product_name: '新车险产品', ledger_premium: '128.00',
      ledger_date: '2026-08-29', ledger_channel_name: '直销渠道',
      ledger_up_channel: '上游渠道A', ledger_up_rate: '5%',
      ledger_down_rate: '10%', ledger_up_commission: '6.40',
      ledger_down_commission: '12.80', ledger_net_fee: '115.20', ledger_profit: '108.80',
      contact_name: '李四', contact_phone: '139****9000', contact_address: '北京市'
    }
    return sourceLabels[mapped.source] || '[' + mapped.source + ']'
  }
  return kw.sample || '-'
}

function onTemplateChange(tid: number) {
  previewTemplate.value = templateList.value.find(t => t.id === tid) || null
  // 自动填充 contentMap（去掉中文前缀标签，只保留实际值）
  if (previewTemplate.value) {
    const kws = parseKeywords(previewTemplate.value.keywordMeta)
    form.contentMap = kws.map(k => {
      const sample = k.sample || ''
      const stripped = sample.replace(/^[\u4e00-\u9fa5]+[:：]\s*/, '')
      return { keyword: k.key, source: 'fixed', fixedValue: stripped || sample }
    })
  }
}

function addContentRow() {
  const next = form.contentMap.length + 1
  form.contentMap.push({ keyword: 'keyword' + next, source: 'fixed', fixedValue: '' })
}

async function getList() {
  loading.value = true
  try {
    const res = await listMsgRule(queryParams)
    if (res.code === 200) {
      dataList.value = (res.rows || []).map((r: any) => {
        let contentMap = []
        try { contentMap = JSON.parse(r.contentRule || '[]') } catch { contentMap = [] }
        let audienceType = 'phone'
        try { const a = JSON.parse(r.audienceRule || '{}'); audienceType = a.type || 'phone' } catch {}
        return { ...r, contentMap, audienceType }
      })
      total.value = res.total || 0
    }
  } finally { loading.value = false }
}

function handleQuery() { queryParams.pageNum = 1; getList() }
function resetQuery() { queryParams.ruleName = ''; queryParams.enabled = ''; handleQuery() }

function handleAdd() {
  dialogTitle.value = '新增推送规则'
  Object.assign(form, { ...defaultForm, contentMap: [{ keyword: 'keyword1', source: 'fixed', fixedValue: '' }] })
  previewTemplate.value = null
  dialogVisible.value = true
}

async function handleEdit(row: any) {
  dialogTitle.value = '编辑推送规则'
  const res = await getMsgRule(row.id)
  if (res.code === 200) {
    const d = res.data
    let contentMap = []
    try { contentMap = JSON.parse(d.contentRule || '[]') } catch { contentMap = [] }
    let audienceType = 'dist', audiencePhones = ''
    try {
      const a = JSON.parse(d.audienceRule || '{}')
      audienceType = a.type || 'dist'
      if (a.phones) audiencePhones = Array.isArray(a.phones) ? a.phones.join('\n') : a.phones
    } catch {}
    Object.assign(form, {
      id: d.id, ruleCode: d.ruleCode, ruleName: d.ruleName, bizType: d.bizType,
      templateId: d.templateId, contentMap: contentMap.length ? contentMap : [{ keyword: 'keyword1', source: 'fixed', fixedValue: '' }],
      urlType: d.urlRule ? (d.urlRule.includes('{ticket}') ? 'custom' : 'h5') : 'none',
      h5PageId: d.h5PageId, customUrl: d.urlRule || '',
      audienceType, audiencePhones,
      enabled: d.enabled || 'Y', sortOrder: d.sortOrder || 0, remark: d.remark || ''
    })
    // 设置预览模板
    previewTemplate.value = templateList.value.find(t => t.id === d.templateId) || null
    dialogVisible.value = true
  }
}

async function handleSave() {
  await formRef.value.validate()
  saving.value = true
  try {
    const body: any = {
      id: form.id, ruleCode: form.ruleCode, ruleName: form.ruleName, bizType: form.bizType,
      templateId: form.templateId, enabled: form.enabled, sortOrder: form.sortOrder, remark: form.remark,
      contentRule: JSON.stringify(form.contentMap),
      urlRule: form.urlType === 'none' ? '' : (form.urlType === 'custom' ? form.customUrl : ''),
      audienceRule: JSON.stringify({
        type: form.audienceType,
        phones: form.audiencePhones.split('\n').filter(Boolean)
      })
    }
    const res = form.id ? await updateMsgRule(body) : await addMsgRule(body)
    if (res.code === 200) { ElMessage.success('保存成功'); dialogVisible.value = false; getList() }
    else { ElMessage.error(res.msg || '保存失败') }
  } finally { saving.value = false }
}

async function toggleEnabled(row: any) {
  try {
    const res = await updateMsgRule({ id: row.id, enabled: row.enabled })
    if (res.code === 200) {
      ElMessage.success(row.enabled === 'Y' ? '已启用' : '已停用')
    } else {
      // 失败时回滚 UI: 重新拉一次列表
      ElMessage.error(res.msg || '操作失败')
      getList()
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '网络异常')
    getList()
  }
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm(`确认删除规则「${row.ruleName}」？`, '提示', { type: 'warning' })
  const res = await delMsgRule(row.id)
  if (res.code === 200) { ElMessage.success('已删除'); getList() }
}

onMounted(async () => {
  getList()
  try {
    const [tplRes, h5Res] = await Promise.all([listTemplate({ pageNum: 1, pageSize: 200 }), h5PageOptions()])
    if (tplRes.code === 200) templateList.value = tplRes.rows || []
    if (h5Res.code === 200) h5PageList.value = (h5Res.data as any) || []
  } catch {}
})
</script>

<style scoped>
.search-card { margin-bottom: 12px; }
.search-card :deep(.el-card__body) { padding: 16px 16px 0; }
.text-hint { color: #c0c4cc; font-size: 13px; }
.kw-list { display: flex; flex-direction: column; gap: 2px; }
.kw-item { display: flex; align-items: center; gap: 4px; font-size: 12px; }
.kw-key { color: #409eff; background: #ecf5ff; padding: 1px 6px; border-radius: 3px; }
.kw-arrow { color: #c0c4cc; }
.kw-val { color: #606266; }
.kw-more { font-size: 11px; color: #909399; }
.audience-cell { display: flex; align-items: center; }

/* 弹窗布局 */
.dialog-body { min-height: 520px; }
.form-col { padding-right: 20px; border-right: 1px solid #f0f0f0; }
.preview-col { padding-left: 20px; }
.preview-header { font-size: 14px; font-weight: 600; color: #303133; margin-bottom: 16px; }
.rule-form :deep(.el-form-item) { margin-bottom: 16px; }
.section-title { font-size: 13px; font-weight: 600; color: #303133; margin: 16px 0 10px; padding-left: 8px; border-left: 3px solid #409eff; }
.content-rule-section { background: #f5f7fa; border-radius: 8px; padding: 12px; }
.content-map-row { display: flex; gap: 6px; align-items: center; margin-bottom: 8px; }
.audience-radio :deep(.el-radio-button__inner) { padding: 8px 12px; font-size: 12px; }
.form-tip { font-size: 12px; color: #909399; margin-top: 4px; line-height: 1.5; }

/* 手机预览 */
.phone-frame { background: #f5f5f5; border-radius: 16px; padding: 12px; }
.phone-top { text-align: center; font-size: 11px; color: #999; margin-bottom: 8px; }
.phone-card { background: #fff; border-radius: 8px; padding: 14px; border-left: 3px solid #07c160; min-height: 200px; }
.phone-title { font-size: 15px; font-weight: 600; margin-bottom: 12px; color: #333; }
.phone-kw { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; border-bottom: 1px dashed #f5f5f5; }
.phone-kw:last-child { border-bottom: none; }
.phone-kw .k { color: #999; }
.phone-kw .v { color: #333; }
.phone-kw .v.red { color: #f56c6c; font-weight: 600; }
.phone-action { text-align: right; color: #07c160; font-size: 12px; margin-top: 8px; }
.phone-time { text-align: right; color: #ccc; font-size: 10px; margin-top: 4px; }
.empty-preview { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; color: #c0c4cc; }
.empty-preview div { margin-top: 12px; font-size: 13px; }
</style>
