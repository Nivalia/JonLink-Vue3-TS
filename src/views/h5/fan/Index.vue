<template>
  <div class="fan-index">
    <!-- 用户卡片 -->
    <div class="user-card">
      <div class="avatar">{{ avatarChar }}</div>
      <div class="info">
        <div class="nickname">{{ user.nickname || '微信用户' }}
          <span class="badge" v-if="user.subscribe === '1'">已关注</span>
        </div>
        <div class="meta">
          <span v-if="user.city">{{ user.province }} {{ user.city }}</span>
          <span v-else>未设置地区</span>
        </div>
        <div class="meta small" v-if="user.phone">📱 {{ user.phone }}</div>
        <div class="meta small">openid: {{ openid?.slice(0, 12) }}…</div>
      </div>
    </div>

    <!-- 4 宫格指标 -->
    <div class="grid-4">
      <div class="grid-item">
        <div class="num">{{ stats.points || 0 }}</div>
        <div class="lbl">可用积分</div>
      </div>
      <div class="grid-item">
        <div class="num">{{ stats.orders || 0 }}</div>
        <div class="lbl">我的订单</div>
      </div>
      <div class="grid-item">
        <div class="num">{{ stats.coupons || 0 }}</div>
        <div class="lbl">优惠券</div>
      </div>
      <div class="grid-item">
        <div class="num">{{ stats.distribute || 0 }}</div>
        <div class="lbl">推广人数</div>
      </div>
    </div>

    <!-- 入口 -->
    <div class="entry">
      <router-link to="/h5/fan/orders" class="entry-item">
        <span class="ico">📋</span>
        <span>我的订单</span>
        <span class="arrow">›</span>
      </router-link>
      <router-link to="/h5/fan/points" class="entry-item">
        <span class="ico">💎</span>
        <span>积分明细</span>
        <span class="arrow">›</span>
      </router-link>
      <router-link to="/h5/fan/qrcode" class="entry-item">
        <span class="ico">📢</span>
        <span>我的推广码</span>
        <span class="arrow">›</span>
      </router-link>
      <div class="entry-item" @click="copyOpenid">
        <span class="ico">🔗</span>
        <span>复制 openid</span>
        <span class="arrow">›</span>
      </div>
    </div>

    <div class="footer-tip">先知·智源 · 公众号粉丝端</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import request from '@/utils/request'

const openid = ref<string>('')
const user = ref<any>({})
const stats = ref<any>({})
const avatarChar = computed(() => (user.value.nickname || '微').charAt(0).toUpperCase())

function parseQuery() {
  const q = new URLSearchParams(window.location.search)
  openid.value = q.get('openid') || ''
  // URL 清洗 (避免分享时残留参数)
  if (openid.value) {
    const url = new URL(window.location.href)
    url.search = ''
    url.searchParams.set('openid', openid.value)
    window.history.replaceState({}, '', url.toString())
  }
}

function loadUser() {
  if (!openid.value) return
  request({ url: '/wx/oauth/user', method: 'get', params: { openid: openid.value } }).then((res: any) => {
    if (res.code === 200) user.value = res.data || {}
  })
}

function loadStats() {
  // mock: 走 fan 中心 stats（沿用 dashboardTopDistrict 风格但限定本人）
  // 暂用 mock 数据, 等真实接口接入
  stats.value = { points: 1280, orders: 6, coupons: 3, distribute: 2 }
}

function copyOpenid() {
  if (!openid.value) return
  navigator.clipboard?.writeText(openid.value)
  // 简易提示
  const tip = document.createElement('div')
  tip.innerText = 'openid 已复制'
  tip.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,.7);color:#fff;padding:8px 16px;border-radius:6px;z-index:9999;font-size:14px'
  document.body.appendChild(tip)
  setTimeout(() => tip.remove(), 1200)
}

onMounted(() => {
  parseQuery()
  loadUser()
  loadStats()
})
</script>

<style scoped>
.fan-index { display: flex; flex-direction: column; gap: 10px; }

.user-card {
  display: flex; align-items: center; gap: 14px;
  padding: 16px;
  background: linear-gradient(135deg, #fff, #fafdfa);
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
}
.avatar {
  width: 56px; height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #07c160, #10ad55);
  color: #fff; font-size: 24px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.info { flex: 1; min-width: 0; }
.nickname { font-size: 17px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
.badge { font-size: 10px; padding: 1px 6px; border-radius: 3px; background: #07c160; color: #fff; font-weight: normal; }
.meta { font-size: 12px; color: #909399; margin-top: 2px; }
.meta.small { font-size: 11px; opacity: 0.7; }

.grid-4 {
  display: grid; grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 6px;
  background: #fff;
  border-radius: 10px;
  padding: 14px 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
}
.grid-item { text-align: center; }
.grid-item .num { font-size: 20px; font-weight: 700; color: #2c3e50; font-family: 'DIN', sans-serif; }
.grid-item .lbl { font-size: 11px; color: #909399; margin-top: 2px; }

.entry {
  background: #fff; border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  overflow: hidden;
}
.entry-item {
  display: flex; align-items: center; gap: 10px;
  padding: 14px;
  border-bottom: 1px solid #f0f1f3;
  font-size: 14px;
  color: #2c3e50;
  text-decoration: none;
}
.entry-item:last-child { border-bottom: none; }
.entry-item .ico { font-size: 18px; }
.entry-item .arrow { margin-left: auto; color: #c0c4cc; font-size: 18px; }

.footer-tip { text-align: center; color: #c0c4cc; font-size: 11px; padding: 16px 0; }
</style>