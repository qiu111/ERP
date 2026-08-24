import type { Result } from '@/http'
import { mockResponse } from '@/mock'

export interface TransferItem {
  id: string
  barcode: string
  productName: string
  spec: string
  unit: string
  quantity: number
  factoryPrice: number
}

export interface StockTransfer {
  id: string
  transferNo: string
  fromWarehouseCode: string
  fromWarehouseName: string
  toWarehouseCode: string
  toWarehouseName: string
  totalAmount: number
  operator: string
  operateDate: string
  auditor: string
  auditDate: string
  auditStatus: 'pending' | 'approved' | 'rejected'
  remark: string
  items: TransferItem[]
  createTime: string
}

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

// 脱敏仓库数据
export const warehouseOptions = [
  { label: '仓库甲', value: '仓库甲', code: 'WH-001' },
  { label: '仓库乙', value: '仓库乙', code: 'WH-002' },
  { label: '仓库丙', value: '仓库丙', code: 'WH-003' },
  { label: '仓库丁', value: '仓库丁', code: 'WH-004' },
]

// 脱敏操作员数据
export const operatorOptions = [
  { label: '操作员A', value: '操作员A' },
  { label: '操作员B', value: '操作员B' },
  { label: '操作员C', value: '操作员C' },
  { label: '系统管理员', value: '系统管理员' },
]

const mockTransfers: StockTransfer[] = [
  {
    id: '1',
    transferNo: 'STF-2026-0004',
    fromWarehouseCode: 'WH-001',
    fromWarehouseName: '仓库甲',
    toWarehouseCode: 'WH-002',
    toWarehouseName: '仓库乙',
    totalAmount: 3120.00,
    operator: '操作员A',
    operateDate: '2026-08-22',
    auditor: '',
    auditDate: '',
    auditStatus: 'pending',
    remark: '仓库甲库存饱和，调拨部分至仓库乙',
    items: [
      {
        id: 'item1',
        barcode: 'SKU-1001',
        productName: '办公用纸A4',
        spec: '70g/500张',
        unit: '箱',
        quantity: 50,
        factoryPrice: 22.0,
      },
      {
        id: 'item2',
        barcode: 'SKU-1002',
        productName: '中性笔黑色',
        spec: '0.5mm/12支装',
        unit: '盒',
        quantity: 40,
        factoryPrice: 12.5,
      },
    ],
    createTime: '2026-08-22 09:15:00',
  },
  {
    id: '2',
    transferNo: 'STF-2026-0003',
    fromWarehouseCode: 'WH-002',
    fromWarehouseName: '仓库乙',
    toWarehouseCode: 'WH-003',
    toWarehouseName: '仓库丙',
    totalAmount: 18800.00,
    operator: '系统管理员',
    operateDate: '2026-08-20',
    auditor: '系统管理员',
    auditDate: '2026-08-21',
    auditStatus: 'approved',
    remark: '仓库丙订单积压，紧急调拨粮油补给',
    items: [
      {
        id: 'item1',
        barcode: 'SKU-2001',
        productName: '包装大米',
        spec: '25kg/袋',
        unit: '袋',
        quantity: 200,
        factoryPrice: 48.0,
      },
      {
        id: 'item2',
        barcode: 'SKU-2002',
        productName: '桶装食用油',
        spec: '5L/桶',
        unit: '桶',
        quantity: 120,
        factoryPrice: 68.0,
      },
    ],
    createTime: '2026-08-20 14:30:00',
  },
  {
    id: '3',
    transferNo: 'STF-2026-0002',
    fromWarehouseCode: 'WH-003',
    fromWarehouseName: '仓库丙',
    toWarehouseCode: 'WH-001',
    toWarehouseName: '仓库甲',
    totalAmount: 5400.00,
    operator: '操作员B',
    operateDate: '2026-08-18',
    auditor: '操作员A',
    auditDate: '2026-08-18',
    auditStatus: 'approved',
    remark: '',
    items: [
      {
        id: 'item1',
        barcode: 'SKU-3001',
        productName: '瓶装洗衣液',
        spec: '2kg/瓶',
        unit: '瓶',
        quantity: 180,
        factoryPrice: 30.0,
      },
    ],
    createTime: '2026-08-18 10:50:00',
  },
  {
    id: '4',
    transferNo: 'STF-2026-0001',
    fromWarehouseCode: 'WH-004',
    fromWarehouseName: '仓库丁',
    toWarehouseCode: 'WH-002',
    toWarehouseName: '仓库乙',
    totalAmount: 9350.00,
    operator: '操作员C',
    operateDate: '2026-08-15',
    auditor: '',
    auditDate: '',
    auditStatus: 'rejected',
    remark: '驳回原因：调出仓库库存不足，请重新核对调拨数量',
    items: [
      {
        id: 'item1',
        barcode: 'SKU-4001',
        productName: '针织毛巾',
        spec: '纯棉/35x75cm',
        unit: '条',
        quantity: 500,
        factoryPrice: 10.5,
      },
      {
        id: 'item2',
        barcode: 'SKU-4002',
        productName: '饼干礼盒装',
        spec: '500g/盒',
        unit: '盒',
        quantity: 80,
        factoryPrice: 52.0,
      },
    ],
    createTime: '2026-08-15 16:20:00',
  },
]

const transferStore: StockTransfer[] = JSON.parse(JSON.stringify(mockTransfers))

export function getStockTransferPage(params: {
  page: number
  pageSize: number
  transferNo?: string
  fromWarehouse?: string
  toWarehouse?: string
  auditStatus?: string
  operator?: string
  startDate?: string
  endDate?: string
}): Promise<Result<{ list: StockTransfer[]; total: number }>> {
  let filtered = [...transferStore]

  if (params.transferNo) {
    const kw = params.transferNo.toLowerCase()
    filtered = filtered.filter((r) => r.transferNo.toLowerCase().includes(kw))
  }
  if (params.fromWarehouse) {
    filtered = filtered.filter((r) => r.fromWarehouseName === params.fromWarehouse)
  }
  if (params.toWarehouse) {
    filtered = filtered.filter((r) => r.toWarehouseName === params.toWarehouse)
  }
  if (params.auditStatus) {
    filtered = filtered.filter((r) => r.auditStatus === params.auditStatus)
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

  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  const list = filtered.slice(start, start + params.pageSize)
  return mockResponse({ list, total })
}

export function getStockTransferById(id: string): Promise<Result<StockTransfer>> {
  const record = transferStore.find((r) => r.id === id)
  if (record) {
    return mockResponse(record)
  }
  return mockResponse({} as StockTransfer, '未找到该库存调拨单')
}

export function addStockTransfer(
  data: Omit<StockTransfer, 'id' | 'createTime' | 'totalAmount'> & { id?: string }
): Promise<Result<StockTransfer>> {
  const totalAmount = data.items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.factoryPrice || 0)), 0)
  const newRecord: StockTransfer = {
    ...data,
    id: data.id || String(Date.now()),
    totalAmount,
    createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
  }
  transferStore.push(newRecord)
  return mockResponse(newRecord, '添加成功')
}

export function updateStockTransfer(id: string, data: Partial<StockTransfer>): Promise<Result<StockTransfer>> {
  const idx = transferStore.findIndex((r) => r.id === id)
  if (idx >= 0) {
    const items = data.items || transferStore[idx].items
    const totalAmount = items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.factoryPrice || 0)), 0)
    transferStore[idx] = { ...transferStore[idx], ...data, id, totalAmount }
    return mockResponse(transferStore[idx], '更新成功')
  }
  return mockResponse({} as StockTransfer, '未找到该库存调拨单')
}

export function deleteStockTransfer(id: string): Promise<Result<void>> {
  const idx = transferStore.findIndex((r) => r.id === id)
  if (idx >= 0) {
    transferStore.splice(idx, 1)
    return mockResponse(undefined, '删除成功')
  }
  return mockResponse(undefined, '未找到该库存调拨单')
}
