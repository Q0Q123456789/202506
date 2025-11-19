import { User } from '../../models/user'
import { generateToken } from '../../utils/auth'

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - 认证
 *     summary: 用户注册
 *     description: 注册新用户账号
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: testuser
 *               email:
 *                 type: string
 *                 format: email
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       201:
 *         description: 注册成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 注册成功
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: 用户名或邮箱已存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { username, email, password } = body

    // 验证输入
    if (!username || !email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: '请提供用户名、邮箱和密码',
      })
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: '邮箱格式不正确',
      })
    }

    // 验证密码长度
    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: '密码长度至少为 6 位',
      })
    }

    // 创建用户
    const user = await User.save(username, email, password)

    // 生成 token
    const token = generateToken(user)

    return {
      success: true,
      message: '注册成功',
      token,
      user: user.toJSON(),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    if (error.message === '用户名已存在' || error.message === '邮箱已被注册') {
      throw createError({
        statusCode: 409,
        statusMessage: error.message,
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: '注册失败',
      message: error.message,
    })
  }
})

