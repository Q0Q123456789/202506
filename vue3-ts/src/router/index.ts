import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 自动加载路由配置
const modules = import.meta.glob('../views/**/index.vue', { eager: true })

const routes: RouteRecordRaw[] = Object.entries(modules).map(([path, module]) => {
  // 提取路由路径，例如：../views/Home/index.vue -> /home
  const routePath = path
    .replace('../views', '')
    .replace('/index.vue', '')
    .toLowerCase()

  // 提取组件名称，例如：Home
  const name = path
    .replace('../views/', '')
    .replace('/index.vue', '')
    .split('/')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')

  return {
    path: routePath || '/',
    name,
    component: (module as { default: any }).default,
  }
})

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
