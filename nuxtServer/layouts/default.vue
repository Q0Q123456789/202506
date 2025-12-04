<template>
  <div class="default-layout">
    <!-- 导航栏 -->
    <nav v-if="showNavigation" class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <NuxtLink to="/" class="brand-link">
            <Icon name="mdi:chat" />
            <span>ChatApp</span>
          </NuxtLink>
        </div>
        
        <div class="nav-menu">
          <NuxtLink to="/" class="nav-link">
            <Icon name="mdi:home" />
            <span>首页</span>
          </NuxtLink>
          <NuxtLink to="/about" class="nav-link">
            <Icon name="mdi:information" />
            <span>关于</span>
          </NuxtLink>
          <NuxtLink v-if="!isLoggedIn" to="/login" class="nav-link">
            <Icon name="mdi:login" />
            <span>登录</span>
          </NuxtLink>
          <NuxtLink v-if="isLoggedIn" to="/chat" class="nav-link">
            <Icon name="mdi:chat" />
            <span>聊天</span>
          </NuxtLink>
          <NuxtLink v-if="isLoggedIn" to="/settings" class="nav-link">
            <Icon name="mdi:cog" />
            <span>设置</span>
          </NuxtLink>
        </div>
        
        <div class="nav-actions">
          <button 
            @click="toggleTheme" 
            class="theme-toggle"
            title="切换主题"
          >
            <Icon :name="isDarkMode ? 'mdi:weather-sunny' : 'mdi:weather-night'" />
          </button>
          
          <div v-if="isLoggedIn" class="user-menu">
            <button @click="toggleUserMenu" class="user-menu-button">
              <img 
                :src="userInfo?.avatar || '/default-avatar.svg'" 
                :alt="userInfo?.username" 
                class="user-avatar"
              />
              <Icon name="mdi:chevron-down" />
            </button>
            
            <div v-if="showUserMenu" class="user-dropdown">
              <div class="user-info">
                <strong>{{ userInfo?.username }}</strong>
                <small>{{ userInfo?.email }}</small>
              </div>
              <div class="dropdown-divider"></div>
              <NuxtLink to="/settings" class="dropdown-item">
                <Icon name="mdi:account-cog" />
                用户设置
              </NuxtLink>
              <button @click="handleLogout" class="dropdown-item logout-item">
                <Icon name="mdi:logout" />
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
    
    <!-- 主要内容区域 -->
    <main class="main-content" :class="{ 'with-nav': showNavigation }">
      <slot />
    </main>
    
    <!-- 页脚 -->
    <footer v-if="showNavigation" class="footer">
      <div class="footer-container">
        <div class="footer-content">
          <p>&copy; 2025 实时聊天应用. 基于 Nuxt 3 构建.</p>
          <div class="footer-links">
            <NuxtLink to="/about">关于我们</NuxtLink>
            <NuxtLink to="/privacy">隐私政策</NuxtLink>
            <NuxtLink to="/terms">服务条款</NuxtLink>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
// 检查用户登录状态
const token = useCookie('auth-token')
const isLoggedIn = computed(() => !!token.value)

// 用户信息
const userInfo = ref(null)

// 主题状态
const isDarkMode = ref(false)

// 菜单状态
const showUserMenu = ref(false)

// 判断是否显示导航栏
const showNavigation = computed(() => {
  const route = useRoute()
  const hideNavRoutes = ['/login', '/chat']
  return !hideNavRoutes.includes(route.path)
})

// 切换主题
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark', isDarkMode.value)
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
}

// 切换用户菜单
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

// 处理注销
const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    // 清除认证信息
    token.value = null
    
    // 清除用户信息
    userInfo.value = null
    
    // 注销 WebSocket 连接
    const { $ws } = useNuxtApp()
    $ws?.disconnect()
    
    // 跳转到登录页
    navigateTo('/login')
  }
  
  showUserMenu.value = false
}

// 点击外部关闭用户菜单
const handleClickOutside = (event) => {
  const userMenu = document.querySelector('.user-menu')
  if (userMenu && !userMenu.contains(event.target)) {
    showUserMenu.value = false
  }
}

// 页面加载时初始化
onMounted(() => {
  // 恢复主题设置
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  }
  
  // 加载用户信息（如果已登录）
  if (isLoggedIn.value) {
    // 这里应该调用 API 获取用户信息
    userInfo.value = {
      username: 'testuser',
      email: 'test@example.com',
      avatar: ''
    }
  }
  
  // 添加全局点击事件监听器
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 监听路由变化，关闭用户菜单
watch(() => useRoute().path, () => {
  showUserMenu.value = false
})
</script>

<style scoped>
.default-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: white;
  border-bottom: 1px solid #e1e5e9;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.nav-brand .brand-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #667eea;
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-menu {
  display: flex;
  gap: 1rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: #666;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: #f8f9fa;
  color: #667eea;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.theme-toggle {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background: #f8f9fa;
  color: #667eea;
}

.user-menu {
  position: relative;
}

.user-menu-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.user-menu-button:hover {
  background: #f8f9fa;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 1000;
}

.user-info {
  padding: 1rem;
}

.user-info strong {
  display: block;
  color: #333;
}

.user-info small {
  color: #666;
  font-size: 0.875rem;
}

.dropdown-divider {
  height: 1px;
  background: #e1e5e9;
  margin: 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  color: #333;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.dropdown-item:hover {
  background: #f8f9fa;
}

.logout-item {
  color: #dc3545;
}

.logout-item:hover {
  background: #fff5f5;
}

.main-content {
  flex: 1;
}

.main-content.with-nav {
  margin-top: 0;
}

.footer {
  background: #f8f9fa;
  border-top: 1px solid #e1e5e9;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-links {
  display: flex;
  gap: 2rem;
}

.footer-links a {
  color: #666;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: #667eea;
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 0.5rem;
  }
  
  .nav-menu {
    display: none;
  }
  
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 1rem;
  }
}

/* 暗色主题支持 */
.dark .navbar {
  background: #1a1a1a;
  border-bottom-color: #333;
}

.dark .nav-link {
  color: #ccc;
}

.dark .nav-link:hover,
.dark .nav-link.router-link-active {
  background: #333;
  color: #667eea;
}

.dark .theme-toggle {
  color: #ccc;
}

.dark .theme-toggle:hover {
  background: #333;
  color: #667eea;
}

.dark .user-dropdown {
  background: #1a1a1a;
  border-color: #333;
}

.dark .user-info strong {
  color: #fff;
}

.dark .user-info small {
  color: #ccc;
}

.dark .dropdown-divider {
  background: #333;
}

.dark .dropdown-item {
  color: #ccc;
}

.dark .dropdown-item:hover {
  background: #333;
}

.dark .footer {
  background: #1a1a1a;
  border-top-color: #333;
}

.dark .footer-links a {
  color: #ccc;
}
</style>