import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import tailwindcss from '@tailwindcss/vite'
import postcsspxtoviewport8plugin from 'postcss-px-to-viewport-8-plugin'
import VueJsxVapor from 'vue-jsx-vapor/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    vueJsx(),
    tailwindcss(),
    // VueJsxVapor({
    //   macros: true,
    //   sourceMap: true
    // }),
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
    })
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
    }
  },
  css: {
    postcss: {
      plugins: [
        postcsspxtoviewport8plugin({
          unitToConvert: 'px',
          viewportWidth: (file) => {
            let num = 1920
            if (file.indexOf('m_') !== -1) {
              num = 375
            }
            return num
          },
          unitPrecision: 5, // 单位转换后保留的精度
          propList: ['*'], // 能转化为vw的属性列表
          viewportUnit: 'vw', // 希望使用的视口单位
          fontViewportUnit: 'vw', // 字体使用的视口单位
          selectorBlackList: [], // 需要忽略的CSS选择器，不会转为视口单位，使用原有的px等单位。
          minPixelValue: 1, // 设置最小的转换数值，如果为1的话，只有大于1的值会被转换
          mediaQuery: true, // 媒体查询里的单位是否需要转换单位
          replace: true, //  是否直接更换属性值，而不添加备用属性
          exclude: [/node_modules\/ant-design-vue/], // 忽略某些文件夹下的文件或特定文件，例如 'node_modules' 下的文件
          include: [], // 如果设置了include，那将只有匹配到的文件才会被转换
          landscape: false, // 是否添加根据 landscapeWidth 生成的媒体查询条件 @media (orientation: landscape)
          landscapeUnit: 'vw', // 横屏时使用的单位
          landscapeWidth: 1024 // 横屏时使用的视口宽度
        })
      ]
    }
  }
}))
