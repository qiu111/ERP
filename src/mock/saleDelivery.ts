import type { Result } from '@/http'
import { mockResponse } from '@/mock'

export interface DeliveryItem {
  id: string
  barcode: string
  productName: string
  spec: string
  unit: string
  quantity: number
  purchasePrice: number
  purchaseAmount: number
  retailPrice: number
  retailAmount: number
  exchangePoints: number
  totalPoints: number
}

export interface SaleDelivery {
  id: string
  deliveryNo: string
  orderNo: string
  customer: string
  salesperson: string
  warehouse: string
  operator: string
  operateDate: string
  auditor: string
  auditDate: string
  prepaymentDate: string
  remark: string
  items: DeliveryItem[]
  totalAmount: number
  status: 'draft' | 'confirmed' | 'completed' | 'cancelled'
  createTime: string
}

export const deliveryStatusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '已确认', value: 'confirmed' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
]

export const deliveryStatusMap: Record<string, { text: string; color: string }> = {
  draft: { text: '草稿', color: '#909399' },
  confirmed: { text: '已确认', color: '#409eff' },
  completed: { text: '已完成', color: '#67c23a' },
  cancelled: { text: '已取消', color: '#f56c6c' },
}

export const deliveryCustomerOptions = [
  { label: '客户A', value: '客户A' },
  { label: '客户B', value: '客户B' },
  { label: '客户C', value: '客户C' },
  { label: '客户D', value: '客户D' },
  { label: '客户E', value: '客户E' },
]

export const deliveryWarehouseOptions = [
  { label: '仓库A', value: '仓库A' },
  { label: '仓库B', value: '仓库B' },
  { label: '仓库C', value: '仓库C' },
  { label: '仓库D', value: '仓库D' },
]

export const deliveryOperatorOptions = [
  { label: '超级管理员', value: '超级管理员' },
  { label: '销售经理', value: '销售经理' },
  { label: '销售专员', value: '销售专员' },
]

export const deliveryAuditorOptions = [
  { label: '超级管理员', value: '超级管理员' },
  { label: '财务主管', value: '财务主管' },
  { label: '销售经理', value: '销售经理' },
]

const mockDeliveries: SaleDelivery[] = [
  {
    id: '1',
    deliveryNo: 'SO-2026-0008',
    orderNo: 'SO-2026-0008',
    customer: '客户A',
    salesperson: '销售经理',
    warehouse: '仓库A',
    operator: '超级管理员',
    operateDate: '2026-08-18',
    auditor: '销售经理',
    auditDate: '2026-08-19',
    prepaymentDate: '2026-08-17',
    remark: '常规订单出库',
    items: [
      {
        id: 'item1',
        barcode: 'BD001',
        productName: 'A4打印纸',
        spec: '70g 500张',
        unit: '箱',
        quantity: 100,
        purchasePrice: 18.0,
        purchaseAmount: 1800.0,
        retailPrice: 25.0,
        retailAmount: 2500.0,
        exchangePoints: 0,
        totalPoints: 0,
      },
      {
        id: 'item2',
        barcode: 'BD002',
        productName: '签字笔',
        spec: '黑色 0.5mm',
        unit: '盒',
        quantity: 50,
        purchasePrice: 45.0,
        purchaseAmount: 2250.0,
        retailPrice: 60.0,
        retailAmount: 3000.0,
        exchangePoints: 0,
        totalPoints: 0,
      },
    ],
    totalAmount: 5500.0,
    status: 'completed',
    createTime: '2026-08-18 10:30:00',
  },
  {
    id: '2',
    deliveryNo: 'SO-2026-0007',
    orderNo: 'SO-2026-0007',
    customer: '客户B',
    salesperson: '销售经理',
    warehouse: '仓库B',
    operator: '销售经理',
    operateDate: '2026-08-14',
    auditor: '',
    auditDate: '',
    prepaymentDate: '2026-08-10',
    remark: '',
    items: [
      {
        id: 'item1',
        barcode: 'BD003',
        productName: '洗衣液',
        spec: '2kg装',
        unit: '瓶',
        quantity: 200,
        purchasePrice: 25.0,
        purchaseAmount: 5000.0,
        retailPrice: 35.0,
        retailAmount: 7000.0,
        exchangePoints: 0,
        totalPoints: 0,
      },
    ],
    totalAmount: 7000.0,
    status: 'confirmed',
    createTime: '2026-08-14 14:20:00',
  },
  {
    id: '3',
    deliveryNo: 'SO-2026-0006',
    orderNo: 'SO-2026-0006',
    customer: '客户C',
    salesperson: '销售专员',
    warehouse: '仓库C',
    operator: '销售专员',
    operateDate: '2026-08-11',
    auditor: '',
    auditDate: '',
    prepaymentDate: '',
    remark: '待审核',
    items: [
      {
        id: 'item1',
        barcode: 'BD004',
        productName: '大米',
        spec: '25kg装',
        unit: '袋',
        quantity: 50,
        purchasePrice: 40.0,
        purchaseAmount: 2000.0,
        retailPrice: 55.0,
        retailAmount: 2750.0,
        exchangePoints: 0,
        totalPoints: 0,
      },
    ],
    totalAmount: 2750.0,
    status: 'draft',
    createTime: '2026-08-11 09:15:00',
  },
  {
    id: '4',
    deliveryNo: 'SO-2026-0005',
    orderNo: 'SO-2026-0005',
    customer: '客户A',
    salesperson: '超级管理员',
    warehouse: '仓库A',
    operator: '超级管理员',
    operateDate: '2026-08-08',
    auditor: '财务主管',
    auditDate: '2026-08-09',
    prepaymentDate: '2026-08-07',
    remark: '加急订单',
    items: [
      {
        id: 'item1',
        barcode: 'BD005',
        productName: '洗洁精',
        spec: '500ml',
        unit: '瓶',
        quantity: 200,
        purchasePrice: 10.0,
        purchaseAmount: 2000.0,
        retailPrice: 15.0,
        retailAmount: 3000.0,
        exchangePoints: 0,
        totalPoints: 0,
      },
      {
        id: 'item2',
        barcode: 'BD006',
        productName: '毛巾',
        spec: '纯棉 35x75cm',
        unit: '条',
        quantity: 100,
        purchasePrice: 30.0,
        purchaseAmount: 3000.0,
        retailPrice: 45.0,
        retailAmount: 4500.0,
        exchangePoints: 0,
        totalPoints: 0,
      },
    ],
    totalAmount: 7500.0,
    status: 'completed',
    createTime: '2026-08-08 16:45:00',
  },
  {
    id: '5',
    deliveryNo: 'SO-2026-0004',
    orderNo: 'SO-2026-0004',
    customer: '客户D',
    salesperson: '销售经理',
    warehouse: '仓库B',
    operator: '销售经理',
    operateDate: '2026-08-05',
    auditor: '销售经理',
    auditDate: '2026-08-06',
    prepaymentDate: '2026-08-04',
    remark: '',
    items: [
      {
        id: 'item1',
        barcode: 'BD007',
        productName: '办公椅',
        spec: '网布 黑色',
        unit: '把',
        quantity: 50,
        purchasePrice: 120.0,
        purchaseAmount: 6000.0,
        retailPrice: 180.0,
        retailAmount: 9000.0,
        exchangePoints: 0,
        totalPoints: 0,
      },
    ],
    totalAmount: 9000.0,
    status: 'completed',
    createTime: '2026-08-05 11:20:00',
  },
  {
    id: '6',
    deliveryNo: 'SO-2026-0003',
    orderNo: 'SO-2026-0003',
    customer: '客户B',
    salesperson: '销售专员',
    warehouse: '仓库C',
    operator: '销售专员',
    operateDate: '2026-08-02',
    auditor: '',
    auditDate: '',
    prepaymentDate: '2026-08-01',
    remark: '',
    items: [
      {
        id: 'item1',
        barcode: 'BD008',
        productName: '文件夹',
        spec: 'A4 双夹',
        unit: '个',
        quantity: 300,
        purchasePrice: 8.0,
        purchaseAmount: 2400.0,
        retailPrice: 12.0,
        retailAmount: 3600.0,
        exchangePoints: 0,
        totalPoints: 0,
      },
    ],
    totalAmount: 3600.0,
    status: 'confirmed',
    createTime: '2026-08-02 13:10:00',
  },
  {
    id: '7',
    deliveryNo: 'SO-2026-0002',
    orderNo: 'SO-2026-0002',
    customer: '客户A',
    salesperson: '超级管理员',
    warehouse: '仓库D',
    operator: '超级管理员',
    operateDate: '2026-07-30',
    auditor: '',
    auditDate: '',
    prepaymentDate: '2026-07-29',
    remark: '',
    items: [
      {
        id: 'item1',
        barcode: 'BD009',
        productName: '水杯',
        spec: '350ml 不锈钢',
        unit: '个',
        quantity: 100,
        purchasePrice: 15.0,
        purchaseAmount: 1500.0,
        retailPrice: 22.0,
        retailAmount: 2200.0,
        exchangePoints: 0,
        totalPoints: 0,
      },
    ],
    totalAmount: 2200.0,
    status: 'draft',
    createTime: '2026-07-30 08:30:00',
  },
  {
    id: '8',
    deliveryNo: 'SO-2026-0001',
    orderNo: 'SO-2026-0001',
    customer: '客户E',
    salesperson: '销售经理',
    warehouse: '仓库A',
    operator: '销售经理',
    operateDate: '2026-07-26',
    auditor: '财务主管',
    auditDate: '2026-07-27',
    prepaymentDate: '2026-07-25',
    remark: '季度订单',
    items: [
      {
        id: 'item1',
        barcode: 'BD010',
        productName: '打印机硒鼓',
        spec: 'HP CF226A',
        unit: '个',
        quantity: 40,
        purchasePrice: 280.0,
        purchaseAmount: 11200.0,
        retailPrice: 390.0,
        retailAmount: 15600.0,
        exchangePoints: 0,
        totalPoints: 0,
      },
    ],
    totalAmount: 15600.0,
    status: 'completed',
    createTime: '2026-07-26 15:00:00',
  },
]

const deliveryStore: SaleDelivery[] = JSON.parse(JSON.stringify(mockDeliveries))

export function getSaleDeliveryPage(params: {
  page: number
  pageSize: number
  deliveryNo?: string
  operator?: string
  startDate?: string
  endDate?: string
  customer?: string
  status?: string
  warehouse?: string
}): Promise<Result<{ list: SaleDelivery[]; total: number }>> {
  let filtered = [...deliveryStore]

  if (params.deliveryNo) {
    const kw = params.deliveryNo.toLowerCase()
    filtered = filtered.filter(
      (r) => r.deliveryNo.toLowerCase().includes(kw)
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

export function getSaleDeliveryById(id: string): Promise<Result<SaleDelivery>> {
  const record = deliveryStore.find((r) => r.id === id)
  if (record) {
    return mockResponse(record)
  }
  return mockResponse({} as SaleDelivery, '未找到该销售出库单')
}

export function addSaleDelivery(data: Omit<SaleDelivery, 'id' | 'createTime' | 'totalAmount'> & { id?: string }): Promise<Result<SaleDelivery>> {
  const totalAmount = data.items.reduce((sum, item) => sum + (item.retailAmount || 0), 0)
  const newRecord: SaleDelivery = {
    ...data,
    id: data.id || String(Date.now()),
    totalAmount,
    createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
  }
  deliveryStore.push(newRecord)
  return mockResponse(newRecord, '添加成功')
}

export function updateSaleDelivery(id: string, data: Partial<SaleDelivery>): Promise<Result<SaleDelivery>> {
  const idx = deliveryStore.findIndex((r) => r.id === id)
  if (idx >= 0) {
    const items = data.items || deliveryStore[idx].items
    const totalAmount = items.reduce((sum, item) => sum + (item.retailAmount || 0), 0)
    deliveryStore[idx] = { ...deliveryStore[idx], ...data, id, totalAmount }
    return mockResponse(deliveryStore[idx], '更新成功')
  }
  return mockResponse({} as SaleDelivery, '未找到该销售出库单')
}

export function deleteSaleDelivery(id: string): Promise<Result<void>> {
  const idx = deliveryStore.findIndex((r) => r.id === id)
  if (idx >= 0) {
    deliveryStore.splice(idx, 1)
    return mockResponse(undefined, '删除成功')
  }
  return mockResponse(undefined, '未找到该销售出库单')
}