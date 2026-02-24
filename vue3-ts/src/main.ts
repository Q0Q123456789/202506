import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'dayjs/locale/zh-cn'
import DevUI from 'vue-devui';

import 'vue-devui/style.css';
import '@devui-design/icons/icomoon/devui-icon.css';
import 'virtual:uno.css'
import './style/main.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(ElementPlus, {
  locale: zhCn,
})
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(DevUI);

app.use(createPinia())
app.use(router)

app.mount('#app')
