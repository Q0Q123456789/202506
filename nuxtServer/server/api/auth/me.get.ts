import { User } from '../../models/user'
import { requireAuth } from '../../utils/auth'

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags:
 *       - 认证
 *     summary: 获取当前用户信息
 *     description: 获取当前登录用户的信息（需要认证）
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 用户不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export default defineEventHandler(async (event) => {
  try {
    // 验证 token 并获取用户信息
    const tokenUser = requireAuth(event)

    // 从数据库获取最新用户信息
    const user = await User.findById(tokenUser.id)

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: '用户不存在',
      })
    }

    return {
      success: true,
      user: user.toJSON(),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '获取用户信息失败',
      message: error.message,
    })
  }
})

