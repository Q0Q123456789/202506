import { Product } from '../../models/product'
import { requireAuth } from '../../utils/auth'

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags:
 *       - 产品
 *     summary: 创建产品
 *     description: 创建新产品（需要认证）
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *                 example: 产品名称
 *               description:
 *                 type: string
 *                 example: 产品描述
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 99.99
 *               stock:
 *                 type: integer
 *                 example: 100
 *               categoryId:
 *                 type: string
 *                 example: category_id_here
 *               imageUrl:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 example: active
 *     responses:
 *       201:
 *         description: 创建成功
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
 *                   example: 产品创建成功
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 */
export default defineEventHandler(async (event) => {
  try {
    // 需要认证
    requireAuth(event)

    const body = await readBody(event)
    const { name, description, price, stock, categoryId, imageUrl, status } =
      body

    // 验证必填字段
    if (!name || price === undefined || stock === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: '请提供产品名称、价格和库存',
      })
    }

    // 验证价格和库存
    if (price < 0 || stock < 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '价格和库存不能为负数',
      })
    }

    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      categoryId,
      imageUrl,
      status,
    })

    return {
      success: true,
      message: '产品创建成功',
      data: product.toJSON(),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '创建产品失败',
      message: error.message,
    })
  }
})

