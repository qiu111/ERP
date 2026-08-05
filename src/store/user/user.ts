import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types'

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

  const ADMIN_ROLE = 'sys:admin'

  const isAdmin = computed(() => {
    const roles = userInfo.value?.roles || []
    return roles.includes(ADMIN_ROLE)
  })

  const hasPermission = (code: string): boolean => {
    if (isAdmin.value) return true
    const permissions = userInfo.value?.permissions || []
    return permissions.includes(code)
  }

  const hasAnyPermission = (codes: string[]): boolean => {
    if (!codes || codes.length === 0) return true
    if (isAdmin.value) return true
    const permissions = userInfo.value?.permissions || []
    return codes.some((code) => permissions.includes(code))
  }

  const hasRole = (role: string): boolean => {
    if (isAdmin.value) return true
    const roles = userInfo.value?.roles || []
    return roles.includes(role)
  }

  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    logout,
    isAuthenticated,
    isAdmin,
    hasPermission,
    hasAnyPermission,
    hasRole,
  }
})