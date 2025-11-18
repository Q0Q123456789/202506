# Node.js 服务器

这是一个包含用户注册、登录和 WebSocket 功能的 Node.js 服务器。

## 功能特性

- ✅ 用户注册
- ✅ 用户登录
- ✅ JWT 身份验证
- ✅ WebSocket 实时通信
- ✅ 私信功能
- ✅ 广播消息

## 安装依赖

```bash
npm install
```

## 配置

复制 `.env.example` 到 `.env` 并修改配置：

```bash
cp .env.example .env
```

主要配置项：
- `PORT`: 服务器端口（默认: 3000）
- `JWT_SECRET`: JWT 密钥（生产环境请使用复杂密钥）
- `JWT_EXPIRES_IN`: Token 过期时间（默认: 24h）
- `DB_HOST`: MySQL 主机地址（默认: 119.29.228.7）
- `DB_PORT`: MySQL 端口（默认: 3306）
- `DB_USER`: MySQL 用户名（默认: appService）
- `DB_PASSWORD`: MySQL 密码（默认: KR6sJitTpyTaZYXZ）
- `DB_NAME`: 数据库名称（默认: app_service_db）

## 初始化数据库

首次运行前，需要初始化数据库表结构：

```bash
npm run init-db
```

这会自动创建数据库和用户表。

## 运行

```bash
# 生产模式
npm start

# 开发模式（自动重启）
npm run dev
```

## API 接口

### 注册

**POST** `/api/auth/register`

请求体：
```json
{
  "username": "用户名",
  "email": "email@example.com",
  "password": "密码"
}
```

响应：
```json
{
  "message": "注册成功",
  "token": "JWT_TOKEN",
  "user": {
    "id": "用户ID",
    "username": "用户名",
    "email": "email@example.com"
  }
}
```

### 登录

**POST** `/api/auth/login`

请求体：
```json
{
  "username": "用户名或邮箱",
  "password": "密码"
}
```

响应：
```json
{
  "message": "登录成功",
  "token": "JWT_TOKEN",
  "user": {
    "id": "用户ID",
    "username": "用户名",
    "email": "email@example.com"
  }
}
```

### 获取当前用户信息

**GET** `/api/auth/me`

请求头：
```
Authorization: Bearer JWT_TOKEN
```

响应：
```json
{
  "user": {
    "id": "用户ID",
    "username": "用户名",
    "email": "email@example.com"
  }
}
```

## WebSocket 连接

### 连接方式

使用 token 连接：
```
ws://localhost:3000?token=YOUR_JWT_TOKEN
```

或连接后发送认证消息：
```json
{
  "type": "auth",
  "token": "YOUR_JWT_TOKEN"
}
```

### 消息类型

#### 1. 发送普通消息（广播）

```json
{
  "type": "message",
  "message": "消息内容"
}
```

#### 2. 发送私信

```json
{
  "type": "private_message",
  "targetUserId": "目标用户ID",
  "message": "私信内容"
}
```

#### 3. 心跳检测

```json
{
  "type": "ping"
}
```

服务器会回复：
```json
{
  "type": "pong"
}
```

### 接收消息类型

#### 连接成功
```json
{
  "type": "connected",
  "message": "WebSocket 连接成功",
  "user": {
    "id": "用户ID",
    "username": "用户名"
  }
}
```

#### 收到消息
```json
{
  "type": "message",
  "message": "消息内容",
  "user": {
    "id": "发送者ID",
    "username": "发送者用户名"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 收到私信
```json
{
  "type": "private_message",
  "message": "私信内容",
  "from": {
    "id": "发送者ID",
    "username": "发送者用户名"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 用户上线/下线
```json
{
  "type": "user_joined",
  "message": "用户名 已上线",
  "user": {
    "id": "用户ID",
    "username": "用户名"
  }
}
```

## 客户端示例

### JavaScript/TypeScript

```javascript
// 1. 先登录获取 token
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'your_username',
    password: 'your_password'
  })
});

const { token } = await loginResponse.json();

// 2. 连接 WebSocket
const ws = new WebSocket(`ws://localhost:3000?token=${token}`);

ws.onopen = () => {
  console.log('WebSocket 连接成功');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('收到消息:', data);
};

// 3. 发送消息
ws.send(JSON.stringify({
  type: 'message',
  message: 'Hello, World!'
}));
```

## 数据库

### MySQL 数据库

项目已集成 MySQL 数据库，默认连接到：
- 主机: `119.29.228.7`
- 用户: `appService`
- 密码: `KR6sJitTpyTaZYXZ`
- 数据库: `app_service_db`

### 数据库表结构

- **users** - 用户表
  - `id` (VARCHAR): 用户唯一标识
  - `username` (VARCHAR): 用户名（唯一）
  - `email` (VARCHAR): 邮箱（唯一）
  - `password` (VARCHAR): 加密后的密码
  - `created_at` (TIMESTAMP): 创建时间
  - `updated_at` (TIMESTAMP): 更新时间

## 注意事项

1. ✅ 已使用 MySQL 数据库存储用户数据，数据会持久化保存。
2. 生产环境请使用更复杂的 JWT_SECRET。
3. 建议添加速率限制和更多的安全措施。
4. 可以根据需要扩展更多的 WebSocket 消息类型。
5. 确保 MySQL 服务器可访问，否则服务启动时会有警告（但不会阻止服务启动）。

## 许可证

ISC

