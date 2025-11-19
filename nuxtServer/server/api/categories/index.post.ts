import { Category } from '../../models/product'
import { requireAuth } from '../../utils/auth'

/**
 * @swagger
 * /api/categories:
 *   post:
 *     tags:
 *       - 产品
 *     summary: 创建分类
 *     description: 创建新产品分类（需要认证）
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: 电子产品
 *               description:
 *                 type: string
 *                 example: 电子类产品分类
 *               parentId:
 *                 type: string
 *                 example: parent_category_id
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
 *                   example: 分类创建成功
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 */
export default defineEventHandler(async (event) => {
  try {
    // 需要认证
    requireAuth(event)

    const body = await readBody(event)
    const { name, description, parentId } = body

    if (!name) {
      throw createError({
        statusCode: 400,
        statusMessage: '请提供分类名称',
      })
    }

    const category = await Category.create({
      name,
      description,
      parentId,
    })

    return {
      success: true,
      message: '分类创建成功',
      data: category.toJSON(),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '创建分类失败',
      message: error.message,
    })
  }
})

