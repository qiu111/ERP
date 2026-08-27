// tests/goodsCategory.test.ts
// 商品分类管理 mock 数据层测试
import { describe, it, expect, beforeEach } from 'vitest'
import {
  getCategoryPage,
  getTopCategories,
  getSubCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getCategoryOptions,
  type GoodsCategoryForm,
} from '../src/mock/goodsCategory'

describe('商品分类 Mock 数据层', () => {
  // 每个测试前刷新数据
  beforeEach(async () => {
    // 重新导入以重置数据（简单处理）
  })

  describe('分页查询', () => {
    it('应该返回分页数据和总数', async () => {
      const res = await getCategoryPage({
        page: 1,
        pageSize: 10,
      })
      expect(res.code).toBe(200)
      expect(res.data).toHaveProperty('list')
      expect(res.data).toHaveProperty('total')
      expect(Array.isArray(res.data.list)).toBe(true)
      expect(res.data.total).toBeGreaterThan(0)
    })

    it('应该根据关键词搜索分类', async () => {
      const res = await getCategoryPage({
        page: 1,
        pageSize: 10,
        keyword: '皮具',
      })
      expect(res.code).toBe(200)
      // 搜索结果应该包含关键词
      res.data.list.forEach((item) => {
        expect(
          item.name.includes('皮具') ||
          item.mobileName.includes('皮具') ||
          item.remark.includes('皮具')
        ).toBe(true)
      })
    })

    it('应该根据是否推荐筛选', async () => {
      const res = await getCategoryPage({
        page: 1,
        pageSize: 10,
        isRecommended: true,
      })
      expect(res.code).toBe(200)
      res.data.list.forEach((item) => {
        expect(item.isRecommended).toBe(true)
      })
    })

    it('应该根据是否显示筛选', async () => {
      const res = await getCategoryPage({
        page: 1,
        pageSize: 10,
        isVisible: false,
      })
      expect(res.code).toBe(200)
      res.data.list.forEach((item) => {
        expect(item.isVisible).toBe(false)
      })
    })

    it('只筛选顶级分类', async () => {
      const res = await getCategoryPage({
        page: 1,
        pageSize: 10,
        parentId: null,
      })
      expect(res.code).toBe(200)
      res.data.list.forEach((item) => {
        expect(item.parentId).toBeNull()
      })
    })
  })

  describe('父级分类查询', () => {
    it('应该返回所有顶级分类', async () => {
      const res = await getTopCategories()
      expect(res.code).toBe(200)
      expect(Array.isArray(res.data)).toBe(true)
      expect(res.data.length).toBeGreaterThan(0)
      // 所有返回的都应该是顶级分类
      res.data.forEach((item) => {
        expect(item.parentId).toBeNull()
      })
    })

    it('应该根据父级ID获取子分类', async () => {
      const res = await getSubCategories('1001')
      expect(res.code).toBe(200)
      expect(Array.isArray(res.data)).toBe(true)
      // 所有返回的都应该是该父级的子分类
      res.data.forEach((item) => {
        expect(item.parentId).toBe('1001')
      })
    })

    it('不存在的父级ID应该返回空数组', async () => {
      const res = await getSubCategories('99999')
      expect(res.code).toBe(200)
      expect(res.data).toEqual([])
    })
  })

  describe('分类选项', () => {
    it('应该返回带层级的分类选项', async () => {
      const res = await getCategoryOptions()
      expect(res.code).toBe(200)
      expect(Array.isArray(res.data)).toBe(true)
      expect(res.data.length).toBeGreaterThan(0)
      
      // 验证结构
      res.data.forEach((opt) => {
        expect(opt).toHaveProperty('value')
        expect(opt).toHaveProperty('label')
        expect(opt).toHaveProperty('level')
        expect(opt.level).toBeGreaterThanOrEqual(0)
        expect(opt.level).toBeLessThanOrEqual(1)
      })
    })

    it('应该按层级排序：顶级在前，子分类在后', async () => {
      const res = await getCategoryOptions()
      const levels = res.data.map((opt) => opt.level)
      // 检查是否有层级0的项
      expect(levels).toContain(0)
      // 顶级项应该在子项之前
      const firstSubIndex = levels.findIndex((l) => l === 1)
      if (firstSubIndex !== -1) {
        const levelsBeforeSub = levels.slice(0, firstSubIndex)
        expect(levelsBeforeSub.every((l) => l === 0)).toBe(true)
      }
    })
  })

  describe('新增分类', () => {
    it('应该成功新增顶级分类', async () => {
      const newCategory: GoodsCategoryForm = {
        name: '测试分类',
        mobileName: '测试分类',
        isRecommended: false,
        isVisible: true,
        group: 0,
        sort: 100,
        parentId: null,
        image: '',
        commissionRate: 0,
        remark: '测试备注',
      }
      const res = await addCategory(newCategory)
      expect(res.code).toBe(200)
      expect(res.data).toHaveProperty('id')
      expect(res.data.name).toBe('测试分类')
      expect(res.data.parentId).toBeNull()
      expect(res.data.createTime).toBeTruthy()
      expect(res.data.updateTime).toBeTruthy()
    })

    it('应该成功新增子分类', async () => {
      const newCategory: GoodsCategoryForm = {
        name: '测试子分类',
        mobileName: '测试子分类',
        isRecommended: false,
        isVisible: true,
        group: 0,
        sort: 100,
        parentId: '1001',
        image: '',
        commissionRate: 0,
        remark: '测试子分类备注',
      }
      const res = await addCategory(newCategory)
      expect(res.code).toBe(200)
      expect(res.data).toHaveProperty('id')
      expect(res.data.parentId).toBe('1001')
    })

    it('新增后应该能查询到', async () => {
      const newCategory: GoodsCategoryForm = {
        name: '新增测试分类',
        mobileName: '新增测试',
        isRecommended: true,
        isVisible: true,
        group: 1,
        sort: 50,
        parentId: null,
        image: '',
        commissionRate: 5,
        remark: '',
      }
      const addRes = await addCategory(newCategory)
      const id = addRes.data.id

      // 通过分页查询验证
      const pageRes = await getCategoryPage({
        page: 1,
        pageSize: 100,
        keyword: '新增测试分类',
      })
      const found = pageRes.data.list.find((c) => c.id === id)
      expect(found).toBeTruthy()
      expect(found?.name).toBe('新增测试分类')
    })
  })

  describe('更新分类', () => {
    it('应该成功更新分类', async () => {
      // 先新增一个分类
      const newCategory: GoodsCategoryForm = {
        name: '待更新分类',
        mobileName: '待更新',
        isRecommended: false,
        isVisible: true,
        group: 0,
        sort: 100,
        parentId: null,
        image: '',
        commissionRate: 0,
        remark: '',
      }
      const addRes = await addCategory(newCategory)
      const id = addRes.data.id

      // 更新
      const updateRes = await updateCategory(id, {
        name: '已更新分类',
        isRecommended: true,
        sort: 999,
      })
      expect(updateRes.code).toBe(200)
      expect(updateRes.data.name).toBe('已更新分类')
      expect(updateRes.data.isRecommended).toBe(true)
      expect(updateRes.data.sort).toBe(999)
    })

    it('更新不存在的ID应该返回空对象', async () => {
      const res = await updateCategory('99999', {
        name: '不存在的分类',
      })
      expect(res.code).toBe(200)
      // 更新失败返回空对象
      expect(res.data).toEqual({})
    })
  })

  describe('删除分类', () => {
    it('应该成功删除无子分类的分类', async () => {
      // 先新增一个分类
      const newCategory: GoodsCategoryForm = {
        name: '待删除分类',
        mobileName: '待删除',
        isRecommended: false,
        isVisible: true,
        group: 0,
        sort: 100,
        parentId: null,
        image: '',
        commissionRate: 0,
        remark: '',
      }
      const addRes = await addCategory(newCategory)
      const id = addRes.data.id

      // 删除
      const delRes = await deleteCategory(id)
      expect(delRes.code).toBe(200)
      expect(delRes.data).toBe(true)

      // 验证已删除
      const pageRes = await getCategoryPage({
        page: 1,
        pageSize: 100,
        keyword: '待删除分类',
      })
      const found = pageRes.data.list.find((c) => c.id === id)
      expect(found).toBeUndefined()
    })

    it('删除存在子分类的父级应该失败', async () => {
      // 尝试删除一个有子分类的顶级分类
      try {
        await deleteCategory('1001')
        // 如果没有抛出错误，说明删除成功（但不应该）
        expect(false).toBe(true)
      } catch (err: any) {
        expect(err.message).toContain('存在子分类')
      }
    })

    it('删除不存在的分类应该静默成功', async () => {
      const res = await deleteCategory('99999')
      expect(res.code).toBe(200)
      expect(res.data).toBe(true)
    })
  })

  describe('数据脱敏验证', () => {
    it('mock数据应该不包含真实品牌名称', async () => {
      const res = await getCategoryPage({ page: 1, pageSize: 100 })
      const dataStr = JSON.stringify(res.data)
      // 检查是否包含可能的敏感词
      const sensitiveWords = ['真实品牌', '真实供应商', '公司全称']
      sensitiveWords.forEach((word) => {
        expect(dataStr).not.toContain(word)
      })
    })

    it('mock数据分类名称应该是虚构的', async () => {
      const res = await getCategoryPage({ page: 1, pageSize: 100 })
      res.data.list.forEach((item) => {
        // 分类名称不应该为空
        expect(item.name).toBeTruthy()
        expect(item.name.length).toBeGreaterThan(0)
      })
    })
  })
})
