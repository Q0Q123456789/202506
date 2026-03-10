import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

// 定义路由元信息类型
export interface RouteMeta {
  title?: string
  requiresAuth?: boolean
  roles?: string[]
  icon?: string
  hidden?: boolean
}

// 扩展 RouteRecordRaw 类型，添加自定义元信息
export type AppRouteRecordRaw = RouteRecordRaw & {
  meta?: RouteMeta
  children?: AppRouteRecordRaw[]
}

// 动态导入 views 文件夹下面的所有 vue|tsx|jsx 文件
const modules = import.meta.glob<() => Promise<{ default: any }>>([
  '../views/**/*.vue',
  '../views/**/*.tsx',
  '../views/**/*.jsx',
])

const routeMap = new Map<string, boolean>()
const routes: AppRouteRecordRaw[] = Object.keys(modules)
  .map((key): AppRouteRecordRaw | null => {
    try {
      // 统一路径分隔符，确保跨平台兼容性
      const normalizedKey = key.replace(/\\/g, '/')

      // 优化路径解析，减少字符串操作
      const parts = normalizedKey.split('/')
      const fileName = parts.pop()
      if (!fileName) {
        if (import.meta.env.NODE_ENV === 'development') {
          console.warn(`Invalid file path: ${key}`)
        }
        return null
      }

      // 移除扩展名
      const baseName = fileName.replace(/\.(vue|tsx|jsx)$/, '')

      // 处理index文件
      let routeName: string
      if (baseName === 'index') {
        const parentDir = parts.pop()
        if (!parentDir) {
          if (import.meta.env.NODE_ENV === 'development') {
            console.warn(`Invalid index file path: ${key}`)
          }
          return null
        }
        routeName = parentDir
      } else {
        routeName = baseName
      }

      // 验证路由名称
      if (!routeName || routeName.trim() === '') {
        if (import.meta.env.NODE_ENV === 'development') {
          console.warn(`Invalid route name for file: ${key}`)
        }
        return null
      }

      // 处理路由名称中的特殊字符，确保路径安全
      const safeRouteName = routeName.replace(/[^a-zA-Z0-9_-]/g, '-')

      // 处理重复路由
      const normalizedName = safeRouteName.toLowerCase()
      if (routeMap.has(normalizedName)) {
        if (import.meta.env.NODE_ENV === 'development') {
          console.warn(`Duplicate route name detected: ${normalizedName} for file: ${key}`)
        }
        return null
      }
      routeMap.set(normalizedName, true)

      // 生成路由标题（首字母大写，处理连字符和下划线）
      const title = safeRouteName
        .split(/[-_]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      // 开发环境调试日志
      if (import.meta.env.NODE_ENV === 'development') {
        console.log('Route generation:', { key, fileName, routeName: normalizedName, title })
      }

      return {
        path: `/${normalizedName}`,
        name: normalizedName,
        meta: {
          title,
          requiresAuth: false, // 默认不需要认证
          roles: [], // 默认无角色限制
        },
        component: async () => {
          try {
            const loader = modules[key]
            if (!loader) {
              console.error(`Module loader not found for key: ${key}`)
              return (await import('../components/ErrorComponent.vue')).default
            }
            const module = await loader()
            return module.default !== undefined ? module.default : module
          } catch (error) {
            console.error(`Failed to load route component for ${key}:`, error)
            return (await import('../components/ErrorComponent.vue')).default
          }
        },
      }
    } catch (error) {
      console.error(`Error processing route for file ${key}:`, error)
      return null
    }
  })
  .filter((route): route is AppRouteRecordRaw => route !== null)
routes.push({
  path: '/',
  redirect: '/home',
  meta: {
    title: 'Home',
    hidden: true,
  },
})
// 添加404路由作为fallback
routes.push({
  path: '/:pathMatch(.*)*',
  name: 'not-found',
  meta: {
    title: 'Not Found',
    hidden: true,
  },
  component: async () => (await import('../components/NotFound.vue')).default,
})

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

// 全局前置守卫
// router.beforeEach((to, from, next) => {
//   // 设置页面标题
//   if (to.meta.title) {
//     document.title = `${to.meta.title} - Vue3 App`
//   } else {
//     document.title = 'Vue3 App'
//   }

//   // 权限验证
//   const requiresAuth = to.meta.requiresAuth || false
//   if (requiresAuth) {
//     // 这里可以添加实际的认证逻辑，例如检查 localStorage 中的 token
//     const isAuthenticated = localStorage.getItem('token') !== null
//     if (!isAuthenticated) {
//       // 未认证，重定向到登录页（如果有）
//       // next('/login')
//       console.warn('Authentication required for route:', to.path)
//       // 暂时允许访问，实际项目中应该重定向
//       next()
//     } else {
//       // 已认证，检查角色权限
//       const roles = to.meta.roles || []
//       if (roles.length > 0) {
//         // 这里可以添加实际的角色检查逻辑
//         const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]')
//         const hasRole = roles.some((role) => userRoles.includes(role))
//         if (!hasRole) {
//           console.warn('Insufficient permissions for route:', to.path)
//           // 无权限，重定向到无权限页面（如果有）
//           // next('/403')
//           // 暂时允许访问，实际项目中应该重定向
//           next()
//         } else {
//           next()
//         }
//       } else {
//         next()
//       }
//     }
//   } else {
//     next()
//   }
// })

// 全局后置守卫
// router.afterEach((to, from) => {
//   // 可以在这里添加路由跳转后的逻辑，例如埋点统计
//   if (import.meta.env.NODE_ENV === 'development') {
//     console.log('Route changed:', { from: from.path, to: to.path })
//   }
// })

export default router
