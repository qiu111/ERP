import type { Result } from '@/http'
import { mockResponse } from '@/mock'

export interface CompanyItem {
  id: number
  companyName: string
  companyShortName: string
  bankName: string
  bankAccount: string
  phone: string
  fax: string
  companyAddress: string
  legalRepresentative?: string
  signer?: string
  invoiceType?: string
  invoiceUnitName?: string
  taxId?: string
  invoiceAddress?: string
  invoicePhone?: string
  invoiceBank?: string
  invoiceBankAccount?: string
  payeeName?: string
  payeePhone?: string
  payeeAddress?: string
  remark?: string
}

export const mockCompanyList: CompanyItem[] = [
  { id: 7, companyName: 'A公司', companyShortName: 'A公司/工行/人民币/9296', bankName: '测试地址某路支行', bankAccount: '1001210009324879296', phone: '021-62990223', fax: '021-62770224', companyAddress: '测试地址' },
  { id: 8, companyName: 'B公司', companyShortName: 'B公司/农行/人民币/1708', bankName: '测试地址某支行', bankAccount: '03394000040031708', phone: '021-62990223', fax: '021-62770224', companyAddress: '测试地址' },
  { id: 9, companyName: 'B公司', companyShortName: 'B公司/B城市/人民币/0480', bankName: '测试地址某支行', bankAccount: '70120122000160480', phone: '021-62990223', fax: '021-62770224', companyAddress: '测试地址' },
  { id: 10, companyName: 'A公司', companyShortName: 'A公司/B城市/人民币/1310', bankName: 'B测试地址某', bankAccount: '70120122000101310', phone: '021-62990223', fax: '021-62770224', companyAddress: '测试地址' },
  { id: 11, companyName: 'A公司', companyShortName: 'A公司/B城市/美金/8018', bankName: 'Bank of Ningbo（A公司）', bankAccount: '70122029000008018', phone: '021-62990223', fax: '021-62770224', companyAddress: '测试地址' },
  { id: 12, companyName: 'B公司', companyShortName: 'B公司/B城市/美金/4546', bankName: 'Bank of Ningbo', bankAccount: '70122025000014546', phone: '021-62990223', fax: '021-62770224', companyAddress: '测试地址' },
  { id: 13, companyName: 'A公司', companyShortName: 'A公司/工行/美金/7784', bankName: 'Industrial and Commercial Bank of China Limited Shanghai Changshou Road Sub-branch.', bankAccount: '1001210039145017784', phone: '021-62990223', fax: '021-62770224', companyAddress: '测试地址' },
  { id: 14, companyName: 'A公司', companyShortName: 'A公司/工行/欧元/4359', bankName: 'Industrial and Commercial Bank of China Limited Shanghai Changshou Road Sub-branch.', bankAccount: '1001210039385004359', phone: '021-62990223', fax: '021-62770224', companyAddress: '测试地址' },
  { id: 15, companyName: 'A公司', companyShortName: 'A公司/工行/港币/1225', bankName: 'Industrial and Commercial Bank of China Limited Shanghai Changshou Road Sub-branch.', bankAccount: '1001210039135001225', phone: '021-62990223', fax: '021-62770224', companyAddress: '测试地址' },
  { id: 16, companyName: 'A公司', companyShortName: 'A公司/工行（离岸账户）/美元/5100', bankName: 'BANK OF COMMUNICATIONS CO.,LTD OFFSHORE BANKING UNIT', bankAccount: 'OSA90000264925100', phone: '021-62990223', fax: '021-62770224', companyAddress: '测试地址' },
]

let companyStore: CompanyItem[] = JSON.parse(JSON.stringify(mockCompanyList))

export function getCompanyPage(params: {
  page: number
  pageSize: number
  keyword?: string
}): Promise<Result<{ list: CompanyItem[]; total: number }>> {
  let filtered = [...companyStore]

  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = filtered.filter(
      (c) =>
        c.companyName.toLowerCase().includes(kw) ||
        c.companyShortName.toLowerCase().includes(kw)
    )
  }

  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  const list = filtered.slice(start, start + params.pageSize)
  return mockResponse({ list, total })
}

export function addCompany(data: Omit<CompanyItem, 'id'> & { id?: number }): Promise<Result<CompanyItem>> {
  const newId = Math.max(...companyStore.map((c) => c.id)) + 1
  const newCompany: CompanyItem = {
    id: data.id || newId,
    companyName: data.companyName || '',
    companyShortName: data.companyShortName || '',
    bankName: data.bankName || '',
    bankAccount: data.bankAccount || '',
    phone: data.phone || '',
    fax: data.fax || '',
    companyAddress: data.companyAddress || '',
    legalRepresentative: data.legalRepresentative || '',
    signer: data.signer || '',
    invoiceType: data.invoiceType || '',
    invoiceUnitName: data.invoiceUnitName || '',
    taxId: data.taxId || '',
    invoiceAddress: data.invoiceAddress || '',
    invoicePhone: data.invoicePhone || '',
    invoiceBank: data.invoiceBank || '',
    invoiceBankAccount: data.invoiceBankAccount || '',
    payeeName: data.payeeName || '',
    payeePhone: data.payeePhone || '',
    payeeAddress: data.payeeAddress || '',
    remark: data.remark || '',
  }
  companyStore.push(newCompany)
  return mockResponse(newCompany, '添加成功')
}

export function updateCompany(id: number, data: Partial<CompanyItem>): Promise<Result<CompanyItem>> {
  const idx = companyStore.findIndex((c) => c.id === id)
  if (idx >= 0) {
    companyStore[idx] = { ...companyStore[idx], ...data, id }
    return mockResponse(companyStore[idx], '更新成功')
  }
  return mockResponse({} as CompanyItem, '未找到该公司信息')
}

export function deleteCompany(id: number): Promise<Result<void>> {
  const idx = companyStore.findIndex((c) => c.id === id)
  if (idx >= 0) {
    companyStore.splice(idx, 1)
    return mockResponse(undefined, '删除成功')
  }
  return mockResponse(undefined, '未找到该公司信息')
}
