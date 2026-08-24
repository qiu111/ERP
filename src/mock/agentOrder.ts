import type { Result } from '@/http'
import { mockResponse } from '@/mock'

export interface AgentOrderItem {
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

export interface AgentOrder {
  id: string
  orderNo: string
  agent: string
  operationCenter: string
  creator: string
  createDate: string
  operator: string
  operateDate: string
  warehouse: string
  amount: number
  remark: string
  items: AgentOrderItem[]
  status: 'draft' | 'confirmed' | 'completed' | 'cancelled'
  createTime: string
}

export const orderStatusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '已确认', value: 'confirmed' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
]

export const orderStatusMap: Record<string, { text: string; color: string }> = {
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

const mockAgentOrders: AgentOrder[] = [
  {
    id: '1',
    orderNo: 'AO-2026-0012',
    agent: '华东区代理商',
    operationCenter: '上海运营中心',
    creator: '张主管',
    createDate: '2026-08-22',
    operator: '张主管',
    operateDate: '2026-08-22',
    warehouse: '上海仓库',
    amount: 12580.00,
    remark: '加急补货，尽快发货',
    items: [
      {
        id: 'item1',
        barcode: 'AG001',
        productName: '精选大米',
        productCode: 'P-AG-001',
        spec: '25kg/袋',
        unit: '袋',
        quantity: 50,
        unitPrice: 55.0,
        amount: 2750.0,
      },
      {
        id: 'item2',
        barcode: 'AG002',
        productName: '食用调和油',
        productCode: 'P-AG-002',
        spec: '5L/桶',
        unit: '桶',
        quantity: 80,
        unitPrice: 72.0,
        amount: 5760.0,
      },
      {
        id: 'item3',
        barcode: 'AG003',
        productName: '速溶咖啡',
        productCode: 'P-AG-003',
        spec: '100条/盒',
        unit: '盒',
        quantity: 30,
        unitPrice: 135.67,
        amount: 4070.0,
      },
    ],
    status: 'completed',
    createTime: '2026-08-22 10:30:00',
  },
  {
    id: '2',
    orderNo: 'AO-2026-0011',
    agent: '华南区代理商',
    operationCenter: '广州运营中心',
    creator: '李经理',
    createDate: '2026-08-20',
    operator: '李经理',
    operateDate: '2026-08-20',
    warehouse: '广州仓库',
    amount: 8960.00,
    remark: '月度常规采购',
    items: [
      {
        id: 'item1',
        barcode: 'AG004',
        productName: '洗洁精',
        productCode: 'P-AG-004',
        spec: '2kg/瓶',
        unit: '瓶',
        quantity: 120,
        unitPrice: 28.0,
        amount: 3360.0,
      },
      {
        id: 'item2',
        barcode: 'AG005',
        productName: '洗衣液',
        productCode: 'P-AG-005',
        spec: '3kg/桶',
        unit: '桶',
        quantity: 80,
        unitPrice: 70.0,
        amount: 5600.0,
      },
    ],
    status: 'confirmed',
    createTime: '2026-08-20 14:15:00',
  },
  {
    id: '3',
    orderNo: 'AO-2026-0010',
    agent: '华北区代理商',
    operationCenter: '北京运营中心',
    creator: '王专员',
    createDate: '2026-08-18',
    operator: '王专员',
    operateDate: '2026-08-18',
    warehouse: '北京仓库',
    amount: 23400.00,
    remark: '大宗采购，分批交货',
    items: [
      {
        id: 'item1',
        barcode: 'AG006',
        productName: '办公打印纸',
        productCode: 'P-AG-006',
        spec: 'A4 70g 500张',
        unit: '箱',
        quantity: 200,
        unitPrice: 28.5,
        amount: 5700.0,
      },
      {
        id: 'item2',
        barcode: 'AG007',
        productName: '签字笔',
        productCode: 'P-AG-007',
        spec: '黑色 0.5mm 12支/盒',
        unit: '盒',
        quantity: 150,
        unitPrice: 18.0,
        amount: 2700.0,
      },
      {
        id: 'item3',
        barcode: 'AG008',
        productName: '文件夹',
        productCode: 'P-AG-008',
        spec: 'A4 双夹',
        unit: '个',
        quantity: 500,
        unitPrice: 12.0,
        amount: 6000.0,
      },
      {
        id: 'item4',
        barcode: 'AG009',
        productName: '订书机',
        productCode: 'P-AG-009',
        spec: '标准型',
        unit: '个',
        quantity: 100,
        unitPrice: 38.0,
        amount: 3800.0,
      },
      {
        id: 'item5',
        barcode: 'AG010',
        productName: '碎纸机',
        productCode: 'P-AG-010',
        spec: '家用迷你型',
        unit: '台',
        quantity: 20,
        unitPrice: 260.0,
        amount: 5200.0,
      },
    ],
    status: 'draft',
    createTime: '2026-08-18 09:00:00',
  },
  {
    id: '4',
    orderNo: 'AO-2026-0009',
    agent: '西南区代理商',
    operationCenter: '成都运营中心',
    creator: '赵总监',
    createDate: '2026-08-15',
    operator: '赵总监',
    operateDate: '2026-08-15',
    warehouse: '成都仓库',
    amount: 5680.00,
    remark: '',
    items: [
      {
        id: 'item1',
        barcode: 'AG011',
        productName: '保温杯',
        productCode: 'P-AG-011',
        spec: '500ml 不锈钢',
        unit: '个',
        quantity: 80,
        unitPrice: 35.5,
        amount: 2840.0,
      },
      {
        id: 'item2',
        barcode: 'AG012',
        productName: '雨伞',
        productCode: 'P-AG-012',
        spec: '三折 防晒',
        unit: '把',
        quantity: 120,
        unitPrice: 23.67,
        amount: 2840.0,
      },
    ],
    status: 'completed',
    createTime: '2026-08-15 16:45:00',
  },
  {
    id: '5',
    orderNo: 'AO-2026-0008',
    agent: '华中区代理商',
    operationCenter: '武汉运营中心',
    creator: '张主管',
    createDate: '2026-08-10',
    operator: '张主管',
    operateDate: '2026-08-10',
    warehouse: '上海仓库',
    amount: 18900.00,
    remark: '新店开业备货',
    items: [
      {
        id: 'item1',
        barcode: 'AG013',
        productName: '饼干礼盒',
        productCode: 'P-AG-013',
        spec: '精品装 500g',
        unit: '盒',
        quantity: 200,
        unitPrice: 45.0,
        amount: 9000.0,
      },
      {
        id: 'item2',
        barcode: 'AG014',
        productName: '坚果礼盒',
        productCode: 'P-AG-014',
        spec: '混合装 1kg',
        unit: '盒',
        quantity: 100,
        unitPrice: 99.0,
        amount: 9900.0,
      },
    ],
    status: 'confirmed',
    createTime: '2026-08-10 11:20:00',
  },
  {
    id: '6',
    orderNo: 'AO-2026-0007',
    agent: '华东区代理商',
    operationCenter: '上海运营中心',
    creator: '李经理',
    createDate: '2026-08-05',
    operator: '李经理',
    operateDate: '2026-08-05',
    warehouse: '上海仓库',
    amount: 3200.00,
    remark: '样品订单',
    items: [
      {
        id: 'item1',
        barcode: 'AG015',
        productName: '矿泉水',
        productCode: 'P-AG-015',
        spec: '550ml 24瓶',
        unit: '箱',
        quantity: 100,
        unitPrice: 32.0,
        amount: 3200.0,
      },
    ],
    status: 'cancelled',
    createTime: '2026-08-05 08:30:00',
  },
  {
    id: '7',
    orderNo: 'AO-2026-0006',
    agent: '华南区代理商',
    operationCenter: '广州运营中心',
    creator: '王专员',
    createDate: '2026-08-01',
    operator: '王专员',
    operateDate: '2026-08-01',
    warehouse: '广州仓库',
    amount: 15600.00,
    remark: '',
    items: [
      {
        id: 'item1',
        barcode: 'AG016',
        productName: '纸品套装',
        productCode: 'P-AG-016',
        spec: '抽取式 3层 100抽',
        unit: '提',
        quantity: 300,
        unitPrice: 28.0,
        amount: 8400.0,
      },
      {
        id: 'item2',
        barcode: 'AG017',
        productName: '卷筒纸',
        productCode: 'P-AG-017',
        spec: '3层 10卷',
        unit: '提',
        quantity: 200,
        unitPrice: 36.0,
        amount: 7200.0,
      },
    ],
    status: 'completed',
    createTime: '2026-08-01 15:00:00',
  },
  {
    id: '8',
    orderNo: 'AO-2026-0005',
    agent: '华北区代理商',
    operationCenter: '北京运营中心',
    creator: '赵总监',
    createDate: '2026-07-28',
    operator: '赵总监',
    operateDate: '2026-07-28',
    warehouse: '北京仓库',
    amount: 7890.00,
    remark: '',
    items: [
      {
        id: 'item1',
        barcode: 'AG018',
        productName: '洗发水',
        productCode: 'P-AG-018',
        spec: '750ml',
        unit: '瓶',
        quantity: 150,
        unitPrice: 38.0,
        amount: 5700.0,
      },
      {
        id: 'item2',
        barcode: 'AG019',
        productName: '沐浴露',
        productCode: 'P-AG-019',
        spec: '750ml',
        unit: '瓶',
        quantity: 60,
        unitPrice: 36.5,
        amount: 2190.0,
      },
    ],
    status: 'draft',
    createTime: '2026-07-28 13:10:00',
  },
]

const agentOrderStore: AgentOrder[] = JSON.parse(JSON.stringify(mockAgentOrders))

export function getAgentOrderPage(params: {
  page: number
  pageSize: number
  orderNo?: string
  operationCenter?: string
  startDate?: string
  endDate?: string
  status?: string
}): Promise<Result<{ list: AgentOrder[]; total: number }>> {
  let filtered = [...agentOrderStore]

  if (params.orderNo) {
    const kw = params.orderNo.toLowerCase()
    filtered = filtered.filter((r) => r.orderNo.toLowerCase().includes(kw))
  }
  if (params.operationCenter) {
    filtered = filtered.filter((r) => r.operationCenter === params.operationCenter)
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

export function getAgentOrderById(id: string): Promise<Result<AgentOrder>> {
  const record = agentOrderStore.find((r) => r.id === id)
  if (record) {
    return mockResponse(record)
  }
  return mockResponse({} as AgentOrder, '未找到该代理商要货单')
}

export function addAgentOrder(
  data: Omit<AgentOrder, 'id' | 'createTime' | 'amount'> & { id?: string }
): Promise<Result<AgentOrder>> {
  const amount = data.items.reduce((sum, item) => sum + (item.amount || 0), 0)
  const newRecord: AgentOrder = {
    ...data,
    id: data.id || String(Date.now()),
    amount,
    createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
  }
  agentOrderStore.push(newRecord)
  return mockResponse(newRecord, '添加成功')
}

export function updateAgentOrder(id: string, data: Partial<AgentOrder>): Promise<Result<AgentOrder>> {
  const idx = agentOrderStore.findIndex((r) => r.id === id)
  if (idx >= 0) {
    const items = data.items || agentOrderStore[idx].items
    const amount = items.reduce((sum, item) => sum + (item.amount || 0), 0)
    agentOrderStore[idx] = { ...agentOrderStore[idx], ...data, id, amount }
    return mockResponse(agentOrderStore[idx], '更新成功')
  }
  return mockResponse({} as AgentOrder, '未找到该代理商要货单')
}

export function deleteAgentOrder(id: string): Promise<Result<void>> {
  const idx = agentOrderStore.findIndex((r) => r.id === id)
  if (idx >= 0) {
    agentOrderStore.splice(idx, 1)
    return mockResponse(undefined, '删除成功')
  }
  return mockResponse(undefined, '未找到该代理商要货单')
}
