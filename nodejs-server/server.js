import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer as createHttpServer } from "http";
import { createServer as createHttpsServer } from "https";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import authRoutes from "./routes/auth.js";
import logRoutes from "./routes/logs.js";
import { initWebSocket } from "./websocket.js";
import { testConnection } from "./config/database.js";
import logger from "./utils/logger.js";

// 加载环境变量
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HTTPS_ENABLED = process.env.HTTPS_ENABLED === "true";
const SSL_KEY_PATH =
  process.env.SSL_KEY_PATH || join(__dirname, "certs", "key.pem");
const SSL_CERT_PATH =
  process.env.SSL_CERT_PATH || join(__dirname, "certs", "cert.pem");

// 请求日志中间件
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const responseTime = Date.now() - start;
    logger.logRequest(req, res, responseTime);
  });
  next();
});

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.get("/", (req, res) => {
  const protocol = HTTPS_ENABLED ? "https" : "http";
  const wsProtocol = HTTPS_ENABLED ? "wss" : "ws";
  res.json({
    message: "Node.js 服务器运行中",
    protocol: protocol,
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        me: "GET /api/auth/me",
      },
      logs: {
        system: "GET /api/logs/system",
        requests: "GET /api/logs/requests",
        stats: "GET /api/logs/stats",
        files: "GET /api/logs/files",
        download: "GET /api/logs/files/download/:filename",
        export: "GET /api/logs/export/csv",
      },
      websocket: `${wsProtocol}://localhost:${PORT}?token=YOUR_TOKEN`,
    },
  });
});

// 认证路由
app.use("/api/auth", authRoutes);

// 日志路由
app.use("/api/logs", logRoutes);

// 健康检查
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 创建 HTTP 或 HTTPS 服务器
let server;
let isHttps = false;

if (HTTPS_ENABLED) {
  // 检查 SSL 证书文件是否存在
  if (existsSync(SSL_KEY_PATH) && existsSync(SSL_CERT_PATH)) {
    try {
      const options = {
        key: readFileSync(SSL_KEY_PATH),
        cert: readFileSync(SSL_CERT_PATH),
      };
      server = createHttpsServer(options, app);
      isHttps = true;
      logger.info("🔒 使用 HTTPS/WSS 模式");
    } catch (error) {
      logger.error("❌ 读取 SSL 证书失败", { error: error.message });
      logger.warn("⚠️  回退到 HTTP/WS 模式");
      server = createHttpServer(app);
      isHttps = false;
    }
  } else {
    logger.warn("⚠️  SSL 证书文件不存在，回退到 HTTP/WS 模式", {
      keyPath: SSL_KEY_PATH,
      certPath: SSL_CERT_PATH,
    });
    server = createHttpServer(app);
    isHttps = false;
  }
} else {
  server = createHttpServer(app);
  isHttps = false;
  logger.info("📡 使用 HTTP/WS 模式");
}

// 初始化 WebSocket
initWebSocket(server);

// 测试数据库连接并启动服务器
testConnection().then((connected) => {
  if (!connected) {
    logger.warn("⚠️  警告: 数据库连接失败，某些功能可能无法使用");
  }

  // 启动服务器
  server.listen(PORT, () => {
    const protocol = isHttps ? "https" : "http";
    const wsProtocol = isHttps ? "wss" : "ws";
    logger.info(`🚀 服务器运行在 ${protocol}://localhost:${PORT}`);
    logger.info(`💬 WebSocket 运行在 ${wsProtocol}://localhost:${PORT}`);
  });
});

// 错误处理
process.on("unhandledRejection", (err) => {
  logger.error("未处理的 Promise 拒绝", { error: err });
});

process.on("uncaughtException", (err) => {
  logger.error("未捕获的异常", { error: err });
  process.exit(1);
});
