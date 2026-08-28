// src/mock/menu.ts
// 菜单/功能 mock 数据 — 左侧导航与功能管理的唯一数据源
// 结构对齐 src/utils/dynamicRoutes.ts 的 BackendFunction
import type { BackendFunction } from '@/utils/dynamicRoutes'

function item(partial: Partial<BackendFunction> & {
  id: string
  pid: string
  text: string
  function_code: string
  url: string
}): BackendFunction {
  return {
    function_id: partial.id,
    function_name: partial.text,
    function_url: partial.url,
    function_pid: partial.pid,
    group_code: partial.group_code ?? 'sys',
    function_code: partial.function_code,
    function_type: partial.function_type ?? 'menu',
    function_icon: partial.function_icon ?? partial.iconCls ?? '',
    function_order: partial.function_order ?? '0',
    add_user: partial.add_user ?? 'admin',
    status: partial.status ?? '1',
    update_time: partial.update_time ?? '',
    add_time: partial.add_time ?? '',
    memo: partial.memo ?? '',
    id: partial.id,
    pid: partial.pid,
    text: partial.text,
    iconCls: partial.iconCls ?? partial.function_icon ?? '',
    url: partial.url,
    state: partial.state ?? 'open',
  }
}

export const mockMenuList: BackendFunction[] = [
  // ===== 门户 =====
  item({ id: '101', pid: '0', text: '门户', function_code: 'portal', url: '/portal', function_icon: 'Monitor', group_code: 'portal' }),
  item({ id: '10101', pid: '101', text: '个人门户', function_code: 'my_center', url: '/dashboard', function_icon: 'House', group_code: 'portal' }),
  item({ id: '10102', pid: '101', text: '企业门户', function_code: 'main', url: '/portal/enterprise', function_icon: 'OfficeBuilding', group_code: 'portal' }),

  // ===== OA办公平台 =====
  item({ id: '200', pid: '0', text: 'OA办公平台', function_code: 'oa', url: '/oa', function_icon: 'OfficeBuilding', group_code: 'oa' }),
  // 日志管理
  item({ id: '2001', pid: '200', text: '日志管理', function_code: 'oa_log', url: '/oa/log', function_icon: 'Document', group_code: 'oa' }),
  item({ id: '20011', pid: '2001', text: '工作日志', function_code: 'oa_log_work', url: '/oa/log/work', function_icon: 'Edit', group_code: 'oa' }),
  item({ id: '20012', pid: '2001', text: '日志审核', function_code: 'oa_log_audit', url: '/oa/log/audit', function_icon: 'View', group_code: 'oa' }),
  // 工作计划管理
  item({ id: '2003', pid: '200', text: '工作计划管理', function_code: 'oa_plan', url: '/oa/plan', function_icon: 'Calendar', group_code: 'oa' }),
  item({ id: '20031', pid: '2003', text: '我的工作计划', function_code: 'oa_plan_mine', url: '/oa/plan/mine', function_icon: 'User', group_code: 'oa' }),
  item({ id: '20032', pid: '2003', text: '我安排的工作', function_code: 'oa_plan_assigned', url: '/oa/plan/assigned', function_icon: 'User', group_code: 'oa' }),
  item({ id: '20033', pid: '2003', text: '部门工作计划', function_code: 'oa_plan_dept', url: '/oa/plan/dept', function_icon: 'OfficeBuilding', group_code: 'oa' }),
  // 必做任务
  item({ id: '2004', pid: '200', text: '必做任务', function_code: 'oa_required_task', url: '/oa/required-task', function_icon: 'Bell', group_code: 'oa' }),
  // 审批管理 (OA下)
  item({ id: '2005', pid: '200', text: '审批管理', function_code: 'oa_approval', url: '/oa/approval', function_icon: 'Stamp', group_code: 'oa' }),
  item({ id: '20051', pid: '2005', text: '待我审批', function_code: 'oa_approval_todo', url: '/oa/approval/todo', function_icon: 'Clock', group_code: 'oa' }),
  item({ id: '20052', pid: '2005', text: '审批模板管理', function_code: 'oa_approval_template', url: '/oa/approval/template', function_icon: 'Document', group_code: 'oa' }),
  item({ id: '20053', pid: '2005', text: '我发起的审批', function_code: 'oa_approval_initiated', url: '/oa/approval/initiated', function_icon: 'Promotion', group_code: 'oa' }),
  item({ id: '20054', pid: '2005', text: '我参与的审批', function_code: 'oa_approval_involved', url: '/oa/approval/involved', function_icon: 'User', group_code: 'oa' }),
  // 接待管理
  item({ id: '2006', pid: '200', text: '接待管理', function_code: 'oa_reception', url: '/oa/reception', function_icon: 'User', group_code: 'oa' }),
  item({ id: '20061', pid: '2006', text: '待我审批接待', function_code: 'oa_reception_todo', url: '/oa/reception/todo', function_icon: 'Clock', group_code: 'oa' }),
  item({ id: '20062', pid: '2006', text: '我发起的接待', function_code: 'oa_reception_initiated', url: '/oa/reception/initiated', function_icon: 'Promotion', group_code: 'oa' }),
  // 公告管理
  item({ id: '2007', pid: '200', text: '公告管理', function_code: 'oa_notice', url: '/oa/notice', function_icon: 'Bell', group_code: 'oa' }),
  item({ id: '20071', pid: '2007', text: '公告列表', function_code: 'oa_notice_list', url: '/oa/notice/list', function_icon: 'List', group_code: 'oa' }),
  // 备忘录管理
  item({ id: '2008', pid: '200', text: '备忘录管理', function_code: 'oa_memo', url: '/oa/memo', function_icon: 'Notebook', group_code: 'oa' }),
  // 工作交接管理
  item({ id: '2009', pid: '200', text: '工作交接管理', function_code: 'oa_handover', url: '/oa/handover', function_icon: 'SwitchButton', group_code: 'oa' }),
  item({ id: '20091', pid: '2009', text: '工作交接列表', function_code: 'oa_handover_list', url: '/oa/handover/list', function_icon: 'List', group_code: 'oa' }),
  // 公文收发
  item({ id: '2010', pid: '200', text: '公文收发', function_code: 'oa_document', url: '/oa/document', function_icon: 'Document', group_code: 'oa' }),
  item({ id: '20101', pid: '2010', text: '发起公文', function_code: 'oa_document_create', url: '/oa/document/create', function_icon: 'Edit', group_code: 'oa' }),
  item({ id: '20102', pid: '2010', text: '公文收件箱', function_code: 'oa_document_inbox', url: '/oa/document/inbox', function_icon: 'Message', group_code: 'oa' }),
  item({ id: '20103', pid: '2010', text: '待发公文', function_code: 'oa_document_pending', url: '/oa/document/pending', function_icon: 'Clock', group_code: 'oa' }),
  item({ id: '20104', pid: '2010', text: '我发起的公文', function_code: 'oa_document_initiated', url: '/oa/document/initiated', function_icon: 'Promotion', group_code: 'oa' }),
  item({ id: '20105', pid: '2010', text: '待我处理公文', function_code: 'oa_document_todo', url: '/oa/document/todo', function_icon: 'Clock', group_code: 'oa' }),
  item({ id: '20106', pid: '2010', text: '已处理公文', function_code: 'oa_document_done', url: '/oa/document/done', function_icon: 'CircleCheck', group_code: 'oa' }),
  item({ id: '20107', pid: '2010', text: '投票管理', function_code: 'oa_document_vote', url: '/oa/document/vote', function_icon: 'Finished', group_code: 'oa' }),

  // ===== ERP进销存 =====
  item({ id: '300', pid: '0', text: 'ERP进销存', function_code: 'erp', url: '/erp', function_icon: 'Goods', group_code: 'erp' }),
  // 采购管理
  item({ id: '3001', pid: '300', text: '采购管理', function_code: 'erp_purchase', url: '/erp/purchase', function_icon: 'ShoppingCart', group_code: 'erp' }),
  item({ id: '30011', pid: '3001', text: '采购订单', function_code: 'erp_purchase_order', url: '/erp/purchase/order', function_icon: 'List', group_code: 'erp' }),
  item({ id: '30012', pid: '3001', text: '采购收货', function_code: 'erp_purchase_receive', url: '/erp/purchase/receive', function_icon: 'Download', group_code: 'erp' }),
  item({ id: '30013', pid: '3001', text: '退货返厂', function_code: 'erp_purchase_return', url: '/erp/purchase/return', function_icon: 'RefreshLeft', group_code: 'erp' }),
  item({ id: '30014', pid: '3001', text: '合同条款', function_code: 'erp_purchase_contract_terms', url: '/erp/purchase/contract-terms', function_icon: 'Document', group_code: 'erp' }),
  item({ id: '30015', pid: '3001', text: '外贸出货', function_code: 'erp_purchase_export', url: '/erp/purchase/export', function_icon: 'Van', group_code: 'erp' }),
  // 销售管理
  item({ id: '3002', pid: '300', text: '销售管理', function_code: 'erp_sale', url: '/erp/sale', function_icon: 'Sell', group_code: 'erp' }),
  item({ id: '30021', pid: '3002', text: '外销PI', function_code: 'erp_sale_pi', url: '/erp/sale/pi', function_icon: 'Document', group_code: 'erp' }),
  item({ id: '30022', pid: '3002', text: '销售订单', function_code: 'erp_sale_order', url: '/erp/sale/order', function_icon: 'List', group_code: 'erp' }),
  item({ id: '30023', pid: '3002', text: '销售出库', function_code: 'erp_sale_delivery', url: '/erp/sale/outbound', function_icon: 'Upload', group_code: 'erp' }),
  item({ id: '30024', pid: '3002', text: '销售退货', function_code: 'erp_sale_return', url: '/erp/sale/return', function_icon: 'RefreshLeft', group_code: 'erp' }),
  // 库存管理
  item({ id: '3003', pid: '300', text: '库存管理', function_code: 'erp_stock', url: '/erp/stock', function_icon: 'Box', group_code: 'erp' }),
  item({ id: '30031', pid: '3003', text: '商品库存汇总', function_code: 'erp_stock_summary', url: '/erp/stock/summary', function_icon: 'DataAnalysis', group_code: 'erp' }),
  item({ id: '30032', pid: '3003', text: '仓库商品明细', function_code: 'erp_stock_detail', url: '/erp/stock/detail', function_icon: 'Tickets', group_code: 'erp' }),
  item({ id: '30033', pid: '3003', text: '库存调整', function_code: 'erp_stock_adjust', url: '/erp/stock/adjust', function_icon: 'Edit', group_code: 'erp' }),
  item({ id: '30034', pid: '3003', text: '库存调拨', function_code: 'erp_stock_transfer', url: '/erp/stock/transfer', function_icon: 'Sort', group_code: 'erp' }),
  item({ id: '30035', pid: '3003', text: '库存盘点', function_code: 'erp_stock_check', url: '/erp/stock/check', function_icon: 'Finished', group_code: 'erp' }),
  item({ id: '30036', pid: '3003', text: '库存差异查询', function_code: 'erp_stock_diff', url: '/erp/stock/diff', function_icon: 'Search', group_code: 'erp' }),
  item({ id: '30037', pid: '3003', text: '库存预警设置', function_code: 'erp_stock_warning', url: '/erp/stock/warning', function_icon: 'Warning', group_code: 'erp' }),
  // 代理商要货管理
  item({ id: '3004', pid: '300', text: '代理商要货管理', function_code: 'erp_agent', url: '/erp/agent', function_icon: 'User', group_code: 'erp' }),
  item({ id: '30041', pid: '3004', text: '代理商要货单', function_code: 'erp_agent_order', url: '/erp/agent/order', function_icon: 'List', group_code: 'erp' }),
  item({ id: '30042', pid: '3004', text: '代理商出库单', function_code: 'erp_agent_outbound', url: '/erp/agent/outbound', function_icon: 'Upload', group_code: 'erp' }),
  item({ id: '30043', pid: '3004', text: '代理商退货单', function_code: 'erp_agent_return', url: '/erp/agent/return', function_icon: 'RefreshLeft', group_code: 'erp' }),
  // 商品管理 (ERP下)
  item({ id: '3005', pid: '300', text: '商品管理', function_code: 'erp_goods', url: '/erp/goods', function_icon: 'Goods', group_code: 'erp' }),
  item({ id: '30051', pid: '3005', text: '自采商品管理', function_code: 'erp_goods_self', url: '/erp/goods/self', function_icon: 'Goods', group_code: 'erp' }),
  item({ id: '30052', pid: '3005', text: '第三方商品管理', function_code: 'erp_goods_third', url: '/erp/goods/third', function_icon: 'Goods', group_code: 'erp' }),
  item({ id: '30053', pid: '3005', text: '代理商商品管理', function_code: 'erp_goods_agent', url: '/erp/goods/agent', function_icon: 'Goods', group_code: 'erp' }),
  item({ id: '30054', pid: '3005', text: '商品分类管理', function_code: 'erp_goods_category', url: '/erp/goods/category', function_icon: 'Menu', group_code: 'erp' }),
  item({ id: '30055', pid: '3005', text: '商品模型管理', function_code: 'erp_goods_model', url: '/erp/goods/model', function_icon: 'Grid', group_code: 'erp' }),
  item({ id: '30056', pid: '3005', text: '商品规格管理', function_code: 'erp_goods_spec', url: '/erp/goods/spec', function_icon: 'CopyDocument', group_code: 'erp' }),
  item({ id: '30057', pid: '3005', text: '商品属性管理', function_code: 'erp_goods_attribute', url: '/erp/goods/attribute', function_icon: 'Collection', group_code: 'erp' }),
  item({ id: '30058', pid: '3005', text: '商品品牌管理', function_code: 'erp_goods_brand', url: '/erp/goods/brand', function_icon: 'Medal', group_code: 'erp' }),
  // 合同管理
  item({ id: '3006', pid: '300', text: '合同管理', function_code: 'erp_contract', url: '/erp/contract', function_icon: 'Document', group_code: 'erp' }),
  item({ id: '30061', pid: '3006', text: '外销合同条款', function_code: 'erp_contract_export_terms', url: '/erp/contract/export-terms', function_icon: 'Document', group_code: 'erp' }),
  item({ id: '30062', pid: '3006', text: '采购合同', function_code: 'erp_contract_purchase', url: '/erp/contract/purchase', function_icon: 'Document', group_code: 'erp' }),
  item({ id: '30063', pid: '3006', text: '合同收录', function_code: 'erp_contract_record', url: '/erp/contract/record', function_icon: 'Folder', group_code: 'erp' }),
  item({ id: '30064', pid: '3006', text: '内销合同条款', function_code: 'erp_contract_domestic_terms', url: '/erp/contract/domestic-terms', function_icon: 'Document', group_code: 'erp' }),
  item({ id: '30065', pid: '3006', text: '采购合同条款', function_code: 'erp_contract_purchase_terms', url: '/erp/contract/purchase-terms', function_icon: 'Document', group_code: 'erp' }),
  item({ id: '30066', pid: '3006', text: '合同列表', function_code: 'erp_contract_list', url: '/erp/contract/list', function_icon: 'List', group_code: 'erp' }),
  // 基本信息管理
  item({ id: '3007', pid: '300', text: '基本信息管理', function_code: 'erp_base', url: '/erp/base', function_icon: 'Files', group_code: 'erp' }),
  item({ id: '30071', pid: '3007', text: '供应商管理', function_code: 'erp_base_supplier', url: '/erp/base/supplier', function_icon: 'User', group_code: 'erp' }),
  item({ id: '30072', pid: '3007', text: '常用银行帐户管理', function_code: 'erp_base_bank', url: '/erp/base/bank', function_icon: 'Wallet', group_code: 'erp' }),
  item({ id: '30073', pid: '3007', text: '物流公司管理', function_code: 'erp_base_logistics', url: '/erp/base/logistics', function_icon: 'Van', group_code: 'erp' }),
  item({ id: '30074', pid: '3007', text: '仓库列表', function_code: 'erp_base_warehouse', url: '/erp/base/warehouse', function_icon: 'Box', group_code: 'erp' }),

  // ===== 审批管理 =====
  item({ id: '400', pid: '0', text: '审批管理', function_code: 'approval', url: '/approval', function_icon: 'Stamp', group_code: 'approval' }),
  item({ id: '4001', pid: '400', text: '待我审批', function_code: 'approval_todo', url: '/approval/todo', function_icon: 'Clock', group_code: 'approval' }),
  item({ id: '4002', pid: '400', text: '我发起的审批', function_code: 'approval_initiated', url: '/approval/initiated', function_icon: 'Promotion', group_code: 'approval' }),
  item({ id: '4003', pid: '400', text: '我参与的审批', function_code: 'approval_involved', url: '/approval/involved', function_icon: 'User', group_code: 'approval' }),
  item({ id: '4004', pid: '400', text: '审批列表', function_code: 'approval_list', url: '/approval/list', function_icon: 'List', group_code: 'approval' }),

  // ===== CRM客户管理 =====
  item({ id: '500', pid: '0', text: 'CRM客户管理', function_code: 'crm', url: '/crm', function_icon: 'UserFilled', group_code: 'crm' }),
  item({ id: '5001', pid: '500', text: '客户来源', function_code: 'crm_source', url: '/crm/source', function_icon: 'Connection', group_code: 'crm' }),
  item({ id: '5002', pid: '500', text: '客户管理', function_code: 'crm_customer', url: '/crm/customer', function_icon: 'User', group_code: 'crm' }),
  item({ id: '5003', pid: '500', text: '商机管理', function_code: 'crm_opportunity', url: '/crm/opportunity', function_icon: 'Flag', group_code: 'crm' }),

  // ===== HR人力资源 =====
  item({ id: '600', pid: '0', text: 'HR人力资源', function_code: 'hr', url: '/hr', function_icon: 'User', group_code: 'hr' }),
  item({ id: '6001', pid: '600', text: '组织架构图管理', function_code: 'hr_organization', url: '/hr/organization', function_icon: 'Share', group_code: 'hr' }),
  item({ id: '6002', pid: '600', text: '岗位管理', function_code: 'hr_position', url: '/hr/position', function_icon: 'Medal', group_code: 'hr' }),
  item({ id: '6003', pid: '600', text: '员工管理', function_code: 'hr_employee', url: '/hr/employee', function_icon: 'UserFilled', group_code: 'hr' }),
  // 招聘管理
  item({ id: '6004', pid: '600', text: '招聘管理', function_code: 'hr_recruit', url: '/hr/recruit', function_icon: 'User', group_code: 'hr' }),
  item({ id: '60041', pid: '6004', text: '招聘管理', function_code: 'hr_recruit_list', url: '/hr/recruit/list', function_icon: 'List', group_code: 'hr' }),
  item({ id: '60042', pid: '6004', text: '招聘来源', function_code: 'hr_recruit_source', url: '/hr/recruit/source', function_icon: 'Connection', group_code: 'hr' }),
  item({ id: '60043', pid: '6004', text: '招聘岗位', function_code: 'hr_recruit_position', url: '/hr/recruit/position', function_icon: 'Medal', group_code: 'hr' }),
  // 离职管理
  item({ id: '6005', pid: '600', text: '离职管理', function_code: 'hr_resign', url: '/hr/resign', function_icon: 'SwitchButton', group_code: 'hr' }),
  // 考勤管理
  item({ id: '6006', pid: '600', text: '考勤管理', function_code: 'hr_attendance', url: '/hr/attendance', function_icon: 'Calendar', group_code: 'hr' }),
  // 人员绩效管理
  item({ id: '6007', pid: '600', text: '人员绩效管理', function_code: 'hr_staff_performance', url: '/hr/staff-performance', function_icon: 'DataLine', group_code: 'hr' }),
  // 部门绩效管理
  item({ id: '6008', pid: '600', text: '部门绩效管理', function_code: 'hr_dept_performance', url: '/hr/dept-performance', function_icon: 'DataAnalysis', group_code: 'hr' }),

  // ===== 财务管理 =====
  item({ id: '700', pid: '0', text: '财务管理', function_code: 'finance', url: '/finance', function_icon: 'Money', group_code: 'finance' }),
  item({ id: '7001', pid: '700', text: '退款管理', function_code: 'finance_refund', url: '/finance/refund', function_icon: 'RefreshLeft', group_code: 'finance' }),
  item({ id: '7002', pid: '700', text: '费用管理', function_code: 'finance_expense', url: '/finance/expense', function_icon: 'Wallet', group_code: 'finance' }),
  item({ id: '7003', pid: '700', text: '收入管理', function_code: 'finance_income', url: '/finance/income', function_icon: 'Coin', group_code: 'finance' }),
  item({ id: '7004', pid: '700', text: '工资管理', function_code: 'finance_salary', url: '/finance/salary', function_icon: 'Money', group_code: 'finance' }),
  item({ id: '7005', pid: '700', text: '费用类型管理', function_code: 'finance_expense_type', url: '/finance/expense-type', function_icon: 'CollectionTag', group_code: 'finance' }),
  item({ id: '7006', pid: '700', text: '预算管理', function_code: 'finance_budget', url: '/finance/budget', function_icon: 'DataLine', group_code: 'finance' }),
  item({ id: '7007', pid: '700', text: '账户管理', function_code: 'finance_account', url: '/finance/account', function_icon: 'Wallet', group_code: 'finance' }),
  item({ id: '7008', pid: '700', text: '账户流水汇总表', function_code: 'finance_account_flow', url: '/finance/account-flow', function_icon: 'DataAnalysis', group_code: 'finance' }),
  item({ id: '7009', pid: '700', text: '利润提成奖励管理', function_code: 'finance_profit_bonus', url: '/finance/profit-bonus', function_icon: 'Trophy', group_code: 'finance' }),
  item({ id: '7010', pid: '700', text: '应付款管理', function_code: 'finance_payable', url: '/finance/payable', function_icon: 'Money', group_code: 'finance' }),
  item({ id: '7011', pid: '700', text: '应收款管理', function_code: 'finance_receivable', url: '/finance/receivable', function_icon: 'Money', group_code: 'finance' }),
  item({ id: '7012', pid: '700', text: '分润管理', function_code: 'finance_share', url: '/finance/share', function_icon: 'Share', group_code: 'finance' }),

  // ===== 系统管理 =====
  item({ id: '10', pid: '0', text: '系统管理', function_code: 'system', url: '/system', function_icon: 'Setting', group_code: 'sys' }),
  item({ id: '1001', pid: '10', text: '系统设置', function_code: 'systemSetting', url: '/system/settings', function_icon: 'Tools', group_code: 'sys' }),
  item({ id: '1002', pid: '10', text: '公司信息管理', function_code: 'companyInfo', url: '/system/company', function_icon: 'OfficeBuilding', group_code: 'sys' }),
  item({ id: '11', pid: '10', text: '用户管理', function_code: 'userList', url: '/system/user', function_icon: 'UserFilled', group_code: 'sys' }),
  item({ id: '12', pid: '10', text: '角色管理', function_code: 'roleList', url: '/system/role', function_icon: 'User', group_code: 'sys' }),
  item({ id: '13', pid: '10', text: '功能管理', function_code: 'functionList', url: '/system/function', function_icon: 'Menu', group_code: 'sys' }),
]
