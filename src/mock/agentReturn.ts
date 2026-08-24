import type { Result } from '@/http'
import { mockResponse } from '@/mock'

export interface AgentReturnItem {
  id: string
  barcode: string
  productName: string
  productCode: string
  spec: string
  unit: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface AgentReturn {
  id: string
  returnNo: string
  agent: string
  operationCenter: string
  creator: string
  createDate: string
  operator: string
  operateDate: string
  warehouse: string
  amount: number
  remark: string
  items: AgentReturnItem[]
  status: 'draft' | 'confirmed' | 'completed' | 'cancelled'
  createTime: string
}

export const returnStatusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '已确认', value: 'confirmed' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
]

export const returnStatusMap: Record<string, { text: string; color: string }> = {
  draft: { text: '草稿', color: '#909399' },
  confirmed: { text: '已确认', color: '#409eff' },
  completed: { text: '已完成', color: '#67c23a' },
  cancelled: { text: '已取消', color: '#f56c6c' },
}

export const agentOptions = [
  { label: '华东区代理商', value: '华东区代理商' },
  { label: '华南区代理商', value: '华南区代理商' },
  { label: '华北区代理商', value: '华北区代理商' },
  { label: '西南区代理商', value: '西南区代理商' },
  { label: '华中区代理商', value: '华中区代理商' },
]

export const operationCenterOptions = [
  { label: '上海运营中心', value: '上海运营中心' },
  { label: '广州运营中心', value: '广州运营中心' },
  { label: '北京运营中心', value: '北京运营中心' },
  { label: '成都运营中心', value: '成都运营中心' },
  { label: '武汉运营中心', value: '武汉运营中心' },
]

export const warehouseOptions = [
  { label: '上海仓库', value: '上海仓库' },
  { label: '广州仓库', value: '广州仓库' },
  { label: '北京仓库', value: '北京仓库' },
  { label: '成都仓库', value: '成都仓库' },
]

export const operatorOptions = [
  { label: '张主管', value: '张主管' },
  { label: '李经理', value: '李经理' },
  { label: '王专员', value: '王专员' },
  { label: '赵总监', value: '赵总监' },
]

const mockAgentReturns: AgentReturn[] = [
  {
    id: '1',
    returnNo: 'AR-2026-0008',
    agent: '华东区代理商',
    operationCenter: '上海运营中心',
    creator: '张主管',
    createDate: '2026-08-23',
    operator: '张主管',
    operateDate: '2026-08-23',
    warehouse: '上海仓库',
    amount: 3260.00,
    remark: '客户反馈部分商品临期，协商退回',
    items: [
      {
        id: 'item1',
        barcode: 'AR001',
        productName: '精选大米',
        productCode: 'P-AR-001',
        spec: '25kg/袋',
        unit: '袋',
        quantity: 20,
        unitPrice: 55.0,
        amount: 1100.0,
      },
      {
        id: 'item2',
        barcode: 'AR002',
        productName: '食用调和油',
        productCode: 'P-AR-002',
        spec: '5L/桶',
        unit: '桶',
        quantity: 30,
        unitPrice: 72.0,
        amount: 2160.0,
      },
    ],
    status: 'completed',
    createTime: '2026-08-23 10:00:00',
  },
  {
    id: '2',
    returnNo: 'AR-2026-0007',
    agent: '华南区代理商',
    operationCenter: '广州运营中心',
    creator: '李经理',
    createDate: '2026-08-21',
    operator: '李经理',
    operateDate: '2026-08-21',
    warehouse: '广州仓库',
    amount: 1680.00,
    remark: '运输过程中包装破损',
    items: [
      {
        id: 'item1',
        barcode: 'AR003',
        productName: '洗洁精',
        productCode: 'P-AR-003',
        spec: '2kg/瓶',
        unit: '瓶',
        quantity: 60,
        unitPrice: 28.0,
        amount: 1680.0,
      },
    ],
    status: 'confirmed',
    createTime: '2026-08-21 15:30:00',
  },
  {
    id: '3',
    returnNo: 'AR-2026-0006',
    agent: '华北区代理商',
    operationCenter: '北京运营中心',
    creator: '王专员',
    createDate: '2026-08-19',
    operator: '王专员',
    operateDate: '2026-08-19',
    warehouse: '北京仓库',
    amount: 9800.00,
    remark: '商品规格与订单不符',
    items: [
      {
        id: 'item1',
        barcode: 'AR004',
        productName: '办公打印纸',
        productCode: 'P-AR-004',
        spec: 'A4 70g 500张',
        unit: '箱',
        quantity: 100,
        unitPrice: 28.5,
        amount: 2850.0,
      },
      {
        id: 'item2',
        barcode: 'AR005',
        productName: '签字笔',
        productCode: 'P-AR-005',
        spec: '黑色 0.5mm 12支/盒',
        unit: '盒',
        quantity: 200,
        unitPrice: 18.0,
        amount: 3600.0,
      },
      {
        id: 'item3',
        barcode: 'AR006',
        productName: '订书机',
        productCode: 'P-AR-006',
        spec: '标准型',
        unit: '个',
        quantity: 50,
        unitPrice: 67.0,
        amount: 3350.0,
      },
    ],
    status: 'draft',
    createTime: '2026-08-19 11:45:00',
  },
  {
    id: '4',
    returnNo: 'AR-2026-0005',
    agent: '西南区代理商',
    operationCenter: '成都运营中心',
    creator: '赵总监',
    createDate: '2026-08-16',
    operator: '赵总监',
    operateDate: '2026-08-16',
    warehouse: '成都仓库',
    amount: 2840.00,
    remark: '',
    items: [
      {
        id: 'item1',
        barcode: 'AR007',
        productName: '保温杯',
        productCode: 'P-AR-007',
        spec: '500ml 不锈钢',
        unit: '个',
        quantity: 40,
        unitPrice: 35.5,
        amount: 1420.0,
      },
      {
        id: 'item2',
        barcode: 'AR008',
        productName: '雨伞',
        productCode: 'P-AR-008',
        spec: '三折 防晒',
        unit: '把',
        quantity: 60,
        unitPrice: 23.67,
        amount: 1420.0,
      },
    ],
    status: 'completed',
    createTime: '2026-08-16 09:20:00',
  },
  {
    id: '5',
    returnNo: 'AR-2026-0004',
    agent: '华中区代理商',
    operationCenter: '武汉运营中心',
    creator: '张主管',
    createDate: '2026-08-12',
    operator: '张主管',
    operateDate: '2026-08-12',
    warehouse: '上海仓库',
    amount: 4500.00,
    remark: '滞销商品退回',
    items: [
      {
        id: 'item1',
        barcode: 'AR009',
        productName: '饼干礼盒',
        productCode: 'P-AR-009',
        spec: '精品装 500g',
        unit: '盒',
        quantity: 100,
        unitPrice: 45.0,
        amount: 4500.0,
      },
    ],
    status: 'confirmed',
    createTime: '2026-08-12 14:10:00',
  },
  {
    id: '6',
    returnNo: 'AR-2026-0003',
    agent: '华东区代理商',
    operationCenter: '上海运营中心',
    creator: '李经理',
    createDate: '2026-08-08',
    operator: '李经理',
    operateDate: '2026-08-08',
    warehouse: '上海仓库',
    amount: 1600.00,
    remark: '',
    items: [
      {
        id: 'item1',
        barcode: 'AR010',
        productName: '矿泉水',
        productCode: 'P-AR-010',
        spec: '550ml 24瓶',
        unit: '箱',
        quantity: 50,
        unitPrice: 32.0,
        amount: 1600.0,
      },
    ],
    status: 'cancelled',
    createTime: '2026-08-08 16:00:00',
  },
  {
    id: '7',
    returnNo: 'AR-2026-0002',
    agent: '华南区代理商',
    operationCenter: '广州运营中心',
    creator: '王专员',
    createDate: '2026-08-03',
    operator: '王专员',
    operateDate: '2026-08-03',
    warehouse: '广州仓库',
    amount: 5600.00,
    remark: '季度退换',
    items: [
      {
        id: 'item1',
        barcode: 'AR011',
        productName: '纸品套装',
        productCode: 'P-AR-011',
        spec: '抽取式 3层 100抽',
        unit: '提',
        quantity: 100,
        unitPrice: 28.0,
        amount: 2800.0,
      },
      {
        id: 'item2',
        barcode: 'AR012',
        productName: '卷筒纸',
        productCode: 'P-AR-012',
        spec: '3层 10卷',
        unit: '提',
        quantity: 50,
        unitPrice: 56.0,
        amount: 2800.0,
      },
    ],
    status: 'completed',
    createTime: '2026-08-03 10:20:00',
  },
  {
    id: '8',
    returnNo: 'AR-2026-0001',
    agent: '华北区代理商',
    operationCenter: '北京运营中心',
    creator: '赵总监',
    createDate: '2026-07-30',
    operator: '赵总监',
    operateDate: '2026-07-30',
    warehouse: '北京仓库',
    amount: 3720.00,
    remark: '',
    items: [
      {
        id: 'item1',
        barcode: 'AR013',
        productName: '洗发水',
        productCode: 'P-AR-013',
        spec: '750ml',
        unit: '瓶',
        quantity: 80,
        unitPrice: 38.0,
        amount: 3040.0,
      },
      {
        id: 'item2',
        barcode: 'AR014',
        productName: '沐浴露',
        productCode: 'P-AR-014',
        spec: '750ml',
        unit: '瓶',
        quantity: 20,
        unitPrice: 34.0,
        amount: 680.0,
      },
    ],
    status: 'draft',
    createTime: '2026-07-30 13:40:00',
  },
]

const agentReturnStore: AgentReturn[] = JSON.parse(JSON.stringify(mockAgentReturns))

export function getAgentReturnPage(params: {
  page: number
  pageSize: number
  returnNo?: string
  operationCenter?: string
  warehouse?: string
  operator?: string
  startDate?: string
  endDate?: string
  status?: string
}): Promise<Result<{ list: AgentReturn[]; total: number }>> {
  let filtered = [...agentReturnStore]

  if (params.returnNo) {
    const kw = params.returnNo.toLowerCase()
    filtered = filtered.filter((r) => r.returnNo.toLowerCase().includes(kw))
  }
  if (params.operationCenter) {
    filtered = filtered.filter((r) => r.operationCenter === params.operationCenter)
  }
  if (params.warehouse) {
    filtered = filtered.filter((r) => r.warehouse === params.warehouse)
  }
  if (params.operator) {
    filtered = filtered.filter((r) => r.operator === params.operator)
  }
  if (params.startDate) {
    filtered = filtered.filter((r) => r.operateDate >= params.startDate!)
  }
  if (params.endDate) {
    filtered = filtered.filter((r) => r.operateDate <= params.endDate!)
  }
  if (params.status) {
    filtered = filtered.filter((r) => r.status === params.status)
  }

  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  const list = filtered.slice(start, start + params.pageSize)
  return mockResponse({ list, total })
}

export function getAgentReturnById(id: string): Promise<Result<AgentReturn>> {
  const record = agentReturnStore.find((r) => r.id === id)
  if (record) {
    return mockResponse(record)
  }
  return mockResponse({} as AgentReturn, '未找到该代理商退货单')
}

export function addAgentReturn(
  data: Omit<AgentReturn, 'id' | 'createTime' | 'amount'> & { id?: string }
): Promise<Result<AgentReturn>> {
  const amount = data.items.reduce((sum, item) => sum + (item.amount || 0), 0)
  const newRecord: AgentReturn = {
    ...data,
    id: data.id || String(Date.now()),
    amount,
    createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
  }
  agentReturnStore.push(newRecord)
  return mockResponse(newRecord, '添加成功')
}

export function updateAgentReturn(id: string, data: Partial<AgentReturn>): Promise<Result<AgentReturn>> {
  const idx = agentReturnStore.findIndex((r) => r.id === id)
  if (idx >= 0) {
    const items = data.items || agentReturnStore[idx].items
    const amount = items.reduce((sum, item) => sum + (item.amount || 0), 0)
    agentReturnStore[idx] = { ...agentReturnStore[idx], ...data, id, amount }
    return mockResponse(agentReturnStore[idx], '更新成功')
  }
  return mockResponse({} as AgentReturn, '未找到该代理商退货单')
}

export function deleteAgentReturn(id: string): Promise<Result<void>> {
  const idx = agentReturnStore.findIndex((r) => r.id === id)
  if (idx >= 0) {
    agentReturnStore.splice(idx, 1)
    return mockResponse(undefined, '删除成功')
  }
  return mockResponse(undefined, '未找到该代理商退货单')
}
