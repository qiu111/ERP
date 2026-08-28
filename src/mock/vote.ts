// src/mock/vote.ts
// 投票管理 Mock 数据层（全部脱敏虚构）
import type { Result } from '@/http'
import { mockResponse } from '@/mock'
import { CURRENT_USER } from './document'
export { CURRENT_USER }

// ======== 类型 ========

export type VoteStatus = 'open' | 'closed'
export const voteStatusOptions: { label: string; value: VoteStatus }[] = [
  { label: '投票中', value: 'open' },
  { label: '已结束', value: 'closed' },
]
export const voteStatusTagTypeMap: Record<VoteStatus, 'primary' | 'info'> = {
  open: 'primary',
  closed: 'info',
}

/** 投票选项 */
export interface VoteOption {
  label: string          // 选项文本（脱敏）
  count: number          // 票数
}

/** 投票明细 */
export interface VoteItem {
  id: string
  code: number
  subject: string            // 投票主题
  options: VoteOption[]      // 选项（≥2）
  initiator: string          // 发起人
  createTime: string         // 发起时间
  deadline: string           // 截止时间 YYYY-MM-DD HH:mm
  status: VoteStatus
  myVote?: string            // 当前用户已投选项
  voters: string[]           // 已投人员（脱敏）
}

/** 分页查询参数 */
export interface VotePageParams {
  page: number
  pageSize: number
  status?: VoteStatus | ''
  keyword?: string            // 主题/选项
}

// ======== 工具函数 ========

function pad0(n: number): string { return n < 10 ? `0${n}` : `${n}` }
function nowFull(): string {
  const n = new Date()
  return `${n.getFullYear()}-${pad0(n.getMonth() + 1)}-${pad0(n.getDate())} ${pad0(n.getHours())}:${pad0(n.getMinutes())}`
}

// ======== 初始化数据（脱敏） ========

const RAW_INIT: Omit<VoteItem, 'id'>[] = [
  {
    code: 6,
    subject: '示例团建活动方案投票（演示数据）',
    options: [
      { label: '示例方案一：户外拓展', count: 3 },
      { label: '示例方案二：室内轰趴', count: 1 },
      { label: '示例方案三：观影活动', count: 0 },
    ],
    initiator: '小戴',
    createTime: '2026-08-27 10:00',
    deadline: '2026-09-05 18:00',
    status: 'open',
    voters: ['小陈', '小白', '小安', '小北'],
  },
  {
    code: 5,
    subject: '虚拟例会时间调整投票（示例场景）',
    options: [
      { label: '示例：周一上午', count: 2 },
      { label: '示例：周四下午', count: 2 },
    ],
    initiator: '超级管理员',
    createTime: '2026-08-26 09:30',
    deadline: '2026-09-01 18:00',
    status: 'open',
    voters: ['小戴', '小陈', '小白', '小安'],
  },
  {
    code: 4,
    subject: '演示环境升级窗口投票（演示数据）',
    options: [
      { label: '示例：周五晚', count: 4 },
      { label: '示例：周日晚', count: 1 },
    ],
    initiator: '白主管',
    createTime: '2026-08-25 14:00',
    deadline: '2026-08-30 18:00',
    status: 'open',
    voters: ['超级管理员', '小戴', '小陈', '小北', '小白'],
  },
  {
    code: 3,
    subject: '示例办公软件选型投票（演示数据）',
    options: [
      { label: '示例：方案甲', count: 3 },
      { label: '示例：方案乙', count: 2 },
      { label: '示例：方案丙', count: 0 },
    ],
    initiator: '小北',
    createTime: '2026-08-20 11:00',
    deadline: '2026-08-26 18:00',
    status: 'closed',
    myVote: '示例：方案甲',
    voters: ['超级管理员', '小戴', '小白', '小安', '白主管'],
  },
  {
    code: 2,
    subject: '虚拟年度评优方式投票（示例场景）',
    options: [
      { label: '示例：部门推选', count: 2 },
      { label: '示例：全员投票', count: 3 },
    ],
    initiator: '超级管理员',
    createTime: '2026-08-15 16:00',
    deadline: '2026-08-22 18:00',
    status: 'closed',
    voters: ['小陈', '小安', '小戴', '小白', '小北'],
  },
  {
    code: 1,
    subject: '示例Logo候选方案投票（演示数据）',
    options: [
      { label: '示例：图案甲', count: 4 },
      { label: '示例：图案乙', count: 1 },
    ],
    initiator: '小安',
    createTime: '2026-08-10 09:00',
    deadline: '2026-08-18 18:00',
    status: 'closed',
    voters: ['超级管理员', '小戴', '小陈', '小北', '白主管'],
  },
]

let _codeSeq = Math.max(...RAW_INIT.map((r) => r.code)) + 1
const store: VoteItem[] = RAW_INIT.map((r, i) => ({ ...r, id: `VOTE_${Date.now()}_${i + 1}` }))

// ======== 对外接口 ========

/** 分页查询（编号降序） */
export async function getVotePage(params: VotePageParams): Promise<Result<{ list: VoteItem[]; total: number }>> {
  let rows = [...store]
  if (params.status) rows = rows.filter((r) => r.status === params.status)
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    rows = rows.filter(
      (r) =>
        r.subject.toLowerCase().includes(kw) ||
        r.options.some((o) => o.label.toLowerCase().includes(kw))
    )
  }
  rows.sort((a, b) => b.code - a.code)
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: rows.slice(start, start + params.pageSize), total })
}

/** 详情 */
export async function getVoteById(id: string): Promise<Result<VoteItem>> {
  const item = store.find((r) => r.id === id)
  return mockResponse(item || ({} as VoteItem))
}

/** 新增投票 */
export async function createVote(payload: { subject: string; options: string[]; deadline: string }): Promise<Result<VoteItem>> {
  const newItem: VoteItem = {
    id: `VOTE_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    code: _codeSeq++,
    subject: payload.subject,
    options: payload.options.map((label) => ({ label, count: 0 })),
    initiator: CURRENT_USER,
    createTime: nowFull(),
    deadline: payload.deadline,
    status: 'open',
    voters: [],
  }
  store.unshift(newItem)
  return mockResponse(newItem)
}

/** 投票（投票中且未投过才生效） */
export async function castVote(id: string, optionLabel: string): Promise<Result<VoteItem>> {
  const item = store.find((r) => r.id === id)
  if (!item) return mockResponse({} as VoteItem)
  if (item.status !== 'open') return mockResponse({} as VoteItem)
  if (item.voters.includes(CURRENT_USER)) return mockResponse({} as VoteItem)
  const opt = item.options.find((o) => o.label === optionLabel)
  if (!opt) return mockResponse({} as VoteItem)
  opt.count += 1
  item.myVote = optionLabel
  item.voters.push(CURRENT_USER)
  return mockResponse(item)
}

/** 结束投票 */
export async function closeVote(id: string): Promise<Result<VoteItem>> {
  const item = store.find((r) => r.id === id)
  if (!item || item.status !== 'open') return mockResponse({} as VoteItem)
  item.status = 'closed'
  return mockResponse(item)
}

/** 删除（仅发起人且无任何票数） */
export async function deleteVote(id: string): Promise<Result<boolean>> {
  const idx = store.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  if (store[idx].initiator !== CURRENT_USER) return mockResponse(false)
  if (store[idx].options.some((o) => o.count > 0)) return mockResponse(false)
  store.splice(idx, 1)
  return mockResponse(true)
}
