<template>
  <div class="home-dashboard">
    <!-- ===== 顶栏：标题 + 实时时钟 ===== -->
    <div class="screen-head">
      <div class="head-left">
        <span class="title-mark"></span>
        <h2 class="title-main">先知·智源管理系统·指挥中心</h2>
        <span class="title-sub">公众号 · 保险台账 汇总</span>
      </div>
      <div class="head-time">
        <span class="time-date">{{ fmtDate }}</span>
        <span class="time-clock">{{ fmtTime }}</span>
        <span class="time-week">{{ fmtWeek }}</span>
      </div>
    </div>

    <div class="screen-body">
      <!-- ===== 左翼：核心指标 + 区县 TOP + 待办 ===== -->
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

        <div class="panel panel-grow">
          <div class="panel-title">
            区县粉丝 TOP
            <span class="panel-tip">点击联动地图</span>
          </div>
          <div v-loading="mapLoading" class="county-list">
            <div
              v-for="row in topDistricts"
              :key="row.name"
              class="county-item"
              :class="{ active: row.name === selectedCounty }"
              @click="selectedCounty = row.name"
            >
              <span class="county-name">{{ row.name }}</span>
              <div class="county-bar">
                <div class="county-bar-inner" :style="{ width: pct(row.cnt) + '%' }"></div>
              </div>
              <span class="county-val">{{ row.cnt }}</span>
            </div>
            <div v-if="!topDistricts.length" class="county-empty">暂无区县数据</div>
          </div>
        </div>
      </div>

      <!-- ===== 中央：3D 石家庄地图 ===== -->
      <div class="center-col">
        <div class="panel map-panel">
          <div class="panel-title">
            <span class="map-title-mark"></span>
            石家庄市粉丝区域分布
            <span class="panel-tip">拖拽旋转 · 滚轮缩放 · 点击区县</span>
          </div>
          <div class="map-host-wrap">
            <ShijiazhuangThreeMap v-if="mapReady" :selected="selectedCounty" :drill-name="selectedCounty" @select="onMapSelect" />
            <div v-else class="map-loading">
              <div class="spinner"></div>
              <div>地图加载中…</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 右翼：台账趋势 + 险种占比 + 系统公告 ===== -->
      <div class="right-col">
        <div class="panel panel-half">
          <div class="panel-title">
            台账保费/利润
            <el-radio-group v-model="ledgerDays" size="small" class="trend-radio" @change="loadLedgerTrend">
              <el-radio-button :value="7">7天</el-radio-button>
              <el-radio-button :value="14">14天</el-radio-button>
              <el-radio-button :value="30">30天</el-radio-button>
            </el-radio-group>
          </div>
          <div ref="ledgerChartRef" class="chart-box"></div>
        </div>
        <div class="panel panel-half">
          <div class="panel-title">险种保费占比</div>
          <div ref="typeChartRef" class="chart-box"></div>
        </div>
        <div class="panel panel-notice">
          <div class="panel-title">
            系统公告
            <span class="panel-tip">最新 {{ notices.length }} 条</span>
          </div>
          <div class="notice-list">
            <div v-for="n in notices" :key="n.id" class="notice-item" :class="'t' + n.type">
              <span class="notice-type">{{ noticeType(n.type) }}</span>
              <span class="notice-title" :title="n.title">{{ n.title }}</span>
              <span class="notice-time">{{ n.create_time }}</span>
            </div>
            <div v-if="!notices.length" class="notice-empty">暂无公告</div>
          </div>
        </div>
      </div>

      <!-- ===== 底部横板：最近流水 + 扫码动态 ===== -->
      <div class="bottom-col">
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

<script setup lang="ts" name="Home">
import * as echarts from 'echarts'
import request from '@/utils/request'
// 地图组件按需加载, 不阻塞首页首屏（地图含 three.js + 22 区县 JSON, 几百 KB）
const ShijiazhuangThreeMap = defineAsyncComponent(() => import('@/views/wx/dashboard/components/ShijiazhuangThreeMap.vue'))

const ledgerChartRef = ref<HTMLElement>()
const typeChartRef = ref<HTMLElement>()

const cards = ref<any[]>([])
const recentFlows = ref<any[]>([])
const scanLogs = ref<any[]>([])
const topDistricts = ref<any[]>([])
const notices = ref<any[]>([])
const ledgerDays = ref<number>(14)
const selectedCounty = ref<string>('')
const mapLoading = ref<boolean>(false)
const mapReady = ref<boolean>(false)
const maxDistrict = computed(() => Math.max(1, ...topDistricts.value.map((r) => Number(r.cnt) || 0)))
function pct(v: any) {
  return maxDistrict.value > 0 ? Math.round((Number(v) || 0) / maxDistrict.value * 100) : 0
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
  '1': '核销', '2': '分销积分', '3': '模板推送', '4': '扫码', '5': '绑定', '6': '冲正'
}
function typeName(t: string) { return TYPE_NAMES[t] || ('类型' + t) }

const NOTICE_TYPES: Record<string, string> = { '1': '通知', '2': '公告' }
function noticeType(t: string) { return NOTICE_TYPES[t] || '消息' }

const DARK_TOOLTIP = {
  backgroundColor: 'rgba(8, 20, 40, 0.92)',
  borderColor: 'rgba(77, 163, 255, 0.35)',
  textStyle: { color: '#cfe3ff' },
}
const PIE_COLORS = ['#4da3ff', '#3ec9a7', '#ffc94d', '#ff6b81', '#a78bfa']

function loadMpStat() {
  request({ url: '/wx/dashboard/mpStat', method: 'get' }).then((res: any) => {
    const s = res.data || {}
    cards.value = [
      { label: '粉丝总数', value: s.fans ?? 0, icon: 'User', color: '#4da3ff' },
      { label: '今日核销(¥)', value: s.verify_amount_today ?? 0, icon: 'CircleCheck', color: '#3ec9a7' },
      { label: '本月利润(¥)', value: s.profit_month ?? 0, icon: 'Wallet', color: '#ff6b81' },
      { label: '今日推送(条)', value: s.msg_today ?? 0, icon: 'Message', color: '#ffc94d' },
    ]
  })
}

function loadLedgerTrend() {
  request({ url: `/wx/dashboard/ledgerTrend?days=${ledgerDays.value}`, method: 'get' }).then((res: any) => {
    const rows: any[] = res.data || []
    if (!ledgerChartRef.value) return
    let chart = echarts.getInstanceByDom(ledgerChartRef.value)
    if (!chart) chart = echarts.init(ledgerChartRef.value)
    chart.setOption({
      animation: false,
      tooltip: { trigger: 'axis', ...DARK_TOOLTIP },
      legend: { data: ['保费', '利润', '笔数'], top: 0, textStyle: { color: '#8fb3d9', fontSize: 10 } },
      grid: { left: 36, right: 28, top: 32, bottom: 18, containLabel: true },
      xAxis: {
        type: 'category', data: rows.map(r => String(r.d).slice(5)),
        axisLine: { lineStyle: { color: 'rgba(77,163,255,0.35)' } },
        axisLabel: { color: '#7fa3c7', fontSize: 9, interval: 'auto' },
      },
      yAxis: [
        { type: 'value', name: '金额', nameTextStyle: { color: '#7fa3c7', fontSize: 9 },
          axisLabel: { color: '#7fa3c7', fontSize: 9, width: 50, overflow: 'truncate' },
          splitLine: { lineStyle: { color: 'rgba(63,110,160,0.22)' } } },
        { type: 'value', name: '笔数', nameTextStyle: { color: '#7fa3c7', fontSize: 9 },
          axisLabel: { color: '#7fa3c7', fontSize: 9 }, splitLine: { show: false } },
      ],
      series: [
        { name: '保费', type: 'bar', data: rows.map(r => r.premium || 0), itemStyle: { color: '#4da3ff' } },
        { name: '利润', type: 'bar', data: rows.map(r => r.profit || 0), itemStyle: { color: '#3ec9a7' } },
        { name: '笔数', type: 'line', yAxisIndex: 1, data: rows.map(r => r.cnt || 0), itemStyle: { color: '#ffc94d' }, smooth: true },
      ]
    })
  })
}

function loadTypeDist() {
  request({ url: '/wx/dashboard/typeDist', method: 'get' }).then((res: any) => {
    const rows: any[] = res.data || []
    if (!typeChartRef.value) return
    let chart = echarts.getInstanceByDom(typeChartRef.value)
    if (!chart) chart = echarts.init(typeChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c} 笔 ({d}%)', ...DARK_TOOLTIP },
      legend: { bottom: 0, textStyle: { color: '#8fb3d9', fontSize: 10 }, itemWidth: 10, itemHeight: 10 },
      series: [{
        type: 'pie', radius: ['28%', '52%'], center: ['50%', '44%'],
        itemStyle: { borderRadius: 3, borderColor: '#0a1628', borderWidth: 1 },
        label: { color: '#cfe3ff', formatter: '{b} {c}笔', fontSize: 9 },
        labelLine: { length: 6, length2: 6, lineStyle: { color: 'rgba(63,110,160,0.6)' } },
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

function loadTopDistrict() {
  mapLoading.value = true
  request({ url: '/wx/dashboard/topDistrict?limit=5', method: 'get' }).then((res: any) => {
    topDistricts.value = (res.data || []).filter((r: any) => r.name)
  }).finally(() => { mapLoading.value = false })
}

function loadNotice() {
  request({ url: '/wx/dashboard/notice?limit=3', method: 'get' }).then((res: any) => {
    notices.value = res.data || []
  })
}

function onMapSelect(name: string) { selectedCounty.value = name }

function resizeCharts() {
  ledgerChartRef.value && echarts.getInstanceByDom(ledgerChartRef.value)?.resize()
  typeChartRef.value && echarts.getInstanceByDom(typeChartRef.value)?.resize()
}

onMounted(() => {
  loadMpStat()
  loadLedgerTrend()
  loadTypeDist()
  loadRecentFlows()
  loadScanLogs()
  loadTopDistrict()
  loadNotice()
  // 异步加载地图 chunk（避免阻塞首屏 KPI/流水）
  import('@/views/wx/dashboard/components/ShijiazhuangThreeMap.vue').then(() => { mapReady.value = true })
  clockTimer = setInterval(() => { now.value = new Date() }, 1000)
  window.addEventListener('resize', resizeCharts)
  // 首次加载完成后确保 echarts 拿到正确高度（panel 可能在数据回来前 flex 还没稳定）
  setTimeout(resizeCharts, 50)
  setTimeout(resizeCharts, 300)
  setTimeout(resizeCharts, 800)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
  window.removeEventListener('resize', resizeCharts)
})
</script>

<style scoped>
/* ========== 大屏整体：满尺寸一屏，无滚动 ========== */
.home-dashboard {
  height: calc(100vh - 84px);
  margin: -16px;
  padding: 12px;
  background: linear-gradient(180deg, #050b05 0%, #0a121e 100%);
  color: #cfe3ff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.screen-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 12px 10px;
  border-bottom: 1px solid rgba(62, 201, 167, 0.18);
  margin-bottom: 10px;
}
.head-left { display: flex; align-items: center; gap: 10px; }
.title-mark {
  width: 4px; height: 22px;
  background: linear-gradient(180deg, #3ec9a7, #4da3ff);
  border-radius: 2px;
}
.title-main {
  margin: 0; font-size: 22px; font-weight: 600;
  color: #e7f3ff;
  letter-spacing: 2px;
  text-shadow: 0 0 12px rgba(77, 163, 255, 0.35);
}
.title-sub {
  font-size: 12px; color: #7fa3c7;
  padding: 2px 8px;
  background: rgba(77, 163, 255, 0.1);
  border: 1px solid rgba(77, 163, 255, 0.3);
  border-radius: 3px;
}
.head-time { display: flex; align-items: baseline; gap: 10px; font-size: 13px; }
.time-date { color: #7fa3c7; }
.time-clock { color: #3ec9a7; font-size: 22px; font-weight: 600; font-family: 'Consolas', monospace; }
.time-week { color: #7fa3c7; font-size: 12px; }

.screen-body {
  flex: 1;
  display: grid;
  grid-template-columns: 240px 1fr 240px;
  grid-template-rows: 1fr 170px;
  grid-template-areas:
    'left center right'
    'bottom bottom bottom';
  gap: 10px;
  min-height: 0;
}

/* ===== 面板通用 ===== */
.panel {
  background: rgba(10, 18, 30, 0.78);
  border: 1px solid rgba(62, 201, 167, 0.18);
  border-radius: 4px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  backdrop-filter: blur(4px);
}
.panel-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 600; color: #e7f3ff;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(77, 163, 255, 0.15);
  margin-bottom: 8px;
  flex-shrink: 0;
}
.panel-tip { margin-left: auto; font-size: 11px; color: #5d7a96; font-weight: normal; }
.panel-half { flex: 1; min-height: 90px; }
.panel-notice { flex: 0 0 110px; min-height: 0; }
.panel-grow { flex: 1; min-height: 0; }

/* ===== 三栏定位 ===== */
.left-col { grid-area: left; display: flex; flex-direction: column; gap: 10px; min-height: 0; }
.center-col { grid-area: center; display: flex; min-height: 0; }
.right-col { grid-area: right; display: flex; flex-direction: column; gap: 10px; min-height: 0; }
.bottom-col { grid-area: bottom; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; min-height: 0; }

/* ===== 指标卡 ===== */
.stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.stat-item {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 8px;
  background: rgba(15, 25, 40, 0.6);
  border: 1px solid rgba(77, 163, 255, 0.18);
  border-radius: 3px;
}
.stat-icon {
  width: 28px; height: 28px;
  border-radius: 3px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid;
  flex-shrink: 0;
}
.stat-info { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.stat-value { font-size: 16px; font-weight: 700; color: var(--stat, #4da3ff); font-family: 'Consolas', monospace; line-height: 1.1; }
.stat-label { font-size: 10px; color: #7fa3c7; }

/* ===== 区县列表 ===== */
.county-list { flex: 1; overflow-y: auto; min-height: 0; }
.county-item {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 4px;
  font-size: 12px;
  border-radius: 3px;
  cursor: pointer;
  transition: background 0.15s;
}
.county-item:hover { background: rgba(77, 163, 255, 0.08); }
.county-item.active { background: rgba(62, 201, 167, 0.15); }
.county-name { color: #cfe3ff; flex-shrink: 0; min-width: 60px; }
.county-bar { flex: 1; height: 6px; background: rgba(63, 110, 160, 0.22); border-radius: 3px; overflow: hidden; }
.county-bar-inner { height: 100%; background: linear-gradient(90deg, #3ec9a7, #4da3ff); border-radius: 3px; transition: width 0.3s; }
.county-val { color: #3ec9a7; font-weight: 600; min-width: 30px; text-align: right; font-family: 'Consolas', monospace; }
.county-empty { text-align: center; color: #5d7a96; font-size: 12px; padding: 20px 0; }

/* ===== 中央地图 ===== */
.center-col .panel { flex: 1; }
.map-title-mark {
  width: 4px; height: 14px; background: #3ec9a7; border-radius: 2px;
}
.map-host-wrap { flex: 1; position: relative; min-height: 0; overflow: hidden; }
.map-loading {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: #7fa3c7; font-size: 12px; gap: 12px;
  background: rgba(10,18,30,0.4);
}
.spinner {
  width: 32px; height: 32px;
  border: 3px solid rgba(77,163,255,0.2);
  border-top-color: #3ec9a7;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ===== 趋势图 / 饼图 ===== */
.chart-box { flex: 1; min-height: 80px; height: 100%; width: 100%; }
.trend-radio { margin-left: auto; }
.trend-radio :deep(.el-radio-button__inner) {
  background: rgba(10, 18, 30, 0.6);
  border-color: rgba(77, 163, 255, 0.25);
  color: #7fa3c7;
  font-size: 11px; padding: 4px 8px;
}
.trend-radio :deep(.el-radio-button__original:checked + .el-radio-button__inner) {
  background: rgba(62, 201, 167, 0.25); border-color: #3ec9a7; color: #3ec9a7;
}

/* ===== 公告 ===== */
.notice-list { flex: 1; overflow-y: auto; min-height: 0; }
.notice-item {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 4px;
  font-size: 12px;
  border-bottom: 1px dashed rgba(77, 163, 255, 0.1);
}
.notice-type {
  font-size: 10px; padding: 2px 6px; border-radius: 2px;
  background: rgba(77, 163, 255, 0.18); color: #4da3ff; flex-shrink: 0;
}
.notice-item.t2 .notice-type { background: rgba(255, 201, 77, 0.18); color: #ffc94d; }
.notice-title { color: #cfe3ff; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.notice-time { color: #5d7a96; font-size: 11px; flex-shrink: 0; font-family: 'Consolas', monospace; }
.notice-empty { text-align: center; color: #5d7a96; font-size: 12px; padding: 20px 0; }

/* ===== 底部表格 ===== */
.dark-table {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(15, 25, 40, 0.6);
  --el-table-border-color: rgba(77, 163, 255, 0.15);
  --el-table-text-color: #cfe3ff;
  --el-table-header-text-color: #7fa3c7;
  flex: 1;
}
.dark-table :deep(.el-table__inner-wrapper) { background: transparent; }
.dark-table :deep(.el-table__row:hover > td) { background: rgba(77, 163, 255, 0.08) !important; }
.dark-table :deep(th.el-table__cell) {
  background-color: rgba(77, 163, 255, 0.10) !important;
  color: #cfe1ff !important;
  font-weight: 600;
  border-bottom: 1px solid rgba(63, 110, 160, 0.28) !important;
}

.type-tag {
  display: inline-block;
  padding: 1px 6px;
  font-size: 10px;
  border-radius: 2px;
  background: rgba(77, 163, 255, 0.18);
  color: #4da3ff;
}
.type-tag.t1,.type-tag.t2,.type-tag.t3,.type-tag.t4,.type-tag.t5,.type-tag.t6 { background: rgba(120, 168, 224, 0.10); color: #cfe1ff; border: 1px solid rgba(120, 168, 224, 0.22); }

.amt-in { color: #3ec9a7; font-weight: 600; font-family: 'Consolas', monospace; }
.amt-out { color: #ff6b81; font-weight: 600; font-family: 'Consolas', monospace; }
.pts { color: #ffc94d; font-family: 'Consolas', monospace; }

/* ===== 扫码动态 ===== */
.scan-list { flex: 1; overflow-y: auto; min-height: 0; padding-right: 4px; }
.scan-item {
  display: grid;
  grid-template-columns: 12px 1fr auto auto auto;
  gap: 8px;
  align-items: center;
  padding: 6px 4px;
  font-size: 12px;
  border-bottom: 1px dashed rgba(77, 163, 255, 0.1);
}
.scan-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #4da3ff;
  box-shadow: 0 0 6px rgba(77, 163, 255, 0.6);
}
.scan-dot.fresh {
  background: #3ec9a7;
  animation: pulse 1.4s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 6px rgba(62, 201, 167, 0.6); }
  50% { box-shadow: 0 0 14px rgba(62, 201, 167, 1); }
}
.scan-name { color: #cfe3ff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.scan-city { color: #ffc94d; font-size: 11px; }
.scan-scene { color: #7fa3c7; font-size: 11px; font-family: 'Consolas', monospace; }
.scan-time { color: #5d7a96; font-size: 11px; font-family: 'Consolas', monospace; min-width: 90px; text-align: right; }
.scan-empty { text-align: center; color: #5d7a96; font-size: 12px; padding: 20px 0; }

/* ===== 滚动条 ===== */
.home-dashboard *::-webkit-scrollbar { width: 4px; height: 4px; }
.home-dashboard *::-webkit-scrollbar-track { background: transparent; }
.home-dashboard *::-webkit-scrollbar-thumb { background: rgba(77, 163, 255, 0.3); border-radius: 2px; }
.home-dashboard *::-webkit-scrollbar-thumb:hover { background: rgba(77, 163, 255, 0.5); }
</style>