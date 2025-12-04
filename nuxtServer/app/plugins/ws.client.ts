export default defineNuxtPlugin(() => {
  // 确保在客户端运行
  if (import.meta.server) return
  
  // 全局WebSocket连接管理
  const ws = ref<WebSocket | null>(null)
  const wsConnected = ref(false)
  
  // 提供全局访问
  const globalWs = {
    ws,
    wsConnected,
    
    connect(token: string) {
      console.log('WebSocket: 尝试连接，token:', token ? 'exists' : 'missing')
      
      if (ws.value?.readyState === WebSocket.OPEN) {
        console.log('WebSocket: 已连接，跳过')
        return
      }
      
      const wsUrl = useRuntimeConfig().public.wsUrl
      console.log('WebSocket: URL:', wsUrl)
      
      try {
        const fullUrl = `${wsUrl}?token=${token}`
        console.log('WebSocket: 完整URL:', fullUrl)
        
        ws.value = new WebSocket(fullUrl)
        
        ws.value.onopen = () => {
          console.log('WebSocket: 连接成功')
          wsConnected.value = true
        }
        
        ws.value.onclose = (event) => {
          console.log('WebSocket: 连接关闭，code:', event.code, 'reason:', event.reason)
          wsConnected.value = false
          // 自动重连
          setTimeout(() => {
            const newToken = useCookie('auth-token').value
            if (newToken) {
              console.log('WebSocket: 尝试重连')
              this.connect(newToken)
            }
          }, 3000)
        }
        
        ws.value.onerror = (error) => {
          console.error('WebSocket: 连接错误:', error)
        }
      } catch (error) {
        console.error('WebSocket: 创建连接失败:', error)
      }
    },
    
    disconnect() {
      if (ws.value) {
        ws.value.close()
        ws.value = null
      }
      wsConnected.value = false
    },
    
    send(data: any) {
      if (ws.value?.readyState === WebSocket.OPEN) {
        ws.value.send(JSON.stringify(data))
      }
    }
  }
  
  return {
    provide: {
      ws: globalWs
    }
  }
})