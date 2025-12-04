import * as wsUtils from '../../utils/ws'
import { requireAuth } from '../../utils/auth'

/**
 * @swagger
 * /api/ws/rooms:
 *   get:
 *     tags:
 *       - WebSocket
 *     summary: 获取所有房间信息
 *     description: 获取WebSocket房间列表和成员信息（需要认证）
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
 *                 rooms:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: 房间名称
 *                       members:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: 成员用户ID列表
 *                       memberCount:
 *                         type: integer
 *                         description: 成员数量
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

    // 获取房间信息
    const roomsData = Array.from(wsUtils.rooms.entries()).map(([roomName, members]) => ({
      name: roomName,
      members: Array.from(members),
      memberCount: members.size,
    }))

    return {
      success: true,
      rooms: roomsData,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '获取房间信息失败',
      message: error.message,
    })
  }
})