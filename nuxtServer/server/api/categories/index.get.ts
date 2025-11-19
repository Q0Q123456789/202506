import { Category } from '../../models/product'

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags:
 *       - 产品
 *     summary: 查询分类列表
 *     description: 获取所有产品分类
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
 *                     $ref: '#/components/schemas/Category'
 */
export default defineEventHandler(async (event) => {
  try {
    const categories = await Category.findAll()

    return {
      success: true,
      data: categories.map((c) => c.toJSON()),
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: '查询分类列表失败',
      message: error.message,
    })
  }
})

