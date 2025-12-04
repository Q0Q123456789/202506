import * as wsUtils from '../../utils/ws'
import { requireAuth } from '../../utils/auth'

/**
 * @swagger
 * /api/ws/broadcast:
 *   post:
 *     tags:
 *       - WebSocket
 *     summary: 广播消息到所有连接
 *     description: 向所有WebSocket连接广播消息（需要认证）
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: object
 *                 description: 要广播的消息对象
 *                 example:
 *                   type: notification
 *                   content: 系统公告
 *                   timestamp: 2024-01-01T00:00:00Z
 *     responses:
 *       200:
 *         description: 广播成功
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
 *                   example: 消息已广播
 *                 recipientCount:
 *                   type: integer
 *                   description: 接收消息的连接数
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
    const user = requireAuth(event)

    const body = await readBody(event)
    const { message } = body

    // 验证输入
    if (!message) {
      throw createError({
        statusCode: 400,
        statusMessage: '请提供要广播的消息',
      })
    }

    // 添加管理员信息到消息
    const broadcastMessage = {
      ...message,
      broadcastBy: user.id,
      broadcastAt: new Date().toISOString(),
    }

    // 广播消息
    const success = wsUtils.broadcast(broadcastMessage)

    if (!success) {
      throw createError({
        statusCode: 500,
        statusMessage: '广播失败：没有活跃连接',
      })
    }

    // 计算接收者数量
    const recipientCount = Array.from(wsUtils.users.values())
      .reduce((total, sockets) => total + sockets.size, 0)

    return {
      success: true,
      message: '消息已广播',
      recipientCount,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '广播消息失败',
      message: error.message,
    })
  }
})