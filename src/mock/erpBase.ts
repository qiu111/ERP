// src/mock/erpBase.ts
// ERP 基本信息管理 mock 数据层：供应商 / 银行账户 / 物流公司 / 仓库
import type { Result } from '@/http'
import { mockResponse } from '@/mock'

/** 当前登录用户 */
export const CURRENT_USER = '超级管理员'

/** Element Plus 标签类型（仅允许以下五种） */
export type TagType = 'primary' | 'success' | 'warning' | 'danger' | 'info'

/** 通用启用/停用状态 */
export type CommonStatus = 'enabled' | 'disabled'

export const statusOptions: { label: string; value: CommonStatus }[] = [
  { label: '启用', value: 'enabled' },
  { label: '停用', value: 'disabled' },
]

export const statusLabelMap: Record<CommonStatus, string> = {
  enabled: '启用',
  disabled: '停用',
}

export const statusTagTypeMap: Record<CommonStatus, TagType> = {
  enabled: 'success',
  disabled: 'info',
}

const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ')

/** code 为纯数字，统一按数值降序排列 */
const sortByCodeDesc = <T extends { code: string }>(list: T[]): T[] =>
  [...list].sort((a, b) => Number(b.code) - Number(a.code))

const matchKeyword = (kw: string, ...fields: string[]) => {
  const k = kw.toLowerCase()
  return fields.some((f) => (f || '').toLowerCase().includes(k))
}

// ==================== 供应商 ====================

export type SupplierLevel = 'core' | 'normal'

export const supplierLevelOptions: { label: string; value: SupplierLevel }[] = [
  { label: '核心', value: 'core' },
  { label: '普通', value: 'normal' },
]

export const supplierLevelLabelMap: Record<SupplierLevel, string> = {
  core: '核心',
  normal: '普通',
}

export const supplierLevelTagTypeMap: Record<SupplierLevel, TagType> = {
  core: 'warning',
  normal: 'primary',
}

export interface Supplier {
  id: number
  code: string
  name: string
  contact: string
  phone: string
  address: string
  level: SupplierLevel
  status: CommonStatus
  remark: string
  createTime: string
}

export interface SupplierForm {
  code: string
  name: string
  contact: string
  phone: string
  address: string
  level: SupplierLevel
  status: CommonStatus
  remark: string
}

const mockSupplierList: Supplier[] = [
  { id: 1, code: '10010', name: '示例宏达贸易有限公司', contact: '小刘', phone: '13812340001', address: '江苏省南京市示例路88号', level: 'core', status: 'enabled', remark: '长期合作供应商，账期30天', createTime: '2026-01-06 09:30:00' },
  { id: 2, code: '10009', name: '示例恒信电子科技有限公司', contact: '小周', phone: '13998760002', address: '浙江省杭州市演示大道120号', level: 'normal', status: 'enabled', remark: '主营电子元器件', createTime: '2026-01-12 10:20:00' },
  { id: 3, code: '10008', name: '示例华宇包装制品厂', contact: '小刘', phone: '13755550003', address: '广东省佛山市示例工业一路15号', level: 'normal', status: 'disabled', remark: '旺季产能不足，暂停合作', createTime: '2026-01-20 14:10:00' },
  { id: 4, code: '10007', name: '示例蓝天纺织有限公司', contact: '小周', phone: '13633330004', address: '山东省济南市演示纺织路6号', level: 'core', status: 'enabled', remark: '面料核心供应商', createTime: '2026-02-01 09:00:00' },
  { id: 5, code: '10006', name: '示例鑫源五金加工厂', contact: '小刘', phone: '13511110005', address: '江苏省苏州市示例机电园3号', level: 'normal', status: 'enabled', remark: '', createTime: '2026-02-10 15:40:00' },
  { id: 6, code: '10005', name: '演示飞跃塑胶制品有限公司', contact: '小周', phone: '13422220006', address: '福建省泉州市演示塑胶城8栋', level: 'normal', status: 'enabled', remark: '可开13%增值税专用发票', createTime: '2026-02-18 11:25:00' },
  { id: 7, code: '10004', name: '示例中原钢铁贸易公司', contact: '小刘', phone: '13388880007', address: '河南省郑州市示例钢铁大道200号', level: 'core', status: 'enabled', remark: '钢材大宗采购渠道', createTime: '2026-03-02 09:50:00' },
  { id: 8, code: '10003', name: '演示佳丽日化用品公司', contact: '小周', phone: '13277770008', address: '湖北省武汉市演示日化产业园12号', level: 'normal', status: 'disabled', remark: '质量整改中，暂停下单', createTime: '2026-03-08 16:05:00' },
  { id: 9, code: '10002', name: '示例远东纸业贸易有限公司', contact: '小刘', phone: '13166660009', address: '上海市示例纸业港66号', level: 'normal', status: 'enabled', remark: '', createTime: '2026-03-15 10:35:00' },
  { id: 10, code: '10001', name: '演示广通风机制造有限公司', contact: '小周', phone: '13099990010', address: '安徽省合肥市演示机电产业园9号', level: 'normal', status: 'enabled', remark: '新增试用供应商', createTime: '2026-03-22 14:45:00' },
]

const supplierStore: Supplier[] = JSON.parse(JSON.stringify(mockSupplierList))
let supplierNextId = supplierStore.length + 1

/** 分页获取供应商列表 */
export function getSupplierPage(params: {
  page: number
  pageSize: number
  keyword?: string
  level?: SupplierLevel | ''
  status?: CommonStatus | ''
}): Promise<Result<{ list: Supplier[]; total: number }>> {
  let filtered = [...supplierStore]
  if (params.level) filtered = filtered.filter((s) => s.level === params.level)
  if (params.status) filtered = filtered.filter((s) => s.status === params.status)
  if (params.keyword) {
    filtered = filtered.filter((s) => matchKeyword(params.keyword!, s.code, s.name, s.contact, s.address))
  }
  filtered = sortByCodeDesc(filtered)
  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: filtered.slice(start, start + params.pageSize), total })
}

/** 根据 ID 获取供应商 */
export function getSupplierById(id: number): Promise<Result<Supplier | undefined>> {
  return mockResponse(supplierStore.find((s) => s.id === id))
}

/** 新增供应商 */
export function addSupplier(data: SupplierForm): Promise<Result<Supplier>> {
  const exists = supplierStore.some((s) => s.code === data.code)
  if (exists) return Promise.reject(new Error('供应商编号已存在'))
  const newSupplier: Supplier = {
    id: supplierNextId++,
    code: data.code,
    name: data.name,
    contact: data.contact,
    phone: data.phone,
    address: data.address,
    level: data.level,
    status: data.status,
    remark: data.remark,
    createTime: now(),
  }
  supplierStore.push(newSupplier)
  return mockResponse(newSupplier)
}

/** 更新供应商 */
export function updateSupplier(id: number, data: SupplierForm): Promise<Result<Supplier>> {
  const index = supplierStore.findIndex((s) => s.id === id)
  if (index === -1) return Promise.reject(new Error('供应商不存在'))
  const exists = supplierStore.some((s) => s.id !== id && s.code === data.code)
  if (exists) return Promise.reject(new Error('供应商编号已存在'))
  supplierStore[index] = { ...supplierStore[index], ...data }
  return mockResponse(supplierStore[index])
}

/** 删除供应商 */
export function deleteSupplier(id: number): Promise<Result<boolean>> {
  const index = supplierStore.findIndex((s) => s.id === id)
  if (index === -1) return Promise.reject(new Error('供应商不存在'))
  supplierStore.splice(index, 1)
  return mockResponse(true)
}

/** 启用/停用供应商 */
export function toggleSupplierStatus(id: number): Promise<Result<Supplier | undefined>> {
  const target = supplierStore.find((s) => s.id === id)
  if (!target) return Promise.reject(new Error('供应商不存在'))
  target.status = target.status === 'enabled' ? 'disabled' : 'enabled'
  return mockResponse(target)
}

// ==================== 银行账户 ====================

export type Currency = 'CNY' | 'USD' | 'EUR'

export const currencyOptions: { label: string; value: Currency }[] = [
  { label: '人民币', value: 'CNY' },
  { label: '美元', value: 'USD' },
  { label: '欧元', value: 'EUR' },
]

export const currencyLabelMap: Record<Currency, string> = {
  CNY: '人民币',
  USD: '美元',
  EUR: '欧元',
}

export const currencyTagTypeMap: Record<Currency, TagType> = {
  CNY: 'primary',
  USD: 'success',
  EUR: 'warning',
}

export interface BankAccount {
  id: number
  code: string
  accountName: string
  accountNo: string
  bankName: string
  currency: Currency
  status: CommonStatus
  remark: string
  createTime: string
}

export interface BankAccountForm {
  code: string
  accountName: string
  accountNo: string
  bankName: string
  currency: Currency
  status: CommonStatus
  remark: string
}

const mockBankAccountList: BankAccount[] = [
  { id: 1, code: '20010', accountName: '示例宏达贸易有限公司', accountNo: '6100123456780001', bankName: '示例工商银行', currency: 'CNY', status: 'enabled', remark: '公司主账户，日常收付款', createTime: '2026-01-08 09:20:00' },
  { id: 2, code: '20009', accountName: '示例宏达贸易有限公司', accountNo: '6100234567890002', bankName: '示例中国银行', currency: 'USD', status: 'enabled', remark: '外币收款账户', createTime: '2026-01-15 10:30:00' },
  { id: 3, code: '20008', accountName: '示例恒信电子科技有限公司', accountNo: '6100345678900003', bankName: '演示建设银行', currency: 'CNY', status: 'enabled', remark: '', createTime: '2026-01-25 11:15:00' },
  { id: 4, code: '20007', accountName: '示例蓝天纺织有限公司', accountNo: '6100456789010004', bankName: '演示农业银行', currency: 'CNY', status: 'enabled', remark: '面料采购付款账户', createTime: '2026-02-03 09:40:00' },
  { id: 5, code: '20006', accountName: '示例蓝天纺织有限公司', accountNo: '6100567890120005', bankName: '示例招商银行', currency: 'EUR', status: 'enabled', remark: '欧洲客户结算账户', createTime: '2026-02-12 14:00:00' },
  { id: 6, code: '20005', accountName: '演示飞跃塑胶制品有限公司', accountNo: '6100678901230006', bankName: '演示交通银行', currency: 'CNY', status: 'disabled', remark: '账户变更，已停用', createTime: '2026-02-20 15:20:00' },
  { id: 7, code: '20004', accountName: '示例中原钢铁贸易公司', accountNo: '6100789012340007', bankName: '示例工商银行', currency: 'CNY', status: 'enabled', remark: '大宗原料付款账户', createTime: '2026-03-01 09:10:00' },
  { id: 8, code: '20003', accountName: '演示佳丽日化用品公司', accountNo: '6100890123450008', bankName: '示例华夏银行', currency: 'CNY', status: 'enabled', remark: '', createTime: '2026-03-10 10:50:00' },
  { id: 9, code: '20002', accountName: '演示广通风机制造有限公司', accountNo: '6100901234560009', bankName: '示例兴业银行', currency: 'CNY', status: 'enabled', remark: '', createTime: '2026-03-18 11:30:00' },
  { id: 10, code: '20001', accountName: '示例华宇包装制品厂', accountNo: '6100112233440010', bankName: '演示光大银行', currency: 'CNY', status: 'disabled', remark: '合作暂停，账户冻结', createTime: '2026-03-25 15:00:00' },
]

const bankAccountStore: BankAccount[] = JSON.parse(JSON.stringify(mockBankAccountList))
let bankAccountNextId = bankAccountStore.length + 1

/** 分页获取银行账户列表 */
export function getBankAccountPage(params: {
  page: number
  pageSize: number
  keyword?: string
  currency?: Currency | ''
  status?: CommonStatus | ''
}): Promise<Result<{ list: BankAccount[]; total: number }>> {
  let filtered = [...bankAccountStore]
  if (params.currency) filtered = filtered.filter((b) => b.currency === params.currency)
  if (params.status) filtered = filtered.filter((b) => b.status === params.status)
  if (params.keyword) {
    filtered = filtered.filter((b) =>
      matchKeyword(params.keyword!, b.code, b.accountName, b.accountNo, b.bankName)
    )
  }
  filtered = sortByCodeDesc(filtered)
  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: filtered.slice(start, start + params.pageSize), total })
}

/** 根据 ID 获取银行账户 */
export function getBankAccountById(id: number): Promise<Result<BankAccount | undefined>> {
  return mockResponse(bankAccountStore.find((b) => b.id === id))
}

/** 新增银行账户 */
export function addBankAccount(data: BankAccountForm): Promise<Result<BankAccount>> {
  const exists = bankAccountStore.some((b) => b.code === data.code)
  if (exists) return Promise.reject(new Error('银行账户编号已存在'))
  const newAccount: BankAccount = {
    id: bankAccountNextId++,
    code: data.code,
    accountName: data.accountName,
    accountNo: data.accountNo,
    bankName: data.bankName,
    currency: data.currency,
    status: data.status,
    remark: data.remark,
    createTime: now(),
  }
  bankAccountStore.push(newAccount)
  return mockResponse(newAccount)
}

/** 更新银行账户 */
export function updateBankAccount(id: number, data: BankAccountForm): Promise<Result<BankAccount>> {
  const index = bankAccountStore.findIndex((b) => b.id === id)
  if (index === -1) return Promise.reject(new Error('银行账户不存在'))
  const exists = bankAccountStore.some((b) => b.id !== id && b.code === data.code)
  if (exists) return Promise.reject(new Error('银行账户编号已存在'))
  bankAccountStore[index] = { ...bankAccountStore[index], ...data }
  return mockResponse(bankAccountStore[index])
}

/** 删除银行账户 */
export function deleteBankAccount(id: number): Promise<Result<boolean>> {
  const index = bankAccountStore.findIndex((b) => b.id === id)
  if (index === -1) return Promise.reject(new Error('银行账户不存在'))
  bankAccountStore.splice(index, 1)
  return mockResponse(true)
}

/** 启用/停用银行账户 */
export function toggleBankAccountStatus(id: number): Promise<Result<BankAccount | undefined>> {
  const target = bankAccountStore.find((b) => b.id === id)
  if (!target) return Promise.reject(new Error('银行账户不存在'))
  target.status = target.status === 'enabled' ? 'disabled' : 'enabled'
  return mockResponse(target)
}

// ==================== 物流公司 ====================

export interface Logistics {
  id: number
  code: string
  name: string
  contact: string
  phone: string
  address: string
  status: CommonStatus
  remark: string
  createTime: string
}

export interface LogisticsForm {
  code: string
  name: string
  contact: string
  phone: string
  address: string
  status: CommonStatus
  remark: string
}

const mockLogisticsList: Logistics[] = [
  { id: 1, code: '30010', name: '示例顺达物流公司', contact: '小刘', phone: '13800003001', address: '江苏省南京市示例物流园1号库', status: 'enabled', remark: '华东干线运输主力', createTime: '2026-01-05 08:50:00' },
  { id: 2, code: '30009', name: '演示速通快递物流公司', contact: '小周', phone: '13900003002', address: '浙江省杭州市演示快递港8号', status: 'enabled', remark: '小件快递渠道', createTime: '2026-01-14 10:10:00' },
  { id: 3, code: '30008', name: '示例安捷货运物流公司', contact: '小刘', phone: '13700003003', address: '上海市示例保税区18号', status: 'enabled', remark: '空运及保税业务', createTime: '2026-01-23 13:30:00' },
  { id: 4, code: '30007', name: '演示鸿运整车物流公司', contact: '小周', phone: '13600003004', address: '山东省济南市演示货运市场3号', status: 'enabled', remark: '整车运输报价稳定', createTime: '2026-02-02 09:25:00' },
  { id: 5, code: '30006', name: '示例四海国际物流公司', contact: '小刘', phone: '13500003005', address: '广东省深圳市示例港区分拨中心', status: 'enabled', remark: '海运拼箱渠道', createTime: '2026-02-11 14:40:00' },
  { id: 6, code: '30005', name: '演示长风冷链物流公司', contact: '小周', phone: '13400003006', address: '湖北省武汉市演示冷链基地6号', status: 'disabled', remark: '冷链设备检修，暂停合作', createTime: '2026-02-19 16:00:00' },
  { id: 7, code: '30004', name: '示例捷诚同城配送公司', contact: '小刘', phone: '13300003007', address: '四川省成都市示例配送站12号', status: 'enabled', remark: '同城当日达', createTime: '2026-03-03 09:15:00' },
  { id: 8, code: '30003', name: '演示恒通大件物流公司', contact: '小周', phone: '13200003008', address: '河南省郑州市演示大件运输基地', status: 'enabled', remark: '大件设备运输', createTime: '2026-03-09 10:55:00' },
  { id: 9, code: '30002', name: '示例启明仓储物流公司', contact: '小刘', phone: '13100003009', address: '安徽省合肥市示例物流园2号', status: 'enabled', remark: '仓储+配送一体化', createTime: '2026-03-16 11:35:00' },
  { id: 10, code: '30001', name: '演示长岭铁运物流公司', contact: '小周', phone: '13000003010', address: '江西省南昌市演示铁运货场5号', status: 'enabled', remark: '铁路运输补充渠道', createTime: '2026-03-24 15:10:00' },
]

const logisticsStore: Logistics[] = JSON.parse(JSON.stringify(mockLogisticsList))
let logisticsNextId = logisticsStore.length + 1

/** 分页获取物流公司列表 */
export function getLogisticsPage(params: {
  page: number
  pageSize: number
  keyword?: string
  status?: CommonStatus | ''
}): Promise<Result<{ list: Logistics[]; total: number }>> {
  let filtered = [...logisticsStore]
  if (params.status) filtered = filtered.filter((l) => l.status === params.status)
  if (params.keyword) {
    filtered = filtered.filter((l) =>
      matchKeyword(params.keyword!, l.code, l.name, l.contact, l.phone, l.address)
    )
  }
  filtered = sortByCodeDesc(filtered)
  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: filtered.slice(start, start + params.pageSize), total })
}

/** 根据 ID 获取物流公司 */
export function getLogisticsById(id: number): Promise<Result<Logistics | undefined>> {
  return mockResponse(logisticsStore.find((l) => l.id === id))
}

/** 新增物流公司 */
export function addLogistics(data: LogisticsForm): Promise<Result<Logistics>> {
  const exists = logisticsStore.some((l) => l.code === data.code)
  if (exists) return Promise.reject(new Error('物流公司编号已存在'))
  const newLogistics: Logistics = {
    id: logisticsNextId++,
    code: data.code,
    name: data.name,
    contact: data.contact,
    phone: data.phone,
    address: data.address,
    status: data.status,
    remark: data.remark,
    createTime: now(),
  }
  logisticsStore.push(newLogistics)
  return mockResponse(newLogistics)
}

/** 更新物流公司 */
export function updateLogistics(id: number, data: LogisticsForm): Promise<Result<Logistics>> {
  const index = logisticsStore.findIndex((l) => l.id === id)
  if (index === -1) return Promise.reject(new Error('物流公司不存在'))
  const exists = logisticsStore.some((l) => l.id !== id && l.code === data.code)
  if (exists) return Promise.reject(new Error('物流公司编号已存在'))
  logisticsStore[index] = { ...logisticsStore[index], ...data }
  return mockResponse(logisticsStore[index])
}

/** 删除物流公司 */
export function deleteLogistics(id: number): Promise<Result<boolean>> {
  const index = logisticsStore.findIndex((l) => l.id === id)
  if (index === -1) return Promise.reject(new Error('物流公司不存在'))
  logisticsStore.splice(index, 1)
  return mockResponse(true)
}

/** 启用/停用物流公司 */
export function toggleLogisticsStatus(id: number): Promise<Result<Logistics | undefined>> {
  const target = logisticsStore.find((l) => l.id === id)
  if (!target) return Promise.reject(new Error('物流公司不存在'))
  target.status = target.status === 'enabled' ? 'disabled' : 'enabled'
  return mockResponse(target)
}

// ==================== 仓库 ====================

export type WarehouseType = 'finished' | 'material' | 'return'

export const warehouseTypeOptions: { label: string; value: WarehouseType }[] = [
  { label: '成品仓', value: 'finished' },
  { label: '原料仓', value: 'material' },
  { label: '退货仓', value: 'return' },
]

export const warehouseTypeLabelMap: Record<WarehouseType, string> = {
  finished: '成品仓',
  material: '原料仓',
  return: '退货仓',
}

export const warehouseTypeTagTypeMap: Record<WarehouseType, TagType> = {
  finished: 'primary',
  material: 'success',
  return: 'warning',
}

export interface Warehouse {
  id: number
  code: string
  name: string
  type: WarehouseType
  typeLabel: string
  address: string
  manager: string
  status: CommonStatus
  remark: string
  createTime: string
}

export interface WarehouseForm {
  code: string
  name: string
  type: WarehouseType
  address: string
  manager: string
  status: CommonStatus
  remark: string
}

const mockWarehouseList: Warehouse[] = [
  { id: 1, code: '40010', name: '示例成品一号仓', type: 'finished', typeLabel: '成品仓', address: '江苏省南京市示例产业园A1栋', manager: '小刘', status: 'enabled', remark: '主要成品发货仓', createTime: '2026-01-04 09:00:00' },
  { id: 2, code: '40009', name: '示例成品二号仓', type: 'finished', typeLabel: '成品仓', address: '江苏省南京市示例产业园A2栋', manager: '小周', status: 'enabled', remark: '大促备用仓', createTime: '2026-01-11 10:20:00' },
  { id: 3, code: '40008', name: '示例原料主仓', type: 'material', typeLabel: '原料仓', address: '江苏省苏州市示例原料基地B1栋', manager: '小刘', status: 'enabled', remark: '大宗原料存储', createTime: '2026-01-19 14:00:00' },
  { id: 4, code: '40007', name: '演示原料化工仓', type: 'material', typeLabel: '原料仓', address: '安徽省芜湖市演示化工园区C区', manager: '小周', status: 'enabled', remark: '危化品单独存放', createTime: '2026-01-28 09:35:00' },
  { id: 5, code: '40006', name: '示例退货处理仓', type: 'return', typeLabel: '退货仓', address: '上海市示例售后中心1号库', manager: '小刘', status: 'enabled', remark: '退货质检与翻新', createTime: '2026-02-05 15:10:00' },
  { id: 6, code: '40005', name: '演示退货暂存仓', type: 'return', typeLabel: '退货仓', address: '广东省东莞市演示售后仓3号', manager: '小周', status: 'disabled', remark: '系统切换，暂时停用', createTime: '2026-02-14 10:45:00' },
  { id: 7, code: '40004', name: '示例成品中转仓', type: 'finished', typeLabel: '成品仓', address: '湖北省武汉市演示物流港7号', manager: '小刘', status: 'enabled', remark: '华中区域中转', createTime: '2026-02-22 13:20:00' },
  { id: 8, code: '40003', name: '示例原料五金仓', type: 'material', typeLabel: '原料仓', address: '山东省青岛市示例五金城9号', manager: '小周', status: 'enabled', remark: '', createTime: '2026-03-04 09:05:00' },
  { id: 9, code: '40002', name: '演示成品电商仓', type: 'finished', typeLabel: '成品仓', address: '福建省厦门市演示电商产业园2栋', manager: '小刘', status: 'enabled', remark: '电商订单专仓', createTime: '2026-03-12 14:30:00' },
  { id: 10, code: '40001', name: '示例原料辅料仓', type: 'material', typeLabel: '原料仓', address: '江苏省南通市示例辅料市场11号', manager: '小周', status: 'enabled', remark: '辅料与包材', createTime: '2026-03-20 16:20:00' },
]

const warehouseStore: Warehouse[] = JSON.parse(JSON.stringify(mockWarehouseList))
let warehouseNextId = warehouseStore.length + 1

/** 分页获取仓库列表 */
export function getWarehousePage(params: {
  page: number
  pageSize: number
  keyword?: string
  type?: WarehouseType | ''
  status?: CommonStatus | ''
}): Promise<Result<{ list: Warehouse[]; total: number }>> {
  let filtered = [...warehouseStore]
  if (params.type) filtered = filtered.filter((w) => w.type === params.type)
  if (params.status) filtered = filtered.filter((w) => w.status === params.status)
  if (params.keyword) {
    filtered = filtered.filter((w) =>
      matchKeyword(params.keyword!, w.code, w.name, w.address, w.manager)
    )
  }
  filtered = sortByCodeDesc(filtered)
  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  return mockResponse({ list: filtered.slice(start, start + params.pageSize), total })
}

/** 根据 ID 获取仓库 */
export function getWarehouseById(id: number): Promise<Result<Warehouse | undefined>> {
  return mockResponse(warehouseStore.find((w) => w.id === id))
}

/** 新增仓库 */
export function addWarehouse(data: WarehouseForm): Promise<Result<Warehouse>> {
  const exists = warehouseStore.some((w) => w.code === data.code)
  if (exists) return Promise.reject(new Error('仓库编号已存在'))
  const newWarehouse: Warehouse = {
    id: warehouseNextId++,
    code: data.code,
    name: data.name,
    type: data.type,
    typeLabel: warehouseTypeLabelMap[data.type],
    address: data.address,
    manager: data.manager,
    status: data.status,
    remark: data.remark,
    createTime: now(),
  }
  warehouseStore.push(newWarehouse)
  return mockResponse(newWarehouse)
}

/** 更新仓库 */
export function updateWarehouse(id: number, data: WarehouseForm): Promise<Result<Warehouse>> {
  const index = warehouseStore.findIndex((w) => w.id === id)
  if (index === -1) return Promise.reject(new Error('仓库不存在'))
  const exists = warehouseStore.some((w) => w.id !== id && w.code === data.code)
  if (exists) return Promise.reject(new Error('仓库编号已存在'))
  warehouseStore[index] = {
    ...warehouseStore[index],
    ...data,
    typeLabel: warehouseTypeLabelMap[data.type],
  }
  return mockResponse(warehouseStore[index])
}

/** 删除仓库 */
export function deleteWarehouse(id: number): Promise<Result<boolean>> {
  const index = warehouseStore.findIndex((w) => w.id === id)
  if (index === -1) return Promise.reject(new Error('仓库不存在'))
  warehouseStore.splice(index, 1)
  return mockResponse(true)
}

/** 启用/停用仓库 */
export function toggleWarehouseStatus(id: number): Promise<Result<Warehouse | undefined>> {
  const target = warehouseStore.find((w) => w.id === id)
  if (!target) return Promise.reject(new Error('仓库不存在'))
  target.status = target.status === 'enabled' ? 'disabled' : 'enabled'
  return mockResponse(target)
}
