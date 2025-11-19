import { testConnection, query } from '../../utils/db'

/**
 * @swagger
 * /api/db/test:
 *   get:
 *     tags:
 *       - 数据库
 *     summary: 测试数据库连接
 *     description: 测试 MySQL 数据库连接是否正常
 *     responses:
 *       200:
 *         description: 数据库连接测试结果
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
 *                   example: 数据库连接成功
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
export default defineEventHandler(async (event) => {
  try {
    // 测试连接
    const isConnected = await testConnection()
    
    if (!isConnected) {
      return {
        success: false,
        message: '数据库连接失败'
      }
    }

    // 执行一个简单查询测试
    const result = await query('SELECT 1 as test')
    
    return {
      success: true,
      message: '数据库连接成功',
      data: result
    }
  } catch (error: any) {
    return {
      success: false,
      message: '数据库测试失败',
      error: error.message
    }
  }
})

