# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## WebSocket 聊天服务

本项目包含一个简单的 WebSocket 聊天服务（基于 `ws`），由 `server/plugins/ws-server.ts` 在服务启动时开启（默认端口 `8081`，可通过环境变量 `WS_PORT` 改变）。

- 连接方式示例：
	- `ws://localhost:8081/?token=YOUR_JWT_TOKEN`
	- token 需要为登录时返回的 JWT（项目中使用 `utils/auth.ts` 生成/校验）。

- 消息格式（JSON）：
	- 加入房间：`{ "type": "join", "room": "room-name" }`
	- 离开房间：`{ "type": "leave", "room": "room-name" }`
	- 私聊：`{ "type": "private", "to": "targetUserId", "content": "hello" }`
	- 群聊：`{ "type": "group", "room": "room-name", "content": "hello group" }`
	- 心跳：`{ "type": "ping" }` （服务会回复 `pong`）

- 服务器发给客户端的示例消息：
	- `{ "type": "connected", "userId": "..." }`
	- `{ "type": "private", "from": "...", "content": "..." }`
	- `{ "type": "group", "from": "...", "room": "...", "content": "..." }`

启动开发环境后（`npm run dev`），WebSocket 服务会随插件一起启动（确保已 `npm install` 以安装 `ws` 依赖）。
