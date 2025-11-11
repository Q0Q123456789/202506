import axios from 'axios'
import { getToken, setToken, clearToken, isTokenValid, isTokenExpired } from '@/utils/auth'
import { refreshToken } from './auth'

// 创建 Axios 实例
const api = axios.create({
  baseURL: import.meta.env.VUE_APP_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求队列（用于存储刷新 token 期间的请求）
let isRefreshing = false
let failedQueue = []

// 处理队列中的请求
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// 添加请求到队列
const addToQueue = (config) => {
  return new Promise((resolve, reject) => {
    failedQueue.push({ resolve, reject })
  }).then(token => {
    // 更新 token 并重试请求
    config.headers.Authorization = `Bearer ${token}`
    return config
  }).catch(err => {
    return Promise.reject(err)
  })
}

// 请求拦截器
api.interceptors.request.use(
  async (config) => {
    // 跳过认证的请求（如登录、刷新 token）
    if (config.skipAuth) {
      return config
    }

    const token = getToken()

    // 如果有 token，添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 检查 token 是否即将过期，如果是则刷新
    if (token && isTokenExpired() && !config._retry) {
      if (!isRefreshing) {
        isRefreshing = true
        config._retry = true

        try {
          // 刷新 token
          const response = await refreshToken()
          const { access_token, refresh_token, expires_in } = response.data

          // 保存新的 token
          setToken(access_token, refresh_token, expires_in)

          // 更新请求头
          config.headers.Authorization = `Bearer ${access_token}`

          // 处理队列中的请求
          processQueue(null, access_token)
          isRefreshing = false

          return config
        } catch (error) {
          // 刷新失败，清除 token 并跳转到登录页
          processQueue(error, null)
          clearToken()
          window.location.href = '/login'
          return Promise.reject(error)
        }
      } else {
        // 如果正在刷新，将请求加入队列
        return addToQueue(config)
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // 如果是 401 错误且没有重试过
    if (error.response?.status === 401 && !originalRequest._retry) {

      // 如果是 token 过期，尝试刷新
      if (isTokenValid() && getToken()) {
        originalRequest._retry = true

        if (!isRefreshing) {
          isRefreshing = true

          try {
            // 刷新 token
            const response = await refreshToken()
            const { access_token, refresh_token, expires_in } = response.data

            // 保存新的 token
            setToken(access_token, refresh_token, expires_in)

            // 更新原始请求的 Authorization 头
            originalRequest.headers.Authorization = `Bearer ${access_token}`

            // 处理队列中的请求
            processQueue(null, access_token)
            isRefreshing = false

            // 重新发送原始请求
            return api(originalRequest)
          } catch (refreshError) {
            // 刷新失败，清除 token 并跳转到登录页
            processQueue(refreshError, null)
            clearToken()
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        } else {
          // 如果正在刷新，将请求加入队列
          return addToQueue(originalRequest).then(config => {
            return api(config)
          })
        }
      } else {
        // Token 无效，跳转到登录页
        clearToken()
        window.location.href = '/login'
      }
    }

    // 其他错误处理
    return Promise.reject(error)
  }
)

export default api
