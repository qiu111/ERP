// src/mock/approvalTodo.ts
// 待我审批 mock 数据层
import type { Result } from '@/http'
import { mockResponse } from '@/mock'

// 审批分类枚举
export type ApprovalCategory =
  | 'sale_order'      // 销售订单
  | 'purchase_order'  // 采购订单
  | 'expense'         // 费用报销
  | 'goods_payment'   // 货款
  | 'purchase_contract' // 采购合同
  | 'refund'          // 退款
  | 'salary'          // 工资

// 审批状态
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface ApprovalTodo {
  id: string
  code: string                  // 编号
  title: string                 // 标题
  orderNo: string               // 订单编号
  payeeName: string             // 收款人名称
  approvalAmount: number        // 审批金额
  currency: string              // 币种
  details: string               // 详情
  expectedPayTime: string       // 希望支付时间
  category: ApprovalCategory    // 分类
  settlementApproval: string    // 结算审批
  initiator: string             // 发起人
  initiatorDept: string         // 发起人部门
  createTime: string            // 发起时间
  status: ApprovalStatus        // 状态
  remark: string                // 备注
  attachments?: string[]        // 附件
}

export interface ApprovalTodoForm {
  approvalOpinion: string       // 审批意见
  approvalResult: 'approve' | 'reject' // 审批结果
}

// 分类选项
export const categoryOptions = [
  { label: '销售订单', value: 'sale_order' },
  { label: '采购订单', value: 'purchase_order' },
  { label: '费用报销', value: 'expense' },
  { label: '货款', value: 'goods_payment' },
  { label: '采购合同', value: 'purchase_contract' },
  { label: '退款', value: 'refund' },
  { label: '工资', value: 'salary' },
]

export const categoryMap: Record<ApprovalCategory, string> = {
  sale_order: '销售订单',
  purchase_order: '采购订单',
  expense: '费用报销',
  goods_payment: '货款',
  purchase_contract: '采购合同',
  refund: '退款',
  salary: '工资',
}

// 币种选项
export const currencyOptions = [
  { label: '人民币 (CNY)', value: 'CNY' },
  { label: '美元 (USD)', value: 'USD' },
  { label: '欧元 (EUR)', value: 'EUR' },
  { label: '港元 (HKD)', value: 'HKD' },
  { label: '日元 (JPY)', value: 'JPY' },
]

// 结算审批选项
export const settlementApprovalOptions = [
  { label: '待审核', value: 'pending' },
  { label: '一级审批', value: 'level1' },
  { label: '二级审批', value: 'level2' },
  { label: '三级审批', value: 'level3' },
  { label: '财务审批', value: 'finance' },
]

const settlementApprovalMap: Record<string, string> = {
  pending: '待审核',
  level1: '一级审批',
  level2: '二级审批',
  level3: '三级审批',
  finance: '财务审批',
}

const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ')

// 脱敏mock数据 - 15条待审批记录（全部虚构无真实映射）
// 说明：所有公司名、地址等均为随机虚构格式，不对应任何真实企业或个人
const mockApprovalTodo: ApprovalTodo[] = [
  // 销售订单
  {
    id: 'AP001',
    code: 'AP-2026-0827-001',
    title: '演示客户A销售订单审批',
    orderNo: 'SO20260827001',
    payeeName: '示例市华瑞信科技演示有限公司（演示数据）',
    approvalAmount: 128500.00,
    currency: 'CNY',
    details: '皮具箱包一批，共计500件，含真皮手提包200件，双肩背包300件（演示数据）',
    expectedPayTime: '2026-09-05',
    category: 'sale_order',
    settlementApproval: 'level1',
    initiator: '小张',
    initiatorDept: '销售一部',
    createTime: '2026-08-27 09:15:32',
    status: 'pending',
    remark: '老客户，优先处理（演示虚构）',
  },
  {
    id: 'AP002',
    code: 'AP-2026-0827-002',
    title: '演示客户B销售订单审批',
    orderNo: 'SO20260827002',
    payeeName: '测试市东方汇商贸虚拟合伙企业',
    approvalAmount: 56800.00,
    currency: 'CNY',
    details: '水杯茶具套装200套，保温杯150个，旅行茶具50套（演示数据）',
    expectedPayTime: '2026-09-03',
    category: 'sale_order',
    settlementApproval: 'level2',
    initiator: '小李',
    initiatorDept: '销售二部',
    createTime: '2026-08-27 10:02:18',
    status: 'pending',
    remark: '',
  },
  // 采购订单
  {
    id: 'AP003',
    code: 'AP-2026-0826-003',
    title: '虚拟供应商A采购订单审批',
    orderNo: 'PO20260826001',
    payeeName: '演示市恒达盛皮具制造演示厂（演示数据）',
    approvalAmount: 89600.00,
    currency: 'CNY',
    details: '采购真皮手提包300个，单价约298元/个（演示数据）',
    expectedPayTime: '2026-08-30',
    category: 'purchase_order',
    settlementApproval: 'level1',
    initiator: '小王',
    initiatorDept: '采购部',
    createTime: '2026-08-26 14:25:44',
    status: 'pending',
    remark: '月度常规补货订单（演示虚构）',
  },
  {
    id: 'AP004',
    code: 'AP-2026-0826-004',
    title: '虚拟供应商B采购订单审批',
    orderNo: 'PO20260826002',
    payeeName: '示例市创意坊工艺品虚拟有限公司',
    approvalAmount: 45200.00,
    currency: 'CNY',
    details: '定制U盘500个，金属纪念币200枚（演示数据）',
    expectedPayTime: '2026-09-01',
    category: 'purchase_order',
    settlementApproval: 'finance',
    initiator: '小陈',
    initiatorDept: '采购部',
    createTime: '2026-08-26 16:40:12',
    status: 'pending',
    remark: '客户定制产品，需要开票（演示虚构）',
  },
  // 费用报销
  {
    id: 'AP005',
    code: 'AP-2026-0827-005',
    title: '刘经理差旅费报销',
    orderNo: 'EX20260827001',
    payeeName: '小刘',
    approvalAmount: 8650.00,
    currency: 'CNY',
    details: '8月20日-25日示例市出差，机票3200，酒店2800，餐饮1200，交通1450',
    expectedPayTime: '2026-08-30',
    category: 'expense',
    settlementApproval: 'level2',
    initiator: '小刘',
    initiatorDept: '市场部',
    createTime: '2026-08-27 08:50:05',
    status: 'pending',
    remark: '参加演示地区行业展会',
  },
  {
    id: 'AP006',
    code: 'AP-2026-0826-006',
    title: '行政办公用品采购报销',
    orderNo: 'EX20260826001',
    payeeName: '业务员',
    approvalAmount: 3280.00,
    currency: 'CNY',
    details: '打印纸、墨盒、文件夹等办公用品',
    expectedPayTime: '2026-08-29',
    category: 'expense',
    settlementApproval: 'level1',
    initiator: '业务员',
    initiatorDept: '行政部',
    createTime: '2026-08-26 11:15:20',
    status: 'pending',
    remark: '',
  },
  // 货款
  {
    id: 'AP007',
    code: 'AP-2026-0825-007',
    title: '虚拟家具供应商货款支付审批',
    orderNo: 'GP20260825001',
    payeeName: '示例市名雅居家具虚拟制造有限公司（演示数据）',
    approvalAmount: 256000.00,
    currency: 'CNY',
    details: '办公家具采购尾款，合同总额32万，已付6.4万，本次支付尾款80%（演示数据）',
    expectedPayTime: '2026-08-28',
    category: 'goods_payment',
    settlementApproval: 'level3',
    initiator: '小小孙',
    initiatorDept: '财务部',
    createTime: '2026-08-25 15:30:50',
    status: 'pending',
    remark: '家具已验收合格（演示虚构）',
  },
  {
    id: 'AP008',
    code: 'AP-2026-0826-008',
    title: '虚拟电子供应商货款支付审批',
    orderNo: 'GP20260826001',
    payeeName: '演示市盛芯元电子科技虚拟商行（演示数据）',
    approvalAmount: 78500.00,
    currency: 'CNY',
    details: '电子元器件采购款，U盘芯片及配件（演示数据）',
    expectedPayTime: '2026-08-31',
    category: 'goods_payment',
    settlementApproval: 'finance',
    initiator: '小孙',
    initiatorDept: '财务部',
    createTime: '2026-08-26 09:05:33',
    status: 'pending',
    remark: '',
  },
  // 采购合同
  {
    id: 'AP009',
    code: 'AP-2026-0827-009',
    title: '年度原材料供应合同审批（演示）',
    orderNo: 'PC20260827001',
    payeeName: '示例市新云仓皮革材料演示加工坊（演示数据）',
    approvalAmount: 680000.00,
    currency: 'CNY',
    details: '2026年度真皮、PU材料供应框架合同，月供货量约5-8万（演示数据）',
    expectedPayTime: '2026-09-10',
    category: 'purchase_contract',
    settlementApproval: 'level3',
    initiator: '小王',
    initiatorDept: '采购部',
    createTime: '2026-08-27 10:45:10',
    status: 'pending',
    remark: '战略合作供应商年度续约合同（演示虚构）',
  },
  {
    id: 'AP010',
    code: 'AP-2026-0825-010',
    title: '物流运输服务合同审批（演示）',
    orderNo: 'PC20260825001',
    payeeName: '演示市速达通物流运输虚拟服务部',
    approvalAmount: 120000.00,
    currency: 'CNY',
    details: '国内物流快递运输服务年度合同，月结30天（演示数据）',
    expectedPayTime: '2026-09-01',
    category: 'purchase_contract',
    settlementApproval: 'level2',
    initiator: '小吴',
    initiatorDept: '仓储物流部',
    createTime: '2026-08-25 13:22:18',
    status: 'pending',
    remark: '',
  },
  // 退款
  {
    id: 'AP011',
    code: 'AP-2026-0826-011',
    title: '客户退货退款审批（演示）',
    orderNo: 'RF20260826001',
    payeeName: '示例市汇盛合商业演示合作社（演示数据）',
    approvalAmount: 15600.00,
    currency: 'CNY',
    details: '销售订单SO20260715002部分退货，女式手提包50个质量问题退回（演示数据）',
    expectedPayTime: '2026-08-29',
    category: 'refund',
    settlementApproval: 'level2',
    initiator: '小张',
    initiatorDept: '销售一部',
    createTime: '2026-08-26 14:50:05',
    status: 'pending',
    remark: '质检确认存在质量问题（演示虚构）',
  },
  {
    id: 'AP012',
    code: 'AP-2026-0827-012',
    title: '多收货款退款审批（演示）',
    orderNo: 'RF20260827001',
    payeeName: '示例市新纪元进出口演示贸易商行（演示数据）',
    approvalAmount: 6800.00,
    currency: 'USD',
    details: '外销订单重复支付退回，原货款金额已收齐，多收部分退还（演示数据）',
    expectedPayTime: '2026-08-28',
    category: 'refund',
    settlementApproval: 'finance',
    initiator: '小芳',
    initiatorDept: '财务部',
    createTime: '2026-08-27 11:12:40',
    status: 'pending',
    remark: '外汇退款需走银行审批流程（演示虚构）',
  },
  // 工资
  {
    id: 'AP013',
    code: 'AP-2026-0820-013',
    title: '2026年8月员工工资发放审批',
    orderNo: 'SA20260820001',
    payeeName: '全体员工',
    approvalAmount: 1856000.00,
    currency: 'CNY',
    details: '2026年8月份全员工资发放，共计员工156人，含基本工资、绩效、奖金、补贴等',
    expectedPayTime: '2026-08-28',
    category: 'salary',
    settlementApproval: 'level3',
    initiator: '小黄',
    initiatorDept: '人力资源部',
    createTime: '2026-08-20 16:05:30',
    status: 'pending',
    remark: '工资表已由HR和财务复核',
  },
  {
    id: 'AP014',
    code: 'AP-2026-0825-014',
    title: '7月份销售提成发放审批',
    orderNo: 'SA20260825001',
    payeeName: '销售部全体人员',
    approvalAmount: 328500.00,
    currency: 'CNY',
    details: '2026年7月销售业绩提成，销售一部、二部、外销部共42人',
    expectedPayTime: '2026-08-28',
    category: 'salary',
    settlementApproval: 'level2',
    initiator: '小郑',
    initiatorDept: '销售管理部',
    createTime: '2026-08-25 10:18:25',
    status: 'pending',
    remark: '',
  },
  // 额外一条
  {
    id: 'AP015',
    code: 'AP-2026-0827-015',
    title: '境外演示客户外销订单审批',
    orderNo: 'SO20260827003',
    payeeName: '境外虚拟客户B国际贸易演示有限公司（演示数据）',
    approvalAmount: 45000.00,
    currency: 'HKD',
    details: '外销工艺礼品订单，定制U盘300个，水晶摆件100个（演示数据）',
    expectedPayTime: '2026-09-08',
    category: 'sale_order',
    settlementApproval: 'level1',
    initiator: '小李',
    initiatorDept: '销售二部',
    createTime: '2026-08-27 13:35:55',
    status: 'pending',
    remark: '信用证结算（演示虚构）',
  },
]

const approvalTodoStore: ApprovalTodo[] = JSON.parse(JSON.stringify(mockApprovalTodo))
let nextId = approvalTodoStore.length + 1

// 辅助函数：获取分类label
export function getCategoryLabel(category: ApprovalCategory): string {
  return categoryMap[category] || category
}

// 辅助函数：获取结算审批label
export function getSettlementApprovalLabel(value: string): string {
  return settlementApprovalMap[value] || value
}

// 辅助函数：获取状态tag类型
export function getStatusTagType(status: ApprovalStatus): 'warning' | 'success' | 'danger' | 'info' {
  const map: Record<ApprovalStatus, 'warning' | 'success' | 'danger' | 'info'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
  }
  return map[status] || 'info'
}

// 辅助函数：获取状态文本
export function getStatusText(status: ApprovalStatus): string {
  const map: Record<ApprovalStatus, string> = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已驳回',
  }
  return map[status] || status
}

/** 分页获取待审批列表 */
export function getApprovalTodoPage(params: {
  page: number
  pageSize: number
  orderNo?: string
  minAmount?: number
  maxAmount?: number
  category?: ApprovalCategory | 'all'
}): Promise<Result<{ list: ApprovalTodo[]; total: number }>> {
  let filtered = [...approvalTodoStore].filter((item) => item.status === 'pending')

  if (params.orderNo) {
    const kw = params.orderNo.toLowerCase()
    filtered = filtered.filter(
      (c) =>
        c.orderNo.toLowerCase().includes(kw) ||
        c.code.toLowerCase().includes(kw) ||
        c.title.toLowerCase().includes(kw)
    )
  }

  if (params.minAmount !== undefined && params.minAmount !== null && !isNaN(params.minAmount)) {
    filtered = filtered.filter((c) => c.approvalAmount >= params.minAmount)
  }

  if (params.maxAmount !== undefined && params.maxAmount !== null && !isNaN(params.maxAmount)) {
    filtered = filtered.filter((c) => c.approvalAmount <= params.maxAmount)
  }

  if (params.category && params.category !== 'all') {
    filtered = filtered.filter((c) => c.category === params.category)
  }

  // 排序：先按发起时间倒序（最新发起的在前）
  filtered.sort((a, b) => {
    return b.createTime.localeCompare(a.createTime)
  })

  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: filtered.slice(start, start + params.pageSize), total })
}

/** 根据ID获取审批详情 */
export function getApprovalTodoById(id: string): Promise<Result<ApprovalTodo>> {
  const item = approvalTodoStore.find((c) => c.id === id)
  return mockResponse(item || ({} as ApprovalTodo))
}

/** 审批操作（通过/驳回） */
export function approveTodo(
  id: string,
  form: ApprovalTodoForm
): Promise<Result<ApprovalTodo>> {
  const index = approvalTodoStore.findIndex((c) => c.id === id)
  if (index === -1) return mockResponse({} as ApprovalTodo)

  approvalTodoStore[index] = {
    ...approvalTodoStore[index],
    status: form.approvalResult === 'approve' ? 'approved' : 'rejected',
    remark: `${approvalTodoStore[index].remark}\n审批意见(${form.approvalResult === 'approve' ? '通过' : '驳回'}): ${form.approvalOpinion} - ${now()}`,
  }
  return mockResponse(approvalTodoStore[index])
}

/** 批量审批 */
export function batchApproveTodo(
  ids: string[],
  form: ApprovalTodoForm
): Promise<Result<{ success: number; failed: string[] }>> {
  const failed: string[] = []
  let success = 0

  for (const id of ids) {
    const index = approvalTodoStore.findIndex((c) => c.id === id)
    if (index !== -1 && approvalTodoStore[index].status === 'pending') {
      approvalTodoStore[index] = {
        ...approvalTodoStore[index],
        status: form.approvalResult === 'approve' ? 'approved' : 'rejected',
        remark: `${approvalTodoStore[index].remark}\n批量审批(${form.approvalResult === 'approve' ? '通过' : '驳回'}): ${form.approvalOpinion} - ${now()}`,
      }
      success++
    } else {
      failed.push(id)
    }
  }

  return mockResponse({ success, failed })
}

/** 获取分类统计数量（用于Tab显示数量） */
export function getCategoryCounts(): Promise<Result<Record<string, number>>> {
  const pendingItems = approvalTodoStore.filter((item) => item.status === 'pending')
  const counts: Record<string, number> = {
    all: pendingItems.length,
  }
  for (const opt of categoryOptions) {
    counts[opt.value] = pendingItems.filter((item) => item.category === opt.value).length
  }
  return mockResponse(counts)
}
