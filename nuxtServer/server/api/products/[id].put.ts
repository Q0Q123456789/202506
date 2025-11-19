import { Product } from '../../models/product'
import { requireAuth } from '../../utils/auth'

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     tags:
 *       - 产品
 *     summary: 更新产品
 *     description: 更新产品信息（需要认证）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 产品ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *               stock:
 *                 type: integer
 *               categoryId:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: 更新成功
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
 *                   example: 产品更新成功
 *                 data:
 *                   $ref: '#/components/schemas/Product'
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

    const body = await readBody(event)
    const { name, description, price, stock, categoryId, imageUrl, status } =
      body

    // 验证价格和库存
    if (price !== undefined && price < 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '价格不能为负数',
      })
    }

    if (stock !== undefined && stock < 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '库存不能为负数',
      })
    }

    const updated = await product.update({
      name,
      description,
      price: price !== undefined ? parseFloat(price) : undefined,
      stock: stock !== undefined ? parseInt(stock) : undefined,
      categoryId,
      imageUrl,
      status,
    })

    return {
      success: true,
      message: '产品更新成功',
      data: updated.toJSON(),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '更新产品失败',
      message: error.message,
    })
  }
})

