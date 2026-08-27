import router, { loadDynamicRoutes } from './router'
import piniaPersist from 'pinia-plugin-persistedstate'
import App from './App.vue'
import '@/styles/global.scss'
import '@/styles/scrollbar.scss'
import { useUserStore } from '@/store/user/user'
import { setupElementPlus } from '@/utils/elementPlus'

const pinia = createPinia()
pinia.use(piniaPersist)

const app = createApp(App)

app.use(pinia)

// 注册 Element Plus 组件与指令
setupElementPlus(app)

// 在使用路由前检查登录状态，提前加载动态路由
// 避免刷新页面时 Router 解析 URL 找不到匹配路由而发出警告
async function bootstrap() {
  const userStore = useUserStore()
  if (userStore.isAuthenticated) {
    try {
      await loadDynamicRoutes()
    } catch (e) {
      console.error('提前加载动态路由失败:', e)
    }
  }

  app.use(router)
  app.mount('#app')
}

bootstrap()