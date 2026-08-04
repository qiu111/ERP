// src/api/user.ts
// 统一使用 src/http（Result<T> 契约）。
// 开发环境且 VITE_USE_MOCK=true 时返回本地 mock，否则走真实后端接口。
import http from '@/http'
import type { Result, LoginResult } from '@/http'
import type { BackendFunction } from '@/utils/dynamicRoutes'
import { isMockEnabled, mockResponse } from '@/mock'
import { mockMenuList } from '@/mock/menu'
import { mockLoginResult } from '@/mock/user'

/**
 * 获取菜单/功能列表（用于动态路由生成）
 * 开发环境 mock：返回 src/mock/menu.ts 的数据
 */
export function getMenu(): Promise<Result<BackendFunction[]>> {
  if (isMockEnabled()) {
    return mockResponse(mockMenuList)
  }
  return http.get<BackendFunction[]>('/api/System/Index/get_menu.html', { pid: 0 })
}

/**
 * 登录
 * 开发环境 mock：返回 src/mock/user.ts 的 mockLoginResult
 */
export function getLogin(data: object): Promise<Result<LoginResult>> {
  if (isMockEnabled()) {
    return mockResponse(mockLoginResult)
  }
  return http.post<LoginResult>('/api/System/Index/get_login.html', data)
}
