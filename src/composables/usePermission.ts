// src/composables/usePermission.ts
// 按钮级权限组合式函数：判断当前用户是否拥有指定权限
// 优势：纯 TS 函数、完全响应式（store 变化自动重算）、无需全局注册
import { useUserStore } from '@/store/user/user'

export function usePermission() {
  const userStore = useUserStore()

  /**
   * 判断当前用户是否拥有指定权限
   * @param code 权限编码；字符串为单个权限，数组为任一满足（OR）；空值视为放行
   */
  const has = (code?: string | string[]): boolean => {
    if (!code || (Array.isArray(code) && code.length === 0)) return true // 空值视为放行
    return Array.isArray(code)
      ? userStore.hasAnyPermission(code)
      : userStore.hasPermission(code)
  }

  return { has }
}
