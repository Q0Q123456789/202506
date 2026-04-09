import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import autoprefixer from 'autoprefixer'
import postcssImport from 'postcss-import'
import postcssNested from 'postcss-nested'
import postcssPxtorem from 'postcss-pxtorem'
import postcssUrl from 'postcss-url'
import postcssTailwindcss from '@tailwindcss/postcss'
import tailwindcss from '@tailwindcss/vite'
import VueRouter from 'vue-router/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VueRouter({
      /* options */
    }),
    vueJsx(),
    vueDevTools(),
    tailwindcss()
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  css: {
    postcss: {
      plugins: [
        autoprefixer(),
        postcssNested(),
        postcssImport(),
        postcssPxtorem(),
        postcssUrl(),
        postcssTailwindcss()
        // 其他插件...
      ]
    }
  }
})
