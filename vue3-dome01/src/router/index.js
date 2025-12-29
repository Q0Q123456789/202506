import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
// 动态导入 views 文件夹下面的所有 vue|tsx|jsx 文件
const modules = import.meta.glob(['../views/**/*.vue', '../views/**/*.tsx', '../views/**/*.jsx'])

const routeMap = new Map()
const routes = Object.keys(modules)
  .map((key) => {
    // 提取文件名，移除路径和扩展名
    const fileName = key
      .split('/')
      .pop()
      .replace(/\.(vue|tsx|jsx)$/, '')
    // 如果是index文件，使用文件夹名作为路由名
    const isIndexFile = fileName === 'index'
    const routeName = isIndexFile ? key.split('/').slice(-2, -1)[0] : fileName
    // 验证路由名称
    if (!routeName || routeName.trim() === '') {
      if (import.meta.env.NODE_ENV === 'development') {
        console.warn(`Invalid route name for file: ${key}`)
      }
      return null
    }

    // 处理重复路由
    const normalizedName = routeName.toLowerCase()
    if (routeMap.has(normalizedName)) {
      if (import.meta.env.NODE_ENV === 'development') {
        console.warn(`Duplicate route name detected: ${normalizedName} for file: ${key}`)
      }
      return null
    }
    routeMap.set(normalizedName, true)

    // 开发环境调试日志
    if (import.meta.env.NODE_ENV === 'development') {
      console.log('Route generation:', { key, fileName, routeName: normalizedName })
    }

    return {
      path: `/${normalizedName}`,
      name: normalizedName,
      component: async () => {
        try {
          const module = await modules[key]()
          return module.default || module
        } catch (error) {
          console.error(`Failed to load route component for ${key}:`, error)
          // 返回错误处理组件
          // return () => import('../components/ErrorComponent.vue')
        }
      }
    }
  })
  .filter((route) => route !== null)
routes.push({
  path: '/',
  redirect: '/home'
})
// 添加404路由作为fallback
routes.push({
  path: '/:pathMatch(.*)*',
  name: 'not-found'
  // component: () => import('../components/NotFound.vue')
})

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

export default router
