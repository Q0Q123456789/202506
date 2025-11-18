import mysql from "mysql2/promise";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

dotenv.config();

// 数据库配置（不指定数据库，用于初始连接测试）
const baseDbConfig = {
  host: process.env.DB_HOST || "119.29.228.7",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "appService",
  password: process.env.DB_PASSWORD || "KR6sJitTpyTaZYXZ",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// 完整数据库配置（包含数据库名）
const dbConfig = {
  ...baseDbConfig,
  database: process.env.DB_NAME || "appservice",
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 测试数据库连接
export async function testConnection() {
  try {
    // 先测试基础连接（不指定数据库）
    const testConnection = await mysql.createConnection(baseDbConfig);
    logger.info("✅ MySQL 服务器连接成功", {
      host: baseDbConfig.host,
      port: baseDbConfig.port,
    });

    // 检查数据库是否存在
    const [databases] = await testConnection.query("SHOW DATABASES LIKE ?", [
      dbConfig.database,
    ]);

    if (databases.length === 0) {
      logger.warn(`⚠️  数据库 "${dbConfig.database}" 不存在`);
      await testConnection.end();
      return false;
    }

    await testConnection.end();

    // 测试连接到指定数据库
    const connection = await pool.getConnection();
    logger.info(`✅ 数据库 "${dbConfig.database}" 连接成功`);
    connection.release();
    return true;
  } catch (error) {
    logger.error("❌ MySQL 数据库连接失败", {
      error: error.message,
      host: baseDbConfig.host,
      port: baseDbConfig.port,
      user: baseDbConfig.user,
      code: error.code,
    });

    return false;
  }
}

// 执行查询
export async function query(sql, params) {
  try {
    // 只在 debug 级别记录 SQL（避免日志过多）
    logger.debug("数据库查询", {
      sql: sql.substring(0, 100) + (sql.length > 100 ? "..." : ""),
      paramsCount: params?.length || 0,
    });
    const [results] = await pool.execute(sql, params || []);
    return results;
  } catch (error) {
    logger.error("数据库查询错误", {
      error: error.message,
      sql: sql.substring(0, 200),
      params: params || [],
      code: error.code,
    });
    throw error;
  }
}

// 获取连接池（用于需要事务的场景）
export function getPool() {
  return pool;
}

export default pool;
