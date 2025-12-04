<template>
  <div class="ws-test">
    <h1>WebSocket 连接测试</h1>
    
    <div class="status">
      <p>连接状态: <span :class="{ connected: wsConnected, disconnected: !wsConnected }">
        {{ wsConnected ? '已连接' : '未连接' }}
      </span></p>
      <p>URL: {{ wsUrl }}</p>
    </div>
    
    <div class="actions">
      <button @click="testConnect" :disabled="loading">
        {{ loading ? '连接中...' : '测试连接' }}
      </button>
      <button @click="testDisconnect">断开连接</button>
      <button @click="testPing">发送 Ping</button>
    </div>
    
    <div class="logs">
      <h3>日志:</h3>
      <div class="log-container">
        <div v-for="(log, index) in logs" :key="index" :class="['log', log.type]">
          [{{ log.time }}] {{ log.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { $ws } = useNuxtApp()
const wsConnected = ref(false)
const loading = ref(false)
const logs = ref([])

const wsUrl = useRuntimeConfig().public.wsUrl

const addLog = (message, type = 'info') => {
  logs.value.unshift({
    time: new Date().toLocaleTimeString(),
    message,
    type
  })
  if (logs.value.length > 50) {
    logs.value.pop()
  }
}

const testConnect = () => {
  loading.value = true
  addLog('开始测试 WebSocket 连接...', 'info')
  
  // 使用模拟token进行测试
  const testToken = 'mock-token-' + Date.now()
  addLog(`使用token: ${testToken.substring(0, 20)}...`, 'info')
  
  // 监听连接状态
  const unwatchConnected = watch(() => $ws.wsConnected, (connected) => {
    wsConnected.value = connected
    if (connected) {
      addLog('WebSocket 连接成功！', 'success')
      loading.value = false
    }
  })
  
  // 监听错误
  const unwatchError = watch(() => $ws.ws?.readyState, (readyState) => {
    if (readyState === WebSocket.CLOSED || readyState === WebSocket.CLOSING) {
      addLog('WebSocket 连接关闭或失败', 'error')
      loading.value = false
    }
  })
  
  // 尝试连接
  try {
    $ws.connect(testToken)
    addLog('已发起连接请求', 'info')
  } catch (error) {
    addLog(`连接失败: ${error.message}`, 'error')
    loading.value = false
  }
  
  // 5秒后超时
  setTimeout(() => {
    if (loading.value) {
      addLog('连接超时', 'error')
      loading.value = false
    }
    unwatchConnected()
    unwatchError()
  }, 5000)
}

const testDisconnect = () => {
  $ws.disconnect()
  wsConnected.value = false
  addLog('已断开连接', 'info')
}

const testPing = () => {
  if (wsConnected.value) {
    $ws.send({ type: 'ping', ts: Date.now() })
    addLog('已发送 ping 消息', 'info')
  } else {
    addLog('未连接，无法发送消息', 'error')
  }
}

// 初始化状态监听
onMounted(() => {
  wsConnected.value = $ws.wsConnected
  addLog('页面加载完成', 'info')
  addLog(`WebSocket URL: ${wsUrl}`, 'info')
})
</script>

<style scoped>
.ws-test {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
}

.status {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.connected {
  color: #28a745;
  font-weight: bold;
}

.disconnected {
  color: #dc3545;
  font-weight: bold;
}

.actions {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #007bff;
  color: white;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background: #0056b3;
}

.logs {
  margin-top: 2rem;
}

.log-container {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  height: 300px;
  overflow-y: auto;
  padding: 1rem;
  font-family: monospace;
  font-size: 0.9rem;
}

.log {
  margin-bottom: 0.5rem;
  padding: 0.25rem;
  border-radius: 2px;
}

.log.info {
  background: transparent;
}

.log.success {
  background: #d4edda;
  color: #155724;
}

.log.error {
  background: #f8d7da;
  color: #721c24;
}

.log.warning {
  background: #fff3cd;
  color: #856404;
}
</style>