<template>
  <div class="settings-container">
    <div class="settings-header">
      <div class="header-content">
        <NuxtLink to="/chat" class="back-link">
          <Icon name="mdi:arrow-left" />
          返回聊天
        </NuxtLink>
        <h1>用户设置</h1>
        <p class="subtitle">管理您的账户和偏好设置</p>
      </div>
      
      <div class="user-info">
        <div class="avatar">
          <img :src="userInfo.avatar || '/default-avatar.svg'" :alt="userInfo.username" />
        </div>
        <div class="user-details">
          <h2>{{ userInfo.username }}</h2>
          <p>{{ userInfo.email }}</p>
        </div>
      </div>
    </div>
    
    <div class="settings-content">
      <div class="settings-section">
        <h3>个人信息</h3>
        <form @submit.prevent="updateProfile" class="settings-form">
          <div class="form-group">
            <label for="username">用户名</label>
            <input 
              id="username"
              v-model="profileForm.username" 
              type="text" 
              required 
              minlength="3"
              maxlength="20"
            />
          </div>
          
          <div class="form-group">
            <label for="email">邮箱地址</label>
            <input 
              id="email"
              v-model="profileForm.email" 
              type="email" 
              required 
            />
          </div>
          
          <div class="form-group">
            <label for="bio">个人简介</label>
            <textarea 
              id="bio"
              v-model="profileForm.bio" 
              rows="3"
              maxlength="200"
              placeholder="介绍一下自己..."
            ></textarea>
            <small>{{ profileForm.bio.length }}/200</small>
          </div>
          
          <div class="form-group">
            <label for="avatar">头像 URL</label>
            <input 
              id="avatar"
              v-model="profileForm.avatar" 
              type="url" 
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
          
          <button type="submit" class="save-button" :disabled="loading">
            <Icon name="mdi:content-save" />
            保存更改
          </button>
        </form>
      </div>
      
      <div class="settings-section">
        <h3>安全设置</h3>
        <form @submit.prevent="updatePassword" class="settings-form">
          <div class="form-group">
            <label for="current-password">当前密码</label>
            <input 
              id="current-password"
              v-model="passwordForm.currentPassword" 
              type="password" 
              required
            />
          </div>
          
          <div class="form-group">
            <label for="new-password">新密码</label>
            <input 
              id="new-password"
              v-model="passwordForm.newPassword" 
              type="password" 
              required
              minlength="6"
            />
          </div>
          
          <div class="form-group">
            <label for="confirm-password">确认新密码</label>
            <input 
              id="confirm-password"
              v-model="passwordForm.confirmPassword" 
              type="password" 
              required
            />
          </div>
          
          <button type="submit" class="save-button" :disabled="loading">
            <Icon name="mdi:lock" />
            更新密码
          </button>
        </form>
      </div>
      
      <div class="settings-section">
        <h3>聊天设置</h3>
        <div class="settings-form">
          <div class="toggle-group">
            <label class="toggle-label">
              <input 
                v-model="chatSettings.enableNotifications" 
                type="checkbox"
                @change="updateChatSettings"
              />
              <span class="toggle-slider"></span>
              <span class="toggle-text">启用消息通知</span>
            </label>
          </div>
          
          <div class="toggle-group">
            <label class="toggle-label">
              <input 
                v-model="chatSettings.showOnlineStatus" 
                type="checkbox"
                @change="updateChatSettings"
              />
              <span class="toggle-slider"></span>
              <span class="toggle-text">显示在线状态</span>
            </label>
          </div>
          
          <div class="toggle-group">
            <label class="toggle-label">
              <input 
                v-model="chatSettings.enableSounds" 
                type="checkbox"
                @change="updateChatSettings"
              />
              <span class="toggle-slider"></span>
              <span class="toggle-text">启用消息提示音</span>
            </label>
          </div>
        </div>
      </div>
      
      <div class="settings-section">
        <h3>危险操作</h3>
        <div class="danger-zone">
          <p>注销登录将会清除您的登录状态，需要重新登录才能使用应用。</p>
          <button @click="logout" class="danger-button">
            <Icon name="mdi:logout" />
            注销登录
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 设置页面元数据和布局
definePageMeta({
  title: '用户设置 - 实时聊天应用',
  description: '管理您的账户和偏好设置',
  layout: 'default'
})

// 检查用户登录状态
const token = useCookie('auth-token')
if (!token.value) {
  await navigateTo('/login')
}

// 响应式数据
const loading = ref(false)
const userInfo = ref({
  username: '',
  email: '',
  bio: '',
  avatar: ''
})

const profileForm = ref({
  username: '',
  email: '',
  bio: '',
  avatar: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const chatSettings = ref({
  enableNotifications: true,
  showOnlineStatus: true,
  enableSounds: false
})

// 加载用户信息
const loadUserInfo = async () => {
  try {
    // 这里应该调用 API 获取用户信息
    // 暂时使用模拟数据
    userInfo.value = {
      username: 'testuser',
      email: 'test@example.com',
      bio: '这是一个测试用户',
      avatar: ''
    }
    
    profileForm.value = { ...userInfo.value }
  } catch (error) {
    console.error('加载用户信息失败:', error)
  }
}

// 更新个人信息
const updateProfile = async () => {
  loading.value = true
  try {
    // 这里应该调用 API 更新用户信息
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟 API 调用
    
    userInfo.value = { ...profileForm.value }
    
    // 显示成功消息
    useToast().success('个人信息已更新')
  } catch (error) {
    console.error('更新个人信息失败:', error)
    useToast().error('更新失败，请重试')
  } finally {
    loading.value = false
  }
}

// 更新密码
const updatePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    useToast().error('新密码和确认密码不匹配')
    return
  }
  
  if (passwordForm.value.newPassword.length < 6) {
    useToast().error('密码长度至少为6位')
    return
  }
  
  loading.value = true
  try {
    // 这里应该调用 API 更新密码
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟 API 调用
    
    // 清空密码表单
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    
    useToast().success('密码已更新')
  } catch (error) {
    console.error('更新密码失败:', error)
    useToast().error('更新失败，请检查当前密码')
  } finally {
    loading.value = false
  }
}

// 更新聊天设置
const updateChatSettings = () => {
  // 保存到本地存储
  localStorage.setItem('chatSettings', JSON.stringify(chatSettings.value))
  useToast().success('聊天设置已保存')
}

// 注销登录
const logout = () => {
  if (confirm('确定要注销登录吗？')) {
    // 清除认证信息
    useCookie('auth-token').value = null
    
    // 注销 WebSocket 连接
    const { $ws } = useNuxtApp()
    $ws?.disconnect()
    
    // 跳转到登录页
    navigateTo('/login')
  }
}

// 页面加载时初始化
onMounted(() => {
  loadUserInfo()
  
  // 从本地存储加载聊天设置
  const savedSettings = localStorage.getItem('chatSettings')
  if (savedSettings) {
    chatSettings.value = { ...chatSettings.value, ...JSON.parse(savedSettings) }
  }
})
</script>

<style scoped>
.settings-container {
  min-height: 100vh;
  background: #f8f9fa;
}

.settings-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  margin-bottom: 2rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-decoration: none;
  margin-bottom: 2rem;
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

.back-link:hover {
  opacity: 1;
}

.header-content h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  opacity: 0.9;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid white;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.settings-content {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 2rem 2rem;
}

.settings-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.settings-section h3 {
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  color: #667eea;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #555;
}

.form-group input,
.form-group textarea {
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-group small {
  text-align: right;
  color: #888;
  font-size: 0.875rem;
}

.save-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.save-button:hover:not(:disabled) {
  background: #5a6fd8;
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}

.toggle-group:last-child {
  border-bottom: none;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  user-select: none;
}

.toggle-label input[type="checkbox"] {
  display: none;
}

.toggle-slider {
  width: 50px;
  height: 26px;
  background: #ccc;
  border-radius: 13px;
  position: relative;
  transition: background-color 0.3s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.toggle-label input[type="checkbox"]:checked + .toggle-slider {
  background: #667eea;
}

.toggle-label input[type="checkbox"]:checked + .toggle-slider::before {
  transform: translateX(24px);
}

.danger-zone {
  padding: 1.5rem;
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 8px;
}

.danger-zone p {
  margin-bottom: 1rem;
  color: #e53e3e;
}

.danger-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.danger-button:hover {
  background: #c53030;
}

@media (max-width: 768px) {
  .settings-header {
    padding: 1.5rem 1rem;
  }
  
  .header-content h1 {
    font-size: 2rem;
  }
  
  .user-info {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .settings-content {
    padding: 0 1rem 1rem;
  }
  
  .settings-section {
    padding: 1.5rem;
  }
}
</style>