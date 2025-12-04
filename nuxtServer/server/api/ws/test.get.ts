/**
 * @swagger
 * /api/ws/test:
 *   get:
 *     tags:
 *       - WebSocket
 *     summary: WebSocket API 测试
 *     description: 测试 WebSocket API 是否正常工作
 *     responses:
 *       200:
 *         description: 测试成功
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
 *                   example: WebSocket API 测试成功
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
export default defineEventHandler(async (event) => {
  return {
    success: true,
    message: 'WebSocket API 测试成功',
    timestamp: new Date().toISOString(),
  }
})