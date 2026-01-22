<template>
  <div class="home">
    <el-input v-model="formItems.name" placeholder="请输入姓名" type="textarea" @keydown="submitForm" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useWebSocket } from '@vueuse/core'

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

const submitForm = (event) => {
  if (event.key === 'Enter' || event.keyCode === 13) {
    // 检测组合键
    const isCombinationKey = event.ctrlKey || event.metaKey || event.shiftKey
    console.log('isCombinationKey', isCombinationKey)
    if (!isCombinationKey) {
      // 纯 Enter 键：提交消息
      event.preventDefault()
      event.stopPropagation()
      submitMessage()
    }
    // 组合键 + Enter：允许默认换行行为
  }
}

// 辅助函数
const submitMessage = () => {
  // 可以添加发送成功的视觉反馈
  console.log('消息已发送')
  send(
    JSON.stringify({
      event: 'message',
      data: formItems.value.name,
      timestamp: Date.now()
    })
  )
}

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
