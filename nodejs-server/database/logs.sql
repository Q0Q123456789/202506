-- 创建日志表
CREATE TABLE IF NOT EXISTS logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  level VARCHAR(20) NOT NULL COMMENT '日志级别: error, warn, info, debug',
  message TEXT NOT NULL COMMENT '日志消息',
  meta JSON COMMENT '元数据（JSON格式）',
  service VARCHAR(50) DEFAULT 'nodejs-server' COMMENT '服务名称',
  timestamp DATETIME NOT NULL COMMENT '时间戳',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_level (level),
  INDEX idx_timestamp (timestamp),
  INDEX idx_service (service),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统日志表';

-- 创建请求日志表
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

