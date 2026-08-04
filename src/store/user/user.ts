// src/stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import http from '@/http'
import { isMockEnabled, mockResponse } from '@/mock'
import { mockNavData } from '@/mock/user'

export interface UserInfo {
  id: number
  username: string
  name: string
  roles: string[]
  permissions: string[]
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo>(JSON.parse(localStorage.getItem('userInfo') || JSON.stringify({})))

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  const logout = () => {
    token.value = ''
    userInfo.value = {} as UserInfo
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  const isAuthenticated = computed(() => {
    return !!token.value
  })

  // 你可以根据实际的接口来获取用户信息或导航菜单
  const fetchNav = async (): Promise<void> => {
    try {
      // 开发环境 mock：返回 mockNavData；否则走真实接口
      const result = isMockEnabled()
        ? await mockResponse(mockNavData)
        : await http.get('/api/functions')
      console.log('导航/功能数据:', result.data)
    } catch (error) {
      console.error('获取导航/功能数据失败:', error)
    }
  }

  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    logout,
    isAuthenticated,
    fetchNav
  }
})