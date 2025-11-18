import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import logger from "./utils/logger.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

// 存储所有连接的客户端
const clients = new Map();

// 初始化 WebSocket 服务器
export const initWebSocket = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    logger.logWebSocket("新的 WebSocket 连接", { ip: clientIp });

    let userId = null;
    let username = null;

    // 从 URL 查询参数或消息中获取 token
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get("token");

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
        username = decoded.username;

        // 存储客户端信息
        clients.set(ws, { userId, username, ws });
        logger.logWebSocket("用户已连接 WebSocket", {
          userId,
          username,
          ip: clientIp,
        });

        // 发送欢迎消息
        ws.send(
          JSON.stringify({
            type: "connected",
            message: "WebSocket 连接成功",
            user: { id: userId, username },
          })
        );

        // 广播用户上线消息（可选）
        broadcast(
          {
            type: "user_joined",
            message: `${username} 已上线`,
            user: { id: userId, username },
          },
          ws
        );
      } catch (error) {
        logger.warn("WebSocket Token 验证失败", {
          error: error.message,
          ip: clientIp,
        });
        ws.send(
          JSON.stringify({
            type: "error",
            message: "认证失败，连接已关闭",
          })
        );
        ws.close();
        return;
      }
    } else {
      // 如果没有 token，允许连接但不存储用户信息
      logger.logWebSocket("匿名 WebSocket 连接", { ip: clientIp });
    }

    // 处理接收到的消息
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());

        // 如果还未认证且消息中包含 token
        if (!userId && data.token) {
          try {
            const decoded = jwt.verify(data.token, JWT_SECRET);
            userId = decoded.id;
            username = decoded.username;
            clients.set(ws, { userId, username, ws });

            logger.logWebSocket("WebSocket 认证成功", {
              userId,
              username,
              ip: clientIp,
            });

            ws.send(
              JSON.stringify({
                type: "authenticated",
                message: "认证成功",
                user: { id: userId, username },
              })
            );

            broadcast(
              {
                type: "user_joined",
                message: `${username} 已上线`,
                user: { id: userId, username },
              },
              ws
            );
          } catch (error) {
            logger.warn("WebSocket 认证失败", {
              error: error.message,
              ip: clientIp,
            });
            ws.send(
              JSON.stringify({
                type: "error",
                message: "认证失败",
              })
            );
          }
          return;
        }

        // 处理不同类型的消息
        switch (data.type) {
          case "ping":
            ws.send(JSON.stringify({ type: "pong" }));
            break;

          case "message":
            if (!userId) {
              logger.warn("WebSocket 未认证用户尝试发送消息", { ip: clientIp });
              ws.send(
                JSON.stringify({
                  type: "error",
                  message: "请先登录",
                })
              );
              return;
            }

            logger.logWebSocket("收到消息", {
              userId,
              username,
              messageLength: data.message?.length || 0,
            });

            // 广播消息给所有客户端
            broadcast({
              type: "message",
              message: data.message,
              user: { id: userId, username },
              timestamp: new Date().toISOString(),
            });
            break;

          case "private_message":
            if (!userId) {
              logger.warn("WebSocket 未认证用户尝试发送私信", { ip: clientIp });
              ws.send(
                JSON.stringify({
                  type: "error",
                  message: "请先登录",
                })
              );
              return;
            }

            logger.logWebSocket("发送私信", {
              fromUserId: userId,
              fromUsername: username,
              targetUserId: data.targetUserId,
            });

            // 发送私信给指定用户
            sendPrivateMessage(
              userId,
              username,
              data.targetUserId,
              data.message
            );
            break;

          default:
            logger.warn("WebSocket 未知消息类型", {
              type: data.type,
              userId,
              ip: clientIp,
            });
            ws.send(
              JSON.stringify({
                type: "error",
                message: "未知的消息类型",
              })
            );
        }
      } catch (error) {
        logger.logError(error, {
          action: "websocket_message",
          userId,
          ip: clientIp,
        });
        ws.send(
          JSON.stringify({
            type: "error",
            message: "消息格式错误",
          })
        );
      }
    });

    // 处理连接关闭
    ws.on("close", () => {
      if (userId && username) {
        logger.logWebSocket("用户断开 WebSocket 连接", {
          userId,
          username,
          ip: clientIp,
        });

        // 广播用户下线消息
        broadcast(
          {
            type: "user_left",
            message: `${username} 已下线`,
            user: { id: userId, username },
          },
          ws
        );
      } else {
        logger.logWebSocket("匿名用户断开 WebSocket 连接", { ip: clientIp });
      }

      clients.delete(ws);
    });

    // 处理错误
    ws.on("error", (error) => {
      logger.logError(error, {
        action: "websocket_error",
        userId,
        username,
        ip: clientIp,
      });
      clients.delete(ws);
    });
  });

  logger.info("WebSocket 服务器已启动");
  return wss;
};

// 广播消息给所有客户端
function broadcast(message, excludeWs = null) {
  const messageStr = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.ws !== excludeWs && client.ws.readyState === 1) {
      // 1 = OPEN
      client.ws.send(messageStr);
    }
  });
}

// 发送私信给指定用户
function sendPrivateMessage(fromUserId, fromUsername, targetUserId, message) {
  let sent = false;

  clients.forEach((client) => {
    if (client.userId === targetUserId && client.ws.readyState === 1) {
      client.ws.send(
        JSON.stringify({
          type: "private_message",
          message,
          from: { id: fromUserId, username: fromUsername },
          timestamp: new Date().toISOString(),
        })
      );
      sent = true;
    }
  });

  // 也发送回给发送者确认
  clients.forEach((client) => {
    if (client.userId === fromUserId && client.ws.readyState === 1) {
      client.ws.send(
        JSON.stringify({
          type: "private_message_sent",
          message,
          to: targetUserId,
          sent,
          timestamp: new Date().toISOString(),
        })
      );
    }
  });
}

// 获取在线用户列表
export function getOnlineUsers() {
  const users = [];
  clients.forEach((client) => {
    if (client.userId && client.username) {
      users.push({ id: client.userId, username: client.username });
    }
  });
  return users;
}
