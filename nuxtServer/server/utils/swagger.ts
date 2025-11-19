import swaggerJsdoc from 'swagger-jsdoc'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 递归获取所有 API 文件路径
function getAllApiFiles(dir: string, fileList: string[] = []): string[] {
  try {
    const files = readdirSync(dir)
    
    files.forEach((file) => {
      // 跳过 swagger 目录和 node_modules
      if (file === 'swagger' || file === 'node_modules' || file.startsWith('.')) {
        return
      }
      
      const filePath = resolve(dir, file)
      const stat = statSync(filePath)
      
      if (stat.isDirectory()) {
        getAllApiFiles(filePath, fileList)
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        // 只包含 API 路由文件（排除 swagger 相关文件）
        if (!file.includes('swagger') && !file.includes('swagger.json')) {
          fileList.push(filePath)
        }
      }
    })
  } catch (error) {
    console.error('扫描 API 文件失败:', error)
  }
  
  return fileList
}

// 读取所有 API 文件内容并合并
function getAllApiFileContents(apiDir: string): string {
  const files = getAllApiFiles(apiDir)
  const contents: string[] = []
  
  files.forEach(filePath => {
    try {
      const content = readFileSync(filePath, 'utf-8')
      contents.push(content)
    } catch (error) {
      console.error(`读取文件失败: ${filePath}`, error)
    }
  })
  
  return contents.join('\n\n')
}

// Swagger 配置
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Nuxt Server API',
      version: '1.0.0',
      description: 'Nuxt Server API 文档',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '开发服务器',
      },
    ],
    tags: [
      {
        name: '数据库',
        description: '数据库相关接口',
      },
      {
        name: '日志',
        description: '日志查询相关接口',
      },
      {
        name: '认证',
        description: '用户认证相关接口',
      },
      {
        name: '产品',
        description: '产品管理相关接口',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: '输入 JWT token，格式：Bearer {token}',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: '错误信息',
            },
            error: {
              type: 'string',
              example: '详细错误信息',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: '操作成功',
            },
          },
        },
        RequestLog: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            method: {
              type: 'string',
              example: 'GET',
            },
            url: {
              type: 'string',
              example: '/api/test',
            },
            status_code: {
              type: 'integer',
              example: 200,
            },
            ip: {
              type: 'string',
              example: '127.0.0.1',
            },
            user_agent: {
              type: 'string',
              example: 'Mozilla/5.0...',
            },
            response_time: {
              type: 'integer',
              example: 45,
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-19 10:00:00',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-19 10:00:00',
            },
          },
        },
        SystemLog: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            level: {
              type: 'string',
              enum: ['error', 'warn', 'info', 'debug'],
              example: 'info',
            },
            message: {
              type: 'string',
              example: '日志消息',
            },
            meta: {
              type: 'object',
              example: { key: 'value' },
            },
            service: {
              type: 'string',
              example: 'nuxtServer',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-19 10:00:00',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-19 10:00:00',
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1,
            },
            limit: {
              type: 'integer',
              example: 50,
            },
            total: {
              type: 'integer',
              example: 100,
            },
            totalPages: {
              type: 'integer',
              example: 2,
            },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'product_id_here',
            },
            name: {
              type: 'string',
              example: '产品名称',
            },
            description: {
              type: 'string',
              example: '产品描述',
            },
            price: {
              type: 'number',
              format: 'float',
              example: 99.99,
            },
            stock: {
              type: 'integer',
              example: 100,
            },
            categoryId: {
              type: 'string',
              example: 'category_id_here',
            },
            imageUrl: {
              type: 'string',
              example: 'https://example.com/image.jpg',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'deleted'],
              example: 'active',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'category_id_here',
            },
            name: {
              type: 'string',
              example: '分类名称',
            },
            description: {
              type: 'string',
              example: '分类描述',
            },
            parentId: {
              type: 'string',
              example: 'parent_category_id',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
  },
  apis: [], // 将在运行时动态填充
}

// 生成 Swagger 规范
let swaggerSpec: any

try {
  const apiDir = join(__dirname, '../api')
  const apiFiles = getAllApiFiles(apiDir)
  console.log('📝 扫描到的 API 文件:', apiFiles.length, '个')
  if (apiFiles.length > 0) {
    console.log('📄 文件列表:', apiFiles.map(f => f.split('/').pop()).join(', '))
  }
  
  // 直接读取所有文件内容并合并
  const allFileContents = getAllApiFileContents(apiDir)
  
  if (allFileContents) {
    // 使用文件内容而不是文件路径
    const optionsWithContent = {
      ...swaggerOptions,
      apis: [allFileContents],
    }
    
    swaggerSpec = swaggerJsdoc(optionsWithContent)
  } else {
    swaggerSpec = swaggerOptions.definition
    swaggerSpec.paths = {}
  }
  
  // 检查是否生成了路径
  if (!swaggerSpec.paths || Object.keys(swaggerSpec.paths).length === 0) {
    console.warn('⚠️  Swagger 未扫描到任何路径')
    console.warn('💡 提示: 检查 API 文件中的注释格式，确保使用 @swagger 标签')
    console.warn('💡 示例注释格式:')
    console.warn('   /**')
    console.warn('    * @swagger')
    console.warn('    * /api/path:')
    console.warn('    *   get:')
    console.warn('    *     ...')
    console.warn('    */')
  } else {
    console.log('✅ Swagger 扫描成功，找到', Object.keys(swaggerSpec.paths).length, '个接口')
    console.log('📋 接口列表:', Object.keys(swaggerSpec.paths).join(', '))
  }
} catch (error: any) {
  console.error('❌ Swagger 生成失败:', error.message)
  if (error.stack) {
    console.error('错误堆栈:', error.stack)
  }
  // 返回基础配置
  swaggerSpec = swaggerOptions.definition
  swaggerSpec.paths = {}
}

export { swaggerSpec }

