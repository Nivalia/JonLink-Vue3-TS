<template>
  <div class="fan-orders">
    <div v-if="!loading && !list.length" class="empty">
      <div class="empty-ico">📋</div>
      <div class="empty-text">暂无订单</div>
    </div>
    <div class="card" v-for="o in list" :key="o.id" v-else>
      <div class="head">
        <span class="no">#{{ o.orderNo || o.id }}</span>
        <span class="status" :class="'st' + o.status">{{ statusName(o.status) }}</span>
      </div>
      <div class="body">
        <div class="line"><span>商品</span><span>{{ o.productName || '-' }}</span></div>
        <div class="line"><span>金额</span><b class="amt">¥ {{ o.amount || 0 }}</b></div>
        <div class="line"><span>时间</span><span>{{ o.createTime }}</span></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import request from '@/utils/request'
import { finDict } from '@/utils/financeDict'

const loading = ref(true)
const list = ref<any[]>([])

const { wx_pay_status } = useDict('wx_pay_status')

function statusName(s: string) { return finDict(s, 'wx_pay_status') }

onMounted(() => {
  const ticket = new URLSearchParams(window.location.search).get('ticket') || ''
  request({ url: '/wx/h5/order/list', method: 'get', params: { ticket, limit: 20 } }).then((res: any) => {
    list.value = res.data || []
  }).finally(() => loading.value = false)
})
</script>

<style scoped>
.card { background:#fff; border-radius:10px; padding:14px; margin-bottom:10px; box-shadow:0 2px 10px rgba(0,0,0,0.04); }
.head { display:flex; justify-content:space-between; align-items:center; padding-bottom:8px; border-bottom:1px solid #f0f1f3; }
.no { font-size:13px; color:#909399; font-family: monospace; }
.status { font-size:12px; padding:2px 8px; border-radius:3px; background:#f0f9eb; color:#67c23a; }
.status.st0 { background:#fdf6ec; color:#e6a23c; }
.status.st1 { background:#ecf5ff; color:#409eff; }
.status.st2 { background:#f0f9eb; color:#67c23a; }
.status.st3 { background:#fef0f0; color:#f56c6c; }
.empty { text-align:center; padding:60px 0; color:#c0c4cc; }
.empty-ico { font-size:48px; margin-bottom:10px; }
.empty-text { font-size:13px; }
.line { display:flex; justify-content:space-between; padding:4px 0; font-size:13px; color:#606266; }
.amt { color:#f56c6c; font-weight:600; }
.tip { text-align:center; color:#c0c4cc; font-size:12px; padding:20px 0; }
</style>