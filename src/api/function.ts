// src/api/function.ts
// 功能管理 API — 数据源统一为左侧导航菜单（mockMenuList）
import http from '@/http'
import type { Result } from '@/http'
import { isMockEnabled, mockResponse } from '@/mock'
import { mockMenuList } from '@/mock/menu'
import {
  buildFunctionTreeFromMenu,
  backendToFunctionItem,
  flattenFunctionList,
  functionItemToBackend,
  type FunctionItem,
} from '@/mock/function'
import type { BackendFunction } from '@/utils/dynamicRoutes'

// 本地可变数据副本（基于 mockMenuList）
let menuStore: BackendFunction[] = JSON.parse(JSON.stringify(mockMenuList))

/**
 * 获取功能树（数据源：左侧导航菜单）
 */
export function getFunctionTree(): Promise<Result<FunctionItem[]>> {
  if (isMockEnabled()) {
    return mockResponse(buildFunctionTreeFromMenu(menuStore))
  }
  return http.get<FunctionItem[]>('/api/System/Function/get_tree.html')
}

/**
 * 获取功能列表（扁平，数据源：左侧导航菜单）
 */
export function getFunctionList(): Promise<Result<FunctionItem[]>> {
  if (isMockEnabled()) {
    const tree = buildFunctionTreeFromMenu(menuStore)
    return mockResponse(flattenFunctionList(tree))
  }
  return http.get<FunctionItem[]>('/api/System/Function/get_list.html')
}

/**
 * 新增功能
 */
export function addFunction(data: Partial<FunctionItem>): Promise<Result<FunctionItem>> {
  if (isMockEnabled()) {
    const newItem: FunctionItem = {
      id: data.id || Date.now().toString(),
      pid: data.pid || '0',
      name: data.name || '',
      code: data.code || '',
      status: data.status || 'normal',
      url: data.url || '',
      type: data.type || 'menu',
      icon: data.icon || '',
      sort: data.sort ?? 0,
      enabled: data.enabled ?? true,
      memo: data.memo || '',
    }
    // 转换为 BackendFunction 并添加到 store
    const bf = functionItemToBackend(newItem) as BackendFunction
    const parentId = data.pid || '0'
    if (parentId === '0') {
      menuStore.push(bf)
    } else {
      const parent = menuStore.find((m) => m.function_id === parentId)
      if (parent) {
        // 找到父节点，标记为有子节点
        menuStore.push(bf)
      } else {
        menuStore.push(bf)
      }
    }
    return mockResponse(newItem, '添加成功')
  }
  return http.post<FunctionItem>('/api/System/Function/add.html', data)
}

/**
 * 编辑功能
 */
export function updateFunction(id: string, data: Partial<FunctionItem>): Promise<Result<FunctionItem>> {
  if (isMockEnabled()) {
    const flat = flattenFunctionList(buildFunctionTreeFromMenu(menuStore))
    const target = flat.find((f) => f.id === id)
    if (target) {
      Object.assign(target, data)
      // 更新 menuStore 中对应的记录
      const idx = menuStore.findIndex((m) => m.function_id === id)
      if (idx >= 0) {
        menuStore[idx] = {
          ...menuStore[idx],
          ...functionItemToBackend(target),
          function_id: target.id,
          function_name: target.name,
          function_code: target.code,
          function_url: target.url || '',
          function_type: target.type || 'menu',
          function_icon: target.icon || '',
          function_order: String(target.sort ?? 0),
          status: target.enabled ? '1' : '0',
          function_pid: target.pid,
        }
      }
      return mockResponse(target, '更新成功')
    }
    return mockResponse({} as FunctionItem, '未找到该功能') as Promise<Result<FunctionItem>>
  }
  return http.post<FunctionItem>('/api/System/Function/update.html', { id, ...data })
}

/**
 * 删除功能
 */
export function deleteFunction(id: string): Promise<Result<null>> {
  if (isMockEnabled()) {
    // 递归收集要删除的节点 ID（包括子节点）
    const idsToDelete = new Set<string>()
    const collectIds = (pid: string) => {
      idsToDelete.add(pid)
      menuStore.forEach((m) => {
        if (m.function_pid === pid) {
          collectIds(m.function_id)
        }
      })
    }
    collectIds(id)
    // 从 menuStore 中移除
    menuStore = menuStore.filter((m) => !idsToDelete.has(m.function_id))
    return mockResponse(null, '删除成功')
  }
  return http.post<null>('/api/System/Function/delete.html', { id })
}

/**
 * 切换状态（启用/停用）
 */
export function toggleFunctionStatus(id: string, status: 'normal' | 'disabled'): Promise<Result<FunctionItem>> {
  if (isMockEnabled()) {
    const idx = menuStore.findIndex((m) => m.function_id === id)
    if (idx >= 0) {
      const enabled = status === 'normal'
      menuStore[idx] = {
        ...menuStore[idx],
        status: enabled ? '1' : '0',
      }
      const item = backendToFunctionItem(menuStore[idx])
      return mockResponse(item, status === 'normal' ? '已启用' : '已停用')
    }
    return mockResponse({} as FunctionItem, '未找到该功能') as Promise<Result<FunctionItem>>
  }
  return http.post<FunctionItem>('/api/System/Function/toggle_status.html', { id, status })
}
