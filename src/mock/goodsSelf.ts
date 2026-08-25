// src/mock/goodsSelf.ts
// 自采商品管理 mock 数据层
import type { Result } from '@/http'
import { mockResponse } from '@/mock'

export interface SelfGoods {
  id: string
  productCode: string
  productName: string
  nickname: string
  brand: string
  origin: string
  category: string
  spec: string
  unit: string
  weight: number
  purchasePrice: number
  supplier: string
  marketPrice: number
  costPrice: number
  memberPrice: number
  exchangePoints: number
  customsEnglishName: string
  sourcePlace: string
  hsCode: string
  exportRebateRate: number
  isFreeShipping: boolean
  isOnShelf: boolean
  isRecommended: boolean
  isNew: boolean
  isHotSale: boolean
  isPointsParticipation: boolean
  keywords: string
  description: string
  detailDescription: string
  sortOrder: number
  createTime: string
  updateTime: string
}

export const brandOptions = [
  { label: '品牌A', value: '品牌A' },
  { label: '品牌B', value: '品牌B' },
  { label: '品牌C', value: '品牌C' },
  { label: '品牌D', value: '品牌D' },
  { label: '品牌E', value: '品牌E' },
]

export const categoryOptions = [
  { label: '箱包', value: '箱包' },
  { label: '无纺布', value: '无纺布' },
  { label: '棉布袋', value: '棉布袋' },
  { label: '折叠袋', value: '折叠袋' },
  { label: '背包', value: '背包' },
  { label: '网布袋', value: '网布袋' },
  { label: '园林桶', value: '园林桶' },
  { label: '其他体育类', value: '其他体育类' },
  { label: '车载包', value: '车载包' },
  { label: '保温包', value: '保温包' },
  { label: '抽绳袋', value: '抽绳袋' },
  { label: '化妆包', value: '化妆包' },
  { label: '洗漱包', value: '洗漱包' },
  { label: '腰包', value: '腰包' },
  { label: '脏衣篮', value: '脏衣篮' },
  { label: '漂流袋', value: '漂流袋' },
  { label: '购物袋', value: '购物袋' },
  { label: '防水袋', value: '防水袋' },
  { label: '旅行包', value: '旅行包' },
  { label: '麻布笔', value: '麻布笔' },
  { label: '水杯', value: '水杯' },
  { label: '马克杯', value: '马克杯' },
  { label: '塑料杯', value: '塑料杯' },
  { label: '运动水杯', value: '运动水杯' },
  { label: '折叠水杯', value: '折叠水杯' },
  { label: '工艺礼品', value: '工艺礼品' },
  { label: '铁皮广告牌', value: '铁皮广告牌' },
  { label: 'U盘', value: 'U盘' },
  { label: '台灯', value: '台灯' },
]

export const supplierOptions = [
  { label: '供应商A', value: '供应商A' },
  { label: '供应商B', value: '供应商B' },
  { label: '供应商C', value: '供应商C' },
  { label: '供应商D', value: '供应商D' },
]

export const shelfStatusOptions = [
  { label: '上架', value: 'on' },
  { label: '下架', value: 'off' },
]

export const unitOptions = [
  { label: '个', value: '个' },
  { label: '件', value: '件' },
  { label: '套', value: '套' },
  { label: '箱', value: '箱' },
  { label: '包', value: '包' },
  { label: '瓶', value: '瓶' },
  { label: '袋', value: '袋' },
  { label: '盒', value: '盒' },
]

const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ')

const mockSelfGoods: SelfGoods[] = [
  {
    id: 'g1',
    productCode: 'SP001',
    productName: '涤纶网袋',
    nickname: '网袋收纳',
    brand: '品牌A',
    origin: '浙江义乌',
    category: '网布袋',
    spec: '默认规格:默认',
    unit: '个',
    weight: 50,
    purchasePrice: 2.25,
    supplier: '供应商A',
    marketPrice: 5.00,
    costPrice: 1.80,
    memberPrice: 4.50,
    exchangePoints: 100,
    customsEnglishName: 'Polyester Mesh Bag',
    sourcePlace: '浙江义乌',
    hsCode: '5698000000',
    exportRebateRate: 13,
    isFreeShipping: false,
    isOnShelf: true,
    isRecommended: false,
    isNew: false,
    isHotSale: false,
    isPointsParticipation: false,
    keywords: '网袋,收纳,涤纶',
    description: '涤纶网袋，优质材质，结实耐用',
    detailDescription: '<p>涤纶网袋，采用优质涤纶面料制作，网眼设计，透气通风。</p>',
    sortOrder: 5,
    createTime: '2026-01-15 10:30:00',
    updateTime: '2026-03-20 14:00:00',
  },
  {
    id: 'g2',
    productCode: 'SP002',
    productName: '巴西5L方底迷彩防水袋',
    nickname: '防水袋',
    brand: '品牌B',
    origin: '广东深圳',
    category: '防水袋',
    spec: '默认规格:默认',
    unit: '个',
    weight: 120,
    purchasePrice: 11.80,
    supplier: '供应商B',
    marketPrice: 18.00,
    costPrice: 9.50,
    memberPrice: 16.50,
    exchangePoints: 300,
    customsEnglishName: 'Brazil 5L Square Camouflage Waterproof Bag',
    sourcePlace: '广东深圳',
    hsCode: '3926909090',
    exportRebateRate: 13,
    isFreeShipping: true,
    isOnShelf: true,
    isRecommended: false,
    isNew: false,
    isHotSale: false,
    isPointsParticipation: true,
    keywords: '防水袋,迷彩,5L',
    description: '巴西5L方底迷彩防水袋，加厚PVC材质',
    detailDescription: '<p>巴西5L方底迷彩防水袋，加厚PVC材质，防水性能卓越。</p>',
    sortOrder: 5,
    createTime: '2026-02-01 09:15:00',
    updateTime: '2026-03-25 16:30:00',
  },
  {
    id: 'g3',
    productCode: 'SP003',
    productName: '巴西15L方底迷彩防水袋',
    nickname: '大容量防水袋',
    brand: '品牌B',
    origin: '广东深圳',
    category: '防水袋',
    spec: '默认规格:默认',
    unit: '个',
    weight: 280,
    purchasePrice: 15.58,
    supplier: '供应商B',
    marketPrice: 25.00,
    costPrice: 12.00,
    memberPrice: 22.50,
    exchangePoints: 500,
    customsEnglishName: 'Brazil 15L Square Camouflage Waterproof Bag',
    sourcePlace: '广东深圳',
    hsCode: '3926909090',
    exportRebateRate: 13,
    isFreeShipping: true,
    isOnShelf: true,
    isRecommended: false,
    isNew: false,
    isHotSale: false,
    isPointsParticipation: true,
    keywords: '防水袋,迷彩,15L,大容量',
    description: '巴西15L方底迷彩防水袋，大容量设计',
    detailDescription: '<p>巴西15L方底迷彩防水袋，大容量设计，适合户外使用。</p>',
    sortOrder: 5,
    createTime: '2026-02-05 11:00:00',
    updateTime: '2026-04-01 10:20:00',
  },
  {
    id: 'g4',
    productCode: 'SP004',
    productName: '倒酒器',
    nickname: '醒酒器',
    brand: '品牌C',
    origin: '山东淄博',
    category: '厨房用品',
    spec: '默认规格:默认',
    unit: '个',
    weight: 350,
    purchasePrice: 2.90,
    supplier: '供应商C',
    marketPrice: 8.00,
    costPrice: 2.30,
    memberPrice: 7.00,
    exchangePoints: 150,
    customsEnglishName: 'Wine Decanter',
    sourcePlace: '山东淄博',
    hsCode: '7013490000',
    exportRebateRate: 9,
    isFreeShipping: false,
    isOnShelf: true,
    isRecommended: false,
    isNew: false,
    isHotSale: false,
    isPointsParticipation: false,
    keywords: '倒酒器,醒酒器,玻璃',
    description: '水晶玻璃倒酒器，优雅大方',
    detailDescription: '<p>水晶玻璃倒酒器，优雅大方，适合商务礼品。</p>',
    sortOrder: 5,
    createTime: '2026-02-10 14:30:00',
    updateTime: '2026-03-28 09:00:00',
  },
  {
    id: 'g5',
    productCode: 'SP005',
    productName: '折叠袋',
    nickname: '环保袋',
    brand: '品牌A',
    origin: '浙江杭州',
    category: '折叠袋',
    spec: '默认规格:默认',
    unit: '个',
    weight: 40,
    purchasePrice: 6.60,
    supplier: '供应商A',
    marketPrice: 12.00,
    costPrice: 5.20,
    memberPrice: 10.50,
    exchangePoints: 200,
    customsEnglishName: 'Foldable Shopping Bag',
    sourcePlace: '浙江杭州',
    hsCode: '6307900000',
    exportRebateRate: 13,
    isFreeShipping: false,
    isOnShelf: true,
    isRecommended: false,
    isNew: false,
    isHotSale: false,
    isPointsParticipation: false,
    keywords: '折叠袋,环保,购物袋',
    description: '便携折叠环保购物袋',
    detailDescription: '<p>便携折叠环保购物袋，折叠后小巧方便携带。</p>',
    sortOrder: 5,
    createTime: '2026-02-15 16:00:00',
    updateTime: '2026-04-05 11:30:00',
  },
  {
    id: 'g6',
    productCode: 'SP006',
    productName: '袜子',
    nickname: '运动袜',
    brand: '品牌D',
    origin: '广东广州',
    category: '购物袋',
    spec: '默认规格:默认',
    unit: '双',
    weight: 30,
    purchasePrice: 3.10,
    supplier: '供应商D',
    marketPrice: 6.00,
    costPrice: 2.50,
    memberPrice: 5.00,
    exchangePoints: 80,
    customsEnglishName: 'Socks',
    sourcePlace: '广东广州',
    hsCode: '6115960000',
    exportRebateRate: 16,
    isFreeShipping: false,
    isOnShelf: true,
    isRecommended: false,
    isNew: false,
    isHotSale: false,
    isPointsParticipation: false,
    keywords: '袜子,运动,棉袜',
    description: '舒适透气运动袜',
    detailDescription: '<p>舒适透气运动袜，棉混纺材质。</p>',
    sortOrder: 5,
    createTime: '2026-02-20 10:00:00',
    updateTime: '2026-04-10 14:00:00',
  },
]

const goodsStore: SelfGoods[] = JSON.parse(JSON.stringify(mockSelfGoods))

// 下一个 ID 序号
let nextId = goodsStore.length + 1

export function getSelfGoodsPage(params: {
  page: number
  pageSize: number
  brand?: string
  category?: string
  keyword?: string
  shelfStatus?: string
}): Promise<Result<{ list: SelfGoods[]; total: number }>> {
  let filtered = [...goodsStore]

  if (params.brand) {
    filtered = filtered.filter((g) => g.brand === params.brand)
  }
  if (params.category) {
    filtered = filtered.filter((g) => g.category === params.category)
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = filtered.filter(
      (g) =>
        g.productName.toLowerCase().includes(kw) ||
        g.productCode.toLowerCase().includes(kw) ||
        g.nickname.toLowerCase().includes(kw) ||
        g.keywords.toLowerCase().includes(kw)
    )
  }
  if (params.shelfStatus) {
    filtered = filtered.filter((g) =>
      params.shelfStatus === 'on' ? g.isOnShelf : !g.isOnShelf
    )
  }

  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  const list = filtered.slice(start, start + params.pageSize)
  return mockResponse({ list, total })
}

export function getSelfGoodsById(id: string): Promise<Result<SelfGoods | undefined>> {
  const goods = goodsStore.find((g) => g.id === id)
  return mockResponse(goods)
}

export function addSelfGoods(data: Omit<SelfGoods, 'id' | 'createTime' | 'updateTime'>): Promise<Result<SelfGoods>> {
  const id = `g${nextId++}`
  const newGoods: SelfGoods = {
    ...data,
    id,
    createTime: now(),
    updateTime: now(),
  }
  goodsStore.push(newGoods)
  return mockResponse(newGoods)
}

export function updateSelfGoods(id: string, data: Partial<SelfGoods>): Promise<Result<SelfGoods>> {
  const index = goodsStore.findIndex((g) => g.id === id)
  if (index === -1) {
    return mockResponse({} as SelfGoods)
  }
  goodsStore[index] = {
    ...goodsStore[index],
    ...data,
    id,
    updateTime: now(),
  }
  return mockResponse(goodsStore[index])
}

export function deleteSelfGoods(id: string): Promise<Result<boolean>> {
  const index = goodsStore.findIndex((g) => g.id === id)
  if (index !== -1) {
    goodsStore.splice(index, 1)
  }
  return mockResponse(true)
}
