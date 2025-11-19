import { query } from '../../utils/db'

/**
 * @swagger
 * /api/logs/requests:
 *   get:
 *     tags:
 *       - 日志
 *     summary: 查询请求日志
 *     description: 分页查询请求日志，支持多种筛选条件
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: 每页数量
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *           enum: [GET, POST, PUT, DELETE, PATCH]
 *         description: HTTP 方法
 *       - in: query
 *         name: statusCode
 *         schema:
 *           type: integer
 *         description: 状态码
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
 *       - in: query
 *         name: ip
 *         schema:
 *           type: string
 *         description: IP 地址（模糊匹配）
 *       - in: query
 *         name: url
 *         schema:
 *           type: string
 *         description: URL（模糊匹配）
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RequestLog'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
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
    const {
      page = '1',
      limit = '50',
      method,
      statusCode,
      startDate,
      endDate,
      ip,
      url,
    } = queryParams

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const offset = (pageNum - 1) * limitNum

    // 构建查询条件
    const whereConditions: string[] = []
    const params: any[] = []

    if (method) {
      whereConditions.push('method = ?')
      params.push((method as string).toUpperCase())
    }

    if (statusCode) {
      whereConditions.push('status_code = ?')
      params.push(parseInt(statusCode as string))
    }

    if (startDate) {
      whereConditions.push('timestamp >= ?')
      params.push(startDate)
    }

    if (endDate) {
      whereConditions.push('timestamp <= ?')
      params.push((endDate as string) + ' 23:59:59')
    }

    if (ip) {
      whereConditions.push('ip LIKE ?')
      params.push(`%${ip}%`)
    }

    if (url) {
      whereConditions.push('url LIKE ?')
      params.push(`%${url}%`)
    }

    const whereClause =
      whereConditions.length > 0
        ? 'WHERE ' + whereConditions.join(' AND ')
        : ''

    // 查询总数
    const countResult = (await query(
      `SELECT COUNT(*) as total FROM request_logs ${whereClause}`,
      params
    )) as any[]
    const total = countResult && countResult[0] ? countResult[0].total : 0

    // 查询日志
    const sql = `SELECT id, method, url, status_code, ip, user_agent, response_time, timestamp, created_at 
                 FROM request_logs 
                 ${whereClause}
                 ORDER BY timestamp DESC 
                 LIMIT ? OFFSET ?`
    const logs = (await query(sql, [...params, limitNum, offset])) as any[]

    return {
      success: true,
      data: logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: '查询请求日志失败',
      message: error.message,
    })
  }
})

