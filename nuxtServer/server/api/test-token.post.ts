import { generateToken } from '../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // 生成测试用户信息
  const testUser = {
    id: body.id || 'test-user-' + Date.now(),
    username: body.username || '测试用户',
    email: body.email || 'test@example.com'
  }

  // 生成 JWT token
  const token = generateToken(testUser)

  return {
    success: true,
    token,
    user: testUser
  }
})