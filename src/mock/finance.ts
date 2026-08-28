// src/mock/finance.ts
// 财务管理 Mock 数据层（全部脱敏虚构，公司名均带"示例"标注）
import type { Result } from '@/http'
import { mockResponse } from '@/mock'

// ======== 通用 ========

/** 标签类型（仅允许这五种） */
export type TagType = 'primary' | 'success' | 'warning' | 'danger' | 'info'

function pad0(n: number): string { return n < 10 ? `0${n}` : `${n}` }
function pad4(n: number): string { return String(n).padStart(4, '0') }
function today(): string {
  const n = new Date()
  return `${n.getFullYear()}-${pad0(n.getMonth() + 1)}-${pad0(n.getDate())}`
}
function randId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`
}

/** 字符串单号降序（同前缀同宽度） */
function codeStrDesc(a: string, b: string): number {
  return a < b ? 1 : a > b ? -1 : 0
}

// ======== 启用/停用（基础资料通用） ========

export type EnableStatus = 'enabled' | 'disabled'
export const enableStatusOptions: { label: string; value: EnableStatus }[] = [
  { label: '启用', value: 'enabled' },
  { label: '停用', value: 'disabled' },
]
export const enableStatusLabelMap: Record<EnableStatus, string> = {
  enabled: '启用',
  disabled: '停用',
}
export const enableStatusTagTypeMap: Record<EnableStatus, TagType> = {
  enabled: 'success',
  disabled: 'info',
}

// ============================================================
// 1. 费用类型 ExpenseType
// ============================================================

export interface ExpenseTypeItem {
  id: string
  code: number
  name: string
  status: EnableStatus
  remark?: string
  createTime: string
}

const EXPENSE_TYPE_INIT: Omit<ExpenseTypeItem, 'id'>[] = [
  { code: 8, name: '办公费用', status: 'enabled', remark: '办公用品采购等日常开支', createTime: '2026-01-05' },
  { code: 7, name: '差旅费用', status: 'enabled', remark: '交通、住宿及出差补贴', createTime: '2026-01-05' },
  { code: 6, name: '业务招待费', status: 'enabled', remark: '客户接待相关支出', createTime: '2026-01-06' },
  { code: 5, name: '培训费', status: 'enabled', remark: '员工培训与外部课程', createTime: '2026-01-08' },
  { code: 4, name: '水电物业费', status: 'enabled', remark: '', createTime: '2026-01-10' },
  { code: 3, name: '广告宣传费', status: 'enabled', remark: '线上推广与物料制作', createTime: '2026-01-12' },
  { code: 2, name: '通讯费', status: 'disabled', remark: '已并入办公费用管理', createTime: '2026-01-15' },
  { code: 1, name: '其他费用', status: 'enabled', remark: '未归类杂项支出', createTime: '2026-01-18' },
]

let _expenseTypeCodeSeq = 9
const expenseTypeStore: ExpenseTypeItem[] = EXPENSE_TYPE_INIT.map((r, i) => ({
  ...r,
  id: `FT_${Date.now()}_${i + 1}`,
}))

export interface ExpenseTypePageParams {
  page: number
  pageSize: number
  status?: EnableStatus
  keyword?: string
}

export async function getExpenseTypePage(params: ExpenseTypePageParams): Promise<Result<{ list: ExpenseTypeItem[]; total: number }>> {
  let rows = [...expenseTypeStore]
  if (params.status) rows = rows.filter((r) => r.status === params.status)
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    rows = rows.filter((r) => r.name.toLowerCase().includes(kw) || (r.remark || '').toLowerCase().includes(kw))
  }
  rows.sort((a, b) => b.code - a.code)
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: rows.slice(start, start + params.pageSize), total })
}

export async function getExpenseTypeById(id: string): Promise<Result<ExpenseTypeItem>> {
  const item = expenseTypeStore.find((r) => r.id === id)
  return mockResponse(item || ({} as ExpenseTypeItem))
}

export async function createExpenseType(payload: Pick<ExpenseTypeItem, 'name' | 'status'> & Partial<ExpenseTypeItem>): Promise<Result<ExpenseTypeItem>> {
  const newItem: ExpenseTypeItem = {
    id: randId('FT'),
    code: _expenseTypeCodeSeq++,
    name: payload.name,
    status: payload.status || 'enabled',
    remark: payload.remark,
    createTime: payload.createTime || today(),
  }
  expenseTypeStore.unshift(newItem)
  return mockResponse(newItem)
}

export async function updateExpenseType(id: string, payload: Partial<ExpenseTypeItem>): Promise<Result<ExpenseTypeItem>> {
  const idx = expenseTypeStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as ExpenseTypeItem)
  expenseTypeStore[idx] = { ...expenseTypeStore[idx], ...payload }
  return mockResponse(expenseTypeStore[idx])
}

export async function deleteExpenseType(id: string): Promise<Result<boolean>> {
  const idx = expenseTypeStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  expenseTypeStore.splice(idx, 1)
  return mockResponse(true)
}

/** 启用中的费用类型名称选项（供费用管理选择） */
export function getExpenseTypeNameOptions(): { label: string; value: string }[] {
  return expenseTypeStore
    .filter((t) => t.status === 'enabled')
    .map((t) => ({ label: t.name, value: t.name }))
}

// ============================================================
// 2. 账户 Account
// ============================================================

export type AccountType = 'cash' | 'bank' | 'alipay' | 'wechat'
export const accountTypeOptions: { label: string; value: AccountType }[] = [
  { label: '现金', value: 'cash' },
  { label: '银行', value: 'bank' },
  { label: '支付宝', value: 'alipay' },
  { label: '微信', value: 'wechat' },
]
export const accountTypeLabelMap: Record<AccountType, string> = {
  cash: '现金',
  bank: '银行',
  alipay: '支付宝',
  wechat: '微信',
}
export const accountTypeTagTypeMap: Record<AccountType, TagType> = {
  cash: 'warning',
  bank: 'primary',
  alipay: 'info',
  wechat: 'success',
}

export type Currency = 'CNY' | 'USD'
export const currencyOptions: { label: string; value: Currency }[] = [
  { label: '人民币', value: 'CNY' },
  { label: '美元', value: 'USD' },
]
export const currencyLabelMap: Record<Currency, string> = {
  CNY: '人民币',
  USD: '美元',
}

export interface AccountItem {
  id: string
  code: number
  name: string
  type: AccountType
  currency: Currency
  balance: number
  status: EnableStatus
  remark?: string
  createTime: string
}

const ACCOUNT_INIT: Omit<AccountItem, 'id'>[] = [
  { code: 6, name: '示例科技-基本户(工商银行)', type: 'bank', currency: 'CNY', balance: 1286500.0, status: 'enabled', remark: '主要收付款账户', createTime: '2026-01-05' },
  { code: 5, name: '示例科技公司-现金账户', type: 'cash', currency: 'CNY', balance: 52800.5, status: 'enabled', remark: '日常零星支出备用金', createTime: '2026-01-06' },
  { code: 4, name: '示例贸易-招行一般户', type: 'bank', currency: 'CNY', balance: 356800.75, status: 'enabled', remark: '', createTime: '2026-01-08' },
  { code: 3, name: '示例企业支付宝账户', type: 'alipay', currency: 'CNY', balance: 86520.4, status: 'enabled', remark: '线上商城收款', createTime: '2026-01-10' },
  { code: 2, name: '示例企业微信商户号', type: 'wechat', currency: 'CNY', balance: 42310.9, status: 'enabled', remark: '', createTime: '2026-01-12' },
  { code: 1, name: '示例科技-美元账户', type: 'bank', currency: 'USD', balance: 15800, status: 'disabled', remark: '示例外币账户（演示数据）', createTime: '2026-01-15' },
]

let _accountCodeSeq = 7
const accountStore: AccountItem[] = ACCOUNT_INIT.map((r, i) => ({
  ...r,
  id: `ACC_${Date.now()}_${i + 1}`,
}))

export interface AccountPageParams {
  page: number
  pageSize: number
  type?: AccountType
  status?: EnableStatus
  keyword?: string
}

export async function getAccountPage(params: AccountPageParams): Promise<Result<{ list: AccountItem[]; total: number }>> {
  let rows = [...accountStore]
  if (params.type) rows = rows.filter((r) => r.type === params.type)
  if (params.status) rows = rows.filter((r) => r.status === params.status)
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    rows = rows.filter((r) => r.name.toLowerCase().includes(kw) || (r.remark || '').toLowerCase().includes(kw))
  }
  rows.sort((a, b) => b.code - a.code)
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: rows.slice(start, start + params.pageSize), total })
}

export async function getAccountById(id: string): Promise<Result<AccountItem>> {
  const item = accountStore.find((r) => r.id === id)
  return mockResponse(item || ({} as AccountItem))
}

export async function createAccount(payload: Pick<AccountItem, 'name' | 'type' | 'currency'> & Partial<AccountItem>): Promise<Result<AccountItem>> {
  const newItem: AccountItem = {
    id: randId('ACC'),
    code: _accountCodeSeq++,
    name: payload.name,
    type: payload.type,
    currency: payload.currency || 'CNY',
    balance: 0,
    status: payload.status || 'enabled',
    remark: payload.remark,
    createTime: payload.createTime || today(),
  }
  accountStore.unshift(newItem)
  return mockResponse(newItem)
}

export async function updateAccount(id: string, payload: Partial<AccountItem>): Promise<Result<AccountItem>> {
  const idx = accountStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as AccountItem)
  // 余额不允许通过编辑修改，只能由流水/收付款驱动
  const { balance: _balance, ...rest } = payload
  accountStore[idx] = { ...accountStore[idx], ...rest }
  return mockResponse(accountStore[idx])
}

export async function deleteAccount(id: string): Promise<Result<boolean>> {
  const idx = accountStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  accountStore.splice(idx, 1)
  return mockResponse(true)
}

/** 启用中的账户名称选项（供费用/收入等选择） */
export function getAccountNameOptions(): { label: string; value: string }[] {
  return accountStore
    .filter((a) => a.status === 'enabled')
    .map((a) => ({ label: a.name, value: a.name }))
}

// ============================================================
// 3. 费用 Expense
// ============================================================

export type ExpenseStatus = 'pending' | 'audited' | 'rejected'
export const expenseStatusOptions: { label: string; value: ExpenseStatus }[] = [
  { label: '待审核', value: 'pending' },
  { label: '已审核', value: 'audited' },
  { label: '已驳回', value: 'rejected' },
]
export const expenseStatusLabelMap: Record<ExpenseStatus, string> = {
  pending: '待审核',
  audited: '已审核',
  rejected: '已驳回',
}
export const expenseStatusTagTypeMap: Record<ExpenseStatus, TagType> = {
  pending: 'warning',
  audited: 'success',
  rejected: 'danger',
}

export interface ExpenseItem {
  id: string
  code: string
  typeName: string
  amount: number
  accountName: string
  expenseDate: string
  applicant: string
  status: ExpenseStatus
  remark?: string
}

const EXPENSE_INIT: Omit<ExpenseItem, 'id'>[] = [
  { code: 'FY0008', typeName: '差旅费用', amount: 3860, accountName: '示例科技-基本户(工商银行)', expenseDate: '2026-08-26', applicant: '小北', status: 'pending', remark: '示例出差北京差旅报销（演示数据）' },
  { code: 'FY0007', typeName: '广告宣传费', amount: 9800, accountName: '示例企业支付宝账户', expenseDate: '2026-08-22', applicant: '超级管理员', status: 'pending', remark: '示例线上推广费用（演示数据）' },
  { code: 'FY0006', typeName: '办公费用', amount: 1268.5, accountName: '示例科技公司-现金账户', expenseDate: '2026-08-20', applicant: '小白', status: 'audited', remark: '' },
  { code: 'FY0005', typeName: '业务招待费', amount: 2350, accountName: '示例科技-基本户(工商银行)', expenseDate: '2026-08-18', applicant: '小戴', status: 'rejected', remark: '示例客户接待餐费（演示数据）' },
  { code: 'FY0004', typeName: '培训费', amount: 4800, accountName: '示例科技-基本户(工商银行)', expenseDate: '2026-08-15', applicant: '小陈', status: 'audited', remark: '' },
  { code: 'FY0003', typeName: '水电物业费', amount: 3215.8, accountName: '示例科技-基本户(工商银行)', expenseDate: '2026-08-10', applicant: '超级管理员', status: 'audited', remark: '' },
  { code: 'FY0002', typeName: '差旅费用', amount: 1560.5, accountName: '示例科技公司-现金账户', expenseDate: '2026-08-06', applicant: '小林', status: 'audited', remark: '' },
  { code: 'FY0001', typeName: '办公费用', amount: 320, accountName: '示例企业微信商户号', expenseDate: '2026-08-02', applicant: '小周', status: 'rejected', remark: '示例办公用品补购（演示数据）' },
]

let _expenseCodeSeq = 9
const expenseStore: ExpenseItem[] = EXPENSE_INIT.map((r, i) => ({
  ...r,
  id: `EXP_${Date.now()}_${i + 1}`,
}))

export interface ExpensePageParams {
  page: number
  pageSize: number
  status?: ExpenseStatus
  typeName?: string
  dateStart?: string
  dateEnd?: string
  keyword?: string
}

export async function getExpensePage(params: ExpensePageParams): Promise<Result<{ list: ExpenseItem[]; total: number }>> {
  let rows = [...expenseStore]
  if (params.status) rows = rows.filter((r) => r.status === params.status)
  if (params.typeName) rows = rows.filter((r) => r.typeName === params.typeName)
  if (params.dateStart) rows = rows.filter((r) => r.expenseDate >= params.dateStart!)
  if (params.dateEnd) rows = rows.filter((r) => r.expenseDate <= params.dateEnd!)
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    rows = rows.filter((r) =>
      r.code.toLowerCase().includes(kw) ||
      r.applicant.toLowerCase().includes(kw) ||
      r.accountName.toLowerCase().includes(kw) ||
      (r.remark || '').toLowerCase().includes(kw)
    )
  }
  rows.sort((a, b) => codeStrDesc(a.code, b.code))
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: rows.slice(start, start + params.pageSize), total })
}

export async function getExpenseById(id: string): Promise<Result<ExpenseItem>> {
  const item = expenseStore.find((r) => r.id === id)
  return mockResponse(item || ({} as ExpenseItem))
}

export async function createExpense(payload: Omit<ExpenseItem, 'id' | 'code' | 'status'>): Promise<Result<ExpenseItem>> {
  const newItem: ExpenseItem = {
    id: randId('EXP'),
    code: `FY${pad4(_expenseCodeSeq++)}`,
    typeName: payload.typeName,
    amount: payload.amount,
    accountName: payload.accountName,
    expenseDate: payload.expenseDate,
    applicant: payload.applicant || '超级管理员',
    status: 'pending',
    remark: payload.remark,
  }
  expenseStore.unshift(newItem)
  return mockResponse(newItem)
}

export async function updateExpense(id: string, payload: Partial<ExpenseItem>): Promise<Result<ExpenseItem>> {
  const idx = expenseStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as ExpenseItem)
  expenseStore[idx] = { ...expenseStore[idx], ...payload }
  return mockResponse(expenseStore[idx])
}

/** 删除（仅待审核可删，由页面控制入口） */
export async function deleteExpense(id: string): Promise<Result<boolean>> {
  const idx = expenseStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  expenseStore.splice(idx, 1)
  return mockResponse(true)
}

/** 费用审核（仅待审核状态可审核） */
export async function auditExpense(id: string, status: 'audited' | 'rejected'): Promise<Result<ExpenseItem>> {
  const item = expenseStore.find((r) => r.id === id)
  if (!item || item.status !== 'pending') return mockResponse(item || ({} as ExpenseItem))
  item.status = status
  return mockResponse(item)
}

// ============================================================
// 4. 收入 Income
// ============================================================

export type IncomeStatus = 'pending' | 'confirmed'
export const incomeStatusOptions: { label: string; value: IncomeStatus }[] = [
  { label: '待确认', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
]
export const incomeStatusLabelMap: Record<IncomeStatus, string> = {
  pending: '待确认',
  confirmed: '已确认',
}
export const incomeStatusTagTypeMap: Record<IncomeStatus, TagType> = {
  pending: 'warning',
  confirmed: 'success',
}

export interface IncomeItem {
  id: string
  code: string
  source: string
  amount: number
  accountName: string
  incomeDate: string
  handler: string
  status: IncomeStatus
  remark?: string
}

const INCOME_INIT: Omit<IncomeItem, 'id'>[] = [
  { code: 'SR0006', source: '示例商城订单回款', amount: 56800, accountName: '示例科技-基本户(工商银行)', incomeDate: '2026-08-25', handler: '小北', status: 'pending', remark: '示例8月线上商城回款（演示数据）' },
  { code: 'SR0005', source: '服务费收入-示例项目', amount: 32000, accountName: '示例科技-基本户(工商银行)', incomeDate: '2026-08-20', handler: '超级管理员', status: 'confirmed', remark: '' },
  { code: 'SR0004', source: '示例门店加盟费', amount: 15000, accountName: '示例企业支付宝账户', incomeDate: '2026-08-16', handler: '小白', status: 'confirmed', remark: '' },
  { code: 'SR0003', source: '样机销售回款-示例客户', amount: 8600, accountName: '示例企业微信商户号', incomeDate: '2026-08-12', handler: '小戴', status: 'pending', remark: '' },
  { code: 'SR0002', source: '利息收入', amount: 1240.5, accountName: '示例科技-基本户(工商银行)', incomeDate: '2026-08-05', handler: '超级管理员', status: 'confirmed', remark: '' },
  { code: 'SR0001', source: '其他收入-废品处置', amount: 380, accountName: '示例科技公司-现金账户', incomeDate: '2026-08-01', handler: '小陈', status: 'confirmed', remark: '' },
]

let _incomeCodeSeq = 7
const incomeStore: IncomeItem[] = INCOME_INIT.map((r, i) => ({
  ...r,
  id: `INC_${Date.now()}_${i + 1}`,
}))

export interface IncomePageParams {
  page: number
  pageSize: number
  status?: IncomeStatus
  accountName?: string
  dateStart?: string
  dateEnd?: string
  keyword?: string
}

export async function getIncomePage(params: IncomePageParams): Promise<Result<{ list: IncomeItem[]; total: number }>> {
  let rows = [...incomeStore]
  if (params.status) rows = rows.filter((r) => r.status === params.status)
  if (params.accountName) rows = rows.filter((r) => r.accountName === params.accountName)
  if (params.dateStart) rows = rows.filter((r) => r.incomeDate >= params.dateStart!)
  if (params.dateEnd) rows = rows.filter((r) => r.incomeDate <= params.dateEnd!)
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    rows = rows.filter((r) =>
      r.code.toLowerCase().includes(kw) ||
      r.source.toLowerCase().includes(kw) ||
      r.handler.toLowerCase().includes(kw) ||
      (r.remark || '').toLowerCase().includes(kw)
    )
  }
  rows.sort((a, b) => codeStrDesc(a.code, b.code))
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: rows.slice(start, start + params.pageSize), total })
}

export async function getIncomeById(id: string): Promise<Result<IncomeItem>> {
  const item = incomeStore.find((r) => r.id === id)
  return mockResponse(item || ({} as IncomeItem))
}

export async function createIncome(payload: Omit<IncomeItem, 'id' | 'code' | 'status'>): Promise<Result<IncomeItem>> {
  const newItem: IncomeItem = {
    id: randId('INC'),
    code: `SR${pad4(_incomeCodeSeq++)}`,
    source: payload.source,
    amount: payload.amount,
    accountName: payload.accountName,
    incomeDate: payload.incomeDate,
    handler: payload.handler || '超级管理员',
    status: 'pending',
    remark: payload.remark,
  }
  incomeStore.unshift(newItem)
  return mockResponse(newItem)
}

export async function updateIncome(id: string, payload: Partial<IncomeItem>): Promise<Result<IncomeItem>> {
  const idx = incomeStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as IncomeItem)
  incomeStore[idx] = { ...incomeStore[idx], ...payload }
  return mockResponse(incomeStore[idx])
}

export async function deleteIncome(id: string): Promise<Result<boolean>> {
  const idx = incomeStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  incomeStore.splice(idx, 1)
  return mockResponse(true)
}

/** 收入确认（仅待确认状态可确认） */
export async function confirmIncome(id: string): Promise<Result<IncomeItem>> {
  const item = incomeStore.find((r) => r.id === id)
  if (!item || item.status !== 'pending') return mockResponse(item || ({} as IncomeItem))
  item.status = 'confirmed'
  return mockResponse(item)
}

// ============================================================
// 5. 退款 Refund
// ============================================================

export type RefundStatus = 'pending' | 'refunded' | 'rejected'
export const refundStatusOptions: { label: string; value: RefundStatus }[] = [
  { label: '待审核', value: 'pending' },
  { label: '已退款', value: 'refunded' },
  { label: '已驳回', value: 'rejected' },
]
export const refundStatusLabelMap: Record<RefundStatus, string> = {
  pending: '待审核',
  refunded: '已退款',
  rejected: '已驳回',
}
export const refundStatusTagTypeMap: Record<RefundStatus, TagType> = {
  pending: 'warning',
  refunded: 'success',
  rejected: 'danger',
}

export interface RefundItem {
  id: string
  code: string
  customerName: string
  orderNo: string
  amount: number
  reason: string
  refundDate: string
  status: RefundStatus
  remark?: string
}

const REFUND_INIT: Omit<RefundItem, 'id'>[] = [
  { code: 'TK0006', customerName: '示例电商旗舰店', orderNo: 'SO20260825', amount: 2360, reason: '商品发错规格', refundDate: '2026-08-26', status: 'pending', remark: '示例退款申请（演示数据）' },
  { code: 'TK0005', customerName: '示例商贸有限公司', orderNo: 'SO20260819', amount: 12800, reason: '质量问题退货', refundDate: '2026-08-22', status: 'pending', remark: '' },
  { code: 'TK0004', customerName: '示例百货商行', orderNo: 'SO20260815', amount: 860, reason: '多余库存协商退货', refundDate: '2026-08-18', status: 'refunded', remark: '' },
  { code: 'TK0003', customerName: '示例贸易公司', orderNo: 'SO20260811', amount: 4500, reason: '部分货物破损', refundDate: '2026-08-14', status: 'rejected', remark: '示例：证据不足暂驳回（演示数据）' },
  { code: 'TK0002', customerName: '示例电商旗舰店', orderNo: 'SO20260806', amount: 1299, reason: '七天无理由退货', refundDate: '2026-08-08', status: 'refunded', remark: '' },
  { code: 'TK0001', customerName: '示例超市连锁', orderNo: 'SO20260802', amount: 3200, reason: '运输损坏', refundDate: '2026-08-04', status: 'refunded', remark: '' },
]

let _refundCodeSeq = 7
const refundStore: RefundItem[] = REFUND_INIT.map((r, i) => ({
  ...r,
  id: `REF_${Date.now()}_${i + 1}`,
}))

export interface RefundPageParams {
  page: number
  pageSize: number
  status?: RefundStatus
  dateStart?: string
  dateEnd?: string
  keyword?: string
}

export async function getRefundPage(params: RefundPageParams): Promise<Result<{ list: RefundItem[]; total: number }>> {
  let rows = [...refundStore]
  if (params.status) rows = rows.filter((r) => r.status === params.status)
  if (params.dateStart) rows = rows.filter((r) => r.refundDate >= params.dateStart!)
  if (params.dateEnd) rows = rows.filter((r) => r.refundDate <= params.dateEnd!)
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    rows = rows.filter((r) =>
      r.code.toLowerCase().includes(kw) ||
      r.customerName.toLowerCase().includes(kw) ||
      r.orderNo.toLowerCase().includes(kw) ||
      r.reason.toLowerCase().includes(kw) ||
      (r.remark || '').toLowerCase().includes(kw)
    )
  }
  rows.sort((a, b) => codeStrDesc(a.code, b.code))
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: rows.slice(start, start + params.pageSize), total })
}

export async function getRefundById(id: string): Promise<Result<RefundItem>> {
  const item = refundStore.find((r) => r.id === id)
  return mockResponse(item || ({} as RefundItem))
}

export async function createRefund(payload: Omit<RefundItem, 'id' | 'code' | 'status'>): Promise<Result<RefundItem>> {
  const newItem: RefundItem = {
    id: randId('REF'),
    code: `TK${pad4(_refundCodeSeq++)}`,
    customerName: payload.customerName,
    orderNo: payload.orderNo,
    amount: payload.amount,
    reason: payload.reason,
    refundDate: payload.refundDate,
    status: 'pending',
    remark: payload.remark,
  }
  refundStore.unshift(newItem)
  return mockResponse(newItem)
}

export async function updateRefund(id: string, payload: Partial<RefundItem>): Promise<Result<RefundItem>> {
  const idx = refundStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as RefundItem)
  refundStore[idx] = { ...refundStore[idx], ...payload }
  return mockResponse(refundStore[idx])
}

export async function deleteRefund(id: string): Promise<Result<boolean>> {
  const idx = refundStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  refundStore.splice(idx, 1)
  return mockResponse(true)
}

/** 退款审核（仅待审核状态可审核） */
export async function auditRefund(id: string, status: 'refunded' | 'rejected'): Promise<Result<RefundItem>> {
  const item = refundStore.find((r) => r.id === id)
  if (!item || item.status !== 'pending') return mockResponse(item || ({} as RefundItem))
  item.status = status
  return mockResponse(item)
}

// ============================================================
// 6. 工资 Salary
// ============================================================

export type SalaryStatus = 'pending' | 'paid'
export const salaryStatusOptions: { label: string; value: SalaryStatus }[] = [
  { label: '待发放', value: 'pending' },
  { label: '已发放', value: 'paid' },
]
export const salaryStatusLabelMap: Record<SalaryStatus, string> = {
  pending: '待发放',
  paid: '已发放',
}
export const salaryStatusTagTypeMap: Record<SalaryStatus, TagType> = {
  pending: 'warning',
  paid: 'success',
}

export interface SalaryItem {
  id: string
  code: string
  employeeName: string
  month: string            // YYYY-MM
  baseSalary: number
  bonus: number
  deduction: number
  netSalary: number        // = baseSalary + bonus - deduction
  payDate?: string
  status: SalaryStatus
  remark?: string
}

const SALARY_INIT: Omit<SalaryItem, 'id'>[] = [
  { code: 'GZ0008', employeeName: '小北', month: '2026-08', baseSalary: 9800, bonus: 2000, deduction: 760, netSalary: 11040, status: 'pending', remark: '示例8月工资（演示数据）' },
  { code: 'GZ0007', employeeName: '小白', month: '2026-08', baseSalary: 7400, bonus: 900, deduction: 400, netSalary: 7900, status: 'pending', remark: '' },
  { code: 'GZ0006', employeeName: '小戴', month: '2026-08', baseSalary: 8600, bonus: 1500, deduction: 620, netSalary: 9480, status: 'pending', remark: '' },
  { code: 'GZ0005', employeeName: '小陈', month: '2026-08', baseSalary: 7200, bonus: 1200, deduction: 480, netSalary: 7920, status: 'pending', remark: '' },
  { code: 'GZ0004', employeeName: '小林', month: '2026-07', baseSalary: 5800, bonus: 500, deduction: 260, netSalary: 6040, payDate: '2026-08-05', status: 'paid', remark: '' },
  { code: 'GZ0003', employeeName: '小周', month: '2026-07', baseSalary: 6500, bonus: 800, deduction: 350, netSalary: 6950, payDate: '2026-08-05', status: 'paid', remark: '' },
  { code: 'GZ0002', employeeName: '小戴', month: '2026-07', baseSalary: 8600, bonus: 1500, deduction: 620, netSalary: 9480, payDate: '2026-08-05', status: 'paid', remark: '' },
  { code: 'GZ0001', employeeName: '小北', month: '2026-07', baseSalary: 9800, bonus: 2000, deduction: 760, netSalary: 11040, payDate: '2026-08-05', status: 'paid', remark: '' },
]

let _salaryCodeSeq = 9
const salaryStore: SalaryItem[] = SALARY_INIT.map((r, i) => ({
  ...r,
  id: `SAL_${Date.now()}_${i + 1}`,
}))

function calcNetSalary(baseSalary: number, bonus: number, deduction: number): number {
  return Math.round(((baseSalary || 0) + (bonus || 0) - (deduction || 0)) * 100) / 100
}

export interface SalaryPageParams {
  page: number
  pageSize: number
  status?: SalaryStatus
  month?: string
  keyword?: string
}

export async function getSalaryPage(params: SalaryPageParams): Promise<Result<{ list: SalaryItem[]; total: number }>> {
  let rows = [...salaryStore]
  if (params.status) rows = rows.filter((r) => r.status === params.status)
  if (params.month) rows = rows.filter((r) => r.month === params.month)
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    rows = rows.filter((r) =>
      r.code.toLowerCase().includes(kw) ||
      r.employeeName.toLowerCase().includes(kw) ||
      (r.remark || '').toLowerCase().includes(kw)
    )
  }
  rows.sort((a, b) => codeStrDesc(a.code, b.code))
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: rows.slice(start, start + params.pageSize), total })
}

export async function getSalaryById(id: string): Promise<Result<SalaryItem>> {
  const item = salaryStore.find((r) => r.id === id)
  return mockResponse(item || ({} as SalaryItem))
}

export async function createSalary(payload: Omit<SalaryItem, 'id' | 'code' | 'netSalary' | 'status' | 'payDate'> & Partial<SalaryItem>): Promise<Result<SalaryItem>> {
  const netSalary = calcNetSalary(payload.baseSalary, payload.bonus, payload.deduction)
  const newItem: SalaryItem = {
    id: randId('SAL'),
    code: `GZ${pad4(_salaryCodeSeq++)}`,
    employeeName: payload.employeeName,
    month: payload.month,
    baseSalary: payload.baseSalary,
    bonus: payload.bonus || 0,
    deduction: payload.deduction || 0,
    netSalary,
    payDate: payload.payDate,
    status: 'pending',
    remark: payload.remark,
  }
  salaryStore.unshift(newItem)
  return mockResponse(newItem)
}

export async function updateSalary(id: string, payload: Partial<SalaryItem>): Promise<Result<SalaryItem>> {
  const idx = salaryStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as SalaryItem)
  const next = { ...salaryStore[idx], ...payload }
  next.netSalary = calcNetSalary(next.baseSalary, next.bonus, next.deduction)
  salaryStore[idx] = next
  return mockResponse(salaryStore[idx])
}

export async function deleteSalary(id: string): Promise<Result<boolean>> {
  const idx = salaryStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  salaryStore.splice(idx, 1)
  return mockResponse(true)
}

/** 工资发放（仅待发放状态可发放） */
export async function paySalary(id: string, payDate: string): Promise<Result<SalaryItem>> {
  const item = salaryStore.find((r) => r.id === id)
  if (!item || item.status !== 'pending') return mockResponse(item || ({} as SalaryItem))
  item.status = 'paid'
  item.payDate = payDate
  return mockResponse(item)
}

/** 工资月份选项（去重降序，供筛选） */
export function getSalaryMonthOptions(): { label: string; value: string }[] {
  const months = Array.from(new Set(salaryStore.map((s) => s.month)))
  months.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
  return months.map((m) => ({ label: m, value: m }))
}

// ============================================================
// 7. 预算 Budget
// ============================================================

export type BudgetStatus = 'open' | 'closed'
export const budgetStatusOptions: { label: string; value: BudgetStatus }[] = [
  { label: '进行中', value: 'open' },
  { label: '已关闭', value: 'closed' },
]
export const budgetStatusLabelMap: Record<BudgetStatus, string> = {
  open: '进行中',
  closed: '已关闭',
}
export const budgetStatusTagTypeMap: Record<BudgetStatus, TagType> = {
  open: 'primary',
  closed: 'info',
}

export interface BudgetItem {
  id: string
  code: string
  deptName: string
  period: string           // YYYY-MM
  budgetAmount: number
  usedAmount: number       // ≤ budgetAmount
  status: BudgetStatus
  remark?: string
}

const BUDGET_INIT: Omit<BudgetItem, 'id'>[] = [
  { code: 'YS0006', deptName: '销售部', period: '2026-09', budgetAmount: 120000, usedAmount: 0, status: 'open', remark: '示例9月销售费用预算（演示数据）' },
  { code: 'YS0005', deptName: '市场部', period: '2026-09', budgetAmount: 80000, usedAmount: 0, status: 'open', remark: '' },
  { code: 'YS0004', deptName: '研发部', period: '2026-08', budgetAmount: 150000, usedAmount: 96500, status: 'open', remark: '' },
  { code: 'YS0003', deptName: '销售部', period: '2026-08', budgetAmount: 120000, usedAmount: 88300, status: 'open', remark: '' },
  { code: 'YS0002', deptName: '行政部', period: '2026-08', budgetAmount: 50000, usedAmount: 49200, status: 'open', remark: '示例：接近预算上限（演示数据）' },
  { code: 'YS0001', deptName: '人事部', period: '2026-07', budgetAmount: 60000, usedAmount: 58000, status: 'closed', remark: '' },
]

let _budgetCodeSeq = 7
const budgetStore: BudgetItem[] = BUDGET_INIT.map((r, i) => ({
  ...r,
  id: `BDG_${Date.now()}_${i + 1}`,
}))

export interface BudgetPageParams {
  page: number
  pageSize: number
  status?: BudgetStatus
  period?: string
  keyword?: string
}

export async function getBudgetPage(params: BudgetPageParams): Promise<Result<{ list: BudgetItem[]; total: number }>> {
  let rows = [...budgetStore]
  if (params.status) rows = rows.filter((r) => r.status === params.status)
  if (params.period) rows = rows.filter((r) => r.period === params.period)
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    rows = rows.filter((r) =>
      r.code.toLowerCase().includes(kw) ||
      r.deptName.toLowerCase().includes(kw) ||
      (r.remark || '').toLowerCase().includes(kw)
    )
  }
  rows.sort((a, b) => codeStrDesc(a.code, b.code))
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: rows.slice(start, start + params.pageSize), total })
}

export async function getBudgetById(id: string): Promise<Result<BudgetItem>> {
  const item = budgetStore.find((r) => r.id === id)
  return mockResponse(item || ({} as BudgetItem))
}

export async function createBudget(payload: Pick<BudgetItem, 'deptName' | 'period' | 'budgetAmount'> & Partial<BudgetItem>): Promise<Result<BudgetItem>> {
  const newItem: BudgetItem = {
    id: randId('BDG'),
    code: `YS${pad4(_budgetCodeSeq++)}`,
    deptName: payload.deptName,
    period: payload.period,
    budgetAmount: payload.budgetAmount,
    usedAmount: payload.usedAmount || 0,
    status: payload.status || 'open',
    remark: payload.remark,
  }
  budgetStore.unshift(newItem)
  return mockResponse(newItem)
}

export async function updateBudget(id: string, payload: Partial<BudgetItem>): Promise<Result<BudgetItem>> {
  const idx = budgetStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as BudgetItem)
  budgetStore[idx] = { ...budgetStore[idx], ...payload }
  return mockResponse(budgetStore[idx])
}

export async function deleteBudget(id: string): Promise<Result<boolean>> {
  const idx = budgetStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  budgetStore.splice(idx, 1)
  return mockResponse(true)
}

/** 预算月份选项（去重降序，供筛选） */
export function getBudgetPeriodOptions(): { label: string; value: string }[] {
  const periods = Array.from(new Set(budgetStore.map((b) => b.period)))
  periods.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
  return periods.map((p) => ({ label: p, value: p }))
}

// ============================================================
// 8. 账户流水 AccountFlow（只读查询）
// ============================================================

export type FlowDirection = 'in' | 'out'
export const flowDirectionOptions: { label: string; value: FlowDirection }[] = [
  { label: '收入', value: 'in' },
  { label: '支出', value: 'out' },
]
export const flowDirectionLabelMap: Record<FlowDirection, string> = {
  in: '收入',
  out: '支出',
}
export const flowDirectionTagTypeMap: Record<FlowDirection, TagType> = {
  in: 'success',
  out: 'danger',
}

export interface AccountFlowItem {
  id: string
  flowNo: string           // FLOW2026 开头
  accountName: string
  direction: FlowDirection
  amount: number
  occurDate: string
  summary: string
  relatedNo?: string
}

const ACCOUNT_FLOW_INIT: Omit<AccountFlowItem, 'id'>[] = [
  { flowNo: 'FLOW20260010', accountName: '示例科技-基本户(工商银行)', direction: 'out', amount: 9800, occurDate: '2026-08-26', summary: '支付广告宣传费', relatedNo: 'FY0007' },
  { flowNo: 'FLOW20260009', accountName: '示例科技-基本户(工商银行)', direction: 'in', amount: 56800, occurDate: '2026-08-25', summary: '收示例商城订单回款', relatedNo: 'SR0006' },
  { flowNo: 'FLOW20260008', accountName: '示例科技公司-现金账户', direction: 'out', amount: 1268.5, occurDate: '2026-08-20', summary: '支付办公用品费用', relatedNo: 'FY0006' },
  { flowNo: 'FLOW20260007', accountName: '示例企业支付宝账户', direction: 'in', amount: 15000, occurDate: '2026-08-16', summary: '收示例门店加盟费', relatedNo: 'SR0004' },
  { flowNo: 'FLOW20260006', accountName: '示例科技-基本户(工商银行)', direction: 'out', amount: 4800, occurDate: '2026-08-15', summary: '支付员工培训费', relatedNo: 'FY0004' },
  { flowNo: 'FLOW20260005', accountName: '示例企业微信商户号', direction: 'in', amount: 8600, occurDate: '2026-08-12', summary: '收样机销售回款', relatedNo: 'SR0003' },
  { flowNo: 'FLOW20260004', accountName: '示例科技-基本户(工商银行)', direction: 'out', amount: 3215.8, occurDate: '2026-08-10', summary: '支付水电物业费', relatedNo: 'FY0003' },
  { flowNo: 'FLOW20260003', accountName: '示例科技-基本户(工商银行)', direction: 'in', amount: 32000, occurDate: '2026-08-08', summary: '收示例项目服务费', relatedNo: 'SR0005' },
  { flowNo: 'FLOW20260002', accountName: '示例科技公司-现金账户', direction: 'out', amount: 1560.5, occurDate: '2026-08-06', summary: '支付差旅费用', relatedNo: 'FY0002' },
  { flowNo: 'FLOW20260001', accountName: '示例企业支付宝账户', direction: 'in', amount: 3200, occurDate: '2026-08-02', summary: '收示例超市连锁货款', relatedNo: 'SO20260802' },
]

const accountFlowStore: AccountFlowItem[] = ACCOUNT_FLOW_INIT.map((r, i) => ({
  ...r,
  id: `FLW_${Date.now()}_${i + 1}`,
}))

export interface AccountFlowPageParams {
  page: number
  pageSize: number
  accountName?: string
  direction?: FlowDirection
  dateStart?: string
  dateEnd?: string
  keyword?: string
}

export async function getAccountFlowPage(params: AccountFlowPageParams): Promise<Result<{ list: AccountFlowItem[]; total: number }>> {
  let rows = [...accountFlowStore]
  if (params.accountName) rows = rows.filter((r) => r.accountName === params.accountName)
  if (params.direction) rows = rows.filter((r) => r.direction === params.direction)
  if (params.dateStart) rows = rows.filter((r) => r.occurDate >= params.dateStart!)
  if (params.dateEnd) rows = rows.filter((r) => r.occurDate <= params.dateEnd!)
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    rows = rows.filter((r) =>
      r.flowNo.toLowerCase().includes(kw) ||
      r.summary.toLowerCase().includes(kw) ||
      (r.relatedNo || '').toLowerCase().includes(kw)
    )
  }
  rows.sort((a, b) => codeStrDesc(a.flowNo, b.flowNo))
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: rows.slice(start, start + params.pageSize), total })
}

export async function getAccountFlowById(id: string): Promise<Result<AccountFlowItem>> {
  const item = accountFlowStore.find((r) => r.id === id)
  return mockResponse(item || ({} as AccountFlowItem))
}

// ============================================================
// 9. 利润提成 ProfitBonus
// ============================================================

export type ProfitBonusStatus = 'pending' | 'approved'
export const profitBonusStatusOptions: { label: string; value: ProfitBonusStatus }[] = [
  { label: '待审批', value: 'pending' },
  { label: '已审批', value: 'approved' },
]
export const profitBonusStatusLabelMap: Record<ProfitBonusStatus, string> = {
  pending: '待审批',
  approved: '已审批',
}
export const profitBonusStatusTagTypeMap: Record<ProfitBonusStatus, TagType> = {
  pending: 'warning',
  approved: 'success',
}

export interface ProfitBonusItem {
  id: string
  code: string
  employeeName: string
  period: string           // YYYY-MM
  profitAmount: number
  bonusRate: number        // %
  bonusAmount: number      // = profitAmount * bonusRate / 100
  status: ProfitBonusStatus
  remark?: string
}

const PROFIT_BONUS_INIT: Omit<ProfitBonusItem, 'id'>[] = [
  { code: 'TC0005', employeeName: '小北', period: '2026-07', profitAmount: 86000, bonusRate: 5, bonusAmount: 4300, status: 'pending', remark: '示例7月销售提成（演示数据）' },
  { code: 'TC0004', employeeName: '小白', period: '2026-07', profitAmount: 62000, bonusRate: 4, bonusAmount: 2480, status: 'pending', remark: '' },
  { code: 'TC0003', employeeName: '小戴', period: '2026-07', profitAmount: 105000, bonusRate: 6, bonusAmount: 6300, status: 'approved', remark: '' },
  { code: 'TC0002', employeeName: '小陈', period: '2026-06', profitAmount: 48000, bonusRate: 4, bonusAmount: 1920, status: 'approved', remark: '' },
  { code: 'TC0001', employeeName: '小林', period: '2026-06', profitAmount: 52000, bonusRate: 5, bonusAmount: 2600, status: 'approved', remark: '' },
]

let _profitBonusCodeSeq = 6
const profitBonusStore: ProfitBonusItem[] = PROFIT_BONUS_INIT.map((r, i) => ({
  ...r,
  id: `PB_${Date.now()}_${i + 1}`,
}))

function calcBonusAmount(profitAmount: number, bonusRate: number): number {
  return Math.round(((profitAmount || 0) * (bonusRate || 0)) / 100 * 100) / 100
}

export interface ProfitBonusPageParams {
  page: number
  pageSize: number
  status?: ProfitBonusStatus
  period?: string
  keyword?: string
}

export async function getProfitBonusPage(params: ProfitBonusPageParams): Promise<Result<{ list: ProfitBonusItem[]; total: number }>> {
  let rows = [...profitBonusStore]
  if (params.status) rows = rows.filter((r) => r.status === params.status)
  if (params.period) rows = rows.filter((r) => r.period === params.period)
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    rows = rows.filter((r) =>
      r.code.toLowerCase().includes(kw) ||
      r.employeeName.toLowerCase().includes(kw) ||
      (r.remark || '').toLowerCase().includes(kw)
    )
  }
  rows.sort((a, b) => codeStrDesc(a.code, b.code))
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: rows.slice(start, start + params.pageSize), total })
}

export async function getProfitBonusById(id: string): Promise<Result<ProfitBonusItem>> {
  const item = profitBonusStore.find((r) => r.id === id)
  return mockResponse(item || ({} as ProfitBonusItem))
}

export async function createProfitBonus(payload: Omit<ProfitBonusItem, 'id' | 'code' | 'bonusAmount' | 'status'>): Promise<Result<ProfitBonusItem>> {
  const newItem: ProfitBonusItem = {
    id: randId('PB'),
    code: `TC${pad4(_profitBonusCodeSeq++)}`,
    employeeName: payload.employeeName,
    period: payload.period,
    profitAmount: payload.profitAmount,
    bonusRate: payload.bonusRate,
    bonusAmount: calcBonusAmount(payload.profitAmount, payload.bonusRate),
    status: 'pending',
    remark: payload.remark,
  }
  profitBonusStore.unshift(newItem)
  return mockResponse(newItem)
}

export async function updateProfitBonus(id: string, payload: Partial<ProfitBonusItem>): Promise<Result<ProfitBonusItem>> {
  const idx = profitBonusStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as ProfitBonusItem)
  const next = { ...profitBonusStore[idx], ...payload }
  next.bonusAmount = calcBonusAmount(next.profitAmount, next.bonusRate)
  profitBonusStore[idx] = next
  return mockResponse(profitBonusStore[idx])
}

export async function deleteProfitBonus(id: string): Promise<Result<boolean>> {
  const idx = profitBonusStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  profitBonusStore.splice(idx, 1)
  return mockResponse(true)
}

/** 利润提成审批（仅待审批状态可审批） */
export async function approveProfitBonus(id: string): Promise<Result<ProfitBonusItem>> {
  const item = profitBonusStore.find((r) => r.id === id)
  if (!item || item.status !== 'pending') return mockResponse(item || ({} as ProfitBonusItem))
  item.status = 'approved'
  return mockResponse(item)
}

/** 提成月份选项（去重降序，供筛选） */
export function getProfitBonusPeriodOptions(): { label: string; value: string }[] {
  const periods = Array.from(new Set(profitBonusStore.map((p) => p.period)))
  periods.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
  return periods.map((p) => ({ label: p, value: p }))
}

// ============================================================
// 10. 应付款 Payable
// ============================================================

export type PayStatus = 'unpaid' | 'partial' | 'paid'
export const payStatusOptions: { label: string; value: PayStatus }[] = [
  { label: '未付', value: 'unpaid' },
  { label: '部分付', value: 'partial' },
  { label: '已付', value: 'paid' },
]
export const payStatusLabelMap: Record<PayStatus, string> = {
  unpaid: '未付',
  partial: '部分付',
  paid: '已付',
}
export const receiveStatusOptions: { label: string; value: PayStatus }[] = [
  { label: '未收', value: 'unpaid' },
  { label: '部分收', value: 'partial' },
  { label: '已收', value: 'paid' },
]
export const receiveStatusLabelMap: Record<PayStatus, string> = {
  unpaid: '未收',
  partial: '部分收',
  paid: '已收',
}
export const payStatusTagTypeMap: Record<PayStatus, TagType> = {
  unpaid: 'danger',
  partial: 'warning',
  paid: 'success',
}

export interface PayableItem {
  id: string
  code: string
  supplierName: string
  orderNo: string
  amount: number
  paidAmount: number       // ≤ amount
  dueDate: string
  status: PayStatus
  remark?: string
}

const PAYABLE_INIT: Omit<PayableItem, 'id'>[] = [
  { code: 'YF0006', supplierName: '示例电子元器件有限公司', orderNo: 'PO20260821', amount: 56800, paidAmount: 0, dueDate: '2026-09-20', status: 'unpaid', remark: '示例元器件采购款（演示数据）' },
  { code: 'YF0005', supplierName: '示例包装材料有限公司', orderNo: 'PO20260815', amount: 12300, paidAmount: 5000, dueDate: '2026-09-14', status: 'partial', remark: '' },
  { code: 'YF0004', supplierName: '示例物流服务有限公司', orderNo: 'PO20260810', amount: 8600, paidAmount: 8600, dueDate: '2026-09-09', status: 'paid', remark: '' },
  { code: 'YF0003', supplierName: '示例钢材贸易有限公司', orderNo: 'PO20260805', amount: 128000, paidAmount: 64000, dueDate: '2026-09-04', status: 'partial', remark: '' },
  { code: 'YF0002', supplierName: '示例包装材料有限公司', orderNo: 'PO20260728', amount: 6800, paidAmount: 6800, dueDate: '2026-08-27', status: 'paid', remark: '' },
  { code: 'YF0001', supplierName: '示例电子元器件有限公司', orderNo: 'PO20260720', amount: 23600, paidAmount: 23600, dueDate: '2026-08-19', status: 'paid', remark: '' },
]

let _payableCodeSeq = 7
const payableStore: PayableItem[] = PAYABLE_INIT.map((r, i) => ({
  ...r,
  id: `PAY_${Date.now()}_${i + 1}`,
}))

function derivePayStatus(amount: number, doneAmount: number): PayStatus {
  if (doneAmount >= amount) return 'paid'
  if (doneAmount > 0) return 'partial'
  return 'unpaid'
}

export interface PayablePageParams {
  page: number
  pageSize: number
  status?: PayStatus
  dateStart?: string
  dateEnd?: string
  keyword?: string
}

export async function getPayablePage(params: PayablePageParams): Promise<Result<{ list: PayableItem[]; total: number }>> {
  let rows = [...payableStore]
  if (params.status) rows = rows.filter((r) => r.status === params.status)
  if (params.dateStart) rows = rows.filter((r) => r.dueDate >= params.dateStart!)
  if (params.dateEnd) rows = rows.filter((r) => r.dueDate <= params.dateEnd!)
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    rows = rows.filter((r) =>
      r.code.toLowerCase().includes(kw) ||
      r.supplierName.toLowerCase().includes(kw) ||
      r.orderNo.toLowerCase().includes(kw) ||
      (r.remark || '').toLowerCase().includes(kw)
    )
  }
  rows.sort((a, b) => codeStrDesc(a.code, b.code))
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: rows.slice(start, start + params.pageSize), total })
}

export async function getPayableById(id: string): Promise<Result<PayableItem>> {
  const item = payableStore.find((r) => r.id === id)
  return mockResponse(item || ({} as PayableItem))
}

export async function createPayable(payload: Omit<PayableItem, 'id' | 'code' | 'status'> & Partial<PayableItem>): Promise<Result<PayableItem>> {
  const paidAmount = payload.paidAmount || 0
  const newItem: PayableItem = {
    id: randId('PAY'),
    code: `YF${pad4(_payableCodeSeq++)}`,
    supplierName: payload.supplierName,
    orderNo: payload.orderNo,
    amount: payload.amount,
    paidAmount,
    dueDate: payload.dueDate,
    status: derivePayStatus(payload.amount, paidAmount),
    remark: payload.remark,
  }
  payableStore.unshift(newItem)
  return mockResponse(newItem)
}

export async function updatePayable(id: string, payload: Partial<PayableItem>): Promise<Result<PayableItem>> {
  const idx = payableStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as PayableItem)
  const next = { ...payableStore[idx], ...payload }
  next.status = derivePayStatus(next.amount, next.paidAmount)
  payableStore[idx] = next
  return mockResponse(payableStore[idx])
}

export async function deletePayable(id: string): Promise<Result<boolean>> {
  const idx = payableStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  payableStore.splice(idx, 1)
  return mockResponse(true)
}

/** 登记付款（已付清后不可再付） */
export async function payPaid(id: string, amount: number): Promise<Result<PayableItem>> {
  const item = payableStore.find((r) => r.id === id)
  if (!item || item.status === 'paid' || amount <= 0) return mockResponse(item || ({} as PayableItem))
  item.paidAmount = Math.min(item.amount, Math.round((item.paidAmount + amount) * 100) / 100)
  item.status = derivePayStatus(item.amount, item.paidAmount)
  return mockResponse(item)
}

// ============================================================
// 11. 应收款 Receivable
// ============================================================

export interface ReceivableItem {
  id: string
  code: string
  customerName: string
  orderNo: string
  amount: number
  receivedAmount: number   // ≤ amount
  dueDate: string
  status: PayStatus
  remark?: string
}

const RECEIVABLE_INIT: Omit<ReceivableItem, 'id'>[] = [
  { code: 'SK0006', customerName: '示例商贸有限公司', orderNo: 'SO20260824', amount: 88000, receivedAmount: 0, dueDate: '2026-09-23', status: 'unpaid', remark: '' },
  { code: 'SK0005', customerName: '示例电商旗舰店', orderNo: 'SO20260818', amount: 23600, receivedAmount: 10000, dueDate: '2026-09-17', status: 'partial', remark: '示例：部分回款（演示数据）' },
  { code: 'SK0004', customerName: '示例贸易公司', orderNo: 'SO20260812', amount: 45200, receivedAmount: 45200, dueDate: '2026-09-11', status: 'paid', remark: '' },
  { code: 'SK0003', customerName: '示例百货商行', orderNo: 'SO20260806', amount: 12800, receivedAmount: 6000, dueDate: '2026-09-05', status: 'partial', remark: '' },
  { code: 'SK0002', customerName: '示例超市连锁', orderNo: 'SO20260730', amount: 32000, receivedAmount: 32000, dueDate: '2026-08-29', status: 'paid', remark: '' },
  { code: 'SK0001', customerName: '示例电商旗舰店', orderNo: 'SO20260722', amount: 18600, receivedAmount: 18600, dueDate: '2026-08-21', status: 'paid', remark: '' },
]

let _receivableCodeSeq = 7
const receivableStore: ReceivableItem[] = RECEIVABLE_INIT.map((r, i) => ({
  ...r,
  id: `REC_${Date.now()}_${i + 1}`,
}))

export interface ReceivablePageParams {
  page: number
  pageSize: number
  status?: PayStatus
  dateStart?: string
  dateEnd?: string
  keyword?: string
}

export async function getReceivablePage(params: ReceivablePageParams): Promise<Result<{ list: ReceivableItem[]; total: number }>> {
  let rows = [...receivableStore]
  if (params.status) rows = rows.filter((r) => r.status === params.status)
  if (params.dateStart) rows = rows.filter((r) => r.dueDate >= params.dateStart!)
  if (params.dateEnd) rows = rows.filter((r) => r.dueDate <= params.dateEnd!)
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    rows = rows.filter((r) =>
      r.code.toLowerCase().includes(kw) ||
      r.customerName.toLowerCase().includes(kw) ||
      r.orderNo.toLowerCase().includes(kw) ||
      (r.remark || '').toLowerCase().includes(kw)
    )
  }
  rows.sort((a, b) => codeStrDesc(a.code, b.code))
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: rows.slice(start, start + params.pageSize), total })
}

export async function getReceivableById(id: string): Promise<Result<ReceivableItem>> {
  const item = receivableStore.find((r) => r.id === id)
  return mockResponse(item || ({} as ReceivableItem))
}

export async function createReceivable(payload: Omit<ReceivableItem, 'id' | 'code' | 'status'> & Partial<ReceivableItem>): Promise<Result<ReceivableItem>> {
  const receivedAmount = payload.receivedAmount || 0
  const newItem: ReceivableItem = {
    id: randId('REC'),
    code: `SK${pad4(_receivableCodeSeq++)}`,
    customerName: payload.customerName,
    orderNo: payload.orderNo,
    amount: payload.amount,
    receivedAmount,
    dueDate: payload.dueDate,
    status: derivePayStatus(payload.amount, receivedAmount),
    remark: payload.remark,
  }
  receivableStore.unshift(newItem)
  return mockResponse(newItem)
}

export async function updateReceivable(id: string, payload: Partial<ReceivableItem>): Promise<Result<ReceivableItem>> {
  const idx = receivableStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as ReceivableItem)
  const next = { ...receivableStore[idx], ...payload }
  next.status = derivePayStatus(next.amount, next.receivedAmount)
  receivableStore[idx] = next
  return mockResponse(receivableStore[idx])
}

export async function deleteReceivable(id: string): Promise<Result<boolean>> {
  const idx = receivableStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  receivableStore.splice(idx, 1)
  return mockResponse(true)
}

/** 登记收款（已收清后不可再收） */
export async function receiveReceivable(id: string, amount: number): Promise<Result<ReceivableItem>> {
  const item = receivableStore.find((r) => r.id === id)
  if (!item || item.status === 'paid' || amount <= 0) return mockResponse(item || ({} as ReceivableItem))
  item.receivedAmount = Math.min(item.amount, Math.round((item.receivedAmount + amount) * 100) / 100)
  item.status = derivePayStatus(item.amount, item.receivedAmount)
  return mockResponse(item)
}

// ============================================================
// 12. 分润 Share
// ============================================================

export type ShareStatus = 'pending' | 'settled'
export const shareStatusOptions: { label: string; value: ShareStatus }[] = [
  { label: '待结算', value: 'pending' },
  { label: '已结算', value: 'settled' },
]
export const shareStatusLabelMap: Record<ShareStatus, string> = {
  pending: '待结算',
  settled: '已结算',
}
export const shareStatusTagTypeMap: Record<ShareStatus, TagType> = {
  pending: 'warning',
  settled: 'success',
}

export interface ShareItem {
  id: string
  code: string
  partnerName: string
  period: string           // YYYY-MM
  shareAmount: number
  ratio: number            // %
  status: ShareStatus
  remark?: string
}

const SHARE_INIT: Omit<ShareItem, 'id'>[] = [
  { code: 'FR0005', partnerName: '示例渠道合作商', period: '2026-07', shareAmount: 26000, ratio: 15, status: 'pending', remark: '示例7月渠道分润（演示数据）' },
  { code: 'FR0004', partnerName: '示例联盟商务有限公司', period: '2026-07', shareAmount: 42000, ratio: 12, status: 'pending', remark: '' },
  { code: 'FR0003', partnerName: '示例渠道合作商', period: '2026-06', shareAmount: 24000, ratio: 15, status: 'settled', remark: '' },
  { code: 'FR0002', partnerName: '示例联盟商务有限公司', period: '2026-06', shareAmount: 38000, ratio: 12, status: 'settled', remark: '' },
  { code: 'FR0001', partnerName: '示例区域运营商', period: '2026-06', shareAmount: 18000, ratio: 10, status: 'settled', remark: '' },
]

let _shareCodeSeq = 6
const shareStore: ShareItem[] = SHARE_INIT.map((r, i) => ({
  ...r,
  id: `SHR_${Date.now()}_${i + 1}`,
}))

export interface SharePageParams {
  page: number
  pageSize: number
  status?: ShareStatus
  period?: string
  keyword?: string
}

export async function getSharePage(params: SharePageParams): Promise<Result<{ list: ShareItem[]; total: number }>> {
  let rows = [...shareStore]
  if (params.status) rows = rows.filter((r) => r.status === params.status)
  if (params.period) rows = rows.filter((r) => r.period === params.period)
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    rows = rows.filter((r) =>
      r.code.toLowerCase().includes(kw) ||
      r.partnerName.toLowerCase().includes(kw) ||
      (r.remark || '').toLowerCase().includes(kw)
    )
  }
  rows.sort((a, b) => codeStrDesc(a.code, b.code))
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: rows.slice(start, start + params.pageSize), total })
}

export async function getShareById(id: string): Promise<Result<ShareItem>> {
  const item = shareStore.find((r) => r.id === id)
  return mockResponse(item || ({} as ShareItem))
}

export async function createShare(payload: Omit<ShareItem, 'id' | 'code' | 'status'>): Promise<Result<ShareItem>> {
  const newItem: ShareItem = {
    id: randId('SHR'),
    code: `FR${pad4(_shareCodeSeq++)}`,
    partnerName: payload.partnerName,
    period: payload.period,
    shareAmount: payload.shareAmount,
    ratio: payload.ratio,
    status: 'pending',
    remark: payload.remark,
  }
  shareStore.unshift(newItem)
  return mockResponse(newItem)
}

export async function updateShare(id: string, payload: Partial<ShareItem>): Promise<Result<ShareItem>> {
  const idx = shareStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as ShareItem)
  shareStore[idx] = { ...shareStore[idx], ...payload }
  return mockResponse(shareStore[idx])
}

export async function deleteShare(id: string): Promise<Result<boolean>> {
  const idx = shareStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  shareStore.splice(idx, 1)
  return mockResponse(true)
}

/** 分润结算（仅待结算状态可结算） */
export async function settleShare(id: string): Promise<Result<ShareItem>> {
  const item = shareStore.find((r) => r.id === id)
  if (!item || item.status !== 'pending') return mockResponse(item || ({} as ShareItem))
  item.status = 'settled'
  return mockResponse(item)
}

/** 分润月份选项（去重降序，供筛选） */
export function getSharePeriodOptions(): { label: string; value: string }[] {
  const periods = Array.from(new Set(shareStore.map((s) => s.period)))
  periods.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
  return periods.map((p) => ({ label: p, value: p }))
}
