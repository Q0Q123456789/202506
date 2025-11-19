import { query } from '../../utils/db'

/**
 * @swagger
 * /api/logs/system:
 *   get:
 *     tags:
 *       - 日志
 *     summary: 查询系统日志
 *     description: 分页查询系统日志，支持多种筛选条件
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
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [error, warn, info, debug]
 *         description: 日志级别
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
 *         name: service
 *         schema:
 *           type: string
 *         description: 服务名称
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词（在 message 和 meta 中搜索）
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
 *                     $ref: '#/components/schemas/SystemLog'
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
      limit = '10',
      level,
      startDate,
      endDate,
      service,
      search,
    } = queryParams

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const offset = (pageNum - 1) * limitNum

    // 构建查询条件
    const whereConditions: string[] = []
    const params: any[] = []

    if (level) {
      whereConditions.push('level = ?')
      params.push(level as string)
    }

    if (startDate) {
      whereConditions.push('timestamp >= ?')
      params.push(startDate)
    }

    if (endDate) {
      whereConditions.push('timestamp <= ?')
      params.push((endDate as string) + ' 23:59:59')
    }

    if (service) {
      whereConditions.push('service = ?')
      params.push(service as string)
    }

    if (search) {
      whereConditions.push('(message LIKE ? OR CAST(meta AS CHAR) LIKE ?)')
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern)
    }

    const whereClause =
      whereConditions.length > 0
        ? 'WHERE ' + whereConditions.join(' AND ')
        : ''

    // 查询总数
    const countResult = (await query(
      `SELECT COUNT(*) as total FROM logs ${whereClause}`,
      params
    )) as any[]
    const total = countResult && countResult[0] ? countResult[0].total : 0

    // 查询日志
    const sql = `SELECT id, level, message, meta, service, timestamp, created_at 
                 FROM logs 
                 ${whereClause}
                 ORDER BY timestamp DESC 
                 LIMIT ? OFFSET ?`
    const logs = (await query(sql, [...params, limitNum, offset])) as any[]

    // 解析 meta JSON（MySQL JSON 类型可能已经解析为对象）
    const formattedLogs = logs.map((log) => {
      let meta = null
      if (log.meta) {
        if (typeof log.meta === 'string') {
          try {
            meta = JSON.parse(log.meta)
          } catch (e) {
            // 如果解析失败，保持原值
            meta = log.meta
          }
        } else {
          // 如果已经是对象，直接使用
          meta = log.meta
        }
      }
      return {
        ...log,
        meta,
      }
    })

    return {
      success: true,
      data: formattedLogs,
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
      statusMessage: '查询系统日志失败',
      message: error.message,
    })
  }
})

