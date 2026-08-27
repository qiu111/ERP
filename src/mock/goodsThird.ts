// src/mock/goodsThird.ts
// 第三方商品管理 mock 数据层
import type { Result } from '@/http'
import { mockResponse } from '@/mock'

export interface ThirdGoods {
  id: string
  productCode: string
  barcode: string
  productName: string
  brand: string
  origin: string
  category: string
  spec: string
  unit: string
  weight: number
  supplier: string
  purchasePrice: number
  deliveryPrice: number
  memberPrice: number
  retailPrice: number
  marketPrice: number
  exchangePoints: number
  stockQuantity: number
  isFreeShipping: boolean
  isOnShelf: boolean
  isRecommended: boolean
  isNew: boolean
  isHotSale: boolean
  isPointsParticipation: boolean
  keywords: string
  originalLink: string
  description: string
  detailDescription: string
  createTime: string
  updateTime: string
}

export const brandOptions = [
  { label: '优品汇', value: '优品汇' },
  { label: '匠心选', value: '匠心选' },
  { label: '绿源品', value: '绿源品' },
  { label: '臻品坊', value: '臻品坊' },
  { label: '百惠通', value: '百惠通' },
]

export const categoryOptions = [
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
  { label: 'PVC袋', value: 'PVC袋' },
  { label: '化妆包', value: '化妆包' },
  { label: '洗漱包', value: '洗漱包' },
  { label: '腰包', value: '腰包' },
  { label: '脏衣篮', value: '脏衣篮' },
  { label: '漂流袋', value: '漂流袋' },
  { label: '购物袋', value: '购物袋' },
  { label: '防水袋', value: '防水袋' },
  { label: '旅行包', value: '旅行包' },
  { label: '麻布袋', value: '麻布袋' },
  { label: '马克杯', value: '马克杯' },
  { label: '塑料杯', value: '塑料杯' },
  { label: '运动水杯', value: '运动水杯' },
  { label: '折叠水杯', value: '折叠水杯' },
  { label: '铁皮广告牌', value: '铁皮广告牌' },
  { label: 'U盘', value: 'U盘' },
]

export const supplierOptions = [
  { label: '江南供应链', value: '江南供应链' },
  { label: '东港贸易', value: '东港贸易' },
  { label: '羊城优品', value: '羊城优品' },
  { label: '金陵商贸', value: '金陵商贸' },
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

const mockThirdGoods: ThirdGoods[] = [
  {
    id: 't1',
    productCode: 'SP001',
    barcode: '9090909090909',
    productName: '馨香洗手液',
    brand: '优品汇',
    origin: '浙江义乌',
    category: '化妆包',
    spec: '默认规格:默认',
    unit: '瓶',
    weight: 300,
    supplier: '江南供应链',
    purchasePrice: 3.50,
    deliveryPrice: 4.20,
    memberPrice: 13.00,
    retailPrice: 15.80,
    marketPrice: 18.00,
    exchangePoints: 100,
    stockQuantity: 580,
    isFreeShipping: false,
    isOnShelf: false,
    isRecommended: false,
    isNew: true,
    isHotSale: false,
    isPointsParticipation: true,
    keywords: '洗手液,清洁,抑菌',
    originalLink: 'https://www.example.com/product/10001',
    description: '馨香洗手液，温和洁净，清香怡人',
    detailDescription: '<p>馨香洗手液采用温和配方，有效去除手部细菌，同时添加滋润成分，让双手保持水润光泽。</p>',
    createTime: '2026-03-01 09:00:00',
    updateTime: '2026-04-15 14:20:00',
  },
  {
    id: 't2',
    productCode: 'SP002',
    barcode: '9090909090916',
    productName: '迷彩折叠背包',
    brand: '匠心选',
    origin: '广东深圳',
    category: '背包',
    spec: '默认规格:默认',
    unit: '个',
    weight: 450,
    supplier: '东港贸易',
    purchasePrice: 18.80,
    deliveryPrice: 22.00,
    memberPrice: 45.00,
    retailPrice: 58.00,
    marketPrice: 68.00,
    exchangePoints: 500,
    stockQuantity: 120,
    isFreeShipping: true,
    isOnShelf: true,
    isRecommended: true,
    isNew: false,
    isHotSale: true,
    isPointsParticipation: true,
    keywords: '背包,迷彩,折叠,户外',
    originalLink: 'https://www.example.com/product/10002',
    description: '迷彩折叠背包，大容量设计，户外出行首选',
    detailDescription: '<p>迷彩折叠背包，采用高密度防水面料，大容量设计，可容纳15.6寸笔记本电脑。</p>',
    createTime: '2026-02-10 10:30:00',
    updateTime: '2026-04-20 16:00:00',
  },
  {
    id: 't3',
    productCode: 'SP003',
    barcode: '9090909090923',
    productName: '便携式保温水杯',
    brand: '绿源品',
    origin: '山东淄博',
    category: '运动水杯',
    spec: '默认规格:默认',
    unit: '个',
    weight: 280,
    supplier: '羊城优品',
    purchasePrice: 15.00,
    deliveryPrice: 17.50,
    memberPrice: 38.00,
    retailPrice: 48.00,
    marketPrice: 55.00,
    exchangePoints: 300,
    stockQuantity: 350,
    isFreeShipping: true,
    isOnShelf: true,
    isRecommended: false,
    isNew: true,
    isHotSale: false,
    isPointsParticipation: true,
    keywords: '保温杯,水杯,便携,保温',
    originalLink: 'https://www.example.com/product/10003',
    description: '便携式保温水杯，12小时保温，316不锈钢内胆',
    detailDescription: '<p>便携式保温水杯，采用316不锈钢内胆，真空双层设计，12小时保温效果。</p>',
    createTime: '2026-02-18 14:00:00',
    updateTime: '2026-04-22 10:15:00',
  },
  {
    id: 't4',
    productCode: 'SP004',
    barcode: '9090909090930',
    productName: '环保无纺布袋',
    brand: '百惠通',
    origin: '浙江杭州',
    category: '无纺布',
    spec: '默认规格:默认',
    unit: '个',
    weight: 50,
    supplier: '江南供应链',
    purchasePrice: 2.80,
    deliveryPrice: 3.30,
    memberPrice: 8.50,
    retailPrice: 10.00,
    marketPrice: 12.00,
    exchangePoints: 50,
    stockQuantity: 2000,
    isFreeShipping: false,
    isOnShelf: true,
    isRecommended: false,
    isNew: false,
    isHotSale: true,
    isPointsParticipation: false,
    keywords: '无纺布袋,环保,购物袋',
    originalLink: 'https://www.example.com/product/10004',
    description: '环保无纺布袋，可定制logo，经济实惠',
    detailDescription: '<p>环保无纺布袋，采用120g加厚无纺布，承重可达10kg，支持定制印刷。</p>',
    createTime: '2026-01-25 08:30:00',
    updateTime: '2026-04-10 11:45:00',
  },
  {
    id: 't5',
    productCode: 'SP005',
    barcode: '9090909090947',
    productName: '多功能化妆包',
    brand: '臻品坊',
    origin: '上海浦东',
    category: '化妆包',
    spec: '默认规格:默认',
    unit: '个',
    weight: 180,
    supplier: '金陵商贸',
    purchasePrice: 12.00,
    deliveryPrice: 14.50,
    memberPrice: 32.00,
    retailPrice: 42.00,
    marketPrice: 50.00,
    exchangePoints: 250,
    stockQuantity: 200,
    isFreeShipping: true,
    isOnShelf: true,
    isRecommended: true,
    isNew: true,
    isHotSale: false,
    isPointsParticipation: true,
    keywords: '化妆包,便携,多功能',
    originalLink: 'https://www.example.com/product/10005',
    description: '多功能化妆包，大容量分区设计，旅行必备',
    detailDescription: '<p>多功能化妆包，采用防水PU面料，多个隔层设计，可容纳化妆刷、护肤品等。</p>',
    createTime: '2026-03-05 11:20:00',
    updateTime: '2026-04-25 15:30:00',
  },
  {
    id: 't6',
    productCode: 'SP006',
    barcode: '9090909090954',
    productName: '折叠环保购物袋',
    brand: '优品汇',
    origin: '浙江义乌',
    category: '折叠袋',
    spec: '默认规格:默认',
    unit: '个',
    weight: 40,
    supplier: '江南供应链',
    purchasePrice: 5.50,
    deliveryPrice: 6.50,
    memberPrice: 15.00,
    retailPrice: 18.00,
    marketPrice: 22.00,
    exchangePoints: 120,
    stockQuantity: 800,
    isFreeShipping: false,
    isOnShelf: true,
    isRecommended: false,
    isNew: false,
    isHotSale: true,
    isPointsParticipation: false,
    keywords: '购物袋,折叠,环保',
    originalLink: 'https://www.example.com/product/10006',
    description: '折叠环保购物袋，折叠后小巧便携，承重强',
    detailDescription: '<p>折叠环保购物袋，采用加厚涤纶面料，折叠后仅手掌大小，展开容量达20L。</p>',
    createTime: '2026-02-22 13:00:00',
    updateTime: '2026-04-18 09:30:00',
  },
]

const goodsStore: ThirdGoods[] = JSON.parse(JSON.stringify(mockThirdGoods))
let nextId = goodsStore.length + 1

export function getThirdGoodsPage(params: {
  page: number
  pageSize: number
  brand?: string
  category?: string
  keyword?: string
  shelfStatus?: string
}): Promise<Result<{ list: ThirdGoods[]; total: number }>> {
  let filtered = [...goodsStore]
  if (params.brand) filtered = filtered.filter((g) => g.brand === params.brand)
  if (params.category) filtered = filtered.filter((g) => g.category === params.category)
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = filtered.filter(
      (g) => g.productName.toLowerCase().includes(kw) ||
        g.productCode.toLowerCase().includes(kw) ||
        g.barcode.toLowerCase().includes(kw) ||
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
  return mockResponse({ list: filtered.slice(start, start + params.pageSize), total })
}

export function getThirdGoodsById(id: string): Promise<Result<ThirdGoods | undefined>> {
  return mockResponse(goodsStore.find((g) => g.id === id))
}

export function addThirdGoods(data: Omit<ThirdGoods, 'id' | 'createTime' | 'updateTime'>): Promise<Result<ThirdGoods>> {
  const id = `t${nextId++}`
  const newGoods: ThirdGoods = { ...data, id, createTime: now(), updateTime: now() }
  goodsStore.push(newGoods)
  return mockResponse(newGoods)
}

export function updateThirdGoods(id: string, data: Partial<ThirdGoods>): Promise<Result<ThirdGoods>> {
  const index = goodsStore.findIndex((g) => g.id === id)
  if (index === -1) return mockResponse({} as ThirdGoods)
  goodsStore[index] = { ...goodsStore[index], ...data, id, updateTime: now() }
  return mockResponse(goodsStore[index])
}

export function deleteThirdGoods(id: string): Promise<Result<boolean>> {
  const index = goodsStore.findIndex((g) => g.id === id)
  if (index !== -1) goodsStore.splice(index, 1)
  return mockResponse(true)
}
