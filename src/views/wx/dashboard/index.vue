<template>
  <div class="dashboard">
    <!-- 大屏头部 -->
    <div class="screen-head">
      <div class="head-title">
        <span class="title-glow">先知·智源管理系统</span>
        <span class="title-sep">·</span>
        <span class="title-sub">数据大屏</span>
      </div>
      <div class="head-time">
        <span class="time-date">{{ fmtDate }}</span>
        <span class="time-clock">{{ fmtTime }}</span>
        <span class="time-week">{{ fmtWeek }}</span>
      </div>
    </div>

    <div class="screen-body">
      <!-- ===== 左翼：核心指标 + 区县联动 ===== -->
      <div class="left-col">
        <div class="panel">
          <div class="panel-title">核心指标</div>
          <div class="stat-grid">
            <div v-for="card in cards" :key="card.label" class="stat-item" :style="{ '--stat': card.color }">
              <div class="stat-icon" :style="{ background: card.color + '22', color: card.color, borderColor: card.color + '55' }">
                <el-icon :size="18"><component :is="card.icon" /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ card.value }}</div>
                <div class="stat-label">{{ card.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 区县粉丝分布（联动） -->
        <div class="panel panel-grow">
          <div class="panel-title">
            区县粉丝分布
            <span class="panel-tip">点击联动地图</span>
          </div>
          <div v-loading="mapLoading" class="county-list">
            <div
              v-for="row in countyRows"
              :key="row.name"
              class="county-item"
              :class="{ active: row.name === selectedCounty }"
              @click="selectedCounty = row.name"
            >
              <span class="county-name">{{ row.name }}</span>
              <div class="county-bar">
                <div class="county-bar-inner" :style="{ width: pct(row.value) + '%' }"></div>
              </div>
              <span class="county-val">{{ row.value }}</span>
            </div>
            <div v-if="!countyRows.length" class="county-empty">暂无区县数据</div>
          </div>
        </div>
      </div>

      <!-- ===== 中央：3D 石家庄地图（最大） ===== -->
      <div class="center-col">
        <div class="panel map-panel">
          <div class="panel-title">
            <span class="map-title-mark"></span>
            石家庄市粉丝区域分布
            <span class="panel-tip">拖拽旋转 · 滚轮缩放 · 点击区县</span>
          </div>
          <div class="map-host-wrap">
            <ShijiazhuangThreeMap :selected="selectedCounty" :drill-name="selectedCounty" @select="onMapSelect" />
          </div>
        </div>
      </div>

      <!-- ===== 右翼：趋势 + 类型分布 ===== -->
      <div class="right-col">
        <div class="panel panel-half">
          <div class="panel-title">
            流水趋势
            <el-radio-group v-model="trendDays" size="small" class="trend-radio" @change="loadFlowTrend">
              <el-radio-button :value="7">7天</el-radio-button>
              <el-radio-button :value="30">30天</el-radio-button>
            </el-radio-group>
          </div>
          <div ref="flowChartRef" class="chart-box"></div>
        </div>
        <div class="panel panel-half">
          <div class="panel-title">台账类型分布</div>
          <div ref="typeChartRef" class="chart-box"></div>
        </div>
      </div>

      <!-- ===== 底部横板：待办 + 最近流水 + 扫码动态 ===== -->
      <div class="bottom-col">
        <div class="panel">
          <div class="panel-title">待办提醒</div>
          <div class="todo-list">
            <div v-for="t in todoRows" :key="t.label" class="todo-row">
              <span class="todo-label">{{ t.label }}</span>
              <b class="todo-val" :class="t.value > 0 ? 'warn' : 'ok'">{{ t.value }}</b>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-title">
            最近流水
            <span class="panel-tip">最新 {{ recentFlows.length }} 笔</span>
          </div>
          <el-table :data="recentFlows" size="small" height="100%" class="dark-table">
            <el-table-column prop="ledger_no" label="流水号" min-width="150" show-overflow-tooltip />
            <el-table-column prop="type" label="类型" width="80">
              <template #default="{ row }">
                <span class="type-tag" :class="'t' + row.type">{{ typeName(row.type) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="phone" label="手机号" width="120" />
            <el-table-column label="金额" width="95" align="right">
              <template #default="{ row }">
                <span :class="row.direction === '1' ? 'amt-out' : 'amt-in'">
                  {{ row.direction === '1' ? '-' : '+' }}{{ Math.abs(Number(row.amount) || 0) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="积分" width="70" align="right">
              <template #default="{ row }">
                <span class="pts">{{ row.points }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="occurred_time" label="时间" width="140" />
          </el-table>
        </div>

        <div class="panel">
          <div class="panel-title">
            扫码动态
            <span class="panel-tip">实时</span>
          </div>
          <div class="scan-list">
            <div v-for="log in scanLogs" :key="log.id" class="scan-item">
              <span class="scan-dot" :class="{ fresh: log.is_new_follow === '1' }"></span>
              <span class="scan-name">{{ log.nickname }}</span>
              <span class="scan-city">{{ log.city }}</span>
              <span class="scan-scene">#{{ log.scene_id }}</span>
              <span class="scan-time">{{ log.scan_time }}</span>
            </div>
            <div v-if="!scanLogs.length" class="scan-empty">暂无扫码记录</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="MpDashboard">
import * as echarts from 'echarts'
import request from "@/utils/request"
import ShijiazhuangThreeMap from "./components/ShijiazhuangThreeMap.vue"

const flowChartRef = ref<HTMLElement>()
const typeChartRef = ref<HTMLElement>()

const stat = ref<any>({})
const cards = ref<any[]>([])
const recentFlows = ref<any[]>([])
const todoRows = ref<any[]>([])
const scanLogs = ref<any[]>([])
const trendDays = ref<number>(30)
const selectedCounty = ref<string>("")
const countyRows = ref<any[]>([])
const mapLoading = ref<boolean>(false)
const maxCounty = computed(() => Math.max(1, ...countyRows.value.map((r) => Number(r.value) || 0)))
function pct(v: any) {
  return maxCounty.value > 0 ? Math.round((Number(v) || 0) / maxCounty.value * 100) : 0
}

/* 大屏时钟 */
const now = ref(new Date())
let clockTimer: ReturnType<typeof setInterval> | undefined
const WEEK = ['日', '一', '二', '三', '四', '五', '六']
const pad = (n: number) => String(n).padStart(2, '0')
const fmtDate = computed(() => `${now.value.getFullYear()}-${pad(now.value.getMonth() + 1)}-${pad(now.value.getDate())}`)
const fmtTime = computed(() => `${pad(now.value.getHours())}:${pad(now.value.getMinutes())}:${pad(now.value.getSeconds())}`)
const fmtWeek = computed(() => `星期${WEEK[now.value.getDay()]}`)

const TYPE_NAMES: Record<string, string> = {
  '1': '核销', '2': '分销积分', '3': '模板推送', '4': '扫码', '5': '绑定'
}
function typeName(t: string) { return TYPE_NAMES[t] || ('类型' + t) }

/* 大屏暗色图表配色 */
const DARK_TOOLTIP = {
  backgroundColor: 'rgba(8, 20, 40, 0.92)',
  borderColor: 'rgba(77, 163, 255, 0.35)',
  textStyle: { color: '#cfe3ff' },
}
const PIE_COLORS = ['#4da3ff', '#3ec9a7', '#ffc94d', '#ff6b81', '#a78bfa']

function loadStat() {
  request({ url: '/wx/dashboard/mpStat', method: 'get' }).then((res: any) => {
    stat.value = res.data || {}
    cards.value = [
      { label: '粉丝总数', value: stat.value.fans ?? 0, icon: 'User', color: '#4da3ff' },
      { label: '今日核销(¥)', value: stat.value.verify_amount_today ?? 0, icon: 'CircleCheck', color: '#3ec9a7' },
      { label: '今日推送(条)', value: stat.value.msg_today ?? 0, icon: 'Message', color: '#ffc94d' },
      { label: '本月利润(¥)', value: stat.value.profit_month ?? 0, icon: 'Wallet', color: '#ff6b81' },
    ]
    todoRows.value = [
      { label: '今日推送失败', value: stat.value.msg_failed_today ?? 0 },
      { label: '待发送队列', value: stat.value.msg_pending_today ?? 0 },
      { label: '今日扫码', value: stat.value.scan_today ?? 0 },
      { label: '今日新增粉丝', value: stat.value.fans_today ?? 0 },
      { label: '累计分销积分', value: stat.value.points_total ?? 0 },
      { label: '本月新增粉丝', value: stat.value.fans_month ?? 0 },
    ]
  })
}

function loadFlowTrend() {
  request({ url: `/wx/dashboard/flowTrend?days=${trendDays.value}`, method: 'get' }).then((res: any) => {
    const rows: any[] = res.data || []
    const chart = echarts.init(flowChartRef.value!)
    chart.setOption({
      tooltip: { trigger: 'axis', ...DARK_TOOLTIP },
      legend: { data: ['流入金额', '流出金额', '笔数'], top: 0, textStyle: { color: '#8fb3d9', fontSize: 10 } },
      grid: { left: 40, right: 34, top: 30, bottom: 20 },
      xAxis: {
        type: 'category', data: rows.map(r => String(r.d).slice(5)),
        axisLine: { lineStyle: { color: 'rgba(77,163,255,0.35)' } },
        axisLabel: { color: '#7fa3c7', fontSize: 10 },
      },
      yAxis: [
        {
          type: 'value', name: '金额', nameTextStyle: { color: '#7fa3c7', fontSize: 10 },
          axisLabel: { color: '#7fa3c7', fontSize: 10 },
          splitLine: { lineStyle: { color: 'rgba(63,110,160,0.22)' } },
        },
        {
          type: 'value', name: '笔数', nameTextStyle: { color: '#7fa3c7', fontSize: 10 },
          axisLabel: { color: '#7fa3c7', fontSize: 10 },
          splitLine: { show: false },
        }
      ],
      series: [
        { name: '流入金额', type: 'bar', stack: 'amt', data: rows.map(r => r.amt_in), itemStyle: { color: '#3ec9a7' } },
        { name: '流出金额', type: 'bar', stack: 'amt', data: rows.map(r => r.amt_out), itemStyle: { color: '#ff6b81' } },
        { name: '笔数', type: 'line', yAxisIndex: 1, data: rows.map(r => r.cnt), itemStyle: { color: '#ffc94d' }, smooth: true }
      ]
    })
  })
}

function loadTypeDist() {
  request({ url: '/wx/dashboard/typeDist', method: 'get' }).then((res: any) => {
    const rows: any[] = res.data || []
    const chart = echarts.init(typeChartRef.value!)
    chart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c} 笔 ({d}%)', ...DARK_TOOLTIP },
      legend: { bottom: 0, textStyle: { color: '#8fb3d9', fontSize: 10 }, itemWidth: 10, itemHeight: 10 },
      series: [{
        type: 'pie', radius: ['34%', '58%'], center: ['50%', '42%'],
        itemStyle: { borderRadius: 4, borderColor: '#0a1628', borderWidth: 2 },
        label: { color: '#cfe3ff', formatter: '{b}\n{c}笔', fontSize: 10 },
        labelLine: { lineStyle: { color: 'rgba(63,110,160,0.6)' } },
        data: rows.map((r, i) => ({
          name: typeName(r.type),
          value: Number(r.cnt),
          itemStyle: { color: PIE_COLORS[i % PIE_COLORS.length] }
        }))
      }]
    })
  })
}

function loadRecentFlows() {
  request({ url: '/wx/dashboard/recentFlows?limit=6', method: 'get' }).then((res: any) => {
    recentFlows.value = res.data || []
  })
}

function loadScanLogs() {
  request({ url: '/wx/dashboard/scanLogs?limit=6', method: 'get' }).then((res: any) => {
    scanLogs.value = res.data || []
  })
}

/** 区县粉丝分布（地图 + 列表联动） */
function loadCountyDist() {
  mapLoading.value = true
  request({ url: '/wx/dashboard/map', method: 'get' }).then((res: any) => {
    countyRows.value = (res.data || []).filter((r: any) => r.name)
  }).finally(() => { mapLoading.value = false })
}

/** 点击地图区县 → 左侧联动 */
function onMapSelect(name: string) {
  selectedCounty.value = name
}

function resizeCharts() {
  flowChartRef.value && echarts.getInstanceByDom(flowChartRef.value)?.resize()
  typeChartRef.value && echarts.getInstanceByDom(typeChartRef.value)?.resize()
}

onMounted(() => {
  loadStat()
  loadFlowTrend()
  loadTypeDist()
  loadRecentFlows()
  loadScanLogs()
  loadCountyDist()
  clockTimer = setInterval(() => { now.value = new Date() }, 1000)
  window.addEventListener('resize', resizeCharts)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
  window.removeEventListener('resize', resizeCharts)
})
</script>

<style scoped>
/* ========== 大屏整体：满尺寸一屏，无滚动 ========== */
.dashboard {
  height: calc(100vh - 84px);
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 10px 14px 12px;
  background:
    radial-gradient(1200px 500px at 50% -10%, rgba(77, 163, 255, 0.10), transparent 60%),
    linear-gradient(160deg, #060f20 0%, #0a1a33 55%, #0c1f3d 100%);
  border-radius: 12px;
  color: #cfe3ff;
}

/* 大屏头部 */
.screen-head {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6px 10px;
}
.head-title { font-size: 20px; font-weight: 700; letter-spacing: 2px; }
.title-glow {
  color: #eaf4ff;
  text-shadow: 0 0 18px rgba(77, 163, 255, 0.55), 0 0 42px rgba(77, 163, 255, 0.25);
}
.title-sep { color: #3a5f8a; margin: 0 10px; }
.title-sub { color: #4da3ff; letter-spacing: 4px; }
.head-time { display: flex; align-items: center; gap: 12px; font-size: 13px; color: #8fb3d9; }
.time-clock {
  font-size: 20px; font-weight: 700; color: #4da3ff;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 14px rgba(77, 163, 255, 0.4);
}

/* 主体栅格：左 216 | 中央自适应(最大) | 右 236；底部横板 */
.screen-body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 216px minmax(0, 1fr) 236px;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 12px;
}
.left-col, .right-col { display: flex; flex-direction: column; gap: 12px; min-width: 0; min-height: 0; }
.center-col { min-width: 0; min-height: 0; }

/* 面板 */
.panel {
  background: rgba(10, 26, 51, 0.72);
  border: 1px solid rgba(77, 163, 255, 0.22);
  border-radius: 10px;
  box-shadow: inset 0 0 24px rgba(77, 163, 255, 0.05), 0 4px 18px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.panel-title {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 700;
  color: #eaf4ff;
  letter-spacing: 1px;
  background: linear-gradient(90deg, rgba(77, 163, 255, 0.16), rgba(77, 163, 255, 0.02));
  border-bottom: 1px solid rgba(77, 163, 255, 0.16);
}
.map-title-mark {
  width: 4px; height: 13px; border-radius: 2px;
  background: linear-gradient(180deg, #4da3ff, #3ec9a7);
  box-shadow: 0 0 8px rgba(77, 163, 255, 0.8);
}
.panel-tip { margin-left: auto; font-size: 10px; font-weight: 400; color: #5f82a8; letter-spacing: 0; }

/* ========== 核心指标 2x2 ========== */
.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding: 8px;
}
.stat-item {
  --stat: #4da3ff;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  border-radius: 8px;
  background: rgba(77, 163, 255, 0.06);
  border: 1px solid rgba(77, 163, 255, 0.12);
  transition: border-color 0.2s;
}
.stat-item:hover { border-color: var(--stat); }
.stat-icon {
  width: 28px; height: 28px; border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid;
  flex-shrink: 0;
}
.stat-value {
  font-size: 15px; font-weight: 800; color: #eaf4ff; line-height: 1.15;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 12px color-mix(in srgb, var(--stat) 55%, transparent);
}
.stat-label { font-size: 9px; color: #7fa3c7; margin-top: 1px; white-space: nowrap; }

/* ========== 区县联动列表 ========== */
.panel-grow { flex: 1; min-height: 0; }
.county-list { flex: 1; overflow: auto; padding: 4px 8px 8px; min-height: 170px; }
.county-item {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 6px; margin-bottom: 3px;
  border-radius: 6px; cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.2s, border-color 0.2s;
}
.county-item:hover { background: rgba(77, 163, 255, 0.10); }
.county-item.active {
  background: rgba(77, 163, 255, 0.16);
  border-color: rgba(77, 163, 255, 0.45);
  box-shadow: 0 0 12px rgba(77, 163, 255, 0.15);
}
.county-name { width: 58px; font-size: 12px; color: #cfe3ff; font-weight: 600; flex-shrink: 0; }
.county-item.active .county-name { color: #fff; }
.county-bar {
  flex: 1; height: 5px; border-radius: 3px;
  background: rgba(77, 163, 255, 0.14);
  overflow: hidden;
}
.county-bar-inner {
  height: 100%; border-radius: 3px;
  background: linear-gradient(90deg, #4da3ff, #3ec9a7);
  box-shadow: 0 0 8px rgba(77, 163, 255, 0.5);
  transition: width 0.4s ease;
}
.county-val { width: 26px; text-align: right; font-size: 11px; color: #8fb3d9; font-variant-numeric: tabular-nums; }
.county-empty { text-align: center; color: #5f82a8; padding: 20px 0; font-size: 12px; }

/* ========== 中央地图 ========== */
.map-panel { height: 100%; }
.map-host-wrap {
  position: relative;
  flex: 1;
  min-height: 0;
  margin: 8px;
  border-radius: 8px;
  background: #050b05;
  overflow: hidden;
  border: 1px solid rgba(62, 201, 167, 0.18);
  box-shadow: 0 0 26px rgba(0, 0, 0, 0.5), inset 0 0 40px rgba(62, 201, 167, 0.05);
}

/* ========== 右翼图表 ========== */
.panel-half { flex: 1; min-height: 0; }
.chart-box { flex: 1; min-height: 0; padding: 4px 4px 0; }
.trend-radio { margin-left: auto; }
.trend-radio :deep(.el-radio-button__inner) {
  background: rgba(10, 26, 51, 0.8); border-color: rgba(77, 163, 255, 0.3);
  color: #7fa3c7; font-size: 10px; padding: 4px 8px;
}
.trend-radio :deep(.el-radio-button.is-active .el-radio-button__inner) {
  background: #4da3ff; border-color: #4da3ff; color: #fff;
}

/* ========== 底部横板 ========== */
.bottom-col {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr) 330px;
  gap: 12px;
  min-height: 0;
}
.bottom-col .panel { height: 150px; }

/* 待办 */
.todo-list { flex: 1; overflow: auto; padding: 6px 12px 8px; }
.todo-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 5px 2px; border-bottom: 1px dashed rgba(77, 163, 255, 0.12);
  font-size: 12px;
}
.todo-row:last-child { border-bottom: none; }
.todo-label { color: #9db9d9; }
.todo-val {
  min-width: 24px; text-align: center; padding: 1px 7px; border-radius: 10px;
  font-size: 12px; font-variant-numeric: tabular-nums;
}
.todo-val.warn { color: #ffc94d; background: rgba(255, 201, 77, 0.12); }
.todo-val.ok { color: #3ec9a7; background: rgba(62, 201, 167, 0.10); }

/* 流水表 */
.dark-table {
  background: transparent;
  flex: 1;
  min-height: 0;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(77, 163, 255, 0.10);
  --el-table-header-text-color: #cfe1ff;
  --el-table-text-color: #cfe3ff;
  --el-table-border-color: rgba(63, 110, 160, 0.28);
  --el-table-row-hover-bg-color: rgba(77, 163, 255, 0.10);
}
.dark-table :deep(th.el-table__cell) {
  background-color: rgba(77, 163, 255, 0.10) !important;
  color: #cfe1ff !important;
  font-weight: 600;
  border-bottom: 1px solid rgba(63, 110, 160, 0.28) !important;
}
.dark-table :deep(.el-table__inner-wrapper) { height: 100%; }
.dark-table :deep(.el-table__inner-wrapper::before) { background: rgba(63, 110, 160, 0.28); }
.type-tag {
  display: inline-block; padding: 1px 7px; border-radius: 9px;
  font-size: 11px;
}
.type-tag { color: #cfe1ff; background: rgba(120, 168, 224, 0.10); border: 1px solid rgba(120, 168, 224, 0.22); }
.amt-out { color: #ff6b81; font-weight: 600; }
.amt-in { color: #3ec9a7; font-weight: 600; }
.pts { color: #ffc94d; }

/* 扫码动态 */
.scan-list { flex: 1; overflow: auto; padding: 6px 12px 8px; }
.scan-item {
  display: flex; align-items: center; gap: 8px;
  padding: 5px 2px; border-bottom: 1px dashed rgba(77, 163, 255, 0.12);
  font-size: 12px;
}
.scan-item:last-child { border-bottom: none; }
.scan-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #4da3ff; flex-shrink: 0;
  box-shadow: 0 0 6px rgba(77, 163, 255, 0.8);
}
.scan-dot.fresh {
  background: #3ec9a7;
  box-shadow: 0 0 6px rgba(62, 201, 167, 0.9);
  animation: dotPulse 1.6s ease-in-out infinite;
}
@keyframes dotPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.6; }
}
.scan-name { color: #eaf4ff; font-weight: 600; max-width: 72px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.scan-city { color: #7fa3c7; font-size: 11px; }
.scan-scene { color: #4da3ff; font-size: 11px; margin-left: auto; }
.scan-time { color: #5f82a8; font-size: 11px; font-variant-numeric: tabular-nums; }
.scan-empty { text-align: center; color: #5f82a8; padding: 20px 0; font-size: 12px; }

/* ========== 加载遮罩暗色 ========== */
:deep(.el-loading-mask) { background-color: rgba(6, 15, 32, 0.6); }

/* 响应式兜底 */
@media (max-width: 1200px) {
  .screen-body { grid-template-columns: 200px minmax(0, 1fr); }
  .right-col { grid-column: 1 / -1; flex-direction: row; }
  .right-col .panel { flex: 1; }
}
</style>
