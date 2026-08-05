import { createApp } from 'vue'
import router from './router'
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persistedstate'
import App from './App.vue'
// 引入element-plus
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'  
import 'element-plus/dist/index.css'
import '@/styles/global.scss'
import '@/styles/scrollbar.scss'
import permission from './directives/permission'



const pinia = createPinia() // 创建pinia实例
pinia.use(piniaPersist) // 使用pinia持久化插件
const app = createApp(App)  
app.use(router)
app.use(ElementPlus)
app.use(pinia)
app.directive('permission', permission)
app.mount('#app')

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}