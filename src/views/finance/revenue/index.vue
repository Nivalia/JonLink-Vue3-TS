<template>
  <div class="app-container">
    <el-form :model="queryParams" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="日期范围">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="确认状态">
        <el-select v-model="queryParams.confirmStatus" placeholder="请选择确认状态" clearable>
          <el-option v-for="dict in fin_revenue_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Refresh" @click="getList">刷新</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="dataList" stripe border>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="保单号" prop="policyNo" min-width="180" show-overflow-tooltip />
      <el-table-column label="保险公司" prop="insuranceCompany" min-width="160" />
      <el-table-column label="保费" prop="premium" width="130" align="right">
        <template #default="{ row }">
          <b class="money">¥ {{ fmt(row.premium) }}</b>
        </template>
      </el-table-column>
      <el-table-column label="确认状态" prop="confirmStatus" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.confirmStatus)" disable-transitions>
            {{ getStatusLabel(row.confirmStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="凭证ID" prop="voucherId" min-width="140" align="center">
        <template #default="{ row }">
          <span v-if="row.voucherId">{{ row.voucherId }}</span>
          <span v-else class="text-muted">未关联</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180">
        <template #default="{ row }">
          <el-button
            link
            type="primary"
            icon="Check"
            :disabled="row.confirmStatus === '1'"
            @click="handleConfirm(row)"
            v-hasPermi="['finance:revenue:confirm']"
          >确认收入</el-button>
          <el-button
            link
            type="danger"
            icon="RefreshLeft"
            :disabled="row.confirmStatus !== '1'"
            @click="handleReverse(row)"
            v-hasPermi="['finance:revenue:reverse']"
          >反确认</el-button>
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

    <el-row class="summary-row">
      <el-col :span="24">
        <el-descriptions :column="4" border size="small">
          <el-descriptions-item label="保单数">{{ summaryData.policyCount || 0 }}</el-descriptions-item>
          <el-descriptions-item label="总保费">¥ {{ fmt(summaryData.totalPremium) }}</el-descriptions-item>
          <el-descriptions-item label="已确认数">{{ summaryData.confirmedCount || 0 }}</el-descriptions-item>
          <el-descriptions-item label="已确认保费">¥ {{ fmt(summaryData.confirmedPremium) }}</el-descriptions-item>
        </el-descriptions>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listRevenue, confirmRevenue, reverseRevenue } from '@/api/finance/revenue'
import { finDict } from '@/utils/financeDict'

const { fin_revenue_status } = useDict('fin_revenue_status')

const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const dataList = ref<any[]>([])
const dateRange = ref<string[]>([])

const queryParams = reactive<any>({
  pageNum: 1,
  pageSize: 20,
  confirmStatus: '',
  beginDate: '',
  endDate: ''
})

const summaryData = reactive<any>({
  policyCount: 0,
  totalPremium: 0,
  confirmedCount: 0,
  confirmedPremium: 0
})

function fmt(v?: string | number) {
  return v ? Number(v).toFixed(2) : '0.00'
}

function getStatusType(status: string) {
  const map: Record<string, string> = {
    '0': 'info',
    '1': 'success',
    '2': 'warning'
  }
  return map[status] || 'info'
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    '0': '未确认',
    '1': '已确认',
    '2': '已反确认'
  }
  return map[status] || '未知'
}

async function getList() {
  loading.value = true
  if (dateRange.value && dateRange.value.length === 2) {
    queryParams.beginDate = dateRange.value[0]
    queryParams.endDate = dateRange.value[1]
  } else {
    queryParams.beginDate = ''
    queryParams.endDate = ''
  }
  try {
    const r: any = await listRevenue(queryParams)
    dataList.value = r.rows || []
    total.value = r.total || 0
    Object.assign(summaryData, r.summary || {})
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  queryParams.confirmStatus = ''
  dateRange.value = []
  handleQuery()
}

async function handleConfirm(row: any) {
  await ElMessageBox.confirm(`确认对保单号【${row.policyNo}】的收入进行确认？`, '确认操作', { type: 'warning' })
  await confirmRevenue(row.id)
  ElMessage.success('确认成功')
  getList()
}

async function handleReverse(row: any) {
  await ElMessageBox.confirm(`确认对保单号【${row.policyNo}】的收入进行反确认？`, '确认操作', { type: 'warning' })
  await reverseRevenue(row.id)
  ElMessage.success('反确认成功')
  getList()
}

onMounted(getList)
</script>

<style scoped>
.app-container { padding: 16px; }
.money { font-variant-numeric: tabular-nums; color: #303133; }
.text-muted { color: #c0c4cc; }
.summary-row { margin-top: 16px; }
</style>
