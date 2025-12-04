<template>
  <div class="home-container">
    <div class="hero-section">
      <h1 class="hero-title">🚀 实时聊天应用</h1>
      <p class="hero-subtitle">基于 Nuxt 3 和 WebSocket 的现代化聊天平台</p>
      
      <div class="hero-actions">
        <NuxtLink to="/login" class="btn btn-primary">
          <span>立即开始</span>
          <Icon name="mdi:arrow-right" />
        </NuxtLink>
        <NuxtLink to="/about" class="btn btn-secondary">
          <Icon name="mdi:information" />
          <span>了解更多</span>
        </NuxtLink>
      </div>
    </div>
    
    <div class="features-section">
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <Icon name="mdi:chat" />
          </div>
          <h3>实时通信</h3>
          <p>基于 WebSocket 的低延迟实时消息传输</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <Icon name="mdi:shield-account" />
          </div>
          <h3>安全认证</h3>
          <p>JWT 令牌认证，保护用户隐私和数据安全</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <Icon name="mdi:account-group" />
          </div>
          <h3>在线状态</h3>
          <p>实时显示用户在线状态，查看谁在使用应用</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <Icon name="mdi:cellphone" />
          </div>
          <h3>响应式设计</h3>
          <p>完美适配桌面端和移动端，随时随地聊天</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 设置页面元数据和布局
definePageMeta({
  title: '首页 - 实时聊天应用',
  description: '基于 Nuxt 3 和 WebSocket 的现代化实时聊天平台',
  layout: 'default'
})

// 自动重定向逻辑（可选）
const token = useCookie('auth-token')

// 如果用户已登录，可以显示快速进入按钮
const isLoggedIn = computed(() => !!token.value)
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.hero-section {
  padding: 8rem 2rem 4rem;
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-title {
  font-size: 4rem;
  font-weight: bold;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 3rem;
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  background: #f8f9fa;
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  color: white;
  border-color: white;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.features-section {
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #ffd700;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.feature-card p {
  opacity: 0.9;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>