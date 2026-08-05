import axios from "axios"
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from "axios"
import { ElMessage } from "element-plus"
import type { LoginResult, UserInfo } from "@/types"

export interface Result<T = any> {
  code: number
  message: string
  data: T
}

export interface LoginParams {
  username: string
  password: string
}

export type { LoginResult, UserInfo }

// axios配置项
const config: AxiosRequestConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL, // 你的后端API地址
  timeout: 10000 // 适当延长超时时间
}

class Http {
  // 创建实例
  private service: AxiosInstance

  constructor(configs: AxiosRequestConfig) {
    // 创建实例
    this.service = axios.create(configs)

    // 请求拦截器
    this.service.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // 从store或localStorage获取token
        const token = localStorage.getItem('token') // 或者使用 store.getters.token
        
        if (token) {
          // 通常使用 'Authorization' 作为header key，但根据你的后端要求使用 'token'
          config.headers['token'] = token
          // 如果后端使用标准的 Authorization header，可以使用下面这行代替上面那行
          // config.headers['Authorization'] = `Bearer ${token}`
        }
        
        return config
      },
      (error: any) => {
        // 可以移除 ElMessage，因为这会在请求发送失败时显示（如网络问题），可能不需要立即提示用户
        console.error('请求错误:', error)
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.service.interceptors.response.use(
      (response: AxiosResponse): any => {
        const result = response.data as Result
        
        if (result && result.code === 200) {
          return result
        } else {
          // 根据后端实际返回结构调整
          const errorMsg = result?.message || '接口返回错误'
          ElMessage.error(errorMsg)
          return Promise.reject(result || { message: errorMsg })
        }
      },
      (error: any) => {
        console.error('响应错误:', error)
        
        let errorMessage = '网络异常，请稍后重试'
        
        if (error && error.response) {
          const { status, data } = error.response
          
          // 尝试从响应数据中获取错误信息
          const serverMessage = data?.message || data?.msg || data?.error || null
          if (serverMessage) {
            errorMessage = serverMessage
          }
          
          switch (status) {
            case 400:
              errorMessage = serverMessage || '请求错误'
              break
            case 401:
              errorMessage = serverMessage || '登录过期，请重新登录'
              // 可以在这里处理自动登出
              // this.handleLogout()
              break
            case 403:
              errorMessage = serverMessage || '拒绝访问'
              break
            case 404:
              errorMessage = serverMessage || '请求地址不存在'
              break
            case 405:
              errorMessage = serverMessage || '请求方法错误'
              break
            case 408:
              errorMessage = serverMessage || '请求超时'
              break
            case 500:
              errorMessage = serverMessage || '服务器内部错误'
              break
            case 502:
              errorMessage = serverMessage || '网关错误'
              break
            case 503:
              errorMessage = serverMessage || '服务不可用'
              break
            case 504:
              errorMessage = serverMessage || '网关超时'
              break
            default:
              errorMessage = serverMessage || '网络异常，请稍后重试'
              break
          }
        } else if (error.request) {
          // 请求已发出，但没有收到响应
          errorMessage = '网络连接异常，请检查网络后重试'
        } else {
          errorMessage = error.message || '未知错误，请稍后重试'
        }
        
        ElMessage.error(errorMessage)
        return Promise.reject(error)
      }
    )
  }

  // 通用请求方法
  request<T = any>(config: AxiosRequestConfig): Promise<Result<T>> {
    return this.service.request(config).then((res) => res as unknown as Result<T>)
  }

  get<T = any>(url: string, params?: object, config?: AxiosRequestConfig): Promise<Result<T>> {
    return this.service.get(url, { params, ...config }).then((res) => res as unknown as Result<T>)
  }

  post<T = any>(url: string, data?: object, config?: AxiosRequestConfig): Promise<Result<T>> {
    return this.service.post(url, data, config).then((res) => res as unknown as Result<T>)
  }

  put<T = any>(url: string, data?: object, config?: AxiosRequestConfig): Promise<Result<T>> {
    return this.service.put(url, data, config).then((res) => res as unknown as Result<T>)
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<Result<T>> {
    return this.service.delete(url, config).then((res) => res as unknown as Result<T>)
  }

  // 上传文件 - 修复了你的代码中的问题（headers应该在外面设置）
  upload<T = any>(url: string, file: File, fileName: string = 'file'): Promise<Result<T>> {
    const formData = new FormData()
    formData.append(fileName, file)

    return this.service.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then((res) => res as unknown as Result<T>)
  }
}

// 创建并导出默认实例
const http = new Http(config)

export default http