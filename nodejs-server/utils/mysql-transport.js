import { Writable } from "stream";
import { query } from "../config/database.js";

/**
 * Winston MySQL 传输器
 * 将日志异步写入 MySQL 数据库
 */
class MySQLTransport extends Writable {
  constructor(options = {}) {
    super({ objectMode: false });
    this.level = options.level || "info";
    this.tableName = options.tableName || "logs";
    this.batchSize = options.batchSize || 10; // 批量插入大小
    this.batchInterval = options.batchInterval || 5000; // 批量插入间隔（毫秒）
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
      
      // 检查日志级别
      const logLevel = log.level || "info";
      const levels = ["error", "warn", "info", "debug"];
      const minLevelIndex = levels.indexOf(this.level);
      const logLevelIndex = levels.indexOf(logLevel);
      
      if (logLevelIndex > minLevelIndex) {
        return callback(); // 日志级别不够，不记录
      }

      this.buffer.push(log);

      // 如果缓冲区达到批量大小，立即写入
      if (this.buffer.length >= this.batchSize) {
        this.flush().then(() => callback()).catch(() => callback());
      } else {
        // 否则设置定时器
        this.scheduleFlush();
        callback();
      }
    } catch (error) {
      // 如果写入数据库失败，不影响主流程
      console.error("MySQL 日志传输器错误:", error.message);
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
      if (this.buffer.length < 1000) {
        this.buffer.unshift(...logsToInsert);
      }
      console.error("写入日志到 MySQL 失败:", error.message);
    }
  }

  async insertLogs(logs) {
    if (logs.length === 0) return;

    const values = logs.map((log) => {
      const meta = { ...log };
      // 移除已单独存储的字段
      delete meta.level;
      delete meta.message;
      delete meta.service;
      delete meta.timestamp;

      return [
        log.level || "info",
        log.message || "",
        JSON.stringify(meta),
        log.service || "nodejs-server",
        log.timestamp || new Date(),
      ];
    });

    const placeholders = values.map(() => "(?, ?, ?, ?, ?)").join(", ");
    const sql = `INSERT INTO ${this.tableName} (level, message, meta, service, timestamp) VALUES ${placeholders}`;

    const params = values.flat();
    await query(sql, params);
  }

  _flush(callback) {
    this.flush()
      .then(() => callback())
      .catch((error) => {
        console.error("刷新日志缓冲区失败:", error.message);
        callback();
      });
  }
}

export default MySQLTransport;

