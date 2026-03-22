import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import postcsspxtoviewport8plugin from 'postcss-px-to-viewport-8-plugin'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import UnoCSS from 'unocss/vite'
import tailwindcss from '@tailwindcss/vite'
import autoVersion from 'vite-plugin-version-auto';
import VueRouter from 'vue-router/vite'
import { VueRouterAutoImports } from 'vue-router/unplugin'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VueRouter({
      /* options */
    }),
    vueJsx(),
    vueDevTools(),
    UnoCSS(),
    tailwindcss(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', VueRouterAutoImports, 'pinia'], // 自动导入 Vue 相关函数，如：ref, onMounted 等
            // 生成自动导入的类型声明文件
      dts: 'src/auto-imports.d.ts', // 生成 TypeScript 声明文件
      // ESLint报错解决
      eslintrc: {
        enabled: true, // 生成eslint规则
        filepath: './.eslintrc-auto-import.json', // 规则文件路径
        globalsPropValue: true // 全局变量值
      },
      vueTemplate: true
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dirs: ['src/components'], // 自动导入 src/components 目录下的组件
      extensions: ['vue', 'ts', 'tsx', 'js', 'jsx'], // 自动导入 .vue 后缀的文件
      deep: true,
      dts: 'src/components.d.ts'
    }),
    autoVersion({
      enabled: true,
      type: 'patch',        // 每次 build 自动升级 patch 版本
      injector: true,         // 注入到 HTML
      console: true,        // 控制台输出版本信息
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    target: 'es2015',
    sourcemap: false,
    // 提升 chunk 警告阈值以避免大型依赖引发噪声（按需调整）
    chunkSizeWarningLimit: 2000
  },
  css: {
    lightningcss: {
      errorRecovery: true
    },
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
})
