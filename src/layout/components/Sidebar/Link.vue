<template>
  <component :is="type" v-bind="linkProps()" @click.stop.prevent="handleClick">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { isExternal } from '@/utils/validate'

const props = defineProps({
  to: {
    type: [String, Object],
    required: true
  }
})

const router = useRouter()
const isExt = computed(() => {
  return isExternal(props.to)
})

const type = computed(() => {
  if (isExt.value) {
    return 'a'
  }
  return 'router-link'
})

function linkProps() {
  if (isExt.value) {
    return {
      href: props.to,
      target: '_blank',
      rel: 'noopener'
    }
  }
  return {
    to: props.to
  }
}

// 拦截原生 click 事件, 改走 router.push, 避免 element-plus el-menu-item click 冲突
// 也防止 a 的默认导航触发整页跳转
function handleClick(e: MouseEvent) {
  if (isExt.value) {
    return
  }
  const to = props.to as any
  if (typeof to === 'string') {
    if (to && to !== router.currentRoute.value.path) {
      router.push(to)
    }
  } else if (to && typeof to === 'object' && to.path) {
    router.push(to)
  }
}
</script>
