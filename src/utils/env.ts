/**
 * 获取当前环境
 */
export function getCurrentEnv(): string {
  return import.meta.env.MODE || 'development'
}

/**
 * 获取环境配置
 */
export function getEnvConfig(): Record<string, string> {
  return import.meta.env as unknown as Record<string, string>
}

/**
 * 获取特定配置项
 */
export function getConfig(key: string): string {
  return import.meta.env[key] as string || ''
}

/**
 * 是否为开发环境
 */
export function isDevelopment(): boolean {
  return getCurrentEnv() === 'development'
}

/**
 * 是否为生产环境
 */
export function isProduction(): boolean {
  return getCurrentEnv() === 'production'
}

/**
 * 是否为测试环境
 */
export function isTest(): boolean {
  return getCurrentEnv() === 'test'
}

/**
 * 获取API基础URL
 */
export function getApiBaseUrl(): string {
  return getConfig('VITE_API_BASE_URL')
}

/**
 * 获取API目标地址
 */
export function getApiTarget(): string {
  return getConfig('VITE_API_TARGET')
}

/**
 * 获取应用标题
 */
export function getAppTitle(): string {
  return getConfig('VITE_APP_TITLE') || 'ERP综合管理平台'
}

/**
 * 获取应用环境（供前端显示）
 */
export function getAppEnv(): string {
  return getCurrentEnv()
}

/**
 * 获取所有环境变量
 */
export function getAllEnv(): Record<string, string> {
  return { ...(import.meta.env as unknown as Record<string, string>) }
}

/**
 * 获取应用版本
 */
export function getAppVersion(): string {
  return getConfig('VITE_APP_VERSION') || '0.0.0'
}

/**
 * 是否开启调试模式
 */
export function isDebug(): boolean {
  return getConfig('VITE_DEBUG') === 'true'
}

/**
 * 获取日志级别
 */
export function getLogLevel(): string {
  return getConfig('VITE_LOG_LEVEL') || 'info'
}

/**
 * 获取上传URL
 */
export function getUploadUrl(): string {
  return getConfig('VITE_UPLOAD_URL')
}

/**
 * 获取WebSocket URL
 */
export function getWebSocketUrl(): string {
  return getConfig('VITE_WEBSOCKET_URL')
}

/**
 * 获取分页大小
 */
export function getPageSize(): number {
  return parseInt(getConfig('VITE_PAGE_SIZE') || '20')
}

/**
 * 获取Token存储键名
 */
export function getTokenKey(): string {
  return getConfig('VITE_TOKEN_KEY') || 'token'
}

/**
 * 获取刷新Token存储键名
 */
export function getRefreshTokenKey(): string {
  return getConfig('VITE_REFRESH_TOKEN_KEY') || 'refresh_token'
}

/**
 * 环境变量工具类
 */
export class EnvUtils {
  static getCurrentEnv() { return getCurrentEnv() }
  static getEnvConfig() { return getEnvConfig() }
  static getConfig(key: string) { return getConfig(key) }
  static isDevelopment() { return isDevelopment() }
  static isProduction() { return isProduction() }
  static isTest() { return isTest() }
  static getApiBaseUrl() { return getApiBaseUrl() }
  static getApiTarget() { return getApiTarget() }
  static getAppTitle() { return getAppTitle() }
  static getAppVersion() { return getAppVersion() }
  static isDebug() { return isDebug() }
  static getLogLevel() { return getLogLevel() }
  static getUploadUrl() { return getUploadUrl() }
  static getWebSocketUrl() { return getWebSocketUrl() }
  static getPageSize() { return getPageSize() }
  static getTokenKey() { return getTokenKey() }
  static getRefreshTokenKey() { return getRefreshTokenKey() }
}

export default EnvUtils
