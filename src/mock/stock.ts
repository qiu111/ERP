import type { Result } from '@/http'
import { mockResponse } from '@/mock'

export interface StockSummary {
  id: string
  imageUrl: string
  productCode: string
  barcode: string
  productName: string
  category: string
  unit: string
  spec: string
  factoryPrice: number
  stockQty: number
  stockAmount: number
  availableQty: number
  availableAmount: number
}

export interface StockDetail {
  id: string
  warehouseCode: string
  warehouseName: string
  imageUrl: string
  barcode: string
  productName: string
  category: string
  unit: string
  spec: string
  factoryPrice: number
  warningQty: number
  stockQty: number
  stockAmount: number
  availableQty: number
  availableAmount: number
  productCode: string
  supplier: string
  warehouse: string
}

export const categoryOptions = [
  { label: '办公用品', value: '办公用品' },
  { label: '针织家纺', value: '针织家纺' },
  { label: '个人护理', value: '个人护理' },
  { label: '清洁用品', value: '清洁用品' },
  { label: '纸品', value: '纸品' },
  { label: '休闲食品', value: '休闲食品' },
  { label: '冲调保健', value: '冲调保健' },
  { label: '粮油米面', value: '粮油米面' },
  { label: '食杂调味', value: '食杂调味' },
]

export const warehouseOptions = [
  { label: '仓库A', value: '仓库A' },
  { label: '仓库B', value: '仓库B' },
  { label: '仓库C', value: '仓库C' },
  { label: '仓库D', value: '仓库D' },
]

export const supplierOptions = [
  { label: '供应商A', value: '供应商A' },
  { label: '供应商B', value: '供应商B' },
  { label: '供应商C', value: '供应商C' },
  { label: '供应商D', value: '供应商D' },
]

const mockStockSummary: StockSummary[] = [
  {
    id: 's1',
    imageUrl: '',
    productCode: '321432',
    barcode: '43243525589080',
    productName: '迷彩一次性口罩印花防菌可爱男女潮款透气冬季加厚骑行明星口罩',
    category: '个人护理',
    unit: '个',
    spec: '默认规格',
    factoryPrice: 10.00,
    stockQty: 0,
    stockAmount: 0,
    availableQty: 0,
    availableAmount: 0,
  },
  {
    id: 's2',
    imageUrl: '',
    productCode: '382147823113',
    barcode: '18361631739-3232',
    productName: '奶茶塑料杯饮料一次性带盖果汁杯子鲜果冻切透明冷热豆浆可定制图案',
    category: '清洁用品',
    unit: '个',
    spec: '默认规格',
    factoryPrice: 4.00,
    stockQty: 0,
    stockAmount: 0,
    availableQty: 0,
    availableAmount: 0,
  },
  {
    id: 's3',
    imageUrl: '',
    productCode: '28739817837',
    barcode: '237837273860848',
    productName: '奶茶塑料杯饮料一次性带盖果汁杯子鲜果冻切透明冷热豆浆可定制图案（500个）',
    category: '清洁用品',
    unit: '个',
    spec: '默认规格',
    factoryPrice: 200.00,
    stockQty: 0,
    stockAmount: 0,
    availableQty: 0,
    availableAmount: 0,
  },
  {
    id: 's4',
    imageUrl: '',
    productCode: 'SP003',
    barcode: 'SP003',
    productName: 'A4打印纸',
    category: '办公用品',
    unit: '箱',
    spec: '70g 500张',
    factoryPrice: 22.00,
    stockQty: 320,
    stockAmount: 7040,
    availableQty: 280,
    availableAmount: 6160,
  },
  {
    id: 's5',
    imageUrl: '',
    productCode: 'SP004',
    barcode: 'SP004',
    productName: '签字笔',
    category: '办公用品',
    unit: '盒',
    spec: '黑色 0.5mm',
    factoryPrice: 12.00,
    stockQty: 150,
    stockAmount: 1800,
    availableQty: 120,
    availableAmount: 1440,
  },
  {
    id: 's6',
    imageUrl: '',
    productCode: 'SP005',
    barcode: 'SP005',
    productName: '洗衣液',
    category: '清洁用品',
    unit: '瓶',
    spec: '2kg装',
    factoryPrice: 30.00,
    stockQty: 500,
    stockAmount: 15000,
    availableQty: 450,
    availableAmount: 13500,
  },
  {
    id: 's7',
    imageUrl: '',
    productCode: 'SP012',
    barcode: 'SP012',
    productName: '大米',
    category: '粮油米面',
    unit: '袋',
    spec: '25kg装',
    factoryPrice: 48.00,
    stockQty: 800,
    stockAmount: 38400,
    availableQty: 720,
    availableAmount: 34560,
  },
  {
    id: 's8',
    imageUrl: '',
    productCode: 'SP013',
    barcode: 'SP013',
    productName: '食用油',
    category: '粮油米面',
    unit: '桶',
    spec: '5L装',
    factoryPrice: 68.00,
    stockQty: 450,
    stockAmount: 30600,
    availableQty: 400,
    availableAmount: 27200,
  },
  {
    id: 's9',
    imageUrl: '',
    productCode: 'SP006',
    barcode: 'SP006',
    productName: '毛巾',
    category: '针织家纺',
    unit: '条',
    spec: '纯棉 35x75cm',
    factoryPrice: 10.00,
    stockQty: 200,
    stockAmount: 2000,
    availableQty: 180,
    availableAmount: 1800,
  },
  {
    id: 's10',
    imageUrl: '',
    productCode: 'SP008',
    barcode: 'SP008',
    productName: '饼干礼盒',
    category: '休闲食品',
    unit: '盒',
    spec: '500g',
    factoryPrice: 55.00,
    stockQty: 30,
    stockAmount: 1650,
    availableQty: 28,
    availableAmount: 1540,
  },
]

const mockStockDetail: StockDetail[] = [
  // 仓库A
  {
    id: 'd1',
    warehouseCode: 'WH-A01',
    warehouseName: '仓库A',
    imageUrl: '',
    barcode: 'SP003',
    productName: 'A4打印纸',
    category: '办公用品',
    unit: '箱',
    spec: '70g 500张',
    factoryPrice: 22.00,
    warningQty: 50,
    stockQty: 200,
    stockAmount: 4400,
    availableQty: 180,
    availableAmount: 3960,
    productCode: 'SP003',
    supplier: '供应商A',
    warehouse: '仓库A',
  },
  {
    id: 'd2',
    warehouseCode: 'WH-A01',
    warehouseName: '仓库A',
    imageUrl: '',
    barcode: 'SP004',
    productName: '签字笔',
    category: '办公用品',
    unit: '盒',
    spec: '黑色 0.5mm',
    factoryPrice: 12.00,
    warningQty: 30,
    stockQty: 80,
    stockAmount: 960,
    availableQty: 60,
    availableAmount: 720,
    productCode: 'SP004',
    supplier: '供应商A',
    warehouse: '仓库A',
  },
  {
    id: 'd3',
    warehouseCode: 'WH-A01',
    warehouseName: '仓库A',
    imageUrl: '',
    barcode: 'SP005',
    productName: '洗衣液',
    category: '清洁用品',
    unit: '瓶',
    spec: '2kg装',
    factoryPrice: 30.00,
    warningQty: 100,
    stockQty: 300,
    stockAmount: 9000,
    availableQty: 280,
    availableAmount: 8400,
    productCode: 'SP005',
    supplier: '供应商B',
    warehouse: '仓库A',
  },
  {
    id: 'd4',
    warehouseCode: 'WH-A01',
    warehouseName: '仓库A',
    imageUrl: '',
    barcode: '321432',
    productName: '迷彩一次性口罩印花防菌可爱男女潮款透气冬季加厚骑行明星口罩',
    category: '个人护理',
    unit: '个',
    spec: '默认规格',
    factoryPrice: 10.00,
    warningQty: 500,
    stockQty: 0,
    stockAmount: 0,
    availableQty: 0,
    availableAmount: 0,
    productCode: '321432',
    supplier: '供应商C',
    warehouse: '仓库A',
  },
  // 仓库B
  {
    id: 'd5',
    warehouseCode: 'WH-B01',
    warehouseName: '仓库B',
    imageUrl: '',
    barcode: 'SP003',
    productName: 'A4打印纸',
    category: '办公用品',
    unit: '箱',
    spec: '70g 500张',
    factoryPrice: 22.00,
    warningQty: 50,
    stockQty: 120,
    stockAmount: 2640,
    availableQty: 100,
    availableAmount: 2200,
    productCode: 'SP003',
    supplier: '供应商A',
    warehouse: '仓库B',
  },
  {
    id: 'd6',
    warehouseCode: 'WH-B01',
    warehouseName: '仓库B',
    imageUrl: '',
    barcode: 'SP004',
    productName: '签字笔',
    category: '办公用品',
    unit: '盒',
    spec: '黑色 0.5mm',
    factoryPrice: 12.00,
    warningQty: 30,
    stockQty: 70,
    stockAmount: 840,
    availableQty: 60,
    availableAmount: 720,
    productCode: 'SP004',
    supplier: '供应商A',
    warehouse: '仓库B',
  },
  {
    id: 'd7',
    warehouseCode: 'WH-B01',
    warehouseName: '仓库B',
    imageUrl: '',
    barcode: '382147823113',
    productName: '奶茶塑料杯饮料一次性带盖果汁杯子',
    category: '清洁用品',
    unit: '个',
    spec: '默认规格',
    factoryPrice: 4.00,
    warningQty: 1000,
    stockQty: 0,
    stockAmount: 0,
    availableQty: 0,
    availableAmount: 0,
    productCode: '382147823113',
    supplier: '供应商D',
    warehouse: '仓库B',
  },
  {
    id: 'd8',
    warehouseCode: 'WH-B01',
    warehouseName: '仓库B',
    imageUrl: '',
    barcode: 'SP012',
    productName: '大米',
    category: '粮油米面',
    unit: '袋',
    spec: '25kg装',
    factoryPrice: 48.00,
    warningQty: 100,
    stockQty: 450,
    stockAmount: 21600,
    availableQty: 400,
    availableAmount: 19200,
    productCode: 'SP012',
    supplier: '供应商C',
    warehouse: '仓库B',
  },
  // 仓库C
  {
    id: 'd9',
    warehouseCode: 'WH-C01',
    warehouseName: '仓库C',
    imageUrl: '',
    barcode: 'SP012',
    productName: '大米',
    category: '粮油米面',
    unit: '袋',
    spec: '25kg装',
    factoryPrice: 48.00,
    warningQty: 100,
    stockQty: 350,
    stockAmount: 16800,
    availableQty: 320,
    availableAmount: 15360,
    productCode: 'SP012',
    supplier: '供应商C',
    warehouse: '仓库C',
  },
  {
    id: 'd10',
    warehouseCode: 'WH-C01',
    warehouseName: '仓库C',
    imageUrl: '',
    barcode: 'SP013',
    productName: '食用油',
    category: '粮油米面',
    unit: '桶',
    spec: '5L装',
    factoryPrice: 68.00,
    warningQty: 80,
    stockQty: 250,
    stockAmount: 17000,
    availableQty: 220,
    availableAmount: 14960,
    productCode: 'SP013',
    supplier: '供应商C',
    warehouse: '仓库C',
  },
  {
    id: 'd11',
    warehouseCode: 'WH-C01',
    warehouseName: '仓库C',
    imageUrl: '',
    barcode: 'SP006',
    productName: '毛巾',
    category: '针织家纺',
    unit: '条',
    spec: '纯棉 35x75cm',
    factoryPrice: 10.00,
    warningQty: 50,
    stockQty: 200,
    stockAmount: 2000,
    availableQty: 180,
    availableAmount: 1800,
    productCode: 'SP006',
    supplier: '供应商B',
    warehouse: '仓库C',
  },
  {
    id: 'd12',
    warehouseCode: 'WH-C01',
    warehouseName: '仓库C',
    imageUrl: '',
    barcode: 'SP008',
    productName: '饼干礼盒',
    category: '休闲食品',
    unit: '盒',
    spec: '500g',
    factoryPrice: 55.00,
    warningQty: 20,
    stockQty: 30,
    stockAmount: 1650,
    availableQty: 28,
    availableAmount: 1540,
    productCode: 'SP008',
    supplier: '供应商D',
    warehouse: '仓库C',
  },
  // 仓库D
  {
    id: 'd13',
    warehouseCode: 'WH-D01',
    warehouseName: '仓库D',
    imageUrl: '',
    barcode: 'SP005',
    productName: '洗衣液',
    category: '清洁用品',
    unit: '瓶',
    spec: '2kg装',
    factoryPrice: 30.00,
    warningQty: 100,
    stockQty: 200,
    stockAmount: 6000,
    availableQty: 170,
    availableAmount: 5100,
    productCode: 'SP005',
    supplier: '供应商B',
    warehouse: '仓库D',
  },
  {
    id: 'd14',
    warehouseCode: 'WH-D01',
    warehouseName: '仓库D',
    imageUrl: '',
    barcode: 'SP013',
    productName: '食用油',
    category: '粮油米面',
    unit: '桶',
    spec: '5L装',
    factoryPrice: 68.00,
    warningQty: 80,
    stockQty: 200,
    stockAmount: 13600,
    availableQty: 180,
    availableAmount: 12240,
    productCode: 'SP013',
    supplier: '供应商C',
    warehouse: '仓库D',
  },
  {
    id: 'd15',
    warehouseCode: 'WH-D01',
    warehouseName: '仓库D',
    imageUrl: '',
    barcode: '28739817837',
    productName: '奶茶塑料杯饮料一次性带盖果汁杯子（500个）',
    category: '清洁用品',
    unit: '个',
    spec: '默认规格',
    factoryPrice: 200.00,
    warningQty: 200,
    stockQty: 5,
    stockAmount: 1000,
    availableQty: 5,
    availableAmount: 1000,
    productCode: '28739817837',
    supplier: '供应商D',
    warehouse: '仓库D',
  },
  {
    id: 'd16',
    warehouseCode: 'WH-D01',
    warehouseName: '仓库D',
    imageUrl: '',
    barcode: 'SP004',
    productName: '签字笔',
    category: '办公用品',
    unit: '盒',
    spec: '黑色 0.5mm',
    factoryPrice: 12.00,
    warningQty: 30,
    stockQty: 0,
    stockAmount: 0,
    availableQty: 0,
    availableAmount: 0,
    productCode: 'SP004',
    supplier: '供应商A',
    warehouse: '仓库D',
  },
]

const summaryStore: StockSummary[] = JSON.parse(JSON.stringify(mockStockSummary))
const detailStore: StockDetail[] = JSON.parse(JSON.stringify(mockStockDetail))

export function getStockSummaryPage(params: {
  page: number
  pageSize: number
  category?: string
  supplier?: string
  productCode?: string
  productName?: string
}): Promise<Result<{ list: StockSummary[]; total: number }>> {
  let filtered = [...summaryStore]

  if (params.category) {
    filtered = filtered.filter((r) => r.category === params.category)
  }
  if (params.productCode) {
    filtered = filtered.filter((r) => r.productCode === params.productCode)
  }
  if (params.productName) {
    const kw = params.productName.toLowerCase()
    filtered = filtered.filter((r) => r.productName.toLowerCase().includes(kw))
  }

  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  const list = filtered.slice(start, start + params.pageSize)
  return mockResponse({ list, total })
}

export function getStockDetailPage(params: {
  page: number
  pageSize: number
  warehouse?: string
  supplier?: string
  category?: string
  keyword?: string
  warningOnly?: boolean
}): Promise<Result<{ list: StockDetail[]; total: number }>> {
  let filtered = [...detailStore]

  if (params.warehouse) {
    filtered = filtered.filter((r) => r.warehouse === params.warehouse)
  }
  if (params.supplier) {
    filtered = filtered.filter((r) => r.supplier === params.supplier)
  }
  if (params.category) {
    filtered = filtered.filter((r) => r.category === params.category)
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = filtered.filter(
      (r) =>
        r.barcode.toLowerCase().includes(kw) ||
        r.productName.toLowerCase().includes(kw)
    )
  }
  if (params.warningOnly) {
    filtered = filtered.filter((r) => r.stockQty <= r.warningQty)
  }

  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  const list = filtered.slice(start, start + params.pageSize)
  return mockResponse({ list, total })
}

export function getStockDetailByProductCode(productCode: string): Promise<Result<StockDetail[]>> {
  const records = detailStore.filter((r) => r.productCode === productCode)
  return mockResponse(records)
}
