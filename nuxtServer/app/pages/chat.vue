<template>
  <div class="chat-container">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="user-header">
        <div class="user-avatar">
          <img
            :src="userInfo?.avatar || '/default-avatar.svg'"
            :alt="userInfo?.username"
          />
          <span class="online-indicator"></span>
        </div>
        <div class="user-info">
          <h3>{{ userInfo?.username }}</h3>
          <span class="status-text">在线</span>
        </div>
        <div class="user-actions">
          <NuxtLink to="/settings" class="action-btn" title="用户设置">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path
                d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 9.96l4.24 4.24M1.54 14.04l4.24-4.24M18.46 14.04l4.24-4.24"
              ></path>
            </svg>
          </NuxtLink>
          <NuxtLink to="/" class="action-btn" title="返回首页">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </NuxtLink>
          <button @click="handleLogout" class="logout-btn" title="退出登录">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>

      <div class="tabs">
        <button
          :class="['tab-btn', { active: activeTab === 'users' }]"
          @click="activeTab = 'users'"
        >
          用户列表
          <span v-if="onlineUsers.length" class="badge">{{
            onlineUsers.length
          }}</span>
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'rooms' }]"
          @click="activeTab = 'rooms'"
        >
          聊天室
          <span v-if="rooms.length" class="badge">{{ rooms.length }}</span>
        </button>
      </div>

      <!-- 用户列表 -->
      <div v-if="activeTab === 'users'" class="user-list">
        <div v-if="loading.users" class="loading">加载中...</div>
        <div v-else-if="onlineUsers.length === 0" class="empty-state">
          暂无在线用户
        </div>
        <div v-else>
          <div
            v-for="user in onlineUsers"
            :key="user.id"
            :class="['user-item', { current: user.id === userInfo?.id }]"
            @click="startPrivateChat(user)"
          >
            <div class="user-avatar small">
              <img
                :src="user.avatar || '/default-avatar.svg'"
                :alt="user.username"
              />
              <span class="online-indicator"></span>
            </div>
            <div class="user-details">
              <span class="username">{{ user.username }}</span>
              <span class="connection-info"
                >{{ user.connectionCount }} 个连接</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- 聊天室列表 -->
      <div v-if="activeTab === 'rooms'" class="room-list">
        <div v-if="loading.rooms" class="loading">加载中...</div>
        <div v-else-if="rooms.length === 0" class="empty-state">暂无聊天室</div>
        <div v-else>
          <div
            v-for="room in rooms"
            :key="room.name"
            class="room-item"
            @click="joinRoom(room.name)"
          >
            <div class="room-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                <path d="M16 3.13a4 4 0 010 7.75"></path>
              </svg>
            </div>
            <div class="room-details">
              <span class="room-name">{{ room.name }}</span>
              <span class="member-count">{{ room.memberCount }} 成员</span>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 聊天区域 -->
    <main class="chat-main">
      <div v-if="!currentChat" class="welcome-screen">
        <div class="welcome-content">
          <h2>欢迎使用聊天室</h2>
          <p>选择一个用户开始私聊，或加入聊天室</p>
          <div class="quick-actions">
            <button @click="createAndJoinRoom('general')" class="action-btn">
              加入通用聊天室
            </button>
            <button @click="activeTab = 'users'" class="action-btn secondary">
              查看在线用户
            </button>
          </div>
        </div>
      </div>

      <div v-else class="chat-content">
        <header class="chat-header">
          <div class="chat-info">
            <button @click="currentChat = null" class="back-btn">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <h3>{{ currentChat.name }}</h3>
            <span class="chat-type">{{
              currentChat.type === "private" ? "私聊" : "群聊"
            }}</span>
          </div>
          <div class="connection-status">
            <span :class="['status-dot', { connected: wsConnected }]"></span>
            {{ wsConnected ? "已连接" : "连接中..." }}
          </div>
        </header>

        <div class="messages-container" ref="messagesContainer">
          <div v-if="loading.messages" class="loading">加载消息中...</div>
          <div v-else>
            <div
              v-for="message in messages"
              :key="message.id"
              :class="[
                'message',
                {
                  'own-message': message.from === userInfo?.id,
                  'system-message': message.type === 'system',
                },
              ]"
            >
              <div v-if="message.type !== 'system'" class="message-content">
                <div class="message-header">
                  <span class="message-sender">{{ message.senderName }}</span>
                  <span class="message-time">{{ formatTime(message.ts) }}</span>
                </div>
                <div class="message-text">{{ message.content }}</div>
              </div>
              <div v-else class="system-message-content">
                {{ message.content }}
              </div>
            </div>
          </div>
        </div>

        <form @submit.prevent="sendMessage" class="message-form">
          <div class="input-group">
            <input
              v-model="messageInput"
              type="text"
              placeholder="输入消息..."
              :disabled="!wsConnected"
              @keydown.enter.prevent="sendMessage"
            />
            <button
              type="submit"
              :disabled="!messageInput.trim() || !wsConnected"
              class="send-btn"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
definePageMeta({});

// 检查认证状态
const token = useCookie("auth-token");
const userInfoCookie = useCookie("user-info");

if (!token.value) {
  await navigateTo("/login");
}

const userInfo = ref(userInfoCookie.value ? userInfoCookie.value : null);
const onlineUsers = ref([]);
const rooms = ref([]);
const activeTab = ref("users");
const currentChat = ref(null);
const messages = ref([]);
const messageInput = ref("");
const wsConnected = ref(false);
const ws = ref(null);
const messageId = ref(0);

const loading = ref({
  users: false,
  rooms: false,
  messages: false,
});

const messagesContainer = ref(null);

// 获取用户信息
onMounted(async () => {
  const userCookie = useCookie("user-info");
  if (userCookie.value) {
    userInfo.value = userCookie.value;
  }

  await loadOnlineUsers();
  await loadRooms();
  initWebSocket();
});

// 加载在线用户
const loadOnlineUsers = async () => {
  loading.value.users = true;
  try {
    const token = useCookie("auth-token").value;
    // 如果是模拟token，使用模拟数据
    if (token && token.startsWith("mock-token")) {
      // 模拟在线用户数据
      onlineUsers.value = [
        {
          id: "demo-user-1",
          connectionCount: 1,
          rooms: ["general"],
          username: "演示用户1",
        },
        {
          id: "demo-user-2",
          connectionCount: 1,
          rooms: ["general"],
          username: "演示用户2",
        },
      ];
      return;
    }

    const data = await $fetch("/api/ws/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (data.success) {
      onlineUsers.value = data.users.map((user) => ({
        ...user,
        username:
          user.id === userInfo.value?.id
            ? userInfo.value.username
            : `用户${user.id.slice(-4)}`,
      }));
    }
  } catch (error) {
    console.error("加载用户列表失败:", error);
    // 在错误情况下也提供模拟数据
    if (userInfo.value) {
      onlineUsers.value = [
        {
          id: userInfo.value.id,
          connectionCount: 1,
          rooms: [],
          username: userInfo.value.username,
        },
      ];
    }
  } finally {
    loading.value.users = false;
  }
};

// 加载聊天室
const loadRooms = async () => {
  loading.value.rooms = true;
  try {
    const token = useCookie("auth-token").value;

    // 如果是模拟token，使用模拟数据
    if (token && token.startsWith("mock-token")) {
      rooms.value = [
        {
          name: "general",
          memberCount: 2,
        },
        {
          name: "random",
          memberCount: 1,
        },
      ];
      return;
    }

    const data = await $fetch("/api/ws/rooms", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (data.success) {
      rooms.value = data.rooms;
    }
  } catch (error) {
    console.error("加载聊天室失败:", error);
    // 在错误情况下也提供模拟数据
    rooms.value = [
      {
        name: "general",
        memberCount: 1,
      },
    ];
  } finally {
    loading.value.rooms = false;
  }
};

// 初始化WebSocket
const initWebSocket = () => {
  const token = useCookie("auth-token").value;
  if (!token) {
    console.error("WebSocket: 没有找到认证令牌");
    return;
  }

  // 如果是模拟token，不尝试连接真实WebSocket
  if (token.startsWith("mock-token")) {
    console.log("WebSocket: 模拟模式，跳过真实连接");
    wsConnected.value = true; // 模拟连接成功

    // 模拟接收一些系统消息
    setTimeout(() => {
      addMessage({
        id: messageId.value++,
        type: "system",
        content: "模拟模式下已连接到聊天服务器",
        ts: Date.now(),
      });
    }, 1000);

    return;
  }

  const { $ws } = useNuxtApp();
  // 监听连接状态
  watch(
    () => $ws.wsConnected,
    (connected) => {
      console.log("WebSocket: 连接状态变化:", connected);
      wsConnected.value = connected;
      if (connected) {
        console.log("WebSocket: 连接成功");
      }
    },
    {
      immediate: true,
      deep: true,
    }
  );

  // 监听消息
  watch(
    () => $ws.ws.value?.readyState,
    (readyState) => {
      console.log("WebSocket: 状态变化:", readyState, WebSocket.OPEN);
      if ($ws.ws.value?.readyState === WebSocket.OPEN) {
        $ws.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            handleWebSocketMessage(message);
          } catch (error) {
            console.error("WebSocket: 解析消息失败:", error);
          }
        };
      }
    },
    {
      immediate: true,
      deep: true,
    }
  );

  // 尝试连接
  try {
    $ws.connect(token);
  } catch (error) {
    console.error("WebSocket: 连接失败:", error);
    wsConnected.value = false;
  }
};

// 处理WebSocket消息
const handleWebSocketMessage = (message) => {
  switch (message.type) {
    case "private":
      if (
        !currentChat.value ||
        (currentChat.value.type === "private" &&
          currentChat.value.id !== message.from &&
          currentChat.value.id !== message.to)
      ) {
        // 收到新的私聊消息，创建聊天会话
        startPrivateChat({ id: message.from });
      }
      addMessage({
        ...message,
        id: messageId.value++,
        senderName:
          message.from === userInfo.value?.id
            ? userInfo.value.username
            : `用户${message.from.slice(-4)}`,
      });
      break;

    case "group":
      console.log("currentChat.value", currentChat.value);
      if (
        currentChat.value &&
        currentChat.value.type === "room" &&
        currentChat.value.name === message.room
      ) {
        addMessage({
          ...message,
          id: messageId.value++,
          senderName:
            message.from === userInfo.value?.id
              ? userInfo.value.username
              : `用户${message.from.slice(-4)}`,
        });
      }
      break;

    case "stats":
      // 更新在线统计
      break;
  }
};

// 开始私聊
const startPrivateChat = (user) => {
  if (user.id === userInfo.value?.id) return;

  currentChat.value = {
    type: "private",
    id: user.id,
    name: user.username || `用户${user.id.slice(-4)}`,
  };

  // 清空消息历史（实际应用中应该从服务器加载）
  messages.value = [];

  // 添加系统消息
  addMessage({
    id: messageId.value++,
    type: "system",
    content: `开始与 ${currentChat.value.name} 的私聊`,
    ts: Date.now(),
  });
};

// 加入聊天室
const joinRoom = async (roomName) => {
  const { $ws } = useNuxtApp();
  if (wsConnected.value) {
    $ws.send({
      type: "join",
      room: roomName,
    });
  }

  currentChat.value = {
    type: "room",
    name: roomName,
  };

  // 清空消息历史
  messages.value = [];

  // 添加系统消息
  addMessage({
    id: messageId.value++,
    type: "system",
    content: `已加入聊天室 ${roomName}`,
    ts: Date.now(),
  });
};

// 创建并加入房间
const createAndJoinRoom = (roomName) => {
  joinRoom(roomName);
};

// 发送消息
const sendMessage = () => {
  if (!messageInput.value.trim() || !wsConnected.value || !currentChat.value) {
    return;
  }

  const token = useCookie("auth-token").value;
  const messageData = {
    content: messageInput.value.trim(),
    ts: Date.now(),
  };

  // 如果是模拟token，模拟发送消息
  if (token && token.startsWith("mock-token")) {
    const message = {
      ...messageData,
      id: messageId.value++,
      from: userInfo.value?.id || "demo-user",
      type: currentChat.value.type === "private" ? "private" : "group",
      to:
        currentChat.value.type === "private" ? currentChat.value.id : undefined,
      room:
        currentChat.value.type === "room" ? currentChat.value.name : undefined,
      senderName: userInfo.value?.username || "演示用户",
    };

    // 直接添加消息到列表
    addMessage(message);

    // 模拟收到回复
    setTimeout(() => {
      const replyMessage = {
        id: messageId.value++,
        from: "demo-user-reply",
        type: currentChat.value.type === "private" ? "private" : "group",
        to:
          currentChat.value.type === "private" ? userInfo.value?.id : undefined,
        room:
          currentChat.value.type === "room"
            ? currentChat.value.name
            : undefined,
        content: "这是模拟回复消息",
        ts: Date.now(),
        senderName: "模拟用户",
      };
      addMessage(replyMessage);
    }, 1000);

    messageInput.value = "";
    return;
  }

  const { $ws } = useNuxtApp();

  if (currentChat.value.type === "private") {
    $ws.send({
      type: "private",
      to: currentChat.value.id,
      ...messageData,
    });
  } else if (currentChat.value.type === "room") {
    $ws.send({
      type: "group",
      room: currentChat.value.name,
      ...messageData,
    });
  }

  messageInput.value = "";
};

// 添加消息到列表
const addMessage = (message) => {
  messages.value.push(message);
  nextTick(() => {
    scrollToBottom();
  });
  console.log("messages.value", messages.value);
};

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// 格式化时间
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 退出登录
const handleLogout = async () => {
  const { $ws } = useNuxtApp();
  $ws.disconnect();

  // 清除cookies
  const token = useCookie("auth-token");
  const userInfoCookie = useCookie("user-info");
  token.value = null;
  userInfoCookie.value = null;

  // 跳转到登录页
  await navigateTo("/login");
};

// 定期刷新用户列表和房间列表
onMounted(() => {
  setInterval(loadOnlineUsers, 30000); // 每30秒刷新一次
  setInterval(loadRooms, 60000); // 每60秒刷新一次
});

// 组件卸载时关闭WebSocket连接
onUnmounted(() => {
  const { $ws } = useNuxtApp();
  $ws.disconnect();
});
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100vh;
  background: #f5f5f5;
}

.sidebar {
  width: 300px;
  background: white;
  border-right: 1px solid #e1e5e9;
  display: flex;
  flex-direction: column;
}

.user-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e1e5e9;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  position: relative;
  width: 50px;
  height: 50px;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.user-avatar.small {
  width: 40px;
  height: 40px;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #28a745;
  border: 2px solid white;
  border-radius: 50%;
}

.user-info {
  flex: 1;
}

.user-info h3 {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.status-text {
  font-size: 0.875rem;
  color: #28a745;
}

.user-actions {
  display: flex;
  gap: 0.25rem;
}

.action-btn,
.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.3s;
  text-decoration: none;
}

.action-btn:hover,
.logout-btn:hover {
  background-color: #f8f9fa;
  color: #667eea;
}

.logout-btn:hover {
  color: #dc3545;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e1e5e9;
}

.tab-btn {
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  transition: all 0.3s;
  position: relative;
}

.tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.badge {
  background: #dc3545;
  color: white;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 0.5rem;
}

.user-list,
.room-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.loading,
.empty-state {
  text-align: center;
  color: #666;
  padding: 2rem;
}

.user-item,
.room-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.user-item:hover,
.room-item:hover {
  background-color: #f8f9fa;
}

.user-item.current {
  background-color: #e3f2fd;
}

.user-details,
.room-details {
  flex: 1;
}

.username,
.room-name {
  font-weight: 500;
  color: #333;
  display: block;
}

.connection-info,
.member-count {
  font-size: 0.875rem;
  color: #666;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.welcome-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-content {
  text-align: center;
  max-width: 400px;
}

.welcome-content h2 {
  color: #333;
  margin-bottom: 1rem;
}

.welcome-content p {
  color: #666;
  margin-bottom: 2rem;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-btn.secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.chat-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid #e1e5e9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  display: none;
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 6px;
  color: #666;
}

.back-btn:hover {
  background-color: #f8f9fa;
}

.chat-info h3 {
  margin: 0;
  color: #333;
}

.chat-type {
  background: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #666;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #dc3545;
}

.status-dot.connected {
  background: #28a745;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: #fafafa;
}

.message {
  margin-bottom: 1rem;
}

.message.own-message {
  display: flex;
  justify-content: flex-end;
}

.system-message {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

.message-content {
  max-width: 70%;
  background: white;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.own-message .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.message-sender {
  font-weight: 500;
  font-size: 0.875rem;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
}

.message-text {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.system-message-content {
  background: #e9ecef;
  color: #495057;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
}

.message-form {
  padding: 1rem 1.5rem;
  background: white;
  border-top: 1px solid #e1e5e9;
}

.input-group {
  display: flex;
  gap: 0.75rem;
}

.input-group input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 24px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s;
}

.input-group input:focus {
  border-color: #667eea;
}

.send-btn {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }

  .back-btn {
    display: block;
  }

  .message-content {
    max-width: 85%;
  }
}

@media (max-width: 480px) {
  .chat-header {
    padding: 0.75rem 1rem;
  }

  .message-form {
    padding: 0.75rem 1rem;
  }

  .input-group input {
    padding: 0.5rem 0.75rem;
  }

  .send-btn {
    width: 40px;
    height: 40px;
  }
}
</style>