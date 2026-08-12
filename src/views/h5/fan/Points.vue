<template>
  <div class="fan-points">
    <div class="balance">
      <div class="lbl">可用积分</div>
      <div class="num">{{ total }}</div>
      <div class="sub">来自核销/活动/推广奖励</div>
    </div>
    <div class="card">
      <div class="head">积分流水</div>
      <div v-if="!list.length" class="empty">暂无积分记录</div>
      <div v-for="r in list" :key="r.id" class="row">
        <div class="row-left">
          <div class="title">{{ r.title || '积分变更' }}</div>
          <div class="time">{{ r.time }}</div>
        </div>
        <div class="amt" :class="r.direction === '1' ? 'out' : 'in'">
          {{ r.direction === '1' ? '-' : '+' }}{{ r.points }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import request from '@/utils/request'

const list = ref<any[]>([])
const total = computed(() => list.value.filter((r) => r.direction !== '1').reduce((s, r) => s + Number(r.points || 0), 0))

onMounted(() => {
  const ticket = new URLSearchParams(window.location.search).get('ticket') || ''
  request({ url: '/wx/h5/points/list', method: 'get', params: { ticket, limit: 30 } }).then((res: any) => {
    list.value = res.data || []
  })
})
</script>

<style scoped>
.balance { background: linear-gradient(135deg, #07c160, #10ad55); color: #fff; padding: 24px; border-radius: 10px; text-align: center; }
.balance .lbl { font-size: 13px; opacity: 0.9; }
.balance .num { font-size: 36px; font-weight: 700; margin: 6px 0; font-family: DIN, sans-serif; }
.balance .sub { font-size: 11px; opacity: 0.8; }
.card { background:#fff; border-radius:10px; margin-top:10px; padding:6px 14px; box-shadow:0 2px 10px rgba(0,0,0,0.04); }
.head { font-size:14px; font-weight:600; padding:10px 0; border-bottom:1px solid #f0f1f3; }
.row { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #f7f7f7; }
.row:last-child { border-bottom:none; }
.title { font-size:14px; color:#2c3e50; }
.time { font-size:11px; color:#909399; margin-top:2px; }
.amt { font-weight:600; font-family:DIN, sans-serif; }
.amt.in { color:#07c160; }
.amt.out { color:#f56c6c; }
.empty { text-align:center; color:#c0c4cc; padding:20px 0; }
</style>