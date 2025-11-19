import { query } from './db'

interface RequestLog {
  method: string
  url: string
  statusCode: number
  ip?: string
  userAgent?: string
  responseTime?: number
  timestamp: Date
}

class RequestLogger {
  private buffer: RequestLog[] = []
  private batchSize: number = 20
  private batchInterval: number = 3000
  private batchTimer: NodeJS.Timeout | null = null
  private enabled: boolean = true

  constructor(options?: {
    batchSize?: number
    batchInterval?: number
    enabled?: boolean
  }) {
    this.batchSize = options?.batchSize || 20
    this.batchInterval = options?.batchInterval || 3000
    this.enabled = options?.enabled !== false
  }

  // 记录请求日志
  async logRequest(log: RequestLog) {
    if (!this.enabled) {
      return
    }

    this.buffer.push({
      ...log,
      timestamp: log.timestamp || new Date(),
    })

    // 如果缓冲区达到批量大小，立即写入
    if (this.buffer.length >= this.batchSize) {
      await this.flush()
    } else {
      // 否则设置定时器
      this.scheduleFlush()
    }
  }

  // 安排刷新
  private scheduleFlush() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
    }

    this.batchTimer = setTimeout(() => {
      this.flush().catch((error) => {
        console.error('刷新请求日志缓冲区失败:', error.message)
      })
    }, this.batchInterval)
  }

  // 刷新缓冲区，写入数据库
  async flush() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }

    if (this.buffer.length === 0) {
      return
    }

    const logsToInsert = [...this.buffer]
    this.buffer = []

    try {
      await this.insertLogs(logsToInsert)
    } catch (error: any) {
      // 如果插入失败，将日志重新加入缓冲区（避免丢失）
      // 但限制缓冲区大小，避免内存溢出
      if (this.buffer.length < 2000) {
        this.buffer.unshift(...logsToInsert)
      }
      console.error('写入请求日志到 MySQL 失败:', error.message)
    }
  }

  // 批量插入日志到数据库
  private async insertLogs(logs: RequestLog[]) {
    if (logs.length === 0) return

    const values = logs.map((log) => [
      log.method,
      log.url.substring(0, 500), // 限制 URL 长度
      log.statusCode,
      log.ip || null,
      log.userAgent || null,
      log.responseTime || null,
      log.timestamp,
    ])

    const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ')
    const sql = `INSERT INTO request_logs (method, url, status_code, ip, user_agent, response_time, timestamp) VALUES ${placeholders}`

    const params = values.flat()
    await query(sql, params)
  }

  // 关闭日志记录器（应用关闭时调用）
  async close() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }
    await this.flush()
  }
}

// 创建单例实例
export const requestLogger = new RequestLogger({
  batchSize: parseInt(process.env.REQUEST_LOG_BATCH_SIZE || '20'),
  batchInterval: parseInt(process.env.REQUEST_LOG_BATCH_INTERVAL || '3000'),
  enabled: process.env.ENABLE_REQUEST_LOG !== 'false',
})

// 便捷方法
export async function logRequest(
  method: string,
  url: string,
  statusCode: number,
  options?: {
    ip?: string
    userAgent?: string
    responseTime?: number
  }
) {
  await requestLogger.logRequest({
    method,
    url,
    statusCode,
    ip: options?.ip,
    userAgent: options?.userAgent,
    responseTime: options?.responseTime,
    timestamp: new Date(),
  })
}

