// src/mock/approvalTemplate.ts
// 审批模板管理 Mock 数据层（全部脱敏虚构）
import type { Result } from '@/http'
import { mockResponse } from '@/mock'

// ======== 枚举与类型 ========

/** 模板适用分类（与整体审批体系分类保持一致） */
export type TemplateCategory =
  | 'sale_order'
  | 'purchase_order'
  | 'expense'
  | 'goods_payment'
  | 'purchase_contract'
  | 'refund'
  | 'salary'

/** 模板启用状态 */
export type TemplateStatus = 'enabled' | 'disabled'

/** 审批步骤（配置项） */
export interface TemplateStep {
  seq: number
  approverRole: string      // 审批角色，如"部门经理"、"财务主管"、"总经理"
  approverName: string      // 默认审批人（脱敏虚构）
  allowSkip: boolean        // 是否允许跳过（当对应审批人请假时）
  description?: string      // 步骤说明
}

/** 金额阈值区间 */
export interface AmountRange {
  min: number
  max: number
}

/** 审批模板实体 */
export interface ApprovalTemplate {
  id: string
  code: string              // 模板编号，如 TPL-0001
  name: string              // 模板名称
  category: TemplateCategory
  applicableRoles: string[] // 适用角色（发起人角色）
  amountRange: AmountRange  // 生效金额区间
  steps: TemplateStep[]
  status: TemplateStatus
  creator: string
  createTime: string
  updateTime: string
  description?: string      // 模板备注说明
}

export interface TemplatePageParams {
  page: number
  pageSize: number
  category?: TemplateCategory | ''
  status?: TemplateStatus | ''
  keyword?: string          // 匹配 code / name / description
}

// ======== 常量映射 ========

export const templateCategoryOptions: { label: string; value: TemplateCategory }[] = [
  { label: '销售订单', value: 'sale_order' },
  { label: '采购订单', value: 'purchase_order' },
  { label: '费用报销', value: 'expense' },
  { label: '货款支付', value: 'goods_payment' },
  { label: '采购合同', value: 'purchase_contract' },
  { label: '退款申请', value: 'refund' },
  { label: '工资发放', value: 'salary' },
]

export const templateStatusOptions: { label: string; value: TemplateStatus }[] = [
  { label: '启用', value: 'enabled' },
  { label: '禁用', value: 'disabled' },
]

/** 通用角色选项（脱敏虚拟） */
export const commonRoleOptions = [
  { label: '销售员', value: '销售员' },
  { label: '采购专员', value: '采购专员' },
  { label: '行政助理', value: '行政助理' },
  { label: '财务会计', value: '财务会计' },
  { label: '部门主管', value: '部门主管' },
  { label: '财务总监', value: '财务总监' },
  { label: '副总经理', value: '副总经理' },
  { label: '总经理', value: '总经理' },
]

/** 默认审批人池（脱敏虚构） */
export const approverPool = [
  { role: '部门主管', name: 'C用户' },
  { role: '财务会计', name: '主理人' },
  { role: '财务总监', name: 'A用户' },
  { role: '副总经理', name: 'B用户' },
  { role: '总经理', name: '示例总经理（演示数据）' },
]

export function getCategoryLabel(v: TemplateCategory | ''): string {
  return templateCategoryOptions.find((o) => o.value === v)?.label || '-'
}
export function getStatusLabel(v: TemplateStatus | ''): string {
  return templateStatusOptions.find((o) => o.value === v)?.label || '-'
}
export const statusTagTypeMap: Record<TemplateStatus, 'success' | 'info'> = {
  enabled: 'success',   // 启用=绿
  disabled: 'info',     // 禁用=灰
}

// ======== 初始化脱敏数据 ========

const pad0 = (n: number) => (n < 10 ? `0${n}` : `${n}`)
const ts = (y: number, m: number, d: number, h = 10, mi = 0, s = 0) =>
  `${y}-${pad0(m)}-${pad0(d)} ${pad0(h)}:${pad0(mi)}:${pad0(s)}`

function buildSteps(stepDefs: { role: string; allowSkip?: boolean }[]): TemplateStep[] {
  return stepDefs.map((d, i) => {
    const pool = approverPool.find((a) => a.role === d.role)
    return {
      seq: i + 1,
      approverRole: d.role,
      approverName: pool?.name || '示例审批人（演示数据）',
      allowSkip: d.allowSkip ?? false,
    }
  })
}

const INIT: Omit<ApprovalTemplate, 'id'>[] = [
  {
    code: 'TPL-0001',
    name: '小额费用报销标准流程（演示模板·演示数据）',
    category: 'expense',
    applicableRoles: ['销售员', '采购专员', '行政助理'],
    amountRange: { min: 0, max: 5000 },
    steps: buildSteps([{ role: '部门主管' }, { role: '财务会计' }]),
    status: 'enabled',
    creator: '超级管理员',
    createTime: ts(2024, 6, 12),
    updateTime: ts(2025, 1, 8),
    description: '单次报销金额在 5000 元以下使用，无需总经理审批。（演示数据）',
  },
  {
    code: 'TPL-0002',
    name: '大额费用报销三级审批流程-虚拟（演示数据）',
    category: 'expense',
    applicableRoles: ['*'],
    amountRange: { min: 5000, max: 99999999 },
    steps: buildSteps([{ role: '部门主管' }, { role: '财务会计' }, { role: '财务总监' }, { role: '总经理', allowSkip: true }]),
    status: 'enabled',
    creator: '超级管理员',
    createTime: ts(2024, 6, 14),
    updateTime: ts(2025, 2, 20),
    description: '单次报销 5000 元以上必须走总经理终审。（演示数据）',
  },
  {
    code: 'TPL-0003',
    name: '销售订单常规模板-示例（演示数据）',
    category: 'sale_order',
    applicableRoles: ['销售员'],
    amountRange: { min: 0, max: 200000 },
    steps: buildSteps([{ role: '部门主管' }, { role: '财务总监' }]),
    status: 'enabled',
    creator: 'C用户',
    createTime: ts(2024, 8, 1),
    updateTime: ts(2025, 3, 15),
    description: '适用 20 万以内普通内销合同（非工程类）。（演示数据）',
  },
  {
    code: 'TPL-0004',
    name: '采购订单流程模板（标准）（演示数据）',
    category: 'purchase_order',
    applicableRoles: ['采购专员'],
    amountRange: { min: 0, max: 500000 },
    steps: buildSteps([{ role: '部门主管' }, { role: '财务会计' }, { role: '副总经理' }]),
    status: 'enabled',
    creator: 'A用户',
    createTime: ts(2024, 9, 18),
    updateTime: ts(2024, 12, 22),
    description: '常规采购订单三级审批配置。（演示数据）',
  },
  {
    code: 'TPL-0005',
    name: '采购合同评审模板-演示（历史）（演示数据）',
    category: 'purchase_contract',
    applicableRoles: ['采购专员', '部门主管'],
    amountRange: { min: 100000, max: 99999999 },
    steps: buildSteps([{ role: '财务总监' }, { role: '副总经理' }, { role: '总经理' }]),
    status: 'disabled',
    creator: 'B用户',
    createTime: ts(2023, 11, 5),
    updateTime: ts(2024, 10, 9),
    description: '已被 TPL-0006 取代，本模板停用（演示示例）。（演示数据）',
  },
  {
    code: 'TPL-0006',
    name: '采购合同评审模板-V2新版-虚拟（演示数据）',
    category: 'purchase_contract',
    applicableRoles: ['采购专员', '部门主管'],
    amountRange: { min: 0, max: 99999999 },
    steps: buildSteps([{ role: '部门主管', allowSkip: true }, { role: '财务总监' }, { role: '总经理' }]),
    status: 'enabled',
    creator: 'B用户',
    createTime: ts(2024, 10, 10),
    updateTime: ts(2025, 5, 6),
    description: '新增法务预审环节（在部门主管后），兼容零金额框架合同。（演示数据）',
  },
]

let store: ApprovalTemplate[] = INIT.map((r, i) => ({ id: `TPL_${Date.now()}_${i}`, ...r }))

// ======== 接口实现 ========

function keywordMatch(item: ApprovalTemplate, kw: string): boolean {
  if (!kw) return true
  const k = kw.toLowerCase()
  const hay = [item.code, item.name, item.description, item.creator, ...item.applicableRoles]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return hay.includes(k)
}

export async function getApprovalTemplatePage(params: TemplatePageParams): Promise<Result<{ list: ApprovalTemplate[]; total: number }>> {
  let list = [...store]
  if (params.category) list = list.filter((x) => x.category === params.category)
  if (params.status) list = list.filter((x) => x.status === params.status)
  if (params.keyword) list = list.filter((x) => keywordMatch(x, params.keyword))
  // 按创建时间倒序
  list.sort((a, b) => b.createTime.localeCompare(a.createTime))
  const total = list.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({
    list: list.slice(start, start + params.pageSize),
    total,
  })
}

export async function getApprovalTemplateById(id: string): Promise<Result<ApprovalTemplate>> {
  const item = store.find((x) => x.id === id)
  return mockResponse(item || ({} as ApprovalTemplate))
}

export async function createApprovalTemplate(payload: Partial<ApprovalTemplate> & Pick<ApprovalTemplate, 'name' | 'category' | 'steps'>): Promise<Result<ApprovalTemplate>> {
  const nowStr = ts(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate(), new Date().getHours(), new Date().getMinutes(), new Date().getSeconds())
  const nextNum = store.length + 1
  const code = payload.code || `TPL-${String(nextNum).padStart(4, '0')}`
  const newItem: ApprovalTemplate = {
    id: `TPL_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    code,
    name: payload.name,
    category: payload.category,
    applicableRoles: payload.applicableRoles?.length ? payload.applicableRoles : ['*'],
    amountRange: payload.amountRange || { min: 0, max: 99999999 },
    steps: JSON.parse(JSON.stringify(payload.steps)),
    status: payload.status || 'enabled',
    creator: payload.creator || '超级管理员',
    createTime: nowStr,
    updateTime: nowStr,
    description: payload.description,
  }
  store.unshift(newItem)
  return mockResponse(newItem)
}

export async function updateApprovalTemplate(id: string, payload: Partial<ApprovalTemplate>): Promise<Result<ApprovalTemplate>> {
  const idx = store.findIndex((x) => x.id === id)
  if (idx === -1) return mockResponse({} as ApprovalTemplate)
  const nowStr = ts(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate(), new Date().getHours(), new Date().getMinutes(), new Date().getSeconds())
  store[idx] = { ...store[idx], ...payload, updateTime: nowStr }
  return mockResponse(store[idx])
}

/** 启用/禁用切换 */
export async function switchApprovalTemplateStatus(id: string, status: TemplateStatus): Promise<Result<ApprovalTemplate>> {
  return updateApprovalTemplate(id, { status })
}

export async function deleteApprovalTemplate(id: string): Promise<Result<boolean>> {
  const idx = store.findIndex((x) => x.id === id)
  if (idx === -1) return mockResponse(false)
  store.splice(idx, 1)
  return mockResponse(true)
}
