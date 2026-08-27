// src/mock/goodsSpec.ts
// 商品规格管理 mock 数据层
import type { Result } from '@/http'
import { mockResponse } from '@/mock'

export interface GoodsSpec {
  id: number
  specModelId: number
  specModelName: string
  specName: string
  specItems: string
  searchable: 'none' | 'keyword'
  sort: number
  createTime: string
  updateTime: string
}

export interface GoodsSpecForm {
  specModelId: number
  specName: string
  specItems: string
  searchable: 'none' | 'keyword'
  sort: number
}

const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ')

// mock 商品模型列表（与 goodsModel.ts 保持一致）
const modelOptions = [
  { id: 1, name: '箱包' },
  { id: 2, name: '笔记本' },
  { id: 3, name: '保温杯' },
  { id: 4, name: 'T恤衫' },
  { id: 5, name: '保温杯' },
]

const mockGoodsSpec: GoodsSpec[] = [
  {
    id: 1,
    specModelId: 1,
    specModelName: '箱包',
    specName: '尺寸',
    specItems: '24寸,30寸,10寸,20寸',
    searchable: 'keyword',
    sort: 0,
    createTime: '2026-01-15 10:30:00',
    updateTime: '2026-08-15 11:21:00',
  },
  {
    id: 2,
    specModelId: 1,
    specModelName: '箱包',
    specName: '颜色',
    specItems: '黑色,棕色,红色,蓝色',
    searchable: 'none',
    sort: 1,
    createTime: '2026-01-15 10:35:00',
    updateTime: '2026-08-16 09:00:00',
  },
  {
    id: 3,
    specModelId: 1,
    specModelName: '箱包',
    specName: '材质',
    specItems: '真皮,PU,帆布,尼龙',
    searchable: 'keyword',
    sort: 2,
    createTime: '2026-01-15 10:40:00',
    updateTime: '2026-08-17 14:30:00',
  },
  {
    id: 4,
    specModelId: 2,
    specModelName: '笔记本',
    specName: '屏幕尺寸',
    specItems: '13寸,14寸,15寸,16寸',
    searchable: 'keyword',
    sort: 0,
    createTime: '2026-02-20 14:00:00',
    updateTime: '2026-07-21 09:29:00',
  },
  {
    id: 5,
    specModelId: 2,
    specModelName: '笔记本',
    specName: '内存',
    specItems: '8GB,16GB,32GB,64GB',
    searchable: 'none',
    sort: 1,
    createTime: '2026-02-20 14:05:00',
    updateTime: '2026-07-22 10:15:00',
  },
  {
    id: 6,
    specModelId: 2,
    specModelName: '笔记本',
    specName: '硬盘',
    specItems: '256GB,512GB,1TB,2TB',
    searchable: 'keyword',
    sort: 2,
    createTime: '2026-02-20 14:10:00',
    updateTime: '2026-07-23 11:00:00',
  },
  {
    id: 7,
    specModelId: 3,
    specModelName: '保温杯',
    specName: '容量',
    specItems: '350ml,500ml,750ml,1000ml',
    searchable: 'keyword',
    sort: 0,
    createTime: '2026-03-05 09:15:00',
    updateTime: '2026-08-10 16:45:00',
  },
  {
    id: 8,
    specModelId: 3,
    specModelName: '保温杯',
    specName: '颜色',
    specItems: '银色,黑色,白色,粉色',
    searchable: 'none',
    sort: 1,
    createTime: '2026-03-05 09:20:00',
    updateTime: '2026-08-11 08:30:00',
  },
  {
    id: 9,
    specModelId: 4,
    specModelName: 'T恤衫',
    specName: '尺码',
    specItems: 'S,M,L,XL,XXL',
    searchable: 'keyword',
    sort: 0,
    createTime: '2026-04-12 11:30:00',
    updateTime: '2026-08-20 13:10:00',
  },
  {
    id: 10,
    specModelId: 4,
    specModelName: 'T恤衫',
    specName: '颜色',
    specItems: '白色,黑色,灰色,蓝色',
    searchable: 'keyword',
    sort: 1,
    createTime: '2026-04-12 11:35:00',
    updateTime: '2026-08-21 09:45:00',
  },
]

const specStore: GoodsSpec[] = JSON.parse(JSON.stringify(mockGoodsSpec))
let nextId = specStore.length + 1

/** 分页获取商品规格列表 */
export function getGoodsSpecPage(params: {
  page: number
  pageSize: number
  specModelId?: number | null
  keyword?: string
}): Promise<Result<{ list: GoodsSpec[]; total: number }>> {
  let filtered = [...specStore]

  if (params.specModelId) {
    filtered = filtered.filter((s) => s.specModelId === params.specModelId)
  }

  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = filtered.filter(
      (s) =>
        s.specName.toLowerCase().includes(kw) ||
        s.specItems.toLowerCase().includes(kw)
    )
  }

  filtered.sort((a, b) => a.sort - b.sort || a.id - b.id)

  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: filtered.slice(start, start + params.pageSize), total })
}

/** 获取商品模型选项（用于下拉选择） */
export function getSpecModelOptions(): Promise<Result<{ value: number; label: string }[]>> {
  const options = modelOptions.map((m) => ({ value: m.id, label: m.name }))
  return mockResponse(options)
}

/** 获取所有商品规格 */
export function getAllGoodsSpecs(): Promise<Result<GoodsSpec[]>> {
  return mockResponse(specStore)
}

/** 根据ID获取商品规格 */
export function getGoodsSpecById(id: number): Promise<Result<GoodsSpec | undefined>> {
  return mockResponse(specStore.find((s) => s.id === id))
}

/** 新增商品规格 */
export function addGoodsSpec(data: GoodsSpecForm): Promise<Result<GoodsSpec>> {
  const model = modelOptions.find((m) => m.id === data.specModelId)
  if (!model) return Promise.reject(new Error('所属商品模型不存在'))

  // 检查同一模型下规格名称是否重复
  const exists = specStore.some(
    (s) => s.specModelId === data.specModelId && s.specName === data.specName
  )
  if (exists) return Promise.reject(new Error('同一商品模型下规格名称不能重复'))

  const newSpec: GoodsSpec = {
    id: nextId++,
    specModelId: data.specModelId,
    specModelName: model.name,
    specName: data.specName,
    specItems: data.specItems,
    searchable: data.searchable,
    sort: data.sort,
    createTime: now(),
    updateTime: now(),
  }
  specStore.push(newSpec)
  return mockResponse(newSpec)
}

/** 更新商品规格 */
export function updateGoodsSpec(id: number, data: GoodsSpecForm): Promise<Result<GoodsSpec>> {
  const index = specStore.findIndex((s) => s.id === id)
  if (index === -1) return Promise.reject(new Error('规格不存在'))

  // 检查同一模型下规格名称是否重复（排除自身）
  const exists = specStore.some(
    (s) =>
      s.id !== id &&
      s.specModelId === data.specModelId &&
      s.specName === data.specName
  )
  if (exists) return Promise.reject(new Error('同一商品模型下规格名称不能重复'))

  const model = modelOptions.find((m) => m.id === data.specModelId)
  if (!model) return Promise.reject(new Error('所属商品模型不存在'))

  specStore[index] = {
    ...specStore[index],
    specModelId: data.specModelId,
    specModelName: model.name,
    specName: data.specName,
    specItems: data.specItems,
    searchable: data.searchable,
    sort: data.sort,
    updateTime: now(),
  }
  return mockResponse(specStore[index])
}

/** 删除商品规格 */
export function deleteGoodsSpec(id: number): Promise<Result<boolean>> {
  const index = specStore.findIndex((s) => s.id === id)
  if (index === -1) return Promise.reject(new Error('规格不存在'))
  specStore.splice(index, 1)
  return mockResponse(true)
}
