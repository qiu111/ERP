import { createApp } from 'vue'
import router, { loadDynamicRoutes } from './router'
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persistedstate'
import App from './App.vue'
import '@/styles/global.scss'
import '@/styles/scrollbar.scss'
import { useUserStore } from '@/store/user/user'

// Element Plus 组件按需导入
import {
  ElButton,
  ElIcon,
  ElTable,
  ElTableColumn,
  ElPagination,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElDatePicker,
  ElInputNumber,
  ElTree,
  ElTreeSelect,
  ElRadio,
  ElRadioGroup,
  ElTabs,
  ElTabPane,
  ElMenu,
  ElMenuItem,
  ElSubMenu,
  ElContainer,
  ElAside,
  ElHeader,
  ElMain,
  ElRow,
  ElCol,
  ElTag,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElBreadcrumb,
  ElBreadcrumbItem,
  ElAvatar,
  ElBadge,
  ElProgress,
  ElEmpty,
  ElBacktop,
  ElLoading,
} from 'element-plus'

// Element Plus 样式
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/icon/style/css'
import 'element-plus/es/components/table/style/css'
import 'element-plus/es/components/table-column/style/css'
import 'element-plus/es/components/pagination/style/css'
import 'element-plus/es/components/dialog/style/css'
import 'element-plus/es/components/form/style/css'
import 'element-plus/es/components/form-item/style/css'
import 'element-plus/es/components/input/style/css'
import 'element-plus/es/components/select/style/css'
import 'element-plus/es/components/option/style/css'
import 'element-plus/es/components/date-picker/style/css'
import 'element-plus/es/components/input-number/style/css'
import 'element-plus/es/components/tree/style/css'
import 'element-plus/es/components/tree-select/style/css'
import 'element-plus/es/components/radio/style/css'
import 'element-plus/es/components/radio-group/style/css'
import 'element-plus/es/components/tabs/style/css'
import 'element-plus/es/components/tab-pane/style/css'
import 'element-plus/es/components/menu/style/css'
import 'element-plus/es/components/menu-item/style/css'
import 'element-plus/es/components/sub-menu/style/css'
import 'element-plus/es/components/container/style/css'
import 'element-plus/es/components/aside/style/css'
import 'element-plus/es/components/header/style/css'
import 'element-plus/es/components/main/style/css'
import 'element-plus/es/components/row/style/css'
import 'element-plus/es/components/col/style/css'
import 'element-plus/es/components/tag/style/css'
import 'element-plus/es/components/dropdown/style/css'
import 'element-plus/es/components/dropdown-menu/style/css'
import 'element-plus/es/components/dropdown-item/style/css'
import 'element-plus/es/components/breadcrumb/style/css'
import 'element-plus/es/components/breadcrumb-item/style/css'
import 'element-plus/es/components/avatar/style/css'
import 'element-plus/es/components/badge/style/css'
import 'element-plus/es/components/progress/style/css'
import 'element-plus/es/components/empty/style/css'
import 'element-plus/es/components/backtop/style/css'
import 'element-plus/es/components/loading/style/css'
import 'element-plus/es/components/message-box/style/css'
import 'element-plus/es/components/message/style/css'

const pinia = createPinia()
pinia.use(piniaPersist)

const app = createApp(App)

app.use(pinia)

// 注册 Element Plus 组件
app.component('ElButton', ElButton)
app.component('ElIcon', ElIcon)
app.component('ElTable', ElTable)
app.component('ElTableColumn', ElTableColumn)
app.component('ElPagination', ElPagination)
app.component('ElDialog', ElDialog)
app.component('ElForm', ElForm)
app.component('ElFormItem', ElFormItem)
app.component('ElInput', ElInput)
app.component('ElSelect', ElSelect)
app.component('ElOption', ElOption)
app.component('ElDatePicker', ElDatePicker)
app.component('ElInputNumber', ElInputNumber)
app.component('ElTree', ElTree)
app.component('ElTreeSelect', ElTreeSelect)
app.component('ElRadio', ElRadio)
app.component('ElRadioGroup', ElRadioGroup)
app.component('ElTabs', ElTabs)
app.component('ElTabPane', ElTabPane)
app.component('ElMenu', ElMenu)
app.component('ElMenuItem', ElMenuItem)
app.component('ElSubMenu', ElSubMenu)
app.component('ElContainer', ElContainer)
app.component('ElAside', ElAside)
app.component('ElHeader', ElHeader)
app.component('ElMain', ElMain)
app.component('ElRow', ElRow)
app.component('ElCol', ElCol)
app.component('ElTag', ElTag)
app.component('ElDropdown', ElDropdown)
app.component('ElDropdownMenu', ElDropdownMenu)
app.component('ElDropdownItem', ElDropdownItem)
app.component('ElBreadcrumb', ElBreadcrumb)
app.component('ElBreadcrumbItem', ElBreadcrumbItem)
app.component('ElAvatar', ElAvatar)
app.component('ElBadge', ElBadge)
app.component('ElProgress', ElProgress)
app.component('ElEmpty', ElEmpty)
app.component('ElBacktop', ElBacktop)

// 注册 Element Plus 指令
app.directive('loading', ElLoading.directive)

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