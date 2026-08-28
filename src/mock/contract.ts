// src/mock/contract.ts
// 合同管理 Mock 数据层（全部脱敏虚构，公司名以"示例"标注）
import type { Result } from '@/http'
import { mockResponse } from '@/mock'

// ======== 类型 ========

/** 合同类型 */
export type ContractType = 'export' | 'domestic' | 'purchase'
export const typeLabel: Record<ContractType, string> = {
  export: '外销',
  domestic: '内销',
  purchase: '采购',
}
export const typeTagTypeMap: Record<ContractType, 'primary' | 'success' | 'warning'> = {
  export: 'primary',
  domestic: 'success',
  purchase: 'warning',
}
export const contractTypeOptions: { label: string; value: ContractType }[] = [
  { label: '外销', value: 'export' },
  { label: '内销', value: 'domestic' },
  { label: '采购', value: 'purchase' },
]

/** 合同状态 */
export type ContractStatus = 'draft' | 'executing' | 'completed' | 'terminated'
export const statusLabel: Record<ContractStatus, string> = {
  draft: '已草稿',
  executing: '履行中',
  completed: '已完成',
  terminated: '已终止',
}
export const statusTagTypeMap: Record<ContractStatus, 'info' | 'warning' | 'success' | 'danger'> = {
  draft: 'info',
  executing: 'warning',
  completed: 'success',
  terminated: 'danger',
}
export const contractStatusOptions: { label: string; value: ContractStatus }[] = [
  { label: '已草稿', value: 'draft' },
  { label: '履行中', value: 'executing' },
  { label: '已完成', value: 'completed' },
  { label: '已终止', value: 'terminated' },
]

/** 合同条款 */
export interface ContractTerm {
  termName: string  // 条款名称
  content: string   // 条款内容（≤225 字）
}

/** 合同 */
export interface ContractItem {
  id: string
  contractNo: string      // 合同编号（HT2026 开头）
  name: string            // 合同名称
  type: ContractType      // 合同类型
  party: string           // 对方单位
  amount: number          // 合同金额
  signDate: string        // 签订日期 YYYY-MM-DD
  startDate: string       // 开始日期 YYYY-MM-DD
  endDate: string         // 结束日期 YYYY-MM-DD（须晚于开始日期）
  status: ContractStatus  // 状态
  terms: ContractTerm[]   // 合同条款
  attachments: string[]   // 附件（文件名）
  handler: string         // 经办人
  remark?: string         // 备注 ≤225 字
  createTime: string      // 创建时间 YYYY-MM-DD HH:mm
}

/** 分页查询参数 */
export interface ContractPageParams {
  page: number
  pageSize: number
  types?: ContractType[]                 // 合同类型过滤（多选）
  keyword?: string                       // 关键字（编号/名称/对方单位/经办人/备注/条款）
  party?: string                         // 对方单位
  status?: ContractStatus | ''           // 状态
  dateRange?: string[]                   // 签订日期范围 [起, 止]
  orderBy?: 'contractNo' | 'createTime'  // 排序（默认按编号数字降序）
}

// ======== 工具函数 ========

function pad0(n: number): string { return n < 10 ? `0${n}` : `${n}` }
function nowFull(): string {
  const n = new Date()
  return `${n.getFullYear()}-${pad0(n.getMonth() + 1)}-${pad0(n.getDate())} ${pad0(n.getHours())}:${pad0(n.getMinutes())}`
}
/** 从合同编号提取数字序号（用于降序排序） */
function contractNoSeq(no: string): number {
  const digits = no.replace(/\D/g, '')
  return Number(digits || 0)
}

// ======== 初始化数据（脱敏） ========

const TERM_PAYMENT: ContractTerm = {
  termName: '付款方式',
  content: '示例条款内容（演示数据）：合同签订后 7 个工作日内支付预付款，余款于验收合格后 15 个工作日内支付。',
}
const TERM_DELIVERY: ContractTerm = {
  termName: '交货条款',
  content: '示例条款内容（演示数据）：按双方确认的批次分批交付，运费承担方式以合同附表为准，交付地点另行书面确认。',
}
const TERM_QUALITY: ContractTerm = {
  termName: '质量标准',
  content: '示例条款内容（演示数据）：货物质量应符合国家相关标准及双方封样要求，验收标准以技术附件为依据。',
}
const TERM_BREACH: ContractTerm = {
  termName: '违约责任',
  content: '示例条款内容（演示数据）：任何一方违约，应向守约方支付合同金额一定比例的违约金，具体比例以补充协议为准。',
}
const TERM_DISPUTE: ContractTerm = {
  termName: '争议解决',
  content: '示例条款内容（演示数据）：因合同发生争议，双方应友好协商解决；协商不成的，提交约定的仲裁机构裁决。',
}

const RAW_INIT: Omit<ContractItem, 'id'>[] = [
  {
    contractNo: 'HT20260009',
    name: '示例电子产品出口合同（演示数据）',
    type: 'export',
    party: '示例环球贸易有限公司',
    amount: 286000,
    signDate: '2026-08-18',
    startDate: '2026-08-20',
    endDate: '2026-11-30',
    status: 'executing',
    terms: [TERM_PAYMENT, TERM_DELIVERY, TERM_QUALITY],
    attachments: ['示例出口合同扫描件.pdf', '示例形式发票.xlsx'],
    handler: '超级管理员',
    remark: '首批订单，按约定分批交付（示例场景）',
    createTime: '2026-08-18 09:30',
  },
  {
    contractNo: 'HT20260008',
    name: '示例原材料采购合同（演示数据）',
    type: 'purchase',
    party: '示例新材料科技有限公司',
    amount: 152000,
    signDate: '2026-08-15',
    startDate: '2026-08-25',
    endDate: '2026-12-15',
    status: 'draft',
    terms: [TERM_PAYMENT, TERM_QUALITY],
    attachments: ['示例采购询价单.xlsx'],
    handler: '小戴',
    remark: '价格条款待对方确认（示例数据）',
    createTime: '2026-08-15 14:05',
  },
  {
    contractNo: 'HT20260007',
    name: '示例设备内销合同（演示数据）',
    type: 'domestic',
    party: '示例智能制造有限公司',
    amount: 420000,
    signDate: '2026-07-02',
    startDate: '2026-07-10',
    endDate: '2026-09-30',
    status: 'completed',
    terms: [TERM_PAYMENT, TERM_DELIVERY, TERM_DISPUTE],
    attachments: ['示例内销合同盖章件.pdf'],
    handler: '小北',
    remark: '款项已全部结清（演示数据）',
    createTime: '2026-07-02 10:12',
  },
  {
    contractNo: 'HT20260006',
    name: '示例家居用品出口合同（演示数据）',
    type: 'export',
    party: '示例国际贸易集团',
    amount: 96500,
    signDate: '2026-08-20',
    startDate: '2026-09-01',
    endDate: '2027-01-15',
    status: 'draft',
    terms: [TERM_DELIVERY, TERM_BREACH],
    attachments: [],
    handler: '小白',
    remark: '条款内容待双方最终确认（示例场景）',
    createTime: '2026-08-20 16:40',
  },
  {
    contractNo: 'HT20260005',
    name: '示例包装材料采购合同（演示数据）',
    type: 'purchase',
    party: '示例包装制品有限公司',
    amount: 68000,
    signDate: '2026-08-05',
    startDate: '2026-08-10',
    endDate: '2026-10-10',
    status: 'executing',
    terms: [TERM_PAYMENT, TERM_QUALITY],
    attachments: ['示例采购合同扫描件.pdf'],
    handler: '超级管理员',
    remark: '',
    createTime: '2026-08-05 11:26',
  },
  {
    contractNo: 'HT20260004',
    name: '示例软件服务内销合同（演示数据）',
    type: 'domestic',
    party: '示例信息技术有限公司',
    amount: 180000,
    signDate: '2026-05-12',
    startDate: '2026-05-20',
    endDate: '2026-11-20',
    status: 'terminated',
    terms: [TERM_PAYMENT, TERM_DISPUTE, TERM_BREACH],
    attachments: ['示例服务合同.pdf'],
    handler: '小陈',
    remark: '因需求变更双方协商终止（演示数据）',
    createTime: '2026-05-12 09:48',
  },
  {
    contractNo: 'HT20260003',
    name: '示例五金工具出口合同（演示数据）',
    type: 'export',
    party: '示例海外贸易有限公司',
    amount: 133500,
    signDate: '2026-03-08',
    startDate: '2026-03-15',
    endDate: '2026-06-30',
    status: 'completed',
    terms: [TERM_DELIVERY, TERM_PAYMENT],
    attachments: ['示例出口报关单.pdf'],
    handler: '小林',
    remark: '',
    createTime: '2026-03-08 15:33',
  },
  {
    contractNo: 'HT20260002',
    name: '示例办公设备采购合同（演示数据）',
    type: 'purchase',
    party: '示例办公设备有限公司',
    amount: 45000,
    signDate: '2026-02-10',
    startDate: '2026-02-15',
    endDate: '2026-04-15',
    status: 'completed',
    terms: [TERM_PAYMENT, TERM_QUALITY],
    attachments: [],
    handler: '超级管理员',
    remark: '示例演示数据',
    createTime: '2026-02-10 10:20',
  },
  {
    contractNo: 'HT20260001',
    name: '示例零配件内销合同（演示数据）',
    type: 'domestic',
    party: '示例机械制造有限公司',
    amount: 87000,
    signDate: '2026-07-22',
    startDate: '2026-08-01',
    endDate: '2026-12-31',
    status: 'executing',
    terms: [TERM_QUALITY, TERM_BREACH],
    attachments: ['示例零配件清单.xlsx'],
    handler: '小戴',
    remark: '',
    createTime: '2026-07-22 14:02',
  },
]

const store: ContractItem[] = RAW_INIT.map((r, i) => ({ ...r, id: `CONTRACT_${Date.now()}_${i + 1}` }))

/** 新合同编号序列（初始数据已使用 HT20260001 ~ HT20260009） */
let _contractSeq = 10
function nextContractNo(): string {
  return `HT2026${String(_contractSeq++).padStart(4, '0')}`
}

// ======== 对外接口 ========

/** 分页查询 */
export async function getContractPage(params: ContractPageParams): Promise<Result<{ list: ContractItem[]; total: number }>> {
  let rows = [...store]
  if (params.types && params.types.length) {
    rows = rows.filter((r) => params.types!.includes(r.type))
  }
  if (params.status) {
    rows = rows.filter((r) => r.status === params.status)
  }
  if (params.party) {
    const kw = params.party.toLowerCase()
    rows = rows.filter((r) => r.party.toLowerCase().includes(kw))
  }
  if (params.dateRange && params.dateRange.length === 2 && params.dateRange[0] && params.dateRange[1]) {
    const [start, end] = params.dateRange
    rows = rows.filter((r) => r.signDate >= start && r.signDate <= end)
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    rows = rows.filter((r) =>
      r.contractNo.toLowerCase().includes(kw) ||
      r.name.toLowerCase().includes(kw) ||
      r.party.toLowerCase().includes(kw) ||
      r.handler.toLowerCase().includes(kw) ||
      (r.remark || '').toLowerCase().includes(kw) ||
      r.terms.some((t) => t.termName.toLowerCase().includes(kw) || t.content.toLowerCase().includes(kw))
    )
  }
  if (params.orderBy === 'createTime') {
    rows.sort((a, b) => b.createTime.localeCompare(a.createTime))
  } else {
    rows.sort((a, b) => contractNoSeq(b.contractNo) - contractNoSeq(a.contractNo))
  }
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: rows.slice(start, start + params.pageSize), total })
}

/** 详情 */
export async function getContractById(id: string): Promise<Result<ContractItem>> {
  const item = store.find((r) => r.id === id)
  return mockResponse(item || ({} as ContractItem))
}

/** 新增（登记即创建草稿） */
export async function createContract(
  payload: Partial<Pick<ContractItem, 'name' | 'type' | 'party' | 'amount' | 'signDate' | 'startDate' | 'endDate' | 'terms' | 'attachments' | 'handler' | 'remark'>>
): Promise<Result<ContractItem>> {
  const newItem: ContractItem = {
    id: `CONTRACT_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    contractNo: nextContractNo(),
    name: payload.name || '',
    type: payload.type || 'export',
    party: payload.party || '',
    amount: payload.amount ?? 0,
    signDate: payload.signDate || nowFull().slice(0, 10),
    startDate: payload.startDate || '',
    endDate: payload.endDate || '',
    status: 'draft',
    terms: payload.terms ? payload.terms.map((t) => ({ ...t })) : [],
    attachments: payload.attachments ? [...payload.attachments] : [],
    handler: payload.handler || '超级管理员',
    remark: payload.remark,
    createTime: nowFull(),
  }
  store.push(newItem)
  return mockResponse(newItem)
}

/** 修改（仅草稿状态可编辑） */
export async function updateContract(id: string, payload: Partial<ContractItem>): Promise<Result<ContractItem>> {
  const idx = store.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as ContractItem)
  const item = store[idx]
  if (item.status !== 'draft') return mockResponse(item)
  store[idx] = {
    ...item,
    ...payload,
    // 编号/状态/创建时间不允许通过修改接口变更
    id: item.id,
    contractNo: item.contractNo,
    status: item.status,
    createTime: item.createTime,
  }
  return mockResponse(store[idx])
}

/** 删除（仅草稿状态可删除） */
export async function deleteContract(id: string): Promise<Result<boolean>> {
  const idx = store.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  if (store[idx].status !== 'draft') return mockResponse(false)
  store.splice(idx, 1)
  return mockResponse(true)
}

/** 提交合同（草稿 → 履行中） */
export async function submitContract(id: string): Promise<Result<ContractItem>> {
  const item = store.find((r) => r.id === id)
  if (item && item.status === 'draft') item.status = 'executing'
  return mockResponse(item || ({} as ContractItem))
}

/** 完成合同（履行中 → 已完成） */
export async function completeContract(id: string): Promise<Result<ContractItem>> {
  const item = store.find((r) => r.id === id)
  if (item && item.status === 'executing') item.status = 'completed'
  return mockResponse(item || ({} as ContractItem))
}

/** 终止合同（仅履行中可终止 → 已终止） */
export async function terminateContract(id: string): Promise<Result<ContractItem>> {
  const item = store.find((r) => r.id === id)
  if (item && item.status === 'executing') item.status = 'terminated'
  return mockResponse(item || ({} as ContractItem))
}
