<template>
  <div class="app-container">
    <!-- 统计卡片 -->
    <el-row :gutter="16" class="mb16">
      <el-col :span="6" v-for="card in cards" :key="card.label">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-inner">
            <div class="stat-icon" :style="{ background: card.color }">
              <el-icon :size="26"><component :is="card.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ card.value }}</div>
              <div class="stat-label">{{ card.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 趋势图 -->
    <el-row :gutter="16">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>订单核销趋势（近14天）</span></template>
          <div ref="orderChartRef" style="height: 320px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>保险台账保费/利润（近14天）</span></template>
          <div ref="ledgerChartRef" style="height: 320px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="mt16">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>粉丝区县分布</span></template>
          <div ref="mapChartRef" style="height: 320px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>业务数据一览</span></template>
          <el-table :data="statRows" size="small" border>
            <el-table-column prop="label" label="指标" />
            <el-table-column prop="value" label="数值" align="right" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts" name="Dashboard">
import * as echarts from 'echarts'
import request from "@/utils/request"

const orderChartRef = ref<HTMLElement>()
const ledgerChartRef = ref<HTMLElement>()
const mapChartRef = ref<HTMLElement>()

const stat = ref<any>({})
const cards = ref<any[]>([])
const statRows = ref<any[]>([])

const { proxy } = getCurrentInstance()

function loadStat() {
  request({ url: '/wx/dashboard/stat', method: 'get' }).then((res: any) => {
    stat.value = res.data || {}
    cards.value = [
      { label: '粉丝总数', value: stat.value.fans ?? 0, icon: 'User', color: '#409EFF' },
      { label: '已核销订单', value: stat.value.verified ?? 0, icon: 'CircleCheck', color: '#67C23A' },
      { label: '核销金额(¥)', value: stat.value.verified_amount ?? 0, icon: 'Money', color: '#E6A23C' },
      { label: '台账保费(¥)', value: stat.value.ledger_premium ?? 0, icon: 'Wallet', color: '#F56C6C' },
    ]
    statRows.value = [
      { label: '活跃粉丝', value: stat.value.fans_active ?? 0 },
      { label: '业务订单', value: stat.value.orders ?? 0 },
      { label: '台账笔数', value: stat.value.ledger_count ?? 0 },
      { label: '台账利润(¥)', value: stat.value.ledger_profit ?? 0 },
      { label: '分销积分', value: stat.value.dist_points ?? 0 },
      { label: '消息发送成功', value: stat.value.msg_sent ?? 0 },
      { label: '消息发送失败', value: stat.value.msg_failed ?? 0 },
      { label: '上游已结算', value: stat.value.ledger_up_settled ?? 0 },
      { label: '下游已结算', value: stat.value.ledger_down_settled ?? 0 },
    ]
  })
}

function renderOrderChart() {
  request({ url: '/wx/dashboard/orderTrend?days=14', method: 'get' }).then((res: any) => {
    const rows: any[] = res.data || []
    const chart = echarts.init(orderChartRef.value!)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 50, right: 20, top: 30, bottom: 30 },
      xAxis: { type: 'category', data: rows.map(r => String(r.d).slice(0, 10)) },
      yAxis: [
        { type: 'value', name: '笔数' },
        { type: 'value', name: '金额' }
      ],
      series: [
        { name: '核销笔数', type: 'line', smooth: true, data: rows.map(r => r.cnt), itemStyle: { color: '#409EFF' }, areaStyle: { opacity: 0.1 } },
        { name: '核销金额', type: 'bar', yAxisIndex: 1, data: rows.map(r => r.amt), itemStyle: { color: '#E6A23C' } }
      ]
    })
  })
}

function renderLedgerChart() {
  request({ url: '/wx/dashboard/ledgerTrend?days=14', method: 'get' }).then((res: any) => {
    const rows: any[] = res.data || []
    const chart = echarts.init(ledgerChartRef.value!)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 60, right: 60, top: 30, bottom: 30 },
      xAxis: { type: 'category', data: rows.map(r => String(r.d).slice(0, 10)) },
      yAxis: [
        { type: 'value', name: '保费' },
        { type: 'value', name: '利润' }
      ],
      series: [
        { name: '保费', type: 'bar', data: rows.map(r => r.premium), itemStyle: { color: '#409EFF' } },
        { name: '利润', type: 'line', smooth: true, yAxisIndex: 1, data: rows.map(r => r.profit), itemStyle: { color: '#F56C6C' } }
      ]
    })
  })
}

function renderMapChart() {
  request({ url: '/wx/dashboard/map?table=wx_mp_user&column=city', method: 'get' }).then((res: any) => {
    const rows: any[] = res.data || []
    const chart = echarts.init(mapChartRef.value!)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 80, right: 20, top: 20, bottom: 60 },
      xAxis: { type: 'category', data: rows.map(r => r.name), axisLabel: { rotate: 30 } },
      yAxis: { type: 'value' },
      series: [{ name: '粉丝数', type: 'bar', data: rows.map(r => r.value), itemStyle: { color: '#67C23A' } }]
    })
  })
}

onMounted(() => {
  loadStat()
  renderOrderChart()
  renderLedgerChart()
  renderMapChart()
})

onBeforeUnmount(() => {
  echarts.dispose(orderChartRef.value as HTMLElement)
  echarts.dispose(ledgerChartRef.value as HTMLElement)
  echarts.dispose(mapChartRef.value as HTMLElement)
})
</script>

<style scoped>
.mb16 { margin-bottom: 16px; }
.mt16 { margin-top: 16px; }
.stat-card :deep(.el-card__body) { padding: 16px; }
.stat-inner { display: flex; align-items: center; gap: 14px; }
.stat-icon {
  width: 56px; height: 56px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; color: #fff;
}
.stat-value { font-size: 24px; font-weight: 700; line-height: 1.2; color: #303133; }
.stat-label { font-size: 13px; color: #909399; margin-top: 4px; }
</style>
