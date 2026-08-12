<template>
  <div class="oauth-gate">
    <div class="logo">先知·智源</div>
    <div class="title">公众号粉丝中心</div>
    <div class="sub">{{ subText }}</div>
    <el-button type="primary" :loading="loading" @click="goAuth" size="large" round style="width: 80%; margin-top: 30px;">
      {{ btnText }}
    </el-button>
    <div class="meta">
      <p>· 授权后可查看订单 / 积分 / 推广码</p>
      <p>· 公众号 H5 端，全程 https 加密</p>
    </div>
    <div class="debug" v-if="showDebug">
      <div>openid: {{ openid || '尚未授权' }}</div>
      <div>scope: {{ scope }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const openid = ref('')
const scope = ref('')
const loading = ref(false)

const showDebug = ref(true)
const subText = computed(() => openid.value ? '已识别身份, 可直接进入粉丝中心' : '首次访问需微信一键授权')
const btnText = computed(() => openid.value ? '进入粉丝中心' : '微信一键授权')

function parseQuery() {
  const q = new URLSearchParams(window.location.search)
  openid.value = q.get('openid') || ''
  scope.value = q.get('scope') || ''
  // 清洗 URL
  if (openid.value) {
    const url = new URL(window.location.href)
    url.searchParams.delete('openid')
    url.searchParams.delete('scope')
    window.history.replaceState({}, '', url.pathname + (url.searchParams.toString() ? '?' + url.searchParams.toString() : ''))
  }
}

function goAuth() {
  if (openid.value) {
    window.location.href = '/h5/fan?openid=' + encodeURIComponent(openid.value)
    return
  }
  loading.value = true
  // 一站式跳 OAuth
  const redirect = encodeURIComponent(window.location.origin + '/h5/oauth')
  window.location.href = `/wx/oauth/jump?redirectUri=${redirect}&scope=snsapi_userinfo&state=fan`
}

onMounted(() => {
  parseQuery()
  // 简单看是不是微信内
})
</script>

<style scoped>
.oauth-gate {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f7fa 0%, #e8f5ee 100%);
  display: flex; flex-direction: column; align-items: center;
  padding: 80px 24px 40px;
  color: #2c3e50;
  font-family: -apple-system, "Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif;
  max-width: 540px; margin: 0 auto;
  box-sizing: border-box;
}
.logo { font-size: 30px; font-weight: 700; color: #07c160; letter-spacing: 2px; }
.title { font-size: 18px; font-weight: 600; margin-top: 12px; }
.sub { font-size: 13px; color: #909399; margin-top: 6px; }
.meta { margin-top: 40px; color: #909399; font-size: 12px; line-height: 1.8; text-align: center; }
.meta p { margin: 0; }
.debug {
  position: fixed; bottom: 10px; left: 0; right: 0; max-width: 540px; margin: 0 auto;
  background: rgba(0,0,0,0.7); color: #fff; padding: 8px;
  font-size: 11px; font-family: monospace; text-align: center;
}
</style>