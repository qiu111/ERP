// src/mock/approvalMyRelated.ts
// 我参与的审批 / 我发起的审批 mock 数据层（全部脱敏虚构）
import type { Result } from '@/http'
import { mockResponse } from '@/mock'

// ======== 枚举与类型 ========

export type ApprovalCategory =
  | 'sale_order'
  | 'purchase_order'
  | 'expense'
  | 'goods_payment'
  | 'purchase_contract'
  | 'refund'
  | 'salary'

export type ApprovalStatus =
  | 'initiated'
  | 'approving'
  | 'final_audit'
  | 'finished'

export type ApprovalResult = '-' | '同意' | '驳回' | '返回上一级' | '已撤回'

export interface ApprovalStepRecord {
  time: string
  approver: string
  result: ApprovalResult
  opinion: string
}

// 我参与的审批 - 列表项
export interface MyParticipationItem {
  id: string
  code: string
  orderNo: string
  companyName: string
  payee: string
  approvalAmount: number
  currency: string
  category: ApprovalCategory
  currentApprover: string
  lastResult: ApprovalResult
  lastOpinion: string
  initiator: string
  createTime: string
  // 已审批人的信息（我作为参与者）
  myResult: ApprovalResult
  myOpinion: string
  steps: ApprovalStepRecord[]
  formData: Record<string, any>
}

// 我发起的审批 - 列表项（额外含销售类型/采购类型列）
export interface MyInitiationItem {
  id: string
  code: string
  orderNo: string
  category: ApprovalCategory
  approvalAmount: number
  currency: string
  saleType: string      // 销售类型（仅销售类有值，其他"-"）
  purchaseType: string  // 采购类型（仅采购类有值，其他"-"）
  status: ApprovalStatus
  initiator: string
  createTime: string
  steps: ApprovalStepRecord[]
  formData: Record<string, any>
}

// ======== 常量映射 ========

export const categoryOptions = [
  { label: '采购订单', value: 'purchase_order' },
  { label: '货款', value: 'goods_payment' },
  { label: '销售订单', value: 'sale_order' },
  { label: '采购合同', value: 'purchase_contract' },
  { label: '费用报销', value: 'expense' },
  { label: '退款', value: 'refund' },
  { label: '工资', value: 'salary' },
]

export const categoryMap: Record<ApprovalCategory, string> = {
  purchase_order: '采购订单',
  goods_payment: '货款',
  sale_order: '销售订单',
  purchase_contract: '采购合同',
  expense: '费用报销',
  refund: '退款',
  salary: '工资',
}

export const statusMap: Record<ApprovalStatus, string> = {
  initiated: '当前页面发起',
  approving: '审批',
  final_audit: '终审',
  finished: '审批结束',
}

export const statusTagTypeMap: Record<ApprovalStatus, 'primary' | 'warning' | 'success' | 'info'> = {
  initiated: 'primary',
  approving: 'warning',
  final_audit: 'warning',
  finished: 'success',
}

export const resultTagTypeMap: Record<ApprovalResult, 'success' | 'danger' | 'warning' | 'info'> = {
  '-': 'info',
  '同意': 'success',
  '驳回': 'danger',
  '返回上一级': 'warning',
  '已撤回': 'warning',
}

export function getCategoryLabel(c: ApprovalCategory): string {
  return categoryMap[c] || c
}

export function getStatusLabel(s: ApprovalStatus): string {
  return statusMap[s] || s
}

// ======== 当前登录用户（虚拟） ========
// 在真实系统中通过权限系统获取；此处固定一位审批人+一位发起人演示
const CURRENT_USER_AS_APPROVER = 'C用户'   // 作为「我参与的审批」的审批人匹配
const CURRENT_USER_AS_INITIATOR = 'A用户' // 作为「我发起的审批」的发起人匹配

// ======== Mock数据：我参与的审批（6条） ========
const mockMyParticipation: MyParticipationItem[] = [
  {
    id: 'MP001',
    code: 'MP-41503',
    orderNo: 'FR-20260622-01',
    companyName: '示例市众鑫达虚拟贸易有限公司（演示数据）',
    payee: '测试市优购多信息科技合伙企业（演示数据）',
    approvalAmount: 5000,
    currency: '人民币',
    category: 'expense',
    currentApprover: '主理人',
    lastResult: '返回上一级',
    lastOpinion: '请补充发票复印件',
    initiator: '业务员B',
    createTime: '2026-06-22 11:44:13',
    myResult: '返回上一级',
    myOpinion: '请补充发票复印件',
    steps: [
      { time: '2026-06-22 11:45:00', approver: 'C用户', result: '返回上一级', opinion: '请补充发票复印件' },
    ],
    formData: { expenseType: '其他', content: '往来款（演示数据）' },
  },
  {
    id: 'MP002',
    code: 'MP-41492',
    orderNo: 'Fa-20260618-03',
    companyName: '示例市众鑫达虚拟贸易有限公司（演示数据）',
    payee: '演示市运通达货物运输代理服务部（演示数据）',
    approvalAmount: 600,
    currency: '人民币',
    category: 'goods_payment',
    currentApprover: '主理人',
    lastResult: '同意',
    lastOpinion: 'OK',
    initiator: '业务员B',
    createTime: '2026-06-18 14:39:33',
    myResult: '同意',
    myOpinion: 'OK',
    steps: [
      { time: '2026-06-18 14:45:33', approver: 'C用户', result: '同意', opinion: 'OK' },
      { time: '2026-06-18 15:47:18', approver: 'B用户', result: '同意', opinion: '同意' },
    ],
    formData: { applyNo: 'Fa-20260618-03', paymentType: '运输费（演示）' },
  },
  {
    id: 'MP003',
    code: 'MP-41491',
    orderNo: 'SS-20260611-01',
    companyName: '--',
    payee: '-',
    approvalAmount: 560,
    currency: '美元',
    category: 'sale_order',
    currentApprover: '主理人',
    lastResult: '同意',
    lastOpinion: '同意',
    initiator: '业务员C',
    createTime: '2026-06-15 09:08:27',
    myResult: '同意',
    myOpinion: '同意',
    steps: [
      { time: '2026-06-15 09:10:00', approver: 'C用户', result: '同意', opinion: '同意' },
    ],
    formData: { saleOrderNo: 'SS-20260611-01', saleType: '外销PI（演示）' },
  },
  {
    id: 'MP004',
    code: 'MP-41484',
    orderNo: 'FR-20260609-04',
    companyName: '示例市众鑫达虚拟贸易有限公司（演示数据）',
    payee: '业务员A',
    approvalAmount: 20000,
    currency: '人民币',
    category: 'expense',
    currentApprover: '主理人',
    lastResult: '同意',
    lastOpinion: '符合标准',
    initiator: '业务员A',
    createTime: '2026-06-18 13:55:40',
    myResult: '同意',
    myOpinion: '符合标准',
    steps: [
      { time: '2026-06-18 14:00:00', approver: 'C用户', result: '同意', opinion: '符合标准' },
    ],
    formData: { expenseType: '差旅费', content: '展会差旅（演示数据）' },
  },
  {
    id: 'MP005',
    code: 'MP-41482',
    orderNo: 'PO-20260618-04',
    companyName: '--',
    payee: '-',
    approvalAmount: 112500,
    currency: '美元',
    category: 'purchase_contract',
    currentApprover: '主理人',
    lastResult: '同意',
    lastOpinion: '条款无误',
    initiator: '业务员B',
    createTime: '2026-06-18 14:05:32',
    myResult: '同意',
    myOpinion: 'OK',
    steps: [
      { time: '2026-06-18 14:10:00', approver: 'C用户', result: '同意', opinion: 'OK' },
      { time: '2026-06-18 16:30:00', approver: 'B用户', result: '同意', opinion: '条款无误' },
    ],
    formData: { contractNo: 'PO-20260618-04', contractType: '原材料采购（演示）' },
  },
  {
    id: 'MP006',
    code: 'MP-41477',
    orderNo: 'RT-20260618-001',
    companyName: '示例市众鑫达虚拟贸易有限公司（演示数据）',
    payee: '业务员A',
    approvalAmount: 3500,
    currency: '人民币',
    category: 'refund',
    currentApprover: 'C用户',
    lastResult: '-',
    lastOpinion: '-',
    initiator: '业务员A',
    createTime: '2026-06-18 17:23:52',
    myResult: '-',
    myOpinion: '-',
    steps: [],
    formData: { refundNo: 'RT-20260618-001', refundType: '多收货款退回（演示）' },
  },
]

// ======== Mock数据：我发起的审批（6条） ========
const mockMyInitiation: MyInitiationItem[] = [
  {
    id: 'MI001',
    code: 'MI-41503',
    orderNo: 'FR-20260622-01',
    category: 'expense',
    approvalAmount: 5000,
    currency: '人民币',
    saleType: '-',
    purchaseType: '-',
    status: 'finished',
    initiator: 'A用户',
    createTime: '2026-06-22 11:44:13',
    steps: [
      { time: '2026-06-22 11:45:00', approver: 'C用户', result: '返回上一级', opinion: '请补充发票复印件' },
    ],
    formData: { expenseType: '其他', content: '往来款（我发起演示）' },
  },
  {
    id: 'MI002',
    code: 'MI-41492',
    orderNo: 'Fa-20260618-03',
    category: 'goods_payment',
    approvalAmount: 600,
    currency: '人民币',
    saleType: '-',
    purchaseType: '-',
    status: 'finished',
    initiator: 'A用户',
    createTime: '2026-06-18 14:39:33',
    steps: [
      { time: '2026-06-18 14:45:33', approver: 'C用户', result: '同意', opinion: 'OK' },
    ],
    formData: { paymentType: '运输费（我发起演示）' },
  },
  {
    id: 'MI003',
    code: 'MI-41482',
    orderNo: 'PO-20260618-04',
    category: 'purchase_order',
    approvalAmount: 112500,
    currency: '美元',
    saleType: '-',
    purchaseType: '原材料常规采购',
    status: 'initiated',
    initiator: 'A用户',
    createTime: '2026-06-18 17:29:35',
    steps: [],
    formData: { purchaseOrderNo: 'PO-20260618-04', supplier: '演示市鑫联和采购服务有限公司（演示数据）' },
  },
  {
    id: 'MI004',
    code: 'MI-41481',
    orderNo: 'SS-20260620-02',
    category: 'sale_order',
    approvalAmount: 36800,
    currency: '人民币',
    saleType: '内销正式合同',
    purchaseType: '-',
    status: 'approving',
    initiator: 'A用户',
    createTime: '2026-06-20 10:12:08',
    steps: [
      { time: '2026-06-20 10:20:00', approver: 'C用户', result: '同意', opinion: '同意' },
    ],
    formData: { saleOrderNo: 'SS-20260620-02', customerName: '演示市虚拟采购客户A（演示数据）' },
  },
  {
    id: 'MI005',
    code: 'MI-41476',
    orderNo: 'SA-20260825-001',
    category: 'salary',
    approvalAmount: 328500,
    currency: '人民币',
    saleType: '-',
    purchaseType: '-',
    status: 'final_audit',
    initiator: 'A用户',
    createTime: '2026-08-25 10:18:25',
    steps: [
      { time: '2026-08-25 11:00:00', approver: 'C用户', result: '同意', opinion: 'HR已复核' },
    ],
    formData: { period: '2026年7月（我发起）', dept: '销售部', employeeCount: 42 },
  },
  {
    id: 'MI006',
    code: 'MI-41475',
    orderNo: 'RT-20260827-001',
    category: 'refund',
    approvalAmount: 52000,
    currency: '港元',
    saleType: '-',
    purchaseType: '-',
    status: 'initiated',
    initiator: 'A用户',
    createTime: '2026-08-27 09:30:10',
    steps: [],
    formData: { refundType: '订单取消退款（我发起演示）', reason: '客户取消外销订单（演示）' },
  },
]

// ======== Store（内存） ========
const participationStore: MyParticipationItem[] = JSON.parse(JSON.stringify(mockMyParticipation))
const initiationStore: MyInitiationItem[] = JSON.parse(JSON.stringify(mockMyInitiation))

// ======== 接口 ========

/** 我参与的审批 分页 */
export function getMyParticipationPage(params: {
  page: number
  pageSize: number
  orderNo?: string
  category?: ApprovalCategory | ''
}): Promise<Result<{ list: MyParticipationItem[]; total: number }>> {
  let filtered = [...participationStore]

  if (params.orderNo) {
    const kw = params.orderNo.toLowerCase()
    filtered = filtered.filter(
      (c) =>
        c.orderNo.toLowerCase().includes(kw) ||
        c.code.toLowerCase().includes(kw)
    )
  }
  if (params.category) {
    filtered = filtered.filter((c) => c.category === params.category)
  }
  // 只保留当前登录用户（C用户）作为审批人出现在步骤中、或当前审批人是我的记录
  filtered = filtered.filter(
    (c) =>
      c.steps.some((s) => s.approver === CURRENT_USER_AS_APPROVER) ||
      c.currentApprover === CURRENT_USER_AS_APPROVER
  )
  filtered.sort((a, b) => b.createTime.localeCompare(a.createTime))

  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: filtered.slice(start, start + params.pageSize), total })
}

/** 我参与的审批 详情 */
export function getMyParticipationById(id: string): Promise<Result<MyParticipationItem>> {
  const item = participationStore.find((c) => c.id === id)
  return mockResponse(item || ({} as MyParticipationItem))
}

/** 我发起的审批 分页 */
export function getMyInitiationPage(params: {
  page: number
  pageSize: number
  orderNo?: string
  category?: ApprovalCategory | ''
}): Promise<Result<{ list: MyInitiationItem[]; total: number }>> {
  let filtered = [...initiationStore]

  if (params.orderNo) {
    const kw = params.orderNo.toLowerCase()
    filtered = filtered.filter(
      (c) =>
        c.orderNo.toLowerCase().includes(kw) ||
        c.code.toLowerCase().includes(kw)
    )
  }
  if (params.category) {
    filtered = filtered.filter((c) => c.category === params.category)
  }
  // 只保留当前登录用户（A用户）发起的
  filtered = filtered.filter((c) => c.initiator === CURRENT_USER_AS_INITIATOR)
  filtered.sort((a, b) => b.createTime.localeCompare(a.createTime))

  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: filtered.slice(start, start + params.pageSize), total })
}

/** 我发起的审批 详情 */
export function getMyInitiationById(id: string): Promise<Result<MyInitiationItem>> {
  const item = initiationStore.find((c) => c.id === id)
  return mockResponse(item || ({} as MyInitiationItem))
}

/** 暴露给测试读取的常量（方便脱敏验证等） */
export const TEST_CONSTANTS = {
  CURRENT_USER_AS_APPROVER,
  CURRENT_USER_AS_INITIATOR,
  PARTICIPATION_TOTAL: mockMyParticipation.length,
  INITIATION_TOTAL: mockMyInitiation.length,
}
