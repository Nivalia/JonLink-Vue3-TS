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
      <el-table-column label="本期发生额" prop="amount" width="160" align="right">
        <template #default="{row}"><b :class="!row.subjectCode ? (row.amount >= 0 ? 'profit' : 'loss') : ''">{{ fmt(row.amount) }}</b></template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { incomeStatement, listPeriodOptions } from '@/api/finance/report'

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
  try { const r: any = await incomeStatement(periodCode.value); rows.value = r.data || [] }
  finally { loading.value = false }
}

function summaryMethod({ columns, data }: any) {
  const sums: string[] = []
  columns.forEach((col: any, idx: number) => {
    if (idx === 0) {
      sums[idx] = '合计'
    } else if (col.label === '本期发生额') {
      sums[idx] = fmt(data.reduce((s: number, row: any) => s + (row.amount || 0), 0))
    } else {
      sums[idx] = ''
    }
  })
  return sums
}

function fmt(v?: any) { return v ? Number(v).toFixed(2) : '0.00' }

onMounted(() => {
  loadPeriodOptions().then(() => load())
})
</script>

<style scoped>
.total { margin-top: 12px; font-size: 16px; }
.profit { color: #67c23a; }
.loss { color: #f56c6c; }
</style>