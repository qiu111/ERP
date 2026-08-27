// src/mock/goodsAgent.ts
// 代理商商品管理 mock 数据层
import type { Result } from '@/http'
import { mockResponse } from '@/mock'

export interface AgentGoods {
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
  agent: string
  store: string
  agentPrice: number
  sort: number
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

export const agentOptions = [
  { label: '华东区代理商', value: '华东区代理商' },
  { label: '华南区代理商', value: '华南区代理商' },
  { label: '华北区代理商', value: '华北区代理商' },
  { label: '西南区代理商', value: '西南区代理商' },
  { label: '华中区代理商', value: '华中区代理商' },
]

export const storeOptions = [
  { label: '上海旗舰店', value: '上海旗舰店' },
  { label: '广州旗舰店', value: '广州旗舰店' },
  { label: '北京旗舰店', value: '北京旗舰店' },
  { label: '成都旗舰店', value: '成都旗舰店' },
  { label: '武汉旗舰店', value: '武汉旗舰店' },
  { label: '杭州旗舰店', value: '杭州旗舰店' },
  { label: '南京旗舰店', value: '南京旗舰店' },
  { label: '深圳旗舰店', value: '深圳旗舰店' },
]

const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ')

const mockAgentGoods: AgentGoods[] = [
  {
    id: 'a1',
    productCode: 'AG001',
    barcode: '6001001001001',
    productName: '馨香洗衣液',
    brand: '优品汇',
    origin: '浙江义乌',
    category: '化妆包',
    spec: '默认规格:默认',
    unit: '瓶',
    weight: 500,
    supplier: '江南供应链',
    purchasePrice: 8.50,
    deliveryPrice: 10.20,
    memberPrice: 23.00,
    retailPrice: 29.80,
    marketPrice: 35.00,
    exchangePoints: 200,
    stockQuantity: 860,
    isFreeShipping: false,
    isOnShelf: true,
    isRecommended: true,
    isNew: true,
    isHotSale: true,
    isPointsParticipation: true,
    keywords: '洗衣液,清洁,馨香',
    originalLink: 'https://www.example.com/agent/product/20001',
    description: '馨香洗衣液，深层清洁，持久留香',
    detailDescription: '<p>馨香洗衣液采用深层洁净配方，有效去除衣物顽固污渍，洗后留香持久。</p>',
    agent: '华东区代理商',
    store: '上海旗舰店',
    agentPrice: 12.00,
    sort: 1,
    createTime: '2026-03-01 09:30:00',
    updateTime: '2026-04-15 14:20:00',
  },
  {
    id: 'a2',
    productCode: 'AG002',
    barcode: '6001001001018',
    productName: '除菌洗洁精',
    brand: '匠心选',
    origin: '广东广州',
    category: '化妆包',
    spec: '默认规格:默认',
    unit: '瓶',
    weight: 400,
    supplier: '东港贸易',
    purchasePrice: 6.80,
    deliveryPrice: 8.20,
    memberPrice: 18.00,
    retailPrice: 22.00,
    marketPrice: 26.00,
    exchangePoints: 150,
    stockQuantity: 1200,
    isFreeShipping: false,
    isOnShelf: true,
    isRecommended: false,
    isNew: true,
    isHotSale: false,
    isPointsParticipation: true,
    keywords: '洗洁精,除菌,厨房',
    originalLink: 'https://www.example.com/agent/product/20002',
    description: '除菌洗洁精，温和不伤手，有效除菌',
    detailDescription: '<p>除菌洗洁精采用植物基配方，温和不伤手，有效清除厨房油污和细菌。</p>',
    agent: '华南区代理商',
    store: '广州旗舰店',
    agentPrice: 9.80,
    sort: 2,
    createTime: '2026-02-10 10:30:00',
    updateTime: '2026-04-20 16:00:00',
  },
  {
    id: 'a3',
    productCode: 'AG003',
    barcode: '6001001001025',
    productName: '超细纤维毛巾',
    brand: '绿源品',
    origin: '山东淄博',
    category: '棉布袋',
    spec: '默认规格:默认',
    unit: '条',
    weight: 120,
    supplier: '羊城优品',
    purchasePrice: 9.50,
    deliveryPrice: 11.50,
    memberPrice: 25.00,
    retailPrice: 32.00,
    marketPrice: 38.00,
    exchangePoints: 180,
    stockQuantity: 560,
    isFreeShipping: true,
    isOnShelf: true,
    isRecommended: true,
    isNew: false,
    isHotSale: true,
    isPointsParticipation: true,
    keywords: '毛巾,超细纤维,吸水',
    originalLink: 'https://www.example.com/agent/product/20003',
    description: '超细纤维毛巾，超强吸水，柔软舒适',
    detailDescription: '<p>超细纤维毛巾采用800D超细纤维织造，超强吸水，手感柔软，不掉毛不掉色。</p>',
    agent: '华北区代理商',
    store: '北京旗舰店',
    agentPrice: 13.50,
    sort: 3,
    createTime: '2026-02-18 14:00:00',
    updateTime: '2026-04-22 10:15:00',
  },
  {
    id: 'a4',
    productCode: 'AG004',
    barcode: '6001001001032',
    productName: '原木抽取纸巾',
    brand: '百惠通',
    origin: '浙江杭州',
    category: '无纺布',
    spec: '默认规格:默认',
    unit: '包',
    weight: 200,
    supplier: '江南供应链',
    purchasePrice: 4.20,
    deliveryPrice: 5.00,
    memberPrice: 12.00,
    retailPrice: 15.00,
    marketPrice: 18.00,
    exchangePoints: 80,
    stockQuantity: 3200,
    isFreeShipping: false,
    isOnShelf: true,
    isRecommended: false,
    isNew: false,
    isHotSale: true,
    isPointsParticipation: false,
    keywords: '纸巾,原木,抽取',
    originalLink: 'https://www.example.com/agent/product/20004',
    description: '原木抽取纸巾，三层加厚，柔韧不易破',
    detailDescription: '<p>原木抽取纸巾采用100%原生木浆，三层加厚设计，柔韧不易破，使用舒适。</p>',
    agent: '华中区代理商',
    store: '武汉旗舰店',
    agentPrice: 6.20,
    sort: 4,
    createTime: '2026-01-25 08:30:00',
    updateTime: '2026-04-10 11:45:00',
  },
  {
    id: 'a5',
    productCode: 'AG005',
    barcode: '6001001001049',
    productName: '铁观音茶叶礼盒',
    brand: '臻品坊',
    origin: '福建安溪',
    category: '化妆包',
    spec: '默认规格:默认',
    unit: '盒',
    weight: 500,
    supplier: '金陵商贸',
    purchasePrice: 58.00,
    deliveryPrice: 68.00,
    memberPrice: 158.00,
    retailPrice: 198.00,
    marketPrice: 238.00,
    exchangePoints: 800,
    stockQuantity: 180,
    isFreeShipping: true,
    isOnShelf: true,
    isRecommended: true,
    isNew: true,
    isHotSale: false,
    isPointsParticipation: true,
    keywords: '茶叶,礼盒,铁观音,送礼',
    originalLink: 'https://www.example.com/agent/product/20005',
    description: '铁观音茶叶礼盒，清香淡雅，送礼佳品',
    detailDescription: '<p>铁观音茶叶礼盒，精选福建安溪高山铁观音，传统工艺制作，清香淡雅，口感醇厚。</p>',
    agent: '华东区代理商',
    store: '杭州旗舰店',
    agentPrice: 88.00,
    sort: 5,
    createTime: '2026-03-05 11:20:00',
    updateTime: '2026-04-25 15:30:00',
  },
  {
    id: 'a6',
    productCode: 'AG006',
    barcode: '6001001001056',
    productName: '每日坚果礼盒',
    brand: '优品汇',
    origin: '云南昆明',
    category: '折叠袋',
    spec: '默认规格:默认',
    unit: '盒',
    weight: 750,
    supplier: '江南供应链',
    purchasePrice: 42.00,
    deliveryPrice: 50.00,
    memberPrice: 118.00,
    retailPrice: 148.00,
    marketPrice: 178.00,
    exchangePoints: 600,
    stockQuantity: 260,
    isFreeShipping: true,
    isOnShelf: false,
    isRecommended: false,
    isNew: false,
    isHotSale: true,
    isPointsParticipation: false,
    keywords: '坚果,礼盒,零食,每日',
    originalLink: 'https://www.example.com/agent/product/20006',
    description: '每日坚果礼盒，多种坚果搭配，营养美味',
    detailDescription: '<p>每日坚果礼盒，精选核桃、腰果、杏仁、蔓越莓干等多种坚果果干，独立小包装，营养美味。</p>',
    agent: '西南区代理商',
    store: '成都旗舰店',
    agentPrice: 62.00,
    sort: 6,
    createTime: '2026-02-22 13:00:00',
    updateTime: '2026-04-18 09:30:00',
  },
]

const goodsStore: AgentGoods[] = JSON.parse(JSON.stringify(mockAgentGoods))
let nextId = goodsStore.length + 1

export function getAgentGoodsPage(params: {
  page: number
  pageSize: number
  brand?: string
  category?: string
  keyword?: string
  shelfStatus?: string
  agent?: string
  store?: string
}): Promise<Result<{ list: AgentGoods[]; total: number }>> {
  let filtered = [...goodsStore]
  if (params.brand) filtered = filtered.filter((g) => g.brand === params.brand)
  if (params.category) filtered = filtered.filter((g) => g.category === params.category)
  if (params.agent) filtered = filtered.filter((g) => g.agent === params.agent)
  if (params.store) filtered = filtered.filter((g) => g.store === params.store)
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

export function getAgentGoodsById(id: string): Promise<Result<AgentGoods | undefined>> {
  return mockResponse(goodsStore.find((g) => g.id === id))
}

export function addAgentGoods(data: Omit<AgentGoods, 'id' | 'createTime' | 'updateTime'>): Promise<Result<AgentGoods>> {
  const id = `a${nextId++}`
  const newGoods: AgentGoods = { ...data, id, createTime: now(), updateTime: now() }
  goodsStore.push(newGoods)
  return mockResponse(newGoods)
}

export function updateAgentGoods(id: string, data: Partial<AgentGoods>): Promise<Result<AgentGoods>> {
  const index = goodsStore.findIndex((g) => g.id === id)
  if (index === -1) return mockResponse({} as AgentGoods)
  goodsStore[index] = { ...goodsStore[index], ...data, id, updateTime: now() }
  return mockResponse(goodsStore[index])
}

export function deleteAgentGoods(id: string): Promise<Result<boolean>> {
  const index = goodsStore.findIndex((g) => g.id === id)
  if (index !== -1) goodsStore.splice(index, 1)
  return mockResponse(true)
}
