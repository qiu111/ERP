// src/mock/crm.ts
// CRM 客户管理 Mock 数据层（客户来源 / 客户 / 商机，全部脱敏虚构）
import type { Result } from '@/http'
import { mockResponse } from '@/mock'

// ======== 公共 ========

/** 当前用户（Mock 固定） */
export const CURRENT_USER = '超级管理员'

/** 标签类型（仅允许 Element Plus 5 种） */
export type CrmTagType = 'primary' | 'success' | 'warning' | 'danger' | 'info'

function pad0(n: number): string { return n < 10 ? `0${n}` : `${n}` }
function nowFull(): string {
  const n = new Date()
  return `${n.getFullYear()}-${pad0(n.getMonth() + 1)}-${pad0(n.getDate())} ${pad0(n.getHours())}:${pad0(n.getMinutes())}`
}
function clipRemark(s?: string): string {
  return (s || '').slice(0, 225)
}
function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`
}

// ======== 客户来源 ========

export type SourceStatus = 'enabled' | 'disabled'

/** 客户来源 */
export interface CustomerSource {
  id: string
  code: number
  name: string           // 来源名称
  sort: number           // 排序
  status: SourceStatus   // 状态
  remark?: string        // 备注 ≤225 字
  createTime: string     // 创建时间 YYYY-MM-DD HH:mm
}

export const sourceStatusOptions: { label: string; value: SourceStatus }[] = [
  { label: '启用', value: 'enabled' },
  { label: '停用', value: 'disabled' },
]

export function getSourceStatusLabel(status: SourceStatus): string {
  return status === 'enabled' ? '启用' : '停用'
}

export const sourceStatusTagTypeMap: Record<SourceStatus, CrmTagType> = {
  enabled: 'success',
  disabled: 'info',
}

/** 客户来源分页查询参数 */
export interface SourcePageParams {
  page: number
  pageSize: number
  status?: SourceStatus | ''
  keyword?: string       // 关键字（名称/备注）
}

const SOURCE_INIT: Omit<CustomerSource, 'id'>[] = [
  { code: 6, name: '展会活动', sort: 1, status: 'enabled', remark: '行业展会收集的示例线索（演示数据）', createTime: '2026-08-20 10:00' },
  { code: 5, name: '网络搜索', sort: 2, status: 'enabled', remark: '', createTime: '2026-08-18 09:30' },
  { code: 4, name: '老客户介绍', sort: 3, status: 'enabled', remark: '老客户转介绍（示例场景）', createTime: '2026-08-16 14:20' },
  { code: 3, name: '广告投放', sort: 4, status: 'disabled', remark: '', createTime: '2026-08-14 11:05' },
  { code: 2, name: '电话营销', sort: 5, status: 'enabled', remark: '', createTime: '2026-08-12 16:40' },
  { code: 1, name: '陌拜拜访', sort: 6, status: 'disabled', remark: '已停用渠道（演示数据）', createTime: '2026-08-10 09:15' },
]

let _sourceCodeSeq = Math.max(...SOURCE_INIT.map((r) => r.code)) + 1
const sourceStore: CustomerSource[] = SOURCE_INIT.map((r, i) => ({ ...r, id: `CRM_SRC_${Date.now()}_${i + 1}` }))

/** 客户来源分页查询（按编号降序） */
export async function getCustomerSourcePage(params: SourcePageParams): Promise<Result<{ list: CustomerSource[]; total: number }>> {
  let rows = [...sourceStore]
  if (params.status) rows = rows.filter((r) => r.status === params.status)
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    rows = rows.filter((r) =>
      r.name.toLowerCase().includes(kw) ||
      (r.remark || '').toLowerCase().includes(kw)
    )
  }
  rows.sort((a, b) => b.code - a.code)
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: rows.slice(start, start + params.pageSize), total })
}

/** 客户来源详情 */
export async function getCustomerSourceById(id: string): Promise<Result<CustomerSource>> {
  const item = sourceStore.find((r) => r.id === id)
  return mockResponse(item || ({} as CustomerSource))
}

/** 新增客户来源 */
export async function createCustomerSource(payload: Partial<CustomerSource> & Pick<CustomerSource, 'name'>): Promise<Result<CustomerSource>> {
  const newItem: CustomerSource = {
    id: genId('CRM_SRC'),
    code: _sourceCodeSeq,
    name: payload.name,
    sort: payload.sort ?? 1,
    status: payload.status || 'enabled',
    remark: clipRemark(payload.remark),
    createTime: nowFull(),
  }
  sourceStore.unshift(newItem)
  return mockResponse(newItem)
}

/** 修改客户来源 */
export async function updateCustomerSource(id: string, payload: Partial<CustomerSource>): Promise<Result<CustomerSource>> {
  const idx = sourceStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as CustomerSource)
  sourceStore[idx] = {
    ...sourceStore[idx],
    ...payload,
    remark: clipRemark(payload.remark ?? sourceStore[idx].remark),
  }
  return mockResponse(sourceStore[idx])
}

/** 删除客户来源 */
export async function deleteCustomerSource(id: string): Promise<Result<boolean>> {
  const idx = sourceStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  sourceStore.splice(idx, 1)
  return mockResponse(true)
}

/** 启用/停用客户来源 */
export async function updateCustomerSourceStatus(id: string, status: SourceStatus): Promise<Result<CustomerSource>> {
  const idx = sourceStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as CustomerSource)
  sourceStore[idx] = { ...sourceStore[idx], status }
  return mockResponse(sourceStore[idx])
}

/** 启用中的来源下拉选项（value=来源名称） */
export function getCustomerSourceOptions(): { label: string; value: string }[] {
  return sourceStore
    .filter((r) => r.status === 'enabled')
    .sort((a, b) => a.sort - b.sort)
    .map((r) => ({ label: r.name, value: r.name }))
}

// ======== 客户 ========

export type CustomerLevel = 'important' | 'normal'

/** 客户 */
export interface CustomerItem {
  id: string
  code: number
  name: string           // 客户名称（示例/演示标注）
  sourceName: string     // 客户来源
  industry: string       // 所属行业
  contact: string        // 联系人
  phone: string          // 联系电话（脱敏）
  address: string        // 联系地址
  owner: string          // 负责人
  level: CustomerLevel   // 客户级别
  remark?: string        // 备注 ≤225 字
  createTime: string     // 创建时间 YYYY-MM-DD HH:mm
}

export const customerLevelOptions: { label: string; value: CustomerLevel }[] = [
  { label: '重要客户', value: 'important' },
  { label: '普通客户', value: 'normal' },
]

export function getCustomerLevelLabel(level: CustomerLevel): string {
  return level === 'important' ? '重要客户' : '普通客户'
}

export const customerLevelTagTypeMap: Record<CustomerLevel, CrmTagType> = {
  important: 'warning',
  normal: 'info',
}

/** 负责人选项（纯中文 2-3 字人名，脱敏虚构） */
export const ownerOptions: { label: string; value: string }[] = [
  { label: '超级管理员', value: '超级管理员' },
  { label: '小张', value: '小张' },
  { label: '小王', value: '小王' },
  { label: '小陈', value: '小陈' },
]

/** 客户分页查询参数 */
export interface CustomerPageParams {
  page: number
  pageSize: number
  level?: CustomerLevel | ''
  sourceName?: string
  owner?: string
  keyword?: string       // 关键字（客户名称/联系人）
}

const CUSTOMER_INIT: Omit<CustomerItem, 'id'>[] = [
  { code: 8, name: '示例五金厂（演示）', sourceName: '展会活动', industry: '五金制造', contact: '小张', phone: '138****0001', address: '示例市演示区兴业路1号', owner: '超级管理员', level: 'important', remark: '演示环境示例客户', createTime: '2026-08-26 09:30' },
  { code: 7, name: '示例电子科技公司（演示）', sourceName: '网络搜索', industry: '电子元器件', contact: '小王', phone: '139****0002', address: '示例市演示区科技园2栋', owner: '小张', level: 'normal', remark: '', createTime: '2026-08-24 14:10' },
  { code: 6, name: '示例包装制品厂（演示）', sourceName: '老客户介绍', industry: '包装印刷', contact: '小陈', phone: '137****0003', address: '示例市演示区工业园3号', owner: '小王', level: 'normal', remark: '老客户转介绍（演示）', createTime: '2026-08-21 11:05' },
  { code: 5, name: '示例医疗器械公司（演示）', sourceName: '展会活动', industry: '医疗设备', contact: '小张', phone: '136****0004', address: '示例市演示区健康路8号', owner: '小陈', level: 'important', remark: '', createTime: '2026-08-18 16:40' },
  { code: 4, name: '示例建材贸易商行（演示）', sourceName: '广告投放', industry: '建筑材料', contact: '小王', phone: '135****0005', address: '示例市演示区建材市场12号', owner: '超级管理员', level: 'normal', remark: '', createTime: '2026-08-15 10:22' },
  { code: 3, name: '示例服装加工厂（演示）', sourceName: '电话营销', industry: '服装纺织', contact: '小陈', phone: '134****0006', address: '示例市演示区纺织路6号', owner: '小张', level: 'normal', remark: '', createTime: '2026-08-12 15:18' },
  { code: 2, name: '示例食品加工厂（演示）', sourceName: '网络搜索', industry: '食品加工', contact: '小张', phone: '133****0007', address: '示例市演示区食品工业园9号', owner: '小王', level: 'important', remark: '意向较强（演示）', createTime: '2026-08-08 09:12' },
  { code: 1, name: '示例物流公司（演示）', sourceName: '陌拜拜访', industry: '物流运输', contact: '小王', phone: '132****0008', address: '示例市演示区物流港3号', owner: '小陈', level: 'normal', remark: '', createTime: '2026-08-05 17:45' },
]

const _customerCodeSeq = Math.max(...CUSTOMER_INIT.map((r) => r.code)) + 1
const customerStore: CustomerItem[] = CUSTOMER_INIT.map((r, i) => ({ ...r, id: `CRM_CUST_${Date.now()}_${i + 1}` }))

/** 客户分页查询（按编号降序） */
export async function getCustomerPage(params: CustomerPageParams): Promise<Result<{ list: CustomerItem[]; total: number }>> {
  let rows = [...customerStore]
  if (params.level) rows = rows.filter((r) => r.level === params.level)
  if (params.sourceName) rows = rows.filter((r) => r.sourceName === params.sourceName)
  if (params.owner) rows = rows.filter((r) => r.owner === params.owner)
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    rows = rows.filter((r) =>
      r.name.toLowerCase().includes(kw) ||
      r.contact.toLowerCase().includes(kw)
    )
  }
  rows.sort((a, b) => b.code - a.code)
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: rows.slice(start, start + params.pageSize), total })
}

/** 客户详情 */
export async function getCustomerById(id: string): Promise<Result<CustomerItem>> {
  const item = customerStore.find((r) => r.id === id)
  return mockResponse(item || ({} as CustomerItem))
}

/** 新增客户 */
export async function createCustomer(payload: Partial<CustomerItem> & Pick<CustomerItem, 'name' | 'sourceName'>): Promise<Result<CustomerItem>> {
  const newItem: CustomerItem = {
    id: genId('CRM_CUST'),
    code: _customerCodeSeq++,
    name: payload.name,
    sourceName: payload.sourceName,
    industry: payload.industry || '',
    contact: payload.contact || '',
    phone: payload.phone || '',
    address: payload.address || '',
    owner: payload.owner || CURRENT_USER,
    level: payload.level || 'normal',
    remark: clipRemark(payload.remark),
    createTime: nowFull(),
  }
  customerStore.unshift(newItem)
  return mockResponse(newItem)
}

/** 修改客户 */
export async function updateCustomer(id: string, payload: Partial<CustomerItem>): Promise<Result<CustomerItem>> {
  const idx = customerStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as CustomerItem)
  customerStore[idx] = {
    ...customerStore[idx],
    ...payload,
    remark: clipRemark(payload.remark ?? customerStore[idx].remark),
  }
  return mockResponse(customerStore[idx])
}

/** 删除客户 */
export async function deleteCustomer(id: string): Promise<Result<boolean>> {
  const idx = customerStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  customerStore.splice(idx, 1)
  return mockResponse(true)
}

/** 客户名称下拉选项（value=客户名称） */
export function getCustomerNameOptions(): { label: string; value: string }[] {
  return [...customerStore]
    .sort((a, b) => b.code - a.code)
    .map((r) => ({ label: r.name, value: r.name }))
}

// ======== 商机 ========

export type OpportunityStage = 'contact' | 'quote' | 'negotiate' | 'won' | 'lost'

/** 商机 */
export interface OpportunityItem {
  id: string
  code: number
  name: string                  // 商机名称
  customerName: string          // 客户名称
  amount: number                // 销售金额（元）
  stage: OpportunityStage       // 阶段
  expectDate: string            // 预计成交日期 YYYY-MM-DD
  owner: string                 // 负责人
  remark?: string               // 备注 ≤225 字
  createTime: string            // 创建时间 YYYY-MM-DD HH:mm
}

export const opportunityStageOptions: { label: string; value: OpportunityStage }[] = [
  { label: '初步接触', value: 'contact' },
  { label: '方案报价', value: 'quote' },
  { label: '谈判中', value: 'negotiate' },
  { label: '已成交', value: 'won' },
  { label: '已搁置', value: 'lost' },
]

export function getOpportunityStageLabel(stage: OpportunityStage): string {
  const found = opportunityStageOptions.find((o) => o.value === stage)
  return found ? found.label : stage
}

export const opportunityStageTagTypeMap: Record<OpportunityStage, CrmTagType> = {
  contact: 'info',
  quote: 'warning',
  negotiate: 'primary',
  won: 'success',
  lost: 'danger',
}

/** 商机分页查询参数 */
export interface OpportunityPageParams {
  page: number
  pageSize: number
  stage?: OpportunityStage | ''
  owner?: string
  keyword?: string       // 关键字（商机名称/客户名称）
}

const OPPORTUNITY_INIT: Omit<OpportunityItem, 'id'>[] = [
  { code: 7, name: '示例五金厂-铰链年度采购（演示）', customerName: '示例五金厂（演示）', amount: 186000, stage: 'negotiate', expectDate: '2026-09-15', owner: '超级管理员', remark: '客户要求样品确认（演示）', createTime: '2026-08-25 10:30' },
  { code: 6, name: '示例电子科技公司-连接器批量供货（演示）', customerName: '示例电子科技公司（演示）', amount: 92000, stage: 'quote', expectDate: '2026-09-08', owner: '小张', remark: '', createTime: '2026-08-23 14:20' },
  { code: 5, name: '示例医疗器械公司-检测设备采购（演示）', customerName: '示例医疗器械公司（演示）', amount: 268000, stage: 'contact', expectDate: '2026-10-20', owner: '小陈', remark: '', createTime: '2026-08-21 09:45' },
  { code: 4, name: '示例食品加工厂-包装材料供应（演示）', customerName: '示例食品加工厂（演示）', amount: 56000, stage: 'won', expectDate: '2026-08-18', owner: '小王', remark: '已签订示例合同（演示）', createTime: '2026-08-15 16:05' },
  { code: 3, name: '示例服装加工厂-工装定制（演示）', customerName: '示例服装加工厂（演示）', amount: 43000, stage: 'lost', expectDate: '2026-08-10', owner: '小张', remark: '预算原因暂搁置（演示）', createTime: '2026-08-10 11:30' },
  { code: 2, name: '示例建材贸易商行-瓷砖采购（演示）', customerName: '示例建材贸易商行（演示）', amount: 128000, stage: 'negotiate', expectDate: '2026-09-25', owner: '小王', remark: '', createTime: '2026-08-06 13:55' },
  { code: 1, name: '示例物流公司-仓储货架采购（演示）', customerName: '示例物流公司（演示）', amount: 35000, stage: 'quote', expectDate: '2026-09-02', owner: '小陈', remark: '', createTime: '2026-08-03 10:12' },
]

let _oppCodeSeq = Math.max(...OPPORTUNITY_INIT.map((r) => r.code)) + 1
const opportunityStore: OpportunityItem[] = OPPORTUNITY_INIT.map((r, i) => ({ ...r, id: `CRM_OPP_${Date.now()}_${i + 1}` }))

/** 商机分页查询（按编号降序） */
export async function getOpportunityPage(params: OpportunityPageParams): Promise<Result<{ list: OpportunityItem[]; total: number }>> {
  let rows = [...opportunityStore]
  if (params.stage) rows = rows.filter((r) => r.stage === params.stage)
  if (params.owner) rows = rows.filter((r) => r.owner === params.owner)
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    rows = rows.filter((r) =>
      r.name.toLowerCase().includes(kw) ||
      r.customerName.toLowerCase().includes(kw)
    )
  }
  rows.sort((a, b) => b.code - a.code)
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: rows.slice(start, start + params.pageSize), total })
}

/** 商机详情 */
export async function getOpportunityById(id: string): Promise<Result<OpportunityItem>> {
  const item = opportunityStore.find((r) => r.id === id)
  return mockResponse(item || ({} as OpportunityItem))
}

/** 新增商机 */
export async function createOpportunity(payload: Partial<OpportunityItem> & Pick<OpportunityItem, 'name' | 'customerName'>): Promise<Result<OpportunityItem>> {
  const newItem: OpportunityItem = {
    id: genId('CRM_OPP'),
    code: _oppCodeSeq++,
    name: payload.name,
    customerName: payload.customerName,
    amount: Number(payload.amount) || 0,
    stage: payload.stage || 'contact',
    expectDate: payload.expectDate || '',
    owner: payload.owner || CURRENT_USER,
    remark: clipRemark(payload.remark),
    createTime: nowFull(),
  }
  opportunityStore.unshift(newItem)
  return mockResponse(newItem)
}

/** 修改商机 */
export async function updateOpportunity(id: string, payload: Partial<OpportunityItem>): Promise<Result<OpportunityItem>> {
  const idx = opportunityStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as OpportunityItem)
  opportunityStore[idx] = {
    ...opportunityStore[idx],
    ...payload,
    amount: Number(payload.amount ?? opportunityStore[idx].amount) || 0,
    remark: clipRemark(payload.remark ?? opportunityStore[idx].remark),
  }
  return mockResponse(opportunityStore[idx])
}

/** 删除商机 */
export async function deleteOpportunity(id: string): Promise<Result<boolean>> {
  const idx = opportunityStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  opportunityStore.splice(idx, 1)
  return mockResponse(true)
}

/** 推进商机阶段 */
export async function advanceOpportunity(id: string, stage: OpportunityStage): Promise<Result<OpportunityItem>> {
  const idx = opportunityStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as OpportunityItem)
  opportunityStore[idx] = { ...opportunityStore[idx], stage }
  return mockResponse(opportunityStore[idx])
}
