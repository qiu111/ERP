// src/directives/permission.ts
// v-permission 自定义指令：基于用户权限控制元素显隐
//
// 用法：
//   v-permission="'roleList:add'"            // 单个权限编码
//   v-permission="['roleList:add','roleList:edit']"  // 拥有任意一个即显示（OR）
//
// 没有权限时元素会从 DOM 中移除（parentNode.removeChild）。
import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/store/user/user'

type PermissionValue = string | string[]

function evaluate(value: PermissionValue): boolean {
  const userStore = useUserStore()
  if (typeof value === 'string') {
    return userStore.hasPermission(value)
  }
  if (Array.isArray(value)) {
    return userStore.hasAnyPermission(value)
  }
  return true
}

function handle(el: HTMLElement, binding: DirectiveBinding<PermissionValue>) {
  if (!evaluate(binding.value)) {
    // 从 DOM 移除该元素
    el.parentNode?.removeChild(el)
  }
}

export const permission: Directive<HTMLElement, PermissionValue> = {
  mounted: handle,
  // 组件更新时重新评估
  updated: handle,
}

export default permission
