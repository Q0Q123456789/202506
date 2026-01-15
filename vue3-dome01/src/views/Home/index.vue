<template>
  <div class="home">home</div>
</template>

<script setup lang="ts">
import { useWebSocket } from '@vueuse/core'

const ws = import.meta.env.VITE_APP_WS_URL
const { status, data, send, open, close } = useWebSocket(`${ws}/${crypto.randomUUID()}`)
interface FormItems {
  name: string
  age: number | string
  address: string
}
const formItems = ref<FormItems>({
  name: '',
  age: '',
  address: ''
})

watch(
  () => status.value,
  (newStatus) => {
    console.log('WebSocket Status:', newStatus)
    if (newStatus === 'OPEN') {
      send(
        JSON.stringify({
          event: 'greet',
          data: 'Hello, server!'
        })
      )
    }
  }
)

watch(
  () => data.value,
  (newData) => {
    console.log('WebSocket Data:', newData)
  }
)
</script>

<style lang="less" scoped>
.home {
  color: red;
}
</style>
