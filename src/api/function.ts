import http from '@/http'
import type { Result } from '@/http'
import { isMockEnabled, mockResponse } from '@/mock'
import type { BackendFunction } from '@/utils/dynamicRoutes'
import type { FunctionItem } from '@/mock/function'

let _menuStore: BackendFunction[] | null = null

async function getMenuStore(): Promise<BackendFunction[]> {
  if (_menuStore) return _menuStore
  const { mockMenuList } = await import('@/mock/menu')
  _menuStore = JSON.parse(JSON.stringify(mockMenuList))
  return _menuStore!
}

async function getMockHelpers() {
  return import('@/mock/function')
}

// 获取功能树（数据源：左侧导航菜单）
export async function getFunctionTree(): Promise<Result<FunctionItem[]>> {
  if (isMockEnabled()) {
    const menuStore = await getMenuStore()
    const { buildFunctionTreeFromMenu } = await getMockHelpers()
    return mockResponse(buildFunctionTreeFromMenu(menuStore))
  }
  return http.get<FunctionItem[]>('/api/System/Function/get_tree.html')
}

// 新增功能
export async function addFunction(data: Partial<FunctionItem>): Promise<Result<FunctionItem>> {
  if (isMockEnabled()) {
    const menuStore = await getMenuStore()
    const { functionItemToBackend } = await getMockHelpers()
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
    menuStore.push(functionItemToBackend(newItem) as BackendFunction)
    return mockResponse(newItem, '添加成功')
  }
  return http.post<FunctionItem>('/api/System/Function/add.html', data)
}

/**
 * 编辑功能
 */
export async function updateFunction(id: string, data: Partial<FunctionItem>): Promise<Result<FunctionItem>> {
  if (isMockEnabled()) {
    const menuStore = await getMenuStore()
    const { buildFunctionTreeFromMenu, flattenFunctionList, functionItemToBackend } = await getMockHelpers()
    const flat = flattenFunctionList(buildFunctionTreeFromMenu(menuStore))
    const target = flat.find((f) => f.id === id)
    if (target) {
      Object.assign(target, data)
      const idx = menuStore.findIndex((m) => m.function_id === id)
      if (idx >= 0) {
        menuStore[idx] = { ...menuStore[idx], ...functionItemToBackend(target) }
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
export async function deleteFunction(id: string): Promise<Result<null>> {
  if (isMockEnabled()) {
    const menuStore = await getMenuStore()
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
    _menuStore = menuStore.filter((m) => !idsToDelete.has(m.function_id))
    return mockResponse(null, '删除成功')
  }
  return http.post<null>('/api/System/Function/delete.html', { id })
}

/**
 * 切换状态（启用/停用）
 */
export async function toggleFunctionStatus(id: string, status: 'normal' | 'disabled'): Promise<Result<FunctionItem>> {
  if (isMockEnabled()) {
    const menuStore = await getMenuStore()
    const { backendToFunctionItem } = await getMockHelpers()
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
