// src/mock/workLog.ts
// 工作日志 Mock 数据层（全部脱敏虚构）
import type { Result } from '@/http'
import { mockResponse } from '@/mock'

// ======== 枚举与类型 ========

/** 总结类型 */
export type WorkSummaryType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'

/** 审核状态 */
export type WorkAuditStatus = 'pending' | 'auditing' | 'passed' | 'rejected'

/** 审核结果（提交给 auditWorkLog） */
export type WorkAuditResult = 'passed' | 'rejected'

/** 工作计划完成状态 */
export type WorkPlanStatus = 'not_started' | 'in_progress' | 'completed' | 'cancelled'

/** 工作计划单项 */
export interface WorkPlanItem {
  id: string
  date: string          // 计划完成日期，如 2020-12-31
  content: string       // 计划内容，如"完成税务备案单证"
  status: WorkPlanStatus
}

/** 附件 */
export interface WorkAttachmentItem {
  id: string
  fileName: string
  fileSize: string      // 显示大小，如"245KB"
  uploadTime: string
  url: string
}

/** 工作日志 - 列表项/详情项 */
export interface WorkLogItem {
  id: string
  code: number                // 编号（纯数字，与截图"编号"列一致）
  title: string               // 总结标题
  summaryType: WorkSummaryType
  department: string          // 所属部门（新增：截图搜索栏"部门列表"对应）
  auditor: string             // 审核人（"-"表示未指派）
  summaryDate: string         // 总结日期 YYYY-MM-DD
  submitter: string           // 提交人
  submitTime: string          // 提交时间 YYYY-MM-DD HH:mm:ss
  auditStatus: WorkAuditStatus
  auditTime?: string
  auditOpinion?: string
  workPlans: WorkPlanItem[]
  summaryContent: string      // 总结内容（HTML）
  attachments: WorkAttachmentItem[]
}

/** 分页查询参数 */
export interface WorkLogPageParams {
  page: number
  pageSize: number
  summaryType?: WorkSummaryType | ''
  auditStatus?: WorkAuditStatus | ''
  submitDate?: string        // 日期 YYYY-MM-DD
  keyword?: string           // 关键词（标题+总结内容）
  department?: string        // 新增：部门
  submitter?: string         // 新增：提交人
}

// ======== 常量映射 ========

export const summaryTypeOptions: { label: string; value: WorkSummaryType }[] = [
  { label: '每日总结', value: 'daily' },
  { label: '每周总结', value: 'weekly' },
  { label: '月度总结', value: 'monthly' },
  { label: '季度总结', value: 'quarterly' },
  { label: '年度总结', value: 'annual' },
]

export const auditStatusOptions: { label: string; value: WorkAuditStatus }[] = [
  { label: '未审核', value: 'pending' },
  { label: '审核中', value: 'auditing' },
  { label: '已通过', value: 'passed' },
  { label: '已驳回', value: 'rejected' },
]

export const planStatusOptions: { label: string; value: WorkPlanStatus }[] = [
  { label: '未开展', value: 'not_started' },
  { label: '进行中', value: 'in_progress' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
]

/** 部门选项（虚构脱敏，搜索栏"部门列表"下拉） */
export const departmentOptions: { label: string; value: string }[] = [
  { label: '销售部', value: '销售部' },
  { label: '研发部', value: '研发部' },
  { label: '财务部', value: '财务部' },
  { label: '行政部', value: '行政部' },
  { label: '采购部', value: '采购部' },
  { label: '人力资源部', value: '人力资源部' },
]
const DEPARTMENT_POOL = departmentOptions.map((o) => o.value)

export function getSummaryTypeLabel(v: WorkSummaryType | ''): string {
  return summaryTypeOptions.find((o) => o.value === v)?.label || '-'
}
export function getAuditStatusLabel(v: WorkAuditStatus | ''): string {
  return auditStatusOptions.find((o) => o.value === v)?.label || '-'
}
export function getPlanStatusLabel(v: WorkPlanStatus): string {
  return planStatusOptions.find((o) => o.value === v)?.label || '-'
}

/** 审核状态标签色 */
export const auditStatusTagTypeMap: Record<WorkAuditStatus, 'danger' | 'warning' | 'success' | 'info'> = {
  pending: 'danger',    // 未审核 红色（截图中"未审核"用红色）
  auditing: 'warning',  // 审核中 橙
  passed: 'success',    // 已通过 绿
  rejected: 'info',     // 已驳回 灰
}

/** 工作计划状态标签色 */
export const planStatusTagTypeMap: Record<WorkPlanStatus, 'danger' | 'warning' | 'success' | 'info'> = {
  not_started: 'danger',   // 未开展 红（截图红色）
  in_progress: 'warning',  // 进行中 橙
  completed: 'success',    // 已完成 绿
  cancelled: 'info',       // 已取消 灰
}

/** 虚构通用中文名池（3 字 / 5 字） — 脱敏/合规，不指向任何真实人物 */
const SUBMITTERS = ['超级管理员', '小黄', '小戴', '小杨', '小北', '白主管', '小陈']

/** 审核人下拉（与 SUBMITTERS 池保持一致，便于交叉审核） */
export const auditorOptions: { label: string; value: string }[] = SUBMITTERS.map((n) => ({ label: n, value: n }))

/** 提交人下拉（WorkLogAuditList 搜索栏"提交人"项使用） */
export const submitterOptions: { label: string; value: string }[] = SUBMITTERS.map((n) => ({ label: n, value: n }))

// ======== 脱敏 Mock 数据 ========

const SEED_PLAN_TEMPLATES: Omit<WorkPlanItem, 'id'>[] = [
  { date: '2020-12-31', content: '完成税务备案单证整理工作（演示场景）', status: 'not_started' },
  { date: '2021-01-04', content: '完成付款申请流水核对（示例数据）', status: 'not_started' },
  { date: '2021-01-06', content: '示例虚拟供应商（演示数据）合同评审', status: 'in_progress' },
  { date: '2021-01-08', content: '月度演示数据报表汇总', status: 'completed' },
  { date: '2021-01-10', content: '演示厂（演示数据）库存盘点复核', status: 'not_started' },
]

function buildPlans(pick: number[]): WorkPlanItem[] {
  return pick.map((i, idx) => ({
    id: `WP${String(Date.now()).slice(-4)}${idx}${i}`,
    ...SEED_PLAN_TEMPLATES[i % SEED_PLAN_TEMPLATES.length],
  }))
}

/** 标题模板（脱敏，全量「（演示数据）」尾注） */
const TITLE_TEMPLATES = [
  (d: string, n: string) => `${d} ${n}的工作总结（演示数据）`,
  (_d: string, _n: string) => `日常工作报告（演示数据）`,
  (d: string, n: string) => `本周虚拟项目跟进-${n}（演示数据）`,
  (_d: string, _n: string) => `示例模块上线后复盘（演示数据）`,
  (d: string, n: string) => `${d.slice(0, 7)}月度小结-${n}（演示数据）`,
]

const CONTENT_TEMPLATES = [
  `<p><strong>今日工作小结（演示内容）：</strong></p>
<ol>
  <li>跟进虚拟供应商A的对账进度，已完成示例订单的 30%；</li>
  <li>复核演示仓库库存盘点清单，无明显异常；</li>
  <li>协同示例财务组完成月度费用归集预演。</li>
</ol>
<p><em>备注：以上为脱敏演示数据，不对应真实项目。</em></p>`,

  `<p>一、完成事项：</p>
<ul>
  <li>整理示例路分理处账户流水对账单；</li>
  <li>更新演示合同台账 2 条；</li>
  <li>组织虚拟部门周五站会，同步进度。</li>
</ul>
<p>二、明日计划：</p>
<ul>
  <li>推进演示加工坊样品发货；</li>
  <li>提交示例商行采购申请。</li>
</ul>`,

  `<p>本周重点：</p>
<p>1. <strong>演示ERP进销存</strong>模块联调测试 40+ 用例通过；</p>
<p>2. 梳理<strong>虚拟客户</strong>合同模板 7 份，完成法务预审；</p>
<p>3. 示例生产车间物料齐套率优化至 85%。</p>`,
]

function nextDay(base: string, delta: number): string {
  const d = new Date(base.replace(/-/g, '/'))
  d.setDate(d.getDate() + delta)
  return d.toISOString().slice(0, 10)
}
function pad0(n: number): string { return n < 10 ? `0${n}` : `${n}` }
function randomSubmitTime(dateStr: string): string {
  const h = 9 + Math.floor(Math.random() * 9)
  const m = Math.floor(Math.random() * 60)
  const s = Math.floor(Math.random() * 60)
  return `${dateStr} ${pad0(h)}:${pad0(m)}:${pad0(s)}`
}
function nowFull(): string {
  const n = new Date()
  return `${n.getFullYear()}-${pad0(n.getMonth() + 1)}-${pad0(n.getDate())} ${pad0(n.getHours())}:${pad0(n.getMinutes())}:${pad0(n.getSeconds())}`
}

const RAW_INIT: Omit<WorkLogItem, 'id'>[] = [
  {
    code: 4,
    title: TITLE_TEMPLATES[0]('2018-11-08', SUBMITTERS[0]),
    summaryType: 'daily',
    department: DEPARTMENT_POOL[0],
    auditor: SUBMITTERS[0],
    summaryDate: '2018-11-08',
    submitter: SUBMITTERS[0],
    submitTime: randomSubmitTime('2018-11-08'),
    auditStatus: 'pending',
    workPlans: buildPlans([0, 1]),
    summaryContent: CONTENT_TEMPLATES[0],
    attachments: [],
  },
  {
    code: 3,
    title: TITLE_TEMPLATES[0]('2018-11-08', SUBMITTERS[0]),
    summaryType: 'daily',
    department: DEPARTMENT_POOL[2],
    auditor: SUBMITTERS[0],
    summaryDate: '2018-11-08',
    submitter: SUBMITTERS[0],
    submitTime: randomSubmitTime('2018-11-08'),
    auditStatus: 'pending',
    workPlans: buildPlans([0, 1, 2]),
    summaryContent: CONTENT_TEMPLATES[1],
    attachments: [
      {
        id: 'FA001',
        fileName: '演示工作清单-示例.xlsx',
        fileSize: '245KB',
        uploadTime: '2018-11-08 17:22:10',
        url: '#mock-demo-file-001',
      },
    ],
  },
  {
    code: 2,
    title: '示例工作安排记录（虚拟演示场景）（演示数据）',
    summaryType: 'daily',
    department: DEPARTMENT_POOL[3],
    auditor: '-',
    summaryDate: '2018-11-02',
    submitter: SUBMITTERS[0],
    submitTime: randomSubmitTime('2018-11-02'),
    auditStatus: 'pending',
    workPlans: buildPlans([0]),
    summaryContent: CONTENT_TEMPLATES[2],
    attachments: [],
  },
  {
    code: 1,
    title: '2018-10-15 超级管理员的工作总结（演示数据）',
    summaryType: 'daily',
    department: DEPARTMENT_POOL[2],
    auditor: SUBMITTERS[0],
    summaryDate: '2018-10-15',
    submitter: SUBMITTERS[0],
    submitTime: randomSubmitTime('2018-10-15'),
    auditStatus: 'passed',
    auditTime: '2018-10-16 09:10:00',
    auditOpinion: '内容完整，符合部门要求。',
    workPlans: buildPlans([0, 3]),
    summaryContent: CONTENT_TEMPLATES[0],
    attachments: [],
  },
  // ======== 扩展至 6 条（脱敏，不同状态/类型组合） ========
  {
    code: 5,
    title: TITLE_TEMPLATES[2]('2025-01-06', SUBMITTERS[1]),
    summaryType: 'weekly',
    department: DEPARTMENT_POOL[1],
    auditor: SUBMITTERS[3],
    summaryDate: '2025-01-06',
    submitter: SUBMITTERS[1],
    submitTime: randomSubmitTime('2025-01-06'),
    auditStatus: 'auditing',
    workPlans: buildPlans([0, 1, 2, 3]),
    summaryContent: CONTENT_TEMPLATES[2],
    attachments: [
      {
        id: 'FA002',
        fileName: '虚拟项目周报-示例市研发部.docx',
        fileSize: '1.1MB',
        uploadTime: '2025-01-06 18:02:44',
        url: '#mock-demo-file-002',
      },
    ],
  },
  {
    code: 6,
    title: TITLE_TEMPLATES[4]('2024-12-01', SUBMITTERS[4]),
    summaryType: 'monthly',
    department: DEPARTMENT_POOL[4],
    auditor: SUBMITTERS[3],
    summaryDate: '2024-12-01',
    submitter: SUBMITTERS[4],
    submitTime: randomSubmitTime('2024-12-01'),
    auditStatus: 'rejected',
    auditTime: '2024-12-03 10:58:12',
    auditOpinion: '下月计划不够具体，请补充量化目标。',
    workPlans: buildPlans([0, 1, 4]),
    summaryContent: CONTENT_TEMPLATES[1],
    attachments: [],
  },
]

// 内存存储
let _codeSeq = Math.max(...RAW_INIT.map((r) => r.code)) + 1
const workLogStore: WorkLogItem[] = RAW_INIT.map((r, i) => ({
  id: `WL_${Date.now()}_${i + 1}`,
  ...r,
}))

// ======== 工具函数 ========

function keywordMatch(item: WorkLogItem, keyword: string): boolean {
  if (!keyword) return true
  const kw = keyword.toLowerCase()
  const hay = [item.title, item.summaryContent, item.submitter, item.auditor, item.department]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return hay.includes(kw)
}

function sameDateOrBefore(submitTime: string, dateStr: string): boolean {
  // submitDate 只比较日期部分
  return submitTime.slice(0, 10) === dateStr
}

// ======== 对外接口 ========

/** 分页列表（列表页/审核页共用） */
export async function getWorkLogPage(params: WorkLogPageParams): Promise<Result<{ list: WorkLogItem[]; total: number }>> {
  const {
    summaryType,
    auditStatus,
    submitDate,
    keyword,
    department,
    submitter,
  } = params

  let filtered = [...workLogStore]

  if (summaryType) filtered = filtered.filter((x) => x.summaryType === summaryType)
  if (auditStatus) filtered = filtered.filter((x) => x.auditStatus === auditStatus)
  if (submitDate) filtered = filtered.filter((x) => sameDateOrBefore(x.submitTime, submitDate))
  if (department) filtered = filtered.filter((x) => x.department === department)
  if (submitter) filtered = filtered.filter((x) => x.submitter === submitter)
  if (keyword) filtered = filtered.filter((x) => keywordMatch(x, keyword))

  // 排序：按编号降序（截图 4→3→2→1）
  filtered.sort((a, b) => b.code - a.code)

  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({
    list: filtered.slice(start, start + params.pageSize),
    total,
  })
}

/** 详情 */
export async function getWorkLogById(id: string): Promise<Result<WorkLogItem>> {
  const item = workLogStore.find((c) => c.id === id)
  return mockResponse(item || ({} as WorkLogItem))
}

/** 新增 */
export async function createWorkLog(payload: Partial<WorkLogItem> & Pick<WorkLogItem, 'title' | 'summaryType' | 'auditor' | 'summaryDate' | 'summaryContent'>): Promise<Result<WorkLogItem>> {
  const now = new Date()
  const today = `${now.getFullYear()}-${pad0(now.getMonth() + 1)}-${pad0(now.getDate())}`
  const submitTimeStr = `${today} ${pad0(now.getHours())}:${pad0(now.getMinutes())}:${pad0(now.getSeconds())}`

  const newItem: WorkLogItem = {
    id: `WL_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    code: _codeSeq++,
    title: payload.title,
    summaryType: payload.summaryType,
    department: payload.department || DEPARTMENT_POOL[0],
    auditor: payload.auditor || '-',
    summaryDate: payload.summaryDate || today,
    submitter: payload.submitter || SUBMITTERS[0],
    submitTime: payload.submitTime || submitTimeStr,
    auditStatus: payload.auditStatus || 'pending',
    workPlans: payload.workPlans ? JSON.parse(JSON.stringify(payload.workPlans)) : [],
    summaryContent: payload.summaryContent || '',
    attachments: payload.attachments ? JSON.parse(JSON.stringify(payload.attachments)) : [],
  }
  workLogStore.unshift(newItem)
  return mockResponse(newItem)
}

/** 修改 */
export async function updateWorkLog(id: string, payload: Partial<WorkLogItem>): Promise<Result<WorkLogItem>> {
  const idx = workLogStore.findIndex((x) => x.id === id)
  if (idx === -1) return mockResponse({} as WorkLogItem)
  workLogStore[idx] = { ...workLogStore[idx], ...payload }
  return mockResponse(workLogStore[idx])
}

/** 删除 */
export async function deleteWorkLog(id: string): Promise<Result<boolean>> {
  const idx = workLogStore.findIndex((x) => x.id === id)
  if (idx === -1) return mockResponse(false)
  workLogStore.splice(idx, 1)
  return mockResponse(true)
}

/** 审核（通过/驳回）：参考审批模块 approveTodo 流程 */
export interface WorkLogAuditPayload {
  auditor: string               // 当前审核人（写入 auditor 字段，替换原 -）
  auditResult: WorkAuditResult  // passed | rejected
  auditOpinion?: string         // 审核意见
}
export async function auditWorkLog(
  id: string,
  payload: WorkLogAuditPayload
): Promise<Result<WorkLogItem>> {
  const idx = workLogStore.findIndex((x) => x.id === id)
  if (idx === -1) {
    return Promise.resolve<Result<WorkLogItem>>({
      code: 404,
      message: '日志不存在或已删除',
      data: {} as WorkLogItem,
    })
  }
  const item = workLogStore[idx]
  if (item.auditStatus === 'passed' || item.auditStatus === 'rejected') {
    return Promise.resolve<Result<WorkLogItem>>({
      code: 409,
      message: `已${item.auditStatus === 'passed' ? '通过' : '驳回'}，不可重复审核`,
      data: item,
    })
  }
  const status: WorkAuditStatus = payload.auditResult === 'passed' ? 'passed' : 'rejected'
  workLogStore[idx] = {
    ...item,
    auditStatus: status,
    auditor: payload.auditor || item.auditor,
    auditTime: nowFull(),
    auditOpinion: payload.auditOpinion || (status === 'passed' ? '审核通过' : '审核驳回'),
  }
  return mockResponse(workLogStore[idx])
}

/** 批量审核（参考待我审批批量通过） */
export async function batchAuditWorkLog(
  ids: string[],
  payload: WorkLogAuditPayload
): Promise<Result<{ success: number; failed: { id: string; reason: string }[] }>> {
  const success: string[] = []
  const failed: { id: string; reason: string }[] = []
  for (const id of ids) {
    const r = await auditWorkLog(id, payload)
    if (r.code === 200 && r.data && r.data.id) {
      success.push(id)
    } else {
      failed.push({ id, reason: r.message || '审核失败' })
    }
  }
  return mockResponse({ success: success.length, failed })
}
