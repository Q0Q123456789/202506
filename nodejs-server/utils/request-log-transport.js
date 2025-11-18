import { Writable } from "stream";
import { query } from "../config/database.js";

/**
 * Winston 请求日志 MySQL 传输器
 * 专门用于记录 HTTP 请求日志
 */
class RequestLogTransport extends Writable {
  constructor(options = {}) {
    super({ objectMode: false });
    this.tableName = options.tableName || "request_logs";
    this.batchSize = options.batchSize || 20; // 请求日志批量插入大小
    this.batchInterval = options.batchInterval || 3000; // 批量插入间隔（毫秒）
    this.buffer = [];
    this.batchTimer = null;
    this.enabled = options.enabled !== false;
  }

  _write(chunk, encoding, callback) {
    if (!this.enabled) {
      return callback();
    }

    try {
      const logStr = chunk.toString();
      const log = JSON.parse(logStr);
      
      // 只处理请求日志（包含 statusCode 的日志）
      if (log.statusCode && log.message && log.message.includes(" ")) {
        const parts = log.message.split(" ");
        if (parts.length >= 2) {
          const method = parts[0];
          const url = parts.slice(1).join(" ");
          
          this.buffer.push({
            method,
            url: url.substring(0, 500), // 限制 URL 长度
            statusCode: log.statusCode,
            ip: log.ip || null,
            userAgent: log.userAgent || null,
            responseTime: parseInt(log.responseTime) || null,
            timestamp: log.timestamp || new Date(),
          });

          // 如果缓冲区达到批量大小，立即写入
          if (this.buffer.length >= this.batchSize) {
            this.flush().then(() => callback()).catch(() => callback());
          } else {
            // 否则设置定时器
            this.scheduleFlush();
            callback();
          }
        } else {
          callback();
        }
      } else {
        callback();
      }
    } catch (error) {
      // 如果写入数据库失败，不影响主流程
      console.error("请求日志传输器错误:", error.message);
      callback();
    }
  }

  scheduleFlush() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    this.batchTimer = setTimeout(() => {
      this.flush();
    }, this.batchInterval);
  }

  async flush() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    if (this.buffer.length === 0) {
      return;
    }

    const logsToInsert = [...this.buffer];
    this.buffer = [];

    try {
      await this.insertLogs(logsToInsert);
    } catch (error) {
      // 如果插入失败，将日志重新加入缓冲区（避免丢失）
      // 但限制缓冲区大小，避免内存溢出
      if (this.buffer.length < 2000) {
        this.buffer.unshift(...logsToInsert);
      }
      console.error("写入请求日志到 MySQL 失败:", error.message);
    }
  }

  async insertLogs(logs) {
    if (logs.length === 0) return;

    const values = logs.map((log) => [
      log.method,
      log.url,
      log.statusCode,
      log.ip,
      log.userAgent,
      log.responseTime,
      log.timestamp,
    ]);

    const placeholders = values
      .map(() => "(?, ?, ?, ?, ?, ?, ?)")
      .join(", ");
    const sql = `INSERT INTO ${this.tableName} (method, url, status_code, ip, user_agent, response_time, timestamp) VALUES ${placeholders}`;

    const params = values.flat();
    await query(sql, params);
  }

  _flush(callback) {
    this.flush()
      .then(() => callback())
      .catch((error) => {
        console.error("刷新请求日志缓冲区失败:", error.message);
        callback();
      });
  }
}

export default RequestLogTransport;

