// src/mock/requiredTask.ts
// 必做任务 Mock 数据层（全部脱敏虚构）
import type { Result } from '@/http'
import { mockResponse } from '@/mock'

// ======== 枚举与类型 ========

/** 任务周期：每日 / 每周(一~日) */
export type TaskCycle = 'daily' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export const taskCycleOptions: { label: string; value: TaskCycle }[] = [
  { label: '每日', value: 'daily' },
  { label: '每周(一)', value: 'mon' },
  { label: '每周(二)', value: 'tue' },
  { label: '每周(三)', value: 'wed' },
  { label: '每周(四)', value: 'thu' },
  { label: '每周(五)', value: 'fri' },
  { label: '每周(六)', value: 'sat' },
  { label: '每周(日)', value: 'sun' },
]
export function getCycleLabel(v: TaskCycle | ''): string {
  return taskCycleOptions.find((o) => o.value === v)?.label || '-'
}

/** 虚构提交人选项池（脱敏纯中文，无字母占位） */
const SUBMITTERS = ['超级管理员', '小戴', '小陈', '小北', '小白']

/** 必做任务明细结构 */
export interface RequiredTaskItem {
  id: string
  code: number
  title: string                  // 任务标题
  content: string                // 任务内容（HTML，富文本）
  cycle: TaskCycle               // 任务周期
  taskStartTime: string          // 任务开始时间 HH:mm
  taskEndTime: string            // 任务结束时间 HH:mm
  needRemind: boolean            // 是否提醒
  remindHours?: number           // 提醒时间（提前小时数，needRemind=true 时有效）
  todayDone: boolean             // 完成情况：今日是否已执行
  submitter: string              // 提交人
  submitTime: string             // 提交时间 YYYY-MM-DD HH:mm
}

/** 分页查询参数 */
export interface RequiredTaskPageParams {
  page: number
  pageSize: number
  cycle?: TaskCycle | ''         // 任务周期
  timeStart?: string             // 任务时间筛选-开始 HH:mm
  timeEnd?: string               // 任务时间筛选-结束 HH:mm
  keyword?: string               // 搜索内容（标题/内容）
}

// ======== 工具函数 ========

function pad0(n: number): string { return n < 10 ? `0${n}` : `${n}` }
function nowFull(): string {
  const n = new Date()
  return `${n.getFullYear()}-${pad0(n.getMonth() + 1)}-${pad0(n.getDate())} ${pad0(n.getHours())}:${pad0(n.getMinutes())}`
}

// ======== 虚构内容 ========

const CONTENT_POOL = [
  `<p><strong>执行要点（演示内容）：</strong></p>
<ol>
  <li>按示例清单逐项核对并打卡；</li>
  <li>完成后在演示群同步结果。</li>
</ol>
<p><em>备注：以上为脱敏演示内容。</em></p>`,

  `<p>1. 汇总当日示例数据并填写演示报表；</p>
<p>2. 异常项当日反馈虚拟值班组跟进。</p>`,

  `<p>每周固定事项（示例场景）：</p>
<ul>
  <li>整理演示周会材料；</li>
  <li>核对虚拟台账差异项。</li>
</ul>`,
]

// ======== 初始化数据（脱敏） ========

const RAW_INIT: Omit<RequiredTaskItem, 'id'>[] = [
  {
    code: 1,
    title: '每日晨会纪要提交（演示数据）',
    content: CONTENT_POOL[1],
    cycle: 'daily',
    taskStartTime: '09:00',
    taskEndTime: '09:30',
    needRemind: true,
    remindHours: 24,
    todayDone: false,
    submitter: '超级管理员',
    submitTime: '2026-08-20 09:12',
  },
  {
    code: 2,
    title: '示例财务日报填报（演示场景）',
    content: CONTENT_POOL[1],
    cycle: 'daily',
    taskStartTime: '17:00',
    taskEndTime: '18:00',
    needRemind: true,
    remindHours: 1,
    todayDone: true,
    submitter: '小戴',
    submitTime: '2026-08-15 10:30',
  },
  {
    code: 3,
    title: '示例周例会材料准备（演示数据）',
    content: CONTENT_POOL[2],
    cycle: 'mon',
    taskStartTime: '09:30',
    taskEndTime: '11:30',
    needRemind: true,
    remindHours: 24,
    todayDone: false,
    submitter: '超级管理员',
    submitTime: '2026-08-10 14:20',
  },
  {
    code: 4,
    title: '虚拟仓库周盘点核对（示例任务）',
    content: CONTENT_POOL[2],
    cycle: 'sat',
    taskStartTime: '14:00',
    taskEndTime: '16:30',
    needRemind: true,
    remindHours: 2,
    todayDone: true,
    submitter: '小陈',
    submitTime: '2026-08-08 11:05',
  },
  {
    code: 5,
    title: '演示客户回访跟进（示例数据）',
    content: CONTENT_POOL[1],
    cycle: 'fri',
    taskStartTime: '14:00',
    taskEndTime: '16:00',
    needRemind: false,
    todayDone: false,
    submitter: '小北',
    submitTime: '2026-08-05 16:40',
  },
  {
    code: 6,
    title: '必须完成的示例安全巡检（演示数据）',
    content: CONTENT_POOL[0],
    cycle: 'daily',
    taskStartTime: '18:45',
    taskEndTime: '18:45',
    needRemind: true,
    remindHours: 24,
    todayDone: false,
    submitter: '超级管理员',
    submitTime: '2026-07-01 18:46',
  },
  {
    code: 7,
    title: '示例周报汇总提交（演示场景）',
    content: CONTENT_POOL[2],
    cycle: 'sun',
    taskStartTime: '20:00',
    taskEndTime: '21:00',
    needRemind: true,
    remindHours: 1,
    todayDone: true,
    submitter: '小白',
    submitTime: '2026-06-28 15:30',
  },
]

let _codeSeq = Math.max(...RAW_INIT.map((r) => r.code)) + 1
const store: RequiredTaskItem[] = RAW_INIT.map((r, i) => ({
  ...r,
  id: `RT_${Date.now()}_${i + 1}`,
}))

// ======== 对外接口 ========

/** 分页查询 */
export async function getRequiredTaskPage(params: RequiredTaskPageParams): Promise<Result<{ list: RequiredTaskItem[]; total: number }>> {
  let rows = [...store]
  if (params.cycle) rows = rows.filter((r) => r.cycle === params.cycle)
  // 任务时间筛选：与 [timeStart, timeEnd] 有交集
  if (params.timeStart && params.timeEnd) {
    rows = rows.filter((r) => r.taskStartTime <= params.timeEnd! && r.taskEndTime >= params.timeStart!)
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    rows = rows.filter((r) => r.title.toLowerCase().includes(kw) || r.content.toLowerCase().includes(kw))
  }

  rows.sort((a, b) => b.code - a.code)

  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({
    list: rows.slice(start, start + params.pageSize),
    total,
  })
}

/** 详情 */
export async function getRequiredTaskById(id: string): Promise<Result<RequiredTaskItem>> {
  const item = store.find((r) => r.id === id)
  return mockResponse(item || ({} as RequiredTaskItem))
}

/** 新增 */
export async function createRequiredTask(
  payload: Partial<RequiredTaskItem> & Pick<RequiredTaskItem, 'title' | 'cycle' | 'taskStartTime' | 'taskEndTime'>
): Promise<Result<RequiredTaskItem>> {
  const newItem: RequiredTaskItem = {
    id: `RT_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    code: _codeSeq++,
    title: payload.title,
    content: payload.content || '',
    cycle: payload.cycle,
    taskStartTime: payload.taskStartTime,
    taskEndTime: payload.taskEndTime,
    needRemind: payload.needRemind || false,
    remindHours: payload.needRemind ? payload.remindHours : undefined,
    todayDone: false,
    submitter: payload.submitter || SUBMITTERS[0],
    submitTime: payload.submitTime || nowFull(),
  }
  store.unshift(newItem)
  return mockResponse(newItem)
}

/** 修改 */
export async function updateRequiredTask(id: string, payload: Partial<RequiredTaskItem>): Promise<Result<RequiredTaskItem>> {
  const idx = store.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as RequiredTaskItem)
  store[idx] = { ...store[idx], ...payload }
  return mockResponse(store[idx])
}
