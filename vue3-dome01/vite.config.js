import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    vueJsx(),
    tailwindcss(),
    // 仅在开发环境启用 devtools，避免生产构建带入额外开销或风险
    // 仅在 vite 的 mode 为 development 时启用 devtools（避免直接引用 process）
    ...(mode === 'development' ? [vueDevTools()] : []),
    // 自动导入Vue API
    AutoImport({
      // 自动导入Vue相关函数，如：ref, reactive, toRef 等
      imports: ['vue', 'vue-router', 'pinia'],
      // 生成自动导入的类型声明文件
      dts: 'src/auto-imports.d.ts',
      // ESLint报错解决
      eslintrc: {
        enabled: true, // 生成eslint规则
        filepath: './.eslintrc-auto-import.json', // 规则文件路径
        globalsPropValue: true // 全局变量值
      }
    }),
    // 自动按文件名注册组件（支持 src/components 目录），并生成 dts
    Components({
      dirs: ['src/components'],
      extensions: ['vue', 'jsx', 'tsx'],
      deep: true,
      dts: 'src/components.d.ts'
    }),
  ],
  // 开发服务器和构建优化（可按需调整）
  server: {
    host: '0.0.0.0',
    open: true
  },
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  build: {
    target: 'es2015',
    sourcemap: false,
    // 提升 chunk 警告阈值以避免大型依赖引发噪声（按需调整）
    chunkSizeWarningLimit: 2000
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
}))
