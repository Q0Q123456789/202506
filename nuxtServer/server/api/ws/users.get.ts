import * as wsUtils from '../../utils/ws'
import { requireAuth } from '../../utils/auth'

/**
 * @swagger
 * /api/ws/users:
 *   get:
 *     tags:
 *       - WebSocket
 *     summary: 获取在线用户列表
 *     description: 获取当前在线的用户列表（需要认证）
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
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: 用户ID
 *                       connectionCount:
 *                         type: integer
 *                         description: 连接数量
 *                       rooms:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: 用户加入的房间列表
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export default defineEventHandler(async (event) => {
  try {
    // 验证用户身份
    requireAuth(event)

    // 获取在线用户信息
    const onlineUsers = wsUtils.getOnlineUsers()
    const usersData = onlineUsers.map(userId => ({
      id: userId,
      connectionCount: wsUtils.users.get(userId)?.size || 0,
      rooms: wsUtils.getUserRooms(userId),
    }))

    return {
      success: true,
      users: usersData,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '获取用户列表失败',
      message: error.message,
    })
  }
})