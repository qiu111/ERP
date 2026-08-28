// src/mock/hr.ts
// 人力资源 Mock 数据层（部门/岗位/员工/招聘来源/招聘岗位/招聘单/离职/考勤/人员绩效/部门绩效，全部脱敏虚构）
import type { Result } from '@/http'
import { mockResponse } from '@/mock'

// ======== 通用 ========

/** 当前用户（Mock 固定） */
export const CURRENT_USER = '超级管理员'

/** 标签类型（仅允许 Element Plus 5 种） */
export type HrTagType = 'primary' | 'success' | 'warning' | 'danger' | 'info'

function pad0(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}
function pad4(n: number): string {
  return String(n).padStart(4, '0')
}
function nowFull(): string {
  const n = new Date()
  return `${n.getFullYear()}-${pad0(n.getMonth() + 1)}-${pad0(n.getDate())} ${pad0(n.getHours())}:${pad0(n.getMinutes())}`
}
function today(): string {
  const n = new Date()
  return `${n.getFullYear()}-${pad0(n.getMonth() + 1)}-${pad0(n.getDate())}`
}
function clipRemark(s?: string): string {
  return (s || '').slice(0, 225)
}
function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`
}

/** 启用/停用（基础资料通用） */
export type EnableStatus = 'enabled' | 'disabled'
export const enableStatusOptions: { label: string; value: EnableStatus }[] = [
  { label: '启用', value: 'enabled' },
  { label: '停用', value: 'disabled' },
]
export const enableStatusLabelMap: Record<EnableStatus, string> = {
  enabled: '启用',
  disabled: '停用',
}
export const enableStatusTagTypeMap: Record<EnableStatus, HrTagType> = {
  enabled: 'success',
  disabled: 'info',
}

// ============================================================
// 1. 部门 Department（树形）
// ============================================================

export interface Department {
  id: string
  code: number
  name: string
  parentId: string         // '0' 表示根节点
  leader: string
  sort: number
  status: EnableStatus
  remark?: string
  createTime: string
}

/** 部门树节点 */
export interface DepartmentNode extends Department {
  children?: DepartmentNode[]
}

const DEPT_INIT: Department[] = [
  { id: 'DEPT_ROOT', code: 8, name: '总公司', parentId: '0', leader: '超级管理员', sort: 1, status: 'enabled', remark: '示例公司根组织（演示数据）', createTime: '2026-01-02 09:00' },
  { id: 'DEPT_SALES', code: 7, name: '销售部', parentId: 'DEPT_ROOT', leader: '小赵', sort: 2, status: 'enabled', remark: '', createTime: '2026-01-03 09:00' },
  { id: 'DEPT_SALES_G1', code: 6, name: '销售一组', parentId: 'DEPT_SALES', leader: '小钱', sort: 1, status: 'enabled', remark: '示例销售下属分组（演示数据）', createTime: '2026-01-05 09:00' },
  { id: 'DEPT_RD', code: 5, name: '研发部', parentId: 'DEPT_ROOT', leader: '小孙', sort: 3, status: 'enabled', remark: '', createTime: '2026-01-03 10:00' },
  { id: 'DEPT_FIN', code: 4, name: '财务部', parentId: 'DEPT_ROOT', leader: '小李', sort: 4, status: 'enabled', remark: '', createTime: '2026-01-03 11:00' },
  { id: 'DEPT_ADMIN', code: 3, name: '行政部', parentId: 'DEPT_ROOT', leader: '小周', sort: 5, status: 'enabled', remark: '', createTime: '2026-01-03 14:00' },
  { id: 'DEPT_HR', code: 2, name: '人力资源部', parentId: 'DEPT_ROOT', leader: '小郑', sort: 6, status: 'enabled', remark: '', createTime: '2026-01-03 15:00' },
  { id: 'DEPT_PURCHASE', code: 1, name: '采购部', parentId: 'DEPT_ROOT', leader: '小吴', sort: 7, status: 'disabled', remark: '示例：已停用部门（演示数据）', createTime: '2026-01-03 16:00' },
]

let _deptCodeSeq = Math.max(...DEPT_INIT.map((r) => r.code)) + 1
const departmentStore: Department[] = DEPT_INIT.map((r) => ({ ...r }))

/** 构建部门树（深拷贝，避免污染 store） */
export function listDepartments(keyword?: string, status?: EnableStatus): DepartmentNode[] {
  let rows = [...departmentStore]
  if (status) rows = rows.filter((r) => r.status === status)
  if (keyword) {
    const kw = keyword.toLowerCase()
    rows = rows.filter(
      (r) => r.name.toLowerCase().includes(kw) || r.leader.toLowerCase().includes(kw)
    )
  }
  const map = new Map<string, DepartmentNode>()
  const roots: DepartmentNode[] = []
  rows.forEach((r) => map.set(r.id, { ...r, children: [] }))
  rows.forEach((r) => {
    const node = map.get(r.id)!
    if (r.parentId === '0' || !map.has(r.parentId)) {
      roots.push(node)
    } else {
      map.get(r.parentId)!.children!.push(node)
    }
  })
  roots.sort((a, b) => b.code - a.code)
  const sortRecursive = (nodes: DepartmentNode[]) => {
    nodes.sort((a, b) => a.sort - b.sort)
    nodes.forEach((n) => {
      if (n.children && n.children.length) sortRecursive(n.children)
    })
  }
  sortRecursive(roots)
  return roots
}

export async function getDepartmentById(id: string): Promise<Result<Department>> {
  const item = departmentStore.find((r) => r.id === id)
  return mockResponse(item || ({} as Department))
}

export async function createDepartment(
  payload: Pick<Department, 'name' | 'parentId'> & Partial<Department>
): Promise<Result<Department>> {
  const newItem: Department = {
    id: genId('DEPT'),
    code: _deptCodeSeq++,
    name: payload.name,
    parentId: payload.parentId || '0',
    leader: payload.leader || '',
    sort: payload.sort ?? 1,
    status: payload.status || 'enabled',
    remark: clipRemark(payload.remark),
    createTime: nowFull(),
  }
  departmentStore.push(newItem)
  return mockResponse(newItem)
}

export async function updateDepartment(
  id: string,
  payload: Partial<Department>
): Promise<Result<Department>> {
  const idx = departmentStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as Department)
  departmentStore[idx] = {
    ...departmentStore[idx],
    ...payload,
    remark: clipRemark(payload.remark ?? departmentStore[idx].remark),
  }
  return mockResponse(departmentStore[idx])
}

export async function deleteDepartment(id: string): Promise<Result<boolean>> {
  const hasChild = departmentStore.some((r) => r.parentId === id)
  if (hasChild) return mockResponse(false)
  const idx = departmentStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  departmentStore.splice(idx, 1)
  return mockResponse(true)
}

/** 启用/停用部门 */
export async function updateDepartmentStatus(
  id: string,
  status: EnableStatus
): Promise<Result<Department>> {
  const idx = departmentStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as Department)
  departmentStore[idx] = { ...departmentStore[idx], status }
  return mockResponse(departmentStore[idx])
}

/** 部门名称选项（启用中的部门，供岗位/员工/绩效引用，value=部门名称） */
export function getDepartmentOptions(): { label: string; value: string }[] {
  return departmentStore
    .filter((r) => r.status === 'enabled')
    .sort((a, b) => b.code - a.code)
    .map((r) => ({ label: r.name, value: r.name }))
}

/** 部门 ID 选项（启用中的部门，供新增子部门选择父级，value=部门 ID） */
export function getDepartmentIdOptions(): { label: string; value: string }[] {
  return departmentStore
    .filter((r) => r.status === 'enabled')
    .sort((a, b) => a.sort - b.sort)
    .map((r) => ({ label: r.name, value: r.id }))
}

/** 部门下拉（含全名，value=部门名称，含停用，供离职/考勤等历史数据筛选） */
export function getAllDepartmentOptions(): { label: string; value: string }[] {
  return [...departmentStore]
    .sort((a, b) => b.code - a.code)
    .map((r) => ({ label: r.name, value: r.name }))
}

/** 按部门名称查找部门 id */
function findDepartmentIdByName(name: string): string {
  const dept = departmentStore.find((r) => r.name === name)
  return dept ? dept.id : ''
}

// ============================================================
// 2. 岗位 Position
// ============================================================

export type PositionLevel = 'P1' | 'P2' | 'P3' | 'P4' | 'P5'
export type PositionStatus = 'open' | 'closed'

export interface PositionItem {
  id: string
  code: number
  name: string
  deptName: string
  deptId: string
  level: PositionLevel
  baseSalary: number
  status: PositionStatus
  remark?: string
  createTime: string
}

export const positionLevelOptions: { label: string; value: PositionLevel }[] = [
  { label: 'P1 初级', value: 'P1' },
  { label: 'P2 中级', value: 'P2' },
  { label: 'P3 高级', value: 'P3' },
  { label: 'P4 专家', value: 'P4' },
  { label: 'P5 资深', value: 'P5' },
]
export function getPositionLevelLabel(level: PositionLevel): string {
  const found = positionLevelOptions.find((o) => o.value === level)
  return found ? found.label : level
}
export const positionLevelTagTypeMap: Record<PositionLevel, HrTagType> = {
  P1: 'info',
  P2: 'success',
  P3: 'primary',
  P4: 'warning',
  P5: 'danger',
}

export const positionStatusOptions: { label: string; value: PositionStatus }[] = [
  { label: '招聘中', value: 'open' },
  { label: '已关闭', value: 'closed' },
]
export const positionStatusLabelMap: Record<PositionStatus, string> = {
  open: '招聘中',
  closed: '已关闭',
}
export const positionStatusTagTypeMap: Record<PositionStatus, HrTagType> = {
  open: 'success',
  closed: 'info',
}

export interface PositionPageParams {
  page: number
  pageSize: number
  keyword?: string
  deptName?: string
  level?: PositionLevel | ''
  status?: PositionStatus | ''
}

const POSITION_INIT: Omit<PositionItem, 'id'>[] = [
  { code: 6, name: '销售经理', deptName: '销售部', deptId: 'DEPT_SALES', level: 'P4', baseSalary: 15000, status: 'open', remark: '示例销售管理岗（演示数据）', createTime: '2026-01-06 09:00' },
  { code: 5, name: '销售专员', deptName: '销售部', deptId: 'DEPT_SALES', level: 'P2', baseSalary: 8000, status: 'open', remark: '', createTime: '2026-01-06 10:00' },
  { code: 4, name: '研发工程师', deptName: '研发部', deptId: 'DEPT_RD', level: 'P3', baseSalary: 12000, status: 'open', remark: '', createTime: '2026-01-07 09:00' },
  { code: 3, name: '财务主管', deptName: '财务部', deptId: 'DEPT_FIN', level: 'P4', baseSalary: 13000, status: 'closed', remark: '示例：岗位已满（演示数据）', createTime: '2026-01-07 11:00' },
  { code: 2, name: '行政专员', deptName: '行政部', deptId: 'DEPT_ADMIN', level: 'P2', baseSalary: 7000, status: 'open', remark: '', createTime: '2026-01-08 09:00' },
  { code: 1, name: '人事专员', deptName: '人力资源部', deptId: 'DEPT_HR', level: 'P2', baseSalary: 7500, status: 'open', remark: '', createTime: '2026-01-08 10:00' },
]

let _positionCodeSeq = Math.max(...POSITION_INIT.map((r) => r.code)) + 1
const positionStore: PositionItem[] = POSITION_INIT.map((r, i) => ({
  ...r,
  id: `POS_${Date.now()}_${i + 1}`,
}))

export async function getPositionPage(
  params: PositionPageParams
): Promise<Result<{ list: PositionItem[]; total: number }>> {
  let rows = [...positionStore]
  if (params.deptName) rows = rows.filter((r) => r.deptName === params.deptName)
  if (params.level) rows = rows.filter((r) => r.level === params.level)
  if (params.status) rows = rows.filter((r) => r.status === params.status)
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    rows = rows.filter(
      (r) => r.name.toLowerCase().includes(kw) || (r.remark || '').toLowerCase().includes(kw)
    )
  }
  rows.sort((a, b) => b.code - a.code)
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: rows.slice(start, start + params.pageSize), total })
}

export async function getPositionById(id: string): Promise<Result<PositionItem>> {
  const item = positionStore.find((r) => r.id === id)
  return mockResponse(item || ({} as PositionItem))
}

export async function createPosition(
  payload: Pick<PositionItem, 'name' | 'deptName' | 'level' | 'baseSalary'> & Partial<PositionItem>
): Promise<Result<PositionItem>> {
  const newItem: PositionItem = {
    id: genId('POS'),
    code: _positionCodeSeq++,
    name: payload.name,
    deptName: payload.deptName,
    deptId: findDepartmentIdByName(payload.deptName),
    level: payload.level,
    baseSalary: Number(payload.baseSalary) || 0,
    status: payload.status || 'open',
    remark: clipRemark(payload.remark),
    createTime: nowFull(),
  }
  positionStore.unshift(newItem)
  return mockResponse(newItem)
}

export async function updatePosition(
  id: string,
  payload: Partial<PositionItem>
): Promise<Result<PositionItem>> {
  const idx = positionStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as PositionItem)
  const next = { ...positionStore[idx], ...payload }
  if (payload.deptName) next.deptId = findDepartmentIdByName(payload.deptName)
  if (payload.baseSalary != null) next.baseSalary = Number(payload.baseSalary) || 0
  next.remark = clipRemark(payload.remark ?? positionStore[idx].remark)
  positionStore[idx] = next
  return mockResponse(positionStore[idx])
}

export async function deletePosition(id: string): Promise<Result<boolean>> {
  const idx = positionStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  positionStore.splice(idx, 1)
  return mockResponse(true)
}

/** 岗位名称选项（启用中部门下、招聘中岗位，供招聘单/员工引用） */
export function getPositionNameOptions(): { label: string; value: string }[] {
  return [...positionStore]
    .sort((a, b) => b.code - a.code)
    .map((r) => ({ label: `${r.name}（${r.deptName}）`, value: r.name }))
}

// ============================================================
// 3. 员工 Employee
// ============================================================

export type Gender = 'male' | 'female'
export const genderOptions: { label: string; value: Gender }[] = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
]
export function getGenderLabel(g: Gender): string {
  return g === 'male' ? '男' : '女'
}

export type EmployeeStatus = 'probation' | 'regular' | 'resigned'
export const employeeStatusOptions: { label: string; value: EmployeeStatus }[] = [
  { label: '试用期', value: 'probation' },
  { label: '正式', value: 'regular' },
  { label: '已离职', value: 'resigned' },
]
export const employeeStatusLabelMap: Record<EmployeeStatus, string> = {
  probation: '试用期',
  regular: '正式',
  resigned: '已离职',
}
export const employeeStatusTagTypeMap: Record<EmployeeStatus, HrTagType> = {
  probation: 'info',
  regular: 'success',
  resigned: 'danger',
}

export interface EmployeeItem {
  id: string
  code: number
  empNo: string               // EMP2026 开头
  name: string
  gender: Gender
  deptName: string
  positionName: string
  phone: string                // 脱敏 138****0001
  idCard: string               // 脱敏 110***0000
  entryDate: string
  status: EmployeeStatus
  birthday: string
  email: string
  remark?: string
  createTime: string
}

export interface EmployeePageParams {
  page: number
  pageSize: number
  keyword?: string             // 姓名/工号
  deptName?: string
  status?: EmployeeStatus | ''
  gender?: Gender | ''
}

const EMPLOYEE_INIT: Omit<EmployeeItem, 'id'>[] = [
  { code: 8, empNo: 'EMP20260008', name: '小赵', gender: 'male', deptName: '销售部', positionName: '销售经理', phone: '138****0001', idCard: '110***0001', entryDate: '2024-03-01', status: 'regular', birthday: '1992-05-12', email: 'zhao@example.com', remark: '示例销售负责人（演示数据）', createTime: '2024-03-02 09:00' },
  { code: 7, empNo: 'EMP20260007', name: '小钱', gender: 'female', deptName: '销售部', positionName: '销售专员', phone: '138****0002', idCard: '110***0002', entryDate: '2025-06-15', status: 'probation', birthday: '1996-08-20', email: 'qian@example.com', remark: '', createTime: '2025-06-16 09:00' },
  { code: 6, empNo: 'EMP20260006', name: '小孙', gender: 'male', deptName: '研发部', positionName: '研发工程师', phone: '138****0003', idCard: '110***0003', entryDate: '2023-07-01', status: 'regular', birthday: '1990-11-03', email: 'sun@example.com', remark: '', createTime: '2023-07-02 09:00' },
  { code: 5, empNo: 'EMP20260005', name: '小李', gender: 'female', deptName: '财务部', positionName: '财务主管', phone: '138****0004', idCard: '110***0004', entryDate: '2022-04-10', status: 'regular', birthday: '1989-02-14', email: 'li@example.com', remark: '', createTime: '2022-04-11 09:00' },
  { code: 4, empNo: 'EMP20260004', name: '小周', gender: 'male', deptName: '行政部', positionName: '行政专员', phone: '138****0005', idCard: '110***0005', entryDate: '2025-02-20', status: 'probation', birthday: '1998-09-25', email: 'zhou@example.com', remark: '', createTime: '2025-02-21 09:00' },
  { code: 3, empNo: 'EMP20260003', name: '小吴', gender: 'male', deptName: '采购部', positionName: '采购专员', phone: '138****0006', idCard: '110***0006', entryDate: '2021-09-01', status: 'regular', birthday: '1988-12-30', email: 'wu@example.com', remark: '', createTime: '2021-09-02 09:00' },
  { code: 2, empNo: 'EMP20260002', name: '小郑', gender: 'female', deptName: '人力资源部', positionName: '人事专员', phone: '138****0007', idCard: '110***0007', entryDate: '2023-01-05', status: 'regular', birthday: '1993-04-18', email: 'zheng@example.com', remark: '', createTime: '2023-01-06 09:00' },
  { code: 1, empNo: 'EMP20260001', name: '小冯', gender: 'male', deptName: '研发部', positionName: '研发工程师', phone: '138****0008', idCard: '110***0008', entryDate: '2026-07-01', status: 'probation', birthday: '1999-06-08', email: 'feng@example.com', remark: '示例新入职员工（演示数据）', createTime: '2026-07-02 09:00' },
]

let _employeeCodeSeq = Math.max(...EMPLOYEE_INIT.map((r) => r.code)) + 1
let _empNoSeq = Math.max(...EMPLOYEE_INIT.map((r) => parseInt(r.empNo.replace('EMP', ''), 10))) + 1
const employeeStore: EmployeeItem[] = EMPLOYEE_INIT.map((r, i) => ({
  ...r,
  id: `EMP_${Date.now()}_${i + 1}`,
}))

export async function getEmployeePage(
  params: EmployeePageParams
): Promise<Result<{ list: EmployeeItem[]; total: number }>> {
  let rows = [...employeeStore]
  if (params.deptName) rows = rows.filter((r) => r.deptName === params.deptName)
  if (params.status) rows = rows.filter((r) => r.status === params.status)
  if (params.gender) rows = rows.filter((r) => r.gender === params.gender)
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    rows = rows.filter(
      (r) => r.name.toLowerCase().includes(kw) || r.empNo.toLowerCase().includes(kw)
    )
  }
  rows.sort((a, b) => b.code - a.code)
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: rows.slice(start, start + params.pageSize), total })
}

export async function getEmployeeById(id: string): Promise<Result<EmployeeItem>> {
  const item = employeeStore.find((r) => r.id === id)
  return mockResponse(item || ({} as EmployeeItem))
}

export async function createEmployee(
  payload: Pick<EmployeeItem, 'name' | 'deptName' | 'positionName' | 'entryDate'> &
    Partial<EmployeeItem>
): Promise<Result<EmployeeItem>> {
  const newItem: EmployeeItem = {
    id: genId('EMP'),
    code: _employeeCodeSeq++,
    empNo: `EMP${_empNoSeq++}`,
    name: payload.name,
    gender: payload.gender || 'male',
    deptName: payload.deptName,
    positionName: payload.positionName,
    phone: payload.phone || '',
    idCard: payload.idCard || '',
    entryDate: payload.entryDate,
    status: payload.status || 'probation',
    birthday: payload.birthday || '',
    email: payload.email || '',
    remark: clipRemark(payload.remark),
    createTime: nowFull(),
  }
  employeeStore.unshift(newItem)
  return mockResponse(newItem)
}

export async function updateEmployee(
  id: string,
  payload: Partial<EmployeeItem>
): Promise<Result<EmployeeItem>> {
  const idx = employeeStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as EmployeeItem)
  employeeStore[idx] = {
    ...employeeStore[idx],
    ...payload,
    remark: clipRemark(payload.remark ?? employeeStore[idx].remark),
  }
  return mockResponse(employeeStore[idx])
}

export async function deleteEmployee(id: string): Promise<Result<boolean>> {
  const idx = employeeStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  employeeStore.splice(idx, 1)
  return mockResponse(true)
}

/** 员工姓名选项（供离职/绩效引用，value=姓名） */
export function getEmployeeNameOptions(): { label: string; value: string }[] {
  return [...employeeStore]
    .filter((r) => r.status !== 'resigned')
    .sort((a, b) => b.code - a.code)
    .map((r) => ({ label: `${r.name}（${r.empNo}）`, value: r.name }))
}

/** 按姓名查找员工的部门与工号（供离职/绩效表单自动带出） */
export function getEmployeeMetaByName(name: string): { deptName: string; empNo: string } {
  const emp = employeeStore.find((r) => r.name === name)
  return emp ? { deptName: emp.deptName, empNo: emp.empNo } : { deptName: '', empNo: '' }
}

/** 按姓名+部门查找员工并更新状态（供离职办理引用） */
function setEmployeeResignedByName(name: string, deptName: string): void {
  const idx = employeeStore.findIndex((r) => r.name === name && r.deptName === deptName)
  if (idx !== -1) employeeStore[idx].status = 'resigned'
}

// ============================================================
// 4. 招聘来源 RecruitSource（基础资料）
// ============================================================

export interface RecruitSourceItem {
  id: string
  code: number
  name: string
  sort: number
  status: EnableStatus
  remark?: string
  createTime: string
}

const RECRUIT_SOURCE_INIT: Omit<RecruitSourceItem, 'id'>[] = [
  { code: 5, name: 'BOSS直聘', sort: 1, status: 'enabled', remark: '示例招聘渠道（演示数据）', createTime: '2026-01-05 09:00' },
  { code: 4, name: '智联招聘', sort: 2, status: 'enabled', remark: '', createTime: '2026-01-05 10:00' },
  { code: 3, name: '前程无忧', sort: 3, status: 'enabled', remark: '', createTime: '2026-01-05 11:00' },
  { code: 2, name: '猎头推荐', sort: 4, status: 'enabled', remark: '示例高端岗位渠道（演示数据）', createTime: '2026-01-05 14:00' },
  { code: 1, name: '内部推荐', sort: 5, status: 'disabled', remark: '示例：已暂停（演示数据）', createTime: '2026-01-05 15:00' },
]

let _recruitSourceCodeSeq = Math.max(...RECRUIT_SOURCE_INIT.map((r) => r.code)) + 1
const recruitSourceStore: RecruitSourceItem[] = RECRUIT_SOURCE_INIT.map((r, i) => ({
  ...r,
  id: `RS_${Date.now()}_${i + 1}`,
}))

export interface RecruitSourcePageParams {
  page: number
  pageSize: number
  status?: EnableStatus | ''
  keyword?: string
}

export async function getRecruitSourcePage(
  params: RecruitSourcePageParams
): Promise<Result<{ list: RecruitSourceItem[]; total: number }>> {
  let rows = [...recruitSourceStore]
  if (params.status) rows = rows.filter((r) => r.status === params.status)
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    rows = rows.filter(
      (r) => r.name.toLowerCase().includes(kw) || (r.remark || '').toLowerCase().includes(kw)
    )
  }
  rows.sort((a, b) => b.code - a.code)
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: rows.slice(start, start + params.pageSize), total })
}

export async function getRecruitSourceById(id: string): Promise<Result<RecruitSourceItem>> {
  const item = recruitSourceStore.find((r) => r.id === id)
  return mockResponse(item || ({} as RecruitSourceItem))
}

export async function createRecruitSource(
  payload: Pick<RecruitSourceItem, 'name'> & Partial<RecruitSourceItem>
): Promise<Result<RecruitSourceItem>> {
  const newItem: RecruitSourceItem = {
    id: genId('RS'),
    code: _recruitSourceCodeSeq++,
    name: payload.name,
    sort: payload.sort ?? 1,
    status: payload.status || 'enabled',
    remark: clipRemark(payload.remark),
    createTime: nowFull(),
  }
  recruitSourceStore.unshift(newItem)
  return mockResponse(newItem)
}

export async function updateRecruitSource(
  id: string,
  payload: Partial<RecruitSourceItem>
): Promise<Result<RecruitSourceItem>> {
  const idx = recruitSourceStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as RecruitSourceItem)
  recruitSourceStore[idx] = {
    ...recruitSourceStore[idx],
    ...payload,
    remark: clipRemark(payload.remark ?? recruitSourceStore[idx].remark),
  }
  return mockResponse(recruitSourceStore[idx])
}

export async function deleteRecruitSource(id: string): Promise<Result<boolean>> {
  const idx = recruitSourceStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  recruitSourceStore.splice(idx, 1)
  return mockResponse(true)
}

/** 启用中的招聘来源名称选项（供招聘单/招聘岗位引用） */
export function getRecruitSourceOptions(): { label: string; value: string }[] {
  return recruitSourceStore
    .filter((r) => r.status === 'enabled')
    .sort((a, b) => a.sort - b.sort)
    .map((r) => ({ label: r.name, value: r.name }))
}

// ============================================================
// 5. 招聘岗位 RecruitPosition（基础资料）
// ============================================================

export interface RecruitPositionItem {
  id: string
  code: number
  name: string
  deptName: string
  headcount: number
  recruitSource: string
  salaryRange: string
  requirement: string
  remark?: string
  createTime: string
}

export interface RecruitPositionPageParams {
  page: number
  pageSize: number
  keyword?: string
  deptName?: string
  recruitSource?: string
}

const RECRUIT_POSITION_INIT: Omit<RecruitPositionItem, 'id'>[] = [
  { code: 5, name: '高级销售经理', deptName: '销售部', headcount: 1, recruitSource: '猎头推荐', salaryRange: '15k-20k', requirement: '5年以上销售管理经验，有团队管理经验', remark: '示例高端岗位（演示数据）', createTime: '2026-08-01 09:00' },
  { code: 4, name: '研发工程师', deptName: '研发部', headcount: 2, recruitSource: 'BOSS直聘', salaryRange: '10k-15k', requirement: '3年后端开发经验，熟悉 Vue/Node', remark: '', createTime: '2026-08-03 09:00' },
  { code: 3, name: '销售专员', deptName: '销售部', headcount: 3, recruitSource: '智联招聘', salaryRange: '6k-9k', requirement: '1年以上销售经验，沟通能力强', remark: '', createTime: '2026-08-05 09:00' },
  { code: 2, name: '行政专员', deptName: '行政部', headcount: 1, recruitSource: '前程无忧', salaryRange: '5k-7k', requirement: '熟练使用办公软件，细心负责', remark: '', createTime: '2026-08-06 09:00' },
  { code: 1, name: '人事专员', deptName: '人力资源部', headcount: 1, recruitSource: '内部推荐', salaryRange: '6k-8k', requirement: '2年人力资源经验，熟悉招聘流程', remark: '示例：内部推荐岗位（演示数据）', createTime: '2026-08-08 09:00' },
]

let _recruitPositionCodeSeq = Math.max(...RECRUIT_POSITION_INIT.map((r) => r.code)) + 1
const recruitPositionStore: RecruitPositionItem[] = RECRUIT_POSITION_INIT.map((r, i) => ({
  ...r,
  id: `RP_${Date.now()}_${i + 1}`,
}))

export async function getRecruitPositionPage(
  params: RecruitPositionPageParams
): Promise<Result<{ list: RecruitPositionItem[]; total: number }>> {
  let rows = [...recruitPositionStore]
  if (params.deptName) rows = rows.filter((r) => r.deptName === params.deptName)
  if (params.recruitSource) rows = rows.filter((r) => r.recruitSource === params.recruitSource)
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    rows = rows.filter(
      (r) =>
        r.name.toLowerCase().includes(kw) ||
        r.requirement.toLowerCase().includes(kw) ||
        (r.remark || '').toLowerCase().includes(kw)
    )
  }
  rows.sort((a, b) => b.code - a.code)
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: rows.slice(start, start + params.pageSize), total })
}

export async function getRecruitPositionById(id: string): Promise<Result<RecruitPositionItem>> {
  const item = recruitPositionStore.find((r) => r.id === id)
  return mockResponse(item || ({} as RecruitPositionItem))
}

export async function createRecruitPosition(
  payload: Pick<RecruitPositionItem, 'name' | 'deptName' | 'headcount'> & Partial<RecruitPositionItem>
): Promise<Result<RecruitPositionItem>> {
  const newItem: RecruitPositionItem = {
    id: genId('RP'),
    code: _recruitPositionCodeSeq++,
    name: payload.name,
    deptName: payload.deptName,
    headcount: Number(payload.headcount) || 1,
    recruitSource: payload.recruitSource || '',
    salaryRange: payload.salaryRange || '',
    requirement: payload.requirement || '',
    remark: clipRemark(payload.remark),
    createTime: nowFull(),
  }
  recruitPositionStore.unshift(newItem)
  return mockResponse(newItem)
}

export async function updateRecruitPosition(
  id: string,
  payload: Partial<RecruitPositionItem>
): Promise<Result<RecruitPositionItem>> {
  const idx = recruitPositionStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as RecruitPositionItem)
  const next = { ...recruitPositionStore[idx], ...payload }
  if (payload.headcount != null) next.headcount = Number(payload.headcount) || 1
  next.remark = clipRemark(payload.remark ?? recruitPositionStore[idx].remark)
  recruitPositionStore[idx] = next
  return mockResponse(recruitPositionStore[idx])
}

export async function deleteRecruitPosition(id: string): Promise<Result<boolean>> {
  const idx = recruitPositionStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  recruitPositionStore.splice(idx, 1)
  return mockResponse(true)
}

/** 招聘岗位名称选项（供招聘单引用） */
export function getRecruitPositionNameOptions(): { label: string; value: string }[] {
  return [...recruitPositionStore]
    .sort((a, b) => b.code - a.code)
    .map((r) => ({ label: `${r.name}（${r.deptName}）`, value: r.name }))
}

// ============================================================
// 6. 招聘记录 Recruit
// ============================================================

export type RecruitStatus = 'pending' | 'interviewed' | 'offered' | 'onboarded' | 'rejected'

export interface RecruitItem {
  id: string
  code: number
  positionName: string
  candidateName: string
  recruitSource: string
  phone: string
  interviewDate: string
  status: RecruitStatus
  remark?: string
  createTime: string
}

export const recruitStatusOptions: { label: string; value: RecruitStatus }[] = [
  { label: '待面试', value: 'pending' },
  { label: '已面试', value: 'interviewed' },
  { label: '已录用', value: 'offered' },
  { label: '已入职', value: 'onboarded' },
  { label: '已淘汰', value: 'rejected' },
]
export function getRecruitStatusLabel(status: RecruitStatus): string {
  const found = recruitStatusOptions.find((o) => o.value === status)
  return found ? found.label : status
}
export const recruitStatusTagTypeMap: Record<RecruitStatus, HrTagType> = {
  pending: 'warning',
  interviewed: 'info',
  offered: 'primary',
  onboarded: 'success',
  rejected: 'danger',
}

export interface RecruitPageParams {
  page: number
  pageSize: number
  status?: RecruitStatus | ''
  positionName?: string
  recruitSource?: string
  keyword?: string
}

const RECRUIT_INIT: Omit<RecruitItem, 'id'>[] = [
  { code: 6, positionName: '高级销售经理', candidateName: '小冯', recruitSource: '猎头推荐', phone: '138****0011', interviewDate: '2026-08-28', status: 'pending', remark: '示例候选人待面试（演示数据）', createTime: '2026-08-24 09:00' },
  { code: 5, positionName: '研发工程师', candidateName: '小陈', recruitSource: 'BOSS直聘', phone: '138****0012', interviewDate: '2026-08-22', status: 'interviewed', remark: '示例：技术面已通过（演示数据）', createTime: '2026-08-20 09:00' },
  { code: 4, positionName: '研发工程师', candidateName: '小褚', recruitSource: 'BOSS直聘', phone: '138****0013', interviewDate: '2026-08-18', status: 'offered', remark: '示例：已发 offer（演示数据）', createTime: '2026-08-16 09:00' },
  { code: 3, positionName: '销售专员', candidateName: '小孙', recruitSource: '智联招聘', phone: '138****0014', interviewDate: '2026-08-12', status: 'onboarded', remark: '示例：已办理入职（演示数据）', createTime: '2026-08-10 09:00' },
  { code: 2, positionName: '研发工程师', candidateName: '小李', recruitSource: '前程无忧', phone: '138****0015', interviewDate: '2026-08-08', status: 'rejected', remark: '示例：技术面未通过（演示数据）', createTime: '2026-08-06 09:00' },
  { code: 1, positionName: '销售专员', candidateName: '小周', recruitSource: '内部推荐', phone: '138****0016', interviewDate: '2026-08-30', status: 'pending', remark: '', createTime: '2026-08-25 09:00' },
]

let _recruitCodeSeq = Math.max(...RECRUIT_INIT.map((r) => r.code)) + 1
const recruitStore: RecruitItem[] = RECRUIT_INIT.map((r, i) => ({
  ...r,
  id: `RC_${Date.now()}_${i + 1}`,
}))

export async function getRecruitPage(
  params: RecruitPageParams
): Promise<Result<{ list: RecruitItem[]; total: number }>> {
  let rows = [...recruitStore]
  if (params.status) rows = rows.filter((r) => r.status === params.status)
  if (params.positionName) rows = rows.filter((r) => r.positionName === params.positionName)
  if (params.recruitSource) rows = rows.filter((r) => r.recruitSource === params.recruitSource)
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    rows = rows.filter(
      (r) =>
        r.candidateName.toLowerCase().includes(kw) ||
        r.positionName.toLowerCase().includes(kw) ||
        (r.remark || '').toLowerCase().includes(kw)
    )
  }
  rows.sort((a, b) => b.code - a.code)
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: rows.slice(start, start + params.pageSize), total })
}

export async function getRecruitById(id: string): Promise<Result<RecruitItem>> {
  const item = recruitStore.find((r) => r.id === id)
  return mockResponse(item || ({} as RecruitItem))
}

export async function createRecruit(
  payload: Pick<RecruitItem, 'positionName' | 'candidateName' | 'interviewDate'> &
    Partial<RecruitItem>
): Promise<Result<RecruitItem>> {
  const newItem: RecruitItem = {
    id: genId('RC'),
    code: _recruitCodeSeq++,
    positionName: payload.positionName,
    candidateName: payload.candidateName,
    recruitSource: payload.recruitSource || '',
    phone: payload.phone || '',
    interviewDate: payload.interviewDate,
    status: payload.status || 'pending',
    remark: clipRemark(payload.remark),
    createTime: nowFull(),
  }
  recruitStore.unshift(newItem)
  return mockResponse(newItem)
}

export async function updateRecruit(
  id: string,
  payload: Partial<RecruitItem>
): Promise<Result<RecruitItem>> {
  const idx = recruitStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as RecruitItem)
  recruitStore[idx] = {
    ...recruitStore[idx],
    ...payload,
    remark: clipRemark(payload.remark ?? recruitStore[idx].remark),
  }
  return mockResponse(recruitStore[idx])
}

export async function deleteRecruit(id: string): Promise<Result<boolean>> {
  const idx = recruitStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  recruitStore.splice(idx, 1)
  return mockResponse(true)
}

/** 推进招聘阶段（仅允许向前流转） */
const RECRUIT_FLOW: RecruitStatus[] = ['pending', 'interviewed', 'offered', 'onboarded']
export async function advanceRecruit(
  id: string,
  stage: RecruitStatus
): Promise<Result<RecruitItem>> {
  const item = recruitStore.find((r) => r.id === id)
  if (!item) return mockResponse({} as RecruitItem)
  const cur = RECRUIT_FLOW.indexOf(item.status)
  const next = RECRUIT_FLOW.indexOf(stage)
  if (next === -1 || next <= cur) return mockResponse(item)
  item.status = stage
  return mockResponse(item)
}

/** 面试结果（仅已面试状态可操作：pass→offered，reject→rejected） */
export async function auditInterview(
  id: string,
  result: 'pass' | 'reject'
): Promise<Result<RecruitItem>> {
  const item = recruitStore.find((r) => r.id === id)
  if (!item) return mockResponse({} as RecruitItem)
  if (item.status !== 'interviewed') return mockResponse(item)
  item.status = result === 'pass' ? 'offered' : 'rejected'
  return mockResponse(item)
}

// ============================================================
// 7. 离职申请 Resignation
// ============================================================

export type ResignReason = 'personal' | 'career' | 'salary' | 'other'
export type ResignStatus = 'pending' | 'approved' | 'rejected' | 'done'

export interface ResignationItem {
  id: string
  code: number
  employeeName: string
  deptName: string
  applyDate: string
  resignDate: string
  reason: ResignReason
  status: ResignStatus
  remark?: string
  createTime: string
}

export const resignReasonOptions: { label: string; value: ResignReason }[] = [
  { label: '个人原因', value: 'personal' },
  { label: '职业发展', value: 'career' },
  { label: '薪酬待遇', value: 'salary' },
  { label: '其他', value: 'other' },
]
export function getResignReasonLabel(reason: ResignReason): string {
  const found = resignReasonOptions.find((o) => o.value === reason)
  return found ? found.label : reason
}

export const resignStatusOptions: { label: string; value: ResignStatus }[] = [
  { label: '待审批', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' },
  { label: '已办理', value: 'done' },
]
export const resignStatusLabelMap: Record<ResignStatus, string> = {
  pending: '待审批',
  approved: '已通过',
  rejected: '已驳回',
  done: '已办理',
}
export const resignStatusTagTypeMap: Record<ResignStatus, HrTagType> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  done: 'success',
}

export interface ResignationPageParams {
  page: number
  pageSize: number
  status?: ResignStatus | ''
  deptName?: string
  keyword?: string
}

const RESIGNATION_INIT: Omit<ResignationItem, 'id'>[] = [
  { code: 5, employeeName: '小赵', deptName: '销售部', applyDate: '2026-08-26', resignDate: '', reason: 'personal', status: 'pending', remark: '示例：个人发展原因（演示数据）', createTime: '2026-08-26 09:00' },
  { code: 4, employeeName: '小钱', deptName: '销售部', applyDate: '2026-08-20', resignDate: '2026-09-05', reason: 'career', status: 'approved', remark: '示例：职业发展（演示数据）', createTime: '2026-08-20 09:00' },
  { code: 3, employeeName: '小孙', deptName: '研发部', applyDate: '2026-08-15', resignDate: '', reason: 'salary', status: 'rejected', remark: '示例：已驳回（演示数据）', createTime: '2026-08-15 09:00' },
  { code: 2, employeeName: '小李', deptName: '财务部', applyDate: '2026-08-08', resignDate: '2026-08-25', reason: 'other', status: 'done', remark: '示例：已办理离职（演示数据）', createTime: '2026-08-08 09:00' },
  { code: 1, employeeName: '小周', deptName: '行政部', applyDate: '2026-08-05', resignDate: '2026-08-22', reason: 'personal', status: 'done', remark: '', createTime: '2026-08-05 09:00' },
]

let _resignationCodeSeq = Math.max(...RESIGNATION_INIT.map((r) => r.code)) + 1
const resignationStore: ResignationItem[] = RESIGNATION_INIT.map((r, i) => ({
  ...r,
  id: `RG_${Date.now()}_${i + 1}`,
}))

export async function getResignationPage(
  params: ResignationPageParams
): Promise<Result<{ list: ResignationItem[]; total: number }>> {
  let rows = [...resignationStore]
  if (params.status) rows = rows.filter((r) => r.status === params.status)
  if (params.deptName) rows = rows.filter((r) => r.deptName === params.deptName)
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    rows = rows.filter(
      (r) => r.employeeName.toLowerCase().includes(kw) || (r.remark || '').toLowerCase().includes(kw)
    )
  }
  rows.sort((a, b) => b.code - a.code)
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: rows.slice(start, start + params.pageSize), total })
}

export async function getResignationById(id: string): Promise<Result<ResignationItem>> {
  const item = resignationStore.find((r) => r.id === id)
  return mockResponse(item || ({} as ResignationItem))
}

export async function createResignation(
  payload: Pick<ResignationItem, 'employeeName' | 'deptName' | 'applyDate' | 'reason'> &
    Partial<ResignationItem>
): Promise<Result<ResignationItem>> {
  const newItem: ResignationItem = {
    id: genId('RG'),
    code: _resignationCodeSeq++,
    employeeName: payload.employeeName,
    deptName: payload.deptName,
    applyDate: payload.applyDate,
    resignDate: payload.resignDate || '',
    reason: payload.reason,
    status: 'pending',
    remark: clipRemark(payload.remark),
    createTime: nowFull(),
  }
  resignationStore.unshift(newItem)
  return mockResponse(newItem)
}

export async function updateResignation(
  id: string,
  payload: Partial<ResignationItem>
): Promise<Result<ResignationItem>> {
  const idx = resignationStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as ResignationItem)
  resignationStore[idx] = {
    ...resignationStore[idx],
    ...payload,
    remark: clipRemark(payload.remark ?? resignationStore[idx].remark),
  }
  return mockResponse(resignationStore[idx])
}

export async function deleteResignation(id: string): Promise<Result<boolean>> {
  const idx = resignationStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  resignationStore.splice(idx, 1)
  return mockResponse(true)
}

/** 离职审批（仅待审批状态可审批） */
export async function auditResign(
  id: string,
  status: 'approved' | 'rejected'
): Promise<Result<ResignationItem>> {
  const item = resignationStore.find((r) => r.id === id)
  if (!item || item.status !== 'pending') return mockResponse(item || ({} as ResignationItem))
  item.status = status
  return mockResponse(item)
}

/** 办理离职（仅已通过状态可办理，同步更新员工状态为 resigned） */
export async function completeResign(
  id: string,
  resignDate: string
): Promise<Result<ResignationItem>> {
  const item = resignationStore.find((r) => r.id === id)
  if (!item || item.status !== 'approved') return mockResponse(item || ({} as ResignationItem))
  item.status = 'done'
  item.resignDate = resignDate
  setEmployeeResignedByName(item.employeeName, item.deptName)
  return mockResponse(item)
}

// ============================================================
// 8. 考勤记录 Attendance（只读查询）
// ============================================================

export type AttendanceStatus = 'normal' | 'late' | 'early' | 'absent' | 'leave'

export interface AttendanceItem {
  id: string
  code: number
  empNo: string
  employeeName: string
  deptName: string
  attendDate: string
  clockIn: string
  clockOut: string
  status: AttendanceStatus
  workHours: number
  remark?: string
  createTime: string
}

export const attendanceStatusOptions: { label: string; value: AttendanceStatus }[] = [
  { label: '正常', value: 'normal' },
  { label: '迟到', value: 'late' },
  { label: '早退', value: 'early' },
  { label: '缺勤', value: 'absent' },
  { label: '请假', value: 'leave' },
]
export const attendanceStatusLabelMap: Record<AttendanceStatus, string> = {
  normal: '正常',
  late: '迟到',
  early: '早退',
  absent: '缺勤',
  leave: '请假',
}
export const attendanceStatusTagTypeMap: Record<AttendanceStatus, HrTagType> = {
  normal: 'success',
  late: 'warning',
  early: 'warning',
  absent: 'danger',
  leave: 'info',
}

export interface AttendancePageParams {
  page: number
  pageSize: number
  keyword?: string              // 员工姓名/工号
  deptName?: string
  status?: AttendanceStatus | ''
  dateStart?: string
  dateEnd?: string
}

const ATTENDANCE_INIT: Omit<AttendanceItem, 'id'>[] = [
  { code: 8, empNo: 'EMP20260008', employeeName: '小赵', deptName: '销售部', attendDate: '2026-08-27', clockIn: '08:55', clockOut: '18:02', status: 'normal', workHours: 8, remark: '', createTime: '2026-08-27 18:10' },
  { code: 7, empNo: 'EMP20260007', employeeName: '小钱', deptName: '销售部', attendDate: '2026-08-27', clockIn: '09:20', clockOut: '18:05', status: 'late', workHours: 7.5, remark: '示例：迟到（演示数据）', createTime: '2026-08-27 18:10' },
  { code: 6, empNo: 'EMP20260006', employeeName: '小孙', deptName: '研发部', attendDate: '2026-08-27', clockIn: '08:50', clockOut: '17:30', status: 'early', workHours: 7, remark: '示例：早退（演示数据）', createTime: '2026-08-27 18:10' },
  { code: 5, empNo: 'EMP20260005', employeeName: '小李', deptName: '财务部', attendDate: '2026-08-27', clockIn: '', clockOut: '', status: 'leave', workHours: 0, remark: '示例：事假（演示数据）', createTime: '2026-08-27 18:10' },
  { code: 4, empNo: 'EMP20260004', employeeName: '小周', deptName: '行政部', attendDate: '2026-08-27', clockIn: '', clockOut: '', status: 'absent', workHours: 0, remark: '示例：未打卡缺勤（演示数据）', createTime: '2026-08-27 18:10' },
  { code: 3, empNo: 'EMP20260003', employeeName: '小吴', deptName: '采购部', attendDate: '2026-08-27', clockIn: '08:58', clockOut: '18:10', status: 'normal', workHours: 8, remark: '', createTime: '2026-08-27 18:10' },
  { code: 2, empNo: 'EMP20260002', employeeName: '小郑', deptName: '人力资源部', attendDate: '2026-08-27', clockIn: '08:45', clockOut: '18:00', status: 'normal', workHours: 8, remark: '', createTime: '2026-08-27 18:10' },
  { code: 1, empNo: 'EMP20260001', employeeName: '小冯', deptName: '研发部', attendDate: '2026-08-26', clockIn: '09:10', clockOut: '18:05', status: 'late', workHours: 7.5, remark: '', createTime: '2026-08-26 18:10' },
]

const attendanceStore: AttendanceItem[] = ATTENDANCE_INIT.map((r, i) => ({
  ...r,
  id: `ATT_${Date.now()}_${i + 1}`,
}))

export async function getAttendancePage(
  params: AttendancePageParams
): Promise<Result<{ list: AttendanceItem[]; total: number }>> {
  let rows = [...attendanceStore]
  if (params.deptName) rows = rows.filter((r) => r.deptName === params.deptName)
  if (params.status) rows = rows.filter((r) => r.status === params.status)
  if (params.dateStart) rows = rows.filter((r) => r.attendDate >= params.dateStart!)
  if (params.dateEnd) rows = rows.filter((r) => r.attendDate <= params.dateEnd!)
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    rows = rows.filter(
      (r) => r.employeeName.toLowerCase().includes(kw) || r.empNo.toLowerCase().includes(kw)
    )
  }
  rows.sort((a, b) => b.code - a.code)
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: rows.slice(start, start + params.pageSize), total })
}

export async function getAttendanceById(id: string): Promise<Result<AttendanceItem>> {
  const item = attendanceStore.find((r) => r.id === id)
  return mockResponse(item || ({} as AttendanceItem))
}

// ============================================================
// 9. 人员绩效 StaffPerformance
// ============================================================

export type PerformanceGrade = 'S' | 'A' | 'B' | 'C' | 'D'
export type PerfStatus = 'pending' | 'approved'

export interface StaffPerformanceItem {
  id: string
  code: number
  empNo: string
  employeeName: string
  deptName: string
  period: string              // YYYY-MM
  score: number               // 0-100
  grade: PerformanceGrade
  bonus: number
  status: PerfStatus
  remark?: string
  createTime: string
}

export const gradeOptions: { label: string; value: PerformanceGrade }[] = [
  { label: 'S 级', value: 'S' },
  { label: 'A 级', value: 'A' },
  { label: 'B 级', value: 'B' },
  { label: 'C 级', value: 'C' },
  { label: 'D 级', value: 'D' },
]
export const gradeLabelMap: Record<PerformanceGrade, string> = {
  S: 'S 级',
  A: 'A 级',
  B: 'B 级',
  C: 'C 级',
  D: 'D 级',
}
export const gradeTagTypeMap: Record<PerformanceGrade, HrTagType> = {
  S: 'danger',
  A: 'primary',
  B: 'success',
  C: 'warning',
  D: 'info',
}

export const perfStatusOptions: { label: string; value: PerfStatus }[] = [
  { label: '待审批', value: 'pending' },
  { label: '已审批', value: 'approved' },
]
export const perfStatusLabelMap: Record<PerfStatus, string> = {
  pending: '待审批',
  approved: '已审批',
}
export const perfStatusTagTypeMap: Record<PerfStatus, HrTagType> = {
  pending: 'warning',
  approved: 'success',
}

/** 由分数派生等级 */
export function deriveGrade(score: number): PerformanceGrade {
  if (score >= 90) return 'S'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  return 'D'
}

export interface StaffPerformancePageParams {
  page: number
  pageSize: number
  status?: PerfStatus | ''
  deptName?: string
  period?: string
  keyword?: string
}

const STAFF_PERF_INIT: Omit<StaffPerformanceItem, 'id'>[] = [
  { code: 6, empNo: 'EMP20260008', employeeName: '小赵', deptName: '销售部', period: '2026-07', score: 95, grade: 'S', bonus: 5000, status: 'pending', remark: '示例：超额完成销售目标（演示数据）', createTime: '2026-08-05 09:00' },
  { code: 5, empNo: 'EMP20260006', employeeName: '小孙', deptName: '研发部', period: '2026-07', score: 88, grade: 'A', bonus: 3000, status: 'pending', remark: '', createTime: '2026-08-05 09:10' },
  { code: 4, empNo: 'EMP20260005', employeeName: '小李', deptName: '财务部', period: '2026-07', score: 75, grade: 'B', bonus: 1500, status: 'approved', remark: '', createTime: '2026-08-05 09:20' },
  { code: 3, empNo: 'EMP20260004', employeeName: '小周', deptName: '行政部', period: '2026-07', score: 65, grade: 'C', bonus: 500, status: 'approved', remark: '示例：需改进（演示数据）', createTime: '2026-08-05 09:30' },
  { code: 2, empNo: 'EMP20260003', employeeName: '小吴', deptName: '采购部', period: '2026-06', score: 82, grade: 'A', bonus: 2500, status: 'approved', remark: '', createTime: '2026-07-05 09:00' },
  { code: 1, empNo: 'EMP20260002', employeeName: '小郑', deptName: '人力资源部', period: '2026-06', score: 55, grade: 'D', bonus: 0, status: 'approved', remark: '示例：绩效不达标（演示数据）', createTime: '2026-07-05 09:10' },
]

let _staffPerfCodeSeq = Math.max(...STAFF_PERF_INIT.map((r) => r.code)) + 1
const staffPerformanceStore: StaffPerformanceItem[] = STAFF_PERF_INIT.map((r, i) => ({
  ...r,
  id: `SP_${Date.now()}_${i + 1}`,
}))

export async function getStaffPerformancePage(
  params: StaffPerformancePageParams
): Promise<Result<{ list: StaffPerformanceItem[]; total: number }>> {
  let rows = [...staffPerformanceStore]
  if (params.status) rows = rows.filter((r) => r.status === params.status)
  if (params.deptName) rows = rows.filter((r) => r.deptName === params.deptName)
  if (params.period) rows = rows.filter((r) => r.period === params.period)
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    rows = rows.filter(
      (r) =>
        r.employeeName.toLowerCase().includes(kw) ||
        r.empNo.toLowerCase().includes(kw) ||
        (r.remark || '').toLowerCase().includes(kw)
    )
  }
  rows.sort((a, b) => b.code - a.code)
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: rows.slice(start, start + params.pageSize), total })
}

export async function getStaffPerformanceById(id: string): Promise<Result<StaffPerformanceItem>> {
  const item = staffPerformanceStore.find((r) => r.id === id)
  return mockResponse(item || ({} as StaffPerformanceItem))
}

export async function createStaffPerformance(
  payload: Pick<StaffPerformanceItem, 'employeeName' | 'deptName' | 'period' | 'score' | 'bonus'> &
    Partial<StaffPerformanceItem>
): Promise<Result<StaffPerformanceItem>> {
  const score = Number(payload.score) || 0
  const newItem: StaffPerformanceItem = {
    id: genId('SP'),
    code: _staffPerfCodeSeq++,
    empNo: payload.empNo || '',
    employeeName: payload.employeeName,
    deptName: payload.deptName,
    period: payload.period,
    score,
    grade: deriveGrade(score),
    bonus: Number(payload.bonus) || 0,
    status: 'pending',
    remark: clipRemark(payload.remark),
    createTime: nowFull(),
  }
  staffPerformanceStore.unshift(newItem)
  return mockResponse(newItem)
}

export async function updateStaffPerformance(
  id: string,
  payload: Partial<StaffPerformanceItem>
): Promise<Result<StaffPerformanceItem>> {
  const idx = staffPerformanceStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as StaffPerformanceItem)
  const next = { ...staffPerformanceStore[idx], ...payload }
  if (payload.score != null) {
    next.score = Number(payload.score) || 0
    next.grade = deriveGrade(next.score)
  }
  if (payload.bonus != null) next.bonus = Number(payload.bonus) || 0
  next.remark = clipRemark(payload.remark ?? staffPerformanceStore[idx].remark)
  staffPerformanceStore[idx] = next
  return mockResponse(staffPerformanceStore[idx])
}

export async function deleteStaffPerformance(id: string): Promise<Result<boolean>> {
  const idx = staffPerformanceStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  staffPerformanceStore.splice(idx, 1)
  return mockResponse(true)
}

/** 人员绩效审批（仅待审批状态可审批） */
export async function approveStaffPerformance(id: string): Promise<Result<StaffPerformanceItem>> {
  const item = staffPerformanceStore.find((r) => r.id === id)
  if (!item || item.status !== 'pending') return mockResponse(item || ({} as StaffPerformanceItem))
  item.status = 'approved'
  return mockResponse(item)
}

/** 绩效期间选项（去重降序） */
export function getStaffPerfPeriodOptions(): { label: string; value: string }[] {
  const periods = Array.from(new Set(staffPerformanceStore.map((r) => r.period)))
  periods.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
  return periods.map((p) => ({ label: p, value: p }))
}

// ============================================================
// 10. 部门绩效 DeptPerformance
// ============================================================

export interface DeptPerformanceItem {
  id: string
  code: number
  deptName: string
  period: string              // YYYY-MM
  planScore: number
  actualScore: number
  completionRate: number      // 实际/计划*100，自动计算只读（保留 2 位）
  status: PerfStatus
  remark?: string
  createTime: string
}

export interface DeptPerformancePageParams {
  page: number
  pageSize: number
  status?: PerfStatus | ''
  deptName?: string
  period?: string
}

/** 计算完成率（保留 2 位小数） */
export function calcCompletionRate(planScore: number, actualScore: number): number {
  if (!planScore || planScore <= 0) return 0
  return Math.round((actualScore / planScore) * 100 * 100) / 100
}

const DEPT_PERF_INIT: Omit<DeptPerformanceItem, 'id' | 'completionRate'>[] = [
  { code: 6, deptName: '销售部', period: '2026-07', planScore: 100, actualScore: 108, status: 'pending', remark: '示例：超额完成（演示数据）', createTime: '2026-08-05 10:00' },
  { code: 5, deptName: '研发部', period: '2026-07', planScore: 100, actualScore: 92, status: 'pending', remark: '', createTime: '2026-08-05 10:10' },
  { code: 4, deptName: '财务部', period: '2026-07', planScore: 100, actualScore: 95, status: 'approved', remark: '', createTime: '2026-08-05 10:20' },
  { code: 3, deptName: '行政部', period: '2026-07', planScore: 100, actualScore: 78, status: 'approved', remark: '示例：未达计划（演示数据）', createTime: '2026-08-05 10:30' },
  { code: 2, deptName: '人力资源部', period: '2026-06', planScore: 100, actualScore: 88, status: 'approved', remark: '', createTime: '2026-07-05 10:00' },
  { code: 1, deptName: '采购部', period: '2026-06', planScore: 100, actualScore: 102, status: 'approved', remark: '', createTime: '2026-07-05 10:10' },
]

let _deptPerfCodeSeq = Math.max(...DEPT_PERF_INIT.map((r) => r.code)) + 1
const deptPerformanceStore: DeptPerformanceItem[] = DEPT_PERF_INIT.map((r, i) => ({
  ...r,
  id: `DP_${Date.now()}_${i + 1}`,
  completionRate: calcCompletionRate(r.planScore, r.actualScore),
}))

export async function getDeptPerformancePage(
  params: DeptPerformancePageParams
): Promise<Result<{ list: DeptPerformanceItem[]; total: number }>> {
  let rows = [...deptPerformanceStore]
  if (params.status) rows = rows.filter((r) => r.status === params.status)
  if (params.deptName) rows = rows.filter((r) => r.deptName === params.deptName)
  if (params.period) rows = rows.filter((r) => r.period === params.period)
  rows.sort((a, b) => b.code - a.code)
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: rows.slice(start, start + params.pageSize), total })
}

export async function getDeptPerformanceById(id: string): Promise<Result<DeptPerformanceItem>> {
  const item = deptPerformanceStore.find((r) => r.id === id)
  return mockResponse(item || ({} as DeptPerformanceItem))
}

export async function createDeptPerformance(
  payload: Pick<DeptPerformanceItem, 'deptName' | 'period' | 'planScore' | 'actualScore'> &
    Partial<DeptPerformanceItem>
): Promise<Result<DeptPerformanceItem>> {
  const planScore = Number(payload.planScore) || 0
  const actualScore = Number(payload.actualScore) || 0
  const newItem: DeptPerformanceItem = {
    id: genId('DP'),
    code: _deptPerfCodeSeq++,
    deptName: payload.deptName,
    period: payload.period,
    planScore,
    actualScore,
    completionRate: calcCompletionRate(planScore, actualScore),
    status: 'pending',
    remark: clipRemark(payload.remark),
    createTime: nowFull(),
  }
  deptPerformanceStore.unshift(newItem)
  return mockResponse(newItem)
}

export async function updateDeptPerformance(
  id: string,
  payload: Partial<DeptPerformanceItem>
): Promise<Result<DeptPerformanceItem>> {
  const idx = deptPerformanceStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as DeptPerformanceItem)
  const next = { ...deptPerformanceStore[idx], ...payload }
  if (payload.planScore != null) next.planScore = Number(payload.planScore) || 0
  if (payload.actualScore != null) next.actualScore = Number(payload.actualScore) || 0
  next.completionRate = calcCompletionRate(next.planScore, next.actualScore)
  next.remark = clipRemark(payload.remark ?? deptPerformanceStore[idx].remark)
  deptPerformanceStore[idx] = next
  return mockResponse(deptPerformanceStore[idx])
}

export async function deleteDeptPerformance(id: string): Promise<Result<boolean>> {
  const idx = deptPerformanceStore.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  deptPerformanceStore.splice(idx, 1)
  return mockResponse(true)
}

/** 部门绩效审批（仅待审批状态可审批） */
export async function approveDeptPerformance(id: string): Promise<Result<DeptPerformanceItem>> {
  const item = deptPerformanceStore.find((r) => r.id === id)
  if (!item || item.status !== 'pending') return mockResponse(item || ({} as DeptPerformanceItem))
  item.status = 'approved'
  return mockResponse(item)
}

/** 部门绩效期间选项（去重降序） */
export function getDeptPerfPeriodOptions(): { label: string; value: string }[] {
  const periods = Array.from(new Set(deptPerformanceStore.map((r) => r.period)))
  periods.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
  return periods.map((p) => ({ label: p, value: p }))
}
