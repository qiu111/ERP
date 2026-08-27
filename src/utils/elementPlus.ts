import 'element-plus/dist/index.css'

export function setupElementPlus(app: App) {
  // 全局注册 loading 指令
  app.directive('loading', ElLoading.directive)
}
