import type { Result } from '@/http'
import { mockResponse } from '@/mock'

export interface WarningSettingRecord {
  id: string
  goodsNo: string
  barcode: string
  spec: string
  brand: string
  unit: string
  warehouseCode: string
  warehouseName: string
  stockQty: number
  availableQty: number
  warningQty: number
  suggestPurchaseQty: number
  productName: string
  category: string
}

// 脱敏仓库数据
export const warehouseOptions = [
  { label: '上海港口', value: '上海港口', code: 'WH-SH-001' },
  { label: '宁波港口', value: '宁波港口', code: 'WH-NB-001' },
  { label: '上海办公室', value: '上海办公室', code: 'WH-SH-OFFICE' },
  { label: '义乌仓库', value: '义乌仓库', code: 'WH-YW-001' },
  { label: '广州仓库', value: '广州仓库', code: 'WH-GZ-001' },
  { label: '深圳港口', value: '深圳港口', code: 'WH-SZ-001' },
  { label: '厦门港口', value: '厦门港口', code: 'WH-XM-001' },
  { label: '天津港口', value: '天津港口', code: 'WH-TJ-001' },
  { label: '青岛港口', value: '青岛港口', code: 'WH-QD-001' },
]

// 左侧仓库列表（"全部仓库"节点 + 明细，包含通知项）
export interface WarehouseNavItem {
  label: string
  value: string
  code?: string
  type: 'root' | 'warehouse' | 'notify'
}

export const warehouseNavItems: WarehouseNavItem[] = [
  { label: '全部仓库', value: '__all__', type: 'root' },
  { label: '上海港口', value: '上海港口', code: 'WH-SH-001', type: 'warehouse' },
  { label: '宁波港口', value: '宁波港口', code: 'WH-NB-001', type: 'warehouse' },
  { label: '上海办公室', value: '上海办公室', code: 'WH-SH-OFFICE', type: 'warehouse' },
  { label: '义乌仓库', value: '义乌仓库', code: 'WH-YW-001', type: 'warehouse' },
  { label: '广州仓库', value: '广州仓库', code: 'WH-GZ-001', type: 'warehouse' },
  { label: '深圳港口', value: '深圳港口', code: 'WH-SZ-001', type: 'warehouse' },
  { label: '厦门港口', value: '厦门港口', code: 'WH-XM-001', type: 'warehouse' },
  { label: '天津港口', value: '天津港口', code: 'WH-TJ-001', type: 'warehouse' },
  { label: '青岛港口', value: '青岛港口', code: 'WH-QD-001', type: 'warehouse' },
  { label: '待定另通知', value: '__notify__', type: 'notify' },
]

// 脱敏货号选项
export const goodsNoOptions = [
  { label: 'SP0001 办公用纸A4', value: 'SP0001' },
  { label: 'SP0002 中性笔黑色', value: 'SP0002' },
  { label: 'SP0003 订书机标准型', value: 'SP0003' },
  { label: 'SP0101 包装大米', value: 'SP0101' },
  { label: 'SP0102 桶装食用油', value: 'SP0102' },
  { label: 'SP0103 面粉编织袋', value: 'SP0103' },
  { label: 'SP0201 瓶装洗衣液', value: 'SP0201' },
  { label: 'SP0202 洗洁精', value: 'SP0202' },
  { label: 'SP0301 针织毛巾', value: 'SP0301' },
  { label: 'SP0302 饼干礼盒装', value: 'SP0302' },
]

// 脱敏品牌
export const brandOptions = [
  { label: '晨光', value: '晨光' },
  { label: '得力', value: '得力' },
  { label: '金龙鱼', value: '金龙鱼' },
  { label: '福临门', value: '福临门' },
  { label: '蓝月亮', value: '蓝月亮' },
  { label: '立白', value: '立白' },
  { label: '洁丽雅', value: '洁丽雅' },
  { label: '徐福记', value: '徐福记' },
]

const goodsMetaMap: Record<string, {
  barcode: string
  productName: string
  spec: string
  brand: string
  unit: string
  category: string
}> = {
  SP0001: { barcode: 'SKU-1001', productName: '办公用纸A4', spec: '70g/500张', brand: '晨光', unit: '箱', category: '办公用品' },
  SP0002: { barcode: 'SKU-1002', productName: '中性笔黑色', spec: '0.5mm/12支装', brand: '晨光', unit: '盒', category: '办公用品' },
  SP0003: { barcode: 'SKU-1003', productName: '订书机标准型', spec: '12号钉', brand: '得力', unit: '个', category: '办公用品' },
  SP0101: { barcode: 'SKU-2001', productName: '包装大米', spec: '25kg/袋', brand: '金龙鱼', unit: '袋', category: '粮油米面' },
  SP0102: { barcode: 'SKU-2002', productName: '桶装食用油', spec: '5L/桶', brand: '福临门', unit: '桶', category: '粮油米面' },
  SP0103: { barcode: 'SKU-2003', productName: '面粉编织袋', spec: '10kg/袋', brand: '金龙鱼', unit: '袋', category: '粮油米面' },
  SP0201: { barcode: 'SKU-3001', productName: '瓶装洗衣液', spec: '2kg/瓶', brand: '蓝月亮', unit: '瓶', category: '日用清洁' },
  SP0202: { barcode: 'SKU-3002', productName: '洗洁精', spec: '500g/瓶', brand: '立白', unit: '瓶', category: '日用清洁' },
  SP0301: { barcode: 'SKU-4001', productName: '针织毛巾', spec: '纯棉/35x75cm', brand: '洁丽雅', unit: '条', category: '家纺家饰' },
  SP0302: { barcode: 'SKU-4002', productName: '饼干礼盒装', spec: '500g/盒', brand: '徐福记', unit: '盒', category: '休闲零食' },
}

// 根据货号列表 × 仓库列表生成 mock 预警设置记录（每仓库少量商品，便于测试）
function buildMockRecords(): WarningSettingRecord[] {
  const records: WarningSettingRecord[] = []
  let idx = 1
  // 每个仓库只选取 3 个商品展示，数据量更精简
  const pickKeys = ['SP0001', 'SP0101', 'SP0201']
  for (const wh of warehouseOptions) {
    for (let i = 0; i < pickKeys.length; i++) {
      const goodsNo = pickKeys[i]
      const meta = goodsMetaMap[goodsNo]
      const baseStock = 80 + Math.floor(Math.random() * 300)
      const availableQty = Math.max(0, baseStock - Math.floor(Math.random() * 50))
      const warningQty = 30 + Math.floor(Math.random() * 50)
      const suggestPurchaseQty = availableQty < warningQty
        ? warningQty * 2 - availableQty + Math.floor(Math.random() * 20)
        : 0
      records.push({
        id: String(idx++),
        goodsNo,
        barcode: meta.barcode,
        spec: meta.spec,
        brand: meta.brand,
        unit: meta.unit,
        warehouseCode: wh.code,
        warehouseName: wh.value,
        stockQty: baseStock,
        availableQty,
        warningQty,
        suggestPurchaseQty,
        productName: meta.productName,
        category: meta.category,
      })
    }
  }
  return records
}

const mockRecords: WarningSettingRecord[] = buildMockRecords()
const warningStore: WarningSettingRecord[] = JSON.parse(JSON.stringify(mockRecords))

export function getWarningSettingPage(params: {
  page: number
  pageSize: number
  warehouse?: string
  goodsNo?: string
  barcode?: string
  brand?: string
}): Promise<Result<{ list: WarningSettingRecord[]; total: number }>> {
  let filtered = [...warningStore]

  if (params.warehouse && params.warehouse !== '__all__' && params.warehouse !== '__notify__') {
    filtered = filtered.filter((r) => r.warehouseName === params.warehouse)
  }
  if (params.warehouse === '__notify__') {
    // 待定另通知：过滤出建议采购量 > 0 但库存极度紧缺的记录（模拟通知待处理列表）
    filtered = filtered.filter((r) => r.availableQty <= r.warningQty && r.suggestPurchaseQty > 0)
  }
  if (params.goodsNo) {
    filtered = filtered.filter((r) => r.goodsNo === params.goodsNo)
  }
  if (params.barcode) {
    const kw = params.barcode.toLowerCase()
    filtered = filtered.filter(
      (r) => r.barcode.toLowerCase().includes(kw)
    )
  }
  if (params.brand) {
    filtered = filtered.filter((r) => r.brand === params.brand)
  }

  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  const list = filtered.slice(start, start + params.pageSize)
  return mockResponse({ list, total })
}

export function updateWarningQty(id: string, warningQty: number, suggestPurchaseQty: number): Promise<Result<WarningSettingRecord>> {
  const idx = warningStore.findIndex((r) => r.id === id)
  if (idx >= 0) {
    warningStore[idx].warningQty = warningQty
    warningStore[idx].suggestPurchaseQty = suggestPurchaseQty
    return mockResponse(warningStore[idx], '更新成功')
  }
  return mockResponse({} as WarningSettingRecord, '未找到该预警设置记录')
}

export function batchUpdateWarningQty(updates: Array<{
  id: string
  warningQty: number
  suggestPurchaseQty: number
}>): Promise<Result<number>> {
  let count = 0
  for (const u of updates) {
    const idx = warningStore.findIndex((r) => r.id === u.id)
    if (idx >= 0) {
      warningStore[idx].warningQty = u.warningQty
      warningStore[idx].suggestPurchaseQty = u.suggestPurchaseQty
      count++
    }
  }
  return mockResponse(count, `批量更新成功 ${count} 条`)
}
