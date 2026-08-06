import http from '@/http'
import type { Result, LoginResult } from '@/http'
import type { BackendFunction } from '@/utils/dynamicRoutes'
import { isMockEnabled, mockResponse } from '@/mock'

/**
 * 获取菜单/功能列表（用于动态路由生成）
 * 开发环境 mock：返回 src/mock/menu.ts 的数据
 */
export async function getMenu(): Promise<Result<BackendFunction[]>> {
  if (isMockEnabled()) {
    const { mockMenuList } = await import('@/mock/menu')
    return mockResponse(mockMenuList)
  }
  return http.get<BackendFunction[]>('/api/System/Index/get_menu.html', { pid: 0 })
}

/**
 * 登录
 * 开发环境 mock：返回 src/mock/user.ts 的 mockLoginResult
 */
export async function getLogin(data: object): Promise<Result<LoginResult>> {
  if (isMockEnabled()) {
    const { mockLoginResult } = await import('@/mock/user')
    return mockResponse(mockLoginResult)
  }
  return http.post<LoginResult>('/api/System/Index/get_login.html', data)
}
