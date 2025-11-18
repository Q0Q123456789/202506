import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || "119.29.228.7",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "appService",
  password: process.env.DB_PASSWORD || "KR6sJitTpyTaZYXZ",
  database: process.env.DB_NAME || "appservice",
  multipleStatements: true,
};

async function initLogsTables() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ 已连接到 MySQL 服务器");

    // 读取 SQL 文件
    const sqlPath = join(__dirname, "logs.sql");
    const sql = readFileSync(sqlPath, "utf8");

    // 执行 SQL
    await connection.query(sql);
    console.log("✅ 日志表创建成功");

    // 验证表是否创建成功
    const [tables] = await connection.query("SHOW TABLES LIKE 'logs'");
    const [requestTables] = await connection.query(
      "SHOW TABLES LIKE 'request_logs'"
    );

    if (tables.length > 0) {
      console.log("✅ logs 表已创建");
    }
    if (requestTables.length > 0) {
      console.log("✅ request_logs 表已创建");
    }

    await connection.end();
    console.log("✅ 日志表初始化完成");
  } catch (error) {
    console.error("❌ 日志表初始化失败:");
    console.error(`   错误信息: ${error.message}`);
    console.error(`   错误代码: ${error.code || "未知"}`);

    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

// 如果直接运行此文件，则执行初始化
if (import.meta.url === `file://${process.argv[1]}`) {
  initLogsTables();
}

export { initLogsTables };
