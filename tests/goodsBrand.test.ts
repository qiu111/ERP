// tests/goodsBrand.test.ts
// 商品品牌管理 mock 数据层测试
import { describe, it, expect } from 'vitest'
import {
  getGoodsBrandPage,
  getBrandCategoryOptions,
  getBrandSubCategories,
  getAllGoodsBrands,
  getGoodsBrandById,
  addGoodsBrand,
  updateGoodsBrand,
  deleteGoodsBrand,
  type GoodsBrandForm,
} from '../src/mock/goodsBrand'

describe('商品品牌 Mock 数据层', () => {
  describe('分页查询', () => {
    it('应该返回分页数据和总数', async () => {
      const res = await getGoodsBrandPage({ page: 1, pageSize: 10 })
      expect(res.code).toBe(200)
      expect(res.data.list).toBeInstanceOf(Array)
      expect(res.data.total).toBeGreaterThan(0)
    })

    it('支持关键词搜索', async () => {
      const res = await getGoodsBrandPage({ page: 1, pageSize: 10, keyword: '苏菲' })
      expect(res.code).toBe(200)
      res.data.list.forEach((item) => {
        expect(item.brandName.includes('苏菲') || item.description.includes('苏菲')).toBe(true)
      })
    })

    it('空关键词应该返回全部', async () => {
      const res = await getGoodsBrandPage({ page: 1, pageSize: 10, keyword: '' })
      expect(res.data.total).toBeGreaterThan(0)
    })
  })

  describe('分类接口', () => {
    it('应该返回顶级分类', async () => {
      const res = await getBrandCategoryOptions()
      expect(res.code).toBe(200)
      expect(res.data.length).toBeGreaterThan(0)
    })

    it('应该根据父级返回子分类', async () => {
      const res = await getBrandSubCategories(2)
      expect(res.code).toBe(200)
      expect(res.data.length).toBeGreaterThan(0)
    })

    it('不存在的父级应该返回空', async () => {
      const res = await getBrandSubCategories(9999)
      expect(res.code).toBe(200)
      expect(res.data.length).toBe(0)
    })
  })

  describe('CRUD 操作', () => {
    it('新增品牌应该成功', async () => {
      const form: GoodsBrandForm = {
        brandName: '测试品牌',
        brandLogo: '',
        brandUrl: 'https://example.com',
        categoryId: 1,
        isRecommended: false,
        sort: 0,
        description: '测试描述',
      }
      const res = await addGoodsBrand(form)
      expect(res.code).toBe(200)
      expect(res.data.brandName).toBe('测试品牌')
      expect(res.data.categoryName).toBe('超市百货')
    })

    it('品牌名重复应该失败', async () => {
      try {
        await addGoodsBrand({
          brandName: '苏菲妮',
          brandLogo: '',
          brandUrl: '',
          categoryId: null,
          isRecommended: false,
          sort: 0,
          description: '',
        })
        expect(false).toBe(true)
      } catch (err: any) {
        expect(err.message).toContain('已存在')
      }
    })

    it('修改品牌应该成功', async () => {
      const addRes = await addGoodsBrand({
        brandName: '待修改品牌',
        brandLogo: '',
        brandUrl: '',
        categoryId: 3,
        isRecommended: false,
        sort: 0,
        description: '',
      })
      const id = addRes.data.id
      const updateRes = await updateGoodsBrand(id, {
        brandName: '已修改品牌',
        brandLogo: '',
        brandUrl: '',
        categoryId: 3,
        isRecommended: true,
        sort: 10,
        description: '修改后的描述',
      })
      expect(updateRes.data.brandName).toBe('已修改品牌')
      expect(updateRes.data.isRecommended).toBe(true)
    })

    it('修改不存在的品牌应该失败', async () => {
      try {
        await updateGoodsBrand(99999, {
          brandName: '不存在',
          brandLogo: '',
          brandUrl: '',
          categoryId: null,
          isRecommended: false,
          sort: 0,
          description: '',
        })
        expect(false).toBe(true)
      } catch (err: any) {
        expect(err.message).toBe('品牌不存在')
      }
    })

    it('删除品牌应该成功', async () => {
      const addRes = await addGoodsBrand({
        brandName: '待删除品牌',
        brandLogo: '',
        brandUrl: '',
        categoryId: null,
        isRecommended: false,
        sort: 0,
        description: '',
      })
      const id = addRes.data.id
      await deleteGoodsBrand(id)
      const res = await getGoodsBrandById(id)
      expect(res.data).toBeUndefined()
    })

    it('删除不存在的品牌应该失败', async () => {
      try {
        await deleteGoodsBrand(99999)
        expect(false).toBe(true)
      } catch (err: any) {
        expect(err.message).toBe('品牌不存在')
      }
    })
  })

  describe('数据完整性', () => {
    it('所有品牌都应有必要字段', async () => {
      const res = await getAllGoodsBrands()
      res.data.forEach((item) => {
        expect(item.id).toBeDefined()
        expect(item.brandName).toBeTruthy()
        expect(item.categoryName).toBeTruthy()
      })
    })

    it('mock 数据应该脱敏', async () => {
      const res = await getAllGoodsBrands()
      const str = JSON.stringify(res.data)
      expect(str).not.toContain('真实')
      expect(str).not.toContain('身份证')
    })
  })
})
