// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false, // 改为SPA模式，更好地支持WebSocket

  runtimeConfig: {
    // 私有运行时配置，只在服务端可用
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-here-change-in-production',
    wsPort: parseInt(process.env.WS_PORT || '8081'),

    // 公共运行时配置，客户端和服务端都可用
    public: {
      apiBase: process.env.API_BASE || '/api',
      wsUrl: process.env.WS_URL || 'ws://localhost:8081'
    }
  },

  css: ['~/assets/css/main.css'],

  // 插件配置
  plugins: [
    '~/plugins/ws.client.ts' // 客户端WebSocket插件
  ],

  // 路由配置
  router: {
    options: {
      strict: true, // 启用严格模式路由匹配
    }
  },
  pages: true,

  // 实验性功能
  experimental: {
    payloadExtraction: false // 禁用负载提取，改善SPA体验
  },

  // Nitro配置
  nitro: {
    experimental: {
      wasm: true // 启用WebAssembly支持
    }
  },

  // 路由中间件
  routeRules: {
    // 公开路由
    '/': { prerender: true },
    '/about': { prerender: true },
    '/login': { prerender: true },

    // 受保护的路由重定向
    // '/chat': {
    //   redirect: '/login'
    // },
    // '/settings': {
    //   redirect: '/login'
    // },

    // API路由
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization'
      }
    }
  },

  // 站点元数据
  app: {
    head: {
      title: '实时聊天应用',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '基于 Nuxt 3 和 WebSocket 的现代化实时聊天平台' },
        { name: 'keywords', content: '聊天,实时,WebSocket,Nuxt 3,Vue 3' },
        { name: 'author', content: 'ChatApp Team' },
        { property: 'og:title', content: '实时聊天应用' },
        { property: 'og:description', content: '基于 Nuxt 3 和 WebSocket 的现代化实时聊天平台' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  },

  // 开发服务器配置
  devServer: {
    port: 3001, // 开发服务器端口
    host: 'localhost' // 开发服务器主机
  }
})
