// src/mock/enterprisePortal.ts
// 企业门户 Mock 数据层（全部脱敏虚构）
import type { Result } from '@/http'
import { mockResponse } from '@/mock'

// ======== 类型 ========

/** 企业基本信息（虚构演示企业） */
export interface CompanyProfile {
  name: string           // 企业名称（示例/演示标记）
  industry: string       // 所属行业
  address: string        // 地址（虚构）
  legalPerson: string    // 法人（纯中文虚构）
  employeeCount: number  // 在职员工数
  foundedYear: number    // 成立年份
}

/** 概览统计项 */
export interface PortalStatItem {
  key: 'sales' | 'purchase' | 'stock_warning' | 'employee'
  title: string
  current: number        // 当前值
  total: number          // 目标值/总数
  unit: string           // 单位
  percent: number        // 完成百分比（四舍五入）
  trend: 'up' | 'down'   // 环比方向
  trendPercent: number   // 环比幅度 %
}

/** 部门动态项 */
export interface DeptDynamicItem {
  id: string
  dept: string           // 虚构部门
  content: string        // 动态内容（带演示/示例标记）
  time: string           // YYYY-MM-DD HH:mm
  type: 'notice' | 'progress' | 'warning'
}

/** 快捷入口项 */
export interface QuickEntryItem {
  key: string
  label: string
  path: string           // 站内路由
}

/** 企业待办汇总 */
export interface PortalSummary {
  pendingApproval: number   // 待我审批
  unreadNotice: number      // 未读公告
  todoDocument: number      // 待处理公文
  deptPlan: number          // 部门计划进行中
}

// ======== 常量 ========

/** 虚构部门池（与工作日志等模块一致） */
export const deptOptions: { label: string; value: string }[] = [
  { label: '销售部', value: '销售部' },
  { label: '研发部', value: '研发部' },
  { label: '财务部', value: '财务部' },
  { label: '行政部', value: '行政部' },
  { label: '采购部', value: '采购部' },
  { label: '人力资源部', value: '人力资源部' },
]

export const deptDynamicTypeMap: Record<DeptDynamicItem['type'], { label: string; tag: 'primary' | 'success' | 'danger' }> = {
  notice: { label: '通知', tag: 'primary' },
  progress: { label: '进展', tag: 'success' },
  warning: { label: '预警', tag: 'danger' },
}

// ======== 初始化数据（脱敏） ========

const COMPANY_PROFILE: CompanyProfile = {
  name: '示例科技有限公司（演示数据）',
  industry: '软件开发与信息服务（虚拟场景）',
  address: '示例市虚拟区演示路 88 号（虚构地址）',
  legalPerson: '白主管',
  employeeCount: 128,
  foundedYear: 2016,
}

const RAW_STATS: Omit<PortalStatItem, 'percent'>[] = [
  { key: 'sales', title: '本月销售额（万元）', current: 486, total: 600, unit: '万元', trend: 'up', trendPercent: 12 },
  { key: 'purchase', title: '本月采购额（万元）', current: 322, total: 500, unit: '万元', trend: 'down', trendPercent: 5 },
  { key: 'stock_warning', title: '库存预警（项）', current: 6, total: 20, unit: '项', trend: 'down', trendPercent: 2 },
  { key: 'employee', title: '在职员工（人）', current: 128, total: 150, unit: '人', trend: 'up', trendPercent: 3 },
]

const RAW_DYNAMICS: Omit<DeptDynamicItem, 'id'>[] = [
  { dept: '销售部', content: '示例客户签约流程培训完成（演示动态）', time: '2026-08-28 10:20', type: 'progress' },
  { dept: '研发部', content: '虚拟演示平台 3.0 版本进入联调阶段（示例场景）', time: '2026-08-28 09:35', type: 'progress' },
  { dept: '采购部', content: '示例物料价格波动预警，请关注采购成本（演示提醒）', time: '2026-08-27 16:40', type: 'warning' },
  { dept: '行政部', content: '本月虚拟生日会安排通知已发布（演示活动）', time: '2026-08-27 14:05', type: 'notice' },
  { dept: '财务部', content: '示例费用报销制度修订版发布，请查阅（演示通知）', time: '2026-08-26 11:30', type: 'notice' },
  { dept: '人力资源部', content: '虚拟校园招聘宣讲会筹备进展顺利（示例动态）', time: '2026-08-26 09:10', type: 'progress' },
  { dept: '研发部', content: '演示环境服务器巡检发现预警，已处理（示例记录）', time: '2026-08-25 17:50', type: 'warning' },
]

/** 快捷入口：路径均为站内已注册路由 */
const QUICK_ENTRIES: QuickEntryItem[] = [
  { key: 'plan', label: '发起公文', path: '/oa/document/create' },
  { key: 'notice', label: '公告列表', path: '/oa/notice/list' },
  { key: 'approval', label: '待我审批', path: '/oa/approval/todo' },
  { key: 'log', label: '工作日志', path: '/oa/log/work' },
  { key: 'stock', label: '库存汇总', path: '/erp/stock/summary' },
  { key: 'vote', label: '投票管理', path: '/oa/document/vote' },
]

const PORTAL_SUMMARY: PortalSummary = {
  pendingApproval: 8,
  unreadNotice: 3,
  todoDocument: 5,
  deptPlan: 12,
}

// ======== 对外接口 ========

/** 企业基本信息 */
export async function getCompanyProfile(): Promise<Result<CompanyProfile>> {
  return mockResponse({ ...COMPANY_PROFILE })
}

/** 概览统计（percent 由 current/total 计算保证一致） */
export async function getPortalStats(): Promise<Result<PortalStatItem[]>> {
  const list = RAW_STATS.map((s) => ({
    ...s,
    percent: Math.round((s.current / s.total) * 100),
  }))
  return mockResponse(list)
}

/** 部门动态（按时间倒序，limit 截取） */
export async function getDeptDynamics(limit = 6): Promise<Result<DeptDynamicItem[]>> {
  const rows = RAW_DYNAMICS
    .map((d, i) => ({ ...d, id: `DYN_${i + 1}` }))
    .sort((a, b) => (a.time < b.time ? 1 : -1))
    .slice(0, limit)
  return mockResponse(rows)
}

/** 快捷入口 */
export async function getQuickEntries(): Promise<Result<QuickEntryItem[]>> {
  return mockResponse(QUICK_ENTRIES.map((e) => ({ ...e })))
}

/** 企业待办汇总 */
export async function getPortalSummary(): Promise<Result<PortalSummary>> {
  return mockResponse({ ...PORTAL_SUMMARY })
}
