<template>
  <div class="h5-verify">
    <div class="card">
      <div class="title">核销订单</div>
      <div v-if="loading" class="state loading">加载字段配置中...</div>
      <div v-else-if="loadError" class="state error">{{ loadError }}</div>
      <el-form v-else ref="formRef" :model="form" :rules="rules" label-position="top" size="large" @submit.prevent>
        <el-form-item v-for="f in visibleFields" :key="f.fieldKey" :label="f.fieldLabel" :prop="f.fieldKey">
          <el-input
            v-if="f.fieldType === '1'"
            type="textarea"
            v-model="form[f.fieldKey]"
            :placeholder="'请输入' + f.fieldLabel"
          />
          <el-input
            v-else
            v-model="form[f.fieldKey]"
            :placeholder="'请输入' + f.fieldLabel"
            :maxlength="f.fieldKey === 'phone' ? 11 : 200"
          />
        </el-form-item>
        <el-button type="primary" size="large" :loading="submitting" class="submit" @click="onSubmit">
          提交核销
        </el-button>
        <div v-if="result" class="result" :class="result.ok ? 'ok' : 'err'">
          {{ result.msg }}
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { renderFcConfig } from '@/api/wx/fcConfig'
import { h5Verify } from '@/api/wx/verify'
import type { WxFcConfig } from '@/types/api/wx/fcConfig'

const route = useRoute()
const loading = ref(true)
const loadError = ref('')
const submitting = ref(false)
const fields = ref<WxFcConfig[]>([])
const form = reactive<Record<string, string>>({})
const formRef = ref()
const result = ref<{ ok: boolean; msg: string } | null>(null)

const visibleFields = computed(() => fields.value.filter(f => f.visible === '1').sort((a, b) => a.sortNo - b.sortNo))

const rules = computed(() => {
  const r: Record<string, any[]> = {}
  for (const f of visibleFields.value) {
    if (f.required === '1') {
      r[f.fieldKey] = [{ required: true, message: f.fieldLabel + '不能为空', trigger: 'blur' }]
    }
  }
  return r
})

onMounted(async () => {
  try {
    const res = await renderFcConfig('0')
    if (res.code === 200) {
      fields.value = (res.data as WxFcConfig[]) || []
    } else {
      loadError.value = res.msg || '加载失败'
    }
  } catch (e: any) {
    loadError.value = '网络异常,请稍后重试'
  } finally {
    loading.value = false
  }
  const qOrderNo = (route.query.orderNo as string) || ''
  if (qOrderNo) form.order_no = qOrderNo
})

async function onSubmit() {
  result.value = null
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  submitting.value = true
  try {
    const core: Record<string, string> = {}
    const ext: Record<string, string> = {}
    for (const f of visibleFields.value) {
      const v = (form[f.fieldKey] || '').trim()
      if (['order_no', 'phone', 'amount', 'car_no'].includes(f.fieldKey)) {
        core[f.fieldKey] = v
      } else {
        ext[f.fieldKey] = v
      }
    }
    const res = await h5Verify({
      orderNo: core.order_no,
      phone: core.phone,
      carNo: core.car_no,
      amount: core.amount,
      extJson: Object.keys(ext).length ? JSON.stringify(ext) : undefined
    } as any)
    if (res.code === 200) {
      result.value = { ok: true, msg: '核销成功' }
    } else {
      result.value = { ok: false, msg: res.msg || '核销失败' }
    }
  } catch (e: any) {
    result.value = { ok: false, msg: e?.message || '提交异常' }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.h5-verify {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 16px;
}
.card {
  background: #fff;
  border-radius: 8px;
  padding: 20px 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
}
.state {
  text-align: center;
  padding: 40px 0;
  color: #999;
}
.state.error {
  color: #f56c6c;
}
.submit {
  width: 100%;
  margin-top: 8px;
}
.result {
  margin-top: 16px;
  text-align: center;
  font-size: 14px;
  padding: 10px;
  border-radius: 4px;
}
.result.ok {
  color: #67c23a;
  background: #f0f9eb;
}
.result.err {
  color: #f56c6c;
  background: #fef0f0;
}
</style>
