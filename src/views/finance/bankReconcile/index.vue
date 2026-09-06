<template>
  <div class="app-container">
    <!-- 顶部筛选 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="银行账户" prop="bankAccountId">
        <el-select v-model="queryParams.bankAccountId" placeholder="选择银行账户" clearable style="width:200px">
          <el-option v-for="item in bankAccountList" :key="item.id" :label="item.accountName" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="状态" clearable style="width:120px">
          <el-option v-for="dict in fin_bank_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Upload" @click="handleImport" v-hasPermi="['finance:bankReconcile:import']">导入银行流水</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Refresh" @click="handleQuery" v-hasPermi="['finance:bankReconcile:query']">刷新</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <!-- 主体：左右分栏 -->
    <el-row :gutter="20">
      <!-- 左边：银行未对账流水 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span>银行未对账流水</span>
          </template>
          <el-table v-loading="loading" :data="bankDataList" @selection-change="handleBankSelectionChange" :row-class-name="bankRowClassName">
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column label="交易日期" prop="transactionDate" width="110" align="center" />
            <el-table-column label="摘要" prop="summary" min-width="150" show-overflow-tooltip />
            <el-table-column label="借方金额" prop="debitAmount" width="110" align="right">
              <template #default="{ row }">
                <span style="color:#67c23a">{{ formatAmount(row.debitAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="贷方金额" prop="creditAmount" width="110" align="right">
              <template #default="{ row }">
                <span style="color:#f56c6c">{{ formatAmount(row.creditAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" prop="status" width="90" align="center">
              <template #default="{ row }">
                <el-tag :type="bankStatusTag(row.status)" disable-transitions>{{ bankStatusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleBankReconcile(row)" v-hasPermi="['finance:bankReconcile:match']">对账</el-button>
              </template>
            </el-table-column>
          </el-table>
          <pagination v-show="bankTotal > 0" :total="bankTotal" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getBankList" />
        </el-card>
      </el-col>

      <!-- 右边：系统未匹配流水 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span>系统未匹配流水</span>
          </template>
          <el-table v-loading="systemLoading" :data="systemDataList" @selection-change="handleSystemSelectionChange" :row-class-name="systemRowClassName">
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column label="交易日期" prop="transactionDate" width="110" align="center" />
            <el-table-column label="摘要" prop="summary" min-width="150" show-overflow-tooltip />
            <el-table-column label="借方金额" prop="debitAmount" width="110" align="right">
              <template #default="{ row }">
                <span style="color:#67c23a">{{ formatAmount(row.debitAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="贷方金额" prop="creditAmount" width="110" align="right">
              <template #default="{ row }">
                <span style="color:#f56c6c">{{ formatAmount(row.creditAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="凭证号" prop="voucherNo" width="120" align="center" />
            <el-table-column label="操作" width="100" align="center" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleSystemReconcile(row)" v-hasPermi="['finance:bankReconcile:match']">对账</el-button>
              </template>
            </el-table-column>
          </el-table>
          <pagination v-show="systemTotal > 0" :total="systemTotal" v-model:page="queryParams.systemPageNum" v-model:limit="queryParams.systemPageSize" @pagination="getSystemList" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 余额调节表 -->
    <el-card shadow="never" class="mt8">
      <template #header>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span>余额调节表</span>
          <el-tag :type="isBalanced ? 'success' : 'danger'" size="small">
            {{ isBalanced ? '✓ 已平衡' : '✗ 不平衡 (差额: ' + formatAmount(Math.abs(balanceDiff)) + ')' }}
          </el-tag>
        </div>
      </template>
      <el-descriptions :column="4" border>
        <el-descriptions-item label="银行账面余额">{{ formatAmount(reconcileData.bankBalance) }}</el-descriptions-item>
        <el-descriptions-item label="企业账面余额">{{ formatAmount(reconcileData.companyBalance) }}</el-descriptions-item>
        <el-descriptions-item label="银行已收企业未收">{{ formatAmount(reconcileData.bankReceivedNotRecorded) }}</el-descriptions-item>
        <el-descriptions-item label="银行已付企业未付">{{ formatAmount(reconcileData.bankPaidNotRecorded) }}</el-descriptions-item>
        <el-descriptions-item label="企业已收银行未收">{{ formatAmount(reconcileData.companyReceivedNotCleared) }}</el-descriptions-item>
        <el-descriptions-item label="企业已付银行未付">{{ formatAmount(reconcileData.companyPaidNotCleared) }}</el-descriptions-item>
        <el-descriptions-item label="调节后余额" :span="2">
          <span style="font-weight:bold;font-size:16px">{{ formatAmount(reconcileData.adjustedBalance) }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 导入银行流水对话框 -->
    <el-dialog title="导入银行流水" v-model="importDialogVisible" width="600px" append-to-body>
      <el-form ref="importFormRef" :model="importForm" label-width="100px">
        <el-form-item label="银行账户" prop="bankAccountId" :rules="[{ required: true, message: '请选择银行账户', trigger: 'change' }]">
          <el-select v-model="importForm.bankAccountId" placeholder="选择银行账户" style="width:100%">
            <el-option v-for="item in bankAccountList" :key="item.id" :label="item.accountName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="文件上传" prop="file">
          <el-upload
            ref="uploadRef"
            :action="importUrl"
            :data="{ bankAccountId: importForm.bankAccountId }"
            :on-success="handleImportSuccess"
            :on-error="handleImportError"
            :before-upload="beforeImportUpload"
            :limit="1"
            :auto-upload="false"
          >
            <el-button type="primary" icon="Upload">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">支持 Excel 格式 (.xlsx, .xls)</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitImport" :loading="importLoading">确定导入</el-button>
      </template>
    </el-dialog>

    <!-- 对账选择对话框 -->
    <el-dialog title="选择系统流水进行匹配" v-model="reconcileDialogVisible" width="800px" append-to-body>
      <el-table :data="reconcileSystemList" highlight-current-row @current-change="handleReconcileSelect" v-loading="reconcileLoading">
        <el-table-column width="55">
          <template #default="{ row }">
            <el-radio v-model="reconcileSelectedId" :value="row.id">&nbsp;</el-radio>
          </template>
        </el-table-column>
        <el-table-column label="交易日期" prop="transactionDate" width="110" align="center" />
        <el-table-column label="摘要" prop="summary" min-width="150" show-overflow-tooltip />
        <el-table-column label="借方金额" prop="debitAmount" width="110" align="right">
          <template #default="{ row }">
            <span style="color:#67c23a">{{ formatAmount(row.debitAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="贷方金额" prop="creditAmount" width="110" align="right">
          <template #default="{ row }">
            <span style="color:#f56c6c">{{ formatAmount(row.creditAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="凭证号" prop="voucherNo" width="120" align="center" />
      </el-table>
      <template #footer>
        <el-button @click="reconcileDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReconcile" :disabled="!reconcileSelectedId" :loading="reconcileConfirmLoading">确认对账</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  listBankTransaction, listSystemTransaction, matchBankTransaction,
  getReconcileSummary, listBankAccount, importBankStatement
} from '@/api/finance/bankReconcile'
import { finDict, finDictItem } from '@/utils/financeDict'

const { fin_bank_status } = useDict('fin_bank_status')

interface BankTransaction {
  id: number
  bankAccountId: number
  transactionDate: string
  summary: string
  debitAmount: number
  creditAmount: number
  status: string
}

interface SystemTransaction {
  id: number
  transactionDate: string
  summary: string
  debitAmount: number
  creditAmount: number
  voucherNo: string
}

interface BankAccount {
  id: number
  accountName: string
  accountNo: string
}

interface ReconcileData {
  bankBalance: number
  companyBalance: number
  bankReceivedNotRecorded: number
  bankPaidNotRecorded: number
  companyReceivedNotCleared: number
  companyPaidNotCleared: number
  adjustedBalance: number
}

const loading = ref(false)
const systemLoading = ref(false)
const showSearch = ref(true)
const bankTotal = ref(0)
const systemTotal = ref(0)
const bankDataList = ref<BankTransaction[]>([])
const systemDataList = ref<SystemTransaction[]>([])
const bankAccountList = ref<BankAccount[]>([])
const bankIds = ref<number[]>([])
const systemIds = ref<number[]>([])

const queryParams = reactive<any>({
  bankAccountId: '',
  status: '',
  pageNum: 1,
  pageSize: 20,
  systemPageNum: 1,
  systemPageSize: 20
})

const reconcileData = ref<ReconcileData>({
  bankBalance: 0,
  companyBalance: 0,
  bankReceivedNotRecorded: 0,
  bankPaidNotRecorded: 0,
  companyReceivedNotCleared: 0,
  companyPaidNotCleared: 0,
  adjustedBalance: 0
})

// 监听银行账户变化，自动刷新数据
watch(() => queryParams.bankAccountId, (newVal) => {
  if (newVal) {
    handleQuery()
  }
})

// 计算调节后余额是否平衡
const isBalanced = computed(() => {
  const diff = Math.abs(reconcileData.value.adjustedBalance - reconcileData.value.companyBalance)
  return diff < 0.01
})

// 余额差异
const balanceDiff = computed(() => {
  return reconcileData.value.adjustedBalance - reconcileData.value.companyBalance
})

// ===== 导入相关 =====
const importDialogVisible = ref(false)
const importLoading = ref(false)
const importFormRef = ref()
const importForm = reactive({
  bankAccountId: ''
})
const importUrl = '/api/finance/bank-reconcile/import'
const uploadRef = ref()

// ===== 对账相关 =====
const reconcileDialogVisible = ref(false)
const reconcileLoading = ref(false)
const reconcileConfirmLoading = ref(false)
const reconcileSystemList = ref<SystemTransaction[]>([])
const reconcileSelectedId = ref<number | null>(null)
const currentBankRow = ref<BankTransaction | null>(null)

// ===== 列表查询 =====
async function getBankList() {
  loading.value = true
  try {
    const r: any = await listBankTransaction(queryParams)
    bankDataList.value = r.rows || []
    bankTotal.value = r.total || 0
  } finally {
    loading.value = false
  }
}

async function getSystemList() {
  systemLoading.value = true
  try {
    const r: any = await listSystemTransaction(queryParams)
    systemDataList.value = r.rows || []
    systemTotal.value = r.total || 0
  } finally {
    systemLoading.value = false
  }
}

async function getReconcileData() {
  try {
    const r: any = await getReconcileSummary(queryParams)
    reconcileData.value = r.data || {}
  } catch (e) {
    console.error('获取余额调节表失败', e)
  }
}

async function getBankAccountList() {
  try {
    const r: any = await listBankAccount({})
    bankAccountList.value = r.data || []
  } catch (e) {
    console.error('获取银行账户列表失败', e)
  }
}

function getList() {
  getBankList()
  getSystemList()
  getReconcileData()
}

function handleQuery() {
  queryParams.pageNum = 1
  queryParams.systemPageNum = 1
  getList()
}

function resetQuery() {
  Object.assign(queryParams, {
    bankAccountId: '',
    status: '',
    pageNum: 1,
    pageSize: 20,
    systemPageNum: 1,
    systemPageSize: 20
  })
  getList()
}

function handleBankSelectionChange(s: BankTransaction[]) {
  bankIds.value = s.map(x => x.id).filter(Boolean)
}

function handleSystemSelectionChange(s: SystemTransaction[]) {
  systemIds.value = s.map(x => x.id).filter(Boolean)
}

// ===== 导入银行流水 =====
function handleImport() {
  importDialogVisible.value = true
  importForm.bankAccountId = ''
}

function beforeImportUpload(file: File) {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    || file.type === 'application/vnd.ms-excel'
  if (!isExcel) {
    ElMessage.error('只能上传 Excel 文件!')
    return false
  }
  return true
}

function submitImport() {
  importLoading.value = true
  uploadRef.value?.submit()
}

function handleImportSuccess(response: any) {
  importLoading.value = false
  importDialogVisible.value = false
  if (response.code === 200) {
    ElMessage.success('导入成功')
    getList()
  } else {
    ElMessage.error(response.msg || '导入失败')
  }
}

function handleImportError() {
  importLoading.value = false
  ElMessage.error('导入失败')
}

// ===== 对账操作 =====
async function handleBankReconcile(row: BankTransaction) {
  currentBankRow.value = row
  reconcileSelectedId.value = null
  reconcileDialogVisible.value = true
  reconcileLoading.value = true
  try {
    const r: any = await listSystemTransaction({
      bankAccountId: row.bankAccountId,
      status: '0',
      pageNum: 1,
      pageSize: 100
    })
    reconcileSystemList.value = r.rows || []
  } finally {
    reconcileLoading.value = false
  }
}

async function handleSystemReconcile(row: SystemTransaction) {
  ElMessage.info('请从左侧银行流水选择记录进行对账')
}

function handleReconcileSelect(row: SystemTransaction) {
  reconcileSelectedId.value = row.id
}

async function confirmReconcile() {
  if (!currentBankRow.value || !reconcileSelectedId.value) return
  reconcileConfirmLoading.value = true
  try {
    await ElMessageBox.confirm(
      '确认将银行流水与系统流水进行匹配？',
      '提示',
      { type: 'warning' }
    )
    await matchBankTransaction({
      bankTransactionId: currentBankRow.value.id,
      systemTransactionId: reconcileSelectedId.value
    })
    ElMessage.success('对账成功')
    reconcileDialogVisible.value = false
    // 对账成功后自动刷新余额调节表
    await getReconcileData()
    // 刷新列表
    getBankList()
    getSystemList()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e?.msg || '对账失败')
  } finally {
    reconcileConfirmLoading.value = false
  }
}

// ===== 工具函数 =====
function formatAmount(v?: string | number): string {
  if (v === undefined || v === null || v === '') return '0.00'
  return Number(v).toFixed(2)
}

function bankStatusText(s: string) { return finDict(s, 'fin_bank_status') }
function bankStatusTag(s: string) { return finDictItem(s, 'fin_bank_status').type }

function bankRowClassName({ row }: { row: BankTransaction }) {
  if (row.status === '1') return 'matched-row'
  return ''
}

function systemRowClassName({ row }: { row: SystemTransaction }) {
  return ''
}

onMounted(() => {
  getBankAccountList()
})
</script>

<style scoped>
.mt8 { margin-top: 8px; }
:deep(.matched-row) {
  background-color: #f5f7fa;
}
</style>
