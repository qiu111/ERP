import type { Result } from '@/http'
import { mockResponse } from '@/mock'

export interface SaleOrderItem {
  id: string
  supplierCode: string
  supplierName: string
  productName: string
  spec: string
  unit: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface SaleOrder {
  id: string
  orderNo: string
  saleType: string
  relatedPI: string
  customer: string
  company: string
  creator: string
  createDate: string
  warehouse: string
  salesperson: string
  deliveryDate: string
  prepaymentDate: string
  tradeMethod: string
  loadingPort: string
  destinationPort: string
  shippingMethod: string
  declarationContractNo: string
  paymentMethod: string
  currency: string
  prepaymentPct: number
  midTermPct: number
  balancePct: number
  orderSource: string
  remark: string
  items: SaleOrderItem[]
  totalAmount: number
  status: 'draft' | 'confirmed' | 'completed' | 'cancelled'
  createTime: string
}

export const saleTypes = [
  { label: '内销', value: '国内销售' },
  { label: '外销', value: '出口销售' },
]

export const companies = [
  { label: '总公司A', value: '总公司A' },
  { label: '分公司B', value: '分公司B' },
  { label: '分公司C', value: '分公司C' },
]

export const warehouses = [
  { label: '仓库A', value: '仓库A' },
  { label: '仓库B', value: '仓库B' },
  { label: '仓库C', value: '仓库C' },
  { label: '仓库D', value: '仓库D' },
]

export const tradeMethods = [
  { label: 'FOB', value: 'FOB' },
  { label: 'CIF', value: 'CIF' },
  { label: 'CFR', value: 'CFR' },
  { label: 'EXW', value: 'EXW' },
  { label: 'FCA', value: 'FCA' },
]

export const ports = [
  { label: '上海港口', value: '上海港口' },
  { label: '宁波港口', value: '宁波港口' },
  { label: '深圳港口', value: '深圳港口' },
  { label: '青岛港口', value: '青岛港口' },
  { label: '天津港口', value: '天津港口' },
  { label: '大连港口', value: '大连港口' },
]

export const shippingMethods = [
  { label: '海运', value: 'sea' },
  { label: '空运', value: 'air' },
  { label: '陆运', value: 'road' },
  { label: '铁路运输', value: 'rail' },
  { label: '快递', value: 'express' },
]

export const paymentMethods = [
  { label: '电汇', value: 'telegraphic_transfer' },
  { label: '信用证', value: 'letter_of_credit' },
  { label: '托收', value: 'collection' },
  { label: '现金', value: 'cash' },
  { label: '银行转账', value: 'bank_transfer' },
]

export const currencies = [
  { label: '人民币 (CNY)', value: 'CNY' },
  { label: '美元 (USD)', value: 'USD' },
  { label: '欧元 (EUR)', value: 'EUR' },
  { label: '港币 (HKD)', value: 'HKD' },
  { label: '日元 (JPY)', value: 'JPY' },
  { label: '英镑 (GBP)', value: 'GBP' },
]

export const orderSources = [
  { label: 'PI转订单', value: 'PI转订单' },
  { label: '手工创建', value: '手工创建' },
  { label: '客户询价', value: '客户询价' },
  { label: '展会获得', value: '展会获得' },
  { label: '网络推广', value: '网络推广' },
]

export const customerOptions = [
  { label: '客户A', value: '客户A' },
  { label: '客户B', value: '客户B' },
  { label: '客户C', value: '客户C' },
  { label: '客户D', value: '客户D' },
  { label: '客户E', value: '客户E' },
]

export const salespersonOptions = [
  { label: '超级管理员', value: '超级管理员' },
  { label: '销售经理', value: '销售经理' },
  { label: '销售专员', value: '销售专员' },
]

export const orderStatusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '已确认', value: 'confirmed' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
]

export const orderStatusMap: Record<string, { text: string; color: string }> = {
  draft: { text: '草稿', color: '#909399' },
  confirmed: { text: '已确认', color: '#409eff' },
  completed: { text: '已完成', color: '#67c23a' },
  cancelled: { text: '已取消', color: '#f56c6c' },
}

export const paymentMethodMap: Record<string, string> = {
  cash: '现金',
  bank_transfer: '银行转账',
  telegraphic_transfer: '电汇',
  letter_of_credit: '信用证',
  collection: '托收',
}

export const shippingMethodMap: Record<string, string> = {
  road: '陆运',
  rail: '铁路运输',
  sea: '海运',
  air: '空运',
  express: '快递',
}

export const currencyMap: Record<string, string> = {
  CNY: '人民币',
  USD: '美元',
  EUR: '欧元',
  HKD: '港币',
  JPY: '日元',
  GBP: '英镑',
}

const mockSaleOrders: SaleOrder[] = [
  {
    id: '1',
    orderNo: 'SO-2026-0008',
    saleType: '出口销售',
    relatedPI: 'PIO-0000-190912-0001',
    customer: '客户A',
    company: '总公司A',
    creator: '超级管理员',
    createDate: '2026-08-01',
    warehouse: '仓库A',
    salesperson: '销售经理',
    deliveryDate: '2026-08-20',
    prepaymentDate: '2026-08-05',
    tradeMethod: 'FOB',
    loadingPort: '上海港口',
    destinationPort: '洛杉矶',
    shippingMethod: 'sea',
    declarationContractNo: 'HT-2026-0088',
    paymentMethod: 'telegraphic_transfer',
    currency: 'USD',
    prepaymentPct: 30,
    midTermPct: 30,
    balancePct: 40,
    orderSource: 'PI转订单',
    remark: '常规订单',
    items: [
      {
        id: 'item1',
        supplierCode: 'SUP001',
        supplierName: '供应商A',
        productName: 'A4打印纸',
        spec: '70g 500张',
        unit: '箱',
        quantity: 100,
        unitPrice: 25.0,
        amount: 2500.0,
      },
      {
        id: 'item2',
        supplierCode: 'SUP001',
        supplierName: '供应商A',
        productName: '签字笔',
        spec: '黑色 0.5mm',
        unit: '盒',
        quantity: 50,
        unitPrice: 60.0,
        amount: 3000.0,
      },
    ],
    totalAmount: 5500.0,
    status: 'completed',
    createTime: '2026-08-01 10:30:00',
  },
  {
    id: '2',
    orderNo: 'SO-2026-0007',
    saleType: '出口销售',
    relatedPI: 'PIO-0000-190912-0002',
    customer: '客户B',
    company: '分公司B',
    creator: '销售经理',
    createDate: '2026-07-28',
    warehouse: '仓库B',
    salesperson: '销售经理',
    deliveryDate: '2026-08-15',
    prepaymentDate: '2026-07-30',
    tradeMethod: 'CIF',
    loadingPort: '宁波港口',
    destinationPort: '汉堡',
    shippingMethod: 'sea',
    declarationContractNo: 'HT-2026-0077',
    paymentMethod: 'letter_of_credit',
    currency: 'EUR',
    prepaymentPct: 20,
    midTermPct: 30,
    balancePct: 50,
    orderSource: '客户询价',
    remark: '',
    items: [
      {
        id: 'item1',
        supplierCode: 'SUP002',
        supplierName: '供应商B',
        productName: '洗衣液',
        spec: '2kg装',
        unit: '瓶',
        quantity: 200,
        unitPrice: 35.0,
        amount: 7000.0,
      },
    ],
    totalAmount: 7000.0,
    status: 'confirmed',
    createTime: '2026-07-28 14:20:00',
  },
  {
    id: '3',
    orderNo: 'SO-2026-0006',
    saleType: '国内销售',
    relatedPI: '',
    customer: '客户C',
    company: '分公司C',
    creator: '销售专员',
    createDate: '2026-07-20',
    warehouse: '仓库C',
    salesperson: '销售专员',
    deliveryDate: '2026-08-10',
    prepaymentDate: '',
    tradeMethod: 'EXW',
    loadingPort: '',
    destinationPort: '',
    shippingMethod: 'road',
    declarationContractNo: '',
    paymentMethod: 'bank_transfer',
    currency: 'CNY',
    prepaymentPct: 50,
    midTermPct: 0,
    balancePct: 50,
    orderSource: '手工创建',
    remark: '待审核',
    items: [
      {
        id: 'item1',
        supplierCode: 'SUP003',
        supplierName: '供应商C',
        productName: '大米',
        spec: '25kg装',
        unit: '袋',
        quantity: 50,
        unitPrice: 55.0,
        amount: 2750.0,
      },
    ],
    totalAmount: 2750.0,
    status: 'draft',
    createTime: '2026-07-20 09:15:00',
  },
  {
    id: '4',
    orderNo: 'SO-2026-0005',
    saleType: '出口销售',
    relatedPI: 'PIO-0000-190912-0004',
    customer: '客户A',
    company: '总公司A',
    creator: '超级管理员',
    createDate: '2026-07-15',
    warehouse: '仓库A',
    salesperson: '超级管理员',
    deliveryDate: '2026-08-05',
    prepaymentDate: '2026-07-18',
    tradeMethod: 'FOB',
    loadingPort: '上海港口',
    destinationPort: '东京',
    shippingMethod: 'air',
    declarationContractNo: 'HT-2026-0066',
    paymentMethod: 'telegraphic_transfer',
    currency: 'JPY',
    prepaymentPct: 40,
    midTermPct: 30,
    balancePct: 30,
    orderSource: 'PI转订单',
    remark: '加急订单',
    items: [
      {
        id: 'item1',
        supplierCode: 'SUP004',
        supplierName: '供应商D',
        productName: '洗洁精',
        spec: '500ml',
        unit: '瓶',
        quantity: 200,
        unitPrice: 15.0,
        amount: 3000.0,
      },
      {
        id: 'item2',
        supplierCode: 'SUP004',
        supplierName: '供应商D',
        productName: '毛巾',
        spec: '纯棉 35x75cm',
        unit: '条',
        quantity: 100,
        unitPrice: 45.0,
        amount: 4500.0,
      },
    ],
    totalAmount: 7500.0,
    status: 'completed',
    createTime: '2026-07-15 16:45:00',
  },
  {
    id: '5',
    orderNo: 'SO-2026-0004',
    saleType: '出口销售',
    relatedPI: 'PIO-0000-190912-0005',
    customer: '客户D',
    company: '分公司B',
    creator: '销售经理',
    createDate: '2026-07-10',
    warehouse: '仓库B',
    salesperson: '销售经理',
    deliveryDate: '2026-07-25',
    prepaymentDate: '2026-07-12',
    tradeMethod: 'CIF',
    loadingPort: '宁波港口',
    destinationPort: '纽约',
    shippingMethod: 'sea',
    declarationContractNo: 'HT-2026-0055',
    paymentMethod: 'letter_of_credit',
    currency: 'USD',
    prepaymentPct: 25,
    midTermPct: 25,
    balancePct: 50,
    orderSource: '展会获得',
    remark: '',
    items: [
      {
        id: 'item1',
        supplierCode: 'SUP005',
        supplierName: '供应商E',
        productName: '办公椅',
        spec: '网布 黑色',
        unit: '把',
        quantity: 50,
        unitPrice: 180.0,
        amount: 9000.0,
      },
    ],
    totalAmount: 9000.0,
    status: 'completed',
    createTime: '2026-07-10 11:20:00',
  },
  {
    id: '6',
    orderNo: 'SO-2026-0003',
    saleType: '国内销售',
    relatedPI: '',
    customer: '客户B',
    company: '分公司C',
    creator: '销售专员',
    createDate: '2026-07-05',
    warehouse: '仓库C',
    salesperson: '销售专员',
    deliveryDate: '2026-07-15',
    prepaymentDate: '2026-07-06',
    tradeMethod: 'EXW',
    loadingPort: '',
    destinationPort: '',
    shippingMethod: 'road',
    declarationContractNo: '',
    paymentMethod: 'bank_transfer',
    currency: 'CNY',
    prepaymentPct: 30,
    midTermPct: 30,
    balancePct: 40,
    orderSource: '网络推广',
    remark: '',
    items: [
      {
        id: 'item1',
        supplierCode: 'SUP006',
        supplierName: '供应商F',
        productName: '文件夹',
        spec: 'A4 双夹',
        unit: '个',
        quantity: 300,
        unitPrice: 12.0,
        amount: 3600.0,
      },
    ],
    totalAmount: 3600.0,
    status: 'confirmed',
    createTime: '2026-07-05 13:10:00',
  },
  {
    id: '7',
    orderNo: 'SO-2026-0002',
    saleType: '出口销售',
    relatedPI: 'PIO-0000-190912-0007',
    customer: '客户A',
    company: '总公司A',
    creator: '超级管理员',
    createDate: '2026-07-01',
    warehouse: '仓库D',
    salesperson: '超级管理员',
    deliveryDate: '2026-07-20',
    prepaymentDate: '2026-07-03',
    tradeMethod: 'FOB',
    loadingPort: '深圳港口',
    destinationPort: '悉尼',
    shippingMethod: 'sea',
    declarationContractNo: 'HT-2026-0044',
    paymentMethod: 'telegraphic_transfer',
    currency: 'AUD',
    prepaymentPct: 35,
    midTermPct: 35,
    balancePct: 30,
    orderSource: 'PI转订单',
    remark: '',
    items: [
      {
        id: 'item1',
        supplierCode: 'SUP007',
        supplierName: '供应商G',
        productName: '水杯',
        spec: '350ml 不锈钢',
        unit: '个',
        quantity: 100,
        unitPrice: 22.0,
        amount: 2200.0,
      },
    ],
    totalAmount: 2200.0,
    status: 'draft',
    createTime: '2026-07-01 08:30:00',
  },
  {
    id: '8',
    orderNo: 'SO-2026-0001',
    saleType: '出口销售',
    relatedPI: 'PIO-0000-190912-0008',
    customer: '客户E',
    company: '分公司B',
    creator: '销售经理',
    createDate: '2026-06-25',
    warehouse: '仓库A',
    salesperson: '销售经理',
    deliveryDate: '2026-07-10',
    prepaymentDate: '2026-06-27',
    tradeMethod: 'CIF',
    loadingPort: '上海港口',
    destinationPort: '伦敦',
    shippingMethod: 'sea',
    declarationContractNo: 'HT-2026-0033',
    paymentMethod: 'letter_of_credit',
    currency: 'GBP',
    prepaymentPct: 20,
    midTermPct: 30,
    balancePct: 50,
    orderSource: '客户询价',
    remark: '季度订单',
    items: [
      {
        id: 'item1',
        supplierCode: 'SUP008',
        supplierName: '供应商H',
        productName: '打印机硒鼓',
        spec: 'HP CF226A',
        unit: '个',
        quantity: 40,
        unitPrice: 390.0,
        amount: 15600.0,
      },
    ],
    totalAmount: 15600.0,
    status: 'completed',
    createTime: '2026-06-25 15:00:00',
  },
]

const saleOrderStore: SaleOrder[] = JSON.parse(JSON.stringify(mockSaleOrders))

export function getSaleOrderPage(params: {
  page: number
  pageSize: number
  orderNo?: string
  salesperson?: string
  startDate?: string
  endDate?: string
  customer?: string
  status?: string
  warehouse?: string
  saleType?: string
  currency?: string
}): Promise<Result<{ list: SaleOrder[]; total: number }>> {
  let filtered = [...saleOrderStore]

  if (params.orderNo) {
    const kw = params.orderNo.toLowerCase()
    filtered = filtered.filter(
      (r) => r.orderNo.toLowerCase().includes(kw)
    )
  }
  if (params.salesperson) {
    filtered = filtered.filter((r) => r.salesperson === params.salesperson)
  }
  if (params.startDate) {
    filtered = filtered.filter((r) => r.createDate >= params.startDate!)
  }
  if (params.endDate) {
    filtered = filtered.filter((r) => r.createDate <= params.endDate!)
  }
  if (params.status) {
    filtered = filtered.filter((r) => r.status === params.status)
  }
  if (params.warehouse) {
    filtered = filtered.filter((r) => r.warehouse === params.warehouse)
  }
  if (params.saleType) {
    filtered = filtered.filter((r) => r.saleType === params.saleType)
  }
  if (params.currency) {
    filtered = filtered.filter((r) => r.currency === params.currency)
  }
  if (params.customer) {
    filtered = filtered.filter((r) => r.customer === params.customer)
  }

  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  const list = filtered.slice(start, start + params.pageSize)
  return mockResponse({ list, total })
}

export function getSaleOrderById(id: string): Promise<Result<SaleOrder>> {
  const record = saleOrderStore.find((r) => r.id === id)
  if (record) {
    return mockResponse(record)
  }
  return mockResponse({} as SaleOrder, '未找到该销售订单')
}

export function addSaleOrder(data: Omit<SaleOrder, 'id' | 'createTime' | 'totalAmount'> & { id?: string }): Promise<Result<SaleOrder>> {
  const totalAmount = data.items.reduce((sum, item) => sum + (item.amount || 0), 0)
  const newRecord: SaleOrder = {
    ...data,
    id: data.id || String(Date.now()),
    totalAmount,
    createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
  }
  saleOrderStore.push(newRecord)
  return mockResponse(newRecord, '添加成功')
}

export function updateSaleOrder(id: string, data: Partial<SaleOrder>): Promise<Result<SaleOrder>> {
  const idx = saleOrderStore.findIndex((r) => r.id === id)
  if (idx >= 0) {
    const items = data.items || saleOrderStore[idx].items
    const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0)
    saleOrderStore[idx] = { ...saleOrderStore[idx], ...data, id, totalAmount }
    return mockResponse(saleOrderStore[idx], '更新成功')
  }
  return mockResponse({} as SaleOrder, '未找到该销售订单')
}

export function deleteSaleOrder(id: string): Promise<Result<void>> {
  const idx = saleOrderStore.findIndex((r) => r.id === id)
  if (idx >= 0) {
    saleOrderStore.splice(idx, 1)
    return mockResponse(undefined, '删除成功')
  }
  return mockResponse(undefined, '未找到该销售订单')
}