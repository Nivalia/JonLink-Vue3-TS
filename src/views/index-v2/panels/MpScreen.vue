<template>
  <div class="notion-page">
    <header class="page-head">
      <div>
        <div class="lede">WeChat · MP Dashboard · 近 30 天</div>
        <h1>公众号数据大屏</h1>
      </div>
      <div class="meta">
        <span class="tag tag-green"><span class="dot"></span>API 正常</span>
      </div>
    </header>

    <!-- Section 01 · 头部 KPI -->
    <section class="section">
      <div class="section-label">Section 01 · 头部指标</div>
      <div class="bento">
        <div class="card kpi s-3"><div class="kpi-eyebrow"><span class="dot pos"></span>粉丝总数</div><div class="kpi-num">{{ mpStat.fans ?? 0 }}</div><div class="kpi-foot"><span>本月 +{{ mpStat.fans_month ?? 0 }}</span></div></div>
        <div class="card kpi s-3"><div class="kpi-eyebrow"><span class="dot"></span>今日消息</div><div class="kpi-num">{{ mpStat.msg_today ?? 0 }}</div><div class="kpi-foot"><span>送达率 {{ msgRate }}%</span></div></div>
        <div class="card kpi s-3"><div class="kpi-eyebrow"><span class="dot pos"></span>今日核销</div><div class="kpi-num"><span class="currency">¥</span>{{ fmtNum(mpStat.verify_amount_today) }}</div><div class="kpi-foot"><span>{{ mpStat.verify_today ?? 0 }} 笔</span></div></div>
        <div class="card card-warm kpi s-3"><div class="kpi-eyebrow"><span class="dot"></span>模板送达</div><div class="kpi-num">{{ mpStat.msg_sent_total ?? 0 }}</div><div class="kpi-foot"><span>失败 {{ mpStat.msg_failed_total ?? 0 }}</span></div></div>
      </div>
    </section>

    <!-- Section 02 · 转化指标 -->
    <section class="section">
      <div class="section-label">Section 02 · 转化指标</div>
      <div class="bento">
        <div class="card card-warm kpi s-3"><div class="kpi-eyebrow"><span class="dot pos"></span>消息送达率</div><div class="kpi-num"><span>{{ msgRate }}</span><span class="unit">%</span></div></div>
        <div class="card card-warm kpi s-3"><div class="kpi-eyebrow"><span class="dot"></span>本月利润</div><div class="kpi-num"><span class="currency">¥</span>{{ fmtNum(mpStat.profit_month) }}</div></div>
        <div class="card card-warm kpi s-3"><div class="kpi-eyebrow"><span class="dot pos"></span>累计积分</div><div class="kpi-num">{{ mpStat.points_total ?? 0 }}</div></div>
        <div class="card card-warm kpi s-3"><div class="kpi-eyebrow"><span class="dot warn"></span>今日扫码</div><div class="kpi-num">{{ mpStat.scan_today ?? 0 }}</div><div class="kpi-foot"><span>累计 {{ mpStat.scan_total ?? 0 }}</span></div></div>
      </div>
    </section>

    <!-- Section 03 · 流水趋势 + 地域 -->
    <section class="section">
      <div class="section-label">Section 03 · 流水趋势</div>
      <div class="bento">
        <div class="card s-8">
          <div class="card-head"><div><div class="card-eyebrow">Growth</div><div class="card-title">流水趋势</div></div>
            <div style="display:inline-flex;gap:2px;border:1px solid var(--line);border-radius:var(--r-pill);padding:2px;">
              <button v-for="d in [7,14,30]" :key="d" class="btn btn-pill" :style="flowDays===d?{background:'var(--fg)',color:'#fff'}:{}" @click="flowDays=d;loadFlow()">{{ d }}D</button>
            </div>
          </div>
          <div ref="flowRef" class="chart"></div>
        </div>
        <div class="card s-4">
          <div class="card-head"><div><div class="card-eyebrow">Region</div><div class="card-title">粉丝地域 TOP</div></div></div>
          <div ref="regionRef" class="chart"></div>
        </div>
      </div>
    </section>

    <!-- Section 04 · 互动分析 -->
    <section class="section">
      <div class="section-label">Section 04 · 互动分析</div>
      <div class="bento">
        <div class="card s-6">
          <div class="card-head"><div><div class="card-eyebrow">Source</div><div class="card-title">关注来源</div></div></div>
          <div ref="sourceRef" class="chart"></div>
        </div>
        <div class="card s-6">
          <div class="card-head"><div><div class="card-eyebrow">Portrait</div><div class="card-title">用户性别</div></div></div>
          <div ref="portraitRef" class="chart"></div>
        </div>
      </div>
    </section>

    <!-- Section 05 · 实时扫码 + 矩阵 -->
    <section class="section">
      <div class="section-label">Section 05 · 实时动态</div>
      <div class="bento">
        <div class="card s-8">
          <div class="card-head"><div><div class="card-eyebrow">Live</div><div class="card-title">最近扫码 / 关注</div></div></div>
          <div class="list">
            <div v-for="log in scanLogs" :key="log.id" class="li">
              <div class="li-ico" :class="log.is_new_follow==='1'?'green':''">{{ log.is_new_follow==='1'?'+':'⌕' }}</div>
              <div class="li-main"><div class="li-title">{{ log.nickname }}</div><div class="li-sub">{{ log.city }} · #{{ log.scene_id }}</div></div>
              <span style="color:var(--fg-4);font-size:11px;">{{ log.scan_time }}</span>
            </div>
            <div v-if="!scanLogs.length" style="text-align:center;color:var(--fg-4);padding:20px 0;">暂无扫码</div>
          </div>
        </div>
        <div class="card card-warm s-4">
          <div class="card-head"><div><div class="card-eyebrow">Matrix</div><div class="card-title">公众号矩阵</div></div></div>
          <div class="list">
            <div v-for="mp in mpMatrix" :key="mp.id" class="li">
              <div class="li-ico">{{ (mp.app_name||'J').charAt(0) }}</div>
              <div class="li-main"><div class="li-title">{{ mp.app_name }}</div><div class="li-sub">{{ mp.app_id }}</div></div>
              <span class="tag" :class="mp.status==='1'?'tag-green':'tag-orange'"><span class="dot"></span>{{ mp.status_name }}</span>
            </div>
            <div v-if="!mpMatrix.length" style="text-align:center;color:var(--fg-4);padding:20px 0;">暂无配置</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import * as echarts from 'echarts'
import { getMpStat, getFlowTrend, getTopDistrict, getFanSource, getUserPortrait, getMpMatrix, getScanLogs } from '@/api/dashboard'

defineOptions({ name: 'MpScreen' })

const mpStat = ref<any>({})
const scanLogs = ref<any[]>([])
const mpMatrix = ref<any[]>([])
const flowDays = ref(30)

const msgRate = computed(() => { const s = mpStat.value; const t = (s.msg_sent_total||0)+(s.msg_failed_total||0); return t ? ((s.msg_sent_total||0)/t*100).toFixed(1) : '0' })
function fmtNum(v: any) { const n = Number(v||0); if(n>=10000) return (n/10000).toFixed(1)+'万'; return n.toLocaleString() }

const flowRef = ref<HTMLElement>(); const regionRef = ref<HTMLElement>(); const sourceRef = ref<HTMLElement>(); const portraitRef = ref<HTMLElement>()

const TOOLTIP = { backgroundColor:'rgba(255,255,255,.96)', borderColor:'rgba(0,0,0,0.10)', borderWidth:1, textStyle:{color:'#0A0A0A',fontSize:13}, extraCssText:'box-shadow:0 8px 32px rgba(0,0,0,.08);border-radius:8px;' }
const FG='#0A0A0A', FG3='#615d59', BLUE='#0075de', GREEN='#1aae39', ORANGE='#dd5b00', PURPLE='#5e4dc2'
const PIE = [FG, BLUE, GREEN, ORANGE, PURPLE, '#a39e98']

function loadFlow() {
  getFlowTrend(flowDays.value).then((res:any) => {
    const rows:any[] = res.data||[]
    if(!flowRef.value) return
    let c = echarts.getInstanceByDom(flowRef.value); if(!c) c = echarts.init(flowRef.value)
    c.setOption({
      grid:{ left:42, right:20, top:28, bottom:18 },
      tooltip:{ ...TOOLTIP, trigger:'axis' },
      legend:{ data:['流入','流出','积分'], right:0, top:0, itemWidth:8, itemHeight:8, textStyle:{color:FG3,fontSize:10} },
      xAxis:{ type:'category', data:rows.map(r=>String(r.d).slice(5)), axisLine:{lineStyle:{color:'rgba(0,0,0,.08)'}}, axisTick:{show:false}, axisLabel:{color:FG3,fontSize:9} },
      yAxis:[{ type:'value', axisLine:{show:false}, axisTick:{show:false}, splitLine:{lineStyle:{color:'rgba(0,0,0,.06)'}}, axisLabel:{color:FG3,fontSize:9} },{ type:'value', axisLine:{show:false}, axisTick:{show:false}, splitLine:{show:false}, axisLabel:{color:FG3,fontSize:9} }],
      series:[
        { name:'流入', type:'bar', stack:'a', data:rows.map(r=>r.amt_in||0), itemStyle:{color:GREEN,borderRadius:[3,3,0,0]} },
        { name:'流出', type:'bar', stack:'a', data:rows.map(r=>-(r.amt_out||0)), itemStyle:{color:ORANGE,borderRadius:[0,0,3,3]} },
        { name:'积分', type:'line', yAxisIndex:1, data:rows.map(r=>r.pts||0), itemStyle:{color:BLUE}, smooth:true }
      ]
    })
  })
}

function loadRegion() {
  getTopDistrict(8).then((res:any) => {
    const data = [...(res.data||[])].filter((r:any)=>r.name).reverse()
    if(!regionRef.value) return
    let c = echarts.getInstanceByDom(regionRef.value); if(!c) c = echarts.init(regionRef.value)
    const max = Math.max(1,...data.map((d:any)=>Number(d.cnt)||0))
    c.setOption({
      grid:{ left:64, right:50, top:4, bottom:4 },
      tooltip:{ ...TOOLTIP, trigger:'axis', axisPointer:{type:'shadow'} },
      xAxis:{ type:'value', show:false },
      yAxis:{ type:'category', data:data.map((d:any)=>d.name), axisLine:{show:false}, axisTick:{show:false}, axisLabel:{color:FG3,fontSize:11} },
      series:[{ type:'bar', data:data.map((d:any)=>{const v=Number(d.cnt)||0; return {value:v, itemStyle:{color:v/max>0.7?FG:'rgba(0,0,0,.50)',borderRadius:[0,4,4,0]}}}), barCategoryGap:'40%', label:{show:true,position:'right',color:FG3,fontSize:10} }]
    })
  })
}

function loadSource() {
  getFanSource().then((res:any) => {
    const data:any[] = res.data||[]
    if(!sourceRef.value) return
    let c = echarts.getInstanceByDom(sourceRef.value); if(!c) c = echarts.init(sourceRef.value)
    c.setOption({
      tooltip:{ ...TOOLTIP, trigger:'item', formatter:'{b}<br/>{c} ({d}%)' },
      legend:{ orient:'vertical', right:4, top:'center', itemWidth:8, itemHeight:8, textStyle:{color:'#31302e',fontSize:11} },
      series:[{ type:'pie', radius:['52%','74%'], center:['35%','50%'], itemStyle:{borderColor:'#fff',borderWidth:3,borderRadius:4}, label:{show:false}, labelLine:{show:false}, data:data.map((d:any,i:number)=>({name:d.name,value:Number(d.cnt),itemStyle:{color:PIE[i%PIE.length]}})) }]
    })
  })
}

function loadPortrait() {
  getUserPortrait().then((res:any) => {
    const s:any = res.data||{}
    if(!portraitRef.value) return
    let c = echarts.getInstanceByDom(portraitRef.value); if(!c) c = echarts.init(portraitRef.value)
    c.setOption({
      tooltip:{ ...TOOLTIP, trigger:'item', formatter:'{b}<br/>{c} 人' },
      legend:{ bottom:0, left:'center', itemWidth:8, itemHeight:8, textStyle:{color:FG3,fontSize:11} },
      series:[{ type:'pie', radius:['52%','72%'], center:['50%','45%'], itemStyle:{borderColor:'#fff',borderWidth:3}, label:{show:true,formatter:'{b}\n{c}',fontSize:11,color:'#31302e',lineHeight:16}, data:[{name:'男',value:s.male||0,itemStyle:{color:FG}},{name:'女',value:s.female||0,itemStyle:{color:BLUE}},{name:'未知',value:s.unknown||0,itemStyle:{color:'#a39e98'}}] }]
    })
  })
}

function resizeCharts() { ;[flowRef.value,regionRef.value,sourceRef.value,portraitRef.value].forEach(el=>el&&echarts.getInstanceByDom(el)?.resize()) }

onMounted(() => {
  getMpStat().then((res:any)=>{mpStat.value=res.data||{}})
  getScanLogs(8).then((res:any)=>{scanLogs.value=res.data||[]})
  getMpMatrix().then((res:any)=>{mpMatrix.value=res.data||[]})
  loadFlow(); loadRegion(); loadSource(); loadPortrait()
  window.addEventListener('resize',resizeCharts)
  setTimeout(resizeCharts,50); setTimeout(resizeCharts,300); setTimeout(resizeCharts,800)
})
onUnmounted(()=>{window.removeEventListener('resize',resizeCharts)})
</script>
