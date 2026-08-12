<template>
  <div class="fan-frame">
    <div class="fan-head">
      <div class="fan-head-left" @click="goBack">
        <span v-if="canBack">‹</span>
      </div>
      <div class="fan-head-title">{{ title }}</div>
      <div class="fan-head-right"></div>
    </div>
    <div class="fan-body">
      <router-view v-slot="{ Component }">
        <transition name="slide">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    <div class="fan-tabbar">
      <router-link to="/h5/fan" replace class="tab">
        <div class="ico">⌂</div><div>主页</div>
      </router-link>
      <router-link to="/h5/fan/orders" replace class="tab">
        <div class="ico">≡</div><div>订单</div>
      </router-link>
      <router-link to="/h5/fan/points" replace class="tab">
        <div class="ico">✦</div><div>积分</div>
      </router-link>
      <router-link to="/h5/fan/qrcode" replace class="tab">
        <div class="ico">⎙</div><div>推广</div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const canBack = computed(() => window.history.length > 1)
const title = computed(() => (route.meta?.title as string) || '粉丝中心')

function goBack() {
  if (window.history.length > 1) router.back()
  else router.replace('/h5/fan')
}
</script>

<style scoped>
.fan-frame {
  min-height: 100vh;
  background: #f5f7fa;
  color: #2c3e50;
  display: flex; flex-direction: column;
  font-family: -apple-system, "Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif;
  max-width: 540px; margin: 0 auto;
  position: relative;
}
.fan-head {
  display: flex; align-items: center; justify-content: space-between;
  height: 44px; padding: 0 12px;
  background: linear-gradient(135deg, #07c160, #10ad55);
  color: #fff;
  position: sticky; top: 0; z-index: 10;
  box-shadow: 0 2px 8px rgba(7,193,96,0.2);
}
.fan-head-left { width: 32px; font-size: 28px; line-height: 44px; cursor: pointer; user-select: none; }
.fan-head-title { font-size: 16px; font-weight: 600; }
.fan-head-right { width: 32px; }
.fan-body { flex: 1; padding: 12px; padding-bottom: 60px; }
.fan-tabbar {
  position: fixed; bottom: 0; left: 0; right: 0;
  max-width: 540px; margin: 0 auto;
  height: 52px;
  background: #fff;
  border-top: 1px solid #ebeef5;
  display: flex; z-index: 10;
}
.tab {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: #909399; font-size: 11px; text-decoration: none;
}
.tab .ico { font-size: 20px; line-height: 1; margin-bottom: 2px; }
.tab.router-link-exact-active { color: #07c160; }

.slide-enter-from { transform: translateX(20px); opacity: 0; }
.slide-leave-to   { transform: translateX(-20px); opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: all 0.2s; }
</style>