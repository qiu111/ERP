// src/mock/goodsBrand.ts
// 商品品牌管理 mock 数据层
import type { Result } from '@/http'
import { mockResponse } from '@/mock'

export interface GoodsBrand {
  id: number
  brandName: string
  brandLogo: string
  brandUrl: string
  categoryId: number | null
  categoryName: string
  isRecommended: boolean
  sort: number
  description: string
  createTime: string
  updateTime: string
}

export interface GoodsBrandForm {
  brandName: string
  brandLogo: string
  brandUrl: string
  categoryId: number | null
  isRecommended: boolean
  sort: number
  description: string
}

const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ')

const categoryOptions = [
  { id: 1, name: '超市百货', parentId: 0 },
  { id: 2, name: '家用电器', parentId: 0 },
  { id: 3, name: '服装鞋帽', parentId: 0 },
  { id: 4, name: '美妆日化', parentId: 0 },
  { id: 5, name: '数码通讯', parentId: 0 },
  { id: 11, name: '大家电', parentId: 2 },
  { id: 12, name: '生活电器', parentId: 2 },
  { id: 31, name: '男装', parentId: 3 },
  { id: 32, name: '女装', parentId: 3 },
  { id: 33, name: '内衣', parentId: 3 },
  { id: 34, name: '户外运动', parentId: 3 },
  { id: 35, name: '男装_女装_内衣_男装', parentId: 3 },
  { id: 41, name: '个人化妆', parentId: 4 },
  { id: 51, name: '手机、数码、通信', parentId: 5 },
]

const mockGoodsBrand: GoodsBrand[] = [
  {
    id: 1,
    brandName: '苏菲妮',
    brandLogo: '',
    brandUrl: '',
    categoryId: 1,
    categoryName: '超市百货',
    isRecommended: true,
    sort: 0,
    description: '专注品质生活的品牌',
    createTime: '2026-01-15 10:30:00',
    updateTime: '2026-08-15 11:21:00',
  },
  {
    id: 2,
    brandName: '华硕',
    brandLogo: '',
    brandUrl: '',
    categoryId: 1,
    categoryName: '超市百货',
    isRecommended: true,
    sort: 0,
    description: '知名电子产品品牌',
    createTime: '2026-01-20 14:00:00',
    updateTime: '2026-08-16 09:00:00',
  },
  {
    id: 3,
    brandName: '耐克',
    brandLogo: '',
    brandUrl: '',
    categoryId: 1,
    categoryName: '超市百货',
    isRecommended: true,
    sort: 0,
    description: '全球知名运动品牌',
    createTime: '2026-02-01 09:15:00',
    updateTime: '2026-08-17 14:30:00',
  },
  {
    id: 4,
    brandName: '美的',
    brandLogo: '',
    brandUrl: '',
    categoryId: 11,
    categoryName: '家用电器_大家电',
    isRecommended: false,
    sort: 0,
    description: '国内领先的家电品牌',
    createTime: '2026-02-10 11:30:00',
    updateTime: '2026-08-18 10:15:00',
  },
  {
    id: 5,
    brandName: '三星',
    brandLogo: '',
    brandUrl: '',
    categoryId: 51,
    categoryName: '手机、数码、通信',
    isRecommended: false,
    sort: 0,
    description: '韩国知名电子产品品牌',
    createTime: '2026-02-15 15:45:00',
    updateTime: '2026-08-19 09:00:00',
  },
  {
    id: 6,
    brandName: '鸿星尔克',
    brandLogo: '',
    brandUrl: '',
    categoryId: 34,
    categoryName: '男装、女装、内衣_户外运动',
    isRecommended: false,
    sort: 0,
    description: '国产运动品牌',
    createTime: '2026-02-20 10:00:00',
    updateTime: '2026-08-20 16:45:00',
  },
  {
    id: 7,
    brandName: 'LG',
    brandLogo: '',
    brandUrl: '',
    categoryId: 51,
    categoryName: '手机、数码、通信',
    isRecommended: false,
    sort: 0,
    description: '韩国电子品牌',
    createTime: '2026-03-01 08:30:00',
    updateTime: '2026-08-21 13:10:00',
  },
  {
    id: 8,
    brandName: '海飞丝',
    brandLogo: '',
    brandUrl: '',
    categoryId: 41,
    categoryName: '个人化妆',
    isRecommended: false,
    sort: 0,
    description: '知名洗护品牌',
    createTime: '2026-03-05 12:00:00',
    updateTime: '2026-08-22 09:45:00',
  },
  {
    id: 9,
    brandName: '阿迪达斯',
    brandLogo: '',
    brandUrl: '',
    categoryId: 35,
    categoryName: '男装、女装、内衣_男装',
    isRecommended: true,
    sort: 0,
    description: '全球知名运动品牌',
    createTime: '2026-03-10 14:30:00',
    updateTime: '2026-08-23 10:20:00',
  },
  {
    id: 10,
    brandName: 'Justyle',
    brandLogo: '',
    brandUrl: '',
    categoryId: 35,
    categoryName: '男装、女装、内衣_男装',
    isRecommended: true,
    sort: 0,
    description: '时尚服饰品牌',
    createTime: '2026-03-15 16:00:00',
    updateTime: '2026-08-24 11:30:00',
  },
]

const brandStore: GoodsBrand[] = JSON.parse(JSON.stringify(mockGoodsBrand))
let nextId = brandStore.length + 1

/** 分页获取商品品牌列表 */
export function getGoodsBrandPage(params: {
  page: number
  pageSize: number
  categoryId?: number | null
  keyword?: string
}): Promise<Result<{ list: GoodsBrand[]; total: number }>> {
  let filtered = [...brandStore]

  if (params.categoryId !== undefined && params.categoryId !== null && !isNaN(params.categoryId)) {
    filtered = filtered.filter((b) => b.categoryId === params.categoryId)
  }

  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = filtered.filter(
      (b) =>
        b.brandName.toLowerCase().includes(kw) ||
        b.description.toLowerCase().includes(kw)
    )
  }

  filtered.sort((a, b) => a.sort - b.sort || a.id - b.id)

  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: filtered.slice(start, start + params.pageSize), total })
}

/** 获取品牌分类选项（顶级） */
export function getBrandCategoryOptions(): Promise<Result<{ value: number; label: string }[]>> {
  const options = categoryOptions
    .filter((c) => c.parentId === 0)
    .map((c) => ({ value: c.id, label: c.name }))
  return mockResponse(options)
}

/** 根据父级获取子分类 */
export function getBrandSubCategories(parentId: number): Promise<Result<{ value: number; label: string }[]>> {
  const options = categoryOptions
    .filter((c) => c.parentId === parentId)
    .map((c) => ({ value: c.id, label: c.name }))
  return mockResponse(options)
}

/** 获取所有商品品牌 */
export function getAllGoodsBrands(): Promise<Result<GoodsBrand[]>> {
  return mockResponse(brandStore)
}

/** 根据ID获取商品品牌 */
export function getGoodsBrandById(id: number): Promise<Result<GoodsBrand | undefined>> {
  return mockResponse(brandStore.find((b) => b.id === id))
}

/** 新增商品品牌 */
export function addGoodsBrand(data: GoodsBrandForm): Promise<Result<GoodsBrand>> {
  const exists = brandStore.some((b) => b.brandName === data.brandName)
  if (exists) return Promise.reject(new Error('品牌名称已存在'))

  const category = data.categoryId
    ? categoryOptions.find((c) => c.id === data.categoryId)
    : null

  const newBrand: GoodsBrand = {
    id: nextId++,
    brandName: data.brandName,
    brandLogo: data.brandLogo,
    brandUrl: data.brandUrl,
    categoryId: data.categoryId,
    categoryName: category ? category.name : '未分类',
    isRecommended: data.isRecommended,
    sort: data.sort,
    description: data.description,
    createTime: now(),
    updateTime: now(),
  }
  brandStore.push(newBrand)
  return mockResponse(newBrand)
}

/** 更新商品品牌 */
export function updateGoodsBrand(id: number, data: GoodsBrandForm): Promise<Result<GoodsBrand>> {
  const index = brandStore.findIndex((b) => b.id === id)
  if (index === -1) return Promise.reject(new Error('品牌不存在'))

  const exists = brandStore.some((b) => b.id !== id && b.brandName === data.brandName)
  if (exists) return Promise.reject(new Error('品牌名称已存在'))

  const category = data.categoryId
    ? categoryOptions.find((c) => c.id === data.categoryId)
    : null

  brandStore[index] = {
    ...brandStore[index],
    brandName: data.brandName,
    brandLogo: data.brandLogo,
    brandUrl: data.brandUrl,
    categoryId: data.categoryId,
    categoryName: category ? category.name : '未分类',
    isRecommended: data.isRecommended,
    sort: data.sort,
    description: data.description,
    updateTime: now(),
  }
  return mockResponse(brandStore[index])
}

/** 删除商品品牌 */
export function deleteGoodsBrand(id: number): Promise<Result<boolean>> {
  const index = brandStore.findIndex((b) => b.id === id)
  if (index === -1) return Promise.reject(new Error('品牌不存在'))
  brandStore.splice(index, 1)
  return mockResponse(true)
}
