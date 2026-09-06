<template>
  <div class="app-container">
    <el-form :model="queryParams" :inline="true" v-show="showSearch" label-width="88px">
      <el-form-item label="保单号" prop="ledgerPolicyNo">
        <el-input v-model="queryParams.ledgerPolicyNo" placeholder="保单号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="记账类型">
        <el-select v-model="queryParams.bookType" placeholder="全部" clearable style="width:160px">
          <el-option v-for="dict in fin_book_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryParams.status" placeholder="全部" clearable style="width:110px">
          <el-option v-for="dict in fin_book_status" :key="dict.value" :label="dict.label" :value="dict.value" />
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

    <el-table v-loading="loading" :data="dataList">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="保单号" prop="ledgerPolicyNo" min-width="180" show-overflow-tooltip />
      <el-table-column label="金额" prop="ledgerAmount" width="120" align="right">
        <template #default="{ row }">{{ formatAmount(row.ledgerAmount) }}</template>
      </el-table-column>
      <el-table-column label="凭证号" prop="voucherNo" width="160" />
      <el-table-column label="类型" prop="bookType" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="bookTypeTag(row.bookType)" disable-transitions>{{ bookTypeText(row.bookType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="记账人" prop="bookUser" width="100" align="center" />
      <el-table-column label="记账时间" prop="bookTime" width="160" align="center" />
      <el-table-column label="状态" prop="status" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="finDictItem(row.status, 'ledger_log_status').type" disable-transitions>
            {{ finDict(row.status, 'ledger_log_status') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" show-overflow-tooltip />
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="{ row }">
          <el-button v-if="row.status==='1' && row.voucherId" type="danger" link icon="RefreshLeft" @click="handleUnbook(row)">反记账</el-button>
          <el-button v-if="row.voucherId" type="primary" link icon="View" @click="openVoucher(row.voucherId!)">查看凭证</el-button>
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

    <!-- 凭证预览 -->
    <el-dialog v-model="previewVisible" title="凭证预览" width="780px" append-to-body>
      <div v-loading="previewLoading" id="log-voucher-print">
        <el-descriptions v-if="previewData" :column="4" border size="small">
          <el-descriptions-item label="凭证号">{{ previewData.voucher.voucherNo }}</el-descriptions-item>
          <el-descriptions-item label="期间">{{ previewData.voucher.periodCode }}</el-descriptions-item>
          <el-descriptions-item label="日期">{{ previewData.voucher.voucherDate }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ statusText(previewData.voucher.status) }}</el-descriptions-item>
          <el-descriptions-item :span="4" label="摘要">{{ previewData.voucher.summary }}</el-descriptions-item>
        </el-descriptions>
        <el-table v-if="previewData" :data="previewData.entries" size="small" border style="margin-top:10px">
          <el-table-column label="序" prop="sortOrder" width="60" align="center" />
          <el-table-column label="摘要" prop="summary" min-width="200" />
          <el-table-column label="科目编码" min-width="140" align="center">
            <template #default="{row}">
              <span class="subject-code">{{ row.subjectCode || '' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="科目名称" prop="subjectName" min-width="160" show-overflow-tooltip />
          <el-table-column label="借方" prop="debitAmount" width="120" align="right">
            <template #default="{row}"><span class="money debit">{{ fmt(row.debitAmount) }}</span></template>
          </el-table-column>
          <el-table-column label="贷方" prop="creditAmount" width="120" align="right">
            <template #default="{row}"><span class="money credit">{{ fmt(row.creditAmount) }}</span></template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listLog as listLedgerLog } from '@/api/finance/log'
import { unbookLedger } from '@/api/finance/ledgerBook'
import { getFullVoucher } from '@/api/finance/voucher'
import { finDict, finDictItem } from '@/utils/financeDict'

const { fin_book_status, fin_book_type } = useDict('fin_book_status', 'fin_book_type')

const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const dataList = ref<any[]>([])
const queryParams = reactive<any>({ pageNum: 1, pageSize: 20, ledgerPolicyNo: '', bookType: '', status: '' })

const previewVisible = ref(false)
const previewLoading = ref(false)
const previewData = ref<any>(null)

async function getList() {
  loading.value = true
  try {
    const r: any = await listLedgerLog(queryParams)
    dataList.value = r.rows || []
    total.value = r.total || 0
  } finally { loading.value = false }
}

function handleQuery() { queryParams.pageNum = 1; getList() }
function resetQuery() { queryParams.ledgerPolicyNo=''; queryParams.bookType=''; queryParams.status=''; handleQuery() }

async function handleUnbook(row: any) {
  try {
    await ElMessageBox.confirm(`确认反记账凭证 [${row.voucherNo}]?此操作会把凭证状态退回草稿并标记日志为已反记账。`, '提示', { type: 'warning' })
  } catch { return }
  await unbookLedger(row.id)
  ElMessage.success('反记账成功')
  getList()
}

async function openVoucher(vid: number) {
  previewVisible.value = true
  previewLoading.value = true
  try {
    const r: any = await getFullVoucher(vid)
    previewData.value = r.data
  } finally { previewLoading.value = false }
}

function formatAmount(v?: string | number) { return v ? Number(v).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00' }
function fmt(v?: string | number) { return v ? Number(v).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00' }
function bookTypeText(s: string) { return finDict(s, 'fin_book_type') }
function bookTypeTag(s: string) { return finDictItem(s, 'fin_book_type').type }
function statusText(s: string) { return finDict(s, 'fin_book_status') }

onMounted(() => getList())
</script>

<style scoped>
.app-container { padding: 16px; }
.money { font-variant-numeric: tabular-nums; font-weight: 500; }
.money.debit { color: #67c23a; }
.money.credit { color: #f56c6c; }
.subject-code { font-family: 'SF Mono', Consolas, monospace; font-weight: 500; }
</style>