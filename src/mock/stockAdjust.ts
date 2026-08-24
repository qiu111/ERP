import type { Result } from '@/http'
import { mockResponse } from '@/mock'

export interface AdjustItem {
  id: string
  barcode: string
  productName: string
  spec: string
  unit: string
  quantity: number
  factoryPrice: number
  amount: number
}

export interface StockAdjust {
  id: string
  adjustNo: string
  adjustType: 'in' | 'out'
  warehouseCode: string
  warehouseName: string
  operator: string
  operateDate: string
  auditor: string
  auditDate: string
  auditStatus: 'pending' | 'approved' | 'rejected'
  totalAmount: number
  adjustReason: string
  items: AdjustItem[]
  createTime: string
}

export const adjustTypeOptions = [
  { label: '入库', value: 'in' },
  { label: '出库', value: 'out' },
]

export const auditStatusOptions = [
  { label: '待审核', value: 'pending' },
  { label: '已审核', value: 'approved' },
  { label: '已拒绝', value: 'rejected' },
]

export const auditStatusMap: Record<string, { text: string; color: string }> = {
  pending: { text: '待审核', color: '#e6a23c' },
  approved: { text: '已审核', color: '#67c23a' },
  rejected: { text: '已拒绝', color: '#f56c6c' },
}

export const warehouseOptions = [
  { label: '仓库A', value: '仓库A', code: 'WH-A01' },
  { label: '仓库B', value: '仓库B', code: 'WH-B01' },
  { label: '仓库C', value: '仓库C', code: 'WH-C01' },
  { label: '仓库D', value: '仓库D', code: 'WH-D01' },
]

export const operatorOptions = [
  { label: '超级管理员', value: '超级管理员' },
  { label: '仓库主管', value: '仓库主管' },
  { label: '仓库管理员', value: '仓库管理员' },
]

const mockAdjusts: StockAdjust[] = [
  {
    id: '1',
    adjustNo: 'SA-2026-0003',
    adjustType: 'in',
    warehouseCode: 'WH-A01',
    warehouseName: '仓库A',
    operator: '仓库管理员',
    operateDate: '2026-08-20',
    auditor: '',
    auditDate: '',
    auditStatus: 'pending',
    totalAmount: 440.00,
    adjustReason: '采购入库',
    items: [
      {
        id: 'item1',
        barcode: 'SP003',
        productName: 'A4打印纸',
        spec: '70g 500张',
        unit: '箱',
        quantity: 20,
        factoryPrice: 22.0,
        amount: 440.0,
      },
    ],
    createTime: '2026-08-20 10:00:00',
  },
  {
    id: '2',
    adjustNo: 'SA-2026-0002',
    adjustType: 'out',
    warehouseCode: 'WH-B01',
    warehouseName: '仓库B',
    operator: '仓库主管',
    operateDate: '2026-08-18',
    auditor: '超级管理员',
    auditDate: '2026-08-19',
    auditStatus: 'approved',
    totalAmount: 1500.00,
    adjustReason: '调拨出库至仓库D',
    items: [
      {
        id: 'item1',
        barcode: 'SP005',
        productName: '洗衣液',
        spec: '2kg装',
        unit: '瓶',
        quantity: 50,
        factoryPrice: 30.0,
        amount: 1500.0,
      },
    ],
    createTime: '2026-08-18 14:30:00',
  },
  {
    id: '3',
    adjustNo: 'SA-2026-0001',
    adjustType: 'in',
    warehouseCode: 'WH-C01',
    warehouseName: '仓库C',
    operator: '超级管理员',
    operateDate: '2026-08-15',
    auditor: '仓库主管',
    auditDate: '2026-08-16',
    auditStatus: 'approved',
    totalAmount: 24000.00,
    adjustReason: '盘点盘盈',
    items: [
      {
        id: 'item1',
        barcode: 'SP012',
        productName: '大米',
        spec: '25kg装',
        unit: '袋',
        quantity: 100,
        factoryPrice: 48.0,
        amount: 4800.0,
      },
      {
        id: 'item2',
        barcode: 'SP013',
        productName: '食用油',
        spec: '5L装',
        unit: '桶',
        quantity: 280,
        factoryPrice: 68.0,
        amount: 19040.0,
      },
    ],
    createTime: '2026-08-15 09:00:00',
  },
  {
    id: '4',
    adjustNo: 'SA-2026-0000',
    adjustType: 'out',
    warehouseCode: 'WH-A01',
    warehouseName: '仓库A',
    operator: '仓库管理员',
    operateDate: '2026-08-10',
    auditor: '',
    auditDate: '',
    auditStatus: 'rejected',
    totalAmount: 220.00,
    adjustReason: '报损出库（已拒绝，理由：需补充检测报告）',
    items: [
      {
        id: 'item1',
        barcode: 'SP004',
        productName: '签字笔',
        spec: '黑色 0.5mm',
        unit: '盒',
        quantity: 20,
        factoryPrice: 11.0,
        amount: 220.0,
      },
    ],
    createTime: '2026-08-10 16:45:00',
  },
]

const adjustStore: StockAdjust[] = JSON.parse(JSON.stringify(mockAdjusts))

export function getStockAdjustPage(params: {
  page: number
  pageSize: number
  adjustNo?: string
  warehouse?: string
  operator?: string
  auditStatus?: string
  startDate?: string
  endDate?: string
}): Promise<Result<{ list: StockAdjust[]; total: number }>> {
  let filtered = [...adjustStore]

  if (params.adjustNo) {
    const kw = params.adjustNo.toLowerCase()
    filtered = filtered.filter((r) => r.adjustNo.toLowerCase().includes(kw))
  }
  if (params.warehouse) {
    filtered = filtered.filter((r) => r.warehouseName === params.warehouse)
  }
  if (params.operator) {
    filtered = filtered.filter((r) => r.operator === params.operator)
  }
  if (params.auditStatus) {
    filtered = filtered.filter((r) => r.auditStatus === params.auditStatus)
  }
  if (params.startDate) {
    filtered = filtered.filter((r) => r.operateDate >= params.startDate!)
  }
  if (params.endDate) {
    filtered = filtered.filter((r) => r.operateDate <= params.endDate!)
  }

  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  const list = filtered.slice(start, start + params.pageSize)
  return mockResponse({ list, total })
}

export function getStockAdjustById(id: string): Promise<Result<StockAdjust>> {
  const record = adjustStore.find((r) => r.id === id)
  if (record) {
    return mockResponse(record)
  }
  return mockResponse({} as StockAdjust, '未找到该库存调整单')
}

export function addStockAdjust(
  data: Omit<StockAdjust, 'id' | 'createTime' | 'totalAmount'> & { id?: string }
): Promise<Result<StockAdjust>> {
  const totalAmount = data.items.reduce((sum, item) => sum + (item.amount || 0), 0)
  const newRecord: StockAdjust = {
    ...data,
    id: data.id || String(Date.now()),
    totalAmount,
    createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
  }
  adjustStore.push(newRecord)
  return mockResponse(newRecord, '添加成功')
}

export function updateStockAdjust(id: string, data: Partial<StockAdjust>): Promise<Result<StockAdjust>> {
  const idx = adjustStore.findIndex((r) => r.id === id)
  if (idx >= 0) {
    const items = data.items || adjustStore[idx].items
    const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0)
    adjustStore[idx] = { ...adjustStore[idx], ...data, id, totalAmount }
    return mockResponse(adjustStore[idx], '更新成功')
  }
  return mockResponse({} as StockAdjust, '未找到该库存调整单')
}

export function deleteStockAdjust(id: string): Promise<Result<void>> {
  const idx = adjustStore.findIndex((r) => r.id === id)
  if (idx >= 0) {
    adjustStore.splice(idx, 1)
    return mockResponse(undefined, '删除成功')
  }
  return mockResponse(undefined, '未找到该库存调整单')
}
