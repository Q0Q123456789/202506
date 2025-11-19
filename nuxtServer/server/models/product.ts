import { query } from '../utils/db'
import { randomBytes } from 'crypto'

export interface ProductData {
  id: string
  name: string
  description?: string
  price: number
  stock: number
  category_id?: string
  image_url?: string
  status: 'active' | 'inactive' | 'deleted'
  created_at?: string
  updated_at?: string
}

export interface CategoryData {
  id: string
  name: string
  description?: string
  parent_id?: string
  created_at?: string
  updated_at?: string
}

export class Product {
  id: string
  name: string
  description?: string
  price: number
  stock: number
  categoryId?: string
  imageUrl?: string
  status: 'active' | 'inactive' | 'deleted'
  createdAt?: string
  updatedAt?: string

  constructor(data: ProductData) {
    this.id = data.id
    this.name = data.name
    this.description = data.description
    this.price = data.price
    this.stock = data.stock
    this.categoryId = data.category_id
    this.imageUrl = data.image_url
    this.status = data.status || 'active'
    this.createdAt = data.created_at || data.createdAt
    this.updatedAt = data.updated_at || data.updatedAt
  }

  // 生成唯一 ID
  static generateId(): string {
    return randomBytes(16).toString('hex')
  }

  // 查找产品（通过 ID）
  static async findById(id: string): Promise<Product | null> {
    try {
      const results = (await query(
        'SELECT * FROM products WHERE id = ? AND status != ?',
        [id, 'deleted']
      )) as ProductData[]
      if (results.length === 0) {
        return null
      }
      return new Product(results[0])
    } catch (error) {
      console.error('查找产品失败:', error)
      throw error
    }
  }

  // 查找产品列表（支持分页和筛选）
  static async findAll(options?: {
    page?: number
    limit?: number
    categoryId?: string
    status?: string
    search?: string
  }): Promise<{ products: Product[]; total: number }> {
    try {
      const page = options?.page || 1
      const limit = options?.limit || 20
      const offset = (page - 1) * limit

      const whereConditions: string[] = ["status != 'deleted'"]
      const params: any[] = []

      if (options?.categoryId) {
        whereConditions.push('category_id = ?')
        params.push(options.categoryId)
      }

      if (options?.status) {
        whereConditions.push('status = ?')
        params.push(options.status)
      }

      if (options?.search) {
        whereConditions.push('(name LIKE ? OR description LIKE ?)')
        const searchPattern = `%${options.search}%`
        params.push(searchPattern, searchPattern)
      }

      const whereClause =
        whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''

      // 查询总数
      const countResult = (await query(
        `SELECT COUNT(*) as total FROM products ${whereClause}`,
        params
      )) as any[]
      const total = countResult && countResult[0] ? countResult[0].total : 0

      // 查询产品列表
      const results = (await query(
        `SELECT * FROM products ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      )) as ProductData[]

      const products = results.map((row) => new Product(row))

      return { products, total }
    } catch (error) {
      console.error('查找产品列表失败:', error)
      throw error
    }
  }

  // 创建产品
  static async create(data: {
    name: string
    description?: string
    price: number
    stock: number
    categoryId?: string
    imageUrl?: string
    status?: 'active' | 'inactive'
  }): Promise<Product> {
    try {
      const id = this.generateId()
      const status = data.status || 'active'

      await query(
        `INSERT INTO products (id, name, description, price, stock, category_id, image_url, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          data.name,
          data.description || null,
          data.price,
          data.stock,
          data.categoryId || null,
          data.imageUrl || null,
          status,
        ]
      )

      const product = await this.findById(id)
      if (!product) {
        throw new Error('创建产品失败')
      }
      return product
    } catch (error: any) {
      console.error('创建产品失败:', error)
      throw new Error('创建产品失败: ' + error.message)
    }
  }

  // 更新产品
  async update(data: {
    name?: string
    description?: string
    price?: number
    stock?: number
    categoryId?: string
    imageUrl?: string
    status?: 'active' | 'inactive'
  }): Promise<Product> {
    try {
      const updates: string[] = []
      const params: any[] = []

      if (data.name !== undefined) {
        updates.push('name = ?')
        params.push(data.name)
      }
      if (data.description !== undefined) {
        updates.push('description = ?')
        params.push(data.description)
      }
      if (data.price !== undefined) {
        updates.push('price = ?')
        params.push(data.price)
      }
      if (data.stock !== undefined) {
        updates.push('stock = ?')
        params.push(data.stock)
      }
      if (data.categoryId !== undefined) {
        updates.push('category_id = ?')
        params.push(data.categoryId)
      }
      if (data.imageUrl !== undefined) {
        updates.push('image_url = ?')
        params.push(data.imageUrl)
      }
      if (data.status !== undefined) {
        updates.push('status = ?')
        params.push(data.status)
      }

      if (updates.length === 0) {
        return this
      }

      updates.push('updated_at = CURRENT_TIMESTAMP')
      params.push(this.id)

      await query(
        `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
        params
      )

      const updated = await Product.findById(this.id)
      if (!updated) {
        throw new Error('更新产品失败')
      }
      return updated
    } catch (error: any) {
      console.error('更新产品失败:', error)
      throw new Error('更新产品失败: ' + error.message)
    }
  }

  // 删除产品（软删除）
  async delete(): Promise<void> {
    try {
      await query('UPDATE products SET status = ? WHERE id = ?', [
        'deleted',
        this.id,
      ])
    } catch (error: any) {
      console.error('删除产品失败:', error)
      throw new Error('删除产品失败: ' + error.message)
    }
  }

  // 转换为 JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      stock: this.stock,
      categoryId: this.categoryId,
      imageUrl: this.imageUrl,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}

export class Category {
  id: string
  name: string
  description?: string
  parentId?: string
  createdAt?: string
  updatedAt?: string

  constructor(data: CategoryData) {
    this.id = data.id
    this.name = data.name
    this.description = data.description
    this.parentId = data.parent_id
    this.createdAt = data.created_at || data.createdAt
    this.updatedAt = data.updated_at || data.updatedAt
  }

  // 生成唯一 ID
  static generateId(): string {
    return randomBytes(16).toString('hex')
  }

  // 查找分类（通过 ID）
  static async findById(id: string): Promise<Category | null> {
    try {
      const results = (await query('SELECT * FROM categories WHERE id = ?', [
        id,
      ])) as CategoryData[]
      if (results.length === 0) {
        return null
      }
      return new Category(results[0])
    } catch (error) {
      console.error('查找分类失败:', error)
      throw error
    }
  }

  // 查找所有分类
  static async findAll(): Promise<Category[]> {
    try {
      const results = (await query(
        'SELECT * FROM categories ORDER BY name ASC'
      )) as CategoryData[]
      return results.map((row) => new Category(row))
    } catch (error) {
      console.error('查找分类列表失败:', error)
      throw error
    }
  }

  // 创建分类
  static async create(data: {
    name: string
    description?: string
    parentId?: string
  }): Promise<Category> {
    try {
      const id = this.generateId()

      await query(
        `INSERT INTO categories (id, name, description, parent_id) 
         VALUES (?, ?, ?, ?)`,
        [id, data.name, data.description || null, data.parentId || null]
      )

      const category = await this.findById(id)
      if (!category) {
        throw new Error('创建分类失败')
      }
      return category
    } catch (error: any) {
      console.error('创建分类失败:', error)
      throw new Error('创建分类失败: ' + error.message)
    }
  }

  // 转换为 JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      parentId: this.parentId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}

