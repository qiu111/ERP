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
