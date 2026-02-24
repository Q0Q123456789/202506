<template>
  <div class="home" id="terminal">home</div>
</template>

<script setup>
import { useWebSocket } from '@vueuse/core'
import { ref, watch } from 'vue'
import { Terminal } from '@xterm/xterm'

const terminal = ref(null)

onMounted(() => {
  terminal.value = new Terminal()
  terminal.value.open(document.getElementById('terminal'))
  terminal.value.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')
})

const ws = import.meta.env.VITE_APP_WS_URL
const { status, data, send, open, close } = useWebSocket(`${ws}/${crypto.randomUUID()}`)

const formItems = ref({
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

<style lang="scss" scoped>
.home {
  color: red;
}
</style>
