import type { Result } from '@/http'
import { mockResponse } from '@/mock'

export interface CheckItem {
  id: string
  barcode: string
  productName: string
  spec: string
  unit: string
  systemQty: number
  actualQty: number
  diffReason: string
  factoryPrice: number
}

export interface StockCheck {
  id: string
  checkNo: string
  warehouseCode: string
  warehouseName: string
  checker: string
  operator: string
  operateDate: string
  auditor: string
  auditDate: string
  auditStatus: 'pending' | 'approved' | 'rejected'
  creator: string
  createDate: string
  adjustReason: string
  items: CheckItem[]
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

// 脱敏盘点人/操作员数据
export const checkerOptions = [
  { label: '盘点员甲', value: '盘点员甲' },
  { label: '盘点员乙', value: '盘点员乙' },
  { label: '盘点员丙', value: '盘点员丙' },
  { label: '仓库管理员', value: '仓库管理员' },
  { label: '系统管理员', value: '系统管理员' },
]

export const operatorOptions = checkerOptions

const mockChecks: StockCheck[] = [
  {
    id: '1',
    checkNo: 'SCK-2026-0004',
    warehouseCode: 'WH-001',
    warehouseName: '仓库甲',
    checker: '盘点员甲',
    operator: '盘点员甲',
    operateDate: '2026-08-22',
    auditor: '',
    auditDate: '',
    auditStatus: 'pending',
    creator: '仓库管理员',
    createDate: '2026-08-22',
    adjustReason: '',
    items: [
      {
        id: 'item1',
        barcode: 'SKU-1001',
        productName: '办公用纸A4',
        spec: '70g/500张',
        unit: '箱',
        systemQty: 200,
        actualQty: 198,
        diffReason: '少量破损损耗',
        factoryPrice: 22.0,
      },
      {
        id: 'item2',
        barcode: 'SKU-1002',
        productName: '中性笔黑色',
        spec: '0.5mm/12支装',
        unit: '盒',
        systemQty: 150,
        actualQty: 150,
        diffReason: '',
        factoryPrice: 12.5,
      },
      {
        id: 'item3',
        barcode: 'SKU-1003',
        productName: '订书机标准型',
        spec: '12号钉',
        unit: '个',
        systemQty: 60,
        actualQty: 62,
        diffReason: '上次盘点数登记错误',
        factoryPrice: 18.0,
      },
    ],
    createTime: '2026-08-22 09:30:00',
  },
  {
    id: '2',
    checkNo: 'SCK-2026-0003',
    warehouseCode: 'WH-002',
    warehouseName: '仓库乙',
    checker: '盘点员乙',
    operator: '盘点员乙',
    operateDate: '2026-08-20',
    auditor: '系统管理员',
    auditDate: '2026-08-21',
    auditStatus: 'approved',
    creator: '系统管理员',
    createDate: '2026-08-20',
    adjustReason: '月末常规盘点，差异已做盘盈盘亏处理',
    items: [
      {
        id: 'item1',
        barcode: 'SKU-2001',
        productName: '包装大米',
        spec: '25kg/袋',
        unit: '袋',
        systemQty: 450,
        actualQty: 448,
        diffReason: '包装袋轻微破损导致撒漏',
        factoryPrice: 48.0,
      },
      {
        id: 'item2',
        barcode: 'SKU-2002',
        productName: '桶装食用油',
        spec: '5L/桶',
        unit: '桶',
        systemQty: 120,
        actualQty: 120,
        diffReason: '',
        factoryPrice: 68.0,
      },
      {
        id: 'item3',
        barcode: 'SKU-2003',
        productName: '面粉编织袋',
        spec: '10kg/袋',
        unit: '袋',
        systemQty: 300,
        actualQty: 302,
        diffReason: '盘点前入库未及时录入系统',
        factoryPrice: 32.0,
      },
    ],
    createTime: '2026-08-20 14:10:00',
  },
  {
    id: '3',
    checkNo: 'SCK-2026-0002',
    warehouseCode: 'WH-003',
    warehouseName: '仓库丙',
    checker: '盘点员丙',
    operator: '盘点员丙',
    operateDate: '2026-08-18',
    auditor: '',
    auditDate: '',
    auditStatus: 'pending',
    creator: '仓库管理员',
    createDate: '2026-08-18',
    adjustReason: '',
    items: [
      {
        id: 'item1',
        barcode: 'SKU-3001',
        productName: '瓶装洗衣液',
        spec: '2kg/瓶',
        unit: '瓶',
        systemQty: 500,
        actualQty: 495,
        diffReason: '搬运过程中摔坏5瓶',
        factoryPrice: 30.0,
      },
      {
        id: 'item2',
        barcode: 'SKU-3002',
        productName: '洗洁精',
        spec: '500g/瓶',
        unit: '瓶',
        systemQty: 200,
        actualQty: 200,
        diffReason: '',
        factoryPrice: 8.0,
      },
    ],
    createTime: '2026-08-18 10:45:00',
  },
  {
    id: '4',
    checkNo: 'SCK-2026-0001',
    warehouseCode: 'WH-004',
    warehouseName: '仓库丁',
    checker: '仓库管理员',
    operator: '仓库管理员',
    operateDate: '2026-08-15',
    auditor: '系统管理员',
    auditDate: '2026-08-16',
    auditStatus: 'rejected',
    creator: '仓库管理员',
    createDate: '2026-08-15',
    adjustReason: '驳回原因：差异原因填写不完整，请补充具体情况后重新提交',
    items: [
      {
        id: 'item1',
        barcode: 'SKU-4001',
        productName: '针织毛巾',
        spec: '纯棉/35x75cm',
        unit: '条',
        systemQty: 500,
        actualQty: 490,
        diffReason: '数量不符',
        factoryPrice: 10.5,
      },
      {
        id: 'item2',
        barcode: 'SKU-4002',
        productName: '饼干礼盒装',
        spec: '500g/盒',
        unit: '盒',
        systemQty: 80,
        actualQty: 70,
        diffReason: '少了',
        factoryPrice: 52.0,
      },
    ],
    createTime: '2026-08-15 16:20:00',
  },
]

const checkStore: StockCheck[] = JSON.parse(JSON.stringify(mockChecks))

export function getStockCheckPage(params: {
  page: number
  pageSize: number
  checkNo?: string
  warehouse?: string
  auditStatus?: string
  operator?: string
  startDate?: string
  endDate?: string
}): Promise<Result<{ list: StockCheck[]; total: number }>> {
  let filtered = [...checkStore]

  if (params.checkNo) {
    const kw = params.checkNo.toLowerCase()
    filtered = filtered.filter((r) => r.checkNo.toLowerCase().includes(kw))
  }
  if (params.warehouse) {
    filtered = filtered.filter((r) => r.warehouseName === params.warehouse)
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

export function getStockCheckById(id: string): Promise<Result<StockCheck>> {
  const record = checkStore.find((r) => r.id === id)
  if (record) {
    return mockResponse(record)
  }
  return mockResponse({} as StockCheck, '未找到该库存盘点单')
}

export function addStockCheck(
  data: Omit<StockCheck, 'id' | 'createTime'> & { id?: string }
): Promise<Result<StockCheck>> {
  const newRecord: StockCheck = {
    ...data,
    id: data.id || String(Date.now()),
    createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
  }
  checkStore.push(newRecord)
  return mockResponse(newRecord, '添加成功')
}

export function updateStockCheck(id: string, data: Partial<StockCheck>): Promise<Result<StockCheck>> {
  const idx = checkStore.findIndex((r) => r.id === id)
  if (idx >= 0) {
    checkStore[idx] = { ...checkStore[idx], ...data, id }
    return mockResponse(checkStore[idx], '更新成功')
  }
  return mockResponse({} as StockCheck, '未找到该库存盘点单')
}

export function deleteStockCheck(id: string): Promise<Result<void>> {
  const idx = checkStore.findIndex((r) => r.id === id)
  if (idx >= 0) {
    checkStore.splice(idx, 1)
    return mockResponse(undefined, '删除成功')
  }
  return mockResponse(undefined, '未找到该库存盘点单')
}
