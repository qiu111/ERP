import type { Result } from '@/http'
import { mockResponse } from '@/mock'

export interface UserItem {
  id: number
  username: string
  relatedUsername: string
  nickname: string
  company: string
  role: string
  status: 'active' | 'inactive'
  operator: string
  lastLoginTime: string
  operateTime: string
}

export const mockRoleList = [
  'A公司财务-出纳',
  'A公司财务-会计',
  'A公司采购部',
  '超级管理员'
]

export const mockUserList: UserItem[] = [
  { id: 10181, username: 'A公司员工A', relatedUsername: '员工F员工A', nickname: 'A公司员工A', company: 'A公司', role: 'A公司助理', status: 'active', operator: '超级管理员', lastLoginTime: '2026-02-11 16:29', operateTime: '2026-02-11 16:29' },
  { id: 10160, username: 'A公司人事hr', relatedUsername: '员工F', nickname: 'A公司人事hr', company: 'A公司', role: 'A公司人事部经理', status: 'active', operator: '超级管理员', lastLoginTime: '2026-06-18 10:46', operateTime: '2026-01-06 10:24' },
  { id: 10107, username: '员工D', relatedUsername: '员工F', nickname: '员工D', company: 'A公司', role: 'A公司财务-会计', status: 'active', operator: '超级管理员', lastLoginTime: '2026-06-22 11:43', operateTime: '2026-04-02 09:29' },
  { id: 10106, username: 'admin', relatedUsername: '', nickname: '管理员', company: 'A公司', role: '超级管理员', status: 'active', operator: '超级管理员', lastLoginTime: '2026-08-05 21:30', operateTime: '2026-01-01 00:00' },
]

let userStore: UserItem[] = JSON.parse(JSON.stringify(mockUserList))

export function getUserPage(params: {
  page: number
  pageSize: number
  keyword?: string
  status?: string
  role?: string
  lastLoginDate?: string
}): Promise<Result<{ list: UserItem[]; total: number }>> {
  let filtered = [...userStore]

  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = filtered.filter(
      (u) =>
        u.username.toLowerCase().includes(kw) ||
        u.nickname.toLowerCase().includes(kw)
    )
  }

  if (params.status) {
    filtered = filtered.filter((u) => u.status === params.status)
  }

  if (params.role) {
    filtered = filtered.filter((u) => u.role === params.role)
  }

  if (params.lastLoginDate) {
    filtered = filtered.filter((u) =>
      u.lastLoginTime.startsWith(params.lastLoginDate!)
    )
  }

  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  const list = filtered.slice(start, start + params.pageSize)
  return mockResponse({ list, total })
}

export function addUser(data: Partial<Omit<UserItem, 'id'>> & { id?: number }): Promise<Result<UserItem>> {
  const newId = Math.max(...userStore.map((u) => u.id)) + 1
  const newUser: UserItem = {
    id: data.id || newId,
    username: data.username || '',
    relatedUsername: data.relatedUsername || '',
    nickname: data.nickname || '',
    company: data.company || 'A公司',
    role: data.role || '',
    status: data.status || 'active',
    operator: data.operator || 'admin',
    lastLoginTime: data.lastLoginTime || '',
    operateTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
  }
  userStore.push(newUser)
  return mockResponse(newUser, '添加成功')
}

export function updateUser(id: number, data: Partial<UserItem>): Promise<Result<UserItem>> {
  const idx = userStore.findIndex((u) => u.id === id)
  if (idx >= 0) {
    userStore[idx] = { ...userStore[idx], ...data, id }
    return mockResponse(userStore[idx], '更新成功')
  }
  return mockResponse({} as UserItem, '未找到该用户')
}

export function toggleUserStatus(id: number, status: 'active' | 'inactive'): Promise<Result<UserItem>> {
  const idx = userStore.findIndex((u) => u.id === id)
  if (idx >= 0) {
    userStore[idx] = { ...userStore[idx], status }
    return mockResponse(userStore[idx], status === 'active' ? '已启用' : '已停用')
  }
  return mockResponse({} as UserItem, '未找到该用户')
}
