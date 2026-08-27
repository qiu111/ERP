// tests/goodsModel.test.ts
// 商品模型管理 mock 数据层测试
import { describe, it, expect } from 'vitest'
import {
  getGoodsModelPage,
  getAllGoodsModels,
  getGoodsModelById,
  addGoodsModel,
  updateGoodsModel,
  deleteGoodsModel,
  type GoodsModelForm,
} from '../src/mock/goodsModel'

describe('商品模型 Mock 数据层', () => {
  describe('分页查询', () => {
    it('应该返回分页数据和总数', async () => {
      const res = await getGoodsModelPage({
        page: 1,
        pageSize: 10,
      })
      expect(res.code).toBe(200)
      expect(res.data).toHaveProperty('list')
      expect(res.data).toHaveProperty('total')
      expect(Array.isArray(res.data.list)).toBe(true)
      expect(res.data.total).toBeGreaterThan(0)
    })

    it('应该根据关键词搜索', async () => {
      const res = await getGoodsModelPage({
        page: 1,
        pageSize: 10,
        keyword: '箱包',
      })
      expect(res.code).toBe(200)
      res.data.list.forEach((item) => {
        expect(item.modelName.includes('箱包')).toBe(true)
      })
    })

    it('空关键词应该返回所有数据', async () => {
      const res = await getGoodsModelPage({
        page: 1,
        pageSize: 10,
        keyword: '',
      })
      expect(res.code).toBe(200)
      expect(res.data.total).toBeGreaterThan(0)
    })

    it('不存在的关键词应该返回空列表', async () => {
      const res = await getGoodsModelPage({
        page: 1,
        pageSize: 10,
        keyword: '不存在的模型名称',
      })
      expect(res.code).toBe(200)
      expect(res.data.list.length).toBe(0)
      expect(res.data.total).toBe(0)
    })

    it('分页应该正确工作', async () => {
      const page1 = await getGoodsModelPage({ page: 1, pageSize: 2 })
      const page2 = await getGoodsModelPage({ page: 2, pageSize: 2 })
      expect(page1.data.list.length).toBeLessThanOrEqual(2)
      expect(page2.data.list.length).toBeLessThanOrEqual(2)
      // 确保总数据量大于2才能测试分页
      if (page1.data.total > 2) {
        expect(page1.data.list[0].id).not.toBe(page2.data.list[0].id)
      }
    })
  })

  describe('获取所有模型', () => {
    it('应该返回所有模型', async () => {
      const res = await getAllGoodsModels()
      expect(res.code).toBe(200)
      expect(Array.isArray(res.data)).toBe(true)
      expect(res.data.length).toBeGreaterThan(0)
    })
  })

  describe('根据ID获取', () => {
    it('应该根据ID正确返回模型', async () => {
      const res = await getGoodsModelById(1)
      expect(res.code).toBe(200)
      expect(res.data).toBeDefined()
      expect(res.data?.id).toBe(1)
      expect(res.data?.modelName).toBe('箱包')
    })

    it('不存在的ID应该返回undefined', async () => {
      const res = await getGoodsModelById(9999)
      expect(res.code).toBe(200)
      expect(res.data).toBeUndefined()
    })
  })

  describe('新增模型', () => {
    it('应该成功新增模型', async () => {
      const formData: GoodsModelForm = {
        modelName: '测试模型',
      }
      const res = await addGoodsModel(formData)
      expect(res.code).toBe(200)
      expect(res.data).toHaveProperty('id')
      expect(res.data.modelName).toBe('测试模型')
      expect(res.data.operator).toBe('超级管理员')
      expect(res.data.createTime).toBeTruthy()
      expect(res.data.updateTime).toBeTruthy()
    })

    it('新增后应该能通过分页查询到', async () => {
      const formData: GoodsModelForm = {
        modelName: '新增测试模型_唯一标识',
      }
      const addRes = await addGoodsModel(formData)
      const id = addRes.data.id

      const pageRes = await getGoodsModelPage({
        page: 1,
        pageSize: 100,
        keyword: '新增测试模型_唯一标识',
      })
      const found = pageRes.data.list.find((m) => m.id === id)
      expect(found).toBeTruthy()
      expect(found?.modelName).toBe('新增测试模型_唯一标识')
    })
  })

  describe('更新模型', () => {
    it('应该成功更新模型', async () => {
      // 先新增一个模型
      const addRes = await addGoodsModel({ modelName: '待更新模型' })
      const id = addRes.data.id

      // 稍等一下确保时间戳不同
      await new Promise(resolve => setTimeout(resolve, 100))

      // 更新
      const updateRes = await updateGoodsModel(id, {
        modelName: '已更新模型名称',
      })
      expect(updateRes.code).toBe(200)
      expect(updateRes.data.modelName).toBe('已更新模型名称')
      // 更新时间应该被设置
      expect(updateRes.data.updateTime).toBeTruthy()
    })

    it('更新不存在的ID应该抛出错误', async () => {
      try {
        await updateGoodsModel(99999, { modelName: '不存在' })
        expect(false).toBe(true)
      } catch (err: any) {
        expect(err.message).toBe('模型不存在')
      }
    })
  })

  describe('删除模型', () => {
    it('应该成功删除模型', async () => {
      // 先新增一个模型
      const addRes = await addGoodsModel({ modelName: '待删除模型' })
      const id = addRes.data.id

      // 验证存在
      const beforeDelete = await getGoodsModelById(id)
      expect(beforeDelete.data).toBeDefined()

      // 删除
      const delRes = await deleteGoodsModel(id)
      expect(delRes.code).toBe(200)
      expect(delRes.data).toBe(true)

      // 验证已删除
      const afterDelete = await getGoodsModelById(id)
      expect(afterDelete.data).toBeUndefined()
    })

    it('删除不存在的ID应该抛出错误', async () => {
      try {
        await deleteGoodsModel(99999)
        expect(false).toBe(true)
      } catch (err: any) {
        expect(err.message).toBe('模型不存在')
      }
    })
  })

  describe('数据完整性', () => {
    it('所有模型都应该有必要的字段', async () => {
      const res = await getAllGoodsModels()
      res.data.forEach((item) => {
        expect(item).toHaveProperty('id')
        expect(item).toHaveProperty('modelName')
        expect(item).toHaveProperty('operator')
        expect(item).toHaveProperty('createTime')
        expect(item).toHaveProperty('updateTime')
        expect(item.modelName).toBeTruthy()
        expect(item.operator).toBeTruthy()
      })
    })

    it('mock数据应该是脱敏的', async () => {
      const res = await getAllGoodsModels()
      const dataStr = JSON.stringify(res.data)
      // 检查是否包含可能的敏感信息
      const sensitiveWords = ['真实品牌', '真实供应商', '真实公司', '身份证', '手机号']
      sensitiveWords.forEach((word) => {
        expect(dataStr).not.toContain(word)
      })
    })
  })
})
