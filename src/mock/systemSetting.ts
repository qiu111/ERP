import type { Result } from '@/http'

export interface SystemSetting {
  web_name: string
  web_company: string
  web_url: string
  web_hotline: string
  web_version: string
  web_description: string
  web_keywords: string
  web_website: string
  theme: string
  web_copyright: string
}

const STORAGE_KEY = 'erp_system_setting'

const defaultSetting: SystemSetting = {
  web_name: '同盟ERP综管平台',
  web_company: '科技',
  web_url: 'http://www.baidu.com/',
  web_hotline: '22222222',
  web_version: 'V2.0.1',
  web_description: '科技',
  web_keywords: '科技',
  web_website: '4548222',
  theme: '#008aff',
  web_copyright: 'Copyright © 2017 - 2019 All right',
}

function loadFromStorage(): SystemSetting {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...defaultSetting, ...JSON.parse(stored) }
    }
  } catch {
  }
  return { ...defaultSetting }
}

function saveToStorage(data: SystemSetting) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
  }
}

export function getSystemSetting(): Promise<Result<SystemSetting>> {
  const data = loadFromStorage()
  return Promise.resolve<Result<SystemSetting>>({
    code: 200,
    message: 'success',
    data,
  })
}

export function saveSystemSetting(data: SystemSetting): Promise<Result<SystemSetting>> {
  saveToStorage(data)
  return Promise.resolve<Result<SystemSetting>>({
    code: 200,
    message: '保存成功',
    data,
  })
}