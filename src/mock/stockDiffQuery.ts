import type { Result } from '@/http'
import { mockResponse } from '@/mock'

export interface StockDiffRecord {
  id: string
  checkNo: string
  warehouseCode: string
  warehouseName: string
  goodsNo: string
  barcode: string
  productName: string
  spec: string
  brand: string
  category: string
  factoryPrice: number
  systemQty: number
  actualQty: number
  diffQty: number
  systemAmount: number
  actualAmount: number
  profitLossAmount: number
  changeStockFlag: 'yes' | 'no'
  diffReason: string
  operateDate: string
  checker: string
}

// 脱敏仓库数据
export const warehouseOptions = [
  { label: '仓库甲', value: '仓库甲', code: 'WH-001' },
  { label: '仓库乙', value: '仓库乙', code: 'WH-002' },
  { label: '仓库丙', value: '仓库丙', code: 'WH-003' },
  { label: '仓库丁', value: '仓库丁', code: 'WH-004' },
]

// 脱敏盘点单号选项
export const checkNoOptions = [
  { label: 'SCK-2026-0004', value: 'SCK-2026-0004' },
  { label: 'SCK-2026-0003', value: 'SCK-2026-0003' },
  { label: 'SCK-2026-0002', value: 'SCK-2026-0002' },
  { label: 'SCK-2026-0001', value: 'SCK-2026-0001' },
]

// 脱敏商品类别
export const categoryOptions = [
  { label: '办公用品', value: '办公用品' },
  { label: '粮油米面', value: '粮油米面' },
  { label: '日用清洁', value: '日用清洁' },
  { label: '家纺家饰', value: '家纺家饰' },
  { label: '休闲零食', value: '休闲零食' },
]

// 脱敏品牌
export const brandMap: Record<string, string> = {
  'SKU-1001': '晨光',
  'SKU-1002': '晨光',
  'SKU-1003': '得力',
  'SKU-2001': '金龙鱼',
  'SKU-2002': '福临门',
  'SKU-2003': '金龙鱼',
  'SKU-3001': '蓝月亮',
  'SKU-3002': '立白',
  'SKU-4001': '洁丽雅',
  'SKU-4002': '徐福记',
}

const mockDiffRecords: StockDiffRecord[] = [
  {
    id: '1',
    checkNo: 'SCK-2026-0004',
    warehouseCode: 'WH-001',
    warehouseName: '仓库甲',
    goodsNo: 'SP0001',
    barcode: 'SKU-1001',
    productName: '办公用纸A4',
    spec: '70g/500张',
    brand: '晨光',
    category: '办公用品',
    factoryPrice: 22.0,
    systemQty: 200,
    actualQty: 198,
    diffQty: -2,
    systemAmount: 4400.0,
    actualAmount: 4356.0,
    profitLossAmount: -44.0,
    changeStockFlag: 'no',
    diffReason: '少量破损损耗',
    operateDate: '2026-08-22',
    checker: '盘点员甲',
  },
  {
    id: '2',
    checkNo: 'SCK-2026-0004',
    warehouseCode: 'WH-001',
    warehouseName: '仓库甲',
    goodsNo: 'SP0003',
    barcode: 'SKU-1003',
    productName: '订书机标准型',
    spec: '12号钉',
    brand: '得力',
    category: '办公用品',
    factoryPrice: 18.0,
    systemQty: 60,
    actualQty: 62,
    diffQty: 2,
    systemAmount: 1080.0,
    actualAmount: 1116.0,
    profitLossAmount: 36.0,
    changeStockFlag: 'no',
    diffReason: '上次盘点数登记错误',
    operateDate: '2026-08-22',
    checker: '盘点员甲',
  },
  {
    id: '3',
    checkNo: 'SCK-2026-0003',
    warehouseCode: 'WH-002',
    warehouseName: '仓库乙',
    goodsNo: 'SP0101',
    barcode: 'SKU-2001',
    productName: '包装大米',
    spec: '25kg/袋',
    brand: '金龙鱼',
    category: '粮油米面',
    factoryPrice: 48.0,
    systemQty: 450,
    actualQty: 448,
    diffQty: -2,
    systemAmount: 21600.0,
    actualAmount: 21504.0,
    profitLossAmount: -96.0,
    changeStockFlag: 'yes',
    diffReason: '包装袋轻微破损导致撒漏',
    operateDate: '2026-08-20',
    checker: '盘点员乙',
  },
  {
    id: '4',
    checkNo: 'SCK-2026-0003',
    warehouseCode: 'WH-002',
    warehouseName: '仓库乙',
    goodsNo: 'SP0103',
    barcode: 'SKU-2003',
    productName: '面粉编织袋',
    spec: '10kg/袋',
    brand: '金龙鱼',
    category: '粮油米面',
    factoryPrice: 32.0,
    systemQty: 300,
    actualQty: 302,
    diffQty: 2,
    systemAmount: 9600.0,
    actualAmount: 9664.0,
    profitLossAmount: 64.0,
    changeStockFlag: 'yes',
    diffReason: '盘点前入库未及时录入系统',
    operateDate: '2026-08-20',
    checker: '盘点员乙',
  },
  {
    id: '5',
    checkNo: 'SCK-2026-0002',
    warehouseCode: 'WH-003',
    warehouseName: '仓库丙',
    goodsNo: 'SP0201',
    barcode: 'SKU-3001',
    productName: '瓶装洗衣液',
    spec: '2kg/瓶',
    brand: '蓝月亮',
    category: '日用清洁',
    factoryPrice: 30.0,
    systemQty: 500,
    actualQty: 495,
    diffQty: -5,
    systemAmount: 15000.0,
    actualAmount: 14850.0,
    profitLossAmount: -150.0,
    changeStockFlag: 'no',
    diffReason: '搬运过程中摔坏5瓶',
    operateDate: '2026-08-18',
    checker: '盘点员丙',
  },
  {
    id: '6',
    checkNo: 'SCK-2026-0001',
    warehouseCode: 'WH-004',
    warehouseName: '仓库丁',
    goodsNo: 'SP0301',
    barcode: 'SKU-4001',
    productName: '针织毛巾',
    spec: '纯棉/35x75cm',
    brand: '洁丽雅',
    category: '家纺家饰',
    factoryPrice: 10.5,
    systemQty: 500,
    actualQty: 490,
    diffQty: -10,
    systemAmount: 5250.0,
    actualAmount: 5145.0,
    profitLossAmount: -105.0,
    changeStockFlag: 'no',
    diffReason: '数量不符',
    operateDate: '2026-08-15',
    checker: '仓库管理员',
  },
  {
    id: '7',
    checkNo: 'SCK-2026-0001',
    warehouseCode: 'WH-004',
    warehouseName: '仓库丁',
    goodsNo: 'SP0302',
    barcode: 'SKU-4002',
    productName: '饼干礼盒装',
    spec: '500g/盒',
    brand: '徐福记',
    category: '休闲零食',
    factoryPrice: 52.0,
    systemQty: 80,
    actualQty: 70,
    diffQty: -10,
    systemAmount: 4160.0,
    actualAmount: 3640.0,
    profitLossAmount: -520.0,
    changeStockFlag: 'no',
    diffReason: '少了',
    operateDate: '2026-08-15',
    checker: '仓库管理员',
  },
  {
    id: '8',
    checkNo: 'SCK-2026-0003',
    warehouseCode: 'WH-002',
    warehouseName: '仓库乙',
    goodsNo: 'SP0002',
    barcode: 'SKU-1002',
    productName: '中性笔黑色',
    spec: '0.5mm/12支装',
    brand: '晨光',
    category: '办公用品',
    factoryPrice: 12.5,
    systemQty: 150,
    actualQty: 150,
    diffQty: 0,
    systemAmount: 1875.0,
    actualAmount: 1875.0,
    profitLossAmount: 0.0,
    changeStockFlag: 'no',
    diffReason: '',
    operateDate: '2026-08-20',
    checker: '盘点员乙',
  },
  {
    id: '9',
    checkNo: 'SCK-2026-0003',
    warehouseCode: 'WH-002',
    warehouseName: '仓库乙',
    goodsNo: 'SP0102',
    barcode: 'SKU-2002',
    productName: '桶装食用油',
    spec: '5L/桶',
    brand: '福临门',
    category: '粮油米面',
    factoryPrice: 68.0,
    systemQty: 120,
    actualQty: 120,
    diffQty: 0,
    systemAmount: 8160.0,
    actualAmount: 8160.0,
    profitLossAmount: 0.0,
    changeStockFlag: 'no',
    diffReason: '',
    operateDate: '2026-08-20',
    checker: '盘点员乙',
  },
  {
    id: '10',
    checkNo: 'SCK-2026-0002',
    warehouseCode: 'WH-003',
    warehouseName: '仓库丙',
    goodsNo: 'SP0202',
    barcode: 'SKU-3002',
    productName: '洗洁精',
    spec: '500g/瓶',
    brand: '立白',
    category: '日用清洁',
    factoryPrice: 8.0,
    systemQty: 200,
    actualQty: 200,
    diffQty: 0,
    systemAmount: 1600.0,
    actualAmount: 1600.0,
    profitLossAmount: 0.0,
    changeStockFlag: 'no',
    diffReason: '',
    operateDate: '2026-08-18',
    checker: '盘点员丙',
  },
  {
    id: '11',
    checkNo: 'SCK-2026-0004',
    warehouseCode: 'WH-001',
    warehouseName: '仓库甲',
    goodsNo: 'SP0002',
    barcode: 'SKU-1002',
    productName: '中性笔黑色',
    spec: '0.5mm/12支装',
    brand: '晨光',
    category: '办公用品',
    factoryPrice: 12.5,
    systemQty: 150,
    actualQty: 150,
    diffQty: 0,
    systemAmount: 1875.0,
    actualAmount: 1875.0,
    profitLossAmount: 0.0,
    changeStockFlag: 'no',
    diffReason: '',
    operateDate: '2026-08-22',
    checker: '盘点员甲',
  },
  {
    id: '12',
    checkNo: 'SCK-2026-0002',
    warehouseCode: 'WH-003',
    warehouseName: '仓库丙',
    goodsNo: 'SP0101',
    barcode: 'SKU-2001',
    productName: '包装大米',
    spec: '25kg/袋',
    brand: '金龙鱼',
    category: '粮油米面',
    factoryPrice: 48.0,
    systemQty: 200,
    actualQty: 197,
    diffQty: -3,
    systemAmount: 9600.0,
    actualAmount: 9456.0,
    profitLossAmount: -144.0,
    changeStockFlag: 'no',
    diffReason: '搬运途中外包装破包撒漏',
    operateDate: '2026-08-18',
    checker: '盘点员丙',
  },
]

const diffStore: StockDiffRecord[] = JSON.parse(JSON.stringify(mockDiffRecords))

export function getStockDiffPage(params: {
  page: number
  pageSize: number
  checkNo?: string
  warehouse?: string
  keyword?: string
  category?: string
}): Promise<Result<{ list: StockDiffRecord[]; total: number }>> {
  let filtered = [...diffStore]

  if (params.checkNo) {
    filtered = filtered.filter((r) => r.checkNo === params.checkNo)
  }
  if (params.warehouse) {
    filtered = filtered.filter((r) => r.warehouseName === params.warehouse)
  }
  if (params.category) {
    filtered = filtered.filter((r) => r.category === params.category)
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = filtered.filter(
      (r) =>
        r.goodsNo.toLowerCase().includes(kw) ||
        r.productName.toLowerCase().includes(kw) ||
        r.barcode.toLowerCase().includes(kw)
    )
  }

  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  const list = filtered.slice(start, start + params.pageSize)
  return mockResponse({ list, total })
}

export function getStockDiffSummary(): Promise<Result<{
  totalRecords: number
  diffRecords: number
  totalProfitLoss: number
  changedStockRecords: number
}>> {
  const totalRecords = diffStore.length
  const diffRecords = diffStore.filter((r) => r.diffQty !== 0).length
  const totalProfitLoss = diffStore.reduce((sum, r) => sum + r.profitLossAmount, 0)
  const changedStockRecords = diffStore.filter((r) => r.changeStockFlag === 'yes').length
  return mockResponse({
    totalRecords,
    diffRecords,
    totalProfitLoss,
    changedStockRecords,
  })
}
