<template>
  <div class="notion-page">
    <header class="page-head">
      <div>
        <div class="lede">Finance · Overview</div>
        <h1>财务概览</h1>
      </div>
      <div class="meta">
        <span class="tag tag-orange"><span class="dot"></span>结账中</span>
      </div>
    </header>

    <!-- Section 01 · 利润三态 -->
    <section class="section">
      <div class="section-label">Section 01 · 利润三态</div>
      <div class="bento">
        <div class="card kpi s-4"><div class="kpi-eyebrow"><span class="dot pos"></span>本月收入</div><div class="kpi-num"><span class="currency">¥</span>{{ fmtMoney(kpi.totalPremium) }}</div><div class="kpi-foot"><span>保单 {{ kpi.totalPolicy ?? 0 }} 笔</span></div></div>
        <div class="card kpi s-4"><div class="kpi-eyebrow"><span class="dot warn"></span>本月支出</div><div class="kpi-num"><span class="currency">¥</span>{{ fmtMoney(commission.total_commission) }}</div><div class="kpi-foot"><span>含佣金 + 渠道</span></div></div>
        <div class="card kpi card-warm s-4"><div class="kpi-eyebrow"><span class="dot pos"></span>本月利润</div><div class="kpi-num"><span class="currency">¥</span>{{ fmtMoney(kpi.totalProfit) }}</div><div class="kpi-foot"><span class="delta" style="color:var(--green);">{{ profitRate }}%</span><span>利润率</span></div></div>
      </div>
    </section>

    <!-- Section 02 · 佣金趋势 -->
    <section class="section">
      <div class="section-label">Section 02 · 佣金趋势</div>
      <div class="bento">
        <div class="card s-8">
          <div class="card-head"><div><div class="card-eyebrow">Commission Trend</div><div class="card-title">佣金月度趋势</div></div><span class="card-extra">近 12 月</span></div>
          <div ref="trendRef" class="chart"></div>
        </div>
        <div class="card card-warm s-4">
          <div class="card-head"><div><div class="card-eyebrow">Tax</div><div class="card-title">税费分布</div></div></div>
          <div ref="taxRef" class="chart"></div>
        </div>
      </div>
    </section>

    <!-- Section 03 · 科目 + 发票 -->
    <section class="section">
      <div class="section-label">Section 03 · 科目与发票</div>
      <div class="bento">
        <div class="card s-6">
          <div class="card-head"><div><div class="card-eyebrow">Subjects</div><div class="card-title">科目余额 TOP10</div></div></div>
          <div ref="subjectRef" class="chart"></div>
        </div>
        <div class="card s-6">
          <div class="card-head"><div><div class="card-eyebrow">Commission Stats</div><div class="card-title">佣金统计 · 本月</div></div></div>
          <div class="bento" style="gap:12px;">
            <div class="card" style="grid-column:span 4;padding:16px;border-radius:10px;"><div class="kpi-eyebrow"><span class="dot"></span>应发佣金</div><div class="kpi-num" style="font-size:24px;"><span class="currency">¥</span>{{ fmtMoney(commission.total_commission) }}</div></div>
            <div class="card" style="grid-column:span 4;padding:16px;border-radius:10px;"><div class="kpi-eyebrow"><span class="dot pos"></span>平均费率</div><div class="kpi-num" style="font-size:24px;"><span>{{ (commission.avg_rate*100).toFixed(1) }}</span><span class="unit">%</span></div></div>
            <div class="card" style="grid-column:span 4;padding:16px;border-radius:10px;"><div class="kpi-eyebrow"><span class="dot warn"></span>本月保费</div><div class="kpi-num" style="font-size:24px;"><span class="currency">¥</span>{{ fmtMoney(commission.total_premium) }}</div></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 04 · 发票 -->
    <section class="section">
      <div class="section-label">Section 04 · 发票统计</div>
      <div class="bento">
        <div class="card kpi s-4"><div class="kpi-eyebrow"><span class="dot"></span>发票总数</div><div class="kpi-num" style="font-size:32px;"><span>{{ invoice.total_count ?? 0 }}</span><span class="unit">张</span></div></div>
        <div class="card kpi s-4"><div class="kpi-eyebrow"><span class="dot pos"></span>已开发票</div><div class="kpi-num" style="font-size:32px;"><span>{{ invoice.issued_count ?? 0 }}</span><span class="unit">张</span></div><div class="kpi-foot"><span>开票率 {{ invoiceRate }}%</span></div></div>
        <div class="card kpi card-warm s-4"><div class="kpi-eyebrow"><span class="dot warn"></span>发票金额</div><div class="kpi-num" style="font-size:32px;"><span class="currency">¥</span>{{ fmtMoney(invoice.total_amount) }}</div><div class="kpi-foot"><span>已开 ¥{{ fmtMoney(invoice.issued_amount) }}</span></div></div>
      </div>
      <div class="card s-12" style="margin-top:16px;">
        <div class="card-head"><div><div class="card-eyebrow">Invoice Progress</div><div class="card-title">开票进度</div></div></div>
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">
          <div style="flex:1;height:8px;background:var(--bg-warm);border-radius:999px;overflow:hidden;"><div :style="{width:invoiceRate+'%',height:'100%',background:'linear-gradient(90deg,var(--green),var(--blue))',borderRadius:'999px',transition:'width 1.4s'}"></div></div>
          <span style="font-size:14px;font-weight:700;color:var(--green);min-width:45px;text-align:right;">{{ invoiceRate }}%</span>
        </div>
        <div class="bento" style="gap:12px;">
          <div class="card" style="grid-column:span 3;padding:14px;"><div class="kpi-eyebrow">待开票</div><div style="font-size:20px;font-weight:700;color:var(--orange);margin-top:4px;">{{ (invoice.total_count||0)-(invoice.issued_count||0) }} 张</div></div>
          <div class="card" style="grid-column:span 3;padding:14px;"><div class="kpi-eyebrow">待开金额</div><div style="font-size:20px;font-weight:700;color:var(--orange);margin-top:4px;">¥{{ fmtMoney((invoice.total_amount||0)-(invoice.issued_amount||0)) }}</div></div>
          <div class="card" style="grid-column:span 3;padding:14px;"><div class="kpi-eyebrow">已开金额</div><div style="font-size:20px;font-weight:700;color:var(--green);margin-top:4px;">¥{{ fmtMoney(invoice.issued_amount) }}</div></div>
          <div class="card" style="grid-column:span 3;padding:14px;"><div class="kpi-eyebrow">佣金总额</div><div style="font-size:20px;font-weight:700;color:var(--green);margin-top:4px;">¥{{ fmtMoney(commission.total_commission) }}</div></div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import * as echarts from 'echarts'
import { getDashboardKpi, getCommissionSummary, getCommissionTrend, getTaxBreakdown, getInvoiceStats, getSubjectBalanceTop10 } from '@/api/dashboard'

defineOptions({ name: 'FinanceOverview' })

const kpi = ref<any>({})
const commission = ref<any>({ total_commission:0, total_premium:0, avg_rate:0 })
const invoice = ref<any>({})

const profitRate = computed(() => { const p=Number(kpi.value.totalProfit||0); const m=Number(kpi.value.totalPremium||0); return m?((p/m)*100).toFixed(1):'0' })
const invoiceRate = computed(() => { const t=invoice.value.total_count||0; const i=invoice.value.issued_count||0; return t?Math.round(i/t*100):0 })
function fmtMoney(v: any) { const n=Number(v||0); if(n>=10000) return (n/10000).toFixed(2)+' 万'; return n.toFixed(2) }

const trendRef = ref<HTMLElement>(); const taxRef = ref<HTMLElement>(); const subjectRef = ref<HTMLElement>()

const TOOLTIP = { backgroundColor:'rgba(255,255,255,.96)', borderColor:'rgba(0,0,0,0.10)', borderWidth:1, textStyle:{color:'#0A0A0A',fontSize:13}, extraCssText:'box-shadow:0 8px 32px rgba(0,0,0,.08);border-radius:8px;' }
const FG='#0A0A0A', FG3='#615d59', BLUE='#0075de', GREEN='#1aae39', ORANGE='#dd5b00', PURPLE='#5e4dc2'
const PIE = [FG, BLUE, GREEN, ORANGE, PURPLE, '#a39e98']

function loadTrend() {
  getCommissionTrend().then((res:any) => {
    const rows:any[] = res.data||[]
    if(!trendRef.value) return
    let c = echarts.getInstanceByDom(trendRef.value); if(!c) c = echarts.init(trendRef.value)
    c.setOption({
      grid:{ left:50, right:40, top:30, bottom:28 },
      tooltip:{ ...TOOLTIP, trigger:'axis' },
      legend:{ data:['佣金','保费','费率'], right:0, top:0, itemWidth:8, itemHeight:8, textStyle:{color:FG3,fontSize:12} },
      xAxis:{ type:'category', data:rows.map(r=>r.m), axisLine:{lineStyle:{color:'rgba(0,0,0,.08)'}}, axisTick:{show:false}, axisLabel:{color:FG3,fontSize:11,rotate:30} },
      yAxis:[{ type:'value', axisLine:{show:false}, axisTick:{show:false}, splitLine:{lineStyle:{color:'rgba(0,0,0,.06)'}}, axisLabel:{color:FG3,fontSize:11,formatter:(v:number)=>v>=10000?(v/10000).toFixed(0)+'w':v} },{ type:'value', axisLine:{show:false}, axisTick:{show:false}, splitLine:{show:false}, axisLabel:{color:FG3,fontSize:10,formatter:(v:number)=>(v*100).toFixed(1)+'%'}, min:0, max:0.3 }],
      series:[
        { name:'佣金', type:'bar', data:rows.map(r=>r.commission||0), itemStyle:{color:BLUE,borderRadius:[4,4,0,0]} },
        { name:'保费', type:'bar', data:rows.map(r=>r.premium||0), itemStyle:{color:'rgba(0,0,0,.30)',borderRadius:[4,4,0,0]} },
        { name:'费率', type:'line', yAxisIndex:1, data:rows.map(r=>r.rate||0), itemStyle:{color:GREEN}, lineStyle:{width:2.5,color:GREEN}, smooth:true }
      ]
    })
  })
}

function loadTax() {
  getTaxBreakdown().then((res:any) => {
    const data:any[] = res.data||[]
    if(!taxRef.value) return
    let c = echarts.getInstanceByDom(taxRef.value); if(!c) c = echarts.init(taxRef.value)
    c.setOption({
      tooltip:{ ...TOOLTIP, trigger:'item', formatter:'{b}<br/>¥{c} ({d}%)' },
      legend:{ orient:'vertical', right:4, top:'center', itemWidth:8, itemHeight:8, textStyle:{color:'#31302e',fontSize:11} },
      series:[{ type:'pie', radius:['52%','74%'], center:['35%','50%'], itemStyle:{borderColor:'#fff',borderWidth:3,borderRadius:4}, label:{show:false}, labelLine:{show:false}, data:data.map((d:any,i:number)=>({name:d.name,value:Number(d.value),itemStyle:{color:PIE[i%PIE.length]}})) }]
    })
  })
}

function loadSubject() {
  getSubjectBalanceTop10(10).then((res:any) => {
    const data:any[] = res.data||[]
    const subjects = data.map((d:any) => ({name:d.name, value:Number(d.value||0)}))
    const reversed = [...subjects].reverse()
    if(!subjectRef.value || !subjects.length) return
    let c = echarts.getInstanceByDom(subjectRef.value); if(!c) c = echarts.init(subjectRef.value)
    const max = Math.max(...subjects.map(s=>Math.abs(s.value)))
    c.setOption({
      grid:{ left:80, right:60, top:8, bottom:8 },
      tooltip:{ ...TOOLTIP, trigger:'axis', axisPointer:{type:'shadow'}, formatter:(p:any)=>p[0].name+'<br/>余额 ¥'+p[0].value.toLocaleString() },
      xAxis:{ type:'value', show:false },
      yAxis:{ type:'category', data:reversed.map(d=>d.name), axisLine:{show:false}, axisTick:{show:false}, axisLabel:{color:FG3,fontSize:11} },
      series:[{ type:'bar', data:reversed.map(d=>({value:Math.abs(d.value), itemStyle:{color:Math.abs(d.value)/max>0.7?FG:'rgba(0,0,0,.50)',borderRadius:[0,4,4,0]}})), barCategoryGap:'38%', label:{show:true,position:'right',color:FG3,fontSize:10,formatter:(p:any)=>'¥'+p.value.toLocaleString()} }]
    })
  })
}

function resizeCharts() { ;[trendRef.value,taxRef.value,subjectRef.value].forEach(el=>el&&echarts.getInstanceByDom(el)?.resize()) }

onMounted(() => {
  getDashboardKpi().then((res:any)=>{kpi.value=res.data||{}})
  getCommissionSummary().then((res:any)=>{commission.value=res.data||{}})
  getInvoiceStats().then((res:any)=>{invoice.value=res.data||{}})
  loadTrend(); loadTax(); loadSubject()
  window.addEventListener('resize',resizeCharts)
  setTimeout(resizeCharts,50); setTimeout(resizeCharts,300); setTimeout(resizeCharts,800)
})
onUnmounted(()=>{window.removeEventListener('resize',resizeCharts)})
</script>
