<template>
  <div class="home-notion">
    <!-- Notion-style top nav -->
    <nav class="nav">
      <div class="nav-links">
        <div
          v-for="t in tabs"
          :key="t.key"
          class="nav-link"
          :class="{ active: activeKey === t.key }"
          @click="switchTab(t.key)"
        >
          {{ t.label }}
        </div>
      </div>
    </nav>

    <!-- Panel mount point -->
    <div class="notion-body">
      <keep-alive :include="['CommandCenter','BizData','FinanceOverview','MpScreen']">
        <component :is="activeComponent" :key="activeKey" />
      </keep-alive>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'

const CommandCenter  = defineAsyncComponent(() => import('./index-v2/panels/CommandCenter.vue'))
const BizData         = defineAsyncComponent(() => import('./index-v2/panels/BizData.vue'))
const MpScreen        = defineAsyncComponent(() => import('./index-v2/panels/MpScreen.vue'))
const FinanceOverview = defineAsyncComponent(() => import('./index-v2/panels/FinanceOverview.vue'))

interface TabItem { key: string; label: string; comp: any }
const tabs: TabItem[] = [
  { key: 'command',  label: '指挥中心', comp: CommandCenter },
  { key: 'biz',      label: '业务数据', comp: BizData },
  { key: 'mp',       label: '公众号',   comp: MpScreen },
  { key: 'finance',  label: '财务',     comp: FinanceOverview },
]

const activeKey = ref<string>('command')
const activeComponent = computed(() => tabs.find(t => t.key === activeKey.value)!.comp)

function switchTab(key: string) {
  if (key === activeKey.value) return
  activeKey.value = key
}
</script>

<style>
@import '@/styles/notion-theme.css';

/* Global Notion reset for dashboard */
.home-notion {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: var(--bg);
  color: var(--fg);
  font-size: 15px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  height: calc(100vh - 84px);
  margin: -16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Notion nav */
.nav {
  position: sticky; top: 0; z-index: 50;
  background: rgba(255,255,255,0.85); backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid var(--line);
  height: 56px;
  display: flex; align-items: center; padding: 0 24px; gap: 24px;
  flex-shrink: 0;
}
.nav-links { display: flex; gap: 4px; }
.nav-link {
  padding: 6px 12px; border-radius: var(--r-sm); font-size: 14px;
  color: var(--fg-3); font-weight: 500; cursor: pointer;
  transition: background .15s, color .15s;
}
.nav-link:hover { background: var(--bg-warm); color: var(--fg); }
.nav-link.active { background: var(--bg-warm-2); color: var(--fg); }
/* Panel body */
.notion-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.notion-body > * { min-height: 0; }

/* Shared Notion card/component styles */
.notion-page {
  max-width: 1600px;
  margin: 0 auto;
  padding: 32px 24px 60px;
}
.page-head { margin-bottom: 32px; display: flex; align-items: flex-end; gap: 16px; }
.page-head .lede {
  text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px;
  color: var(--fg-3); font-weight: 600; margin-bottom: 6px;
}
.page-head h1 {
  margin: 0; font-size: 40px; font-weight: 700;
  letter-spacing: -1.5px; line-height: 1.05; color: var(--fg);
}
.page-head h1 em { font-style: normal; color: var(--blue); }
.page-head .meta { margin-left: auto; display: flex; gap: 8px; align-items: center; font-size: 13px; color: var(--fg-3); }

.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: var(--r-sm); border: 1px solid transparent;
  font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s var(--ease);
  background: transparent; color: var(--fg-2);
}
.btn:hover { background: var(--bg-warm); }
.btn-primary { background: var(--blue); color: #fff; }
.btn-primary:hover { background: var(--blue-d); }
.btn-pill { border-radius: var(--r-pill); padding: 4px 14px; font-size: 12px; }

.tag {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 10px; border-radius: var(--r-pill);
  font-size: 11px; font-weight: 600;
  background: var(--bg-warm); color: var(--fg-3);
}
.tag-blue { background: var(--blue-bg); color: var(--blue); }
.tag-green { background: #ebf8f1; color: var(--green); }
.tag-orange { background: #fdf2e9; color: var(--orange); }
.tag-red { background: #fde8e8; color: #c92a2a; }
.tag-purple { background: #f1ecff; color: var(--purple); }
.tag .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

.card {
  background: #fff; border: 1px solid var(--line);
  border-radius: var(--r); padding: 20px 22px;
  box-shadow: var(--shadow-card);
  transition: box-shadow .25s var(--ease), transform .25s var(--ease);
}
.card:hover { box-shadow: var(--shadow-deep); }
.card-warm { background: var(--bg-warm); }
.card-head {
  display: flex; align-items: baseline; justify-content: space-between;
  margin-bottom: 14px;
}
.card-eyebrow {
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em;
  color: var(--fg-4); font-weight: 600; margin-bottom: 4px;
}
.card-title { font-size: 16px; font-weight: 700; letter-spacing: -0.2px; color: var(--fg); }
.card-extra { font-size: 12px; color: var(--fg-3); }

.kpi { padding: 22px 22px 20px; }
.kpi-eyebrow {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--fg-3); font-weight: 500; margin-bottom: 8px;
}
.kpi-eyebrow .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--blue); }
.kpi-eyebrow .dot.pos { background: var(--green); }
.kpi-eyebrow .dot.warn { background: var(--orange); }
.kpi-num {
  font-size: 38px; font-weight: 700; letter-spacing: -1.5px; line-height: 1;
  color: var(--fg); font-variant-numeric: tabular-nums;
}
.kpi-num .currency { font-size: 18px; color: var(--fg-3); font-weight: 500; margin-right: 2px; }
.kpi-num .unit { font-size: 16px; color: var(--fg-3); font-weight: 500; margin-left: 2px; }
.kpi-foot {
  display: flex; align-items: center; gap: 8px; margin-top: 12px;
  font-size: 12px; color: var(--fg-3);
}
.kpi-foot .delta { font-weight: 600; }

.bento { display: grid; gap: 16px; grid-template-columns: repeat(12, 1fr); }
.s-12 { grid-column: span 12; }
.s-8 { grid-column: span 8; }
.s-7 { grid-column: span 7; }
.s-6 { grid-column: span 6; }
.s-5 { grid-column: span 5; }
.s-4 { grid-column: span 4; }
.s-3 { grid-column: span 3; }
.s-2 { grid-column: span 2; }
@media (max-width: 1100px) {
  .s-8, .s-7, .s-6, .s-5 { grid-column: span 12; }
  .s-4, .s-3, .s-2 { grid-column: span 6; }
}
@media (max-width: 640px) { [class*="s-"] { grid-column: span 12 !important; } }

.section + .section { margin-top: 32px; }
.section-label {
  display: flex; align-items: baseline; gap: 8px;
  font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em;
  font-weight: 600; color: var(--fg-3);
  margin-bottom: 12px;
}
.section-label::before {
  content: ''; display: inline-block; width: 16px; height: 2px;
  background: var(--blue); border-radius: 1px;
}

.list { display: flex; flex-direction: column; }
.li {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 0; border-bottom: 1px solid var(--line);
  font-size: 13px; transition: background .15s;
}
.li:last-child { border-bottom: none; }
.li:hover { background: var(--bg-warm); margin: 0 -22px; padding: 12px 22px; border-radius: 6px; }
.li .li-ico {
  width: 28px; height: 28px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-warm); color: var(--fg-2); font-size: 13px; flex-shrink: 0;
}
.li .li-ico.blue { background: var(--blue-bg); color: var(--blue); }
.li .li-ico.green { background: #ebf8f1; color: var(--green); }
.li .li-ico.orange { background: #fdf2e9; color: var(--orange); }
.li .li-main { flex: 1; min-width: 0; }
.li .li-title { font-weight: 500; color: var(--fg); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.li .li-sub { font-size: 11px; color: var(--fg-3); margin-top: 2px; }
.li .li-amt { font-weight: 600; font-variant-numeric: tabular-nums; }
.li .li-amt.pos { color: var(--green); }
.li .li-amt.neg { color: #c92a2a; }

.progress-list { display: flex; flex-direction: column; gap: 14px; }
.progress-row .head { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; }
.progress-row .lbl { color: var(--fg-3); }
.progress-row .val { color: var(--fg); font-weight: 600; font-variant-numeric: tabular-nums; }
.progress-bar { height: 6px; background: var(--bg-warm); border-radius: 999px; overflow: hidden; }
.progress-fill {
  height: 100%; border-radius: 999px; width: 0;
  background: var(--blue);
  transition: width 1.4s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.progress-fill.green { background: var(--green); }
.progress-fill.orange { background: var(--orange); }

.chart { width: 100%; height: 280px; }
.chart-sm { height: 200px; }
.chart-xs { height: 160px; }

/* Notion light ECharts tooltip */
.notion-tooltip {
  background: rgba(255,255,255,.96) !important;
  border-color: rgba(0,0,0,0.10) !important;
  border-width: 1px !important;
  color: var(--fg) !important;
  box-shadow: 0 8px 32px rgba(0,0,0,.08);
  border-radius: 8px !important;
}

/* Dark table variant for data grids */
.dt { width: 100%; border-collapse: collapse; font-size: 13px; }
.dt thead th {
  text-align: left; padding: 12px; font-weight: 600; color: var(--fg-3);
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;
  border-bottom: 1px solid var(--line);
}
.dt tbody tr { border-bottom: 1px solid var(--line); transition: background .15s; }
.dt tbody tr:hover { background: var(--bg-warm); }
.dt tbody td { padding: 12px; font-variant-numeric: tabular-nums; color: var(--fg-2); }
.dt .right { text-align: right; }
</style>
