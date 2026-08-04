import { getCurrentEnv, getEnvConfig, getConfig } from '@/env.config.js'

/**
 * 环境变量工具类
 */
export class EnvUtils {
  /**
   * 获取当前环境
   */
  static getCurrentEnv() {
    return getCurrentEnv()
  }

  /**
   * 获取环境配置
   */
  static getEnvConfig() {
    return getEnvConfig()
  }

  /**
   * 获取特定配置项
   */
  static getConfig(key: string) {
    return getConfig(key)
  }

  /**
   * 是否为开发环境
   */
  static isDevelopment() {
    return this.getCurrentEnv() === 'development'
  }

  /**
   * 是否为生产环境
   */
  static isProduction() {
    return this.getCurrentEnv() === 'production'
  }

  /**
   * 是否为测试环境
   */
  static isTest() {
    return this.getCurrentEnv() === 'test'
  }

  /**
   * 获取API基础URL
   */
  static getApiBaseUrl() {
    return this.getConfig('VITE_API_BASE_URL')
  }

  /**
   * 获取API目标地址
   */
  static getApiTarget() {
    return this.getConfig('VITE_API_TARGET')
  }

  /**
   * 获取应用标题
   */
  static getAppTitle() {
    return this.getConfig('VITE_APP_TITLE')
  }

  /**
   * 获取应用版本
   */
  static getAppVersion() {
    return this.getConfig('VITE_APP_VERSION')
  }

  /**
   * 是否开启调试模式
   */
  static isDebug() {
    return this.getConfig('VITE_DEBUG') === 'true'
  }

  /**
   * 获取日志级别
   */
  static getLogLevel() {
    return this.getConfig('VITE_LOG_LEVEL')
  }

  /**
   * 获取上传URL
   */
  static getUploadUrl() {
    return this.getConfig('VITE_UPLOAD_URL')
  }

  /**
   * 获取WebSocket URL
   */
  static getWebSocketUrl() {
    return this.getConfig('VITE_WEBSOCKET_URL')
  }

  /**
   * 获取分页大小
   */
  static getPageSize() {
    return parseInt(this.getConfig('VITE_PAGE_SIZE') || '20')
  }

  /**
   * 获取Token存储键名
   */
  static getTokenKey() {
    return this.getConfig('VITE_TOKEN_KEY')
  }

  /**
   * 获取刷新Token存储键名
   */
  static getRefreshTokenKey() {
    return this.getConfig('VITE_REFRESH_TOKEN_KEY')
  }
}

// 导出默认实例
export default EnvUtils
