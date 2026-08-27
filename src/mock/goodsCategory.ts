// src/mock/goodsCategory.ts
// 商品分类管理 mock 数据层
import type { Result } from '@/http'
import { mockResponse } from '@/mock'

export interface GoodsCategory {
  id: string
  name: string
  mobileName: string
  isRecommended: boolean
  isVisible: boolean
  group: number
  sort: number
  parentId: string | null
  image: string
  commissionRate: number
  remark: string
  createTime: string
  updateTime: string
}

export interface GoodsCategoryForm {
  name: string
  mobileName: string
  isRecommended: boolean
  isVisible: boolean
  group: number
  sort: number
  parentId: string | null
  image: string
  commissionRate: number
  remark: string
}

export const groupOptions = [
  { label: '分组0', value: 0 },
  { label: '分组1', value: 1 },
  { label: '分组2', value: 2 },
  { label: '分组3', value: 3 },
]

const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ')

const mockGoodsCategory: GoodsCategory[] = [
  // 一级分类
  {
    id: '1001',
    name: '皮具箱包',
    mobileName: '皮具箱包',
    isRecommended: true,
    isVisible: true,
    group: 0,
    sort: 1,
    parentId: null,
    image: '',
    commissionRate: 5,
    remark: '主营真皮、PU、尼龙等材质箱包',
    createTime: '2026-01-10 09:00:00',
    updateTime: '2026-03-15 14:30:00',
  },
  {
    id: '1002',
    name: '水杯茶具',
    mobileName: '水杯茶具',
    isRecommended: true,
    isVisible: true,
    group: 0,
    sort: 2,
    parentId: null,
    image: '',
    commissionRate: 3,
    remark: '保温杯、玻璃杯、茶壶等',
    createTime: '2026-01-10 09:05:00',
    updateTime: '2026-03-18 11:20:00',
  },
  {
    id: '1003',
    name: '工艺礼品',
    mobileName: '工艺礼品',
    isRecommended: false,
    isVisible: true,
    group: 0,
    sort: 3,
    parentId: null,
    image: '',
    commissionRate: 8,
    remark: '定制礼品、纪念品、收藏品',
    createTime: '2026-01-12 10:00:00',
    updateTime: '2026-04-01 16:00:00',
  },
  {
    id: '1004',
    name: '家居清洁',
    mobileName: '家居清洁',
    isRecommended: false,
    isVisible: false,
    group: 0,
    sort: 4,
    parentId: null,
    image: '',
    commissionRate: 2,
    remark: '清洁用品、收纳整理',
    createTime: '2026-02-01 08:30:00',
    updateTime: '2026-04-10 09:45:00',
  },
  // 二级分类 - 皮具箱包下
  {
    id: '2001',
    name: '女式手提包',
    mobileName: '女式手提包',
    isRecommended: true,
    isVisible: true,
    group: 0,
    sort: 1,
    parentId: '1001',
    image: '',
    commissionRate: 6,
    remark: '时尚女包',
    createTime: '2026-01-15 10:30:00',
    updateTime: '2026-03-20 15:00:00',
  },
  {
    id: '2002',
    name: '男士公文包',
    mobileName: '男士公文包',
    isRecommended: false,
    isVisible: true,
    group: 0,
    sort: 2,
    parentId: '1001',
    image: '',
    commissionRate: 5,
    remark: '商务公文包',
    createTime: '2026-01-16 11:00:00',
    updateTime: '2026-03-22 10:30:00',
  },
  {
    id: '2003',
    name: '双肩背包',
    mobileName: '双肩背包',
    isRecommended: true,
    isVisible: true,
    group: 0,
    sort: 3,
    parentId: '1001',
    image: '',
    commissionRate: 4,
    remark: '休闲双肩包',
    createTime: '2026-01-18 09:20:00',
    updateTime: '2026-04-05 12:00:00',
  },
  {
    id: '2004',
    name: '钱包卡包',
    mobileName: '钱包卡包',
    isRecommended: false,
    isVisible: true,
    group: 0,
    sort: 4,
    parentId: '1001',
    image: '',
    commissionRate: 3,
    remark: '钱包、卡包、钥匙包',
    createTime: '2026-01-20 14:00:00',
    updateTime: '2026-04-08 08:40:00',
  },
  // 二级分类 - 水杯茶具下
  {
    id: '3001',
    name: '保温杯',
    mobileName: '保温杯',
    isRecommended: true,
    isVisible: true,
    group: 0,
    sort: 1,
    parentId: '1002',
    image: '',
    commissionRate: 4,
    remark: '真空保温杯',
    createTime: '2026-01-22 09:00:00',
    updateTime: '2026-03-25 14:00:00',
  },
  {
    id: '3002',
    name: '玻璃杯',
    mobileName: '玻璃杯',
    isRecommended: false,
    isVisible: true,
    group: 0,
    sort: 2,
    parentId: '1002',
    image: '',
    commissionRate: 2,
    remark: '高硼硅玻璃杯',
    createTime: '2026-01-25 10:15:00',
    updateTime: '2026-03-28 16:30:00',
  },
  {
    id: '3003',
    name: '旅行茶具',
    mobileName: '旅行茶具',
    isRecommended: false,
    isVisible: false,
    group: 0,
    sort: 3,
    parentId: '1002',
    image: '',
    commissionRate: 5,
    remark: '便携式茶具套装',
    createTime: '2026-02-05 11:00:00',
    updateTime: '2026-04-12 13:00:00',
  },
  // 二级分类 - 工艺礼品下
  {
    id: '4001',
    name: '定制U盘',
    mobileName: '定制U盘',
    isRecommended: true,
    isVisible: true,
    group: 0,
    sort: 1,
    parentId: '1003',
    image: '',
    commissionRate: 6,
    remark: '定制LOGOU盘',
    createTime: '2026-02-10 09:30:00',
    updateTime: '2026-04-15 10:00:00',
  },
  {
    id: '4002',
    name: '金属纪念币',
    mobileName: '金属纪念币',
    isRecommended: false,
    isVisible: true,
    group: 0,
    sort: 2,
    parentId: '1003',
    image: '',
    commissionRate: 10,
    remark: '定制纪念币、奖章',
    createTime: '2026-02-15 14:00:00',
    updateTime: '2026-04-18 11:20:00',
  },
]

const categoryStore: GoodsCategory[] = JSON.parse(JSON.stringify(mockGoodsCategory))
let nextId = categoryStore.length + 100

/** 获取分类树数据（扁平列表，带树形结构） */
export function getCategoryTree(): GoodsCategory[] {
  return mockResponse(categoryStore)
}

/** 分页获取分类列表 */
export function getCategoryPage(params: {
  page: number
  pageSize: number
  keyword?: string
  isRecommended?: boolean
  isVisible?: boolean
  parentId?: string | null
}): Promise<Result<{ list: GoodsCategory[]; total: number }>> {
  let filtered = [...categoryStore]

  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(kw) ||
        c.mobileName.toLowerCase().includes(kw) ||
        c.remark.toLowerCase().includes(kw)
    )
  }

  if (params.isRecommended !== undefined && params.isRecommended !== null) {
    filtered = filtered.filter((c) => c.isRecommended === params.isRecommended)
  }

  if (params.isVisible !== undefined && params.isVisible !== null) {
    filtered = filtered.filter((c) => c.isVisible === params.isVisible)
  }

  // parentId 过滤：null 只看顶级分类，有值看指定子分类，不筛选看全部
  if (params.parentId === null) {
    filtered = filtered.filter((c) => c.parentId === null)
  } else if (params.parentId) {
    filtered = filtered.filter((c) => c.parentId === params.parentId)
  }

  // 排序：先按 parentId，再按 sort
  filtered.sort((a, b) => {
    if (a.parentId !== b.parentId) {
      return (a.parentId || '').localeCompare(b.parentId || '')
    }
    return a.sort - b.sort
  })

  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: filtered.slice(start, start + params.pageSize), total })
}

/** 获取所有顶级分类（用于父级选择） */
export function getTopCategories(): Promise<Result<GoodsCategory[]>> {
  const topCategories = categoryStore.filter((c) => c.parentId === null)
  return mockResponse(topCategories)
}

/** 根据父级ID获取子分类 */
export function getSubCategories(parentId: string): Promise<Result<GoodsCategory[]>> {
  const subCategories = categoryStore.filter((c) => c.parentId === parentId)
  return mockResponse(subCategories)
}

/** 获取分类下拉选项（扁平结构，带缩进） */
export function getCategoryOptions(): Promise<Result<{ value: string; label: string; level: number }[]>> {
  const options: { value: string; label: string; level: number }[] = []
  
  // 先添加顶级分类
  const topCategories = categoryStore.filter((c) => c.parentId === null)
  topCategories.sort((a, b) => a.sort - b.sort)
  
  for (const top of topCategories) {
    options.push({ value: top.id, label: top.name, level: 0 })
    // 再添加子分类
    const subs = categoryStore
      .filter((c) => c.parentId === top.id)
      .sort((a, b) => a.sort - b.sort)
    for (const sub of subs) {
      options.push({ value: sub.id, label: sub.name, level: 1 })
    }
  }
  
  return mockResponse(options)
}

/** 获取分类选项（供其他模块选择使用） */
export function getCategorySelectOptions(): Promise<Result<{ value: string; label: string }[]>> {
  const options = categoryStore.map((c) => ({
    value: c.id,
    label: c.name,
  }))
  return mockResponse(options)
}

/** 添加分类 */
export function addCategory(data: GoodsCategoryForm): Promise<Result<GoodsCategory>> {
  const id = String(nextId++)
  const newCategory: GoodsCategory = {
    ...data,
    id,
    createTime: now(),
    updateTime: now(),
  }
  categoryStore.push(newCategory)
  return mockResponse(newCategory)
}

/** 更新分类 */
export function updateCategory(id: string, data: Partial<GoodsCategoryForm>): Promise<Result<GoodsCategory>> {
  const index = categoryStore.findIndex((c) => c.id === id)
  if (index === -1) return mockResponse({} as GoodsCategory)
  categoryStore[index] = { ...categoryStore[index], ...data, id, updateTime: now() }
  return mockResponse(categoryStore[index])
}

/** 删除分类（需先删除子分类） */
export function deleteCategory(id: string): Promise<Result<boolean>> {
  // 检查是否有子分类
  const hasChildren = categoryStore.some((c) => c.parentId === id)
  if (hasChildren) {
    return Promise.reject(new Error('该分类下存在子分类，无法删除'))
  }
  const index = categoryStore.findIndex((c) => c.id === id)
  if (index !== -1) categoryStore.splice(index, 1)
  return mockResponse(true)
}

/** 批量删除分类 */
export function batchDeleteCategory(ids: string[]): Promise<Result<{ success: number; failed: string[] }>> {
  const failed: string[] = []
  let success = 0
  
  for (const id of ids) {
    const hasChildren = categoryStore.some((c) => c.parentId === id)
    if (hasChildren) {
      failed.push(id)
      continue
    }
    const index = categoryStore.findIndex((c) => c.id === id)
    if (index !== -1) {
      categoryStore.splice(index, 1)
      success++
    } else {
      failed.push(id)
    }
  }
  
  return mockResponse({ success, failed })
}
