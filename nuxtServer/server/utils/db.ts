import mysql from 'mysql2/promise'

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || '119.29.228.7',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'appService',
  password: process.env.DB_PASSWORD || 'KR6sJitTpyTaZYXZ',
  database: process.env.DB_NAME || 'appservice',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
}

// 创建连接池
const pool = mysql.createPool(dbConfig)

// 测试数据库连接
export async function testConnection() {
  try {
    const connection = await pool.getConnection()
    await connection.ping()
    connection.release()
    console.log('✅ MySQL 数据库连接成功')
    return true
  } catch (error: any) {
    console.error('❌ MySQL 数据库连接失败:', error.message)
    return false
  }
}

// 执行查询
export async function query(sql: string, params?: any[]) {
  try {
    const [results] = await pool.execute(sql, params || [])
    return results
  } catch (error: any) {
    console.error('数据库查询错误:', error.message)
    throw error
  }
}

// 获取连接池（用于需要事务的场景）
export function getPool() {
  return pool
}

export default pool

