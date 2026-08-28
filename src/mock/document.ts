// src/mock/document.ts
// 公文收发 Mock 数据层（全部脱敏虚构）
// 当前用户固定为 超级管理员（与项目其他模块一致）
import type { Result } from '@/http'
import { mockResponse } from '@/mock'

export const CURRENT_USER = '超级管理员'

// ======== 类型 ========

/** 文种 */
export type DocType = '通知' | '请示' | '报告' | '函' | '会议纪要'
export const docTypeOptions: { label: string; value: DocType }[] = [
  { label: '通知', value: '通知' },
  { label: '请示', value: '请示' },
  { label: '报告', value: '报告' },
  { label: '函', value: '函' },
  { label: '会议纪要', value: '会议纪要' },
]

/** 缓急程度 */
export type DocUrgency = '普通' | '紧急' | '特急'
export const docUrgencyOptions: { label: string; value: DocUrgency }[] = [
  { label: '普通', value: '普通' },
  { label: '紧急', value: '紧急' },
  { label: '特急', value: '特急' },
]
export const urgencyTagTypeMap: Record<DocUrgency, 'info' | 'warning' | 'danger'> = {
  '普通': 'info',
  '紧急': 'warning',
  '特急': 'danger',
}

/** 公文状态 */
export type DocStatus = 'draft' | 'sent' | 'completed' | 'withdrawn'
export const docStatusOptions: { label: string; value: DocStatus }[] = [
  { label: '草稿', value: 'draft' },
  { label: '已发送', value: 'sent' },
  { label: '已完成', value: 'completed' },
  { label: '已撤回', value: 'withdrawn' },
]
export const docStatusTagTypeMap: Record<DocStatus, 'info' | 'warning' | 'success' | 'danger'> = {
  draft: 'info',
  sent: 'warning',
  completed: 'success',
  withdrawn: 'danger',
}

/** 处理动作 */
export type ProcessAction = 'read' | 'agree' | 'reject'
export const processActionOptions: { label: string; value: ProcessAction }[] = [
  { label: '已阅', value: 'read' },
  { label: '同意', value: 'agree' },
  { label: '驳回', value: 'reject' },
]

/** 处理记录 */
export interface ProcessRecord {
  person: string
  action: ProcessAction
  opinion?: string
  time: string       // YYYY-MM-DD HH:mm
}

/** 公文明细 */
export interface DocumentItem {
  id: string
  docNo: string                 // 公文字号
  title: string
  docType: DocType
  urgency: DocUrgency
  recipients: string[]          // 主送人员
  content: string               // 正文（HTML）
  remark?: string               // 备注 ≤225
  initiator: string             // 发起人
  createTime: string            // 发起时间
  sendTime?: string             // 发送时间
  status: DocStatus
  records: ProcessRecord[]      // 处理记录
}

/** 视角 */
export type DocView = 'inbox' | 'pending' | 'initiated' | 'todo' | 'done'

/** 分页查询参数 */
export interface DocumentPageParams {
  page: number
  pageSize: number
  view: DocView
  docType?: DocType | ''
  urgency?: DocUrgency | ''
  status?: DocStatus | ''
  keyword?: string              // 字号/标题/内容
}

// ======== 工具函数 ========

function pad0(n: number): string { return n < 10 ? `0${n}` : `${n}` }
function nowFull(): string {
  const n = new Date()
  return `${n.getFullYear()}-${pad0(n.getMonth() + 1)}-${pad0(n.getDate())} ${pad0(n.getHours())}:${pad0(n.getMinutes())}`
}

/** 脱敏人员池（纯中文） */
const PEOPLE = ['超级管理员', '小戴', '小陈', '小北', '小白', '小安', '白主管']
export const recipientOptions: { label: string; value: string }[] = PEOPLE
  .filter((n) => n !== CURRENT_USER)
  .map((n) => ({ label: n, value: n }))

let _seq = 9
function genDocNo(): string {
  const n = new Date()
  return `示发〔${n.getFullYear()}〕${pad0(_seq++)}号`
}

function matchesKeyword(r: DocumentItem, kw: string): boolean {
  const k = kw.toLowerCase()
  return (
    r.docNo.toLowerCase().includes(k) ||
    r.title.toLowerCase().includes(k) ||
    r.content.toLowerCase().includes(k) ||
    (r.remark || '').toLowerCase().includes(k)
  )
}

/** 视角过滤 */
function filterByView(rows: DocumentItem[], view: DocView): DocumentItem[] {
  switch (view) {
    case 'inbox':      // 收件箱：我是主送人员且已发送
      return rows.filter((r) => r.status !== 'draft' && r.status !== 'withdrawn' && r.recipients.includes(CURRENT_USER))
    case 'pending':    // 待发：我发起的草稿
      return rows.filter((r) => r.initiator === CURRENT_USER && r.status === 'draft')
    case 'initiated':  // 我发起的：非草稿
      return rows.filter((r) => r.initiator === CURRENT_USER && r.status !== 'draft')
    case 'todo':       // 待我处理：我是主送、已发送且未处理
      return rows.filter(
        (r) => r.status === 'sent' && r.recipients.includes(CURRENT_USER) &&
        !r.records.some((rec) => rec.person === CURRENT_USER)
      )
    case 'done':       // 已处理：存在我的处理记录
      return rows.filter((r) => r.records.some((rec) => rec.person === CURRENT_USER))
  }
}

// ======== 初始化数据（脱敏） ========

const CONTENT_POOL = [
  '<p><strong>示例正文（演示数据）：</strong></p><p>为保障虚拟演示环境有序运行，请各示例部门按通知要求落实相关工作。</p>',
  '<p><strong>示例正文（演示数据）：</strong></p><p>现将虚拟演示项目阶段情况报告如下，请审阅。</p>',
  '<p><strong>示例正文（演示数据）：</strong></p><p>关于示例事项的请示，恳请批复。</p>',
  '<p><strong>示例正文（演示数据）：</strong></p><p>虚拟演示例会纪要如下，请遵照执行。</p>',
]

const RAW_INIT: DocumentItem[] = [
  // 草稿 ×2（待发）
  {
    id: 'DOC_SEED_1', docNo: '示发〔2026〕07号', title: '示例季度安全检查通知（演示数据）',
    docType: '通知', urgency: '普通', recipients: ['小戴', '小白'],
    content: CONTENT_POOL[0], remark: '草稿待完善',
    initiator: CURRENT_USER, createTime: '2026-08-27 17:20', status: 'draft', records: [],
  },
  {
    id: 'DOC_SEED_2', docNo: '示发〔2026〕08号', title: '虚拟培训计划请示（演示场景）',
    docType: '请示', urgency: '紧急', recipients: ['白主管', '小北'],
    content: CONTENT_POOL[2], remark: '',
    initiator: CURRENT_USER, createTime: '2026-08-28 09:10', status: 'draft', records: [],
  },
  // 已发送且待我处理 ×3（收件箱+待处理）
  {
    id: 'DOC_SEED_3', docNo: '示发〔2026〕05号', title: '示例例会时间调整通知（演示数据）',
    docType: '通知', urgency: '普通', recipients: [CURRENT_USER, '小陈', '小安'],
    content: CONTENT_POOL[0], remark: '',
    initiator: '白主管', createTime: '2026-08-26 10:00', sendTime: '2026-08-26 10:05',
    status: 'sent', records: [],
  },
  {
    id: 'DOC_SEED_4', docNo: '示发〔2026〕06号', title: '演示系统上线请示（示例数据）',
    docType: '请示', urgency: '特急', recipients: [CURRENT_USER, '白主管'],
    content: CONTENT_POOL[2], remark: '请尽快批复',
    initiator: '小戴', createTime: '2026-08-27 15:30', sendTime: '2026-08-27 15:35',
    status: 'sent', records: [],
  },
  {
    id: 'DOC_SEED_5', docNo: '示发〔2026〕04号', title: '虚拟值班安排通知（演示场景）',
    docType: '通知', urgency: '普通', recipients: [CURRENT_USER, '小北', '小白', '小安'],
    content: CONTENT_POOL[0], remark: '',
    initiator: '小陈', createTime: '2026-08-25 09:40', sendTime: '2026-08-25 09:45',
    status: 'sent', records: [
      { person: '小北', action: 'read', opinion: '已收悉', time: '2026-08-25 10:02' },
    ],
  },
  // 已发送但我不在主送（仅我发起视角外数据，充实收件箱外场景）
  {
    id: 'DOC_SEED_6', docNo: '示发〔2026〕03号', title: '示例物料领用通知（演示数据）',
    docType: '通知', urgency: '普通', recipients: ['小安', '小白'],
    content: CONTENT_POOL[0], remark: '',
    initiator: '白主管', createTime: '2026-08-24 14:00', sendTime: '2026-08-24 14:05',
    status: 'sent', records: [],
  },
  // 已完成 ×2（有我的处理记录）
  {
    id: 'DOC_SEED_7', docNo: '示发〔2026〕02号', title: '示例项目阶段报告（演示数据）',
    docType: '报告', urgency: '普通', recipients: [CURRENT_USER, '小戴'],
    content: CONTENT_POOL[1], remark: '',
    initiator: '小北', createTime: '2026-08-20 11:00', sendTime: '2026-08-20 11:05',
    status: 'completed', records: [
      { person: CURRENT_USER, action: 'agree', opinion: '同意归档', time: '2026-08-20 14:10' },
      { person: '小戴', action: 'read', opinion: '已阅', time: '2026-08-20 15:30' },
    ],
  },
  {
    id: 'DOC_SEED_8', docNo: '示发〔2026〕01号', title: '虚拟例会纪要（示例场景）',
    docType: '会议纪要', urgency: '普通', recipients: [CURRENT_USER, '小陈', '白主管'],
    content: CONTENT_POOL[3], remark: '',
    initiator: CURRENT_USER, createTime: '2026-08-18 16:00', sendTime: '2026-08-18 16:10',
    status: 'completed', records: [
      { person: '小陈', action: 'agree', opinion: '无异议', time: '2026-08-18 17:00' },
      { person: '白主管', action: 'agree', opinion: '同意', time: '2026-08-18 17:20' },
    ],
  },
  // 已撤回 ×1（我发起）
  {
    id: 'DOC_SEED_9', docNo: '示发〔2026〕09号', title: '示例活动安排函（演示数据）',
    docType: '函', urgency: '紧急', recipients: ['小戴', '小陈', '小北', '小白', '小安', '白主管'],
    content: CONTENT_POOL[2], remark: '内容需修订后重发',
    initiator: CURRENT_USER, createTime: '2026-08-22 10:00', sendTime: '2026-08-22 10:05',
    status: 'withdrawn', records: [],
  },
]

const store: DocumentItem[] = RAW_INIT.map((r) => ({ ...r }))

// ======== 对外接口 ========

/** 视角分页查询 */
export async function getDocumentPage(params: DocumentPageParams): Promise<Result<{ list: DocumentItem[]; total: number }>> {
  let rows = filterByView([...store], params.view)
  if (params.docType) rows = rows.filter((r) => r.docType === params.docType)
  if (params.urgency) rows = rows.filter((r) => r.urgency === params.urgency)
  if (params.status) rows = rows.filter((r) => r.status === params.status)
  if (params.keyword) rows = rows.filter((r) => matchesKeyword(r, params.keyword!))

  rows.sort((a, b) => (a.createTime < b.createTime ? 1 : -1))
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: rows.slice(start, start + params.pageSize), total })
}

/** 详情 */
export async function getDocumentById(id: string): Promise<Result<DocumentItem>> {
  const item = store.find((r) => r.id === id)
  return mockResponse(item || ({} as DocumentItem))
}

/**
 * 发起公文
 * @param asDraft true=存草稿（待发）；false=直接发送
 */
export async function createDocument(
  payload: Pick<DocumentItem, 'title' | 'docType' | 'urgency' | 'recipients' | 'content'> & { remark?: string },
  asDraft: boolean
): Promise<Result<DocumentItem>> {
  const now = nowFull()
  const newItem: DocumentItem = {
    id: `DOC_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    docNo: genDocNo(),
    title: payload.title,
    docType: payload.docType,
    urgency: payload.urgency || '普通',
    recipients: [...payload.recipients],
    content: payload.content || '',
    remark: payload.remark,
    initiator: CURRENT_USER,
    createTime: now,
    sendTime: asDraft ? undefined : now,
    status: asDraft ? 'draft' : 'sent',
    records: [],
  }
  store.unshift(newItem)
  return mockResponse(newItem)
}

/** 发送草稿 */
export async function sendDocument(id: string): Promise<Result<DocumentItem>> {
  const item = store.find((r) => r.id === id)
  if (!item || item.status !== 'draft') return mockResponse({} as DocumentItem)
  item.status = 'sent'
  item.sendTime = nowFull()
  return mockResponse(item)
}

/** 更新草稿（asDraft=false 时保存并直接发送） */
export async function updateDocumentDraft(
  id: string,
  payload: Partial<Pick<DocumentItem, 'title' | 'docType' | 'urgency' | 'recipients' | 'content' | 'remark'>>,
  asDraft: boolean
): Promise<Result<DocumentItem>> {
  const item = store.find((r) => r.id === id)
  if (!item || item.status !== 'draft') return mockResponse({} as DocumentItem)
  Object.assign(item, payload)
  if (!asDraft) {
    item.status = 'sent'
    item.sendTime = nowFull()
  }
  return mockResponse(item)
}

/** 撤回（我发起、已发送且尚无处理记录） */
export async function withdrawDocument(id: string): Promise<Result<DocumentItem>> {
  const item = store.find((r) => r.id === id)
  if (!item || item.status !== 'sent') return mockResponse({} as DocumentItem)
  if (item.initiator !== CURRENT_USER) return mockResponse({} as DocumentItem)
  if (item.records.length > 0) return mockResponse({} as DocumentItem)
  item.status = 'withdrawn'
  return mockResponse(item)
}

/** 删除（仅草稿/已撤回） */
export async function deleteDocument(id: string): Promise<Result<boolean>> {
  const idx = store.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  if (!['draft', 'withdrawn'].includes(store[idx].status)) return mockResponse(false)
  store.splice(idx, 1)
  return mockResponse(true)
}

/** 处理公文（当前用户；全部主送处理完毕后状态变为已完成） */
export async function processDocument(
  id: string,
  payload: { action: ProcessAction; opinion?: string }
): Promise<Result<DocumentItem>> {
  const item = store.find((r) => r.id === id)
  if (!item || item.status !== 'sent') return mockResponse({} as DocumentItem)
  if (!item.recipients.includes(CURRENT_USER)) return mockResponse({} as DocumentItem)
  if (item.records.some((rec) => rec.person === CURRENT_USER)) return mockResponse({} as DocumentItem)

  item.records.push({
    person: CURRENT_USER,
    action: payload.action,
    opinion: payload.opinion || '',
    time: nowFull(),
  })
  const allDone = item.recipients.every((p) => item.records.some((rec) => rec.person === p))
  if (allDone) item.status = 'completed'
  return mockResponse(item)
}
