import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'

// JWT 密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here-change-in-production'

// 生成 JWT token
export function generateToken(user: { id: string; username: string; email: string }): string {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  )
}

// 验证 JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
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

