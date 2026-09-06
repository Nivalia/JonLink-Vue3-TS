<template>
  <div class="home-tabs">
    <!-- 顶部标题栏 + Tab 切换 -->
    <div class="tabs-head">
      <div class="tabs-head-left">
        <span class="title-mark" />
        <h2 class="title-main">先知·智源管理系统 · 指挥中心</h2>
        <span class="title-sub">{{ activeTabMeta?.sub || '' }}</span>
      </div>

      <div class="tabs-head-right">
        <!-- Tab 切换条 -->
        <div class="tab-pills" role="tablist">
          <div
            v-for="t in tabs"
            :key="t.key"
            class="tab-pill"
            :class="{ active: activeKey === t.key }"
            role="tab"
            :aria-selected="activeKey === t.key"
            @click="switchTab(t.key)"
          >
            <el-icon class="tab-pill-icon" v-if="t.icon"><component :is="t.icon" /></el-icon>
            <span>{{ t.label }}</span>
          </div>
        </div>

        <span class="time-clock">{{ fmtClock }}</span>
      </div>
    </div>

    <!-- 各面板挂载点 -->
    <div class="tabs-body">
      <keep-alive :include="['CommandCenter','BizData','FinanceOverview','MpScreen']">
        <component :is="activeComponent" :key="activeKey" />
      </keep-alive>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onUnmounted, ref, shallowRef } from 'vue'
import { Money, Monitor, PieChart, TrendCharts } from '@element-plus/icons-vue'

const CommandCenter  = defineAsyncComponent(() => import('./panels/CommandCenter.vue'))
const BizData         = defineAsyncComponent(() => import('./panels/BizData.vue'))
const MpScreen        = defineAsyncComponent(() => import('./panels/MpScreen.vue'))
const FinanceOverview = defineAsyncComponent(() => import('./panels/FinanceOverview.vue'))

interface TabItem { key: string; label: string; icon: any; sub: string; comp: any }
const tabs: TabItem[] = [
  { key: 'command',  label: '指挥中心', icon: Monitor,    sub: '公众号 · 保险台账 汇总',          comp: CommandCenter },
  { key: 'biz',      label: '业务数据', icon: TrendCharts, sub: '保险台账 · 业务员 · 渠道',         comp: BizData },
  { key: 'mp',       label: '公众号大屏', icon: PieChart,   sub: '粉丝 · 流水 · 公众号运营',        comp: MpScreen },
  { key: 'finance',  label: '财务总览', icon: Money,       sub: '科目余额 · 利润 · 资产负债',      comp: FinanceOverview },
]

const activeKey = ref<string>('command')
const activeComponent = computed(() => tabs.find(t => t.key === activeKey.value)!.comp)
const activeTabMeta = computed(() => tabs.find(t => t.key === activeKey.value))

function switchTab(key: string) {
  if (key === activeKey.value) return
  activeKey.value = key
}

// 顶部时钟
const now = ref(new Date())
let clockTimer: ReturnType<typeof setInterval> | undefined
const pad = (n: number) => String(n).padStart(2, '0')
const fmtClock = computed(() => `${pad(now.value.getHours())}:${pad(now.value.getMinutes())}:${pad(now.value.getSeconds())}`)

const _ = shallowRef(0)  // 占位引用避免 lint 抱怨 defineAsyncComponent

clockTimer = setInterval(() => { now.value = new Date() }, 1000)
onUnmounted(() => { if (clockTimer) clearInterval(clockTimer) })
</script>

<style scoped>
/* ========== 主容器：一屏满尺寸无滚动 ========== */
.home-tabs {
  height: calc(100vh - 84px);
  margin: -16px;
  padding: 0;
  background: linear-gradient(180deg, #050b05 0%, #0a121e 100%);
  color: #cfe3ff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

/* ===== 顶部：标题 + Tab 切换 + 时钟 ===== */
.tabs-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px;
  border-bottom: 1px solid rgba(62, 201, 167, 0.18);
  flex-shrink: 0;
  gap: 16px;
}
.tabs-head-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
.tabs-head-right { display: flex; align-items: center; gap: 14px; }

.title-mark {
  width: 4px; height: 22px;
  background: linear-gradient(180deg, #3ec9a7, #4da3ff);
  border-radius: 2px;
  flex-shrink: 0;
}
.title-main {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #e7f3ff;
  letter-spacing: 1.5px;
  text-shadow: 0 0 12px rgba(77, 163, 255, 0.35);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.title-sub {
  font-size: 12px;
  color: #7fa3c7;
  padding: 2px 8px;
  background: rgba(77, 163, 255, 0.1);
  border: 1px solid rgba(77, 163, 255, 0.3);
  border-radius: 3px;
  white-space: nowrap;
}

.time-clock {
  color: #3ec9a7;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Consolas', monospace;
  font-variant-numeric: tabular-nums;
  min-width: 70px;
  text-align: right;
}

/* ===== Tab 胶囊切换 (Notion 风格:白底胶囊 + 蓝底 active 在暗背景里) ===== */
.tab-pills {
  display: flex;
  gap: 4px;
  padding: 3px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(77, 163, 255, 0.25);
  border-radius: 9999px;
  backdrop-filter: blur(4px);
}
.tab-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #7fa3c7;
  border-radius: 9999px;
  cursor: pointer;
  user-select: none;
  transition: background .18s ease, color .18s ease, box-shadow .18s ease;
  white-space: nowrap;
}
.tab-pill:hover {
  background: rgba(77, 163, 255, 0.12);
  color: #cfe3ff;
}
.tab-pill.active {
  background: linear-gradient(135deg, #4da3ff 0%, #2a8ae8 100%);
  color: #fff;
  box-shadow: 0 0 12px rgba(77, 163, 255, 0.45);
}
.tab-pill-icon { font-size: 13px; }

/* ===== Panel 容器：每个 panel 自己负责一屏布局 ===== */
.tabs-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.tabs-body > * { flex: 1; min-height: 0; }

/* ===== 滚动条 ===== */
.home-tabs *::-webkit-scrollbar { width: 4px; height: 4px; }
.home-tabs *::-webkit-scrollbar-track { background: transparent; }
.home-tabs *::-webkit-scrollbar-thumb { background: rgba(77, 163, 255, 0.3); border-radius: 2px; }
.home-tabs *::-webkit-scrollbar-thumb:hover { background: rgba(77, 163, 255, 0.5); }

/* 窄屏：标题可隐藏 title-sub */
@media (max-width: 1100px) {
  .title-sub { display: none; }
  .title-main { font-size: 16px; }
}
</style>
