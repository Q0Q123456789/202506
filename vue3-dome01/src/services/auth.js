import api from './axios.js'

// 刷新 Token
export const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  const response = await api.post('/auth/refresh', {
    refresh_token: refreshToken
  }, {
    skipAuth: true // 跳过认证，避免循环拦截
  })

  return response.data
}

// 登录
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials, {
    skipAuth: true
  })
  return response.data
}

// 登出
export const logout = async () => {
  try {
    await api.post('/auth/logout', {}, {
      skipAuth: true
    })
  } catch (error) {
    console.error('Logout error:', error)
  }
}
