import { query } from '../../utils/db'

/**
 * @swagger
 * /api/logs/stats:
 *   get:
 *     tags:
 *       - 日志
 *     summary: 查询日志统计信息
 *     description: 获取请求日志的统计信息，包括总数、错误数、平均响应时间等
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 开始日期
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 结束日期
 *     responses:
 *       200:
 *         description: 查询成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 1000
 *                     errorCount:
 *                       type: integer
 *                       example: 50
 *                     successCount:
 *                       type: integer
 *                       example: 950
 *                     avgResponseTime:
 *                       type: integer
 *                       example: 120
 *                     statusStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           status_code:
 *                             type: integer
 *                           count:
 *                             type: integer
 *                     methodStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           method:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     hourlyStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           hour:
 *                             type: string
 *                           count:
 *                             type: integer
 *       500:
 *         description: 查询失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export default defineEventHandler(async (event) => {
  try {
    const queryParams = getQuery(event)
    const { startDate, endDate } = queryParams

    // 构建时间条件
    const whereConditions: string[] = []
    const params: any[] = []

    if (startDate) {
      whereConditions.push('timestamp >= ?')
      params.push(startDate)
    }

    if (endDate) {
      whereConditions.push('timestamp <= ?')
      params.push((endDate as string) + ' 23:59:59')
    }

    const whereClause =
      whereConditions.length > 0
        ? 'WHERE ' + whereConditions.join(' AND ')
        : ''

    // 查询总请求数
    const totalResult = (await query(
      `SELECT COUNT(*) as total FROM request_logs ${whereClause}`,
      params
    )) as any[]
    const total = totalResult && totalResult[0] ? totalResult[0].total : 0

    // 查询各状态码统计
    const statusStats = (await query(
      `SELECT status_code, COUNT(*) as count 
       FROM request_logs 
       ${whereClause}
       GROUP BY status_code 
       ORDER BY count DESC`,
      params
    )) as any[]

    // 查询各方法统计
    const methodStats = (await query(
      `SELECT method, COUNT(*) as count 
       FROM request_logs 
       ${whereClause}
       GROUP BY method 
       ORDER BY count DESC`,
      params
    )) as any[]

    // 查询平均响应时间
    const avgResponseTimeResult = (await query(
      `SELECT AVG(response_time) as avg_response_time 
       FROM request_logs 
       ${whereClause} AND response_time IS NOT NULL`,
      params
    )) as any[]
    const avgResponseTime =
      avgResponseTimeResult && avgResponseTimeResult[0]
        ? Math.round(avgResponseTimeResult[0].avg_response_time || 0)
        : 0

    // 查询错误请求数（4xx 和 5xx）
    const errorCountResult = (await query(
      `SELECT COUNT(*) as count 
       FROM request_logs 
       ${whereClause} AND status_code >= 400`,
      params
    )) as any[]
    const errorCount =
      errorCountResult && errorCountResult[0] ? errorCountResult[0].count : 0

    // 查询最近24小时的请求趋势（按小时分组）
    const hourlyStats = (await query(
      `SELECT DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00') as hour, COUNT(*) as count 
       FROM request_logs 
       ${whereClause}
       AND timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
       GROUP BY hour 
       ORDER BY hour ASC`,
      params
    )) as any[]

    return {
      success: true,
      data: {
        total,
        errorCount,
        successCount: total - errorCount,
        avgResponseTime,
        statusStats,
        methodStats,
        hourlyStats,
      },
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: '查询日志统计失败',
      message: error.message,
    })
  }
})

