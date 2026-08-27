// src/mock/goodsAttribute.ts
// 商品属性管理 mock 数据层
import type { Result } from '@/http'
import { mockResponse } from '@/mock'

export type AttributeInputType = 'manual' | 'list' | 'textarea'
export type AttributeSearchable = 'none' | 'keyword'

export interface GoodsAttribute {
  id: number
  attributeName: string
  specModelId: number | null
  specModelName: string
  inputType: AttributeInputType
  optionalValues: string
  searchable: AttributeSearchable
  sort: number
  createTime: string
  updateTime: string
}

export interface GoodsAttributeForm {
  attributeName: string
  specModelId: number | null
  inputType: AttributeInputType
  optionalValues: string
  searchable: AttributeSearchable
  sort: number
}

const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ')

const modelOptions = [
  { id: 1, name: '箱包' },
  { id: 2, name: '笔记本' },
  { id: 3, name: '保温杯' },
  { id: 4, name: 'T恤衫' },
]

const inputTypeLabels: Record<AttributeInputType, string> = {
  manual: '手工录入',
  list: '从列表选择',
  textarea: '多行文本框',
}

const searchableLabels: Record<AttributeSearchable, string> = {
  none: '不需要检索',
  keyword: '关键字检索',
}

export { inputTypeLabels, searchableLabels }

const mockGoodsAttribute: GoodsAttribute[] = [
  {
    id: 1,
    attributeName: '品牌',
    specModelId: 1,
    specModelName: '箱包',
    inputType: 'list',
    optionalValues: '品牌A,品牌B,品牌C,品牌D',
    searchable: 'keyword',
    sort: 1,
    createTime: '2026-01-15 10:30:00',
    updateTime: '2026-08-15 11:21:00',
  },
  {
    id: 2,
    attributeName: '产地',
    specModelId: 1,
    specModelName: '箱包',
    inputType: 'manual',
    optionalValues: '',
    searchable: 'none',
    sort: 2,
    createTime: '2026-01-15 10:35:00',
    updateTime: '2026-08-16 09:00:00',
  },
  {
    id: 3,
    attributeName: '办公用品',
    specModelId: 2,
    specModelName: '笔记本',
    inputType: 'list',
    optionalValues: '钢笔,笔记本,文件夹,订书机',
    searchable: 'none',
    sort: 5,
    createTime: '2026-02-20 14:00:00',
    updateTime: '2026-07-21 09:29:00',
  },
  {
    id: 4,
    attributeName: '重量',
    specModelId: 2,
    specModelName: '笔记本',
    inputType: 'manual',
    optionalValues: '',
    searchable: 'keyword',
    sort: 3,
    createTime: '2026-02-20 14:05:00',
    updateTime: '2026-07-22 10:15:00',
  },
  {
    id: 5,
    attributeName: '适用人群',
    specModelId: 3,
    specModelName: '保温杯',
    inputType: 'list',
    optionalValues: '成人,儿童,老人',
    searchable: 'keyword',
    sort: 1,
    createTime: '2026-03-05 09:15:00',
    updateTime: '2026-08-10 16:45:00',
  },
  {
    id: 6,
    attributeName: '特色',
    specModelId: null,
    specModelName: '通用',
    inputType: 'textarea',
    optionalValues: '',
    searchable: 'none',
    sort: 10,
    createTime: '2026-03-10 11:00:00',
    updateTime: '2026-08-12 14:30:00',
  },
]

const attributeStore: GoodsAttribute[] = JSON.parse(JSON.stringify(mockGoodsAttribute))
let nextId = attributeStore.length + 1

/** 分页获取商品属性列表 */
export function getGoodsAttributePage(params: {
  page: number
  pageSize: number
  specModelId?: number | null
  keyword?: string
}): Promise<Result<{ list: GoodsAttribute[]; total: number }>> {
  let filtered = [...attributeStore]

  if (params.specModelId !== undefined && params.specModelId !== null && !isNaN(params.specModelId)) {
    filtered = filtered.filter((a) => a.specModelId === params.specModelId)
  }

  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = filtered.filter(
      (a) =>
        a.attributeName.toLowerCase().includes(kw) ||
        a.optionalValues.toLowerCase().includes(kw)
    )
  }

  filtered.sort((a, b) => a.sort - b.sort || a.id - b.id)

  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: filtered.slice(start, start + params.pageSize), total })
}

/** 获取商品模型选项 */
export function getAttributeModelOptions(): Promise<Result<{ value: number; label: string }[]>> {
  const options = [{ value: 0, label: '通用' }, ...modelOptions.map((m) => ({ value: m.id, label: m.name }))]
  return mockResponse(options)
}

/** 获取输入方式选项 */
export function getInputTypeOptions(): Promise<Result<{ value: string; label: string }[]>> {
  const options = [
    { value: 'manual', label: '手工录入' },
    { value: 'list', label: '从列表选择' },
    { value: 'textarea', label: '多行文本框' },
  ]
  return mockResponse(options)
}

/** 获取检索选项 */
export function getSearchableOptions(): Promise<Result<{ value: string; label: string }[]>> {
  const options = [
    { value: 'none', label: '不需要检索' },
    { value: 'keyword', label: '关键字检索' },
  ]
  return mockResponse(options)
}

/** 获取所有商品属性 */
export function getAllGoodsAttributes(): Promise<Result<GoodsAttribute[]>> {
  return mockResponse(attributeStore)
}

/** 根据ID获取商品属性 */
export function getGoodsAttributeById(id: number): Promise<Result<GoodsAttribute | undefined>> {
  return mockResponse(attributeStore.find((a) => a.id === id))
}

/** 新增商品属性 */
export function addGoodsAttribute(data: GoodsAttributeForm): Promise<Result<GoodsAttribute>> {
  // 检查同一模型下属性名称是否重复
  const exists = attributeStore.some(
    (a) => a.specModelId === data.specModelId && a.attributeName === data.attributeName
  )
  if (exists) return Promise.reject(new Error('同一商品模型下属性名称不能重复'))

  // 验证可选值
  if (data.inputType === 'list' && !data.optionalValues.trim()) {
    return Promise.reject(new Error('从列表选择时，可选值列表不能为空'))
  }

  const model = data.specModelId
    ? modelOptions.find((m) => m.id === data.specModelId)
    : null

  const newAttr: GoodsAttribute = {
    id: nextId++,
    attributeName: data.attributeName,
    specModelId: data.specModelId,
    specModelName: model ? model.name : '通用',
    inputType: data.inputType,
    optionalValues: data.optionalValues,
    searchable: data.searchable,
    sort: data.sort,
    createTime: now(),
    updateTime: now(),
  }
  attributeStore.push(newAttr)
  return mockResponse(newAttr)
}

/** 更新商品属性 */
export function updateGoodsAttribute(id: number, data: GoodsAttributeForm): Promise<Result<GoodsAttribute>> {
  const index = attributeStore.findIndex((a) => a.id === id)
  if (index === -1) return Promise.reject(new Error('属性不存在'))

  // 检查同一模型下属性名称是否重复
  const exists = attributeStore.some(
    (a) =>
      a.id !== id &&
      a.specModelId === data.specModelId &&
      a.attributeName === data.attributeName
  )
  if (exists) return Promise.reject(new Error('同一商品模型下属性名称不能重复'))

  // 验证可选值
  if (data.inputType === 'list' && !data.optionalValues.trim()) {
    return Promise.reject(new Error('从列表选择时，可选值列表不能为空'))
  }

  const model = data.specModelId
    ? modelOptions.find((m) => m.id === data.specModelId)
    : null

  attributeStore[index] = {
    ...attributeStore[index],
    attributeName: data.attributeName,
    specModelId: data.specModelId,
    specModelName: model ? model.name : '通用',
    inputType: data.inputType,
    optionalValues: data.optionalValues,
    searchable: data.searchable,
    sort: data.sort,
    updateTime: now(),
  }
  return mockResponse(attributeStore[index])
}

/** 删除商品属性 */
export function deleteGoodsAttribute(id: number): Promise<Result<boolean>> {
  const index = attributeStore.findIndex((a) => a.id === id)
  if (index === -1) return Promise.reject(new Error('属性不存在'))
  attributeStore.splice(index, 1)
  return mockResponse(true)
}
