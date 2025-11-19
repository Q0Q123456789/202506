import { Product } from '../../models/product'

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags:
 *       - 产品
 *     summary: 查询产品详情
 *     description: 根据ID查询产品详情
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 产品ID
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
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: 产品不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: '请提供产品ID',
      })
    }

    const product = await Product.findById(id)

    if (!product) {
      throw createError({
        statusCode: 404,
        statusMessage: '产品不存在',
      })
    }

    return {
      success: true,
      data: product.toJSON(),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '查询产品失败',
      message: error.message,
    })
  }
})

