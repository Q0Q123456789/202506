<template>
  <div class="about-container">
    <div class="about-header">
      <NuxtLink to="/" class="back-link">
        <Icon name="mdi:arrow-left" />
        返回首页
      </NuxtLink>
      <h1>关于实时聊天应用</h1>
      <p class="subtitle">了解我们的技术栈和功能特性</p>
    </div>
    
    <div class="content-section">
      <div class="section">
        <h2>🛠️ 技术栈</h2>
        <div class="tech-grid">
          <div class="tech-item">
            <div class="tech-icon">
              <Icon name="mdi:nuxt" />
            </div>
            <h3>Nuxt 3</h3>
            <p>Vue.js 全栈框架，提供 SSR/SPA 支持</p>
          </div>
          
          <div class="tech-item">
            <div class="tech-icon">
              <Icon name="mdi:vuejs" />
            </div>
            <h3>Vue 3</h3>
            <p>组合式 API，响应式数据管理</p>
          </div>
          
          <div class="tech-item">
            <div class="tech-icon">
              <Icon name="mdi:websocket" />
            </div>
            <h3>WebSocket</h3>
            <p>实时双向通信，低延迟消息传输</p>
          </div>
          
          <div class="tech-item">
            <div class="tech-icon">
              <Icon name="mdi:json" />
            </div>
            <h3>JWT</h3>
            <p>安全的用户认证和授权机制</p>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2>✨ 核心功能</h2>
        <div class="features-list">
          <div class="feature-item">
            <Icon name="mdi:check-circle" class="feature-icon" />
            <div>
              <h3>实时消息传输</h3>
              <p>基于 WebSocket 的即时消息，支持文字、表情等多种消息类型</p>
            </div>
          </div>
          
          <div class="feature-item">
            <Icon name="mdi:check-circle" class="feature-icon" />
            <div>
              <h3>用户状态管理</h3>
              <p>实时显示在线用户列表，支持用户上线/下线状态同步</p>
            </div>
          </div>
          
          <div class="feature-item">
            <Icon name="mdi:check-circle" class="feature-icon" />
            <div>
              <h3>安全认证系统</h3>
              <p>JWT 令牌认证，HTTP-only Cookie 存储，防止 XSS 攻击</p>
            </div>
          </div>
          
          <div class="feature-item">
            <Icon name="mdi:check-circle" class="feature-icon" />
            <div>
              <h3>响应式界面</h3>
              <p>完美适配桌面端和移动端，提供一致的用户体验</p>
            </div>
          </div>
          
          <div class="feature-item">
            <Icon name="mdi:check-circle" class="feature-icon" />
            <div>
              <h3>API 文档</h3>
              <p>集成 Swagger 自动生成 API 文档，便于开发和调试</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2>📊 项目架构</h2>
        <div class="architecture">
          <div class="arch-layer">
            <h3>前端层</h3>
            <ul>
              <li>Nuxt 3 (Vue 3 + TypeScript)</li>
              <li>Vite 构建工具</li>
              <li>TailwindCSS 样式框架</li>
              <li>WebSocket 客户端</li>
            </ul>
          </div>
          
          <div class="arch-layer">
            <h3>后端层</h3>
            <ul>
              <li>Nitro 服务端引擎</li>
              <li>WebSocket 服务器</li>
              <li>JWT 认证中间件</li>
              <li>SQLite 数据库</li>
            </ul>
          </div>
          
          <div class="arch-layer">
            <h3>API 层</h3>
            <ul>
              <li>RESTful API 设计</li>
              <li>Swagger 文档</li>
              <li>请求日志记录</li>
              <li>错误处理机制</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2>🚀 快速开始</h2>
        <div class="quick-start">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>注册账号</h3>
              <p>访问登录页面，创建新的用户账号</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>登录系统</h3>
              <p>使用注册的账号密码登录聊天应用</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>开始聊天</h3>
              <p>查看在线用户列表，开始实时聊天</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="about-footer">
      <NuxtLink to="/login" class="cta-button">
        开始使用
        <Icon name="mdi:arrow-right" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
// 设置页面元数据和布局
definePageMeta({
  title: '关于 - 实时聊天应用',
  description: '了解实时聊天应用的技术栈和功能特性',
  layout: 'default'
})
</script>

<style scoped>
.about-container {
  min-height: 100vh;
  background: #f8f9fa;
  color: #333;
}

.about-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 2rem;
  text-align: center;
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

.about-header h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

.content-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

.section {
  margin-bottom: 4rem;
}

.section h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #667eea;
  text-align: center;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.tech-item {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.tech-item:hover {
  transform: translateY(-5px);
}

.tech-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #667eea;
}

.tech-item h3 {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 1.5rem;
  color: #28a745;
  margin-top: 0.2rem;
}

.architecture {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.arch-layer {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.arch-layer h3 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #667eea;
}

.arch-layer ul {
  list-style: none;
  padding: 0;
}

.arch-layer li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.arch-layer li:last-child {
  border-bottom: none;
}

.quick-start {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.step {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.step-number {
  width: 60px;
  height: 60px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content h3 {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  color: #667eea;
}

.about-footer {
  background: #667eea;
  padding: 3rem 2rem;
  text-align: center;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: transform 0.3s ease;
}

.cta-button:hover {
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .about-header h1 {
    font-size: 2rem;
  }
  
  .tech-grid {
    grid-template-columns: 1fr;
  }
  
  .architecture {
    grid-template-columns: 1fr;
  }
  
  .step {
    flex-direction: column;
    text-align: center;
  }
}
</style>