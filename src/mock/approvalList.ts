// src/mock/approvalList.ts
// 审批列表 mock 数据层 — 所有审批记录（含已完成/处理中）
import type { Result } from '@/http'
import { mockResponse } from '@/mock'

// ======== 枚举与类型 ========

export type ApprovalCategory =
  | 'sale_order'       // 销售订单
  | 'purchase_order'   // 采购订单
  | 'expense'          // 费用报销
  | 'goods_payment'    // 货款
  | 'purchase_contract' // 采购合同
  | 'refund'           // 退款
  | 'salary'           // 工资

// 审批状态：当前页面发起、审批、终审、审批结束
export type ApprovalStatus =
  | 'initiated'   // 当前页面发起（发起中，可编辑/删除）
  | 'approving'   // 审批中
  | 'final_audit' // 终审中
  | 'finished'    // 审批结束（通过/驳回/返回上一级均视作结束）

export type ApprovalResult =
  | '-'           // 未处理
  | '同意'
  | '驳回'
  | '返回上一级'
  | '已撤回'

export interface ApprovalStepRecord {
  time: string
  approver: string
  result: ApprovalResult
  opinion: string
}

export interface ApprovalList {
  id: string
  code: string                          // 编号
  orderNo: string                       // 订单编号
  companyName: string                   // 公司名
  payee: string                         // 收款人/单位
  approvalAmount: number                // 审批金额
  currency: string                      // 币种
  category: ApprovalCategory            // 分类
  currentApprover: string               // 当前审批人
  lastResult: ApprovalResult            // 最近审批结果
  lastOpinion: string                   // 最近审批意见
  initiator: string                     // 发起人
  createTime: string                    // 发起时间
  status: ApprovalStatus                // 状态（用于Tab筛选）
  steps: ApprovalStepRecord[]           // 审批历史记录
  // 各分类私有字段（详情页用，新增/编辑时用到）
  formData: Record<string, any>
}

export interface ApprovalAddForm {
  category: ApprovalCategory
  [key: string]: any
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

export const statusOptions = [
  { label: '当前页面发起', value: 'initiated' },
  { label: '审批', value: 'approving' },
  { label: '终审', value: 'final_audit' },
  { label: '审批结束', value: 'finished' },
]

export const statusMap: Record<ApprovalStatus, string> = {
  initiated: '当前页面发起',
  approving: '审批',
  final_audit: '终审',
  finished: '审批结束',
}

export const statusTagTypeMap: Record<ApprovalStatus, 'primary' | 'warning' | 'success' | 'info' | 'danger'> = {
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

export const currencyOptions = [
  { label: '人民币', value: '人民币' },
  { label: '美元', value: '美元' },
  { label: '欧元', value: '欧元' },
  { label: '港元', value: '港元' },
  { label: '日元', value: '日元' },
]

export const initiatorOptions = [
  { label: '小黄', value: '小黄' },
  { label: '小杨', value: '小杨' },
  { label: '小北', value: '小北' },
  { label: '小戴', value: '小戴' },
  { label: '蓝欣怡', value: '蓝欣怡' },
  { label: '刘佳怡', value: '刘佳怡' },
  { label: '业务员', value: '业务员' },
]

export const approverOptions = [
  { label: 'C用户', value: 'C用户' },
  { label: '主理人', value: '主理人' },
  { label: 'B用户', value: 'B用户' },
  { label: '吴敏', value: '吴敏' },
  { label: '何雪梅', value: '何雪梅' },
]

const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ')

// ======== 工具函数 ========

export function getCategoryLabel(cat: ApprovalCategory): string {
  return categoryMap[cat] || cat
}

export function getStatusLabel(s: ApprovalStatus): string {
  return statusMap[s] || s
}

// 数字转中文大写金额（简化版）
export function numberToChinese(num: number): string {
  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const units = ['', '拾', '佰', '仟', '万', '拾', '佰', '仟', '亿']
  if (!num || num === 0) return '零元'
  const intPart = Math.floor(num)
  const decPart = Math.round((num - intPart) * 100)
  let result = ''
  const intStr = String(intPart)
  for (let i = 0; i < intStr.length; i++) {
    const n = Number(intStr[i])
    const unitIdx = intStr.length - 1 - i
    if (n === 0) {
      if (!result.endsWith('零')) result += '零'
    } else {
      result += digits[n] + units[unitIdx]
    }
  }
  result = result.replace(/零+$/, '') + '元'
  if (decPart > 0) {
    const jiao = Math.floor(decPart / 10)
    const fen = decPart % 10
    if (jiao > 0) result += digits[jiao] + '角'
    if (fen > 0) result += digits[fen] + '分'
  }
  return result || '零元'
}

const mockApprovalList: ApprovalList[] = [
  // 1. 费用报销 - 返回上一级（审批结束）
  {
    id: 'AL001',
    code: '41503',
    orderNo: 'FR2026062201',
    companyName: '示例市众鑫达虚拟贸易有限公司',
    payee: '测试市优购多信息科技合伙企业（有限合伙）',
    approvalAmount: 5000,
    currency: '人民币',
    category: 'expense',
    currentApprover: 'C用户',
    lastResult: '返回上一级',
    lastOpinion: '-',
    initiator: '小黄',
    createTime: '2026-06-22 11:44:13',
    status: 'finished',
    steps: [
      { time: '2026-06-22 11:45:00', approver: 'C用户', result: '返回上一级', opinion: '请补充发票复印件' },
    ],
    formData: {
      expenseType: '其他',
      businessOwner: '',
      payee: '测试市优购多信息科技合伙企业（有限合伙）',
      amount: 5000,
      bankName: '示例村镇银行虚拟分理处',
      accountNo: '6228 4800 **** **** 0001',
      content: '往来款',
      title: '示例市众鑫达虚拟贸易有限公司',
      applicant: '小黄',
      orderNo: '',
      remark: '',
      payCompany: '',
      currencyType: '人民币',
      attachment: '',
    },
  },
  // 2. 货款 - 同意（审批结束）
  {
    id: 'AL002',
    code: '41492',
    orderNo: 'Fa-20260618-03',
    companyName: '示例市众鑫达虚拟贸易有限公司',
    payee: '演示市运通达货物运输代理服务部',
    approvalAmount: 600,
    currency: '人民币',
    category: 'goods_payment',
    currentApprover: '主理人',
    lastResult: '同意',
    lastOpinion: '-',
    initiator: '小杨',
    createTime: '2026-06-22 11:22:38',
    status: 'finished',
    steps: [
      { time: '2026-06-18 14:45:33', approver: 'C用户', result: '同意', opinion: 'OK' },
      { time: '2026-06-18 15:47:18', approver: 'B用户', result: '同意', opinion: '同意' },
      { time: '2026-06-22 11:22:38', approver: '主理人', result: '同意', opinion: '安排付款' },
    ],
    formData: {
      applyNo: 'Fa-20260618-03',
      relateOrderNo: 'PO-20260429-01*SS-20260429-01*1784',
      applicant: '小杨',
      paymentType: '运输费（内陆、出口、港杂）',
      payCompany: '示例市众鑫达虚拟贸易有限公司',
      payMethod: '银行电汇',
      advance: 0,
      midPayment: 0,
      tailPayment: 0,
      payee: '演示市运通达货物运输代理服务部',
      payeeAccount: '6217 0000 **** **** 0002',
      payeeBank: '虚构商业银行示例路支行',
      applyAmount: 600,
      currencyType: '人民币',
      expectedPayTime: '2026-06-18',
      modifyTime: '2026-06-18 14:39:31',
      remark: '客户尾款收到，需要电放提单',
      rmbRate: 0,
      rmbAmount: 0,
    },
  },
  // 3. 销售订单 - 同意（审批结束）
  {
    id: 'AL003',
    code: '41491',
    orderNo: 'SS-20260611-01',
    companyName: '--',
    payee: '-',
    approvalAmount: 560,
    currency: '美元',
    category: 'sale_order',
    currentApprover: '主理人',
    lastResult: '同意',
    lastOpinion: '-',
    initiator: '小北',
    createTime: '2026-06-22 11:22:27',
    status: 'finished',
    steps: [
      { time: '2026-06-15 09:10:00', approver: 'C用户', result: '同意', opinion: '同意' },
      { time: '2026-06-18 10:20:00', approver: 'B用户', result: '同意', opinion: '同意' },
      { time: '2026-06-22 11:22:27', approver: '主理人', result: '同意', opinion: '确认' },
    ],
    formData: {
      saleOrderNo: 'SS-20260611-01',
      customerName: '境外虚拟客户A（演示数据）',
      applicant: '小北',
      saleType: '外销PI',
      productSummary: '定制U盘300个、水晶摆件100个',
      totalAmount: 560,
      currencyType: '美元',
      expectDeliverTime: '2026-07-10',
      payTerm: '信用证结算',
      remark: '客户指定货代',
    },
  },
  // 4. 费用报销 - 同意（审批结束）
  {
    id: 'AL004',
    code: '41484',
    orderNo: 'FR2026060904',
    companyName: '示例市众鑫达虚拟贸易有限公司',
    payee: '小戴',
    approvalAmount: 20000,
    currency: '人民币',
    category: 'expense',
    currentApprover: '主理人',
    lastResult: '同意',
    lastOpinion: '-',
    initiator: '小戴',
    createTime: '2026-06-18 17:41:30',
    status: 'finished',
    steps: [
      { time: '2026-06-18 14:00:00', approver: 'C用户', result: '同意', opinion: '符合标准' },
      { time: '2026-06-18 16:00:00', approver: 'B用户', result: '同意', opinion: '同意' },
      { time: '2026-06-18 17:41:30', approver: '主理人', result: '同意', opinion: 'OK' },
    ],
    formData: {
      expenseType: '差旅费',
      businessOwner: '销售二部',
      payee: '小戴',
      amount: 20000,
      bankName: '测试银行示例市虚拟园区支行',
      accountNo: '6225 8800 **** **** 0003',
      content: '展会差旅：机票+酒店+展位费',
      title: '示例市众鑫达虚拟贸易有限公司',
      applicant: '小戴',
      orderNo: 'BT-20260601',
      remark: '参加示例市国际礼品展销会',
      payCompany: '',
      currencyType: '人民币',
      attachment: '',
    },
  },
  // 5. 采购合同 - 同意（审批结束）
  {
    id: 'AL006',
    code: '41482',
    orderNo: 'PO-20260618-04*SS-20260618-01*1823',
    companyName: '--',
    payee: '-',
    approvalAmount: 112500,
    currency: '美元',
    category: 'purchase_contract',
    currentApprover: '主理人',
    lastResult: '同意',
    lastOpinion: '-',
    initiator: '小杨',
    createTime: '2026-06-18 17:40:54',
    status: 'finished',
    steps: [
      { time: '2026-06-18 14:10:00', approver: 'C用户', result: '同意', opinion: 'OK' },
      { time: '2026-06-18 16:30:00', approver: 'B用户', result: '同意', opinion: '条款无误' },
      { time: '2026-06-18 17:40:54', approver: '主理人', result: '同意', opinion: '签署' },
    ],
    formData: {
      contractNo: 'PO-20260618-04',
      relateNo: 'SS-20260618-01*1823',
      applicant: '小杨',
      supplier: '演示市鑫联和采购服务有限公司',
      contractType: '原材料采购',
      totalAmount: 112500,
      currencyType: '美元',
      payTerm: '30%预付，70%见提单副本',
      deliverTerm: '收到预付款后30天内交货',
      expectedSignTime: '2026-06-20',
      remark: '年度框架合同下的具体批次（演示数据）',
    },
  },
  // 6. 采购订单 - 当前页面发起
  {
    id: 'AL007',
    code: '41480',
    orderNo: 'PO-20260618-04',
    companyName: '--',
    payee: '-',
    approvalAmount: 112500,
    currency: '美元',
    category: 'purchase_order',
    currentApprover: '-',
    lastResult: '-',
    lastOpinion: '-',
    initiator: '小杨',
    createTime: '2026-06-18 17:29:35',
    status: 'initiated',
    steps: [],
    formData: {
      purchaseOrderNo: 'PO-20260618-04',
      applicant: '小杨',
      supplier: '演示市鑫联和采购服务有限公司',
      productSummary: '真皮手提包500个、双肩背包500个',
      totalAmount: 112500,
      currencyType: '美元',
      expectReceiveTime: '2026-07-25',
      warehouse: '虚拟保税仓A区',
      remark: '用于外销订单SO-20260701（演示数据）',
    },
  },
  // 7. 退款 - 审批中
  {
    id: 'AL010',
    code: '41477',
    orderNo: 'RT-20260618-001',
    companyName: '示例市众鑫达虚拟贸易有限公司',
    payee: '小戴',
    approvalAmount: 3500,
    currency: '人民币',
    category: 'refund',
    currentApprover: 'C用户',
    lastResult: '-',
    lastOpinion: '-',
    initiator: '小戴',
    createTime: '2026-06-18 17:23:52',
    status: 'approving',
    steps: [],
    formData: {
      refundNo: 'RT-20260618-001',
      relateOrderNo: 'SO20260520008',
      applicant: '小戴',
      refundType: '多收货款退回',
      customerName: '演示市中汇联商业服务合作社',
      payee: '演示市中汇联商业服务合作社',
      payeeAccount: '6222 0200 **** **** 0004',
      payeeBank: '虚构储蓄银行虚拟支行',
      refundAmount: 3500,
      currencyType: '人民币',
      reason: '订单SO20260520008多收款退还（演示数据）',
      remark: '客户重复支付部分退还',
    },
  },
  // 8. 工资 - 终审中
  {
    id: 'AL011',
    code: '41476',
    orderNo: 'SA-20260825-001',
    companyName: '示例市众鑫达虚拟贸易有限公司',
    payee: '销售部全体人员',
    approvalAmount: 328500,
    currency: '人民币',
    category: 'salary',
    currentApprover: '主理人',
    lastResult: '同意',
    lastOpinion: '-',
    initiator: '刘佳怡',
    createTime: '2026-08-25 10:18:25',
    status: 'final_audit',
    steps: [
      { time: '2026-08-25 11:00:00', approver: 'C用户', result: '同意', opinion: 'HR已复核' },
      { time: '2026-08-25 14:30:00', approver: 'B用户', result: '同意', opinion: '财务数据核对无误' },
    ],
    formData: {
      salaryNo: 'SA-20260825-001',
      period: '2026年7月',
      applicant: '刘佳怡',
      dept: '销售部',
      employeeCount: 42,
      baseSalary: 210000,
      performance: 80000,
      bonus: 28500,
      allowance: 10000,
      totalAmount: 328500,
      currencyType: '人民币',
      expectedPayTime: '2026-08-28',
      remark: '7月销售提成发放（演示数据）',
    },
  },
  // 9. 当前页面发起 - 退款
  {
    id: 'AL012',
    code: '41475',
    orderNo: 'RT-20260827-001',
    companyName: '示例市众鑫达虚拟贸易有限公司',
    payee: '示例市新纪元进出口贸易商行',
    approvalAmount: 52000,
    currency: '港元',
    category: 'refund',
    currentApprover: '-',
    lastResult: '-',
    lastOpinion: '-',
    initiator: '业务员',
    createTime: '2026-08-27 09:30:10',
    status: 'initiated',
    steps: [],
    formData: {
      refundNo: 'RT-20260827-001',
      relateOrderNo: 'SO20260801003',
      applicant: '业务员',
      refundType: '订单取消退款',
      customerName: '示例市新纪元进出口贸易商行',
      payee: '示例市新纪元进出口贸易商行',
      payeeAccount: '888-0000-****-012',
      payeeBank: '虚拟国际银行境外演示分理处',
      refundAmount: 52000,
      currencyType: '港元',
      reason: '客户取消外销订单SO20260801003（演示数据）',
      remark: '订金全额退还',
    },
  },
  // 10. 采购订单 - 审批中
  {
    id: 'AL013',
    code: '41474',
    orderNo: 'PO-20260827-001',
    companyName: '--',
    payee: '-',
    approvalAmount: 68000,
    currency: '人民币',
    category: 'purchase_order',
    currentApprover: 'C用户',
    lastResult: '-',
    lastOpinion: '-',
    initiator: '蓝欣怡',
    createTime: '2026-08-27 10:05:40',
    status: 'approving',
    steps: [],
    formData: {
      purchaseOrderNo: 'PO-20260827-001',
      applicant: '蓝欣怡',
      supplier: '演示市新云仓皮具材料加工坊',
      productSummary: '头层牛皮1000尺、PU面料500码',
      totalAmount: 68000,
      currencyType: '人民币',
      expectReceiveTime: '2026-09-05',
      warehouse: '虚拟南区一号仓',
      remark: '月度常规补货（演示数据）',
    },
  },
]

const approvalListStore: ApprovalList[] = JSON.parse(JSON.stringify(mockApprovalList))
let nextNum = approvalListStore.length + 1
const nextCodeBase = 41473

// ======== 接口 ========

/** 分页查询 */
export function getApprovalListPage(params: {
  page: number
  pageSize: number
  orderNo?: string
  category?: ApprovalCategory | ''
  initiator?: string
  status?: ApprovalStatus | 'all'
}): Promise<Result<{ list: ApprovalList[]; total: number }>> {
  let filtered = [...approvalListStore]

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

  if (params.initiator) {
    filtered = filtered.filter((c) => c.initiator === params.initiator)
  }

  if (params.status && params.status !== 'all') {
    filtered = filtered.filter((c) => c.status === params.status)
  }

  filtered.sort((a, b) => b.createTime.localeCompare(a.createTime))

  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: filtered.slice(start, start + params.pageSize), total })
}

/** 根据ID获取详情 */
export function getApprovalById(id: string): Promise<Result<ApprovalList>> {
  const item = approvalListStore.find((c) => c.id === id)
  return mockResponse(item || ({} as ApprovalList))
}

/** 新增审批 */
export function addApproval(data: ApprovalAddForm): Promise<Result<ApprovalList>> {
  const cat = data.category
  const catPrefixMap: Record<ApprovalCategory, string> = {
    sale_order: 'SS-',
    purchase_order: 'PO-',
    expense: 'FR-',
    goods_payment: 'Fa-',
    purchase_contract: 'PC-',
    refund: 'RT-',
    salary: 'SA-',
  }
  const prefix = catPrefixMap[cat] || 'AP-'
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const orderNo = `${prefix}${dateStr}-${String(nextNum).padStart(2, '0')}`
  const code = String(nextCodeBase + nextNum)
  nextNum++

  const initiator = data.formData?.applicant || data.applicant || '未填写'
  const amount = Number(
    data.formData?.amount ||
    data.formData?.applyAmount ||
    data.formData?.totalAmount ||
    data.formData?.refundAmount ||
    0
  )
  const currency =
    data.formData?.currencyType ||
    data.formData?.currency ||
    '人民币'
  const payee = data.formData?.payee || '-'
  const companyName =
    data.formData?.title ||
    data.formData?.payCompany ||
    data.formData?.companyName ||
    '--'

  const newItem: ApprovalList = {
    id: 'AL' + String(1000 + approvalListStore.length),
    code,
    orderNo,
    companyName,
    payee,
    approvalAmount: amount,
    currency,
    category: cat,
    currentApprover: '-',
    lastResult: '-',
    lastOpinion: '-',
    initiator,
    createTime: now(),
    status: 'initiated',
    steps: [],
    formData: { ...data.formData, category: cat },
  }
  approvalListStore.push(newItem)
  return mockResponse(newItem)
}

/** 更新审批（仅当前页面发起状态可编辑） */
export function updateApproval(id: string, data: ApprovalAddForm): Promise<Result<ApprovalList>> {
  const index = approvalListStore.findIndex((c) => c.id === id)
  if (index === -1) return mockResponse({} as ApprovalList)
  const orig = approvalListStore[index]
  if (orig.status !== 'initiated') {
    return Promise.reject(new Error('仅当前页面发起状态的记录可编辑'))
  }
  const amount = Number(
    data.formData?.amount ||
    data.formData?.applyAmount ||
    data.formData?.totalAmount ||
    data.formData?.refundAmount ||
    orig.approvalAmount
  )
  const updated: ApprovalList = {
    ...orig,
    approvalAmount: amount,
    currency: data.formData?.currencyType || data.formData?.currency || orig.currency,
    payee: data.formData?.payee || orig.payee,
    companyName:
      data.formData?.title ||
      data.formData?.payCompany ||
      data.formData?.companyName ||
      orig.companyName,
    initiator: data.formData?.applicant || data.applicant || orig.initiator,
    formData: { ...orig.formData, ...data.formData },
  }
  approvalListStore[index] = updated
  return mockResponse(updated)
}

/** 删除审批（仅当前页面发起状态可删除） */
export function deleteApproval(id: string): Promise<Result<boolean>> {
  const index = approvalListStore.findIndex((c) => c.id === id)
  if (index === -1) return mockResponse(true)
  const item = approvalListStore[index]
  if (item.status !== 'initiated') {
    return Promise.reject(new Error('仅当前页面发起状态的记录可删除'))
  }
  approvalListStore.splice(index, 1)
  return mockResponse(true)
}

/** 状态统计 */
export function getStatusCounts(): Promise<Result<Record<string, number>>> {
  const counts: Record<string, number> = {
    all: approvalListStore.length,
    initiated: 0,
    approving: 0,
    final_audit: 0,
    finished: 0,
  }
  approvalListStore.forEach((item) => {
    counts[item.status] = (counts[item.status] || 0) + 1
  })
  return mockResponse(counts)
}
