// src/mock/workHandover.ts
// 工作交接管理 Mock 数据层（全部脱敏虚构）
import type { Result } from '@/http'
import { mockResponse } from '@/mock'

// ======== 类型 ========

/** 交接类型 */
export type HandoverType = 'resign' | 'daily'
export const handoverTypeOptions: { label: string; value: HandoverType }[] = [
  { label: '离职交接', value: 'resign' },
  { label: '日常工作交接', value: 'daily' },
]

/** 交接状态 */
export type HandoverStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export const handoverStatusOptions: { label: string; value: HandoverStatus }[] = [
  { label: '待交接', value: 'pending' },
  { label: '交接中', value: 'in_progress' },
  { label: '已完成', value: 'completed' },
  { label: '已作废', value: 'cancelled' },
]

export const handoverStatusTagTypeMap: Record<HandoverStatus, 'warning' | 'primary' | 'success' | 'info'> = {
  pending: 'warning',
  in_progress: 'primary',
  completed: 'success',
  cancelled: 'info',
}

/** 工作交接明细 */
export interface HandoverItem {
  id: string
  handoverNo: string            // 交接单号
  subject: string               // 交接主题
  type: HandoverType            // 交接类型
  handoverPerson: string        // 交接人
  receiver: string              // 接收人
  supervisor?: string           // 监督人
  handoverTime: string          // 交接时间 YYYY-MM-DD HH:mm
  status: HandoverStatus        // 状态
  content?: string              // 交接内容（HTML 富文本）
  remark?: string               // 备注 ≤225 字
}

/** 分页查询参数 */
export interface HandoverPageParams {
  page: number
  pageSize: number
  type?: HandoverType | ''      // 左侧分类面板：离职/日常
  status?: HandoverStatus | ''
  keyword?: string              // 关键字（单号/主题/人员）
}

// ======== 工具函数 ========

function pad0(n: number): string { return n < 10 ? `0${n}` : `${n}` }

/** 脱敏人员池（纯中文） */
const PEOPLE = ['超级管理员', '小戴', '小陈', '小北', '小白', '小安', '白主管']
export const handoverPersonOptions: { label: string; value: string }[] = PEOPLE.map((n) => ({ label: n, value: n }))

let _seq = 8
function genHandoverNo(): string {
  const n = new Date()
  return `HJ${n.getFullYear()}${pad0(n.getMonth() + 1)}${pad0(n.getDate())}${pad0(_seq++).repeat(2)}`
}

// ======== 初始化数据（脱敏） ========

const CONTENT_POOL = [
  '<p>示例交接内容（演示数据）：整理虚拟演示账号、权限清单及示例操作手册，移交给接收人。</p>',
  '<p>示例交接内容（演示数据）：梳理进行中的演示任务进度、风险点与后续安排。</p>',
  '<p>示例交接内容（演示数据）：移交常用演示文档模板与内部协作联系人清单。</p>',
]

const RAW_INIT: Omit<HandoverItem, 'id'>[] = [
  {
    handoverNo: 'HJ2026082801',
    subject: '示例平台运营事务交接（演示数据）',
    type: 'resign',
    handoverPerson: '小戴',
    receiver: '小白',
    supervisor: '超级管理员',
    handoverTime: '2026-08-28 09:30',
    status: 'in_progress',
    content: CONTENT_POOL[0],
    remark: '账号权限分批移交',
  },
  {
    handoverNo: 'HJ2026082702',
    subject: '虚拟采购对接工作交接（示例数据）',
    type: 'daily',
    handoverPerson: '小北',
    receiver: '小安',
    supervisor: '白主管',
    handoverTime: '2026-08-27 14:00',
    status: 'pending',
    content: CONTENT_POOL[1],
    remark: '',
  },
  {
    handoverNo: 'HJ2026082603',
    subject: '示例数据报表职责交接（演示场景）',
    type: 'daily',
    handoverPerson: '小陈',
    receiver: '小北',
    supervisor: '超级管理员',
    handoverTime: '2026-08-26 10:15',
    status: 'completed',
    content: CONTENT_POOL[1],
    remark: '已完成报表模板移交',
  },
  {
    handoverNo: 'HJ2026082504',
    subject: '虚拟演示物料管理交接（演示数据）',
    type: 'resign',
    handoverPerson: '小白',
    receiver: '小安',
    supervisor: '白主管',
    handoverTime: '2026-08-25 16:45',
    status: 'pending',
    content: CONTENT_POOL[2],
    remark: '',
  },
  {
    handoverNo: 'HJ2026082205',
    subject: '示例例会组织事务交接（演示数据）',
    type: 'daily',
    handoverPerson: '小安',
    receiver: '小戴',
    supervisor: '超级管理员',
    handoverTime: '2026-08-22 11:30',
    status: 'completed',
    content: CONTENT_POOL[1],
    remark: '',
  },
  {
    handoverNo: 'HJ2026082006',
    subject: '虚拟培训档案交接（示例场景）',
    type: 'resign',
    handoverPerson: '白主管',
    receiver: '小陈',
    supervisor: '超级管理员',
    handoverTime: '2026-08-20 09:00',
    status: 'cancelled',
    content: CONTENT_POOL[2],
    remark: '交接计划取消（演示说明）',
  },
  {
    handoverNo: 'HJ2026081807',
    subject: '示例客户资料保管交接（演示数据）',
    type: 'daily',
    handoverPerson: '超级管理员',
    receiver: '小白',
    supervisor: '白主管',
    handoverTime: '2026-08-18 15:20',
    status: 'completed',
    content: CONTENT_POOL[0],
    remark: '',
  },
]

const store: HandoverItem[] = RAW_INIT.map((r, i) => ({ ...r, id: `HJ_${Date.now()}_${i + 1}` }))

// ======== 对外接口 ========

/** 分页查询（按交接时间降序） */
export async function getHandoverPage(params: HandoverPageParams): Promise<Result<{ list: HandoverItem[]; total: number }>> {
  let rows = [...store]
  if (params.type) rows = rows.filter((r) => r.type === params.type)
  if (params.status) rows = rows.filter((r) => r.status === params.status)
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    rows = rows.filter((r) =>
      r.handoverNo.toLowerCase().includes(kw) ||
      r.subject.toLowerCase().includes(kw) ||
      r.handoverPerson.includes(params.keyword!) ||
      r.receiver.includes(params.keyword!) ||
      (r.supervisor || '').includes(params.keyword!)
    )
  }
  rows.sort((a, b) => (a.handoverTime < b.handoverTime ? 1 : -1))
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: rows.slice(start, start + params.pageSize), total })
}

/** 详情 */
export async function getHandoverById(id: string): Promise<Result<HandoverItem>> {
  const item = store.find((r) => r.id === id)
  return mockResponse(item || ({} as HandoverItem))
}

/** 新增（默认待交接） */
export async function createHandover(payload: Partial<HandoverItem> & Pick<HandoverItem, 'subject' | 'type' | 'handoverPerson' | 'receiver' | 'handoverTime'>): Promise<Result<HandoverItem>> {
  const newItem: HandoverItem = {
    id: `HJ_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    handoverNo: genHandoverNo(),
    subject: payload.subject,
    type: payload.type,
    handoverPerson: payload.handoverPerson,
    receiver: payload.receiver,
    supervisor: payload.supervisor,
    handoverTime: payload.handoverTime,
    status: 'pending',
    content: payload.content || '',
    remark: payload.remark,
  }
  store.unshift(newItem)
  return mockResponse(newItem)
}

/** 修改（仅待交接状态允许） */
export async function updateHandover(id: string, payload: Partial<HandoverItem>): Promise<Result<HandoverItem>> {
  const idx = store.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as HandoverItem)
  if (store[idx].status !== 'pending') {
    return mockResponse({} as HandoverItem)
  }
  store[idx] = { ...store[idx], ...payload }
  return mockResponse(store[idx])
}

/** 删除（仅待交接/已作废状态允许） */
export async function deleteHandover(id: string): Promise<Result<boolean>> {
  const idx = store.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  if (!['pending', 'cancelled'].includes(store[idx].status)) return mockResponse(false)
  store.splice(idx, 1)
  return mockResponse(true)
}

/** 开始交接：待交接 → 交接中 */
export async function startHandover(id: string): Promise<Result<HandoverItem>> {
  const item = store.find((r) => r.id === id)
  if (!item || item.status !== 'pending') return mockResponse({} as HandoverItem)
  item.status = 'in_progress'
  return mockResponse(item)
}

/** 完成交接：交接中 → 已完成 */
export async function completeHandover(id: string): Promise<Result<HandoverItem>> {
  const item = store.find((r) => r.id === id)
  if (!item || item.status !== 'in_progress') return mockResponse({} as HandoverItem)
  item.status = 'completed'
  return mockResponse(item)
}

/** 作废：待交接/交接中 → 已作废 */
export async function cancelHandover(id: string): Promise<Result<HandoverItem>> {
  const item = store.find((r) => r.id === id)
  if (!item || !['pending', 'in_progress'].includes(item.status)) return mockResponse({} as HandoverItem)
  item.status = 'cancelled'
  return mockResponse(item)
}
