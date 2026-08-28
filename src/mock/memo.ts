// src/mock/memo.ts
// 备忘录管理 Mock 数据层（全部脱敏虚构）
import type { Result } from '@/http'
import { mockResponse } from '@/mock'

// ======== 类型 ========

/** 备忘录明细 */
export interface MemoItem {
  id: string
  code: number
  title: string          // 标题
  category: MemoCategory // 分类
  content: string        // 内容（HTML 富文本）
  remind: boolean        // 是否提醒
  remindTime?: string    // 提醒时间 YYYY-MM-DD HH:mm（remind=true 时必有）
  remark?: string        // 备注 ≤225 字
  creator: string        // 添加人
  operateTime: string    // 操作时间 YYYY-MM-DD HH:mm
}

/** 备忘录分类（脱敏通用中文分类） */
export type MemoCategory = '日常记事' | '工作提醒' | '重要事项'
export const memoCategoryOptions: { label: string; value: MemoCategory }[] = [
  { label: '日常记事', value: '日常记事' },
  { label: '工作提醒', value: '工作提醒' },
  { label: '重要事项', value: '重要事项' },
]

/** 分页查询参数 */
export interface MemoPageParams {
  page: number
  pageSize: number
  category?: MemoCategory | ''
  keyword?: string        // 关键字（标题/内容/备注）
}

// ======== 工具函数 ========

function pad0(n: number): string { return n < 10 ? `0${n}` : `${n}` }
function nowFull(): string {
  const n = new Date()
  return `${n.getFullYear()}-${pad0(n.getMonth() + 1)}-${pad0(n.getDate())} ${pad0(n.getHours())}:${pad0(n.getMinutes())}`
}

// ======== 初始化数据（脱敏） ========

const CONTENT_POOL = [
  '<p>示例备忘内容（演示数据）：整理虚拟演示环境的示例资料并归档。</p>',
  '<p>示例备忘内容（演示数据）：与虚拟协作方确认演示排期并同步内部。</p>',
  '<p>示例备忘内容（演示数据）：复盘本周演示任务完成情况并记录待办。</p>',
]

const RAW_INIT: Omit<MemoItem, 'id'>[] = [
  {
    code: 6,
    title: '示例系统演示前自查清单（演示数据）',
    category: '重要事项',
    content: CONTENT_POOL[0],
    remind: true,
    remindTime: '2026-08-30 09:00',
    remark: '演示前逐项确认',
    creator: '超级管理员',
    operateTime: '2026-08-28 10:07',
  },
  {
    code: 5,
    title: '虚拟部门周会纪要备忘（示例数据）',
    category: '日常记事',
    content: CONTENT_POOL[2],
    remind: false,
    remark: '',
    creator: '超级管理员',
    operateTime: '2026-08-26 19:01',
  },
  {
    code: 4,
    title: '演示环境账号整理备忘（演示场景）',
    category: '工作提醒',
    content: CONTENT_POOL[1],
    remind: true,
    remindTime: '2026-08-29 15:30',
    remark: '仅限演示用途',
    creator: '小戴',
    operateTime: '2026-08-24 16:40',
  },
  {
    code: 3,
    title: '示例培训材料归档提醒（演示数据）',
    category: '工作提醒',
    content: CONTENT_POOL[0],
    remind: true,
    remindTime: '2026-09-01 10:00',
    remark: '',
    creator: '小北',
    operateTime: '2026-08-20 11:22',
  },
  {
    code: 2,
    title: '虚拟机房巡检例行备忘（示例场景）',
    category: '日常记事',
    content: CONTENT_POOL[2],
    remind: false,
    remark: '',
    creator: '小白',
    operateTime: '2026-08-15 09:45',
  },
  {
    code: 1,
    title: '示例季度总结素材收集备忘（演示数据）',
    category: '重要事项',
    content: CONTENT_POOL[1],
    remind: false,
    remark: '收集各部门演示素材',
    creator: '超级管理员',
    operateTime: '2026-08-10 15:01',
  },
]

let _codeSeq = Math.max(...RAW_INIT.map((r) => r.code)) + 1
const store: MemoItem[] = RAW_INIT.map((r, i) => ({ ...r, id: `MEMO_${Date.now()}_${i + 1}` }))

// ======== 对外接口 ========

/** 分页查询（按编号降序） */
export async function getMemoPage(params: MemoPageParams): Promise<Result<{ list: MemoItem[]; total: number }>> {
  let rows = [...store]
  if (params.category) rows = rows.filter((r) => r.category === params.category)
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    rows = rows.filter((r) =>
      r.title.toLowerCase().includes(kw) ||
      r.content.toLowerCase().includes(kw) ||
      (r.remark || '').toLowerCase().includes(kw)
    )
  }
  rows.sort((a, b) => b.code - a.code)
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: rows.slice(start, start + params.pageSize), total })
}

/** 详情 */
export async function getMemoById(id: string): Promise<Result<MemoItem>> {
  const item = store.find((r) => r.id === id)
  return mockResponse(item || ({} as MemoItem))
}

/** 新增（remind=true 时必须提供 remindTime） */
export async function createMemo(payload: Partial<MemoItem> & Pick<MemoItem, 'title' | 'category'>): Promise<Result<MemoItem>> {
  const newItem: MemoItem = {
    id: `MEMO_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    code: _codeSeq++,
    title: payload.title,
    category: payload.category,
    content: payload.content || '',
    remind: !!payload.remind,
    remindTime: payload.remind ? (payload.remindTime || '') : undefined,
    remark: payload.remark,
    creator: payload.creator || '超级管理员',
    operateTime: payload.operateTime || nowFull(),
  }
  store.unshift(newItem)
  return mockResponse(newItem)
}

/** 修改 */
export async function updateMemo(id: string, payload: Partial<MemoItem>): Promise<Result<MemoItem>> {
  const idx = store.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as MemoItem)
  store[idx] = {
    ...store[idx],
    ...payload,
    remind: !!payload.remind,
    remindTime: payload.remind ? (payload.remindTime || '') : undefined,
    creator: payload.creator || '超级管理员',
    operateTime: payload.operateTime || nowFull(),
  }
  return mockResponse(store[idx])
}

/** 删除 */
export async function deleteMemo(id: string): Promise<Result<boolean>> {
  const idx = store.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  store.splice(idx, 1)
  return mockResponse(true)
}
