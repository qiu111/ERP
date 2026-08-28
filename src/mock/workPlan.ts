// src/mock/workPlan.ts
// 我的工作计划 Mock 数据层（全部脱敏虚构）
import type { Result } from '@/http'
import { mockResponse } from '@/mock'

// ======== 枚举与类型 ========

/** 完成程度（Screenshot1：还未开始 / 进行中 / 已经审核 / 已完成 / 已取消） */
export type WorkProgressStatus = 'not_started' | 'in_progress' | 'audited' | 'completed' | 'cancelled'

/** 时间类型（搜索栏第 3 项 select） */
export type WorkTimeType = 'planned_start' | 'planned_end' | 'actual_start' | 'actual_end'

export const progressStatusOptions: { label: string; value: WorkProgressStatus }[] = [
  { label: '还未开始', value: 'not_started' },
  { label: '进行中', value: 'in_progress' },
  { label: '已经审核', value: 'audited' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
]
export function getProgressStatusLabel(v: WorkProgressStatus | ''): string {
  return progressStatusOptions.find((o) => o.value === v)?.label || '-'
}
export const progressStatusTagTypeMap: Record<WorkProgressStatus, 'danger' | 'warning' | 'primary' | 'success' | 'info'> = {
  not_started: 'danger',
  in_progress: 'warning',
  audited: 'primary',
  completed: 'success',
  cancelled: 'info',
}

/** 时间类型 select 选项（用于搜索栏「时间类型」） */
export const timeTypeOptions: { label: string; value: WorkTimeType }[] = [
  { label: '预计开始时间', value: 'planned_start' },
  { label: '预计结束时间', value: 'planned_end' },
  { label: '实际开始时间', value: 'actual_start' },
  { label: '实际结束时间', value: 'actual_end' },
]

/** 虚构审核人选项池（脱敏纯中文，无字母占位） */
const AUDITORS = ['超级管理员', '小戴', '小白', '白主管', '小陈', '小安', '业务员', '小北']
export const auditorOptions: { label: string; value: string }[] = AUDITORS.map((n) => ({ label: n, value: n }))
/** 执行人选项池（与审核人复用同一脱敏人员池；语义差异：执行 vs 审核） */
export const executorOptions: { label: string; value: string }[] = AUDITORS.map((n) => ({ label: n, value: n }))

const SUBMITTERS = AUDITORS // 提交人与审核人池复用（脱敏）

/** 部门工作计划：*/
const DEPARTMENTS = ['综合部', '研发部', '采购部', '销售部', '财务部', '仓储部']
export const departmentOptions: { label: string; value: string }[] = DEPARTMENTS.map((n) => ({ label: n, value: n }))

/** 工作计划明细结构 */
export interface WorkPlanItem {
  id: string
  code: number
  title: string                   // 工作标题/计划标题
  auditor: string                 // 审核人（'-'表示未选；我的工作计划必选）
  executor?: string               // 执行人（'-'或空表示未指派；我安排的工作必选）
  progressStatus: WorkProgressStatus
  plannedStartTime: string        // 预计开始时间 YYYY-MM-DD HH:mm:ss
  plannedEndTime: string          // 预计结束时间
  actualStartTime?: string        // 实际开始时间（开始操作时写入）
  actualEndTime?: string          // 实际结束时间（完成/审核时写入）
  content: string                 // 计划内容（HTML，富文本）
  remark?: string                 // 备注 ≤225 字
  submitter: string               // 发起人（我的工作计划：默认超级管理员；我安排的工作：超级管理员=安排人）
  submitTime: string              // 提交时间
  department?: string              // 部门（部门工作计划视图使用；2-3 字纯中文脱敏）
}

/** 分页查询参数 */
export interface WorkPlanPageParams {
  page: number
  pageSize: number
  auditor?: string                // 搜索栏：审核人（我的工作计划）
  executor?: string               // 搜索栏：执行人（我安排的工作）
  progressStatus?: WorkProgressStatus | ''
  timeType?: WorkTimeType | ''    // 搜索栏：时间类型 + 日期
  date?: string                   // 日期 YYYY-MM-DD，与 timeType 联用
  keyword?: string                // 计划主题及内容
  submitter?: string              // 我的工作计划：强制传发起人过滤；我安排的工作：传"超级管理员"=安排人
  department?: string             // 部门工作计划：按部门过滤
}

// ======== 工具函数 ========

function pad0(n: number): string { return n < 10 ? `0${n}` : `${n}` }
function nowFull(): string {
  const n = new Date()
  return `${n.getFullYear()}-${pad0(n.getMonth() + 1)}-${pad0(n.getDate())} ${pad0(n.getHours())}:${pad0(n.getMinutes())}:${pad0(n.getSeconds())}`
}
// 返回形如 "2026-08-27 17:41:23" 的日期时间字符串
function fmtDateTime(base: string, offsetMin = 0): string {
  // base: YYYY-MM-DD
  const ms = new Date(base.replace(/-/g, '/')).getTime() + offsetMin * 60 * 1000
  const d = new Date(ms)
  return `${d.getFullYear()}-${pad0(d.getMonth() + 1)}-${pad0(d.getDate())} ${pad0(d.getHours())}:${pad0(d.getMinutes())}:${pad0(d.getSeconds())}`
}
// 提取 YYYY-MM-DD
const dateOf = (s: string | undefined): string => (!s ? '' : s.slice(0, 10))

// ======== 虚构内容/标题 ========

const TITLE_POOL = [
  '税务备案单证快速生成页面及功能（演示场景）',
  '付款申请流水列表导出Excel表格（示例功能）',
  '示例研发中心：用户端改版迭代计划',
  '演示供应商合同评审跟进周计划（演示数据）',
  '示例商贸月度回款目标分解',
  'ERP进销存盘点差异排查',
  'gongzuojihua（示例虚拟名称）项目复盘',
  '财务月底结转操作演练',
]

const CONTENT_POOL = [
  `<p><strong>目标与范围（演示内容）：</strong></p>
<ol>
  <li>完成示例模块功能开发、联调、自测；</li>
  <li>每周五 17:00 前同步进度至演示项目看板。</li>
</ol>
<p><em>备注：以上为脱敏演示内容。</em></p>`,

  `<p><strong>本周关键事项：</strong></p>
<p>1. 梳理演示客户合同 5 份，反馈法务预审；</p>
<p>2. 配合示例采购部完成 Q3 供应商评估；</p>
<p>3. 提交月度费用归集说明。</p>`,

  `<p>阶段里程碑：</p>
<ul>
  <li>阶段一：需求梳理 / 原型评审（预计 3 天）</li>
  <li>阶段二：开发联调（预计 7 天）</li>
  <li>阶段三：UAT 测试 / 上线（预计 2 天）</li>
</ul>`,
]

const REMARK_POOL = ['', '该计划优先级：高（示例标记）', '需协同示例研发中心 2 人配合', '']

// ======== 初始化数据（脱敏） ========

const RAW_INIT: Omit<WorkPlanItem, 'id'>[] = [
  {
    code: 9,
    title: TITLE_POOL[0],
    auditor: '-',
    progressStatus: 'not_started',
    plannedStartTime: fmtDateTime('2020-12-31', 0),
    plannedEndTime:   fmtDateTime('2020-12-31', 1440 - 1),
    content: CONTENT_POOL[0],
    remark: REMARK_POOL[1],
    submitter: '超级管理员',
    submitTime: fmtDateTime('2020-12-20', 9 * 60 + 10),
  },
  {
    code: 15,
    title: TITLE_POOL[1],
    auditor: '-',
    progressStatus: 'not_started',
    plannedStartTime: fmtDateTime('2021-01-04', 0),
    plannedEndTime:   fmtDateTime('2021-01-04', 1440 - 1),
    content: CONTENT_POOL[1],
    remark: REMARK_POOL[0],
    submitter: '超级管理员',
    submitTime: fmtDateTime('2020-12-28', 16 * 60),
  },
  {
    code: 1,
    title: TITLE_POOL[6],
    auditor: '超级管理员',
    progressStatus: 'audited',
    plannedStartTime: fmtDateTime('2020-12-24', 9 * 60 + 5),
    plannedEndTime:   fmtDateTime('2020-12-31', 18 * 60),
    actualStartTime:  fmtDateTime('2020-12-24', 9 * 60 + 5),
    actualEndTime:    fmtDateTime('2020-12-31', 11 * 60 + 5),
    content: CONTENT_POOL[2],
    remark: REMARK_POOL[0],
    submitter: '超级管理员',
    submitTime: fmtDateTime('2020-12-20', 10 * 60 + 30),
  },
  // 额外若干条：覆盖不同状态/发起人的样例（我的工作计划默认只看 submitter==超级管理员）
  {
    code: 20,
    title: TITLE_POOL[2],
    auditor: '小戴',
    progressStatus: 'in_progress',
    plannedStartTime: fmtDateTime('2026-08-25', 9 * 60),
    plannedEndTime:   fmtDateTime('2026-08-30', 18 * 60),
    actualStartTime:  fmtDateTime('2026-08-25', 9 * 60),
    content: CONTENT_POOL[0],
    remark: '',
    submitter: '超级管理员',
    submitTime: fmtDateTime('2026-08-20', 15 * 60),
  },
  {
    code: 21,
    title: TITLE_POOL[3],
    auditor: '小白',
    progressStatus: 'completed',
    plannedStartTime: fmtDateTime('2026-07-01', 0),
    plannedEndTime:   fmtDateTime('2026-07-10', 23 * 60 + 59),
    actualStartTime:  fmtDateTime('2026-07-01', 0),
    actualEndTime:    fmtDateTime('2026-07-09', 20 * 60),
    content: CONTENT_POOL[1],
    remark: '提前 1 天完成（演示备注）',
    submitter: '小戴', // 非"我的"；Mine 筛选默认不展示
    submitTime: fmtDateTime('2026-06-28', 10 * 60),
  },
  // ================ 我安排的工作样例（submitter=超级管理员=安排人， auditor='-'，executor=被安排者）================
  {
    code: 30,
    title: '代理业务支付审批流程模板设置',
    auditor: '-',
    executor: '-',
    progressStatus: 'not_started',
    plannedStartTime: fmtDateTime('2020-12-31', 0),
    plannedEndTime:   fmtDateTime('2021-01-04', 8 * 60),
    content: CONTENT_POOL[2],
    remark: '',
    submitter: '超级管理员',
    submitTime: fmtDateTime('2020-12-20', 9 * 60),
  },
  {
    code: 31,
    title: '「我的报销」页面增加"同意报销时间"',
    auditor: '-',
    executor: '-',
    progressStatus: 'not_started',
    plannedStartTime: fmtDateTime('2020-12-31', 0),
    plannedEndTime:   fmtDateTime('2021-01-08', 8 * 60),
    content: CONTENT_POOL[0],
    remark: '',
    submitter: '超级管理员',
    submitTime: fmtDateTime('2020-12-20', 10 * 60),
  },
  {
    code: 32,
    title: '审批通过的提醒功能',
    auditor: '-',
    executor: '-',
    progressStatus: 'not_started',
    plannedStartTime: fmtDateTime('2020-12-31', 0),
    plannedEndTime:   fmtDateTime('2020-12-31', 12 * 60),
    content: CONTENT_POOL[1],
    remark: '',
    submitter: '超级管理员',
    submitTime: fmtDateTime('2020-12-20', 11 * 60),
  },
  {
    code: 33,
    title: '样品费管理的页面及功能',
    auditor: '-',
    executor: '小戴',
    progressStatus: 'not_started',
    plannedStartTime: fmtDateTime('2020-12-31', 0),
    plannedEndTime:   fmtDateTime('2020-12-31', 1440 - 1),
    content: CONTENT_POOL[0],
    remark: '',
    submitter: '超级管理员',
    submitTime: fmtDateTime('2020-12-20', 12 * 60),
  },
  {
    code: 34,
    title: '出资登记页面及功能',
    auditor: '-',
    executor: '小白',
    progressStatus: 'not_started',
    plannedStartTime: fmtDateTime('2020-12-31', 0),
    plannedEndTime:   fmtDateTime('2020-12-31', 1440 - 1),
    content: CONTENT_POOL[2],
    remark: '',
    submitter: '超级管理员',
    submitTime: fmtDateTime('2020-12-20', 13 * 60),
  },
  {
    code: 35,
    title: '示例商贸客户回访周报汇总',
    auditor: '-',
    executor: '白主管',
    progressStatus: 'in_progress',
    plannedStartTime: fmtDateTime('2026-08-24', 9 * 60),
    plannedEndTime:   fmtDateTime('2026-08-28', 18 * 60),
    actualStartTime:  fmtDateTime('2026-08-24', 9 * 60),
    content: CONTENT_POOL[1],
    remark: '',
    submitter: '超级管理员',
    submitTime: fmtDateTime('2026-08-18', 15 * 60),
  },
  {
    code: 36,
    title: '演示供应商对账差异核对',
    auditor: '-',
    executor: '小陈',
    progressStatus: 'completed',
    plannedStartTime: fmtDateTime('2026-07-11', 0),
    plannedEndTime:   fmtDateTime('2026-07-20', 23 * 60 + 59),
    actualStartTime:  fmtDateTime('2026-07-11', 0),
    actualEndTime:    fmtDateTime('2026-07-18', 18 * 60),
    content: CONTENT_POOL[0],
    remark: '提前 2 天完成（演示数据）',
    submitter: '超级管理员',
    submitTime: fmtDateTime('2026-07-05', 10 * 60),
  },
  {
    code: 37,
    title: '示例研发中心季度版本回归排期',
    auditor: '-',
    executor: '小安',
    progressStatus: 'audited',
    plannedStartTime: fmtDateTime('2026-06-01', 0),
    plannedEndTime:   fmtDateTime('2026-06-20', 23 * 60 + 59),
    actualStartTime:  fmtDateTime('2026-06-01', 0),
    actualEndTime:    fmtDateTime('2026-06-19', 20 * 60),
    content: CONTENT_POOL[2],
    remark: '',
    submitter: '超级管理员',
    submitTime: fmtDateTime('2026-05-25', 16 * 60),
  },
]

let _codeSeq = Math.max(...RAW_INIT.map((r) => r.code)) + 1

// 部门工作计划：按 RAW_INIT 序号为每条样例指定虚构部门（脱敏纯中文 2-3 字）
// 与标题语义对应：财务/付款类→财务部；研发/页面功能→研发部；供应商/对账→采购部；
// 客户回访/样品费→销售部；报销/出资→综合部
const DEPT_BY_INDEX: string[] = [
  '财务部', // code 9  税务备案单证
  '财务部', // code 15 付款申请流水导出
  '研发部', // code 1  项目复盘
  '研发部', // code 20 研发中心改版
  '采购部', // code 21 供应商合同评审
  '财务部', // code 30 支付审批流程模板
  '综合部', // code 31 报销页面
  '研发部', // code 32 审批提醒功能
  '销售部', // code 33 样品费管理
  '财务部', // code 34 出资登记
  '销售部', // code 35 客户回访周报
  '采购部', // code 36 供应商对账差异
  '研发部', // code 37 季度版本回归
]

const store: WorkPlanItem[] = RAW_INIT.map((r, i) => ({
  ...r,
  id: `WP_${Date.now()}_${i + 1}`,
  department: r.department || DEPT_BY_INDEX[i] || '综合部',
}))

// ======== 内部过滤辅助 ========

function filterByTimeType(row: WorkPlanItem, timeType: WorkTimeType, date: string): boolean {
  if (!date) return true
  switch (timeType) {
    case 'planned_start': return dateOf(row.plannedStartTime) === date
    case 'planned_end':   return dateOf(row.plannedEndTime) === date
    case 'actual_start':  return !!row.actualStartTime && dateOf(row.actualStartTime) === date
    case 'actual_end':    return !!row.actualEndTime   && dateOf(row.actualEndTime) === date
    default: return true
  }
}
function keywordMatch(row: WorkPlanItem, keyword: string): boolean {
  if (!keyword) return true
  const kw = keyword.toLowerCase()
  return (
    row.title.toLowerCase().includes(kw) ||
    row.content.toLowerCase().includes(kw) ||
    (row.remark || '').toLowerCase().includes(kw)
  )
}

// ======== 对外接口 ========

/** 分页查询 */
export async function getWorkPlanPage(params: WorkPlanPageParams): Promise<Result<{ list: WorkPlanItem[]; total: number }>> {
  let rows = [...store]
  if (params.submitter) rows = rows.filter((r) => r.submitter === params.submitter)
  if (params.auditor) rows = rows.filter((r) => r.auditor === params.auditor)
  if (params.executor) rows = rows.filter((r) => r.executor === params.executor)
  if (params.progressStatus) rows = rows.filter((r) => r.progressStatus === params.progressStatus)
  if (params.department) rows = rows.filter((r) => r.department === params.department)
  if (params.timeType && params.date) rows = rows.filter((r) => filterByTimeType(r, params.timeType, params.date))
  if (params.keyword) rows = rows.filter((r) => keywordMatch(r, params.keyword))

  rows.sort((a, b) => b.code - a.code)

  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({
    list: rows.slice(start, start + params.pageSize),
    total,
  })
}

/**
 * 部门工作计划分页查询
 * - 不强制按 submitter 过滤（部门管理者视角看本部门所有人员计划）
 * - 支持按 部门 / 发起人 / 审核人 / 完成程度 / 时间类型+日期 / 关键字 过滤
 */
export async function getDeptWorkPlanPage(params: WorkPlanPageParams): Promise<Result<{ list: WorkPlanItem[]; total: number }>> {
  // 与 getWorkPlanPage 复用同一过滤逻辑，但不传 submitter（部门视角默认全量）
  const { submitter: _omit, ...rest } = params
  void _omit
  return getWorkPlanPage(rest)
}

/** 详情 */
export async function getWorkPlanById(id: string): Promise<Result<WorkPlanItem>> {
  const item = store.find((r) => r.id === id)
  return mockResponse(item || ({} as WorkPlanItem))
}

/** 新增 */
export async function createWorkPlan(payload: Partial<WorkPlanItem> & Pick<WorkPlanItem, 'title' | 'auditor' | 'plannedStartTime' | 'plannedEndTime' | 'content'>): Promise<Result<WorkPlanItem>> {
  const newItem: WorkPlanItem = {
    id: `WP_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    code: _codeSeq++,
    title: payload.title,
    auditor: payload.auditor,
    executor: payload.executor,
    progressStatus: payload.progressStatus || 'not_started',
    plannedStartTime: payload.plannedStartTime,
    plannedEndTime: payload.plannedEndTime,
    actualStartTime: payload.actualStartTime,
    actualEndTime: payload.actualEndTime,
    content: payload.content,
    remark: payload.remark,
    submitter: payload.submitter || SUBMITTERS[0],
    submitTime: payload.submitTime || nowFull(),
    department: payload.department || '综合部',
  }
  store.unshift(newItem)
  return mockResponse(newItem)
}

/** 修改 */
export async function updateWorkPlan(id: string, payload: Partial<WorkPlanItem>): Promise<Result<WorkPlanItem>> {
  const idx = store.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as WorkPlanItem)
  store[idx] = { ...store[idx], ...payload }
  return mockResponse(store[idx])
}

/** 删除 */
export async function deleteWorkPlan(id: string): Promise<Result<boolean>> {
  const idx = store.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  store.splice(idx, 1)
  return mockResponse(true)
}

/** 状态流转：开始 / 完成 / 取消 等 */
export type WorkProgressAction = 'start' | 'finish' | 'audit' | 'cancel' | 'reopen'

export async function changeWorkPlanProgress(
  id: string,
  action: WorkProgressAction
): Promise<Result<WorkPlanItem>> {
  const idx = store.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as WorkPlanItem)
  const item = store[idx]
  const now = nowFull()
  switch (action) {
    case 'start':
      // not_started → in_progress，记录实际开始
      if (item.progressStatus !== 'not_started') return mockResponse(item, ...([] as any))
      store[idx] = { ...item, progressStatus: 'in_progress', actualStartTime: now }
      break
    case 'finish':
      // in_progress → completed，记录实际结束
      if (item.progressStatus !== 'in_progress') return mockResponse(item, ...([] as any))
      store[idx] = { ...item, progressStatus: 'completed', actualEndTime: now }
      break
    case 'audit':
      // completed/in_progress → audited（模拟已经审核，写入实际结束）
      if (!['completed', 'in_progress'].includes(item.progressStatus)) return mockResponse(item, ...([] as any))
      store[idx] = {
        ...item,
        progressStatus: 'audited',
        actualEndTime: item.actualEndTime || now,
      }
      break
    case 'cancel':
      if (!['not_started', 'in_progress'].includes(item.progressStatus)) return mockResponse(item, ...([] as any))
      store[idx] = { ...item, progressStatus: 'cancelled', actualEndTime: now }
      break
    case 'reopen':
      if (item.progressStatus !== 'cancelled') return mockResponse(item, ...([] as any))
      store[idx] = { ...item, progressStatus: 'not_started' }
      break
  }
  return mockResponse(store[idx])
}
