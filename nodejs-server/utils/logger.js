import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import MySQLTransport from "./mysql-transport.js";
import RequestLogTransport from "./request-log-transport.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 日志目录
const logDir = join(__dirname, "..", "logs");

// 创建日志目录（如果不存在）
if (!existsSync(logDir)) {
  mkdirSync(logDir, { recursive: true });
}

// 日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 控制台格式（开发环境更易读）
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// 创建日志传输器
const transports = [
  // 控制台输出
  new winston.transports.Console({
    format: consoleFormat,
    level: process.env.LOG_LEVEL || "info",
  }),

  // 所有日志文件
  new DailyRotateFile({
    filename: join(logDir, "app-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "14d",
    format: logFormat,
    level: "info",
  }),

  // 错误日志文件
  new DailyRotateFile({
    filename: join(logDir, "error-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "30d",
    format: logFormat,
    level: "error",
  }),

  // 警告日志文件
  new DailyRotateFile({
    filename: join(logDir, "warn-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "14d",
    format: logFormat,
    level: "warn",
  }),

  // MySQL 日志传输器（如果启用）
  ...(process.env.LOG_TO_MYSQL === "true"
    ? [
        new winston.transports.Stream({
          stream: new MySQLTransport({
            level: process.env.LOG_LEVEL || "info",
            tableName: "logs",
            batchSize: parseInt(process.env.LOG_BATCH_SIZE || "10"),
            batchInterval: parseInt(process.env.LOG_BATCH_INTERVAL || "5000"),
            enabled: true,
          }),
          format: logFormat,
        }),
        // 请求日志专用传输器
        new winston.transports.Stream({
          stream: new RequestLogTransport({
            tableName: "request_logs",
            batchSize: parseInt(process.env.REQUEST_LOG_BATCH_SIZE || "20"),
            batchInterval: parseInt(
              process.env.REQUEST_LOG_BATCH_INTERVAL || "3000"
            ),
            enabled: true,
          }),
          format: logFormat,
        }),
      ]
    : []),
];

// 创建 logger 实例
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  defaultMeta: { service: "nodejs-server" },
  transports,
  exceptionHandlers: [
    new DailyRotateFile({
      filename: join(logDir, "exceptions-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: join(logDir, "rejections-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
    }),
  ],
});

// 如果不在生产环境，也输出到控制台
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// 便捷方法
logger.logRequest = (req, res, responseTime) => {
  const { method, url, ip } = req;
  const { statusCode } = res;
  const level = statusCode >= 400 ? "warn" : "info";
  logger[level](`${method} ${url}`, {
    statusCode,
    ip,
    responseTime: `${responseTime}ms`,
    userAgent: req.get("user-agent"),
  });
};

logger.logError = (error, context = {}) => {
  logger.error(error.message, {
    ...context,
    stack: error.stack,
    name: error.name,
  });
};

logger.logDatabase = (operation, details = {}) => {
  logger.debug(`数据库操作: ${operation}`, details);
};

logger.logWebSocket = (event, details = {}) => {
  logger.info(`WebSocket: ${event}`, details);
};

export default logger;
