<template>
  <div class="error-container">
    <div class="error-content">
      <div class="error-animation">
        <div class="error-code">404</div>
        <div class="error-text">页面未找到</div>
      </div>
      
      <div class="error-message">
        <h2>哎呀，你似乎迷路了！</h2>
        <p>你访问的页面不存在，可能已经被删除或移动到其他位置。</p>
      </div>
      
      <div class="error-actions">
        <NuxtLink to="/" class="btn btn-primary">
          <Icon name="mdi:home" />
          返回首页
        </NuxtLink>
        <NuxtLink to="/chat" class="btn btn-secondary">
          <Icon name="mdi:chat" />
          进入聊天室
        </NuxtLink>
      </div>
      
      <div class="error-suggestions">
        <h3>你可能在寻找：</h3>
        <ul>
          <li>
            <NuxtLink to="/login">
              <Icon name="mdi:login" />
              登录页面
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/about">
              <Icon name="mdi:information" />
              关于我们
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/settings">
              <Icon name="mdi:cog" />
              用户设置
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
// 设置页面元数据
definePageMeta({
  title: '404 - 页面未找到',
  description: '你访问的页面不存在',
  layout: 'default'
})

// 设置404状态码
useHead({
  meta: [
    {
      name: 'robots',
      content: 'noindex, nofollow'
    }
  ]
})
</script>

<style scoped>
.error-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
}

.error-content {
  text-align: center;
  max-width: 600px;
}

.error-animation {
  margin-bottom: 3rem;
}

.error-code {
  font-size: 8rem;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: pulse 2s ease-in-out infinite;
}

.error-text {
  font-size: 2rem;
  opacity: 0.9;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.error-message h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.error-message p {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 3rem;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
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

.error-suggestions {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.error-suggestions h3 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
}

.error-suggestions ul {
  list-style: none;
  padding: 0;
}

.error-suggestions li {
  margin-bottom: 0.75rem;
}

.error-suggestions a {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-decoration: none;
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

.error-suggestions a:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .error-code {
    font-size: 6rem;
  }
  
  .error-text {
    font-size: 1.5rem;
  }
  
  .error-message h2 {
    font-size: 2rem;
  }
  
  .error-message p {
    font-size: 1rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 200px;
    justify-content: center;
  }
}
</style>