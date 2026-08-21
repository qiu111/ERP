import type { Result } from '@/http'
import { mockResponse } from '@/mock'

export interface ReceiveItem {
  id: string
  productName: string
  spec: string
  unit: string
  quantity: number
  unitPrice: number
  amount: number
  receivedQuantity: number
}

export interface PurchaseReceive {
  id: string
  receiveNo: string
  orderNo: string
  creator: string
  createDate: string
  supplier: string
  buyer: string
  warehouse: string
  auditDate: string
  prepaymentDate: string
  operator: string
  operateDate: string
  prepaymentTime: string
  auditor: string
  amount: number
  remark: string
  items: ReceiveItem[]
  status: 'draft' | 'confirmed' | 'completed' | 'cancelled'
  createTime: string
}

export const receiveStatusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '已确认', value: 'confirmed' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
]

export const receiveStatusMap: Record<string, { text: string; color: string }> = {
  draft: { text: '草稿', color: '#909399' },
  confirmed: { text: '已确认', color: '#409eff' },
  completed: { text: '已完成', color: '#67c23a' },
  cancelled: { text: '已取消', color: '#f56c6c' },
}

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

const mockReceives: PurchaseReceive[] = [
  {
    id: '1',
    receiveNo: 'RV-2026-0008',
    orderNo: 'PO-2026-0012',
    creator: '超级管理员',
    createDate: '2026-08-10',
    supplier: '供应商A',
    buyer: '采购员A',
    warehouse: '仓库A',
    auditDate: '2026-08-11',
    prepaymentDate: '2026-08-12',
    operator: '超级管理员',
    operateDate: '2026-08-10',
    prepaymentTime: '2026-08-12',
    auditor: '采购经理',
    amount: 2800.00,
    remark: '加急处理',
    items: [
      {
        id: 'item1',
        productName: 'A4打印纸',
        spec: '70g 500张',
        unit: '箱',
        quantity: 100,
        unitPrice: 22.0,
        amount: 2200.0,
        receivedQuantity: 100,
      },
      {
        id: 'item2',
        productName: '签字笔',
        spec: '黑色 0.5mm',
        unit: '盒',
        quantity: 50,
        unitPrice: 12.0,
        amount: 600.0,
        receivedQuantity: 50,
      },
    ],
    status: 'completed',
    createTime: '2026-08-10 10:30:00',
  },
  {
    id: '2',
    receiveNo: 'RV-2026-0007',
    orderNo: 'PO-2026-0011',
    creator: '采购经理',
    createDate: '2026-08-06',
    supplier: '供应商B',
    buyer: '采购员B',
    warehouse: '仓库B',
    auditDate: '',
    prepaymentDate: '2026-08-07',
    operator: '采购经理',
    operateDate: '2026-08-06',
    prepaymentTime: '2026-08-07',
    auditor: '',
    amount: 6000.00,
    remark: '紧急采购',
    items: [
      {
        id: 'item1',
        productName: '洗衣液',
        spec: '2kg装',
        unit: '瓶',
        quantity: 200,
        unitPrice: 30.0,
        amount: 6000.0,
        receivedQuantity: 200,
      },
    ],
    status: 'confirmed',
    createTime: '2026-08-06 14:20:00',
  },
  {
    id: '3',
    receiveNo: 'RV-2026-0006',
    orderNo: 'PO-2026-0010',
    creator: '采购专员',
    createDate: '2026-08-01',
    supplier: '供应商C',
    buyer: '采购员C',
    warehouse: '仓库C',
    auditDate: '',
    prepaymentDate: '',
    operator: '采购专员',
    operateDate: '2026-08-01',
    prepaymentTime: '',
    auditor: '',
    amount: 44400.00,
    remark: '',
    items: [
      {
        id: 'item1',
        productName: '大米',
        spec: '25kg装',
        unit: '袋',
        quantity: 500,
        unitPrice: 48.0,
        amount: 24000.0,
        receivedQuantity: 500,
      },
      {
        id: 'item2',
        productName: '食用油',
        spec: '5L装',
        unit: '桶',
        quantity: 300,
        unitPrice: 68.0,
        amount: 20400.0,
        receivedQuantity: 300,
      },
    ],
    status: 'draft',
    createTime: '2026-08-01 09:15:00',
  },
]

const receiveStore: PurchaseReceive[] = JSON.parse(JSON.stringify(mockReceives))

export function getPurchaseReceivePage(params: {
  page: number
  pageSize: number
  receiveNo?: string
  operator?: string
  startDate?: string
  endDate?: string
  supplier?: string
  status?: string
  warehouse?: string
}): Promise<Result<{ list: PurchaseReceive[]; total: number }>> {
  let filtered = [...receiveStore]

  if (params.receiveNo) {
    const kw = params.receiveNo.toLowerCase()
    filtered = filtered.filter(
      (r) =>
        r.receiveNo.toLowerCase().includes(kw) ||
        r.orderNo.toLowerCase().includes(kw)
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

export function getPurchaseReceiveById(id: string): Promise<Result<PurchaseReceive>> {
  const record = receiveStore.find((r) => r.id === id)
  if (record) {
    return mockResponse(record)
  }
  return mockResponse({} as PurchaseReceive, '未找到该采购收货单')
}

export function addPurchaseReceive(data: Omit<PurchaseReceive, 'id' | 'createTime' | 'amount'> & { id?: string }): Promise<Result<PurchaseReceive>> {
  const amount = data.items.reduce((sum, item) => sum + (item.amount || 0), 0)
  const newRecord: PurchaseReceive = {
    ...data,
    id: data.id || String(Date.now()),
    amount,
    createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
  }
  receiveStore.push(newRecord)
  return mockResponse(newRecord, '添加成功')
}

export function updatePurchaseReceive(id: string, data: Partial<PurchaseReceive>): Promise<Result<PurchaseReceive>> {
  const idx = receiveStore.findIndex((r) => r.id === id)
  if (idx >= 0) {
    const items = data.items || receiveStore[idx].items
    const amount = items.reduce((sum, item) => sum + (item.amount || 0), 0)
    receiveStore[idx] = { ...receiveStore[idx], ...data, id, amount }
    return mockResponse(receiveStore[idx], '更新成功')
  }
  return mockResponse({} as PurchaseReceive, '未找到该采购收货单')
}

export function deletePurchaseReceive(id: string): Promise<Result<void>> {
  const idx = receiveStore.findIndex((r) => r.id === id)
  if (idx >= 0) {
    receiveStore.splice(idx, 1)
    return mockResponse(undefined, '删除成功')
  }
  return mockResponse(undefined, '未找到该采购收货单')
}
