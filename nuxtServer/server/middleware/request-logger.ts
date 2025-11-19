import { logRequest } from '../utils/request-logger'

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const method = event.node.req.method || 'GET'
  const url = event.node.req.url || '/'
  
  // 获取客户端 IP
  const forwarded = getHeader(event, 'x-forwarded-for')
  const ip = forwarded 
    ? forwarded.split(',')[0].trim() 
    : event.node.req.socket.remoteAddress || 'unknown'
  
  // 获取 User Agent
  const userAgent = getHeader(event, 'user-agent') || undefined
  
  // 等待响应完成后再记录日志
  event.node.res.once('finish', () => {
    const responseTime = Date.now() - startTime
    const statusCode = event.node.res.statusCode || 200
    
    // 异步记录日志（不阻塞响应）
    logRequest(method, url, statusCode, {
      ip,
      userAgent,
      responseTime,
    }).catch((error) => {
      // 静默处理错误，避免影响主流程
      console.error('记录请求日志失败:', error.message)
    })
  })
  
  // 中间件不返回任何内容，让请求继续处理
})

