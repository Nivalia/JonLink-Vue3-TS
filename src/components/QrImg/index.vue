<template>
  <img
    v-if="dataUrl"
    :src="dataUrl"
    :width="size"
    :height="size"
    class="qr-img"
    :style="{ cursor: clickable ? 'pointer' : 'default' }"
    @click="emit('click')"
    :title="title"
  />
  <div v-else class="qr-img qr-loading" :style="{ width: size + 'px', height: size + 'px' }">…</div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import QRCode from 'qrcode'

const props = withDefaults(defineProps<{
  /** 二维码内容(链接/文本)，为空不渲染 */
  content: string
  /** 展示尺寸 px */
  size?: number
  /** 是否可点击(鼠标手型) */
  clickable?: boolean
  /** 悬浮提示 */
  title?: string
}>(), { size: 160, clickable: false, title: '点击查看大图' })

const emit = defineEmits<{ (e: 'click'): void }>()
const dataUrl = ref('')

function gen() {
  if (!props.content) {
    dataUrl.value = ''
    return
  }
  QRCode.toDataURL(props.content, { width: props.size * 3, margin: 1, errorCorrectionLevel: 'M' })
    .then((url: string) => {
      dataUrl.value = url
    })
    .catch(() => {
      dataUrl.value = ''
    })
}

onMounted(gen)
watch(() => props.content, gen)
</script>

<style scoped>
.qr-img {
  border-radius: 4px;
  display: block;
  background: #fff;
  border: 1px solid #ebeef5;
  padding: 2px;
}
.qr-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  color: #c0c4cc;
  font-size: 12px;
}
</style>
