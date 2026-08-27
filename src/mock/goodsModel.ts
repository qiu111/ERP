// src/mock/goodsModel.ts
// 商品模型管理 mock 数据层
import type { Result } from '@/http'
import { mockResponse } from '@/mock'

export interface GoodsModel {
  id: number
  modelName: string
  operator: string
  updateTime: string
  createTime: string
}

export interface GoodsModelForm {
  modelName: string
}

const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ')

const mockGoodsModel: GoodsModel[] = [
  {
    id: 1,
    modelName: '箱包',
    operator: '超级管理员',
    createTime: '2026-01-15 10:30:00',
    updateTime: '2026-08-15 11:21:00',
  },
  {
    id: 2,
    modelName: '笔记本',
    operator: '超级管理员',
    createTime: '2026-02-20 14:00:00',
    updateTime: '2026-07-21 09:29:00',
  },
  {
    id: 3,
    modelName: '保温杯',
    operator: '管理员A',
    createTime: '2026-03-05 09:15:00',
    updateTime: '2026-08-10 16:45:00',
  },
  {
    id: 4,
    modelName: 'T恤衫',
    operator: '管理员B',
    createTime: '2026-04-12 11:30:00',
    updateTime: '2026-08-20 13:10:00',
  },
  {
    id: 5,
    modelName: '保温杯',
    operator: '超级管理员',
    createTime: '2026-05-18 15:45:00',
    updateTime: '2026-08-25 10:20:00',
  },
]

const modelStore: GoodsModel[] = JSON.parse(JSON.stringify(mockGoodsModel))
let nextId = modelStore.length + 1

/** 分页获取商品模型列表 */
export function getGoodsModelPage(params: {
  page: number
  pageSize: number
  keyword?: string
}): Promise<Result<{ list: GoodsModel[]; total: number }>> {
  let filtered = [...modelStore]

  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = filtered.filter((m) => m.modelName.toLowerCase().includes(kw))
  }

  filtered.sort((a, b) => b.updateTime.localeCompare(a.updateTime))

  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: filtered.slice(start, start + params.pageSize), total })
}

/** 获取所有商品模型 */
export function getAllGoodsModels(): Promise<Result<GoodsModel[]>> {
  return mockResponse(modelStore)
}

/** 根据ID获取商品模型 */
export function getGoodsModelById(id: number): Promise<Result<GoodsModel | undefined>> {
  return mockResponse(modelStore.find((m) => m.id === id))
}

/** 新增商品模型 */
export function addGoodsModel(data: GoodsModelForm): Promise<Result<GoodsModel>> {
  const newModel: GoodsModel = {
    id: nextId++,
    modelName: data.modelName,
    operator: '超级管理员',
    createTime: now(),
    updateTime: now(),
  }
  modelStore.push(newModel)
  return mockResponse(newModel)
}

/** 更新商品模型 */
export function updateGoodsModel(id: number, data: GoodsModelForm): Promise<Result<GoodsModel>> {
  const index = modelStore.findIndex((m) => m.id === id)
  if (index === -1) return Promise.reject(new Error('模型不存在'))
  modelStore[index] = {
    ...modelStore[index],
    modelName: data.modelName,
    updateTime: now(),
  }
  return mockResponse(modelStore[index])
}

/** 删除商品模型 */
export function deleteGoodsModel(id: number): Promise<Result<boolean>> {
  const index = modelStore.findIndex((m) => m.id === id)
  if (index === -1) return Promise.reject(new Error('模型不存在'))
  modelStore.splice(index, 1)
  return mockResponse(true)
}
