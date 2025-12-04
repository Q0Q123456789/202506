import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'

// JWT 密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here-change-in-production'

/**
 * 验证JWT token的工具函数
 * @param token JWT token字符串
 * @returns 解析后的token对象或null（如果无效）
 */
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

/**
 * 生成JWT token的工具函数
 * @param payload 要包含在token中的数据
 * @returns 生成的JWT token字符串
 */
export function generateToken(payload: any) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' })
}

/**
 * 中间件函数，用于验证请求中的token
 * @param event H3事件对象
 * @returns 如果验证成功则返回true，否则抛出错误
 */
export async function requireAuthToken(event: any) {
  const authHeader = event.node.req.headers.authorization
  
  if (!authHeader) {
    throw createError({
      statusCode: 401,
      message: 'Authorization header missing'
    })
  }

  const token = authHeader.split(' ')[1]
  
  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Token missing'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    ;(event as any).context.auth = decoded
    return true
  } catch (error) {
    throw createError({
      statusCode: 401,
      message: 'Invalid token'
    })
  }
}

// 从请求中获取用户信息（用于 Nuxt 3）
export function getUserFromEvent(event: H3Event): any | null {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader) {
    return null
  }

  const token = authHeader.split(' ')[1] // Bearer TOKEN
  if (!token) {
    return null
  }

  return verifyToken(token)
}

// 认证中间件（用于 Nuxt 3 API 路由）
export function requireAuth(event: H3Event): any {
  const user = getUserFromEvent(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: '未提供访问令牌或令牌无效',
    })
  }
  return user
}