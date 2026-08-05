import type { Result } from '@/http'
import { mockResponse } from '@/mock'

export interface RoleItem {
  id: string
  name: string
  operator: string
  operateTime: string
  status: 'enabled' | 'disabled'
  remark?: string
  permissions?: string[]
}

export const mockRoleList: RoleItem[] = [
  { id: 'ERP-ADMIN-SUPER-001', name: '超级管理员', operator: '超级管理员', operateTime: '2026-01-29 14:10', status: 'enabled', remark: '系统最高权限' },
  { id: 'ERP-ADMIN-PLATFORM-001', name: '平台管理员', operator: '平台管理员', operateTime: '2026-01-30 16:25', status: 'disabled' },
  { id: 'ERP-PURCHASE-MANAGER-001', name: '采购经理', operator: '采购经理', operateTime: '2026-08-12 16:12', status: 'disabled' },
  { id: 'ERP-PURCHASE-STAFF-001', name: '采购专员', operator: '采购专员', operateTime: '2026-03-15 10:30', status: 'enabled' },
  { id: 'ERP-WAREHOUSE-KEEPER-001', name: '仓库管理员', operator: '仓库管理员', operateTime: '2026-04-20 09:15', status: 'disabled' },
  { id: 'ERP-FINANCE-ACCOUNTANT-001', name: '财务', operator: '财务', operateTime: '2026-03-05 13:40', status: 'disabled' },
  { id: 'ERP-SALE-DIRECTOR-001', name: '部门经理', operator: '部门经理', operateTime: '2026-11-18 10:10', status: 'enabled' },
  { id: 'ERP-SALE-MANAGER-001', name: '销售总监', operator: '销售总监', operateTime: '2026-07-25 17:00', status: 'disabled' },
  { id: 'ERP-SUPPORT-ENGINEER-001', name: '技术支持工程师', operator: '测试人员', operateTime: '2026-01-12 09:50', status: 'enabled' },
  { id: 'ERP-PRODUCT-MANAGER-001', name: '产品经理', operator: '超级管理员', operateTime: '2020-06-15 15:20', status: 'disabled' },
]

let roleStore: RoleItem[] = JSON.parse(JSON.stringify(mockRoleList))

export function getRolePage(params: { page: number; pageSize: number; keyword?: string }): Promise<Result<{ list: RoleItem[]; total: number }>> {
  const filtered = params.keyword
    ? roleStore.filter(
        (r) =>
          r.name.includes(params.keyword!) ||
          r.id.includes(params.keyword!)
      )
    : roleStore
  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  const list = filtered.slice(start, start + params.pageSize)
  return mockResponse({ list, total })
}

export function addRole(data: Omit<RoleItem, 'id'> & { id?: string }): Promise<Result<RoleItem>> {
  const newRole: RoleItem = {
    id: data.id || String(Date.now()),
    name: data.name,
    operator: data.operator || 'admin',
    operateTime: data.operateTime || new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    status: data.status || 'enabled',
    remark: data.remark || '',
  }
  roleStore.push(newRole)
  return mockResponse(newRole, '添加成功')
}

export function updateRole(id: string, data: Partial<RoleItem>): Promise<Result<RoleItem>> {
  const idx = roleStore.findIndex((r) => r.id === id)
  if (idx >= 0) {
    roleStore[idx] = { ...roleStore[idx], ...data, id }
    return mockResponse(roleStore[idx], '更新成功')
  }
  return mockResponse({} as RoleItem, '未找到该角色')
}

export function deleteRole(id: string): Promise<Result<null>> {
  roleStore = roleStore.filter((r) => r.id !== id)
  return mockResponse(null, '删除成功')
}

export function toggleRoleStatus(id: string, status: 'enabled' | 'disabled'): Promise<Result<RoleItem>> {
  const idx = roleStore.findIndex((r) => r.id === id)
  if (idx >= 0) {
    roleStore[idx] = { ...roleStore[idx], status }
    return mockResponse(roleStore[idx], status === 'enabled' ? '已启用' : '已停用')
  }
  return mockResponse({} as RoleItem, '未找到该角色')
}