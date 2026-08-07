// src/mock/index.ts
// Mock 数据统一入口：判断是否启用 mock、提供统一响应包装
import type { Result } from '@/http'

/**
 * 是否启用 mock 数据
 * - 当 VITE_USE_MOCK='true' 时启用（开发 / 生产环境均可）
 * - 构建时 Vite 会将 import.meta.env.VITE_USE_MOCK 静态替换为对应值
 */
export function isMockEnabled(): boolean {
  return import.meta.env.VITE_USE_MOCK === 'true'
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
