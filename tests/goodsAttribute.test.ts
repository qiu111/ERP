// tests/goodsAttribute.test.ts
// 商品属性管理 mock 数据层测试
import { describe, it, expect } from 'vitest'
import {
  getGoodsAttributePage,
  getAttributeModelOptions,
  getInputTypeOptions,
  getSearchableOptions,
  getAllGoodsAttributes,
  getGoodsAttributeById,
  addGoodsAttribute,
  updateGoodsAttribute,
  deleteGoodsAttribute,
  type GoodsAttributeForm,
} from '../src/mock/goodsAttribute'

describe('商品属性 Mock 数据层', () => {
  describe('分页查询', () => {
    it('应该返回分页数据和总数', async () => {
      const res = await getGoodsAttributePage({ page: 1, pageSize: 10 })
      expect(res.code).toBe(200)
      expect(res.data.list).toBeInstanceOf(Array)
      expect(res.data.total).toBeGreaterThan(0)
    })

    it('应该按商品模型筛选', async () => {
      const res = await getGoodsAttributePage({ page: 1, pageSize: 10, specModelId: 1 })
      expect(res.code).toBe(200)
      res.data.list.forEach((item) => expect(item.specModelId).toBe(1))
    })

    it('支持关键词搜索', async () => {
      const res = await getGoodsAttributePage({ page: 1, pageSize: 10, keyword: '品牌' })
      expect(res.code).toBe(200)
      res.data.list.forEach((item) => {
        expect(item.attributeName.includes('品牌') || item.optionalValues.includes('品牌')).toBe(true)
      })
    })
  })

  describe('选项接口', () => {
    it('应该返回商品模型选项', async () => {
      const res = await getAttributeModelOptions()
      expect(res.code).toBe(200)
      expect(res.data.length).toBeGreaterThan(0)
      expect(res.data[0]).toHaveProperty('value')
      expect(res.data[0]).toHaveProperty('label')
    })

    it('应该返回输入方式选项', async () => {
      const res = await getInputTypeOptions()
      expect(res.code).toBe(200)
      expect(res.data.length).toBe(3)
    })

    it('应该返回检索选项', async () => {
      const res = await getSearchableOptions()
      expect(res.code).toBe(200)
      expect(res.data.length).toBe(2)
    })
  })

  describe('CRUD 操作', () => {
    it('新增属性应该成功', async () => {
      const form: GoodsAttributeForm = {
        attributeName: '测试属性',
        specModelId: 1,
        inputType: 'list',
        optionalValues: '值A,值B,值C',
        searchable: 'none',
        sort: 100,
      }
      const res = await addGoodsAttribute(form)
      expect(res.code).toBe(200)
      expect(res.data.attributeName).toBe('测试属性')
      expect(res.data.inputType).toBe('list')
    })

    it('同一模型下属性名重复应该失败', async () => {
      const form: GoodsAttributeForm = {
        attributeName: '品牌',
        specModelId: 1,
        inputType: 'manual',
        optionalValues: '',
        searchable: 'none',
        sort: 0,
      }
      try {
        await addGoodsAttribute(form)
        expect(false).toBe(true)
      } catch (err: any) {
        expect(err.message).toContain('不能重复')
      }
    })

    it('list 类型可选值为空应该失败', async () => {
      const form: GoodsAttributeForm = {
        attributeName: '新属性',
        specModelId: 2,
        inputType: 'list',
        optionalValues: '',
        searchable: 'none',
        sort: 0,
      }
      try {
        await addGoodsAttribute(form)
        expect(false).toBe(true)
      } catch (err: any) {
        expect(err.message).toContain('可选值')
      }
    })

    it('修改属性应该成功', async () => {
      const addRes = await addGoodsAttribute({
        attributeName: '待修改属性',
        specModelId: 3,
        inputType: 'manual',
        optionalValues: '',
        searchable: 'none',
        sort: 50,
      })
      const id = addRes.data.id
      const updateRes = await updateGoodsAttribute(id, {
        attributeName: '已修改属性',
        specModelId: 4,
        inputType: 'textarea',
        optionalValues: '',
        searchable: 'keyword',
        sort: 99,
      })
      expect(updateRes.data.attributeName).toBe('已修改属性')
      expect(updateRes.data.searchable).toBe('keyword')
    })

    it('删除属性应该成功', async () => {
      const addRes = await addGoodsAttribute({
        attributeName: '待删除属性',
        specModelId: 1,
        inputType: 'manual',
        optionalValues: '',
        searchable: 'none',
        sort: 0,
      })
      const id = addRes.data.id
      await deleteGoodsAttribute(id)
      const res = await getGoodsAttributeById(id)
      expect(res.data).toBeUndefined()
    })

    it('删除不存在的属性应该失败', async () => {
      try {
        await deleteGoodsAttribute(99999)
        expect(false).toBe(true)
      } catch (err: any) {
        expect(err.message).toBe('属性不存在')
      }
    })
  })

  describe('数据完整性', () => {
    it('所有属性都应有必要字段', async () => {
      const res = await getAllGoodsAttributes()
      res.data.forEach((item) => {
        expect(item.id).toBeDefined()
        expect(item.attributeName).toBeTruthy()
        expect(['manual', 'list', 'textarea']).toContain(item.inputType)
        expect(['none', 'keyword']).toContain(item.searchable)
      })
    })

    it('mock 数据应该脱敏', async () => {
      const res = await getAllGoodsAttributes()
      const str = JSON.stringify(res.data)
      expect(str).not.toContain('真实')
      expect(str).not.toContain('身份证')
    })
  })
})
