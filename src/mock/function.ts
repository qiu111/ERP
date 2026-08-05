// src/mock/function.ts
// 功能管理（mock/menu.ts）
// 通过转换函数将 BackendFunction → FunctionItem 统一数据结构
import type { BackendFunction } from '@/utils/dynamicRoutes'
import { mockMenuList } from '@/mock/menu'

export interface FunctionItem {
  id: string
  pid: string
  name: string
  code: string
  status: 'normal' | 'disabled'
  url?: string
  type?: 'menu' | 'function'
  icon?: string
  sort?: number
  enabled?: boolean
  memo?: string
  children?: FunctionItem[]
}

/**
 * 将 BackendFunction 转换为 FunctionItem
 */
export function backendToFunctionItem(bf: BackendFunction): FunctionItem {
  const enabled = bf.status === '1'
  return {
    id: bf.function_id || bf.id,
    pid: bf.function_pid || bf.pid,
    name: bf.function_name || bf.text,
    code: bf.function_code,
    status: enabled ? 'normal' : 'disabled',
    url: bf.function_url || bf.url || '',
    type: (bf.function_type === 'function' ? 'function' : 'menu'),
    icon: bf.function_icon || bf.iconCls || '',
    sort: parseInt(bf.function_order, 10) || 0,
    enabled,
    memo: bf.memo || '',
  }
}

/**
 * 从菜单数据构建 FunctionItem 树
 */
export function buildFunctionTreeFromMenu(
  menuList: BackendFunction[] = mockMenuList
): FunctionItem[] {
  const map = new Map<string, FunctionItem>()
  const roots: FunctionItem[] = []

  menuList.forEach((bf) => {
    const item = backendToFunctionItem(bf)
    map.set(item.id, { ...item, children: [] })
  })

  menuList.forEach((bf) => {
    const item = backendToFunctionItem(bf)
    const node = map.get(item.id)!
    if (item.pid === '0' || item.pid === '') {
      roots.push(node)
    } else {
      const parent = map.get(item.pid)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(node)
      } else {
        roots.push(node)
      }
    }
  })

  return roots
}

/**
 * 将 FunctionItem 树转换回扁平列表
 */
export function flattenFunctionList(list: FunctionItem[]): FunctionItem[] {
  const result: FunctionItem[] = []
  const walk = (items: FunctionItem[]) => {
    items.forEach((item) => {
      result.push(item)
      if (item.children && item.children.length) {
        walk(item.children)
      }
    })
  }
  walk(list)
  return result
}

/**
 * 将 FunctionItem 转换回 BackendFunction（用于 CRUD）
 */
export function functionItemToBackend(item: FunctionItem): Partial<BackendFunction> {
  return {
    function_id: item.id,
    function_name: item.name,
    function_url: item.url || '',
    function_pid: item.pid,
    function_code: item.code,
    function_type: item.type || 'menu',
    function_icon: item.icon || '',
    function_order: String(item.sort ?? 0),
    status: item.enabled ? '1' : '0',
    memo: item.memo || '',
    id: item.id,
    pid: item.pid,
    text: item.name,
    iconCls: item.icon || '',
    url: item.url || '',
  }
}


