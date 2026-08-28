// src/mock/announcement.ts
// 公告列表 Mock 数据层（全部脱敏虚构）
import type { Result } from '@/http'
import { mockResponse } from '@/mock'

// ======== 类型 ========

/** 公告明细结构 */
export interface AnnouncementItem {
  id: string
  code: number
  title: string             // 标题
  content: string           // 内容（HTML，富文本）
  viewers: string[]         // 查看选择人（可查看人员，脱敏纯中文）
  attachments: string[]     // 附件文件名（Mock 仅存名称）
  remark?: string           // 备注 ≤225 字
  operator: string          // 操作人（发布人）
  operateTime: string       // 操作时间 YYYY-MM-DD HH:mm
}

/** 分页查询参数 */
export interface AnnouncementPageParams {
  page: number
  pageSize: number
  operator?: string         // 发布人
  date?: string             // 选择日期 YYYY-MM-DD（按操作时间日期匹配）
  keyword?: string          // 关键字（标题/内容/备注）
}

/** 虚构人员选项池（脱敏纯中文） */
const PEOPLE = ['超级管理员', '小戴', '小陈', '小北', '小白', '小安', '白主管']
export const operatorOptions: { label: string; value: string }[] = PEOPLE.map((n) => ({ label: n, value: n }))
export const viewerOptions: { label: string; value: string }[] = PEOPLE.map((n) => ({ label: n, value: n }))

// ======== 工具函数 ========

function pad0(n: number): string { return n < 10 ? `0${n}` : `${n}` }
function nowFull(): string {
  const n = new Date()
  return `${n.getFullYear()}-${pad0(n.getMonth() + 1)}-${pad0(n.getDate())} ${pad0(n.getHours())}:${pad0(n.getMinutes())}`
}

// ======== 初始化数据（脱敏） ========

const CONTENT_POOL = [
  `<p><strong>各位示例同事（演示内容）：</strong></p>
<p>为优化演示系统体验，虚拟平台将于本周期内进行示例升级维护，届时相关功能短暂不可用，请提前安排工作。</p>
<p><em>如有疑问请联系演示管理员。</em></p>`,

  `<p>各部门（示例场景）：</p>
<p>兹定于本周召开虚拟月度经营例会，请各位按演示议程准备材料并准时参加。</p>`,

  `<p>示例放假安排通知（演示数据）：</p>
<p>根据虚拟节假日安排，示例假期调休方案详见附件，请各部门做好演示值班安排。</p>`,
]

const RAW_INIT: Omit<AnnouncementItem, 'id'>[] = [
  {
    code: 7,
    title: '示例系统升级维护通知（演示数据）',
    content: CONTENT_POOL[0],
    viewers: ['超级管理员', '小戴', '小陈', '小北', '小白', '小安', '白主管'],
    attachments: ['示例维护计划.pdf', '演示升级清单.xlsx'],
    remark: '维护窗口预计两小时（示例备注）',
    operator: '超级管理员',
    operateTime: '2026-08-27 18:58',
  },
  {
    code: 6,
    title: '演示月度经营例会安排（示例公告）',
    content: CONTENT_POOL[1],
    viewers: ['超级管理员', '小戴', '白主管'],
    attachments: ['演示议程.docx'],
    remark: '',
    operator: '超级管理员',
    operateTime: '2026-08-25 10:30',
  },
  {
    code: 5,
    title: '虚拟节假日放假安排通知（演示场景）',
    content: CONTENT_POOL[2],
    viewers: ['超级管理员', '小陈', '小白', '小安'],
    attachments: [],
    remark: '请提前报备示例值班人员',
    operator: '小戴',
    operateTime: '2026-08-20 09:15',
  },
  {
    code: 4,
    title: '示例信息安全培训报名通知（演示数据）',
    content: CONTENT_POOL[1],
    viewers: ['超级管理员', '小北'],
    attachments: ['示例培训大纲.pdf'],
    remark: '',
    operator: '小北',
    operateTime: '2026-08-15 14:20',
  },
  {
    code: 3,
    title: '演示办公用品领用调整公告（示例数据）',
    content: CONTENT_POOL[1],
    viewers: ['超级管理员', '小白'],
    attachments: [],
    remark: '',
    operator: '小白',
    operateTime: '2026-08-10 16:45',
  },
  {
    code: 2,
    title: '示例访客接待流程更新通知（演示数据）',
    content: CONTENT_POOL[0],
    viewers: ['超级管理员', '小戴', '小陈', '白主管'],
    attachments: ['示例接待流程.png'],
    remark: '替代旧版流程（演示说明）',
    operator: '超级管理员',
    operateTime: '2026-08-05 11:05',
  },
  {
    code: 1,
    title: '虚拟考勤制度修订公告（演示场景）',
    content: CONTENT_POOL[2],
    viewers: ['超级管理员', '小安'],
    attachments: [],
    remark: '',
    operator: '小安',
    operateTime: '2026-07-28 10:51',
  },
]

let _codeSeq = Math.max(...RAW_INIT.map((r) => r.code)) + 1
const store: AnnouncementItem[] = RAW_INIT.map((r, i) => ({
  ...r,
  id: `AN_${Date.now()}_${i + 1}`,
}))

// ======== 对外接口 ========

/** 分页查询 */
export async function getAnnouncementPage(params: AnnouncementPageParams): Promise<Result<{ list: AnnouncementItem[]; total: number }>> {
  let rows = [...store]
  if (params.operator) rows = rows.filter((r) => r.operator === params.operator)
  if (params.date) rows = rows.filter((r) => r.operateTime.slice(0, 10) === params.date)
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
  return mockResponse({
    list: rows.slice(start, start + params.pageSize),
    total,
  })
}

/** 详情 */
export async function getAnnouncementById(id: string): Promise<Result<AnnouncementItem>> {
  const item = store.find((r) => r.id === id)
  return mockResponse(item || ({} as AnnouncementItem))
}

/** 新增 */
export async function createAnnouncement(payload: Partial<AnnouncementItem> & Pick<AnnouncementItem, 'title' | 'content'>): Promise<Result<AnnouncementItem>> {
  const newItem: AnnouncementItem = {
    id: `AN_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    code: _codeSeq++,
    title: payload.title,
    content: payload.content,
    viewers: payload.viewers || [],
    attachments: payload.attachments || [],
    remark: payload.remark,
    operator: payload.operator || PEOPLE[0],
    operateTime: payload.operateTime || nowFull(),
  }
  store.unshift(newItem)
  return mockResponse(newItem)
}

/** 修改 */
export async function updateAnnouncement(id: string, payload: Partial<AnnouncementItem>): Promise<Result<AnnouncementItem>> {
  const idx = store.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse({} as AnnouncementItem)
  // 编辑后更新操作人与操作时间
  store[idx] = {
    ...store[idx],
    ...payload,
    operator: payload.operator || PEOPLE[0],
    operateTime: payload.operateTime || nowFull(),
  }
  return mockResponse(store[idx])
}

/** 删除 */
export async function deleteAnnouncement(id: string): Promise<Result<boolean>> {
  const idx = store.findIndex((r) => r.id === id)
  if (idx === -1) return mockResponse(false)
  store.splice(idx, 1)
  return mockResponse(true)
}
