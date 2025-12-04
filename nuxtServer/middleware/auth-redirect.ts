// 认证重定向中间件 - 如果已登录则重定向到聊天室
export default defineNuxtMiddleware((to) => {
  console.log('to', to)
  const token = useCookie('auth-token')
  const isAuthenticated = !!token.value

  // 如果已登录且访问登录/注册页，重定向到聊天室
  if (isAuthenticated && ['/login', '/register'].includes(to.path)) {
    return navigateTo('/chat')
  }
})