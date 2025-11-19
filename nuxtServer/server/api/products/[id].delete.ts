import { Product } from '../../models/product'
import { requireAuth } from '../../utils/auth'

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     tags:
 *       - 产品
 *     summary: 删除产品
 *     description: 删除产品（软删除，需要认证）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 产品ID
 *     responses:
 *       200:
 *         description: 删除成功
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
 *                   example: 产品删除成功
 *       404:
 *         description: 产品不存在
 */
export default defineEventHandler(async (event) => {
  try {
    // 需要认证
    requireAuth(event)

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

    await product.delete()

    return {
      success: true,
      message: '产品删除成功',
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '删除产品失败',
      message: error.message,
    })
  }
})

