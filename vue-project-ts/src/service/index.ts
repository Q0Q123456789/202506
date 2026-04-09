import axios from 'axios'

const service = axios.create({ baseURL: import.meta.env.VITE_APP_BASE_API, timeout: 30000 })

// 请求拦截器示例：自动带上 Token
service.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器示例：统一处理错误码
service.interceptors.response.use(
  (response) => response.data, // 直接返回 data，少写一层 .data
  (error) => {
    if (error.response.status === 401) {
      window.location.href = '/login' // 未认证则跳转登录
    }
    return Promise.reject(error)
  }
)

export default service
