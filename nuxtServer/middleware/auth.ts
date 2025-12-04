export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('auth-token')
  // 如果未登录且不是访问登录页，重定向到登录页面
  if (!token.value && to.path !== '/login') {
    return navigateTo('/login')
  }
})