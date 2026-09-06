<template>
  <div class="app-container">
    <!-- 筛选 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="88px">
      <el-form-item label="保单号" prop="policyNo">
        <el-input v-model="queryParams.policyNo" placeholder="保单号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="投保人" prop="applicant">
        <el-input v-model="queryParams.applicant" placeholder="投保人" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="渠道" prop="channelType">
        <el-select v-model="queryParams.channelType" placeholder="渠道" clearable style="width:140px">
          <el-option v-for="dict in fin_partner_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="mb8">
      <el-col :span="6"><el-card shadow="hover"><div class="stat-label">保单总数</div><div class="stat-value">{{ stats.totalCount }}</div></el-card></el-col>
      <el-col :span="6"><el-card shadow="hover"><div class="stat-label" style="color:#67c23a">已记账</div><div class="stat-value" style="color:#67c23a">{{ stats.bookedCount }}</div></el-card></el-col>
      <el-col :span="6"><el-card shadow="hover"><div class="stat-label" style="color:#e6a23c">已结算(下)</div><div class="stat-value" style="color:#e6a23c">{{ stats.downSettledCount }}</div></el-card></el-col>
      <el-col :span="6"><el-card shadow="hover"><div class="stat-label" style="color:#f56c6c">未结算(下)</div><div class="stat-value" style="color:#f56c6c">{{ stats.downUnsettledCount }}</div></el-card></el-col>
    </el-row>

    <!-- 台账列表 -->
    <el-table v-loading="loading" :data="dataList">
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="保单号" prop="policyNo" min-width="180" show-overflow-tooltip />
      <el-table-column label="日期" prop="ledgerDate" width="110" align="center" />
      <el-table-column label="渠道" prop="channelType" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="channelTag(row.channelType)" disable-transitions>{{ channelText(row.channelType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="产品" prop="productName" min-width="140" show-overflow-tooltip />
      <el-table-column label="险种" prop="insuranceType" width="120" />
      <el-table-column label="投保人" prop="applicant" width="140" show-overflow-tooltip />
      <el-table-column label="保费" prop="premium" width="120" align="right">
        <template #default="{ row }">{{ formatAmount(row.premium) }}</template>
      </el-table-column>
      <el-table-column label="上佣" prop="upCommission" width="100" align="right">
        <template #default="{ row }">{{ formatAmount(row.upCommission) }}</template>
      </el-table-column>
      <el-table-column label="下佣" prop="downCommission" width="100" align="right">
        <template #default="{ row }">{{ formatAmount(row.downCommission) }}</template>
      </el-table-column>
      <el-table-column label="净利润" prop="profit" width="110" align="right">
        <template #default="{ row }"><b style="color:#67c23a">{{ formatAmount(row.profit) }}</b></template>
      </el-table-column>
      <el-table-column label="上结" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="finDictItem(row.upSettleStatus, 'settle_status').type" disable-transitions>
            {{ finDict(row.upSettleStatus, 'settle_status') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="下结" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="finDictItem(row.downSettleStatus, 'settle_status').type" disable-transitions>
            {{ finDict(row.downSettleStatus, 'settle_status') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link icon="Edit" @click="openBookDialog(row, 'ledger_book')">台账记账</el-button>
          <el-button type="warning" link icon="Coin" @click="openBookDialog(row, 'settle_down')">下游结</el-button>
          <el-button type="success" link icon="RefreshLeft" @click="openBookDialog(row, 'settle_up')">上游结</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 记账对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="780px" append-to-body @close="resetDialog">
      <el-alert v-if="isAlreadyBooked" title="该保单已记账，请勿重复操作" type="warning" :closable="false" show-icon style="margin-bottom: 16px" />
      
      <el-descriptions :column="4" border size="small">
        <el-descriptions-item label="保单号">{{ currentRow?.policyNo }}</el-descriptions-item>
        <el-descriptions-item label="日期">{{ currentRow?.ledgerDate }}</el-descriptions-item>
        <el-descriptions-item label="投保人">{{ currentRow?.applicant }}</el-descriptions-item>
        <el-descriptions-item label="渠道">{{ channelText(currentRow?.channelType) }}</el-descriptions-item>
        <el-descriptions-item label="保费">{{ formatAmount(currentRow?.premium) }}</el-descriptions-item>
        <el-descriptions-item label="上佣">{{ formatAmount(currentRow?.upCommission) }}</el-descriptions-item>
        <el-descriptions-item label="下佣">{{ formatAmount(currentRow?.downCommission) }}</el-descriptions-item>
        <el-descriptions-item label="净利">{{ formatAmount(currentRow?.profit) }}</el-descriptions-item>
      </el-descriptions>

      <el-form ref="formRef" :model="form" label-width="110px" style="margin-top:16px">
        <el-row>
          <el-col :span="12"><el-form-item label="凭证期间">
            <el-input v-model="form.periodCode" placeholder="202608" />
          </el-form-item></el-col>
          <el-col :span="12"><el-form-item label="凭证日期">
            <el-date-picker v-model="form.voucherDate" type="date" value-format="YYYY-MM-DD" style="width:100%" />
          </el-form-item></el-col>
        </el-row>
        <el-form-item label="金额上下文">
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <el-tag v-for="(v, k) in form.amountFieldMap" :key="k" type="info">
              {{ k }} = {{ v }}
            </el-tag>
          </div>
        </el-form-item>
        <el-form-item label="摘要预览">
          <el-input :model-value="previewSummary" readonly type="textarea" :rows="2" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" :disabled="!canSubmit" @click="submitBook()">确认记账</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { bookLedger } from '@/api/finance/ledgerBook'
import { finDict, finDictItem } from '@/utils/financeDict'

const { fin_partner_type } = useDict('fin_partner_type')

const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const dataList = ref<any[]>([])
const stats = reactive({ totalCount: 0, bookedCount: 0, downSettledCount: 0, downUnsettledCount: 0 })

const queryParams = reactive<any>({
  pageNum: 1, pageSize: 20,
  policyNo: '', applicant: '', channelType: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const currentRow = ref<any>(null)
const currentTemplateCode = ref('')
const formRef = ref()
const form = reactive<any>({
  periodCode: '202608',
  voucherDate: new Date().toISOString().substring(0, 10),
  amountFieldMap: {} as Record<string, number>
})

const previewSummary = computed(() => {
  const tplMap: Record<string, string> = {
    ledger_book: '台账出单记账 {policyNo}',
    settle_up: '上游结算 {policyNo}',
    settle_down: '下游结算 {policyNo}'
  }
  return (tplMap[currentTemplateCode.value] || '{policyNo}').replace('{policyNo}', currentRow.value?.policyNo || '')
})

// 监听期间编码变化，更新摘要预览
watch(() => form.periodCode, (newVal) => {
  // 期间编码变化时可以做一些处理
})

// 检查是否已记账（防重复）
const isAlreadyBooked = computed(() => {
  if (!currentRow.value) return false
  // 根据模板类型检查对应的状态
  if (currentTemplateCode.value === 'ledger_book') {
    return currentRow.value.booked === true || currentRow.value.booked === 1
  } else if (currentTemplateCode.value === 'settle_down') {
    return currentRow.value.downSettleStatus === '1'
  } else if (currentTemplateCode.value === 'settle_up') {
    return currentRow.value.upSettleStatus === '1'
  }
  return false
})

// 记账按钮是否可用
const canSubmit = computed(() => {
  if (isAlreadyBooked.value) return false
  if (!form.periodCode) return false
  if (!form.voucherDate) return false
  return true
})

async function getList() {
  loading.value = true
  try {
    const r: any = await request({ url: '/ledger/ledger/list', method: 'get', params: queryParams })
    dataList.value = r.rows || []
    total.value = r.total || 0
    stats.totalCount = total.value
    stats.downSettledCount = dataList.value.filter((x: any) => x.downSettleStatus === '1').length
    stats.downUnsettledCount = dataList.value.filter((x: any) => x.downSettleStatus !== '1').length
    // 已记账数 = fin_ledger_voucher_log 中 ledger_id 命中数 (粗略:此处简化 = 0)
    stats.bookedCount = 0
  } finally { loading.value = false }
}

function handleQuery() { queryParams.pageNum = 1; getList() }
function resetQuery() { queryParams.policyNo=''; queryParams.applicant=''; queryParams.channelType=''; handleQuery() }

function openBookDialog(row: any, tplCode: string) {
  currentRow.value = row
  currentTemplateCode.value = tplCode
  dialogTitle.value = ({ ledger_book: '台账出单记账', settle_up: '上游结算记账', settle_down: '下游结算记账' } as any)[tplCode]
  // 按模板填默认金额上下文
  if (tplCode === 'ledger_book') {
    form.amountFieldMap = { premium: row.premium, down_commission: row.downCommission, up_commission: row.upCommission }
  } else {
    if (tplCode === 'settle_up') form.amountFieldMap = { amount: row.upCommission }
    else if (tplCode === 'settle_down') form.amountFieldMap = { amount: row.downCommission }
  }
  dialogVisible.value = true
}

async function submitBook() {
  submitLoading.value = true
  try {
    const r: any = await bookLedger({
      templateCode: currentTemplateCode.value,
      ledgerId: currentRow.value.id,
      policyNo: currentRow.value.policyNo,
      amountFieldMap: form.amountFieldMap,
      periodCode: form.periodCode,
      voucherDate: form.voucherDate
    })
    ElMessage.success('记账成功: ' + (r.data?.voucherNo || ''))
    dialogVisible.value = false
    getList()
  } catch (e: any) {
    ElMessage.error(e?.msg || '记账失败')
  } finally { submitLoading.value = false }
}

function resetDialog() { currentRow.value = null; form.amountFieldMap = {} }

function formatAmount(v?: string | number) { if (!v) return '0.00'; return Number(v).toFixed(2) }
function channelText(s: string) { return finDict(s, 'fin_partner_type') }
function channelTag(s: string) { return finDictItem(s, 'fin_partner_type').type }

onMounted(() => getList())
</script>

<style scoped>
.stat-label { font-size: 13px; color: #909399; margin-bottom: 8px; }
.stat-value { font-size: 24px; font-weight: 600; color: #303133; }
</style>