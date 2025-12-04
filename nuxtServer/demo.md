# 聊天应用演示

## 功能概述

这是一个基于 Nuxt 3 的实时聊天应用，具有以下功能：

### 1. 用户认证
- ✅ 用户注册和登录
- ✅ JWT 令牌认证
- ✅ 安全的 Cookie 存储
- ✅ 路由保护中间件

### 2. 实时聊天
- ✅ WebSocket 连接
- ✅ 私聊功能
- ✅ 群聊功能
- ✅ 在线用户显示
- ✅ 消息实时传输

### 3. 用户界面
- ✅ 现代化的登录页面
- ✅ 响应式聊天界面
- ✅ 用户在线状态显示
- ✅ 美观的UI设计

## 使用说明

### 启动应用

1. 启动主应用：
```bash
npm run dev
```
应用将在 http://localhost:3001 启动

2. WebSocket 服务器已自动运行在端口 8081

### 测试账号

您可以使用以下测试账号，或自行注册新账号：

- 用户名：testuser
- 邮箱：test@example.com  
- 密码：password123

### 主要功能

1. **登录页面** (`/login`)
   - 支持用户名或邮箱登录
   - 内置注册功能
   - 美观的渐变背景设计

2. **聊天界面** (`/chat`)
   - 侧边栏显示在线用户
   - 支持私聊和群聊
   - 实时消息传输
   - 用户在线状态指示器
   - 响应式设计，支持移动端

3. **WebSocket 功能**
   - 自动重连机制
   - 连接状态显示
   - 心跳检测
   - 消息广播

## 技术栈

- **前端**: Nuxt 3 + Vue 3 + TypeScript
- **后端**: Nitro + WebSocket
- **认证**: JWT + HTTP-only Cookies
- **样式**: CSS3 + 响应式设计
- **API文档**: Swagger/OpenAPI

## API 端点

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### WebSocket
- `GET /api/ws/stats` - 获取连接统计
- `GET /api/ws/users` - 获取在线用户
- `GET /api/ws/rooms` - 获取聊天室列表
- `POST /api/ws/broadcast` - 广播消息

## 项目结构

```
├── app/
│   └── app.vue              # 主应用组件
├── pages/
│   ├── login.vue            # 登录页面
│   └── chat.vue             # 聊天界面
├── middleware/
│   ├── auth.ts              # 认证中间件
│   └── auth-redirect.ts     # 认证重定向中间件
├── plugins/
│   └── ws.client.ts         # WebSocket 客户端插件
├── composables/
│   └── useWebSocket.ts      # WebSocket 组合式函数
├── assets/css/
│   └── main.css             # 全局样式
├── server/
│   ├── api/auth/            # 认证 API
│   ├── api/ws/              # WebSocket API
│   ├── models/              # 数据模型
│   ├── utils/               # 工具函数
│   └── plugins/             # 服务器插件
└── public/
    └── default-avatar.svg   # 默认头像
```

## 安全特性

- JWT 令牌认证
- HTTP-only Cookie 存储
- 密码哈希加密
- XSS 防护
- CSRF 保护

## 开发特性

- TypeScript 支持
- 热重载开发
- ESLint 代码检查
- 响应式设计
- PWA 支持