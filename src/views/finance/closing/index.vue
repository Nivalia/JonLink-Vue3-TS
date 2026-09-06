<template>
  <div class="app-container">
    <!-- 顶部筛选 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="期间编码" prop="periodCode">
        <el-input v-model="queryParams.periodCode" placeholder="如 202608" clearable @keyup.enter="handleQuery" style="width:140px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="View" @click="handlePreview" v-hasPermi="['finance:closing:preview']">预览</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Check" @click="handleClosing" v-hasPermi="['finance:closing:execute']">执行结转</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="RefreshLeft" @click="handleReverseClosing" v-hasPermi="['finance:closing:reverse']">反结转</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <!-- 预览结果表格 -->
    <el-table v-loading="loading" :data="dataList" show-summary :summary-method="summaryTable">
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="科目编码" prop="subjectCode" min-width="120" show-overflow-tooltip />
      <el-table-column label="科目名称" prop="subjectName" min-width="180" show-overflow-tooltip />
      <el-table-column label="科目类型" prop="subjectType" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="subjectTypeTag(row.subjectType)" disable-transitions>{{ subjectTypeText(row.subjectType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="期初余额" prop="beginBalance" width="120" align="right">
        <template #default="{ row }">
          <span>{{ formatAmount(row.beginBalance) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="本期借方" prop="debitAmount" width="120" align="right">
        <template #default="{ row }">
          <span style="color:#67c23a">{{ formatAmount(row.debitAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="本期贷方" prop="creditAmount" width="120" align="right">
        <template #default="{ row }">
          <span style="color:#f56c6c">{{ formatAmount(row.creditAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="期末余额" prop="endBalance" width="120" align="right">
        <template #default="{ row }">
          <span>{{ formatAmount(row.endBalance) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结转后余额" prop="closingBalance" width="120" align="right">
        <template #default="{ row }">
          <span :style="{ color: row.closingBalance !== row.endBalance ? '#e6a23c' : '' }">{{ formatAmount(row.closingBalance) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 汇总信息 -->
    <el-row :gutter="20" class="mt8">
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <span>收入合计</span>
          </template>
          <div class="summary-value income">{{ formatAmount(totalIncome) }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <span>支出合计</span>
          </template>
          <div class="summary-value expense">{{ formatAmount(totalExpense) }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <span>净利润</span>
          </template>
          <div class="summary-value" :class="netProfit >= 0 ? 'income' : 'expense'">{{ formatAmount(netProfit) }}</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  listClosingPreview, executeClosing, reverseClosing
} from '@/api/finance/closing'
import { listPeriod } from '@/api/finance/period'
import { finDict, finDictItem } from '@/utils/financeDict'

interface ClosingItem {
  subjectId: number
  subjectCode: string
  subjectName: string
  subjectType: string
  beginBalance: number
  debitAmount: number
  creditAmount: number
  endBalance: number
  closingBalance: number
}

const loading = ref(false)
const showSearch = ref(true)
const dataList = ref<ClosingItem[]>([])

const queryParams = reactive<any>({
  periodCode: ''
})

// 期间状态
const periodStatus = ref<string>('')
const periodClosed = computed(() => periodStatus.value === '1')

// 检查期间状态
async function checkPeriodStatus(periodCode: string) {
  if (!periodCode) {
    periodStatus.value = ''
    return
  }
  try {
    const r: any = await listPeriod({ periodCode, pageNum: 1, pageSize: 1 })
    const periods = r.rows || []
    if (periods.length > 0) {
      periodStatus.value = periods[0].status || ''
    } else {
      periodStatus.value = ''
      ElMessage.warning('期间不存在，请检查期间编码')
    }
  } catch (e) {
    periodStatus.value = ''
  }
}

// 监听期间编码变化，自动校验期间状态
watch(() => queryParams.periodCode, (newVal) => {
  checkPeriodStatus(newVal)
})

// ===== 汇总计算 =====
const totalIncome = computed(() => {
  return dataList.value
    .filter(item => item.subjectType === 'income')
    .reduce((sum, item) => sum + (item.closingBalance || 0), 0)
})

const totalExpense = computed(() => {
  return dataList.value
    .filter(item => item.subjectType === 'expense')
    .reduce((sum, item) => sum + (item.closingBalance || 0), 0)
})

const netProfit = computed(() => totalIncome.value - totalExpense.value)

// ===== 列表查询 =====
async function getList() {
  loading.value = true
  try {
    const r: any = await listClosingPreview(queryParams)
    dataList.value = r.data || []
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  if (!queryParams.periodCode) {
    ElMessage.warning('请输入期间编码')
    return
  }
  getList()
}

function resetQuery() {
  Object.assign(queryParams, { periodCode: '' })
  dataList.value = []
}

// ===== 预览 =====
function handlePreview() {
  if (!queryParams.periodCode) {
    ElMessage.warning('请输入期间编码')
    return
  }
  getList()
}

// ===== 执行结转 =====
async function handleClosing() {
  if (!queryParams.periodCode) {
    ElMessage.warning('请输入期间编码')
    return
  }
  
  // 校验期间状态
  if (periodClosed.value) {
    ElMessage.error('该期间已结账，无法执行结转')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确认对期间 ${queryParams.periodCode} 执行期末结转？`,
      '提示',
      { type: 'warning' }
    )
    await executeClosing(queryParams.periodCode)
    ElMessage.success('结转执行成功')
    getList()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e?.msg || '结转执行失败')
  }
}

// ===== 反结转 =====
async function handleReverseClosing() {
  if (!queryParams.periodCode) {
    ElMessage.warning('请输入期间编码')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确认对期间 ${queryParams.periodCode} 执行反结转？反结转将撤销之前的结转凭证。`,
      '提示',
      { type: 'warning' }
    )
    await reverseClosing(queryParams.periodCode)
    ElMessage.success('反结转执行成功')
    getList()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e?.msg || '反结转执行失败')
  }
}

// ===== 表格汇总 =====
function summaryTable({ columns, data }: any) {
  const sums: string[] = []
  columns.forEach((col: any, idx: number) => {
    if (idx === 0) {
      sums[idx] = '合计'
    } else if (col.label === '期初余额') {
      sums[idx] = formatAmount(data.reduce((s: number, item: ClosingItem) => s + (item.beginBalance || 0), 0))
    } else if (col.label === '本期借方') {
      sums[idx] = formatAmount(data.reduce((s: number, item: ClosingItem) => s + (item.debitAmount || 0), 0))
    } else if (col.label === '本期贷方') {
      sums[idx] = formatAmount(data.reduce((s: number, item: ClosingItem) => s + (item.creditAmount || 0), 0))
    } else if (col.label === '期末余额') {
      sums[idx] = formatAmount(data.reduce((s: number, item: ClosingItem) => s + (item.endBalance || 0), 0))
    } else if (col.label === '结转后余额') {
      sums[idx] = formatAmount(data.reduce((s: number, item: ClosingItem) => s + (item.closingBalance || 0), 0))
    } else {
      sums[idx] = ''
    }
  })
  return sums
}

// ===== 工具函数 =====
function formatAmount(v?: string | number): string {
  if (v === undefined || v === null || v === '') return '0.00'
  return Number(v).toFixed(2)
}

function subjectTypeText(t: string) { return finDict(t, 'subject_type') }
function subjectTypeTag(t: string) { return finDictItem(t, 'subject_type').type }

onMounted(() => {})
</script>

<style scoped>
.summary-value {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  padding: 16px 0;
}
.summary-value.income { color: #67c23a; }
.summary-value.expense { color: #f56c6c; }
.mt8 { margin-top: 8px; }
</style>
