<template>
  <div class="notion-page">
    <header class="page-head">
      <div>
        <div class="lede">Command Center · 指挥中心</div>
        <h1>你好,<em>Stark</em><br>今天又是稳健的一天</h1>
      </div>
      <div class="meta">
        <span class="tag tag-green"><span class="dot"></span>实时</span>
        <span class="clock" style="font-variant-numeric:tabular-nums;">{{ fmtClock }}</span>
      </div>
    </header>

    <!-- Section 01: 核心 KPI -->
    <section class="section">
      <div class="section-label">Section 01 · 核心指标</div>
      <div class="bento">
        <div class="card kpi s-3">
          <div class="kpi-eyebrow"><span class="dot"></span>本月保费</div>
          <div class="kpi-num"><span class="currency">¥</span>{{ fmtNum(kpi.totalPremium) }}</div>
          <div class="kpi-foot"><span>保单 {{ kpi.totalPolicy ?? 0 }} 笔</span></div>
        </div>
        <div class="card kpi s-3">
          <div class="kpi-eyebrow"><span class="dot pos"></span>本月利润</div>
          <div class="kpi-num"><span class="currency">¥</span>{{ fmtNum(kpi.totalProfit) }}</div>
          <div class="kpi-foot"><span>利润率 {{ profitRate }}%</span></div>
        </div>
        <div class="card kpi s-3">
          <div class="kpi-eyebrow"><span class="dot pos"></span>公众号粉丝</div>
          <div class="kpi-num">{{ mpStat.fans ?? 0 }}</div>
          <div class="kpi-foot"><span>本月 +{{ mpStat.fans_month ?? 0 }}</span></div>
        </div>
        <div class="card kpi s-3">
          <div class="kpi-eyebrow"><span class="dot warn"></span>待结算保费</div>
          <div class="kpi-num"><span class="currency">¥</span>{{ fmtNum(kpi.unsettledPremium) }}</div>
          <div class="kpi-foot"><span>上游 {{ fmtNum(kpi.unsettledUpPremium) }} / 下游 {{ fmtNum(kpi.unsettledDownPremium) }}</span></div>
        </div>
      </div>
    </section>

    <!-- Section 02: 经营 KPI -->
    <section class="section">
      <div class="section-label">Section 02 · 经营指标</div>
      <div class="bento">
        <div class="card card-warm kpi s-3">
          <div class="kpi-eyebrow"><span class="dot pos"></span>续保率</div>
          <div class="kpi-num"><span>{{ renewal.renewal_rate ?? 0 }}</span><span class="unit">%</span></div>
          <div class="kpi-foot"><span>续保 {{ renewal.renewal_policies ?? 0 }} / {{ renewal.total_unique_policies ?? 0 }} 笔</span></div>
        </div>
        <div class="card card-warm kpi s-3">
          <div class="kpi-eyebrow"><span class="dot"></span>佣金收入</div>
          <div class="kpi-num"><span class="currency">¥</span>{{ fmtNum(commission.total_commission) }}</div>
          <div class="kpi-foot"><span>平均费率 {{ (commission.avg_rate * 100).toFixed(1) }}%</span></div>
        </div>
        <div class="card card-warm kpi s-3">
          <div class="kpi-eyebrow"><span class="dot"></span>退保率</div>
          <div class="kpi-num"><span>{{ surrender.surrender_rate_count ?? 0 }}</span><span class="unit">%</span></div>
          <div class="kpi-foot"><span>本月 {{ surrender.surrender_count ?? 0 }} / {{ surrender.total_policy ?? 0 }} 笔</span></div>
        </div>
        <div class="card card-warm kpi s-3">
          <div class="kpi-eyebrow"><span class="dot"></span>本月保单</div>
          <div class="kpi-num"><span>{{ kpi.totalPolicy ?? 0 }}</span><span class="unit">笔</span></div>
          <div class="kpi-foot"><span>活跃产品 {{ kpi.productActive ?? 0 }}</span></div>
        </div>
      </div>
    </section>

    <!-- Section 03: 趋势 + 险种 -->
    <section class="section">
      <div class="section-label">Section 03 · 趋势分析</div>
      <div class="bento">
        <div class="card s-8">
          <div class="card-head">
            <div>
              <div class="card-eyebrow">保费 & 利润</div>
              <div class="card-title">业务走势</div>
            </div>
            <div class="card-extra" style="display:flex;gap:8px;align-items:center;">
              <div style="display:inline-flex;gap:2px;border:1px solid var(--line);border-radius:var(--r-pill);padding:2px;">
                <button v-for="d in [7,14,30]" :key="d" class="btn btn-pill"
                  :style="trendDays===d?{background:'var(--fg)',color:'#fff'}:{}"
                  @click="trendDays=d;loadTrend()">{{ d }}D</button>
              </div>
            </div>
          </div>
          <div ref="trendRef" class="chart"></div>
        </div>
        <div class="card s-4">
          <div class="card-head">
            <div>
              <div class="card-eyebrow">险种</div>
              <div class="card-title">本月分布</div>
            </div>
          </div>
          <div ref="typeRef" class="chart"></div>
        </div>
      </div>
    </section>

    <!-- Section 04: 渠道 + 公众号运营 -->
    <section class="section">
      <div class="section-label">Section 04 · 渠道与公众号</div>
      <div class="bento">
        <div class="card s-5">
          <div class="card-head">
            <div>
              <div class="card-eyebrow">Channels</div>
              <div class="card-title">渠道贡献 TOP10</div>
            </div>
          </div>
          <div ref="channelRef" class="chart"></div>
        </div>
        <div class="card card-warm s-4">
          <div class="card-head">
            <div>
              <div class="card-eyebrow">WeChat</div>
              <div class="card-title">公众号运营指标</div>
            </div>
          </div>
          <div class="progress-list">
            <div class="progress-row"><div class="head"><span class="lbl">消息送达率</span><span class="val">{{ mpRate.msgRate }}%</span></div><div class="progress-bar"><div class="progress-fill green" :style="{width: mpRate.msgRate + '%'}"></div></div></div>
            <div class="progress-row"><div class="head"><span class="lbl">关注转化率</span><span class="val">{{ mpRate.followRate }}%</span></div><div class="progress-bar"><div class="progress-fill" :style="{width: mpRate.followRate + '%'}"></div></div></div>
            <div class="progress-row"><div class="head"><span class="lbl">本月新增粉丝</span><span class="val">{{ mpOps.fans_month ?? 0 }}</span></div><div class="progress-bar"><div class="progress-fill green" :style="{width: Math.min(mpOps.fans_month / Math.max(mpOps.fans, 1) * 100, 100) + '%'}"></div></div></div>
            <div class="progress-row"><div class="head"><span class="lbl">今日扫码</span><span class="val">{{ mpOps.scan_today ?? 0 }}</span></div><div class="progress-bar"><div class="progress-fill green" :style="{width: Math.min(mpOps.scan_today / Math.max(mpOps.scan_total, 1) * 100, 100) + '%'}"></div></div></div>
          </div>
        </div>
        <div class="card s-3">
          <div class="card-head">
            <div>
              <div class="card-eyebrow">Insurers</div>
              <div class="card-title">承保公司占比</div>
            </div>
          </div>
          <div ref="companyRef" class="chart-sm"></div>
        </div>
      </div>
    </section>

    <!-- Section 05: 流水 + 待办 + 业务员 + 公告 -->
    <section class="section">
      <div class="section-label">Section 05 · 实时动态</div>
      <div class="bento">
        <div class="card s-4">
          <div class="card-head">
            <div>
              <div class="card-eyebrow">Live</div>
              <div class="card-title">最近流水</div>
            </div>
          </div>
          <div class="list">
            <div v-for="f in recentFlows" :key="f.ledger_no" class="li">
              <div class="li-ico" :class="f.direction==='1'?'orange':'green'">{{ f.direction==='1'?'↓':'↑' }}</div>
              <div class="li-main">
                <div class="li-title">{{ typeName(f.type) }}</div>
                <div class="li-sub">{{ f.phone }}</div>
              </div>
              <span style="color:var(--fg-4);font-size:11px;">{{ (f.occurred_time||'').slice(11,16) }}</span>
              <span class="li-amt" :class="f.direction==='1'?'neg':'pos'">{{ f.direction==='1'?'-':'+' }}{{ Math.abs(f.amount||0) }}</span>
            </div>
            <div v-if="!recentFlows.length" style="text-align:center;color:var(--fg-4);padding:20px 0;">暂无流水</div>
          </div>
        </div>
        <div class="card card-warm s-4">
          <div class="card-head">
            <div>
              <div class="card-eyebrow">Tasks</div>
              <div class="card-title">待办提醒</div>
            </div>
            <span class="tag tag-orange"><span class="dot"></span>{{ todoCount }} 项</span>
          </div>
          <div class="list">
            <div class="li"><div class="li-ico" :class="todos.push_failed_today>0?'orange':''">{{ todos.push_failed_today>0?'!':'·' }}</div><div class="li-main"><div class="li-title">今日推送失败</div></div><span class="li-amt" :class="todos.push_failed_today>0?'neg':'pos'">{{ todos.push_failed_today ?? 0 }}</span></div>
            <div class="li"><div class="li-ico" :class="todos.push_pending>0?'orange':''">·</div><div class="li-main"><div class="li-title">待发送队列</div></div><span class="li-amt">{{ todos.push_pending ?? 0 }}</span></div>
            <div class="li"><div class="li-ico">·</div><div class="li-main"><div class="li-title">今日扫码</div></div><span class="li-amt pos">{{ todos.scan_24h ?? 0 }}</span></div>
            <div class="li"><div class="li-ico" :class="todos.order_unverified>0?'orange':''">{{ todos.order_unverified>0?'!':'·' }}</div><div class="li-main"><div class="li-title">待核销订单</div></div><span class="li-amt">{{ todos.order_unverified ?? 0 }}</span></div>
            <div class="li"><div class="li-ico" :class="todos.settle_up_pending>0?'orange':''">·</div><div class="li-main"><div class="li-title">上游待结算</div></div><span class="li-amt">{{ todos.settle_up_pending ?? 0 }}</span></div>
          </div>
        </div>
        <div class="card s-4">
          <div class="card-head">
            <div>
              <div class="card-eyebrow">Salesmen</div>
              <div class="card-title">业务员 TOP8</div>
            </div>
          </div>
          <div ref="salesRef" class="chart-sm"></div>
        </div>
        <div class="card s-12">
          <div class="card-head">
            <div>
              <div class="card-eyebrow">Notices</div>
              <div class="card-title">系统公告</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:0 32px;">
            <div v-for="n in notices" :key="n.id" class="li" style="padding:10px 0;">
              <span class="tag" :class="n.type==='2'?'tag-orange':'tag-blue'" style="height:fit-content;">{{ n.type==='2'?'公告':'通知' }}</span>
              <div class="li-main">
                <div class="li-title">{{ n.title }}</div>
                <div class="li-sub">{{ n.create_time }}</div>
              </div>
            </div>
            <div v-if="!notices.length" style="text-align:center;color:var(--fg-4);padding:20px 0;">暂无公告</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import * as echarts from 'echarts'
import { getDashboardKpi, getPremiumTrend, getCompanyShare, getChannelTop, getSalesmanTop } from '@/api/dashboard'
import { getMpStat, getDashboardTodos, getRecentFlows, getDashboardNotice } from '@/api/dashboard'
import { getCommissionSummary, getSurrenderRate, getMpOperationStats, getInsuranceTypeDist, getRenewalRate } from '@/api/dashboard'

defineOptions({ name: 'CommandCenter' })

const kpi = ref<any>({})
const mpStat = ref<any>({})
const todos = ref<any>({})
const recentFlows = ref<any[]>([])
const notices = ref<any[]>([])
const commission = ref<any>({ total_commission: 0, avg_rate: 0 })
const surrender = ref<any>({ surrender_rate_count: 0, surrender_rate_premium: 0 })
const mpOps = ref<any>({ fans: 0, fans_month: 0, scan_today: 0, msg_sent: 0, msg_total: 0, scan_new_follow: 0, scan_total: 0 })
const renewal = ref<any>({ renewal_rate: 0, total_unique_policies: 0, renewal_policies: 0 })
const trendDays = ref(7)

const profitRate = computed(() => {
  const p = Number(kpi.value.totalProfit || 0)
  const m = Number(kpi.value.totalPremium || 0)
  if (!m) return '0.00'
  return ((p / m) * 100).toFixed(2)
})
const todoCount = computed(() => {
  const t = todos.value
  return (t.push_failed_today||0) + (t.push_pending||0) + (t.order_unverified||0) + (t.settle_up_pending||0) + (t.settle_down_pending||0)
})

const mpRate = computed(() => {
  const total = mpOps.value.msg_total || 0
  const sent = mpOps.value.msg_sent || 0
  const scanTotal = mpOps.value.scan_total || 0
  const scanNew = mpOps.value.scan_new_follow || 0
  return {
    msgRate: total > 0 ? (sent / total * 100).toFixed(1) : '0.0',
    followRate: scanTotal > 0 ? (scanNew / scanTotal * 100).toFixed(1) : '0.0'
  }
})

const now = ref(new Date())
let clockTimer: ReturnType<typeof setInterval> | undefined
const pad = (n: number) => String(n).padStart(2, '0')
const fmtClock = computed(() => {
  const d = now.value
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
})

function fmtNum(v: any) {
  const n = Number(v || 0)
  if (n >= 10000) return (n / 10000).toFixed(2) + ' 万'
  return n.toLocaleString()
}

const TYPE_NAMES: Record<string, string> = { '1':'核销','2':'分销积分','3':'模板推送','4':'扫码','5':'绑定','6':'冲正' }
function typeName(t: string) { return TYPE_NAMES[t] || ('类型' + t) }

/* Charts */
const trendRef = ref<HTMLElement>()
const typeRef = ref<HTMLElement>()
const channelRef = ref<HTMLElement>()
const companyRef = ref<HTMLElement>()
const salesRef = ref<HTMLElement>()

const TOOLTIP = { backgroundColor: 'rgba(255,255,255,.96)', borderColor: 'rgba(0,0,0,0.10)', borderWidth: 1, textStyle: { color: '#0A0A0A', fontSize: 13 }, extraCssText: 'box-shadow:0 8px 32px rgba(0,0,0,.08);border-radius:8px;' }
const FG = '#0A0A0A', FG3 = '#615d59', BLUE = '#0075de', GREEN = '#1aae39'

function loadTrend() {
  getPremiumTrend(trendDays.value).then((res: any) => {
    const rows: any[] = res.data || []
    if (!trendRef.value) return
    let c = echarts.getInstanceByDom(trendRef.value)
    if (!c) c = echarts.init(trendRef.value)
    c.setOption({
      grid: { left: 50, right: 16, top: 24, bottom: 28 },
      tooltip: { ...TOOLTIP, trigger: 'axis' },
      legend: { data: ['保费','利润'], right: 0, top: 0, itemWidth: 8, itemHeight: 8, textStyle: { color: FG3, fontSize: 12 } },
      xAxis: { type: 'category', data: rows.map(r => String(r.d||'').slice(5)), axisLine: { lineStyle: { color: 'rgba(0,0,0,.08)' } }, axisTick: { show: false }, axisLabel: { color: FG3, fontSize: 11 } },
      yAxis: [
        { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: 'rgba(0,0,0,.06)' } }, axisLabel: { color: FG3, fontSize: 11, formatter: (v: number) => v>=10000?(v/10000).toFixed(0)+'w':v } },
        { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { color: FG3, fontSize: 11 } },
      ],
      series: [
        { name: '保费', type: 'line', smooth: true, data: rows.map(r => r.premium||0), symbol: 'circle', symbolSize: 6, lineStyle: { width: 2.5, color: FG }, itemStyle: { color: FG, borderColor: '#fff', borderWidth: 2 }, areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(0,0,0,0.06)'},{offset:1,color:'rgba(0,0,0,0)'}]) } },
        { name: '利润', type: 'bar', yAxisIndex: 1, data: rows.map(r => r.profit||0), barWidth: 14, itemStyle: { color: BLUE, borderRadius: [4,4,0,0] } },
      ]
    })
  })
}

function loadTypeDist() {
  if (!typeRef.value) return
  let c = echarts.getInstanceByDom(typeRef.value)
  if (!c) c = echarts.init(typeRef.value)
  getInsuranceTypeDist().then((res: any) => {
    const data: any[] = res.data || []
    if (!data.length) {
      c!.setOption({ series: [{ data: [] }] })
      return
    }
    c!.setOption({
      tooltip: { ...TOOLTIP, trigger: 'item', formatter: '{b}<br/>¥{c} ({d}%)' },
      legend: { orient: 'vertical', right: 4, top: 'center', itemWidth: 8, itemHeight: 8, textStyle: { color: FG3, fontSize: 11 } },
      series: [{
        type: 'pie', radius: ['52%','74%'], center: ['35%','50%'],
        itemStyle: { borderColor: '#fff', borderWidth: 3, borderRadius: 4 },
        label: { show: false }, labelLine: { show: false },
        data: data.map((d: any, i: number) => ({ name: d.name, value: Number(d.value), itemStyle: { color: [FG, BLUE, GREEN, '#dd5b00', '#5e4dc2', '#a39e98'][i % 6] } }))
      }]
    })
  }).catch(() => {})
}

function loadChannel() {
  getChannelTop(10).then((res: any) => {
    const data = [...(res.data || [])].reverse()
    if (!channelRef.value) return
    let c = echarts.getInstanceByDom(channelRef.value)
    if (!c) c = echarts.init(channelRef.value)
    const max = Math.max(1, ...data.map((d: any) => d.premium || 0))
    c.setOption({
      grid: { left: 80, right: 60, top: 4, bottom: 4 },
      tooltip: { ...TOOLTIP, trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: { type: 'value', show: false },
      yAxis: { type: 'category', data: data.map((d: any) => d.name), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: FG3, fontSize: 11 } },
      series: [{
        type: 'bar', data: data.map((d: any) => ({
          value: d.premium || 0,
          itemStyle: { color: (d.premium||0)/max > 0.7 ? FG : 'rgba(0,0,0,.50)', borderRadius: [0,4,4,0] }
        })), barCategoryGap: '38%',
        label: { show: true, position: 'right', color: FG3, fontSize: 10, formatter: (p: any) => '¥'+(p.value/10000).toFixed(1)+'w' }
      }]
    })
  })
}

function loadCompany() {
  getCompanyShare().then((res: any) => {
    const data: any[] = res.data || []
    if (!companyRef.value) return
    let c = echarts.getInstanceByDom(companyRef.value)
    if (!c) c = echarts.init(companyRef.value)
    const sum = data.reduce((s: number, i: any) => s + Number(i.value||0), 0)
    c.setOption({
      tooltip: { ...TOOLTIP, trigger: 'item', formatter: '{b}<br/>¥{c} ({d}%)' },
      series: [{
        type: 'pie', radius: ['52%','72%'], center: ['50%','50%'],
        itemStyle: { borderColor: '#fff', borderWidth: 3 },
        label: { show: true, position: 'center', formatter: () => `{a|累计保费}\n{b|¥${(sum/10000).toFixed(0)}w}\n{c|${data.length} 家公司}`, rich: { a: { color: FG3, fontSize: 11, lineHeight: 20 }, b: { color: FG, fontSize: 20, fontWeight: 700, lineHeight: 26 }, c: { color: '#a39e98', fontSize: 10, lineHeight: 16 } } },
        labelLine: { show: false },
        data: data.map((d: any, i: number) => ({ name: d.name, value: Number(d.value), itemStyle: { color: [FG, BLUE, GREEN, '#dd5b00', '#a39e98'][i % 5] } }))
      }]
    })
  })
}

function loadSales() {
  getSalesmanTop(8).then((res: any) => {
    const data = [...(res.data || [])].reverse()
    if (!salesRef.value) return
    let c = echarts.getInstanceByDom(salesRef.value)
    if (!c) c = echarts.init(salesRef.value)
    c.setOption({
      grid: { left: 70, right: 60, top: 4, bottom: 4 },
      tooltip: { ...TOOLTIP, trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: { type: 'value', show: false },
      yAxis: { type: 'category', data: data.map((d: any) => d.name), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: FG3, fontSize: 11 } },
      series: [{
        type: 'bar', data: data.map((d: any) => d.premium || 0), barCategoryGap: '40%',
        itemStyle: { color: BLUE, borderRadius: [0,4,4,0] },
        label: { show: true, position: 'right', color: FG3, fontSize: 10, formatter: (p: any) => '¥'+(p.value/10000).toFixed(1)+'w' }
      }]
    })
  })
}

function resizeCharts() {
  ;[trendRef.value, typeRef.value, channelRef.value, companyRef.value, salesRef.value]
    .forEach(el => el && echarts.getInstanceByDom(el)?.resize())
}

onMounted(() => {
  // [AUDIT-2026-09-04] 加 .catch 防止 unhandledrejection 冒到 console
  getDashboardKpi().then((res: any) => { kpi.value = res.data || {} }).catch(() => {})
  getMpStat().then((res: any) => { mpStat.value = res.data || {} }).catch(() => {})
  getDashboardTodos().then((res: any) => { todos.value = res.data || {} }).catch(() => {})
  getRecentFlows(6).then((res: any) => { recentFlows.value = res.data || [] }).catch(() => {})
  getDashboardNotice(4).then((res: any) => { notices.value = res.data || [] }).catch(() => {})
  getCommissionSummary().then((res: any) => { commission.value = res.data || {} }).catch(() => {})
  getSurrenderRate().then((res: any) => { surrender.value = res.data || {} }).catch(() => {})
  getMpOperationStats().then((res: any) => { mpOps.value = res.data || {} }).catch(() => {})
  getRenewalRate().then((res: any) => { renewal.value = res.data || {} }).catch(() => {})
  loadTrend()
  loadTypeDist()
  loadChannel()
  loadCompany()
  loadSales()
  clockTimer = setInterval(() => { now.value = new Date() }, 1000)
  window.addEventListener('resize', resizeCharts)
  setTimeout(resizeCharts, 50)
  setTimeout(resizeCharts, 300)
  setTimeout(resizeCharts, 800)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
  if (clockTimer) clearInterval(clockTimer)
})
</script>
