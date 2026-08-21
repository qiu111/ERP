import type { Result } from '@/http'
import { mockResponse } from '@/mock'

export interface ExportItem {
  id: string
  sourceArea: string
  supplier: string
  hsCode: string
  productName: string
  spec: string
  unit: string
  quantity: number
  salePrice: number
  saleAmount: number
}

export interface PurchaseExport {
  id: string
  exportNo: string
  relatedOrder: string
  salesCompany: string
  orderNo: string
  customerName: string
  creator: string
  createDate: string
  warehouse: string
  salesperson: string
  exportDate: string
  tradeMethod: string
  loadingPort: string
  destinationPort: string
  declarationContractNo: string
  billOfLadingNo: string
  vesselVoyage: string
  taxExemptionNature: string
  packagingType: string
  declarationQty: number
  grossWeight: number
  netWeight: number
  auditDate: string
  auditor: string
  settlementCurrency: string
  transportMethod: string
  operator: string
  operateDate: string
  amount: number
  remark: string
  items: ExportItem[]
  status: 'draft' | 'confirmed' | 'completed' | 'cancelled'
  createTime: string
}

export const exportStatusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '已确认', value: 'confirmed' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
]

export const exportStatusMap: Record<string, { text: string; color: string }> = {
  draft: { text: '草稿', color: '#909399' },
  confirmed: { text: '已确认', color: '#409eff' },
  completed: { text: '已完成', color: '#67c23a' },
  cancelled: { text: '已取消', color: '#f56c6c' },
}

export const tradeMethodOptions = [
  { label: '方式1', value: '方式1' },
  { label: '方式2', value: '方式2' },
  { label: 'FOB', value: 'FOB' },
  { label: 'CIF', value: 'CIF' },
  { label: 'CFR', value: 'CFR' },
]

export const portOptions = [
  { label: '港口1', value: '港口1' },
  { label: '港口2', value: '港口2' },
  { label: '港口3', value: '港口3' },
  { label: '港口4', value: '港口4' },
  { label: '港口5', value: '港口5' },
  { label: '港口6', value: '港口6' },
  { label: '港口7', value: '港口7' },
  { label: '港口8', value: '港口8' },
]

export const taxExemptionOptions = [
  { label: '征税', value: '征税' },
  { label: '免税', value: '免税' },
  { label: '退税', value: '退税' },
  { label: '其他', value: '其他' },
]

export const packagingTypeOptions = [
  { label: '纸箱', value: '纸箱' },
  { label: '木箱', value: '木箱' },
  { label: '编织袋', value: '编织袋' },
  { label: '托盘', value: '托盘' },
  { label: '散装', value: '散装' },
  { label: '其他', value: '其他' },
]

export const settlementCurrencyOptions = [
  { label: '人民币 (CNY)', value: 'CNY' },
  { label: '美元 (USD)', value: 'USD' },
  { label: '欧元 (EUR)', value: 'EUR' },
  { label: '港币 (HKD)', value: 'HKD' },
  { label: '日元 (JPY)', value: 'JPY' },
  { label: '英镑 (GBP)', value: 'GBP' },
]

export const transportMethodOptions = [
  { label: '海运', value: '海运' },
  { label: '空运', value: '空运' },
  { label: '陆运', value: '陆运' },
  { label: '铁路运输', value: '铁路运输' },
  { label: '快递', value: '快递' },
]

export const salesCompanyOptions = [
  { label: '总公司A', value: '总公司A' },
  { label: '分公司B', value: '分公司B' },
  { label: '分公司C', value: '分公司C' },
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

export const sourceAreaOptions = [
  { label: '华东地区', value: '华东地区' },
  { label: '华北地区', value: '华北地区' },
  { label: '华南地区', value: '华南地区' },
  { label: '华中地区', value: '华中地区' },
  { label: '西南地区', value: '西南地区' },
]

export const supplierOptions = [
  { label: '供应商A', value: '供应商A' },
  { label: '供应商B', value: '供应商B' },
  { label: '供应商C', value: '供应商C' },
  { label: '供应商D', value: '供应商D' },
]

const mockExports: PurchaseExport[] = [
  {
    id: '1',
    exportNo: 'EX-2026-0006',
    relatedOrder: 'SO-2026-0008',
    salesCompany: '总公司A',
    orderNo: 'SO-2026-0008',
    customerName: '海外客户A',
    creator: '超级管理员',
    createDate: '2026-08-18',
    warehouse: '仓库A',
    salesperson: '超级管理员',
    exportDate: '2026-08-20',
    tradeMethod: 'FOB',
    loadingPort: '港口3',
    destinationPort: '港口1',
    declarationContractNo: 'HT-2026-0088',
    billOfLadingNo: 'BL20260818001',
    vesselVoyage: '航运公司A',
    taxExemptionNature: '退税',
    packagingType: '纸箱',
    declarationQty: 500,
    grossWeight: 1200,
    netWeight: 1100,
    auditDate: '2026-08-19',
    auditor: '采购经理',
    settlementCurrency: 'USD',
    transportMethod: '海运',
    operator: '超级管理员',
    operateDate: '2026-08-18',
    amount: 8500.00,
    remark: '客户订单',
    items: [
      {
        id: 'item1',
        sourceArea: '华东地区',
        supplier: '供应商A',
        hsCode: '4818100000',
        productName: 'A4打印纸',
        spec: '70g 500张',
        unit: '箱',
        quantity: 100,
        salePrice: 25.0,
        saleAmount: 2500.0,
      },
      {
        id: 'item2',
        sourceArea: '华东地区',
        supplier: '供应商A',
        hsCode: '9608100000',
        productName: '签字笔',
        spec: '黑色 0.5mm',
        unit: '盒',
        quantity: 50,
        salePrice: 120.0,
        saleAmount: 6000.0,
      },
    ],
    status: 'completed',
    createTime: '2026-08-18 10:30:00',
  },
  {
    id: '2',
    exportNo: 'EX-2026-0005',
    relatedOrder: '',
    salesCompany: '分公司B',
    orderNo: 'SO-2026-0007',
    customerName: '海外客户B',
    creator: '采购经理',
    createDate: '2026-08-12',
    warehouse: '仓库B',
    salesperson: '采购经理',
    exportDate: '2026-08-15',
    tradeMethod: 'CIF',
    loadingPort: '港口5',
    destinationPort: '港口2',
    declarationContractNo: 'HT-2026-0077',
    billOfLadingNo: 'BL20260812001',
    vesselVoyage: '航运公司B',
    taxExemptionNature: '退税',
    packagingType: '托盘',
    declarationQty: 200,
    grossWeight: 800,
    netWeight: 750,
    auditDate: '',
    auditor: '',
    settlementCurrency: 'EUR',
    transportMethod: '海运',
    operator: '采购经理',
    operateDate: '2026-08-12',
    amount: 7000.00,
    remark: '',
    items: [
      {
        id: 'item1',
        sourceArea: '华北地区',
        supplier: '供应商B',
        hsCode: '3401119000',
        productName: '洗衣液',
        spec: '2kg装',
        unit: '瓶',
        quantity: 200,
        salePrice: 35.0,
        saleAmount: 7000.0,
      },
    ],
    status: 'confirmed',
    createTime: '2026-08-12 14:20:00',
  },
  {
    id: '3',
    exportNo: 'EX-2026-0004',
    relatedOrder: '',
    salesCompany: '分公司C',
    orderNo: '',
    customerName: '',
    creator: '采购专员',
    createDate: '2026-08-08',
    warehouse: '仓库C',
    salesperson: '采购专员',
    exportDate: '',
    tradeMethod: '方式1',
    loadingPort: '港口4',
    destinationPort: '港口1',
    declarationContractNo: '',
    billOfLadingNo: '',
    vesselVoyage: '',
    taxExemptionNature: '征税',
    packagingType: '纸箱',
    declarationQty: 0,
    grossWeight: 0,
    netWeight: 0,
    auditDate: '',
    auditor: '',
    settlementCurrency: 'CNY',
    transportMethod: '空运',
    operator: '采购专员',
    operateDate: '2026-08-08',
    amount: 0,
    remark: '',
    items: [],
    status: 'draft',
    createTime: '2026-08-08 09:15:00',
  },
]

const exportStore: PurchaseExport[] = JSON.parse(JSON.stringify(mockExports))

export function getPurchaseExportPage(params: {
  page: number
  pageSize: number
  exportNo?: string
  operator?: string
  startDate?: string
  endDate?: string
  salesCompany?: string
  status?: string
  warehouse?: string
}): Promise<Result<{ list: PurchaseExport[]; total: number }>> {
  let filtered = [...exportStore]

  if (params.exportNo) {
    const kw = params.exportNo.toLowerCase()
    filtered = filtered.filter(
      (r) =>
        r.exportNo.toLowerCase().includes(kw) ||
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
  if (params.salesCompany) {
    filtered = filtered.filter((r) => r.salesCompany === params.salesCompany)
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

export function getPurchaseExportById(id: string): Promise<Result<PurchaseExport>> {
  const record = exportStore.find((r) => r.id === id)
  if (record) {
    return mockResponse(record)
  }
  return mockResponse({} as PurchaseExport, '未找到该外贸出货单')
}

export function addPurchaseExport(data: Omit<PurchaseExport, 'id' | 'createTime' | 'amount'> & { id?: string }): Promise<Result<PurchaseExport>> {
  const amount = data.items.reduce((sum, item) => sum + (item.saleAmount || 0), 0)
  const newRecord: PurchaseExport = {
    ...data,
    id: data.id || String(Date.now()),
    amount,
    createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
  }
  exportStore.push(newRecord)
  return mockResponse(newRecord, '添加成功')
}

export function updatePurchaseExport(id: string, data: Partial<PurchaseExport>): Promise<Result<PurchaseExport>> {
  const idx = exportStore.findIndex((r) => r.id === id)
  if (idx >= 0) {
    const items = data.items || exportStore[idx].items
    const amount = items.reduce((sum, item) => sum + (item.saleAmount || 0), 0)
    exportStore[idx] = { ...exportStore[idx], ...data, id, amount }
    return mockResponse(exportStore[idx], '更新成功')
  }
  return mockResponse({} as PurchaseExport, '未找到该外贸出货单')
}

export function deletePurchaseExport(id: string): Promise<Result<void>> {
  const idx = exportStore.findIndex((r) => r.id === id)
  if (idx >= 0) {
    exportStore.splice(idx, 1)
    return mockResponse(undefined, '删除成功')
  }
  return mockResponse(undefined, '未找到该外贸出货单')
}