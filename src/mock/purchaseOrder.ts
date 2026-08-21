import type { Result } from '@/http'
import { mockResponse } from '@/mock'

export interface PurchaseOrderItem {
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

export interface PurchaseOrder {
  id: string
  orderNo: string
  purchaseType: string
  relatedOrder: string
  company: string
  creator: string
  createDate: string
  warehouse: string
  buyer: string
  deliveryDate: string
  prepaymentDate: string
  tradePrice: string
  paymentMethod: string
  prepaymentPct: number
  midTermPct: number
  balancePct: number
  shippingMethod: string
  remark: string
  items: PurchaseOrderItem[]
  totalAmount: number
  status: 'draft' | 'confirmed' | 'completed' | 'cancelled'
  createTime: string
}

export const purchaseTypes = [
  { label: '普通采购', value: 'normal' },
  { label: '紧急采购', value: 'urgent' },
  { label: '计划采购', value: 'planned' },
  { label: '长期采购', value: 'long_term' },
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

export const paymentMethods = [
  { label: '现金', value: 'cash' },
  { label: '银行转账', value: 'bank_transfer' },
  { label: '支票', value: 'check' },
  { label: '信用证', value: 'letter_of_credit' },
  { label: '电汇', value: 'telegraphic_transfer' },
]

export const shippingMethods = [
  { label: '公路运输', value: 'road' },
  { label: '铁路运输', value: 'rail' },
  { label: '海运', value: 'sea' },
  { label: '空运', value: 'air' },
  { label: '快递', value: 'express' },
]

export const productCategories = [
  {
    id: 'supplier',
    label: '供应商',
    children: [
      { id: 'supplier_a', label: '供应商A' },
      { id: 'supplier_b', label: '供应商B' },
      { id: 'supplier_c', label: '供应商C' },
    ],
  },
  {
    id: 'brand',
    label: '品牌',
    children: [
      { id: 'brand_a', label: '品牌A' },
      { id: 'brand_b', label: '品牌B' },
    ],
  },
  {
    id: 'category',
    label: '商品分类',
    children: [
      {
        id: 'office',
        label: '办公用品',
        children: [
          { id: 'stationery', label: '文具' },
          { id: 'paper', label: '纸张' },
        ],
      },
      { id: 'knitwear', label: '针织家纺' },
      { id: 'personal', label: '个人护理' },
      { id: 'cleaning', label: '清洁用品' },
      { id: 'paper_products', label: '纸品' },
      { id: 'food', label: '休闲食品' },
      { id: 'spices', label: '冲调保健' },
      { id: 'grain', label: '粮油米面' },
      { id: 'seasoning', label: '食杂调味' },
    ],
  },
]

export interface ProductItem {
  id: string
  barcode: string
  name: string
  marketPrice: number
  factoryPrice: number
  costPrice: number
  category: string
}

export const mockProducts: ProductItem[] = [
  { id: 'p1', barcode: 'SP001', name: '棉布袋', marketPrice: 4.0, factoryPrice: 3.5, costPrice: 3.5, category: 'knitwear' },
  { id: 'p2', barcode: 'SP002', name: '金属牌', marketPrice: 18.5, factoryPrice: 18.5, costPrice: 18.5, category: 'office' },
  { id: 'p3', barcode: 'SP003', name: 'A4打印纸', marketPrice: 25.0, factoryPrice: 22.0, costPrice: 20.0, category: 'paper' },
  { id: 'p4', barcode: 'SP004', name: '签字笔', marketPrice: 15.0, factoryPrice: 12.0, costPrice: 10.0, category: 'stationery' },
  { id: 'p5', barcode: 'SP005', name: '洗衣液', marketPrice: 35.0, factoryPrice: 30.0, costPrice: 28.0, category: 'cleaning' },
  { id: 'p6', barcode: 'SP006', name: '毛巾', marketPrice: 12.0, factoryPrice: 10.0, costPrice: 8.5, category: 'knitwear' },
  { id: 'p7', barcode: 'SP007', name: '抽取式面巾纸', marketPrice: 8.0, factoryPrice: 6.5, costPrice: 5.5, category: 'paper_products' },
  { id: 'p8', barcode: 'SP008', name: '饼干礼盒', marketPrice: 68.0, factoryPrice: 55.0, costPrice: 48.0, category: 'food' },
  { id: 'p9', barcode: 'SP009', name: '茶叶罐', marketPrice: 120.0, factoryPrice: 98.0, costPrice: 85.0, category: 'food' },
  { id: 'p10', barcode: 'SP010', name: '洗洁精', marketPrice: 18.0, factoryPrice: 15.0, costPrice: 13.0, category: 'cleaning' },
  { id: 'p11', barcode: 'SP011', name: '香皂', marketPrice: 6.5, factoryPrice: 5.0, costPrice: 4.2, category: 'personal' },
  { id: 'p12', barcode: 'SP012', name: '大米', marketPrice: 55.0, factoryPrice: 48.0, costPrice: 42.0, category: 'grain' },
  { id: 'p13', barcode: 'SP013', name: '食用油', marketPrice: 78.0, factoryPrice: 68.0, costPrice: 60.0, category: 'grain' },
  { id: 'p14', barcode: 'SP014', name: '生抽酱油', marketPrice: 15.0, factoryPrice: 12.5, costPrice: 11.0, category: 'seasoning' },
  { id: 'p15', barcode: 'SP015', name: '文件夹', marketPrice: 12.0, factoryPrice: 10.0, costPrice: 8.5, category: 'office' },
]

const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: '1',
    orderNo: 'PO-2026-0012',
    purchaseType: 'normal',
    relatedOrder: 'SO-2026-0008',
    company: '总公司A',
    creator: '超级管理员',
    createDate: '2026-08-01',
    warehouse: '仓库A',
    buyer: '采购员A',
    deliveryDate: '2026-08-20',
    prepaymentDate: '2026-08-05',
    tradePrice: '市场价',
    paymentMethod: 'bank_transfer',
    prepaymentPct: 30,
    midTermPct: 30,
    balancePct: 40,
    shippingMethod: 'road',
    remark: '加急处理',
    items: [
      {
        id: 'item1',
        supplierCode: 'SUP001',
        supplierName: '供应商A',
        productName: 'A4打印纸',
        spec: '70g 500张',
        unit: '箱',
        quantity: 100,
        unitPrice: 22.0,
        amount: 2200.0,
      },
      {
        id: 'item2',
        supplierCode: 'SUP001',
        supplierName: '供应商A',
        productName: '签字笔',
        spec: '黑色 0.5mm',
        unit: '盒',
        quantity: 50,
        unitPrice: 12.0,
        amount: 600.0,
      },
    ],
    totalAmount: 2800.0,
    status: 'draft',
    createTime: '2026-08-01 10:30:00',
  },
  {
    id: '2',
    orderNo: 'PO-2026-0011',
    purchaseType: 'urgent',
    relatedOrder: '',
    company: '分公司B',
    creator: '采购经理',
    createDate: '2026-07-28',
    warehouse: '仓库B',
    buyer: '采购员B',
    deliveryDate: '2026-08-05',
    prepaymentDate: '2026-07-30',
    tradePrice: '出厂价',
    paymentMethod: 'cash',
    prepaymentPct: 50,
    midTermPct: 0,
    balancePct: 50,
    shippingMethod: 'express',
    remark: '紧急采购',
    items: [
      {
        id: 'item1',
        supplierCode: 'SUP002',
        supplierName: '供应商B',
        productName: '洗衣液',
        spec: '2kg装',
        unit: '瓶',
        quantity: 200,
        unitPrice: 30.0,
        amount: 6000.0,
      },
    ],
    totalAmount: 6000.0,
    status: 'confirmed',
    createTime: '2026-07-28 14:20:00',
  },
  {
    id: '3',
    orderNo: 'PO-2026-0010',
    purchaseType: 'planned',
    relatedOrder: 'SO-2026-0005',
    company: '分公司C',
    creator: '采购专员',
    createDate: '2026-07-20',
    warehouse: '仓库C',
    buyer: '采购员C',
    deliveryDate: '2026-08-15',
    prepaymentDate: '2026-07-25',
    tradePrice: '成本价',
    paymentMethod: 'letter_of_credit',
    prepaymentPct: 20,
    midTermPct: 30,
    balancePct: 50,
    shippingMethod: 'sea',
    remark: '',
    items: [
      {
        id: 'item1',
        supplierCode: 'SUP003',
        supplierName: '供应商C',
        productName: '大米',
        spec: '25kg装',
        unit: '袋',
        quantity: 500,
        unitPrice: 48.0,
        amount: 24000.0,
      },
      {
        id: 'item2',
        supplierCode: 'SUP003',
        supplierName: '供应商C',
        productName: '食用油',
        spec: '5L装',
        unit: '桶',
        quantity: 300,
        unitPrice: 68.0,
        amount: 20400.0,
      },
    ],
    totalAmount: 44400.0,
    status: 'completed',
    createTime: '2026-07-20 09:15:00',
  },
]

const orderStore: PurchaseOrder[] = JSON.parse(JSON.stringify(mockPurchaseOrders))

export function getPurchaseOrderPage(params: {
  page: number
  pageSize: number
  keyword?: string
  status?: string
}): Promise<Result<{ list: PurchaseOrder[]; total: number }>> {
  let filtered = [...orderStore]
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = filtered.filter(
      (o) =>
        o.orderNo.toLowerCase().includes(kw) ||
        o.creator.toLowerCase().includes(kw) ||
        o.buyer.toLowerCase().includes(kw) ||
        o.remark.toLowerCase().includes(kw)
    )
  }
  if (params.status) {
    filtered = filtered.filter((o) => o.status === params.status)
  }
  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  const list = filtered.slice(start, start + params.pageSize)
  return mockResponse({ list, total })
}

export function getPurchaseOrderById(id: string): Promise<Result<PurchaseOrder>> {
  const order = orderStore.find((o) => o.id === id)
  if (order) {
    return mockResponse(order)
  }
  return mockResponse({} as PurchaseOrder, '未找到该采购订单')
}

export function addPurchaseOrder(data: Omit<PurchaseOrder, 'id' | 'createTime' | 'totalAmount'> & { id?: string }): Promise<Result<PurchaseOrder>> {
  const totalAmount = data.items.reduce((sum, item) => sum + item.amount, 0)
  const newOrder: PurchaseOrder = {
    ...data,
    id: data.id || String(Date.now()),
    totalAmount,
    createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
  }
  orderStore.push(newOrder)
  return mockResponse(newOrder, '添加成功')
}

export function updatePurchaseOrder(id: string, data: Partial<PurchaseOrder>): Promise<Result<PurchaseOrder>> {
  const idx = orderStore.findIndex((o) => o.id === id)
  if (idx >= 0) {
    const items = data.items || orderStore[idx].items
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0)
    orderStore[idx] = { ...orderStore[idx], ...data, id, totalAmount }
    return mockResponse(orderStore[idx], '更新成功')
  }
  return mockResponse({} as PurchaseOrder, '未找到该采购订单')
}

export function deletePurchaseOrder(id: string): Promise<Result<void>> {
  const idx = orderStore.findIndex((o) => o.id === id)
  if (idx >= 0) {
    orderStore.splice(idx, 1)
    return mockResponse(undefined, '删除成功')
  }
  return mockResponse(undefined, '未找到该采购订单')
}

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
  check: '支票',
  letter_of_credit: '信用证',
  telegraphic_transfer: '电汇',
}

export const purchaseTypeMap: Record<string, string> = {
  normal: '普通采购',
  urgent: '以销定采',
  planned: '自主采购',
  long_term: '长期采购',
}

export const shippingMethodMap: Record<string, string> = {
  road: '公路运输',
  rail: '铁路运输',
  sea: '海运',
  air: '空运',
  express: '快递',
}