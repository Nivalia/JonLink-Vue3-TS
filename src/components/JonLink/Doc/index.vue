<template>
  <div>
    <svg-icon icon-class="question" @click="goto" />
  </div>
</template>

<script setup lang="ts">
const url = ref<string>('http://doc.jonlink.vip/jonlink-vue')

function goto(): void {
  window.open(url.value)
}
</script>