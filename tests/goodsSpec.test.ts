// tests/goodsSpec.test.ts
// 商品规格管理 mock 数据层测试
import { describe, it, expect } from 'vitest'
import {
  getGoodsSpecPage,
  getSpecModelOptions,
  getAllGoodsSpecs,
  getGoodsSpecById,
  addGoodsSpec,
  updateGoodsSpec,
  deleteGoodsSpec,
  type GoodsSpecForm,
} from '../src/mock/goodsSpec'

describe('商品规格 Mock 数据层', () => {
  describe('分页查询', () => {
    it('应该返回分页数据和总数', async () => {
      const res = await getGoodsSpecPage({
        page: 1,
        pageSize: 10,
      })
      expect(res.code).toBe(200)
      expect(res.data).toHaveProperty('list')
      expect(res.data).toHaveProperty('total')
      expect(Array.isArray(res.data.list)).toBe(true)
      expect(res.data.total).toBeGreaterThan(0)
    })

    it('应该根据商品模型ID筛选', async () => {
      const res = await getGoodsSpecPage({
        page: 1,
        pageSize: 10,
        specModelId: 1,
      })
      expect(res.code).toBe(200)
      res.data.list.forEach((item) => {
        expect(item.specModelId).toBe(1)
      })
    })

    it('不存在的商品模型ID应该返回空列表', async () => {
      const res = await getGoodsSpecPage({
        page: 1,
        pageSize: 10,
        specModelId: 9999,
      })
      expect(res.code).toBe(200)
      expect(res.data.list.length).toBe(0)
      expect(res.data.total).toBe(0)
    })

    it('应该按排序字段排序', async () => {
      const res = await getGoodsSpecPage({
        page: 1,
        pageSize: 100,
      })
      expect(res.code).toBe(200)
      // 验证排序正确
      for (let i = 1; i < res.data.list.length; i++) {
        const prev = res.data.list[i - 1]
        const curr = res.data.list[i]
        if (prev.sort === curr.sort) {
          expect(prev.id).toBeLessThanOrEqual(curr.id)
        } else {
          expect(prev.sort).toBeLessThanOrEqual(curr.sort)
        }
      }
    })
  })

  describe('商品模型选项', () => {
    it('应该返回所有模型选项', async () => {
      const res = await getSpecModelOptions()
      expect(res.code).toBe(200)
      expect(Array.isArray(res.data)).toBe(true)
      expect(res.data.length).toBeGreaterThan(0)
      res.data.forEach((opt) => {
        expect(opt).toHaveProperty('value')
        expect(opt).toHaveProperty('label')
      })
    })
  })

  describe('获取所有规格', () => {
    it('应该返回所有规格', async () => {
      const res = await getAllGoodsSpecs()
      expect(res.code).toBe(200)
      expect(Array.isArray(res.data)).toBe(true)
      expect(res.data.length).toBeGreaterThan(0)
    })
  })

  describe('根据ID获取', () => {
    it('应该根据ID正确返回规格', async () => {
      const res = await getGoodsSpecById(1)
      expect(res.code).toBe(200)
      expect(res.data).toBeDefined()
      expect(res.data?.id).toBe(1)
      expect(res.data?.specName).toBe('尺寸')
    })

    it('不存在的ID应该返回undefined', async () => {
      const res = await getGoodsSpecById(9999)
      expect(res.code).toBe(200)
      expect(res.data).toBeUndefined()
    })
  })

  describe('新增规格', () => {
    it('应该成功新增规格', async () => {
      const formData: GoodsSpecForm = {
        specModelId: 1,
        specName: '测试规格',
        specItems: '选项A,选项B,选项C',
        searchable: 'none',
        sort: 100,
      }
      const res = await addGoodsSpec(formData)
      expect(res.code).toBe(200)
      expect(res.data).toHaveProperty('id')
      expect(res.data.specName).toBe('测试规格')
      expect(res.data.specModelId).toBe(1)
      expect(res.data.specModelName).toBe('箱包')
      expect(res.data.searchable).toBe('none')
      expect(res.data.createTime).toBeTruthy()
    })

    it('同一模型下规格名称重复应该失败', async () => {
      const formData: GoodsSpecForm = {
        specModelId: 1,
        specName: '尺寸', // 已存在的规格名
        specItems: '选项X,选项Y',
        searchable: 'keyword',
        sort: 10,
      }
      try {
        await addGoodsSpec(formData)
        expect(false).toBe(true)
      } catch (err: any) {
        expect(err.message).toContain('规格名称不能重复')
      }
    })

    it('新增不存在的商品模型应该失败', async () => {
      const formData: GoodsSpecForm = {
        specModelId: 9999,
        specName: '测试规格',
        specItems: '选项A',
        searchable: 'none',
        sort: 0,
      }
      try {
        await addGoodsSpec(formData)
        expect(false).toBe(true)
      } catch (err: any) {
        expect(err.message).toContain('商品模型不存在')
      }
    })
  })

  describe('更新规格', () => {
    it('应该成功更新规格', async () => {
      // 先新增
      const addRes = await addGoodsSpec({
        specModelId: 2,
        specName: '待更新规格',
        specItems: '旧选项',
        searchable: 'none',
        sort: 50,
      })
      const id = addRes.data.id

      // 更新
      const updateRes = await updateGoodsSpec(id, {
        specModelId: 3,
        specName: '已更新规格名',
        specItems: '新选项A,新选项B',
        searchable: 'keyword',
        sort: 99,
      })
      expect(updateRes.code).toBe(200)
      expect(updateRes.data.specName).toBe('已更新规格名')
      expect(updateRes.data.specModelId).toBe(3)
      expect(updateRes.data.specModelName).toBe('保温杯')
      expect(updateRes.data.searchable).toBe('keyword')
      expect(updateRes.data.sort).toBe(99)
      expect(updateRes.data.specItems).toBe('新选项A,新选项B')
    })

    it('更新不存在的规格应该失败', async () => {
      try {
        await updateGoodsSpec(99999, {
          specModelId: 1,
          specName: '不存在',
          specItems: '',
          searchable: 'none',
          sort: 0,
        })
        expect(false).toBe(true)
      } catch (err: any) {
        expect(err.message).toBe('规格不存在')
      }
    })

    it('更新时规格名称重复应该失败', async () => {
      // 尝试更新ID=2的规格("颜色"在模型1中已存在)
      try {
        await updateGoodsSpec(3, {
          specModelId: 1,
          specName: '颜色', // 模型1下已存在
          specItems: '选项',
          searchable: 'none',
          sort: 0,
        })
        expect(false).toBe(true)
      } catch (err: any) {
        expect(err.message).toContain('规格名称不能重复')
      }
    })
  })

  describe('删除规格', () => {
    it('应该成功删除规格', async () => {
      // 先新增
      const addRes = await addGoodsSpec({
        specModelId: 4,
        specName: '待删除规格',
        specItems: '选项',
        searchable: 'none',
        sort: 0,
      })
      const id = addRes.data.id

      // 删除
      const delRes = await deleteGoodsSpec(id)
      expect(delRes.code).toBe(200)
      expect(delRes.data).toBe(true)

      // 验证已删除
      const afterDelete = await getGoodsSpecById(id)
      expect(afterDelete.data).toBeUndefined()
    })

    it('删除不存在的规格应该失败', async () => {
      try {
        await deleteGoodsSpec(99999)
        expect(false).toBe(true)
      } catch (err: any) {
        expect(err.message).toBe('规格不存在')
      }
    })
  })

  describe('数据完整性', () => {
    it('所有规格都应该有必要的字段', async () => {
      const res = await getAllGoodsSpecs()
      res.data.forEach((item) => {
        expect(item).toHaveProperty('id')
        expect(item).toHaveProperty('specModelId')
        expect(item).toHaveProperty('specModelName')
        expect(item).toHaveProperty('specName')
        expect(item).toHaveProperty('specItems')
        expect(item).toHaveProperty('searchable')
        expect(item).toHaveProperty('sort')
        expect(item.specName).toBeTruthy()
        expect(item.specModelName).toBeTruthy()
      })
    })

    it('searchable 字段值应该合法', async () => {
      const res = await getAllGoodsSpecs()
      res.data.forEach((item) => {
        expect(['none', 'keyword']).toContain(item.searchable)
      })
    })

    it('mock数据应该是脱敏的', async () => {
      const res = await getAllGoodsSpecs()
      const dataStr = JSON.stringify(res.data)
      const sensitiveWords = ['真实品牌', '真实供应商', '真实公司']
      sensitiveWords.forEach((word) => {
        expect(dataStr).not.toContain(word)
      })
    })
  })
})
