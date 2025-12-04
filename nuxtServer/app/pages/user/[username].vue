<template>
  <div class="profile-container">
    <div class="profile-header">
      <div class="back-navigation">
        <NuxtLink to="/chat" class="back-link">
          <Icon name="mdi:arrow-left" />
          返回聊天
        </NuxtLink>
      </div>
      
      <div class="profile-info">
        <div class="profile-avatar">
          <img :src="userProfile?.avatar || '/default-avatar.svg'" :alt="userProfile?.username" />
          <div :class="['status-indicator', userProfile?.isOnline ? 'online' : 'offline']"></div>
        </div>
        
        <div class="profile-details">
          <h1>{{ userProfile?.username }}</h1>
          <p class="user-bio">{{ userProfile?.bio || '这个人很懒，什么都没有留下~' }}</p>
          <div class="user-meta">
            <span class="join-date">
              <Icon name="mdi:calendar" />
              加入时间：{{ formatDate(userProfile?.createdAt) }}
            </span>
            <span class="status-text">
              <Icon :name="userProfile?.isOnline ? 'mdi:circle' : 'mdi:circle-outline'" />
              {{ userProfile?.isOnline ? '在线' : '离线' }}
            </span>
          </div>
        </div>
        
        <div class="profile-actions">
          <button @click="startChat" class="chat-button" :disabled="isCurrentUser">
            <Icon name="mdi:chat" />
            {{ isCurrentUser ? '就是我自己' : '开始聊天' }}
          </button>
          <button v-if="!isCurrentUser" @click="toggleFollow" class="follow-button">
            <Icon :name="isFollowing ? 'mdi:account-minus' : 'mdi:account-plus'" />
            {{ isFollowing ? '取消关注' : '关注' }}
          </button>
        </div>
      </div>
    </div>
    
    <div class="profile-content">
      <div class="content-tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'info' }]"
          @click="activeTab = 'info'"
        >
          基本信息
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'activity' }]"
          @click="activeTab = 'activity'"
        >
          动态记录
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'stats' }]"
          @click="activeTab = 'stats'"
        >
          统计数据
        </button>
      </div>
      
      <!-- 基本信息 -->
      <div v-if="activeTab === 'info'" class="tab-content">
        <div class="info-grid">
          <div class="info-item">
            <label>用户名</label>
            <span>{{ userProfile?.username }}</span>
          </div>
          <div class="info-item">
            <label>邮箱地址</label>
            <span>{{ userProfile?.email }}</span>
          </div>
          <div class="info-item">
            <label>用户ID</label>
            <span>{{ userProfile?.id }}</span>
          </div>
          <div class="info-item">
            <label>注册时间</label>
            <span>{{ formatDate(userProfile?.createdAt) }}</span>
          </div>
        </div>
      </div>
      
      <!-- 动态记录 -->
      <div v-if="activeTab === 'activity'" class="tab-content">
        <div v-if="loading.activity" class="loading">
          加载中...
        </div>
        <div v-else-if="activities.length === 0" class="empty-state">
          暂无动态记录
        </div>
        <div v-else class="activity-list">
          <div v-for="activity in activities" :key="activity.id" class="activity-item">
            <div class="activity-icon">
              <Icon :name="getActivityIcon(activity.type)" />
            </div>
            <div class="activity-content">
              <p>{{ activity.description }}</p>
              <small class="activity-time">{{ formatDate(activity.createdAt) }}</small>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 统计数据 -->
      <div v-if="activeTab === 'stats'" class="tab-content">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <Icon name="mdi:chat" />
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ userStats?.messageCount || 0 }}</div>
              <div class="stat-label">发送消息</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <Icon name="mdi:account-group" />
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ userStats?.friendCount || 0 }}</div>
              <div class="stat-label">好友数量</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <Icon name="mdi:clock" />
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ formatDuration(userStats?.onlineTime || 0) }}</div>
              <div class="stat-label">在线时长</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <Icon name="mdi:trophy" />
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ userStats?.level || 1 }}</div>
              <div class="stat-label">用户等级</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 设置页面元数据
definePageMeta({
  layout: 'default'
})

// 检查认证状态
const token = useCookie('auth-token')
if (!token.value) {
  await navigateTo('/login')
}

// 获取路由参数
const route = useRoute()
const username = route.params.username

// 响应式数据
const userProfile = ref(null)
const userStats = ref(null)
const activities = ref([])
const loading = ref({
  activity: false
})
const activeTab = ref('info')
const isFollowing = ref(false)

// 当前用户是否是资料所有者
const isCurrentUser = computed(() => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
  return currentUser.username === username
})

// 获取用户资料
const fetchUserProfile = async () => {
  try {
    // 这里应该调用 API 获取用户资料
    // 暂时使用模拟数据
    userProfile.value = {
      id: '1',
      username: username,
      email: `${username}@example.com`,
      bio: '这是一个热爱聊天的用户，喜欢交朋友，分享生活点滴。',
      avatar: '',
      isOnline: Math.random() > 0.5,
      createdAt: new Date('2025-01-15')
    }
    
    userStats.value = {
      messageCount: Math.floor(Math.random() * 1000),
      friendCount: Math.floor(Math.random() * 100),
      onlineTime: Math.floor(Math.random() * 10000),
      level: Math.floor(Math.random() * 10) + 1
    }
    
    // 模拟关注状态
    isFollowing.value = Math.random() > 0.7
  } catch (error) {
    console.error('获取用户资料失败:', error)
    useToast().error('获取用户资料失败')
  }
}

// 获取用户动态
const fetchUserActivities = async () => {
  loading.value.activity = true
  try {
    // 这里应该调用 API 获取用户动态
    // 暂时使用模拟数据
    activities.value = [
      {
        id: '1',
        type: 'message',
        description: '发送了一条消息',
        createdAt: new Date()
      },
      {
        id: '2',
        type: 'login',
        description: '登录了系统',
        createdAt: new Date(Date.now() - 3600000)
      },
      {
        id: '3',
        type: 'profile_update',
        description: '更新了个人资料',
        createdAt: new Date(Date.now() - 7200000)
      }
    ]
  } catch (error) {
    console.error('获取用户动态失败:', error)
  } finally {
    loading.value.activity = false
  }
}

// 开始聊天
const startChat = () => {
  if (!isCurrentUser.value) {
    // 这里应该实现开始聊天逻辑
    navigateTo(`/chat?user=${username}`)
  }
}

// 切换关注状态
const toggleFollow = () => {
  isFollowing.value = !isFollowing.value
  const action = isFollowing.value ? '关注成功' : '取消关注成功'
  useToast().success(action)
}

// 获取活动图标
const getActivityIcon = (type) => {
  const icons = {
    message: 'mdi:chat',
    login: 'mdi:login',
    profile_update: 'mdi:account-edit',
    follow: 'mdi:account-plus',
    join: 'mdi:account-plus'
  }
  return icons[type] || 'mdi:information'
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '未知'
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 格式化时长
const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `${days}天${hours % 24}小时`
  } else if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟`
  } else {
    return `${minutes}分钟`
  }
}

// 监听标签页切换
watch(activeTab, (newTab) => {
  if (newTab === 'activity' && activities.value.length === 0) {
    fetchUserActivities()
  }
})

// 页面加载时获取数据
onMounted(() => {
  fetchUserProfile()
})
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: #f8f9fa;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
}

.back-navigation {
  margin-bottom: 2rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-decoration: none;
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

.back-link:hover {
  opacity: 1;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.profile-avatar {
  position: relative;
  width: 120px;
  height: 120px;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
}

.status-indicator {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 3px solid white;
}

.status-indicator.online {
  background: #28a745;
}

.status-indicator.offline {
  background: #6c757d;
}

.profile-details {
  flex: 1;
}

.profile-details h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.user-bio {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 1rem;
}

.user-meta {
  display: flex;
  gap: 2rem;
  font-size: 0.9rem;
  opacity: 0.8;
}

.user-meta span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chat-button,
.follow-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.chat-button {
  background: white;
  color: #667eea;
}

.chat-button:hover:not(:disabled) {
  background: #f8f9fa;
}

.chat-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.follow-button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
}

.follow-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.profile-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.content-tabs {
  display: flex;
  background: white;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tab-btn {
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  transition: all 0.3s ease;
}

.tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
  background: #f8f9fa;
}

.tab-content {
  background: white;
  padding: 2rem;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-height: 300px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item label {
  font-weight: 600;
  color: #667eea;
}

.info-item span {
  color: #333;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.activity-icon {
  width: 40px;
  height: 40px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.activity-content p {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.activity-time {
  color: #666;
  font-size: 0.875rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  background: #667eea;
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.loading,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

@media (max-width: 768px) {
  .profile-info {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-details h1 {
    font-size: 2rem;
  }
  
  .user-meta {
    justify-content: center;
  }
  
  .profile-actions {
    flex-direction: row;
    justify-content: center;
  }
  
  .content-tabs {
    flex-direction: column;
  }
  
  .info-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>