import { storage, TOKEN_KEY, REFRESH_TOKEN_KEY, TOKEN_EXPIRY_KEY } from './storage'

// 获取 Token
export const getToken = () => storage.get(TOKEN_KEY)
export const getRefreshToken = () => storage.get(REFRESH_TOKEN_KEY)

// 设置 Token
export const setToken = (token, refreshToken, expiresIn = 3600) => {
  storage.set(TOKEN_KEY, token)
  storage.set(REFRESH_TOKEN_KEY, refreshToken)

  // 计算过期时间（提前 5 分钟过期）
  const expiryTime = Date.now() + (expiresIn - 300) * 1000
  storage.set(TOKEN_EXPIRY_KEY, expiryTime)
}

// 清除 Token
export const clearToken = () => {
  storage.remove(TOKEN_KEY)
  storage.remove(REFRESH_TOKEN_KEY)
  storage.remove(TOKEN_EXPIRY_KEY)
}

// 检查 Token 是否即将过期
export const isTokenExpired = () => {
  const expiryTime = storage.get(TOKEN_EXPIRY_KEY)
  if (!expiryTime) return true

  return Date.now() >= expiryTime
}

// 检查 Token 是否存在且有效
export const isTokenValid = () => {
  const token = getToken()
  return token && !isTokenExpired()
}
