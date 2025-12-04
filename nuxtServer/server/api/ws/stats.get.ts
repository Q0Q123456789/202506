import * as wsUtils from '../../utils/ws'
import { requireAuth } from '../../utils/auth'

/**
 * @swagger
 * /api/ws/stats:
 *   get:
 *     tags:
 *       - WebSocket
 *     summary: 获取WebSocket统计信息
 *     description: 获取WebSocket服务器统计信息（需要认证）
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
 *                 stats:
 *                   type: object
 *                   properties:
 *                     onlineUsers:
 *                       type: integer
 *                       description: 在线用户数
 *                     totalSockets:
 *                       type: integer
 *                       description: 总连接数
 *                     rooms:
 *                       type: integer
 *                       description: 房间数
 *                     peakConnections:
 *                       type: integer
 *                       description: 峰值连接数
 *                     totalConnections:
 *                       type: integer
 *                       description: 总连接次数
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

    // 获取统计信息
    const stats = wsUtils.getStats()

    return {
      success: true,
      stats,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '获取统计信息失败',
      message: error.message,
    })
  }
})