// 全局中间件 - 在每个页面加载前执行
export default defineNuxtMiddleware((to, _from) => {
  const token = useCookie('auth-token')
  const isAuthenticated = !!token.value

  // 定义需要认证的路由
  const protectedRoutes = ['/chat', '/settings']
  const publicRoutes = ['/', '/about', '/login', '/register']

  // 当前路由是否需要保护
  const isProtectedRoute = protectedRoutes.some(route => to.path.startsWith(route))

  // 如果访问受保护的路由但未登录，重定向到登录页
  if (isProtectedRoute && !isAuthenticated) {
    return navigateTo('/login', {
      redirectCode: 302,
      query: { redirect: to.fullPath }
    })
  }

  // 如果已登录且访问登录/注册页，重定向到聊天室
  if (isAuthenticated && ['/login', '/register'].includes(to.path)) {
    return navigateTo('/chat')
  }

  // 设置页面标题
  const titles = {
    '/': '首页',
    '/about': '关于我们',
    '/login': '用户登录',
    '/register': '用户注册',
    '/chat': '聊天室',
    '/settings': '用户设置'
  }

  if (titles[to.path]) {
    useHead({
      title: `${titles[to.path]} - 实时聊天应用`
    })
  }
})