// src/mock/index.ts
// Mock 数据统一入口：判断是否启用 mock、提供统一响应包装
import type { Result } from '@/http'

/**
 * 是否启用 mock 数据
 * - 仅在开发环境（DEV=true）且 VITE_USE_MOCK='true' 时启用
 * - 生产环境构建时整段 mock 分支会被树摇剔除
 */
export function isMockEnabled(): boolean {
  return import.meta.env.DEV === true && import.meta.env.VITE_USE_MOCK === 'true'
}

/**
 * 将 mock 业务数据包装为与真实接口一致的 Result<T> 结构，
 * 并以 Promise 返回，模拟异步请求。
 */
export function mockResponse<T>(data: T, message = 'success'): Promise<Result<T>> {
  return Promise.resolve<Result<T>>({
    code: 200,
    message,
    data,
  })
}
