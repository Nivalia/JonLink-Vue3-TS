<template>
  <div class="app-container">
    <el-form :model="queryParams" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="账户名称"><el-input v-model="queryParams.bankAccountName" placeholder="账户名称" clearable /></el-form-item>
      <el-form-item label="方向">
        <el-select v-model="queryParams.direction" clearable style="width:140px">
          <el-option v-for="dict in fin_direction" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="业务类型">
        <el-select v-model="queryParams.bizType" clearable style="width:160px">
          <el-option v-for="dict in cash_flow_biz_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8"><right-toolbar v-model:showSearch="showSearch" @queryTable="getList" /></el-row>

    <el-table v-loading="loading" :data="dataList" stripe border>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="账户" prop="bankAccountName" min-width="160" show-overflow-tooltip>
        <template #default="{row}">
          <span>{{ row.bankAccountName || '' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="方向" prop="direction" width="90" align="center">
        <template #default="{row}">
          <el-tag :type="finDictItem(row.direction, 'cash_flow_direction').type" disable-transitions>
            {{ finDict(row.direction, 'cash_flow_direction') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="金额" min-width="140" align="right">
        <template #default="{row}">
          <b :class="row.direction==='1' ? 'money in' : 'money out'">
            {{ row.direction==='1' ? '+' : '-' }}{{ fmt(row.amount) }}
          </b>
        </template>
      </el-table-column>
      <el-table-column label="余额" min-width="140" align="right">
        <template #default="{row}">
          <span class="money">{{ fmt(row.balanceAfter) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="业务类型" prop="bizType" min-width="140" align="center">
        <template #default="scope">
          <el-tag :type="finDictItem(scope.row.bizType, 'cash_flow_biz_type').type || 'info'" disable-transitions>
            {{ finDict(scope.row.bizType, 'cash_flow_biz_type') || scope.row.bizType }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="业务单号" prop="bizNo" min-width="180" show-overflow-tooltip>
        <template #default="{row}">
          <span>{{ row.bizNo || '' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="时间" prop="flowTime" min-width="160" align="center">
        <template #default="{row}">
          <span>{{ row.flowTime ? row.flowTime.substring(0,16) : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
    </el-table>
    <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { flowList } from '@/api/finance/fund'
import { finDict, finDictItem, FIN_DICTS } from '@/utils/financeDict'

const { fin_direction, cash_flow_biz_type } = useDict('fin_direction', 'cash_flow_biz_type')

const loading = ref(false); const showSearch = ref(true); const total = ref(0); const dataList = ref<any[]>([])
const queryParams = reactive<any>({ pageNum: 1, pageSize: 20, bankAccountName: '', direction: '', bizType: '' })

async function getList() {
  loading.value = true
  try { const r: any = await flowList(queryParams); dataList.value = r.rows || []; total.value = r.total || 0 }
  finally { loading.value = false }
}
function handleQuery() { queryParams.pageNum = 1; getList() }
function resetQuery() { queryParams.bankAccountName=''; queryParams.direction=''; queryParams.bizType=''; handleQuery() }
function fmt(v?: string | number) { return v ? Number(v).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00' }
onMounted(getList)
</script>

<style scoped>
.app-container { padding: 16px; }
.money { font-variant-numeric: tabular-nums; font-weight: 500; }
.money.in { color: #67c23a; }
.money.out { color: #f56c6c; }
</style>