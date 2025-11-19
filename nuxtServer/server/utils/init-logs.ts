import { query } from './db'

/**
 * 初始化日志表
 */
export async function initLogsTables() {
  try {
    // 创建用户表
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(32) PRIMARY KEY COMMENT '用户ID',
        username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
        email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
        password VARCHAR(255) NOT NULL COMMENT '加密后的密码',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        INDEX idx_username (username),
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';
    `

    // 创建系统日志表
    const createLogsTable = `
      CREATE TABLE IF NOT EXISTS logs (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        level VARCHAR(20) NOT NULL COMMENT '日志级别: error, warn, info, debug',
        message TEXT NOT NULL COMMENT '日志消息',
        meta JSON COMMENT '元数据（JSON格式）',
        service VARCHAR(50) DEFAULT 'nuxtServer' COMMENT '服务名称',
        timestamp DATETIME NOT NULL COMMENT '时间戳',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        INDEX idx_level (level),
        INDEX idx_timestamp (timestamp),
        INDEX idx_service (service),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统日志表';
    `

    // 创建请求日志表
    const createRequestLogsTable = `
      CREATE TABLE IF NOT EXISTS request_logs (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        method VARCHAR(10) NOT NULL COMMENT 'HTTP 方法',
        url VARCHAR(500) NOT NULL COMMENT '请求 URL',
        status_code INT NOT NULL COMMENT '响应状态码',
        ip VARCHAR(50) COMMENT '客户端 IP',
        user_agent TEXT COMMENT 'User Agent',
        response_time INT COMMENT '响应时间（毫秒）',
        timestamp DATETIME NOT NULL COMMENT '时间戳',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        INDEX idx_method (method),
        INDEX idx_status_code (status_code),
        INDEX idx_ip (ip),
        INDEX idx_timestamp (timestamp),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='请求日志表';
    `

    // 创建分类表
    const createCategoriesTable = `
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(32) PRIMARY KEY COMMENT '分类ID',
        name VARCHAR(100) NOT NULL COMMENT '分类名称',
        description TEXT COMMENT '分类描述',
        parent_id VARCHAR(32) COMMENT '父分类ID',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        INDEX idx_name (name),
        INDEX idx_parent_id (parent_id),
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品分类表';
    `

    // 创建产品表
    const createProductsTable = `
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(32) PRIMARY KEY COMMENT '产品ID',
        name VARCHAR(200) NOT NULL COMMENT '产品名称',
        description TEXT COMMENT '产品描述',
        price DECIMAL(10, 2) NOT NULL COMMENT '价格',
        stock INT NOT NULL DEFAULT 0 COMMENT '库存',
        category_id VARCHAR(32) COMMENT '分类ID',
        image_url VARCHAR(500) COMMENT '图片URL',
        status ENUM('active', 'inactive', 'deleted') DEFAULT 'active' COMMENT '状态',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        INDEX idx_name (name),
        INDEX idx_category_id (category_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品表';
    `

    await query(createUsersTable)
    console.log('✅ 用户表初始化成功')
    
    await query(createCategoriesTable)
    console.log('✅ 分类表初始化成功')
    
    await query(createProductsTable)
    console.log('✅ 产品表初始化成功')
    
    await query(createLogsTable)
    console.log('✅ 系统日志表初始化成功')
    
    await query(createRequestLogsTable)
    console.log('✅ 请求日志表初始化成功')
    
    return true
  } catch (error: any) {
    console.error('❌ 表初始化失败:', error.message)
    throw error
  }
}

