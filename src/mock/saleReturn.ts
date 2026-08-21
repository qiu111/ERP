import type { Result } from '@/http'
import { mockResponse } from '@/mock'

export interface SaleReturnItem {
  id: string
  barcode: string
  productName: string
  productCode: string
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

export interface SaleReturn {
  id: string
  returnNo: string
  creator: string
  createDate: string
  customer: string
  salesperson: string
  warehouse: string
  auditDate: string
  prepaymentDate: string
  operator: string
  operateDate: string
  auditor: string
  amount: number
  remark: string
  items: SaleReturnItem[]
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

export const customerOptions = [
  { label: '客户A', value: '客户A' },
  { label: '客户B', value: '客户B' },
  { label: '客户C', value: '客户C' },
  { label: '客户D', value: '客户D' },
  { label: '客户E', value: '客户E' },
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

export const salespersonOptions = [
  { label: '超级管理员', value: '超级管理员' },
  { label: '销售经理', value: '销售经理' },
  { label: '销售专员', value: '销售专员' },
]

const mockReturns: SaleReturn[] = [
  {
    id: '1',
    returnNo: 'SR-2026-0005',
    creator: '超级管理员',
    createDate: '2026-08-18',
    customer: '客户A',
    salesperson: '销售经理',
    warehouse: '仓库A',
    auditDate: '2026-08-19',
    prepaymentDate: '2026-08-20',
    operator: '超级管理员',
    operateDate: '2026-08-18',
    auditor: '销售经理',
    amount: 260.00,
    remark: '客户反馈商品有质量问题，同意退货',
    items: [
      {
        id: 'item1',
        barcode: 'SP003',
        productName: 'A4打印纸',
        productCode: 'P001',
        spec: '70g 500张',
        unit: '箱',
        quantity: 5,
        purchasePrice: 22.0,
        purchaseAmount: 110.0,
        retailPrice: 28.0,
        retailAmount: 140.0,
        exchangePoints: 50,
        totalPoints: 250,
      },
      {
        id: 'item2',
        barcode: 'SP004',
        productName: '签字笔',
        productCode: 'P002',
        spec: '黑色 0.5mm',
        unit: '盒',
        quantity: 10,
        purchasePrice: 12.0,
        purchaseAmount: 120.0,
        retailPrice: 15.0,
        retailAmount: 150.0,
        exchangePoints: 30,
        totalPoints: 300,
      },
    ],
    status: 'completed',
    createTime: '2026-08-18 10:30:00',
  },
  {
    id: '2',
    returnNo: 'SR-2026-0004',
    creator: '销售经理',
    createDate: '2026-08-15',
    customer: '客户B',
    salesperson: '销售经理',
    warehouse: '仓库B',
    auditDate: '',
    prepaymentDate: '2026-08-16',
    operator: '销售经理',
    operateDate: '2026-08-15',
    auditor: '',
    amount: 600.00,
    remark: '客户多发商品退回',
    items: [
      {
        id: 'item1',
        barcode: 'SP005',
        productName: '洗衣液',
        productCode: 'P003',
        spec: '2kg装',
        unit: '瓶',
        quantity: 20,
        purchasePrice: 30.0,
        purchaseAmount: 600.0,
        retailPrice: 38.0,
        retailAmount: 760.0,
        exchangePoints: 80,
        totalPoints: 1600,
      },
    ],
    status: 'confirmed',
    createTime: '2026-08-15 14:20:00',
  },
  {
    id: '3',
    returnNo: 'SR-2026-0003',
    creator: '销售专员',
    createDate: '2026-08-10',
    customer: '客户C',
    salesperson: '销售专员',
    warehouse: '仓库C',
    auditDate: '',
    prepaymentDate: '',
    operator: '销售专员',
    operateDate: '2026-08-10',
    auditor: '',
    amount: 11200.00,
    remark: '',
    items: [
      {
        id: 'item1',
        barcode: 'SP012',
        productName: '大米',
        productCode: 'P004',
        spec: '25kg装',
        unit: '袋',
        quantity: 100,
        purchasePrice: 48.0,
        purchaseAmount: 4800.0,
        retailPrice: 55.0,
        retailAmount: 5500.0,
        exchangePoints: 100,
        totalPoints: 10000,
      },
      {
        id: 'item2',
        barcode: 'SP013',
        productName: '食用油',
        productCode: 'P005',
        spec: '5L装',
        unit: '桶',
        quantity: 100,
        purchasePrice: 68.0,
        purchaseAmount: 6800.0,
        retailPrice: 78.0,
        retailAmount: 7800.0,
        exchangePoints: 120,
        totalPoints: 12000,
      },
    ],
    status: 'draft',
    createTime: '2026-08-10 09:15:00',
  },
  {
    id: '4',
    returnNo: 'SR-2026-0002',
    creator: '超级管理员',
    createDate: '2026-08-05',
    customer: '客户D',
    salesperson: '销售经理',
    warehouse: '仓库A',
    auditDate: '',
    prepaymentDate: '2026-08-06',
    operator: '超级管理员',
    operateDate: '2026-08-05',
    auditor: '',
    amount: 3750.00,
    remark: '规格不符，客户要求退货',
    items: [
      {
        id: 'item1',
        barcode: 'SP006',
        productName: '办公椅',
        productCode: 'P006',
        spec: '网布 黑色',
        unit: '把',
        quantity: 25,
        purchasePrice: 150.0,
        purchaseAmount: 3750.0,
        retailPrice: 180.0,
        retailAmount: 4500.0,
        exchangePoints: 300,
        totalPoints: 7500,
      },
    ],
    status: 'draft',
    createTime: '2026-08-05 16:45:00',
  },
]

const returnStore: SaleReturn[] = JSON.parse(JSON.stringify(mockReturns))

export function getSaleReturnPage(params: {
  page: number
  pageSize: number
  returnNo?: string
  operator?: string
  startDate?: string
  endDate?: string
  customer?: string
  status?: string
  warehouse?: string
}): Promise<Result<{ list: SaleReturn[]; total: number }>> {
  let filtered = [...returnStore]

  if (params.returnNo) {
    const kw = params.returnNo.toLowerCase()
    filtered = filtered.filter(
      (r) => r.returnNo.toLowerCase().includes(kw)
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

export function getSaleReturnById(id: string): Promise<Result<SaleReturn>> {
  const record = returnStore.find((r) => r.id === id)
  if (record) {
    return mockResponse(record)
  }
  return mockResponse({} as SaleReturn, '未找到该销售退货单')
}

export function addSaleReturn(data: Omit<SaleReturn, 'id' | 'createTime' | 'amount'> & { id?: string }): Promise<Result<SaleReturn>> {
  const amount = data.items.reduce((sum, item) => sum + (item.purchaseAmount || 0), 0)
  const newRecord: SaleReturn = {
    ...data,
    id: data.id || String(Date.now()),
    amount,
    createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
  }
  returnStore.push(newRecord)
  return mockResponse(newRecord, '添加成功')
}

export function updateSaleReturn(id: string, data: Partial<SaleReturn>): Promise<Result<SaleReturn>> {
  const idx = returnStore.findIndex((r) => r.id === id)
  if (idx >= 0) {
    const items = data.items || returnStore[idx].items
    const amount = items.reduce((sum, item) => sum + (item.purchaseAmount || 0), 0)
    returnStore[idx] = { ...returnStore[idx], ...data, id, amount }
    return mockResponse(returnStore[idx], '更新成功')
  }
  return mockResponse({} as SaleReturn, '未找到该销售退货单')
}

export function deleteSaleReturn(id: string): Promise<Result<void>> {
  const idx = returnStore.findIndex((r) => r.id === id)
  if (idx >= 0) {
    returnStore.splice(idx, 1)
    return mockResponse(undefined, '删除成功')
  }
  return mockResponse(undefined, '未找到该销售退货单')
}
