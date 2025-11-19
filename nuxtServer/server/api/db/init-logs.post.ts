import { initLogsTables } from '../../utils/init-logs'

/**
 * @swagger
 * /api/db/init-logs:
 *   post:
 *     tags:
 *       - 数据库
 *     summary: 初始化日志表
 *     description: 创建 logs 和 request_logs 表（如果不存在）
 *     responses:
 *       200:
 *         description: 初始化成功
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
 *                   example: 日志表初始化成功
 *       500:
 *         description: 初始化失败
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 日志表初始化失败
 *                 error:
 *                   type: string
 */
export default defineEventHandler(async (event) => {
  try {
    await initLogsTables()
    return {
      success: true,
      message: '日志表初始化成功'
    }
  } catch (error: any) {
    return {
      success: false,
      message: '日志表初始化失败',
      error: error.message
    }
  }
})

