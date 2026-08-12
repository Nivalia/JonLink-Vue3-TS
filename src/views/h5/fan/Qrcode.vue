<template>
  <div class="fan-qrcode">
    <div class="card">
      <div class="title">我的推广码</div>
      <div class="sub">朋友扫码关注后, 您将获得分销积分</div>
      <div class="qr-wrap">
        <canvas ref="qrCanvas" width="220" height="220"></canvas>
      </div>
      <div class="openid">openid: {{ openid?.slice(0, 16) }}…</div>
      <el-button type="primary" size="small" @click="download" style="margin-top: 10px;">下载图片</el-button>
    </div>
    <div class="rule">
      <h4>推广规则</h4>
      <p>① 朋友扫码关注后自动绑定您为推荐人</p>
      <p>② 朋友产生核销后, 您获得分销积分 (后台配置比例)</p>
      <p>③ 积分可兑换权益, 在「我的积分」查看</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import QRCode from 'qrcode'

const qrCanvas = ref<HTMLCanvasElement>()
const openid = ref('')

onMounted(() => {
  openid.value = new URLSearchParams(window.location.search).get('openid') || ''
  if (qrCanvas.value && openid.value) {
    // 推广 URL: 带 openid 走 /wx/oauth/jump 链式授权
    const url = `${window.location.origin}/wx/oauth/jump?redirectUri=${encodeURIComponent(window.location.origin + '/h5/fan/qrcode')}&scope=snsapi_base&state=spread_${openid.value}`
    QRCode.toCanvas(qrCanvas.value, url, { width: 220, color: { dark: '#07c160', light: '#fff' } })
  }
})

function download() {
  if (!qrCanvas.value) return
  const a = document.createElement('a')
  a.href = qrCanvas.value.toDataURL('image/png')
  a.download = `推广码_${openid.value?.slice(-6)}.png`
  a.click()
}
</script>

<style scoped>
.card { background:#fff; border-radius:10px; padding:20px; text-align:center; box-shadow:0 2px 10px rgba(0,0,0,0.04); }
.title { font-size:16px; font-weight:600; }
.sub { font-size:12px; color:#909399; margin-top:4px; }
.qr-wrap { padding: 16px 0; }
.openid { font-size:11px; color:#909399; font-family: monospace; }
.rule { background:#fff; border-radius:10px; padding:14px 16px; margin-top:10px; box-shadow:0 2px 10px rgba(0,0,0,0.04); }
.rule h4 { font-size:14px; margin:0 0 6px; color:#2c3e50; }
.rule p { font-size:12px; color:#606266; line-height:1.8; margin:0; }
</style>