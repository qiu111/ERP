/// <reference types="vite/client" />
//这个声明文件告诉 TypeScript：所有以 @/开头的导入，
// 都可以被当作 Vue 组件来处理。这样即使路径别名在编译时被替换，
// TypeScript 也不会报错。
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 环境变量类型声明
interface ImportMetaEnv {
  /** API 基础地址 */
  readonly VITE_API_BASE_URL: string
  /** 是否启用 mock 数据（'true' / 'false'） */
  readonly VITE_USE_MOCK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
