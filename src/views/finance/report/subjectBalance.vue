<template>
  <div class="app-container">
    <el-form :inline="true" label-width="80px">
      <el-form-item label="期间">
        <el-select v-model="periodCode" placeholder="请选择期间" filterable style="width:160px">
          <el-option v-for="item in periodOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item><el-button type="primary" icon="Search" @click="load">查询</el-button></el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="rows" border show-summary :summary-method="summaryMethod">
      <el-table-column label="科目编码" prop="subjectCode" width="100" />
      <el-table-column label="科目名称" prop="subjectName" min-width="180" />
      <el-table-column label="类别" prop="subjectType" width="80" align="center">
        <template #default="{row}">{{ typeText(row.subjectType) }}</template>
      </el-table-column>
      <el-table-column label="本期借方" prop="debitTotal" width="120" align="right">
        <template #default="{row}">{{ fmt(row.debitTotal) }}</template>
      </el-table-column>
      <el-table-column label="本期贷方" prop="creditTotal" width="120" align="right">
        <template #default="{row}">{{ fmt(row.creditTotal) }}</template>
      </el-table-column>
      <el-table-column label="期末余额" prop="endBalance" width="120" align="right">
        <template #default="{row}"><b>{{ fmt(row.endBalance) }}</b></template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { subjectBalance, listPeriodOptions } from '@/api/finance/report'
import { finDict } from '@/utils/financeDict'

const periodCode = ref('')
const periodOptions = ref<any[]>([])
const loading = ref(false)
const rows = ref<any[]>([])

// 加载期间选项
async function loadPeriodOptions() {
  try {
    const r: any = await listPeriodOptions()
    periodOptions.value = (r.data || []).map((p: any) => ({ label: p.periodCode, value: p.periodCode }))
    // 默认选择第一个
    if (periodOptions.value.length > 0) {
      periodCode.value = periodOptions.value[0].value
    }
  } catch (e) {
    periodOptions.value = []
  }
}

async function load() {
  if (!periodCode.value) return
  loading.value = true
  try { const r: any = await subjectBalance(periodCode.value); rows.value = r.data || [] }
  finally { loading.value = false }
}

function summaryMethod({ columns, data }: any) {
  const sums: string[] = []
  columns.forEach((col: any, idx: number) => {
    if (idx === 0) {
      sums[idx] = '合计'
    } else if (col.label === '本期借方') {
      sums[idx] = fmt(data.reduce((s: number, row: any) => s + (row.debitTotal || 0), 0))
    } else if (col.label === '本期贷方') {
      sums[idx] = fmt(data.reduce((s: number, row: any) => s + (row.creditTotal || 0), 0))
    } else if (col.label === '期末余额') {
      sums[idx] = fmt(data.reduce((s: number, row: any) => s + (row.endBalance || 0), 0))
    } else {
      sums[idx] = ''
    }
  })
  return sums
}

function fmt(v?: any) { return v ? Number(v).toFixed(2) : '0.00' }
function typeText(t: string) { return finDict(t, 'subject_type') }

onMounted(() => {
  loadPeriodOptions().then(() => load())
})
</script>