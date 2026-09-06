<template>
  <div class="notion-page">
    <header class="page-head">
      <div>
        <div class="lede">Ledger · Business Dashboard</div>
        <h1>业务数据看板</h1>
      </div>
      <div class="meta">
        <span class="tag tag-green"><span class="dot"></span>同比上升</span>
      </div>
    </header>

    <!-- Section 01 · 资源概览 -->
    <section class="section">
      <div class="section-label">Section 01 · 资源概览</div>
      <div class="bento">
        <div class="card kpi s-3"><div class="kpi-eyebrow"><span class="dot"></span>在售产品</div><div class="kpi-num">{{ kpi.productActive ?? 0 }}<span class="unit" style="font-size:14px;color:var(--fg-4);"> / {{ kpi.productCount ?? 0 }}</span></div><div class="kpi-foot"><span class="delta" style="color:var(--green);">{{ productRate }}%</span><span>上架率</span></div></div>
        <div class="card kpi s-3"><div class="kpi-eyebrow"><span class="dot"></span>合作渠道</div><div class="kpi-num">{{ kpi.channelActive ?? 0 }}<span class="unit" style="font-size:14px;color:var(--fg-4);"> / {{ kpi.channelCount ?? 0 }}</span></div><div class="kpi-foot"><span class="delta" style="color:var(--green);">{{ channelRate }}%</span><span>启用率</span></div></div>
        <div class="card kpi s-3"><div class="kpi-eyebrow"><span class="dot"></span>业务员</div><div class="kpi-num">{{ kpi.salesmanActive ?? 0 }}<span class="unit" style="font-size:14px;color:var(--fg-4);"> / {{ kpi.salesmanCount ?? 0 }}</span></div><div class="kpi-foot"><span class="delta" style="color:var(--green);">{{ salesmanRate }}%</span><span>在职率</span></div></div>
        <div class="card card-warm kpi s-3"><div class="kpi-eyebrow"><span class="dot pos"></span>活跃度</div><div class="kpi-num"><span>{{ activityRate.activity_rate ?? 0 }}</span><span class="unit">%</span></div><div class="kpi-foot"><span>活跃 {{ activityRate.active_products ?? 0 }} / {{ activityRate.total_products ?? 0 }} 产品</span></div></div>
      </div>
    </section>

    <!-- Section 02 · 财务汇总 -->
    <section class="section">
      <div class="section-label">Section 02 · 财务汇总</div>
      <div class="bento">
        <div class="card card-warm kpi s-4"><div class="kpi-eyebrow"><span class="dot"></span>累计保费</div><div class="kpi-num"><span class="currency">¥</span>{{ fmtMoney(kpi.totalPremium) }}</div><div class="kpi-foot"><span>保单 {{ kpi.totalPolicy ?? 0 }} 笔</span></div></div>
        <div class="card card-warm kpi s-4"><div class="kpi-eyebrow"><span class="dot pos"></span>累计利润</div><div class="kpi-num"><span class="currency">¥</span>{{ fmtMoney(kpi.totalProfit) }}</div><div class="kpi-foot"><span class="delta" style="color:var(--green);">{{ profitRate }}%</span><span>利润率</span></div></div>
        <div class="card card-warm kpi s-4"><div class="kpi-eyebrow"><span class="dot warn"></span>待结算保费</div><div class="kpi-num"><span class="currency">¥</span>{{ fmtMoney(kpi.unsettledPremium) }}</div><div class="kpi-foot"><span>上游 / 下游 结算中</span></div></div>
      </div>
    </section>

    <!-- Section 03 · 趋势分析 -->
    <section class="section">
      <div class="section-label">Section 03 · 趋势分析</div>
      <div class="bento">
        <div class="card s-8">
          <div class="card-head"><div><div class="card-eyebrow">保费 & 利润</div><div class="card-title">业务走势</div></div><div class="card-extra">近 {{ trendDays }} 天</div></div>
          <div ref="trendRef" class="chart"></div>
        </div>
        <div class="card card-warm s-4">
          <div class="card-head"><div><div class="card-eyebrow">Profitability</div><div class="card-title">利润率走势</div></div></div>
          <div ref="marginRef" class="chart"></div>
        </div>
      </div>
    </section>

    <!-- Section 04 · 渠道 + 业务员 -->
    <section class="section">
      <div class="section-label">Section 04 · 渠道与人员</div>
      <div class="bento">
        <div class="card s-6"><div class="card-head"><div><div class="card-eyebrow">Channels</div><div class="card-title">渠道贡献 TOP10</div></div></div><div ref="channelRef" class="chart"></div></div>
        <div class="card s-6"><div class="card-head"><div><div class="card-eyebrow">Salesmen</div><div class="card-title">业务员 TOP10</div></div></div><div ref="salesRef" class="chart"></div></div>
      </div>
    </section>

    <!-- Section 05 · 产品分布 -->
    <section class="section">
      <div class="section-label">Section 05 · 产品与续保</div>
      <div class="bento">
        <div class="card s-4"><div class="card-head"><div><div class="card-eyebrow">Insurers</div><div class="card-title">保险公司占比</div></div></div><div ref="companyRef" class="chart-sm"></div></div>
        <div class="card s-4"><div class="card-head"><div><div class="card-eyebrow">Products</div><div class="card-title">产品矩阵</div></div></div><div ref="productRef" class="chart-sm"></div></div>
        <div class="card card-warm s-4"><div class="card-head"><div><div class="card-eyebrow">Commission</div><div class="card-title">佣金统计</div></div></div><div ref="commRef" class="chart-sm"></div></div>
      </div>
    </section>

    <!-- Section 06 · 佣金回款 + 台账明细 -->
    <section class="section">
      <div class="section-label">Section 06 · 最近台账</div>
      <div class="bento">
        <div class="card s-12">
          <div class="card-head"><div><div class="card-eyebrow">Recent</div><div class="card-title">最近台账明细</div></div></div>
          <table class="dt">
            <thead><tr><th>保单号</th><th>产品</th><th>公司</th><th>渠道</th><th>业务员</th><th class="right">保费</th><th class="right">利润</th><th>状态</th></tr></thead>
            <tbody>
              <tr v-for="l in recentLedger" :key="l.id">
                <td>{{ l.policy_no }}</td>
                <td>{{ l.product_name }}</td>
                <td>{{ l.insurance_company }}</td>
                <td style="color:var(--fg-3);">{{ l.up_channel }}</td>
                <td>{{ l.applicant }}</td>
                <td class="right" style="font-weight:600;">¥{{ fmtMoney(l.premium) }}</td>
                <td class="right" style="color:var(--green);">¥{{ fmtMoney(l.profit) }}</td>
                <td><span class="tag" :class="l.up_status==='已结算'?'tag-green':'tag-orange'"><span class="dot"></span>{{ l.up_status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import * as echarts from 'echarts'
import { getDashboardKpi, getPremiumTrend, getCompanyShare, getChannelTop, getSalesmanTop, getRecentLedger, getProductByType, getActivityRate } from '@/api/dashboard'
import { getCommissionSummary, getCommissionTrend } from '@/api/dashboard'

defineOptions({ name: 'BizData' })

const kpi = ref<any>({})
const recentLedger = ref<any[]>([])
const activityRate = ref<any>({})
const trendDays = ref(30)

const profitRate = computed(() => { const p = Number(kpi.value.totalProfit||0); const m = Number(kpi.value.totalPremium||0); return m ? ((p/m)*100).toFixed(2) : '0.00' })
const productRate = computed(() => { const a = kpi.value.productActive||0; const t = kpi.value.productCount||0; return t ? ((a/t)*100).toFixed(1) : '0' })
const channelRate = computed(() => { const a = kpi.value.channelActive||0; const t = kpi.value.channelCount||0; return t ? ((a/t)*100).toFixed(1) : '0' })
const salesmanRate = computed(() => { const a = kpi.value.salesmanActive||0; const t = kpi.value.salesmanCount||0; return t ? ((a/t)*100).toFixed(1) : '0' })

function fmtMoney(v: any) { const n = Number(v||0); if (n>=10000) return (n/10000).toFixed(2)+' 万'; return n.toFixed(2) }

const trendRef = ref<HTMLElement>(); const marginRef = ref<HTMLElement>(); const channelRef = ref<HTMLElement>(); const salesRef = ref<HTMLElement>(); const companyRef = ref<HTMLElement>(); const productRef = ref<HTMLElement>(); const commRef = ref<HTMLElement>()

const TOOLTIP = { backgroundColor:'rgba(255,255,255,.96)', borderColor:'rgba(0,0,0,0.10)', borderWidth:1, textStyle:{ color:'#0A0A0A', fontSize:13 }, extraCssText:'box-shadow:0 8px 32px rgba(0,0,0,.08);border-radius:8px;' }
const FG='#0A0A0A', FG3='#615d59', BLUE='#0075de', GREEN='#1aae39', ORANGE='#dd5b00', PURPLE='#5e4dc2'

function loadKpi() { getDashboardKpi().then((res:any) => { kpi.value = res.data||{} }) }
function loadRecent() { getRecentLedger(8).then((res:any) => { recentLedger.value = res.data||[] }) }

function loadTrend() {
  getPremiumTrend(trendDays.value).then((res:any) => {
    const rows:any[] = res.data||[]
    if(!trendRef.value) return
    let c = echarts.getInstanceByDom(trendRef.value); if(!c) c = echarts.init(trendRef.value)
    c.setOption({
      grid:{ left:60, right:16, top:24, bottom:28 },
      tooltip:{ ...TOOLTIP, trigger:'axis' },
      legend:{ data:['保费','利润'], right:0, top:0, itemWidth:8, itemHeight:8, textStyle:{ color:FG3, fontSize:12 } },
      xAxis:{ type:'category', data:rows.map(r=>String(r.d||'').slice(5)), axisLine:{ lineStyle:{color:'rgba(0,0,0,.08)'} }, axisTick:{show:false}, axisLabel:{color:FG3,fontSize:11} },
      yAxis:[{ type:'value', axisLine:{show:false}, axisTick:{show:false}, splitLine:{lineStyle:{color:'rgba(0,0,0,.06)'}}, axisLabel:{color:FG3,fontSize:11,formatter:(v:number)=>v>=10000?(v/10000).toFixed(0)+'w':v} },{ type:'value', axisLine:{show:false}, axisTick:{show:false}, splitLine:{show:false}, axisLabel:{color:FG3,fontSize:11} }],
      series:[
        { name:'保费', type:'line', smooth:true, data:rows.map(r=>r.premium||0), symbol:'circle', symbolSize:6, lineStyle:{width:2.5,color:FG}, itemStyle:{color:FG,borderColor:'#fff',borderWidth:2}, areaStyle:{color:new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(0,0,0,0.06)'},{offset:1,color:'rgba(0,0,0,0)'}])} },
        { name:'利润', type:'bar', yAxisIndex:1, data:rows.map(r=>r.profit||0), barWidth:14, itemStyle:{color:BLUE,borderRadius:[4,4,0,0]} }
      ]
    })
  })
}

function loadHBar(elRef: any, data: any[]) {
  const reversed = [...data].reverse()
  if(!elRef.value) return
  let c = echarts.getInstanceByDom(elRef.value); if(!c) c = echarts.init(elRef.value)
  const max = Math.max(1,...data.map((d:any)=>d.premium||d.value||0))
  c.setOption({
    grid:{ left:80, right:60, top:4, bottom:4 },
    tooltip:{ ...TOOLTIP, trigger:'axis', axisPointer:{type:'shadow'} },
    xAxis:{ type:'value', show:false },
    yAxis:{ type:'category', data:reversed.map((d:any)=>d.name), axisLine:{show:false}, axisTick:{show:false}, axisLabel:{color:FG3,fontSize:11} },
    series:[{ type:'bar', data:reversed.map((d:any)=>{const v=d.premium||d.value||0; return {value:v, itemStyle:{color:v/max>0.7?FG:'rgba(0,0,0,.50)', borderRadius:[0,4,4,0]}}}), barCategoryGap:'38%', label:{show:true, position:'right', color:FG3, fontSize:10, formatter:(p:any)=>'¥'+(p.value/10000).toFixed(1)+'w'} }]
  })
}

function loadCompany() {
  getCompanyShare().then((res:any) => {
    const data:any[] = res.data||[]
    if(!companyRef.value) return
    let c = echarts.getInstanceByDom(companyRef.value); if(!c) c = echarts.init(companyRef.value)
    const sum = data.reduce((s:number,i:any)=>s+Number(i.value||0),0)
    c.setOption({
      tooltip:{ ...TOOLTIP, trigger:'item', formatter:'{b}<br/>¥{c} ({d}%)' },
      series:[{ type:'pie', radius:['52%','72%'], center:['50%','50%'], itemStyle:{borderColor:'#fff',borderWidth:3}, label:{show:true, position:'center', formatter:()=>`{a|累计保费}\n{b|¥${(sum/10000).toFixed(0)}w}\n{c|${data.length} 家公司}`, rich:{a:{color:FG3,fontSize:11,lineHeight:20},b:{color:FG,fontSize:20,fontWeight:700,lineHeight:26},c:{color:'#a39e98',fontSize:10,lineHeight:16}}}, labelLine:{show:false}, data:data.map((d:any,i:number)=>({name:d.name,value:Number(d.value),itemStyle:{color:[FG,BLUE,GREEN,ORANGE,'#a39e98'][i%5]}})) }]
    })
  })
}

function loadProduct() {
  getProductByType().then((res:any) => {
    const data:any[] = res.data||[]
    if(!productRef.value) return
    let c = echarts.getInstanceByDom(productRef.value); if(!c) c = echarts.init(productRef.value)
    if (!data.length) {
      c.setOption({ series: [{ data: [] }] })
      return
    }
    c.setOption({
      tooltip:{ ...TOOLTIP, trigger:'item', formatter:'{b}<br/>{c} ({d}%)' },
      series:[{ type:'pie', radius:['52%','74%'], center:['50%','50%'], itemStyle:{borderColor:'#fff',borderWidth:2,borderRadius:3}, label:{show:true,formatter:'{b}\n{d}%',fontSize:10,color:'#31302e',lineHeight:14}, labelLine:{length:4,length2:6}, data:data.map((d:any,i:number)=>({name:d.name,value:Number(d.value),itemStyle:{color:[FG,BLUE,GREEN,ORANGE,PURPLE,'#a39e98'][i%6]}})) }]
    })
  })
}

function loadCommission() {
  getCommissionTrend().then((res:any) => {
    const rows:any[] = res.data||[]
    if(!commRef.value) return
    let c = echarts.getInstanceByDom(commRef.value); if(!c) c = echarts.init(commRef.value)
    c.setOption({
      grid:{ left:40, right:16, top:24, bottom:24 },
      tooltip:{ ...TOOLTIP, trigger:'axis' },
      legend:{ data:['佣金','保费'], right:0, top:0, itemWidth:8, itemHeight:8, textStyle:{color:FG3,fontSize:11} },
      xAxis:{ type:'category', data:rows.map(r=>r.m), axisLine:{lineStyle:{color:'rgba(0,0,0,.08)'}}, axisTick:{show:false}, axisLabel:{color:FG3,fontSize:10,rotate:30} },
      yAxis:{ type:'value', axisLine:{show:false}, axisTick:{show:false}, splitLine:{lineStyle:{color:'rgba(0,0,0,.06)'}}, axisLabel:{color:FG3,fontSize:10,formatter:(v:number)=>v>=10000?(v/10000).toFixed(0)+'w':v} },
      series:[{ name:'佣金', type:'bar', data:rows.map(r=>r.commission||0), itemStyle:{color:BLUE,borderRadius:[3,3,0,0]}, barWidth:14 },{ name:'保费', type:'bar', data:rows.map(r=>r.premium||0), itemStyle:{color:GREEN,borderRadius:[3,3,0,0]}, barWidth:14 }]
    })
  })
}

function resizeCharts() { ;[trendRef.value,marginRef.value,channelRef.value,salesRef.value,companyRef.value,productRef.value,commRef.value].forEach(el=>el&&echarts.getInstanceByDom(el)?.resize()) }

onMounted(() => {
  loadKpi(); loadRecent(); loadTrend()
  getChannelTop(10).then((res:any)=>loadHBar(channelRef,res.data||[]))
  getSalesmanTop(10).then((res:any)=>loadHBar(salesRef,res.data||[]))
  loadCompany(); loadProduct(); loadCommission()
  getActivityRate().then((res:any)=>{ activityRate.value = res.data||{} })
  window.addEventListener('resize',resizeCharts)
  setTimeout(resizeCharts,50); setTimeout(resizeCharts,300); setTimeout(resizeCharts,800)
})
onUnmounted(()=>{ window.removeEventListener('resize',resizeCharts) })
</script>
