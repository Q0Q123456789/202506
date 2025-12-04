import { WebSocketServer } from 'ws'
import { verifyToken } from '../utils/auth'
import * as wsUtils from '../utils/ws'

interface WebSocketMessage {
  type: string
  room?: string
  to?: string
  content?: any
}

const port = Number(process.env.WS_PORT || 8081)
const HEARTBEAT_INTERVAL = 30000
const CONNECTION_TIMEOUT = 60000

// 连接管理
const connectionTimers = new Map<any, NodeJS.Timeout>()

function clearConnectionTimer(socket: any) {
  const timer = connectionTimers.get(socket)
  if (timer) {
    clearTimeout(timer)
    connectionTimers.delete(socket)
  }
}

function setConnectionTimer(socket: any) {
  clearConnectionTimer(socket)
  const timer = setTimeout(() => {
    try {
      socket.terminate()
    } catch (e) {
      // ignore
    }
  }, CONNECTION_TIMEOUT)
  connectionTimers.set(socket, timer)
}

function sendMessage(socket: any, payload: any) {
  try {
    socket.send(JSON.stringify(payload))
  } catch (e) {
    console.warn('[ws-server] Failed to send message:', e)
  }
}

function isValidMessage(msg: any): msg is WebSocketMessage {
  return msg && typeof msg === 'object' && typeof msg.type === 'string'
}

function startWebSocketServer() {
  try {
    const wss = new WebSocketServer({
      port,
      perMessageDeflate: false // 禁用压缩以提高性能
    })

    wss.on('connection', (socket, req) => {
      try {
        const rawUrl = req.url || ''
        const url = new URL(rawUrl, 'http://localhost')
        const token = url.searchParams.get('token') || ''

        if (!token) {
          socket.close(4001, 'Token required')
          return
        }

        const user = verifyToken(token)
        if (!user) {
          socket.close(4002, 'Invalid token')
          return
        }

        const userId = String(user.id)
        wsUtils.addUserConn(userId, socket as any)

        setConnectionTimer(socket)

        // 发送连接确认
        sendMessage(socket, { type: 'connected', userId })

        socket.on('message', (data) => {
          setConnectionTimer(socket)

          let msg: any
          try {
            msg = JSON.parse(data.toString())
          } catch (e) {
            console.warn('[ws-server] Invalid JSON received:', data.toString())
            return
          }

          if (!isValidMessage(msg)) {
            console.warn('[ws-server] Invalid message format:', msg)
            return
          }

          const { type, room, to, content } = msg

          switch (type) {
            case 'join':
              if (!room) {
                wsUtils.sendToUser(userId, { type: 'error', message: 'Room name required' })
                return
              }
              wsUtils.joinRoom(userId, room)
              wsUtils.sendToUser(userId, { type: 'joined', room })
              break

            case 'leave':
              if (!room) {
                wsUtils.sendToUser(userId, { type: 'error', message: 'Room name required' })
                return
              }
              wsUtils.leaveRoom(userId, room)
              wsUtils.sendToUser(userId, { type: 'left', room })
              break

            case 'private':
              if (!to || content === undefined) {
                wsUtils.sendToUser(userId, { type: 'error', message: 'Recipient and content required' })
                return
              }
              const privatePayload = { type: 'private', from: userId, to, content, ts: Date.now() }
              wsUtils.sendToUser(to, privatePayload)
              break

            case 'group':
              if (!room || content === undefined) {
                wsUtils.sendToUser(userId, { type: 'error', message: 'Room and content required' })
                return
              }
              const groupPayload = { type: 'group', from: userId, room, content, ts: Date.now() }
              wsUtils.sendToRoom(room, groupPayload, userId)
              break

            case 'ping':
              wsUtils.sendToUser(userId, { type: 'pong', ts: Date.now() })
              break

            default:
              wsUtils.sendToUser(userId, { type: 'error', message: 'Unknown message type' })
              break
          }
        })

        socket.on('pong', () => {
          setConnectionTimer(socket)
        })

        socket.on('close', (code, reason) => {
          clearConnectionTimer(socket)
          wsUtils.removeUserConn(userId, socket as any)
          console.log(`[ws-server] User ${userId} disconnected (${code}): ${reason}`)
        })

        socket.on('error', (error) => {
          clearConnectionTimer(socket)
          console.error(`[ws-server] Socket error for user ${userId}:`, error)
        })

      } catch (error) {
        console.error('[ws-server] Error handling connection:', error)
        socket.close(4003, 'Internal server error')
      }
    })

    // 定期心跳检测
    setInterval(() => {
      const online = Array.from(wsUtils.users.keys()).length
      wsUtils.broadcast({ type: 'stats', online, ts: Date.now() })
    }, HEARTBEAT_INTERVAL)

    // 定期清理僵尸连接
    setInterval(() => {
      wss.clients.forEach((socket) => {
        if (socket.readyState === socket.OPEN) {
          socket.ping()
        }
      })
    }, HEARTBEAT_INTERVAL / 2)

    console.log(`[ws-server] Started at ws://0.0.0.0:${port}`)
    return wss

  } catch (error) {
    console.error('[ws-server] Failed to start:', error)
    process.exit(1)
  }
}

// 启动 WebSocket 服务器
let wsServer: WebSocketServer | null = null

// Nuxt 3 插件导出
export default defineNitroPlugin((nitroApp) => {
  if (!wsServer) {
    wsServer = startWebSocketServer()
  }
})
