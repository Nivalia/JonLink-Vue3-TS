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
    <el-row :gutter="16">
      <el-col :span="8">
        <h3>资产</h3>
        <el-table :data="data.assets" border size="small">
          <el-table-column prop="subjectCode" label="编码" width="80" />
          <el-table-column prop="subjectName" label="科目" min-width="120" />
          <el-table-column prop="balance" label="余额" width="100" align="right">
            <template #default="{row}">{{ fmt(row.balance) }}</template>
          </el-table-column>
        </el-table>
        <div class="section-total">资产合计: <b>{{ fmt(assetTotal) }}</b></div>
      </el-col>
      <el-col :span="8">
        <h3>负债</h3>
        <el-table :data="data.liabilities" border size="small">
          <el-table-column prop="subjectCode" label="编码" width="80" />
          <el-table-column prop="subjectName" label="科目" min-width="120" />
          <el-table-column prop="balance" label="余额" width="100" align="right">
            <template #default="{row}">{{ fmt(row.balance) }}</template>
          </el-table-column>
        </el-table>
        <div class="section-total">负债合计: <b>{{ fmt(liabTotal) }}</b></div>
      </el-col>
      <el-col :span="8">
        <h3>所有者权益</h3>
        <el-table :data="data.equity" border size="small">
          <el-table-column prop="subjectCode" label="编码" width="80" />
          <el-table-column prop="subjectName" label="科目" min-width="120" />
          <el-table-column prop="balance" label="余额" width="100" align="right">
            <template #default="{row}">{{ fmt(row.balance) }}</template>
          </el-table-column>
        </el-table>
        <div class="section-total">权益合计: <b>{{ fmt(equityTotal) }}</b></div>
      </el-col>
    </el-row>
    <div class="balance-check">
      资产 = 负债 + 权益 ? {{ fmt(assetTotal) }} = {{ fmt(liabTotal) }} + {{ fmt(equityTotal) }} →
      <b :class="Math.abs(assetTotal - liabTotal - equityTotal) < 0.01 ? 'ok' : 'err'">
        {{ Math.abs(assetTotal - liabTotal - equityTotal) < 0.01 ? '✓ 平衡' : '✗ 不平 (差 ' + fmt(assetTotal - liabTotal - equityTotal) + ')' }}
      </b>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { balanceSheet, listPeriodOptions } from '@/api/finance/report'

const periodCode = ref('')
const periodOptions = ref<any[]>([])
const loading = ref(false)
const data = reactive({ assets: [], liabilities: [], equity: [] })

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
  try { const r: any = await balanceSheet(periodCode.value); Object.assign(data, r.data || { assets: [], liabilities: [], equity: [] }) }
  finally { loading.value = false }
}
const sum = (arr: any[]) => arr.reduce((s, r) => s + Number(r.balance || 0), 0)
const assetTotal = computed(() => sum(data.assets))
const liabTotal = computed(() => sum(data.liabilities))
const equityTotal = computed(() => sum(data.equity))
function fmt(v?: any) { return v ? Number(v).toFixed(2) : '0.00' }

onMounted(() => {
  loadPeriodOptions().then(() => load())
})
</script>

<style scoped>
h3 { margin: 0 0 8px; }
.section-total { margin-top: 8px; text-align: right; }
.balance-check { margin-top: 24px; font-size: 16px; padding: 12px; background: #f5f7fa; border-radius: 4px; }
.ok { color: #67c23a; }
.err { color: #f56c6c; }
</style>