import { User } from '../../models/user'
import { generateToken } from '../../utils/auth'

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - 认证
 *     summary: 用户登录
 *     description: 用户登录，支持用户名或邮箱登录
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名或邮箱
 *                 example: testuser
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: 登录成功
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
 *                   example: 登录成功
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
 *       401:
 *         description: 用户名或密码错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { username, password } = body

    // 验证输入
    if (!username || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: '请提供用户名和密码',
      })
    }

    // 查找用户（可以通过用户名或邮箱登录）
    let user = await User.findByUsername(username)
    if (!user) {
      user = await User.findByEmail(username)
    }

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: '用户名或密码错误',
      })
    }

    // 验证密码
    const isValidPassword = await User.verifyPassword(user, password)
    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        statusMessage: '用户名或密码错误',
      })
    }

    // 生成 token
    const token = generateToken(user)
    return {
      success: true,
      message: '登录成功',
      token,
      user: user.toJSON(),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '登录失败',
      message: error.message,
    })
  }
})

