<template>
  <div class="app-container">
    <el-form :inline="true" label-width="80px">
      <el-form-item label="开始日"><el-date-picker v-model="startDate" type="date" value-format="YYYY-MM-DD" /></el-form-item>
      <el-form-item label="结束日"><el-date-picker v-model="endDate" type="date" value-format="YYYY-MM-DD" /></el-form-item>
      <el-form-item><el-button type="primary" icon="Search" @click="load">查询</el-button></el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="rows" border show-summary :summary-method="summaryMethod">
      <el-table-column label="月份" prop="yearMonth" width="100" align="center" />
      <el-table-column label="渠道类型" prop="channelType" width="100" align="center">
        <template #default="{row}"><el-tag :type="channelTag(row.channelType)" disable-transitions>{{ channelText(row.channelType) }}</el-tag></template>
      </el-table-column>
      <el-table-column label="渠道名" prop="channelName" min-width="160" />
      <el-table-column label="险种" prop="insuranceType" width="140" />
      <el-table-column label="保单数" prop="policyCount" width="90" align="center" />
      <el-table-column label="保费" prop="premium" width="120" align="right">
        <template #default="{row}">{{ fmt(row.premium) }}</template>
      </el-table-column>
      <el-table-column label="上佣" prop="upCommission" width="110" align="right">
        <template #default="{row}">{{ fmt(row.upCommission) }}</template>
      </el-table-column>
      <el-table-column label="下佣" prop="downCommission" width="110" align="right">
        <template #default="{row}">{{ fmt(row.downCommission) }}</template>
      </el-table-column>
      <el-table-column label="净利润" prop="profit" width="120" align="right">
        <template #default="{row}"><b style="color:#67c23a">{{ fmt(row.profit) }}</b></template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ledgerPerformance } from '@/api/finance/report'
import { finDict, finDictItem } from '@/utils/financeDict'

const { fin_partner_type } = useDict('fin_partner_type')

const startDate = ref('2026-01-01')
const endDate = ref('2026-12-31')
const loading = ref(false)
const rows = ref<any[]>([])

async function load() {
  loading.value = true
  try { const r: any = await ledgerPerformance(startDate.value, endDate.value); rows.value = r.data || [] }
  finally { loading.value = false }
}

function summaryMethod({ columns, data }: any) {
  const sums: string[] = []
  columns.forEach((col: any, idx: number) => {
    if (idx === 0) {
      sums[idx] = '合计'
    } else if (col.label === '保单数') {
      sums[idx] = data.reduce((s: number, row: any) => s + (row.policyCount || 0), 0)
    } else if (col.label === '保费') {
      sums[idx] = fmt(data.reduce((s: number, row: any) => s + (row.premium || 0), 0))
    } else if (col.label === '上佣') {
      sums[idx] = fmt(data.reduce((s: number, row: any) => s + (row.upCommission || 0), 0))
    } else if (col.label === '下佣') {
      sums[idx] = fmt(data.reduce((s: number, row: any) => s + (row.downCommission || 0), 0))
    } else if (col.label === '净利润') {
      sums[idx] = fmt(data.reduce((s: number, row: any) => s + (row.profit || 0), 0))
    } else {
      sums[idx] = ''
    }
  })
  return sums
}

function fmt(v?: any) { return v ? Number(v).toFixed(2) : '0.00' }
function channelText(s: string) { return finDict(s, 'fin_partner_type') }
function channelTag(s: string) { return finDictItem(s, 'fin_partner_type').type }
onMounted(load)
</script>