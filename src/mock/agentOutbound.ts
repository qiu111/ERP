import type { Result } from '@/http'
import { mockResponse } from '@/mock'

export interface AgentOutboundItem {
  id: string
  productCode: string
  barcode: string
  productName: string
  spec: string
  unit: string
  quantity: number
  costPrice: number
  costAmount: number
}

export interface AgentOutbound {
  id: string
  orderNo: string
  relatedOrderNo: string
  operationCenter: string
  creator: string
  createDate: string
  salesman: string
  warehouse: string
  logisticsCompany: string
  trackingNo: string
  freight: number
  prepayment: number
  remark: string
  items: AgentOutboundItem[]
  operator: string
  operateDate: string
  costAmountTotal: number
  status: 'draft' | 'approved' | 'shipped' | 'completed' | 'cancelled'
  createTime: string
}

export const outboundStatusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '已审核', value: 'approved' },
  { label: '已发货', value: 'shipped' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
]

export const outboundStatusMap: Record<string, { text: string; color: string }> = {
  draft: { text: '草稿', color: '#909399' },
  approved: { text: '已审核', color: '#409eff' },
  shipped: { text: '已发货', color: '#e6a23c' },
  completed: { text: '已完成', color: '#67c23a' },
  cancelled: { text: '已取消', color: '#f56c6c' },
}

export const operationCenterOptions = [
  { label: '上海运营中心', value: '上海运营中心' },
  { label: '广州运营中心', value: '广州运营中心' },
  { label: '北京运营中心', value: '北京运营中心' },
  { label: '成都运营中心', value: '成都运营中心' },
  { label: '武汉运营中心', value: '武汉运营中心' },
]

export const warehouseOptions = [
  { label: '上海港口', value: '上海港口' },
  { label: '广州仓库', value: '广州仓库' },
  { label: '北京仓库', value: '北京仓库' },
  { label: '成都仓库', value: '成都仓库' },
  { label: '武汉仓库', value: '武汉仓库' },
]

export const logisticsCompanyOptions = [
  { label: '顺丰', value: '顺丰' },
  { label: '圆通', value: '圆通' },
  { label: '中通', value: '中通' },
  { label: '韵达', value: '韵达' },
  { label: '德邦', value: '德邦' },
  { label: '京东物流', value: '京东物流' },
]

export const operatorOptions = [
  { label: '张主管', value: '张主管' },
  { label: '李经理', value: '李经理' },
  { label: '王专员', value: '王专员' },
  { label: '赵总监', value: '赵总监' },
]

export const salesmanOptions = [
  { label: '超级管理员', value: '超级管理员' },
  { label: '张主管', value: '张主管' },
  { label: '李经理', value: '李经理' },
  { label: '王专员', value: '王专员' },
]

export const relatedOrderOptions = [
  { label: 'AO-2026-1001', value: 'AO-2026-1001' },
  { label: 'AO-2026-1002', value: 'AO-2026-1002' },
  { label: 'AO-2026-1003', value: 'AO-2026-1003' },
  { label: 'AO-2026-1004', value: 'AO-2026-1004' },
  { label: 'AO-2026-1005', value: 'AO-2026-1005' },
]

const calcAmount = (items: AgentOutboundItem[]): number =>
  items.reduce((s, it) => s + it.quantity * it.costPrice, 0)

const mockAgentOutbounds: AgentOutbound[] = [
  {
    id: '1',
    orderNo: 'AO-2026-0008',
    relatedOrderNo: 'AO-2026-1001',
    operationCenter: '上海运营中心',
    creator: '超级管理员',
    createDate: '2026-08-23',
    salesman: '张主管',
    warehouse: '上海港口',
    logisticsCompany: '顺丰',
    trackingNo: 'SF202608230001',
    freight: 120,
    prepayment: 5000,
    remark: '加急发货，客户要求今日送达',
    items: [
      {
        id: 'item1',
        productCode: 'P-AO-001',
        barcode: 'AO001',
        productName: '精选大米',
        spec: '25kg/袋',
        unit: '袋',
        quantity: 50,
        costPrice: 45.0,
        costAmount: 2250.0,
      },
      {
        id: 'item2',
        productCode: 'P-AO-002',
        barcode: 'AO002',
        productName: '食用调和油',
        spec: '5L/桶',
        unit: '桶',
        quantity: 40,
        costPrice: 58.0,
        costAmount: 2320.0,
      },
    ],
    operator: '张主管',
    operateDate: '2026-08-23',
    costAmountTotal: 4570.0,
    status: 'completed',
    createTime: '2026-08-23 09:30:00',
  },
  {
    id: '2',
    orderNo: 'AO-2026-0007',
    relatedOrderNo: 'AO-2026-1002',
    operationCenter: '广州运营中心',
    creator: '超级管理员',
    createDate: '2026-08-22',
    salesman: '李经理',
    warehouse: '广州仓库',
    logisticsCompany: '圆通',
    trackingNo: 'YT202608220002',
    freight: 200,
    prepayment: 3000,
    remark: '',
    items: [
      {
        id: 'item1',
        productCode: 'P-AO-003',
        barcode: 'AO003',
        productName: '洗发水',
        spec: '750ml/瓶',
        unit: '瓶',
        quantity: 100,
        costPrice: 28.0,
        costAmount: 2800.0,
      },
      {
        id: 'item2',
        productCode: 'P-AO-004',
        barcode: 'AO004',
        productName: '沐浴露',
        spec: '1L/瓶',
        unit: '瓶',
        quantity: 80,
        costPrice: 32.0,
        costAmount: 2560.0,
      },
    ],
    operator: '李经理',
    operateDate: '2026-08-22',
    costAmountTotal: 5360.0,
    status: 'shipped',
    createTime: '2026-08-22 14:20:00',
  },
  {
    id: '3',
    orderNo: 'AO-2026-0006',
    relatedOrderNo: 'AO-2026-1003',
    operationCenter: '北京运营中心',
    creator: '超级管理员',
    createDate: '2026-08-20',
    salesman: '王专员',
    warehouse: '北京仓库',
    logisticsCompany: '中通',
    trackingNo: 'ZT202608200003',
    freight: 350,
    prepayment: 8000,
    remark: '客户临时增加规格备注',
    items: [
      {
        id: 'item1',
        productCode: 'P-AO-005',
        barcode: 'AO005',
        productName: '办公打印纸',
        spec: 'A4 70g 500张',
        unit: '箱',
        quantity: 200,
        costPrice: 25.0,
        costAmount: 5000.0,
      },
      {
        id: 'item2',
        productCode: 'P-AO-006',
        barcode: 'AO006',
        productName: '签字笔',
        spec: '黑色 0.5mm 12支/盒',
        unit: '盒',
        quantity: 300,
        costPrice: 15.0,
        costAmount: 4500.0,
      },
    ],
    operator: '王专员',
    operateDate: '2026-08-20',
    costAmountTotal: 9500.0,
    status: 'approved',
    createTime: '2026-08-20 11:15:00',
  },
  {
    id: '4',
    orderNo: 'AO-2026-0005',
    relatedOrderNo: 'AO-2026-1004',
    operationCenter: '成都运营中心',
    creator: '超级管理员',
    createDate: '2026-08-18',
    salesman: '赵总监',
    warehouse: '成都仓库',
    logisticsCompany: '德邦',
    trackingNo: 'DB202608180004',
    freight: 600,
    prepayment: 12000,
    remark: '大件物流，预计3天到货',
    items: [
      {
        id: 'item1',
        productCode: 'P-AO-007',
        barcode: 'AO007',
        productName: '保温杯',
        spec: '500ml 不锈钢',
        unit: '个',
        quantity: 200,
        costPrice: 32.0,
        costAmount: 6400.0,
      },
      {
        id: 'item2',
        productCode: 'P-AO-008',
        barcode: 'AO008',
        productName: '雨伞',
        spec: '三折 防晒',
        unit: '把',
        quantity: 300,
        costPrice: 20.0,
        costAmount: 6000.0,
      },
    ],
    operator: '赵总监',
    operateDate: '2026-08-18',
    costAmountTotal: 12400.0,
    status: 'completed',
    createTime: '2026-08-18 08:40:00',
  },
  {
    id: '5',
    orderNo: 'AO-2026-0004',
    relatedOrderNo: 'AO-2026-1005',
    operationCenter: '武汉运营中心',
    creator: '超级管理员',
    createDate: '2026-08-15',
    salesman: '张主管',
    warehouse: '武汉仓库',
    logisticsCompany: '韵达',
    trackingNo: 'YD202608150005',
    freight: 180,
    prepayment: 2000,
    remark: '',
    items: [
      {
        id: 'item1',
        productCode: 'P-AO-009',
        barcode: 'AO009',
        productName: '饼干礼盒',
        spec: '500g/盒',
        unit: '盒',
        quantity: 150,
        costPrice: 22.0,
        costAmount: 3300.0,
      },
    ],
    operator: '张主管',
    operateDate: '2026-08-15',
    costAmountTotal: 3300.0,
    status: 'draft',
    createTime: '2026-08-15 16:50:00',
  },
  {
    id: '6',
    orderNo: 'AO-2026-0003',
    relatedOrderNo: 'AO-2026-1001',
    operationCenter: '上海运营中心',
    creator: '超级管理员',
    createDate: '2026-08-12',
    salesman: '李经理',
    warehouse: '上海港口',
    logisticsCompany: '京东物流',
    trackingNo: 'JD202608120006',
    freight: 400,
    prepayment: 6000,
    remark: '第二批发货',
    items: [
      {
        id: 'item1',
        productCode: 'P-AO-010',
        barcode: 'AO010',
        productName: '洗衣液',
        spec: '3kg/瓶',
        unit: '瓶',
        quantity: 120,
        costPrice: 30.0,
        costAmount: 3600.0,
      },
      {
        id: 'item2',
        productCode: 'P-AO-011',
        barcode: 'AO011',
        productName: '洗洁精',
        spec: '2kg/瓶',
        unit: '瓶',
        quantity: 100,
        costPrice: 24.0,
        costAmount: 2400.0,
      },
    ],
    operator: '李经理',
    operateDate: '2026-08-12',
    costAmountTotal: 6000.0,
    status: 'shipped',
    createTime: '2026-08-12 10:05:00',
  },
  {
    id: '7',
    orderNo: 'AO-2026-0002',
    relatedOrderNo: 'AO-2026-1002',
    operationCenter: '广州运营中心',
    creator: '超级管理员',
    createDate: '2026-08-09',
    salesman: '王专员',
    warehouse: '广州仓库',
    logisticsCompany: '顺丰',
    trackingNo: 'SF202608090007',
    freight: 150,
    prepayment: 3500,
    remark: '',
    items: [
      {
        id: 'item1',
        productCode: 'P-AO-012',
        barcode: 'AO012',
        productName: '毛巾',
        spec: '纯棉 35*75cm',
        unit: '条',
        quantity: 500,
        costPrice: 6.5,
        costAmount: 3250.0,
      },
    ],
    operator: '王专员',
    operateDate: '2026-08-09',
    costAmountTotal: 3250.0,
    status: 'cancelled',
    createTime: '2026-08-09 13:30:00',
  },
  {
    id: '8',
    orderNo: 'AO-2026-0001',
    relatedOrderNo: 'AO-2026-1003',
    operationCenter: '北京运营中心',
    creator: '超级管理员',
    createDate: '2026-08-05',
    salesman: '赵总监',
    warehouse: '北京仓库',
    logisticsCompany: '圆通',
    trackingNo: 'YT202608050008',
    freight: 520,
    prepayment: 10000,
    remark: '合同首批订单',
    items: [
      {
        id: 'item1',
        productCode: 'P-AO-013',
        barcode: 'AO013',
        productName: '订书机',
        spec: '标准型',
        unit: '个',
        quantity: 200,
        costPrice: 45.0,
        costAmount: 9000.0,
      },
      {
        id: 'item2',
        productCode: 'P-AO-014',
        barcode: 'AO014',
        productName: '固体胶',
        spec: '21g/支',
        unit: '支',
        quantity: 1000,
        costPrice: 2.5,
        costAmount: 2500.0,
      },
    ],
    operator: '赵总监',
    operateDate: '2026-08-05',
    costAmountTotal: 11500.0,
    status: 'completed',
    createTime: '2026-08-05 09:00:00',
  },
]

let nextId = 9
let nextNo = 9

function ensureNextNo() {
  const maxNo = mockAgentOutbounds.reduce((m, o) => {
    const n = parseInt(o.orderNo.replace(/^AO-2026-/, ''), 10)
    return n > m ? n : m
  }, 0)
  nextNo = maxNo + 1
}
ensureNextNo()

export interface QueryParams {
  page?: number
  pageSize?: number
  orderNo?: string
  status?: string
  operationCenter?: string
  logisticsCompany?: string
  operator?: string
  createDate?: string
}

export function queryAgentOutbounds(params: QueryParams): Promise<Result<{ list: AgentOutbound[]; total: number }>> {
  const { page = 1, pageSize = 10, orderNo, status, operationCenter, logisticsCompany, operator, createDate } = params
  let list = [...mockAgentOutbounds]
  if (orderNo) list = list.filter((o) => o.orderNo.includes(orderNo))
  if (status) list = list.filter((o) => o.status === status)
  if (operationCenter) list = list.filter((o) => o.operationCenter === operationCenter)
  if (logisticsCompany) list = list.filter((o) => o.logisticsCompany === logisticsCompany)
  if (operator) list = list.filter((o) => o.operator === operator)
  if (createDate) list = list.filter((o) => o.createDate.startsWith(createDate) || o.createDate === createDate)
  list.sort((a, b) => b.createTime.localeCompare(a.createTime))
  const total = list.length
  const start = (page - 1) * pageSize
  const pageList = list.slice(start, start + pageSize)
  return mockResponse({ list: pageList, total })
}

export function getAgentOutbound(id: string): Promise<Result<AgentOutbound>> {
  const rec = mockAgentOutbounds.find((o) => o.id === id)
  return mockResponse(rec || null)
}

export function createAgentOutbound(data: Partial<AgentOutbound>): Promise<Result<AgentOutbound>> {
  const items = (data.items || []).map((it, idx) => ({
    id: `item_${Date.now()}_${idx}`,
    productCode: it.productCode || '-',
    barcode: it.barcode || '-',
    productName: it.productName || '-',
    spec: it.spec || '-',
    unit: it.unit || '-',
    quantity: it.quantity || 0,
    costPrice: it.costPrice || 0,
    costAmount: (it.quantity || 0) * (it.costPrice || 0),
  }))
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const id = String(nextId++)
  const no = `AO-2026-${String(nextNo++).padStart(4, '0')}`
  const record: AgentOutbound = {
    id,
    orderNo: no,
    relatedOrderNo: data.relatedOrderNo || '',
    operationCenter: data.operationCenter || '',
    creator: data.creator || '超级管理员',
    createDate: dateStr,
    salesman: data.salesman || '超级管理员',
    warehouse: data.warehouse || '',
    logisticsCompany: data.logisticsCompany || '',
    trackingNo: data.trackingNo || '',
    freight: data.freight || 0,
    prepayment: data.prepayment || 0,
    remark: data.remark || '',
    items,
    operator: data.operator || data.salesman || '超级管理员',
    operateDate: dateStr,
    costAmountTotal: calcAmount(items),
    status: data.status || 'draft',
    createTime: `${dateStr} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
  }
  mockAgentOutbounds.unshift(record)
  return mockResponse(record)
}

export function updateAgentOutbound(id: string, data: Partial<AgentOutbound>): Promise<Result<AgentOutbound>> {
  const idx = mockAgentOutbounds.findIndex((o) => o.id === id)
  if (idx < 0) return mockResponse(null as any, 1, '未找到记录')
  const origin = mockAgentOutbounds[idx]
  let items = origin.items
  if (data.items) {
    items = data.items.map((it, i) => ({
      id: it.id || `item_${Date.now()}_${i}`,
      productCode: it.productCode || '-',
      barcode: it.barcode || '-',
      productName: it.productName || '-',
      spec: it.spec || '-',
      unit: it.unit || '-',
      quantity: it.quantity || 0,
      costPrice: it.costPrice || 0,
      costAmount: (it.quantity || 0) * (it.costPrice || 0),
    }))
  }
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const updated: AgentOutbound = {
    ...origin,
    ...data,
    id: origin.id,
    orderNo: origin.orderNo,
    items,
    costAmountTotal: calcAmount(items),
    operateDate: dateStr,
    operator: data.operator || origin.operator,
  }
  mockAgentOutbounds[idx] = updated
  return mockResponse(updated)
}

export function deleteAgentOutbound(id: string): Promise<Result<boolean>> {
  const idx = mockAgentOutbounds.findIndex((o) => o.id === id)
  if (idx < 0) return mockResponse(false, 1, '未找到记录')
  mockAgentOutbounds.splice(idx, 1)
  return mockResponse(true)
}
