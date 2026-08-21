import type { Result } from '@/http'
import { mockResponse } from '@/mock'

export interface PIItem {
  id: string
  productName: string
  spec: string
  unit: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface SalePI {
  id: string
  piNo: string
  warehouse: string
  customer: string
  amount: number
  operator: string
  operateDate: string
  auditor: string
  auditDate: string
  status: 'draft' | 'confirmed' | 'completed' | 'cancelled'
  remark: string
  items: PIItem[]
  createTime: string
  creator: string
  createDate: string
}

export const piStatusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '已确认', value: 'confirmed' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
]

export const piStatusMap: Record<string, { text: string; color: string }> = {
  draft: { text: '草稿', color: '#909399' },
  confirmed: { text: '已确认', color: '#409eff' },
  completed: { text: '已完成', color: '#67c23a' },
  cancelled: { text: '已取消', color: '#f56c6c' },
}

export const customerOptions = [
  { label: '客户A', value: '客户A' },
  { label: '客户B', value: '客户B' },
  { label: '客户C', value: '客户C' },
  { label: '客户D', value: '客户D' },
  { label: '客户E', value: '客户E' },
  { label: '客户F', value: '客户F' },
]

export const warehouseOptions = [
  { label: '仓库A', value: '仓库A' },
  { label: '仓库B', value: '仓库B' },
  { label: '仓库C', value: '仓库C' },
  { label: '仓库D', value: '仓库D' },
]

export const operatorOptions = [
  { label: '超级管理员', value: '超级管理员' },
  { label: '销售经理', value: '销售经理' },
  { label: '销售专员', value: '销售专员' },
]

export const auditorOptions = [
  { label: '超级管理员', value: '超级管理员' },
  { label: '财务主管', value: '财务主管' },
  { label: '销售经理', value: '销售经理' },
]

const mockPIs: SalePI[] = [
  {
    id: '1',
    piNo: 'PIO-0000-190912-0001',
    warehouse: '仓库A',
    customer: '客户A',
    amount: 5200.00,
    operator: '超级管理员',
    operateDate: '2026-08-15',
    auditor: '销售经理',
    auditDate: '2026-08-16',
    status: 'completed',
    remark: '常规订单',
    items: [
      {
        id: 'item1',
        productName: 'A4打印纸',
        spec: '70g 500张',
        unit: '箱',
        quantity: 100,
        unitPrice: 22.0,
        amount: 2200.0,
      },
      {
        id: 'item2',
        productName: '签字笔',
        spec: '黑色 0.5mm',
        unit: '盒',
        quantity: 50,
        unitPrice: 60.0,
        amount: 3000.0,
      },
    ],
    createTime: '2026-08-15 10:30:00',
    creator: '超级管理员',
    createDate: '2026-08-15',
  },
  {
    id: '2',
    piNo: 'PIO-0000-190912-0002',
    warehouse: '仓库A',
    customer: '客户A',
    amount: 3500.00,
    operator: '超级管理员',
    operateDate: '2026-08-12',
    auditor: '',
    auditDate: '',
    status: 'confirmed',
    remark: '',
    items: [
      {
        id: 'item1',
        productName: '洗衣液',
        spec: '2kg装',
        unit: '瓶',
        quantity: 100,
        unitPrice: 35.0,
        amount: 3500.0,
      },
    ],
    createTime: '2026-08-12 14:20:00',
    creator: '超级管理员',
    createDate: '2026-08-12',
  },
  {
    id: '3',
    piNo: 'PIO-0000-190912-0003',
    warehouse: '仓库A',
    customer: '客户B',
    amount: 12800.00,
    operator: '销售经理',
    operateDate: '2026-08-10',
    auditor: '',
    auditDate: '',
    status: 'draft',
    remark: '待审核',
    items: [
      {
        id: 'item1',
        productName: '大米',
        spec: '25kg装',
        unit: '袋',
        quantity: 100,
        unitPrice: 48.0,
        amount: 4800.0,
      },
      {
        id: 'item2',
        productName: '食用油',
        spec: '5L装',
        unit: '桶',
        quantity: 100,
        unitPrice: 80.0,
        amount: 8000.0,
      },
    ],
    createTime: '2026-08-10 09:15:00',
    creator: '销售经理',
    createDate: '2026-08-10',
  },
  {
    id: '4',
    piNo: 'PIO-0000-190912-0004',
    warehouse: '仓库A',
    customer: '客户C',
    amount: 6600.00,
    operator: '销售专员',
    operateDate: '2026-08-08',
    auditor: '财务主管',
    auditDate: '2026-08-09',
    status: 'completed',
    remark: '',
    items: [
      {
        id: 'item1',
        productName: '洗洁精',
        spec: '500ml',
        unit: '瓶',
        quantity: 200,
        unitPrice: 12.0,
        amount: 2400.0,
      },
      {
        id: 'item2',
        productName: '毛巾',
        spec: '纯棉 35x75cm',
        unit: '条',
        quantity: 100,
        unitPrice: 42.0,
        amount: 4200.0,
      },
    ],
    createTime: '2026-08-08 16:45:00',
    creator: '销售专员',
    createDate: '2026-08-08',
  },
  {
    id: '5',
    piNo: 'PIO-0000-190912-0005',
    warehouse: '仓库B',
    customer: '客户D',
    amount: 8900.00,
    operator: '超级管理员',
    operateDate: '2026-08-05',
    auditor: '销售经理',
    auditDate: '2026-08-06',
    status: 'completed',
    remark: '加急订单',
    items: [
      {
        id: 'item1',
        productName: '办公椅',
        spec: '网布 黑色',
        unit: '把',
        quantity: 50,
        unitPrice: 178.0,
        amount: 8900.0,
      },
    ],
    createTime: '2026-08-05 11:20:00',
    creator: '超级管理员',
    createDate: '2026-08-05',
  },
  {
    id: '6',
    piNo: 'PIO-0000-190912-0006',
    warehouse: '仓库B',
    customer: '客户E',
    amount: 4500.00,
    operator: '销售经理',
    operateDate: '2026-08-03',
    auditor: '',
    auditDate: '',
    status: 'confirmed',
    remark: '',
    items: [
      {
        id: 'item1',
        productName: '文件夹',
        spec: 'A4 双夹',
        unit: '个',
        quantity: 300,
        unitPrice: 15.0,
        amount: 4500.0,
      },
    ],
    createTime: '2026-08-03 13:10:00',
    creator: '销售经理',
    createDate: '2026-08-03',
  },
  {
    id: '7',
    piNo: 'PIO-0000-190912-0007',
    warehouse: '仓库C',
    customer: '客户B',
    amount: 2200.00,
    operator: '销售专员',
    operateDate: '2026-08-01',
    auditor: '',
    auditDate: '',
    status: 'draft',
    remark: '',
    items: [
      {
        id: 'item1',
        productName: '水杯',
        spec: '350ml 不锈钢',
        unit: '个',
        quantity: 100,
        unitPrice: 22.0,
        amount: 2200.0,
      },
    ],
    createTime: '2026-08-01 08:30:00',
    creator: '销售专员',
    createDate: '2026-08-01',
  },
  {
    id: '8',
    piNo: 'PIO-0000-190912-0008',
    warehouse: '仓库C',
    customer: '客户F',
    amount: 15600.00,
    operator: '超级管理员',
    operateDate: '2026-07-28',
    auditor: '财务主管',
    auditDate: '2026-07-29',
    status: 'completed',
    remark: '季度订单',
    items: [
      {
        id: 'item1',
        productName: '打印机硒鼓',
        spec: 'HP CF226A',
        unit: '个',
        quantity: 40,
        unitPrice: 390.0,
        amount: 15600.0,
      },
    ],
    createTime: '2026-07-28 15:00:00',
    creator: '超级管理员',
    createDate: '2026-07-28',
  },
  {
    id: '9',
    piNo: 'PIO-0000-190912-0009',
    warehouse: '仓库D',
    customer: '客户C',
    amount: 3200.00,
    operator: '销售经理',
    operateDate: '2026-07-25',
    auditor: '',
    auditDate: '',
    status: 'cancelled',
    remark: '客户取消',
    items: [
      {
        id: 'item1',
        productName: '白板',
        spec: '1.2m x 2.4m',
        unit: '块',
        quantity: 8,
        unitPrice: 400.0,
        amount: 3200.0,
      },
    ],
    createTime: '2026-07-25 10:45:00',
    creator: '销售经理',
    createDate: '2026-07-25',
  },
  {
    id: '10',
    piNo: 'PIO-0000-190912-0010',
    warehouse: '仓库A',
    customer: '客户D',
    amount: 7800.00,
    operator: '销售专员',
    operateDate: '2026-07-20',
    auditor: '销售经理',
    auditDate: '2026-07-21',
    status: 'completed',
    remark: '',
    items: [
      {
        id: 'item1',
        productName: '碎纸机',
        spec: '4x30mm 大容量',
        unit: '台',
        quantity: 6,
        unitPrice: 1300.0,
        amount: 7800.0,
      },
    ],
    createTime: '2026-07-20 14:30:00',
    creator: '销售专员',
    createDate: '2026-07-20',
  },
  {
    id: '11',
    piNo: 'PIO-0000-190912-0011',
    warehouse: '仓库B',
    customer: '客户A',
    amount: 9500.00,
    operator: '超级管理员',
    operateDate: '2026-07-15',
    auditor: '',
    auditDate: '',
    status: 'confirmed',
    remark: '等待发货',
    items: [
      {
        id: 'item1',
        productName: '会议桌',
        spec: '2.4m x 1.2m',
        unit: '张',
        quantity: 2,
        unitPrice: 4750.0,
        amount: 9500.0,
      },
    ],
    createTime: '2026-07-15 09:00:00',
    creator: '超级管理员',
    createDate: '2026-07-15',
  },
]

const piStore: SalePI[] = JSON.parse(JSON.stringify(mockPIs))

export function getSalePIPage(params: {
  page: number
  pageSize: number
  piNo?: string
  operator?: string
  startDate?: string
  endDate?: string
  customer?: string
  status?: string
  warehouse?: string
}): Promise<Result<{ list: SalePI[]; total: number }>> {
  let filtered = [...piStore]

  if (params.piNo) {
    const kw = params.piNo.toLowerCase()
    filtered = filtered.filter(
      (r) => r.piNo.toLowerCase().includes(kw)
    )
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
  if (params.customer) {
    filtered = filtered.filter((r) => r.customer === params.customer)
  }
  if (params.status) {
    filtered = filtered.filter((r) => r.status === params.status)
  }
  if (params.warehouse) {
    filtered = filtered.filter((r) => r.warehouse === params.warehouse)
  }

  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  const list = filtered.slice(start, start + params.pageSize)
  return mockResponse({ list, total })
}

export function getSalePIById(id: string): Promise<Result<SalePI>> {
  const record = piStore.find((r) => r.id === id)
  if (record) {
    return mockResponse(record)
  }
  return mockResponse({} as SalePI, '未找到该外销PI单')
}

export function addSalePI(data: Omit<SalePI, 'id' | 'createTime' | 'amount'> & { id?: string }): Promise<Result<SalePI>> {
  const amount = data.items.reduce((sum, item) => sum + (item.amount || 0), 0)
  const newRecord: SalePI = {
    ...data,
    id: data.id || String(Date.now()),
    amount,
    createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
  }
  piStore.push(newRecord)
  return mockResponse(newRecord, '添加成功')
}

export function updateSalePI(id: string, data: Partial<SalePI>): Promise<Result<SalePI>> {
  const idx = piStore.findIndex((r) => r.id === id)
  if (idx >= 0) {
    const items = data.items || piStore[idx].items
    const amount = items.reduce((sum, item) => sum + (item.amount || 0), 0)
    piStore[idx] = { ...piStore[idx], ...data, id, amount }
    return mockResponse(piStore[idx], '更新成功')
  }
  return mockResponse({} as SalePI, '未找到该外销PI单')
}

export function deleteSalePI(id: string): Promise<Result<void>> {
  const idx = piStore.findIndex((r) => r.id === id)
  if (idx >= 0) {
    piStore.splice(idx, 1)
    return mockResponse(undefined, '删除成功')
  }
  return mockResponse(undefined, '未找到该外销PI单')
}