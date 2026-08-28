// utils/dynamicRoutes.ts

import type { NavItem } from '@/types'

export interface BackendFunction {
  function_id: string
  function_name: string
  function_url: string
  function_pid: string
  group_code: string
  function_code: string
  function_type: string
  function_icon: string
  function_order: string
  add_user: string
  status: string
  update_time: string
  add_time: string
  memo: string
  id: string
  pid: string
  text: string
  iconCls: string
  url: string
  state: string
}

export interface DynamicRoute {
  path: string
  name?: string | number | symbol
  component?: any
  redirect?: string
  meta?: Record<string, any>
  children?: DynamicRoute[]
}

/**
 * 构建父子关系映射与根节点列表
 */
function buildFunctionTree(functions: BackendFunction[]): {
  roots: BackendFunction[]
  childrenMap: Map<string, BackendFunction[]>
} {
  const childrenMap = new Map<string, BackendFunction[]>()
  const roots: BackendFunction[] = []
  for (const func of functions) {
    if (func.pid === '0' || func.pid === '') {
      roots.push(func)
    } else {
      if (!childrenMap.has(func.pid)) childrenMap.set(func.pid, [])
      childrenMap.get(func.pid)!.push(func)
    }
  }
  return { roots, childrenMap }
}

/**
 * 将后端功能数据转换为侧边栏渲染用的 NavItem 树形结构
 * 递归构建，仅包含有 URL 的菜单节点（根节点和叶子节点都需有 url）
 *
 * @param functions 后端返回的功能数据数组
 * @returns 转换后的 NavItem 树形数组
 */
export function backendToNavItems(functions: BackendFunction[]): NavItem[] {
  const { roots, childrenMap: map } = buildFunctionTree(functions)

  const toNavItem = (func: BackendFunction): NavItem => {
    const children = map.get(func.id)
    const hasChildren = children && children.length > 0
    const item: NavItem = {
      title: func.text || func.function_name,
      path: func.url || `/${func.function_code || func.id}`,
      icon: func.function_icon || func.iconCls || undefined,
      ...(hasChildren ? { children: children!.map(toNavItem) } : {}),
    }
    return item
  }

  return roots.map(toNavItem)
}

/**
 * 根据功能code动态加载组件
 */
function loadComponentByFunctionCode(functionCode: string) {
  const componentMap: Record<string, () => Promise<any>> = {
    'my_center': () => import('@/views/dashboard/Index.vue'),
    'main': () => import('@/views/dashboard/Enterprise.vue'),
    'userList': () => import('@/views/system/User/UserList.vue'),
    'roleList': () => import('@/views/system/Role/RoleList.vue'),
    'functionList': () => import('@/views/system/Function/FunctionList.vue'),
    'companyInfo': () => import('@/views/system/Company/CompanyList.vue'),
    'systemSetting': () => import('@/views/system/Setting/SystemSetting.vue'),
    'erp_purchase_order': () => import('@/views/erp/purchase/OrderList.vue'),
    'erp_purchase_receive': () => import('@/views/erp/purchase/ReceiveList.vue'),
    'erp_purchase_return': () => import('@/views/erp/purchase/ReturnList.vue'),
    'erp_purchase_export': () => import('@/views/erp/purchase/ExportList.vue'),
    'erp_sale_pi': () => import('@/views/erp/sale/PIList.vue'),
    'erp_sale_order': () => import('@/views/erp/sale/OrderList.vue'),
    'erp_sale_delivery': () => import('@/views/erp/sale/DeliveryList.vue'),
    'erp_sale_return': () => import('@/views/erp/sale/ReturnList.vue'),
    'erp_stock_summary': () => import('@/views/erp/stock/SummaryList.vue'),
    'erp_stock_detail': () => import('@/views/erp/stock/DetailList.vue'),
    'erp_stock_adjust': () => import('@/views/erp/stock/AdjustList.vue'),
    'erp_stock_transfer': () => import('@/views/erp/stock/TransferList.vue'),
    'erp_stock_check': () => import('@/views/erp/stock/CheckList.vue'),
    'erp_stock_diff': () => import('@/views/erp/stock/DiffQueryList.vue'),
    'erp_stock_warning': () => import('@/views/erp/stock/WarningSettingList.vue'),
    'erp_agent_order': () => import('@/views/erp/agent/AgentOrderList.vue'),
    'erp_agent_return': () => import('@/views/erp/agent/AgentReturnList.vue'),
    'erp_agent_outbound': () => import('@/views/erp/agent/AgentOutboundList.vue'),
    'erp_goods_self': () => import('@/views/erp/goods/SelfGoodsList.vue'),
    'erp_goods_third': () => import('@/views/erp/goods/ThirdGoodsList.vue'),
    'erp_goods_agent': () => import('@/views/erp/goods/AgentGoodsList.vue'),
    'erp_goods_category': () => import('@/views/erp/goods/GoodsCategoryList.vue'),
    'erp_goods_model': () => import('@/views/erp/goods/GoodsModelList.vue'),
    'erp_goods_spec': () => import('@/views/erp/goods/GoodsSpecList.vue'),
    'erp_goods_attribute': () => import('@/views/erp/goods/GoodsAttributeList.vue'),
    'erp_goods_brand': () => import('@/views/erp/goods/GoodsBrandList.vue'),
    'approval_todo': () => import('@/views/erp/approval/ApprovalTodoList.vue'),
    'oa_approval_todo': () => import('@/views/erp/approval/ApprovalTodoList.vue'),
    'approval_list': () => import('@/views/erp/approval/ApprovalList.vue'),
    'approval_my_participation': () => import('@/views/erp/approval/MyParticipationList.vue'),
    'approval_involved': () => import('@/views/erp/approval/MyParticipationList.vue'),
    'oa_approval_my_participation': () => import('@/views/erp/approval/MyParticipationList.vue'),
    'oa_approval_involved': () => import('@/views/erp/approval/MyParticipationList.vue'),
    'my_participation': () => import('@/views/erp/approval/MyParticipationList.vue'),
    'approval_my_initiation': () => import('@/views/erp/approval/MyInitiationList.vue'),
    'approval_initiated': () => import('@/views/erp/approval/MyInitiationList.vue'),
    'oa_approval_my_initiation': () => import('@/views/erp/approval/MyInitiationList.vue'),
    'oa_approval_initiated': () => import('@/views/erp/approval/MyInitiationList.vue'),
    'my_initiation': () => import('@/views/erp/approval/MyInitiationList.vue'),
    'oa_work_log': () => import('@/views/erp/approval/WorkLogList.vue'),
    'work_log': () => import('@/views/erp/approval/WorkLogList.vue'),
    'oa_daily_log': () => import('@/views/erp/approval/WorkLogList.vue'),
    'oa_log_work': () => import('@/views/erp/approval/WorkLogList.vue'),
    'oa_log_audit': () => import('@/views/erp/approval/WorkLogAuditList.vue'),
    'oa_plan_mine': () => import('@/views/erp/approval/MyWorkPlanList.vue'),
    'oa_plan_assigned': () => import('@/views/erp/approval/AssignedWorkPlanList.vue'),
    'oa_plan_dept': () => import('@/views/erp/approval/DepartmentWorkPlanList.vue'),
    'oa_required_task': () => import('@/views/erp/approval/RequiredTaskList.vue'),
    'oa_reception_todo': () => import('@/views/erp/approval/ReceptionTodoList.vue'),
    'oa_reception_initiated': () => import('@/views/erp/approval/ReceptionInitiatedList.vue'),
    'oa_notice_list': () => import('@/views/erp/approval/AnnouncementList.vue'),
    'oa_memo': () => import('@/views/erp/approval/MemoList.vue'),
    'oa_handover': () => import('@/views/erp/approval/HandoverList.vue'),
    'oa_handover_list': () => import('@/views/erp/approval/HandoverList.vue'),
    'oa_document_create': () => import('@/views/erp/approval/DocumentCreate.vue'),
    'oa_document_inbox': () => import('@/views/erp/approval/DocumentInboxList.vue'),
    'oa_document_pending': () => import('@/views/erp/approval/DocumentPendingList.vue'),
    'oa_document_initiated': () => import('@/views/erp/approval/DocumentInitiatedList.vue'),
    'oa_document_todo': () => import('@/views/erp/approval/DocumentTodoList.vue'),
    'oa_document_done': () => import('@/views/erp/approval/DocumentDoneList.vue'),
    'oa_document_vote': () => import('@/views/erp/approval/VoteList.vue'),
    'oa_approval_template': () => import('@/views/erp/approval/ApprovalTemplateList.vue'),
    'approval_template': () => import('@/views/erp/approval/ApprovalTemplateList.vue'),
    // ===== CRM 客户管理 =====
    'crm_source': () => import('@/views/crm/CustomerSourceList.vue'),
    'crm_customer': () => import('@/views/crm/CustomerList.vue'),
    'crm_opportunity': () => import('@/views/crm/OpportunityList.vue'),
    // ===== ERP 基本信息管理 =====
    'erp_base_supplier': () => import('@/views/erp/base/SupplierList.vue'),
    'erp_base_bank': () => import('@/views/erp/base/BankAccountList.vue'),
    'erp_base_logistics': () => import('@/views/erp/base/LogisticsList.vue'),
    'erp_base_warehouse': () => import('@/views/erp/base/WarehouseList.vue'),
    // ===== 合同管理 =====
    'erp_contract_list': () => import('@/views/erp/contract/ContractList.vue'),
    'erp_contract_record': () => import('@/views/erp/contract/ContractRecordList.vue'),
    'erp_contract_purchase': () => import('@/views/erp/contract/ContractPurchaseList.vue'),
    'erp_contract_export_terms': () => import('@/views/erp/contract/ContractTermsList.vue'),
    'erp_contract_domestic_terms': () => import('@/views/erp/contract/ContractTermsList.vue'),
    'erp_contract_purchase_terms': () => import('@/views/erp/contract/ContractTermsList.vue'),
    'erp_purchase_contract_terms': () => import('@/views/erp/contract/ContractTermsList.vue'),
    // ===== 财务管理 =====
    'finance_refund': () => import('@/views/finance/RefundList.vue'),
    'finance_expense': () => import('@/views/finance/ExpenseList.vue'),
    'finance_income': () => import('@/views/finance/IncomeList.vue'),
    'finance_salary': () => import('@/views/finance/SalaryList.vue'),
    'finance_expense_type': () => import('@/views/finance/ExpenseTypeList.vue'),
    'finance_budget': () => import('@/views/finance/BudgetList.vue'),
    'finance_account': () => import('@/views/finance/AccountList.vue'),
    'finance_account_flow': () => import('@/views/finance/AccountFlowList.vue'),
    'finance_profit_bonus': () => import('@/views/finance/ProfitBonusList.vue'),
    'finance_payable': () => import('@/views/finance/PayableList.vue'),
    'finance_receivable': () => import('@/views/finance/ReceivableList.vue'),
    'finance_share': () => import('@/views/finance/ShareList.vue'),
    // ===== HR 人力资源 =====
    'hr_organization': () => import('@/views/hr/OrganizationList.vue'),
    'hr_position': () => import('@/views/hr/PositionList.vue'),
    'hr_employee': () => import('@/views/hr/EmployeeList.vue'),
    'hr_recruit_list': () => import('@/views/hr/RecruitList.vue'),
    'hr_recruit_source': () => import('@/views/hr/RecruitSourceList.vue'),
    'hr_recruit_position': () => import('@/views/hr/RecruitPositionList.vue'),
    'hr_resign': () => import('@/views/hr/ResignList.vue'),
    'hr_attendance': () => import('@/views/hr/AttendanceList.vue'),
    'hr_staff_performance': () => import('@/views/hr/StaffPerformanceList.vue'),
    'hr_dept_performance': () => import('@/views/hr/DeptPerformanceList.vue'),
    'system': () => import('@/views/404.vue'),
    'goodsRoot': () => import('@/views/404.vue'),
    'oa': () => import('@/views/404.vue'),
  }
  return componentMap[functionCode] || (() => import('@/views/404.vue'))
}

/**
 * 将后端功能数据转换为Vue Router路由（仅叶子节点路由）
 *
 * @param functions 后端返回的功能数据数组
 * @returns 转换后的叶子节点路由数组
 */
export function transformFunctionsToRoutes(functions: BackendFunction[]): DynamicRoute[] {
  const { roots: rootFunctions, childrenMap: functionMap } = buildFunctionTree(functions)

  const leafRoutes: DynamicRoute[] = []

  const collectLeafRoutes = (items: BackendFunction[]) => {
    items.forEach(func => {
      const hasChildren = functionMap.has(func.id) && functionMap.get(func.id)!.length > 0

      if (hasChildren) {
        collectLeafRoutes(functionMap.get(func.id)!)
      } else {
        const route: DynamicRoute = {
          path: func.url || `/${func.function_code || func.id}`,
          name: func.function_code || func.id,
          meta: {
            title: func.text || func.function_name,
            icon: func.function_icon || func.iconCls,
            requiresAuth: true,
            functionId: func.function_id,
            functionCode: func.function_code,
            functionName: func.function_name,
            groupId: func.group_code,
          },
        }

        if (func.function_code) {
          route.component = loadComponentByFunctionCode(func.function_code)
        }

        leafRoutes.push(route)
      }
    })
  }

  collectLeafRoutes(rootFunctions)
  return leafRoutes
}

/**
 * 动态添加路由到路由器
 * 所有动态路由挂载到 'main' (Layout 父路由) 下，与静态路由共用同一个 Layout 实例
 *
 * @param router Vue Router实例
 * @param dynamicRoutes 动态路由数组（叶子节点，绝对路径如 /system/user）
 */
export function addDynamicRoutes(router: any, dynamicRoutes: DynamicRoute[]) {
  dynamicRoutes.forEach(route => {
    router.addRoute('layout-root', route)
  })
}
