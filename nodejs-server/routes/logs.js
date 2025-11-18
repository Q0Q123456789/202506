import express from "express";
import { query } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";
import logger from "../utils/logger.js";
import { readdir, readFile, stat } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 获取系统日志列表（需要认证）
router.get("/system", authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      level,
      startDate,
      endDate,
      service,
      search,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // 构建查询条件
    let whereConditions = [];
    let params = [];

    if (level) {
      whereConditions.push("level = ?");
      params.push(level);
    }

    if (startDate) {
      whereConditions.push("timestamp >= ?");
      params.push(startDate);
    }

    if (endDate) {
      whereConditions.push("timestamp <= ?");
      params.push(endDate + " 23:59:59");
    }

    if (service) {
      whereConditions.push("service = ?");
      params.push(service);
    }

    if (search) {
      whereConditions.push("(message LIKE ? OR meta LIKE ?)");
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    const whereClause =
      whereConditions.length > 0
        ? "WHERE " + whereConditions.join(" AND ")
        : "";

    // 查询总数
    const countResult = await query(
      `SELECT COUNT(*) as total FROM logs ${whereClause}`,
      params
    );
    const total = countResult && countResult[0] ? countResult[0].total : 0;

    // 查询日志
    const sql = `SELECT id, level, message, meta, service, timestamp, created_at 
                 FROM logs 
                 ${whereClause}
                 ORDER BY timestamp DESC 
                 LIMIT ? OFFSET ?`;
    const logs = await query(sql, [...params, limitNum, offset]);

    // 解析 meta JSON（MySQL JSON 类型可能已经解析为对象）
    const formattedLogs = logs.map((log) => {
      let meta = null;
      if (log.meta) {
        if (typeof log.meta === "string") {
          try {
            meta = JSON.parse(log.meta);
          } catch (e) {
            // 如果解析失败，保持原值
            meta = log.meta;
          }
        } else {
          // 如果已经是对象，直接使用
          meta = log.meta;
        }
      }
      return {
        ...log,
        meta,
      };
    });

    logger.info("查询系统日志", {
      userId: req.user.id,
      page: pageNum,
      limit: limitNum,
      filters: { level, startDate, endDate, service, search },
    });

    res.json({
      success: true,
      data: formattedLogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.logError(error, { action: "getSystemLogs", userId: req.user?.id });
    res.status(500).json({
      success: false,
      error: "查询日志失败",
      details: error.message,
    });
  }
});

// 获取请求日志列表（需要认证）
router.get("/requests", authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      method,
      statusCode,
      startDate,
      endDate,
      ip,
      url,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // 构建查询条件
    let whereConditions = [];
    let params = [];

    if (method) {
      whereConditions.push("method = ?");
      params.push(method.toUpperCase());
    }

    if (statusCode) {
      whereConditions.push("status_code = ?");
      params.push(parseInt(statusCode));
    }

    if (startDate) {
      whereConditions.push("timestamp >= ?");
      params.push(startDate);
    }

    if (endDate) {
      whereConditions.push("timestamp <= ?");
      params.push(endDate + " 23:59:59");
    }

    if (ip) {
      whereConditions.push("ip LIKE ?");
      params.push(`%${ip}%`);
    }

    if (url) {
      whereConditions.push("url LIKE ?");
      params.push(`%${url}%`);
    }

    const whereClause =
      whereConditions.length > 0
        ? "WHERE " + whereConditions.join(" AND ")
        : "";

    // 查询总数
    const countResult = await query(
      `SELECT COUNT(*) as total FROM request_logs ${whereClause}`,
      params
    );
    const total = countResult && countResult[0] ? countResult[0].total : 0;

    // 查询日志
    const sql = `SELECT id, method, url, status_code, ip, user_agent, response_time, timestamp, created_at 
                 FROM request_logs 
                 ${whereClause}
                 ORDER BY timestamp DESC 
                 LIMIT ? OFFSET ?`;
    const logs = await query(sql, [...params, limitNum, offset]);

    logger.info("查询请求日志", {
      userId: req.user.id,
      page: pageNum,
      limit: limitNum,
      filters: { method, statusCode, startDate, endDate, ip, url },
    });

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.logError(error, {
      action: "getRequestLogs",
      userId: req.user?.id,
    });
    res.status(500).json({
      success: false,
      error: "查询请求日志失败",
      details: error.message,
    });
  }
});

// 获取日志统计信息（需要认证）
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateCondition = "";
    let params = [];

    if (startDate && endDate) {
      dateCondition = "WHERE timestamp >= ? AND timestamp <= ?";
      params = [startDate, endDate + " 23:59:59"];
    }

    // 系统日志统计
    const levelStats = await query(
      `SELECT level, COUNT(*) as count 
       FROM logs 
       ${dateCondition}
       GROUP BY level`,
      params
    );

    // 请求日志统计
    const statusStats = await query(
      `SELECT status_code, COUNT(*) as count 
       FROM request_logs 
       ${dateCondition}
       GROUP BY status_code 
       ORDER BY count DESC`,
      params
    );

    // 平均响应时间
    const avgResponseTime = await query(
      `SELECT AVG(response_time) as avg_time 
       FROM request_logs 
       ${dateCondition}`,
      params
    );

    // 总请求数
    const totalRequests = await query(
      `SELECT COUNT(*) as total 
       FROM request_logs 
       ${dateCondition}`,
      params
    );

    logger.info("查询日志统计", { userId: req.user.id });

    res.json({
      success: true,
      data: {
        systemLogs: {
          byLevel: levelStats || [],
        },
        requestLogs: {
          byStatus: statusStats || [],
          total: totalRequests && totalRequests[0] ? totalRequests[0].total : 0,
          avgResponseTime:
            avgResponseTime && avgResponseTime[0] && avgResponseTime[0].avg_time
              ? Math.round(avgResponseTime[0].avg_time)
              : 0,
        },
      },
    });
  } catch (error) {
    logger.logError(error, { action: "getLogStats", userId: req.user?.id });
    res.status(500).json({
      success: false,
      error: "查询日志统计失败",
      details: error.message,
    });
  }
});

// 获取日志文件列表（需要认证）
router.get("/files", authenticateToken, async (req, res) => {
  try {
    const logDir = join(__dirname, "..", "logs");

    const files = await readdir(logDir);
    const fileStats = await Promise.all(
      files.map(async (file) => {
        const filePath = join(logDir, file);
        const stats = await stat(filePath);
        return {
          name: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
        };
      })
    );

    // 按修改时间排序
    fileStats.sort((a, b) => b.modified - a.modified);

    logger.info("查询日志文件列表", { userId: req.user.id });

    res.json({
      success: true,
      data: fileStats,
    });
  } catch (error) {
    logger.logError(error, { action: "getLogFiles", userId: req.user?.id });
    res.status(500).json({
      success: false,
      error: "获取日志文件列表失败",
      details: error.message,
    });
  }
});

// 下载日志文件（需要认证）
router.get("/files/download/:filename", authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    const logDir = join(__dirname, "..", "logs");
    const filePath = join(logDir, filename);

    // 安全检查：确保文件在 logs 目录内
    if (!filePath.startsWith(logDir)) {
      return res.status(403).json({
        success: false,
        error: "非法文件路径",
      });
    }

    // 检查文件是否存在
    try {
      const stats = await stat(filePath);
      if (!stats.isFile()) {
        return res.status(404).json({
          success: false,
          error: "文件不存在",
        });
      }
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: "文件不存在",
      });
    }

    // 读取文件内容
    const fileContent = await readFile(filePath, "utf8");

    logger.info("下载日志文件", {
      userId: req.user.id,
      filename,
    });

    // 设置响应头
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(filename)}"`
    );

    res.send(fileContent);
  } catch (error) {
    logger.logError(error, {
      action: "downloadLogFile",
      userId: req.user?.id,
      filename: req.params.filename,
    });
    res.status(500).json({
      success: false,
      error: "下载日志文件失败",
      details: error.message,
    });
  }
});

// 导出日志为 CSV（需要认证）
router.get("/export/csv", authenticateToken, async (req, res) => {
  try {
    const {
      type = "system",
      startDate,
      endDate,
      level,
      statusCode,
    } = req.query;

    let whereConditions = [];
    let params = [];
    let tableName = "";
    let columns = [];

    if (type === "system") {
      tableName = "logs";
      columns = ["id", "level", "message", "service", "timestamp"];

      if (level) {
        whereConditions.push("level = ?");
        params.push(level);
      }
    } else if (type === "requests") {
      tableName = "request_logs";
      columns = [
        "id",
        "method",
        "url",
        "status_code",
        "ip",
        "response_time",
        "timestamp",
      ];

      if (statusCode) {
        whereConditions.push("status_code = ?");
        params.push(parseInt(statusCode));
      }
    } else {
      return res.status(400).json({
        success: false,
        error: "无效的日志类型，支持: system, requests",
      });
    }

    if (startDate) {
      whereConditions.push("timestamp >= ?");
      params.push(startDate);
    }

    if (endDate) {
      whereConditions.push("timestamp <= ?");
      params.push(endDate + " 23:59:59");
    }

    const whereClause =
      whereConditions.length > 0
        ? "WHERE " + whereConditions.join(" AND ")
        : "";

    // 查询数据（限制最多 10000 条）
    const sql = `SELECT ${columns.join(", ")} 
                 FROM ${tableName} 
                 ${whereClause}
                 ORDER BY timestamp DESC 
                 LIMIT 10000`;
    const logs = await query(sql, params);

    // 生成 CSV
    const csvHeader = columns.join(",") + "\n";
    const csvRows = logs.map((log) => {
      return columns
        .map((col) => {
          const value = log[col];
          // 处理包含逗号或引号的值
          if (value === null || value === undefined) return "";
          const str = String(value).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(",");
    });

    const csvContent = csvHeader + csvRows.join("\n");

    logger.info("导出日志为 CSV", {
      userId: req.user.id,
      type,
      count: logs.length,
    });

    // 设置响应头
    const filename = `logs_${type}_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(filename)}"`
    );

    res.send("\ufeff" + csvContent); // 添加 BOM 以支持 Excel 正确显示中文
  } catch (error) {
    logger.logError(error, {
      action: "exportLogsCSV",
      userId: req.user?.id,
    });
    res.status(500).json({
      success: false,
      error: "导出日志失败",
      details: error.message,
    });
  }
});

export default router;
