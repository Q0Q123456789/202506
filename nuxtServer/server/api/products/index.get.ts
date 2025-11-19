import { Product } from '../../models/product'

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags:
 *       - 产品
 *     summary: 查询产品列表
 *     description: 分页查询产品列表，支持筛选和搜索
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
 *           default: 20
 *         description: 每页数量
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: 分类ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: 状态
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词（产品名称或描述）
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
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
export default defineEventHandler(async (event) => {
  try {
    const queryParams = getQuery(event)
    const {
      page = '1',
      limit = '20',
      categoryId,
      status,
      search,
    } = queryParams

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)

    const result = await Product.findAll({
      page: pageNum,
      limit: limitNum,
      categoryId: categoryId as string,
      status: status as string,
      search: search as string,
    })

    return {
      success: true,
      data: result.products.map((p) => p.toJSON()),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: result.total,
        totalPages: Math.ceil(result.total / limitNum),
      },
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: '查询产品列表失败',
      message: error.message,
    })
  }
})

