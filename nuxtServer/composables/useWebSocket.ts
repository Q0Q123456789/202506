import { computed } from 'vue'

export const useWebSocket = () => {
  const { $ws } = useNuxtApp()
  
  const wsConnected = computed(() => $ws?.wsConnected.value || false)
  
  const sendMessage = (message: any) => {
    if (wsConnected.value) {
      $ws.send(message)
    }
  }
  
  const joinRoom = (roomName: string) => {
    sendMessage({
      type: 'join',
      room: roomName
    })
  }
  
  const leaveRoom = (roomName: string) => {
    sendMessage({
      type: 'leave',
      room: roomName
    })
  }
  
  const sendPrivateMessage = (to: string, content: string) => {
    sendMessage({
      type: 'private',
      to,
      content,
      ts: Date.now()
    })
  }
  
  const sendGroupMessage = (room: string, content: string) => {
    sendMessage({
      type: 'group',
      room,
      content,
      ts: Date.now()
    })
  }
  
  return {
    wsConnected,
    sendMessage,
    joinRoom,
    leaveRoom,
    sendPrivateMessage,
    sendGroupMessage
  }
}