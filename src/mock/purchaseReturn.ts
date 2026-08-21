import type { Result } from '@/http'
import { mockResponse } from '@/mock'

export interface ReturnItem {
  id: string
  barcode: string
  productName: string
  spec: string
  unit: string
  returnQuantity: number
  returnReason: string
  factoryPrice: number
  factoryAmount: number
}

export interface PurchaseReturn {
  id: string
  returnNo: string
  creator: string
  createDate: string
  supplier: string
  buyer: string
  warehouse: string
  auditDate: string
  prepaymentDate: string
  operator: string
  operateDate: string
  auditor: string
  amount: number
  remark: string
  items: ReturnItem[]
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

export const returnReasonOptions = [
  { label: '质量问题', value: '质量问题' },
  { label: '规格不符', value: '规格不符' },
  { label: '多发商品', value: '多发商品' },
  { label: '客户退货', value: '客户退货' },
  { label: '其他原因', value: '其他原因' },
]

export const supplierOptions = [
  { label: '供应商A', value: '供应商A' },
  { label: '供应商B', value: '供应商B' },
  { label: '供应商C', value: '供应商C' },
  { label: '供应商D', value: '供应商D' },
]

export const warehouseOptions = [
  { label: '仓库A', value: '仓库A' },
  { label: '仓库B', value: '仓库B' },
  { label: '仓库C', value: '仓库C' },
  { label: '仓库D', value: '仓库D' },
]

export const operatorOptions = [
  { label: '超级管理员', value: '超级管理员' },
  { label: '采购经理', value: '采购经理' },
  { label: '采购专员', value: '采购专员' },
]

const mockReturns: PurchaseReturn[] = [
  {
    id: '1',
    returnNo: 'RT-2026-0005',
    creator: '超级管理员',
    createDate: '2026-08-15',
    supplier: '供应商A',
    buyer: '采购员A',
    warehouse: '仓库A',
    auditDate: '2026-08-16',
    prepaymentDate: '2026-08-17',
    operator: '超级管理员',
    operateDate: '2026-08-15',
    auditor: '采购经理',
    amount: 550.00,
    remark: '商品质量问题，需要退货返厂',
    items: [
      {
        id: 'item1',
        barcode: 'SP003',
        productName: 'A4打印纸',
        spec: '70g 500张',
        unit: '箱',
        returnQuantity: 10,
        returnReason: '质量问题',
        factoryPrice: 22.0,
        factoryAmount: 220.0,
      },
      {
        id: 'item2',
        barcode: 'SP004',
        productName: '签字笔',
        spec: '黑色 0.5mm',
        unit: '盒',
        returnQuantity: 20,
        returnReason: '规格不符',
        factoryPrice: 12.0,
        factoryAmount: 240.0,
      },
    ],
    status: 'completed',
    createTime: '2026-08-15 10:30:00',
  },
  {
    id: '2',
    returnNo: 'RT-2026-0004',
    creator: '采购经理',
    createDate: '2026-08-10',
    supplier: '供应商B',
    buyer: '采购员B',
    warehouse: '仓库B',
    auditDate: '',
    prepaymentDate: '2026-08-11',
    operator: '采购经理',
    operateDate: '2026-08-10',
    auditor: '',
    amount: 600.00,
    remark: '多发商品退回',
    items: [
      {
        id: 'item1',
        barcode: 'SP005',
        productName: '洗衣液',
        spec: '2kg装',
        unit: '瓶',
        returnQuantity: 20,
        returnReason: '多发商品',
        factoryPrice: 30.0,
        factoryAmount: 600.0,
      },
    ],
    status: 'confirmed',
    createTime: '2026-08-10 14:20:00',
  },
  {
    id: '3',
    returnNo: 'RT-2026-0003',
    creator: '采购专员',
    createDate: '2026-08-05',
    supplier: '供应商C',
    buyer: '采购员C',
    warehouse: '仓库C',
    auditDate: '',
    prepaymentDate: '',
    operator: '采购专员',
    operateDate: '2026-08-05',
    auditor: '',
    amount: 11200.00,
    remark: '',
    items: [
      {
        id: 'item1',
        barcode: 'SP012',
        productName: '大米',
        spec: '25kg装',
        unit: '袋',
        returnQuantity: 100,
        returnReason: '客户退货',
        factoryPrice: 48.0,
        factoryAmount: 4800.0,
      },
      {
        id: 'item2',
        barcode: 'SP013',
        productName: '食用油',
        spec: '5L装',
        unit: '桶',
        returnQuantity: 100,
        returnReason: '质量问题',
        factoryPrice: 68.0,
        factoryAmount: 6800.0,
      },
    ],
    status: 'draft',
    createTime: '2026-08-05 09:15:00',
  },
]

const returnStore: PurchaseReturn[] = JSON.parse(JSON.stringify(mockReturns))

export function getPurchaseReturnPage(params: {
  page: number
  pageSize: number
  returnNo?: string
  operator?: string
  startDate?: string
  endDate?: string
  supplier?: string
  status?: string
  warehouse?: string
}): Promise<Result<{ list: PurchaseReturn[]; total: number }>> {
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
  if (params.supplier) {
    filtered = filtered.filter((r) => r.supplier === params.supplier)
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

export function getPurchaseReturnById(id: string): Promise<Result<PurchaseReturn>> {
  const record = returnStore.find((r) => r.id === id)
  if (record) {
    return mockResponse(record)
  }
  return mockResponse({} as PurchaseReturn, '未找到该退货返厂单')
}

export function addPurchaseReturn(data: Omit<PurchaseReturn, 'id' | 'createTime' | 'amount'> & { id?: string }): Promise<Result<PurchaseReturn>> {
  const amount = data.items.reduce((sum, item) => sum + (item.factoryAmount || 0), 0)
  const newRecord: PurchaseReturn = {
    ...data,
    id: data.id || String(Date.now()),
    amount,
    createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
  }
  returnStore.push(newRecord)
  return mockResponse(newRecord, '添加成功')
}

export function updatePurchaseReturn(id: string, data: Partial<PurchaseReturn>): Promise<Result<PurchaseReturn>> {
  const idx = returnStore.findIndex((r) => r.id === id)
  if (idx >= 0) {
    const items = data.items || returnStore[idx].items
    const amount = items.reduce((sum, item) => sum + (item.factoryAmount || 0), 0)
    returnStore[idx] = { ...returnStore[idx], ...data, id, amount }
    return mockResponse(returnStore[idx], '更新成功')
  }
  return mockResponse({} as PurchaseReturn, '未找到该退货返厂单')
}

export function deletePurchaseReturn(id: string): Promise<Result<void>> {
  const idx = returnStore.findIndex((r) => r.id === id)
  if (idx >= 0) {
    returnStore.splice(idx, 1)
    return mockResponse(undefined, '删除成功')
  }
  return mockResponse(undefined, '未找到该退货返厂单')
}