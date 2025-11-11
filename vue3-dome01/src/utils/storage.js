// 本地存储操作
export const storage = {
  get(key) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return localStorage.getItem(key)
    }
  },

  set(key, value) {
    try {
      if (typeof value === 'object') {
        localStorage.setItem(key, JSON.stringify(value))
      } else {
        localStorage.setItem(key, value)
      }
    } catch (error) {
      console.error('Storage set error:', error)
    }
  },

  remove(key) {
    localStorage.removeItem(key)
  },

  clear() {
    localStorage.clear()
  }
}

// Token 相关键名
export const TOKEN_KEY = 'access_token'
export const REFRESH_TOKEN_KEY = 'refresh_token'
export const TOKEN_EXPIRY_KEY = 'token_expiry'
