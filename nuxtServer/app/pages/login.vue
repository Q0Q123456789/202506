<template>
  <div class="login-container">
    <div class="login-card">
      <h2>登录聊天室</h2>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">用户名/邮箱</label>
          <input
            id="username"
            v-model="loginForm.username"
            type="text"
            placeholder="请输入用户名或邮箱"
            required
            :disabled="loading"
          />
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            required
            :disabled="loading"
          />
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <button type="submit" class="login-button" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
      
      <div class="register-link">
        还没有账号？<a href="#" @click.prevent="showRegister = true">立即注册</a>
      </div>
    </div>
    
    <!-- 注册弹窗 -->
    <div v-if="showRegister" class="modal-overlay" @click="showRegister = false">
      <div class="modal-card" @click.stop>
        <h3>注册账号</h3>
        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <label for="reg-username">用户名</label>
            <input
              id="reg-username"
              v-model="registerForm.username"
              type="text"
              placeholder="请输入用户名"
              required
              :disabled="registerLoading"
            />
          </div>
          
          <div class="form-group">
            <label for="reg-email">邮箱</label>
            <input
              id="reg-email"
              v-model="registerForm.email"
              type="email"
              placeholder="请输入邮箱"
              required
              :disabled="registerLoading"
            />
          </div>
          
          <div class="form-group">
            <label for="reg-password">密码</label>
            <input
              id="reg-password"
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码（至少6位）"
              required
              minlength="6"
              :disabled="registerLoading"
            />
          </div>
          
          <div v-if="registerError" class="error-message">
            {{ registerError }}
          </div>
          
          <div class="modal-buttons">
            <button type="button" class="cancel-button" @click="showRegister = false">
              取消
            </button>
            <button type="submit" class="register-button" :disabled="registerLoading">
              {{ registerLoading ? '注册中...' : '注册' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
})

// 检查是否已登录，如果已登录则重定向
const token = useCookie('auth-token')
if (token.value) {
  await navigateTo('/chat')
}

const loading = ref(false)
const registerLoading = ref(false)
const error = ref('')
const registerError = ref('')
const showRegister = ref(false)

const loginForm = ref({
  username: '',
  password: ''
})

const registerForm = ref({
  username: '',
  email: '',
  password: ''
})

// 登录处理
const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  // 临时测试：直接跳过API验证
  // if (loginForm.value.username && loginForm.value.password) {
  //   // 存储模拟的token
  //   const token = useCookie('auth-token', {
  //     maxAge: 60 * 60 * 24,
  //     secure: process.env.NODE_ENV === 'production',
  //     sameSite: 'lax'
  //   })
    
  //   token.value = 'mock-token-' + Date.now()
    
  //   // 存储模拟的用户信息
  //   const userInfo = useCookie('user-info', {
  //     maxAge: 60 * 60 * 24,
  //     secure: process.env.NODE_ENV === 'production',
  //     sameSite: 'lax'
  //   })
    
  //   userInfo.value = JSON.stringify({
  //     id: 'test-user-1',
  //     username: loginForm.value.username,
  //     email: loginForm.value.username + '@example.com'
  //   })
    
  //   console.log('模拟登录成功，准备跳转到聊天页面')
    
  //   // 延迟一下再跳转，确保cookie设置完成
  //   await navigateTo('/chat')
  //   loading.value = false
  //   return
  // }
  
  try {
    const data = await $fetch('/api/auth/login', {
      method: 'POST',
      body: loginForm.value
    })
    
    if (data.success) {
      // 存储token
      const token = useCookie('auth-token', {
        maxAge: 60 * 60 * 24,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
      
      token.value = data.token
      
      // 存储用户信息
      const userInfo = useCookie('user-info', {
        maxAge: 60 * 60 * 24,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
      
      userInfo.value = JSON.stringify(data.user)
      
      console.log('登录成功，准备跳转到聊天页面')
      
      setTimeout(() => {
        navigateTo('/chat')
      }, 100)
    } else {
      error.value = data.message || '登录失败'
    }
  } catch (err) {
    console.error('登录错误:', err)
    console.error('错误详情:', err.data)
    error.value = err.data?.message || '登录失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 注册处理
const handleRegister = async () => {
  registerLoading.value = true
  registerError.value = ''
  
  try {
    const data = await $fetch('/api/auth/register', {
      method: 'POST',
      body: registerForm.value
    })
    
    if (data.success) {
      showRegister.value = false
      // 注册成功后自动登录
      loginForm.value = {
        username: registerForm.value.username,
        password: registerForm.value.password
      }
      await handleLogin()
    } else {
      registerError.value = data.message || '注册失败'
    }
  } catch (err) {
    registerError.value = err.data?.message || '注册失败，请稍后重试'
  } finally {
    registerLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  font-weight: 600;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 500;
  color: #555;
}

input {
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: -0.5rem;
}

.login-button, .register-button {
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.login-button:hover:not(:disabled), .register-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.login-button:disabled, .register-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
}

.register-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
}

h3 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
  font-weight: 600;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.cancel-button {
  flex: 1;
  padding: 0.75rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.cancel-button:hover {
  background: #5a6268;
}

.register-button {
  flex: 2;
}
</style>