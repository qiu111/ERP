// src/mock/reception.ts
// 接待管理 Mock 数据层：待我审批接待 + 我发起的接待（全部脱敏虚构）
import type { Result } from '@/http'
import { mockResponse } from '@/mock'

// ======== 枚举与类型 ========

/** 审批状态 */
export type ReceptionStatus = 'pending' | 'approved' | 'rejected'

export const receptionStatusOptions: { label: string; value: ReceptionStatus }[] = [
  { label: '待审批', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' },
]
export function getStatusLabel(v: ReceptionStatus | ''): string {
  return receptionStatusOptions.find((o) => o.value === v)?.label || '-'
}
export const statusTagTypeMap: Record<ReceptionStatus, 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
}

/** 接待类型 */
export type ReceptionType = 'visit' | 'banquet' | 'exhibition' | 'other'

export const receptionTypeOptions: { label: string; value: ReceptionType }[] = [
  { label: '客户来访', value: 'visit' },
  { label: '商务宴请', value: 'banquet' },
  { label: '展会接待', value: 'exhibition' },
  { label: '其他接待', value: 'other' },
]
export function getTypeLabel(v: ReceptionType | ''): string {
  return receptionTypeOptions.find((o) => o.value === v)?.label || '-'
}
export const typeTagTypeMap: Record<ReceptionType, 'primary' | 'warning' | 'success' | 'info'> = {
  visit: 'primary',
  banquet: 'warning',
  exhibition: 'success',
  other: 'info',
}

/** 接待级别 */
export type ReceptionLevel = 'ordinary' | 'important' | 'vip'

export const receptionLevelOptions: { label: string; value: ReceptionLevel }[] = [
  { label: '一般', value: 'ordinary' },
  { label: '重要', value: 'important' },
  { label: '贵宾', value: 'vip' },
]
export function getLevelLabel(v: ReceptionLevel | ''): string {
  return receptionLevelOptions.find((o) => o.value === v)?.label || '-'
}
export const levelTagTypeMap: Record<ReceptionLevel, 'info' | 'warning' | 'danger'> = {
  ordinary: 'info',
  important: 'warning',
  vip: 'danger',
}

/** 接待明细结构 */
export interface ReceptionItem {
  id: string
  code: number
  title: string               // 接待标题/事由
  customerName: string        // 客户名称（脱敏虚构）
  receptionType: ReceptionType
  level: ReceptionLevel
  receptionTime: string       // 接待时间 YYYY-MM-DD HH:mm
  receptionPlace: string      // 接待地点（脱敏虚构）
  host: string                // 接待人
  companions: string          // 陪同人员（脱敏，顿号分隔）
  estimatedCost: number       // 预计费用（元）
  content: string             // 接待事由说明
  remark?: string             // 备注 ≤225 字
  status: ReceptionStatus
  approver: string            // 当前审批人
  approvalOpinion?: string    // 审批意见（已处理时）
  approvalTime?: string       // 审批时间（已处理时）
  submitter: string           // 发起人
  createTime: string          // 发起时间 YYYY-MM-DD HH:mm
}

/** 分页查询参数 */
export interface ReceptionPageParams {
  page: number
  pageSize: number
  keyword?: string            // 标题/客户/地点
  type?: ReceptionType | ''   // 接待类型
  level?: ReceptionLevel | '' // 接待级别
  status?: ReceptionStatus | '' // 审批状态（我发起的接待）
}

/** 审批表单 */
export interface ReceptionApproveForm {
  approvalResult: 'approve' | 'reject'
  approvalOpinion: string
}

// ======== 初始化数据（脱敏） ========

const RAW_INIT: Omit<ReceptionItem, 'id'>[] = [
  {
    code: 1014,
    title: '示例教育机构来访接待（演示数据）',
    customerName: '示例教育',
    receptionType: 'visit',
    level: 'ordinary',
    receptionTime: '2026-09-12 10:00',
    receptionPlace: '示例大厦演示洽谈室',
    host: '小白',
    companions: '小安',
    estimatedCost: 500,
    content: '示例教育机构来访交流虚拟课程合作，安排演示教室参观。',
    status: 'pending',
    approver: '超级管理员',
    submitter: '白主管',
    createTime: '2026-08-27 09:50',
  },
  {
    code: 1013,
    title: '演示餐饮供应商品鉴接待（示例数据）',
    customerName: '演示餐饮',
    receptionType: 'banquet',
    level: 'ordinary',
    receptionTime: '2026-09-11 11:30',
    receptionPlace: '示例食府演示品鉴厅',
    host: '小安',
    companions: '小北',
    estimatedCost: 1200,
    content: '演示餐饮供应商示例菜品品鉴，为虚拟答谢会选样。',
    status: 'pending',
    approver: '超级管理员',
    submitter: '小安',
    createTime: '2026-08-26 18:10',
  },
  {
    code: 1012,
    title: '示例商贸客户来访接待（演示数据）',
    customerName: '示例商贸',
    receptionType: 'visit',
    level: 'important',
    receptionTime: '2026-09-02 09:30',
    receptionPlace: '示例大厦演示接待室',
    host: '超级管理员',
    companions: '小戴、小陈',
    estimatedCost: 3200,
    content: '示例商贸一行 5 人来访，洽谈 Q4 示例产品续单事宜，需安排演示展厅参观与会议室洽谈。',
    remark: '客户源自演示展会留资（示例备注）',
    status: 'pending',
    approver: '超级管理员',
    submitter: '小戴',
    createTime: '2026-08-26 10:15',
  },
  {
    code: 1011,
    title: '演示科技合作洽谈宴请（示例数据）',
    customerName: '演示科技',
    receptionType: 'banquet',
    level: 'vip',
    receptionTime: '2026-09-01 18:00',
    receptionPlace: '示例大酒店演示厅',
    host: '超级管理员',
    companions: '白主管、小北',
    estimatedCost: 5800,
    content: '演示科技高层到访，就虚拟供应链合作框架进行商务宴请，需提前确认示例菜单与席位安排。',
    status: 'pending',
    approver: '超级管理员',
    submitter: '小陈',
    createTime: '2026-08-25 16:40',
  },
  {
    code: 1010,
    title: '虚拟制造工厂参观接待（演示场景）',
    customerName: '虚拟制造',
    receptionType: 'visit',
    level: 'ordinary',
    receptionTime: '2026-08-31 14:00',
    receptionPlace: '示例产业园虚拟车间',
    host: '小白',
    companions: '小安',
    estimatedCost: 800,
    content: '虚拟制造采购团队参观示例生产线，讲解演示工艺流程，安排示例通勤车辆接送。',
    status: 'pending',
    approver: '超级管理员',
    submitter: '小北',
    createTime: '2026-08-25 09:20',
  },
  {
    code: 1009,
    title: '示例物流年度答谢会接待（演示数据）',
    customerName: '示例物流',
    receptionType: 'other',
    level: 'important',
    receptionTime: '2026-09-10 17:30',
    receptionPlace: '演示会展中心示例厅',
    host: '超级管理员',
    companions: '小戴、小白、小陈',
    estimatedCost: 8600,
    content: '示例物流年度答谢会，需布置演示展位、准备示例纪念品并安排虚拟签到环节。',
    remark: '示例纪念品预算单见附件（演示）',
    status: 'pending',
    approver: '超级管理员',
    submitter: '小白',
    createTime: '2026-08-24 15:05',
  },
  {
    code: 1008,
    title: '演示展会客户接待安排（示例数据）',
    customerName: '演示科技',
    receptionType: 'exhibition',
    level: 'ordinary',
    receptionTime: '2026-09-08 10:00',
    receptionPlace: '虚拟会展馆示例展位',
    host: '小安',
    companions: '小北',
    estimatedCost: 1500,
    content: '演示展会期间接待到访示例客户，发放虚拟宣传资料并登记示例意向订单。',
    status: 'pending',
    approver: '超级管理员',
    submitter: '小戴',
    createTime: '2026-08-23 11:30',
  },
  {
    code: 1007,
    title: '示例商贸续约谈判接待（演示数据）',
    customerName: '示例商贸',
    receptionType: 'banquet',
    level: 'vip',
    receptionTime: '2026-09-05 12:00',
    receptionPlace: '示例食府演示包间',
    host: '超级管理员',
    companions: '白主管',
    estimatedCost: 4600,
    content: '示例商贸续约谈判午宴，围绕虚拟价格政策与演示服务条款进行磋商。',
    status: 'pending',
    approver: '超级管理员',
    submitter: '小安',
    createTime: '2026-08-22 17:45',
  },
  {
    code: 1006,
    title: '虚拟零售渠道商来访接待（演示场景）',
    customerName: '虚拟零售',
    receptionType: 'visit',
    level: 'important',
    receptionTime: '2026-08-30 10:30',
    receptionPlace: '示例大厦演示洽谈室',
    host: '小戴',
    companions: '小陈',
    estimatedCost: 2000,
    content: '虚拟零售渠道团队来访，洽谈示例区域代理政策，安排演示产品讲解。',
    status: 'pending',
    approver: '小戴', // 审批人非当前用户：不出现在"待我审批"，出现在"我发起的接待"
    submitter: '超级管理员',
    createTime: '2026-08-21 14:20',
  },
  {
    code: 1005,
    title: '示例咨询公司交流接待（演示数据）',
    customerName: '示例咨询',
    receptionType: 'other',
    level: 'ordinary',
    receptionTime: '2026-08-20 15:00',
    receptionPlace: '演示会议中心示例室',
    host: '小陈',
    companions: '小白',
    estimatedCost: 600,
    content: '示例咨询顾问到访交流虚拟行业方案，安排茶歇与演示材料。',
    remark: '',
    status: 'approved',
    approver: '超级管理员',
    approvalOpinion: '同意，按示例方案执行。',
    approvalTime: '2026-08-19 09:40',
    submitter: '超级管理员',
    createTime: '2026-08-18 10:00',
  },
  {
    code: 1004,
    title: '虚拟设备商考察接待（示例数据）',
    customerName: '虚拟制造',
    receptionType: 'visit',
    level: 'ordinary',
    receptionTime: '2026-08-15 09:00',
    receptionPlace: '示例产业园演示车间',
    host: '小安',
    companions: '白主管、小陈',
    estimatedCost: 900,
    content: '虚拟设备商考察示例产线设备，安排演示讲解与安全须知培训。',
    remark: '',
    status: 'approved',
    approver: '超级管理员',
    approvalOpinion: '同意接待，注意演示安全防护。',
    approvalTime: '2026-08-14 16:25',
    submitter: '超级管理员',
    createTime: '2026-08-13 11:10',
  },
  {
    code: 1003,
    title: '示例金融客户商务宴请（演示数据）',
    customerName: '示例金融',
    receptionType: 'banquet',
    level: 'vip',
    receptionTime: '2026-08-12 18:30',
    receptionPlace: '示例海鲜楼演示厅',
    host: '超级管理员',
    companions: '小北',
    estimatedCost: 9800,
    content: '示例金融客户商务宴请，洽谈虚拟资金合作方案。',
    remark: '',
    status: 'rejected',
    approver: '超级管理员',
    approvalOpinion: '预算超出示例标准，驳回（演示意见）。',
    approvalTime: '2026-08-11 10:50',
    submitter: '超级管理员',
    createTime: '2026-08-10 15:35',
  },
  {
    code: 1002,
    title: '虚拟传媒采访接待（演示场景）',
    customerName: '虚拟传媒',
    receptionType: 'other',
    level: 'ordinary',
    receptionTime: '2026-08-08 14:00',
    receptionPlace: '示例大厦演示发布厅',
    host: '小白',
    companions: '小安、小北',
    estimatedCost: 700,
    content: '虚拟传媒到访采访示例品牌故事，安排演示访谈脚本与场地。',
    remark: '',
    status: 'approved',
    approver: '超级管理员',
    approvalOpinion: '同意，配合演示采访。',
    approvalTime: '2026-08-07 09:15',
    submitter: '超级管理员',
    createTime: '2026-08-06 13:40',
  },
  {
    code: 1001,
    title: '示例展会接待差旅安排（演示数据）',
    customerName: '示例商贸',
    receptionType: 'exhibition',
    level: 'important',
    receptionTime: '2026-08-05 08:30',
    receptionPlace: '虚拟会展馆示例展位',
    host: '小戴',
    companions: '小白、小陈、小安',
    estimatedCost: 7400,
    content: '示例展会接待行程与虚拟差旅安排，含演示交通住宿预案。',
    remark: '',
    status: 'rejected',
    approver: '超级管理员',
    approvalOpinion: '与示例展会档期冲突，驳回。',
    approvalTime: '2026-08-04 17:20',
    submitter: '超级管理员',
    createTime: '2026-08-03 10:25',
  },
]

const store: ReceptionItem[] = RAW_INIT.map((r, i) => ({
  ...r,
  id: `RC_${Date.now()}_${i + 1}`,
}))

const CURRENT_APPROVER = '超级管理员' // 当前登录用户（脱敏）

// ======== 内部过滤辅助 ========

function keywordMatch(row: ReceptionItem, keyword: string): boolean {
  if (!keyword) return true
  const kw = keyword.toLowerCase()
  return (
    row.title.toLowerCase().includes(kw) ||
    row.customerName.toLowerCase().includes(kw) ||
    row.receptionPlace.toLowerCase().includes(kw)
  )
}

function baseFilter(rows: ReceptionItem[], params: ReceptionPageParams): ReceptionItem[] {
  let list = [...rows]
  if (params.type) list = list.filter((r) => r.receptionType === params.type)
  if (params.level) list = list.filter((r) => r.level === params.level)
  if (params.status) list = list.filter((r) => r.status === params.status)
  if (params.keyword) list = list.filter((r) => keywordMatch(r, params.keyword!))
  list.sort((a, b) => b.code - a.code)
  return list
}

function paginate(rows: ReceptionItem[], page: number, pageSize: number): Promise<Result<{ list: ReceptionItem[]; total: number }>> {
  const total = rows.length
  const start = (page - 1) * pageSize
  return mockResponse({ list: rows.slice(start, start + pageSize), total })
}

// ======== 对外接口：待我审批接待 ========

/** 待我审批接待分页（状态=待审批 且 审批人=当前用户） */
export async function getReceptionTodoPage(params: ReceptionPageParams): Promise<Result<{ list: ReceptionItem[]; total: number }>> {
  const rows = baseFilter(
    store.filter((r) => r.status === 'pending' && r.approver === CURRENT_APPROVER),
    params
  )
  return paginate(rows, params.page, params.pageSize)
}

/** 接待类型分类统计（待我审批视角） */
export async function getReceptionTypeCounts(): Promise<Result<Record<string, number>>> {
  const todo = store.filter((r) => r.status === 'pending' && r.approver === CURRENT_APPROVER)
  const counts: Record<string, number> = { all: todo.length }
  receptionTypeOptions.forEach((o) => {
    counts[o.value] = todo.filter((r) => r.receptionType === o.value).length
  })
  return mockResponse(counts)
}

/** 详情 */
export async function getReceptionById(id: string): Promise<Result<ReceptionItem>> {
  const item = store.find((r) => r.id === id)
  return mockResponse(item || ({} as ReceptionItem))
}

/** 单条审批 */
export async function approveReception(id: string, payload: ReceptionApproveForm): Promise<Result<ReceptionItem>> {
  const idx = store.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as ReceptionItem)
  const item = store[idx]
  if (item.status !== 'pending') return mockResponse(item)
  const now = new Date()
  const pad0 = (n: number) => (n < 10 ? `0${n}` : `${n}`)
  store[idx] = {
    ...item,
    status: payload.approvalResult === 'approve' ? 'approved' : 'rejected',
    approvalOpinion: payload.approvalOpinion,
    approvalTime: `${now.getFullYear()}-${pad0(now.getMonth() + 1)}-${pad0(now.getDate())} ${pad0(now.getHours())}:${pad0(now.getMinutes())}`,
  }
  return mockResponse(store[idx])
}

/** 批量审批：返回 { success, failed: [{id, reason}] } */
export async function batchApproveReception(
  ids: string[],
  payload: ReceptionApproveForm
): Promise<Result<{ success: number; failed: { id: string; reason: string }[] }>> {
  let success = 0
  const failed: { id: string; reason: string }[] = []
  for (const id of ids) {
    const idx = store.findIndex((r) => r.id === id)
    if (idx === -1) {
      failed.push({ id, reason: '记录不存在' })
      continue
    }
    if (store[idx].status !== 'pending') {
      failed.push({ id, reason: '该记录已处理，请刷新' })
      continue
    }
    const res = await approveReception(id, payload)
    if (res.code === 200 && res.data.id) success++
    else failed.push({ id, reason: '处理失败' })
  }
  return mockResponse({ success, failed })
}

// ======== 对外接口：我发起的接待 ========

/** 我发起的接待分页（发起人=当前用户） */
export async function getMyReceptionPage(params: ReceptionPageParams): Promise<Result<{ list: ReceptionItem[]; total: number }>> {
  const rows = baseFilter(
    store.filter((r) => r.submitter === CURRENT_APPROVER),
    params
  )
  return paginate(rows, params.page, params.pageSize)
}
