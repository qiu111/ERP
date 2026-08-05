// utils/dynamicRoutes.ts

import type { NavItem } from '@/types'

// 定义后端返回的数据类型
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

// 转换后的路由类型
export interface DynamicRoute {
  path: string
  name?: string | number | symbol
  component?: any
  redirect?: string
  meta?: Record<string, any>
  children?: DynamicRoute[]
}

/**
 * 将后端功能数据转换为侧边栏渲染用的 NavItem 树形结构
 * 递归构建，仅包含有 URL 的菜单节点（根节点和叶子节点都需有 url）
 *
 * @param functions 后端返回的功能数据数组
 * @returns 转换后的 NavItem 树形数组
 */
export function backendToNavItems(functions: BackendFunction[]): NavItem[] {
  const map = new Map<string, BackendFunction[]>()
  const roots: BackendFunction[] = []

  for (const func of functions) {
    if (func.pid === '0' || func.pid === '') {
      roots.push(func)
    } else {
      if (!map.has(func.pid)) map.set(func.pid, [])
      map.get(func.pid)!.push(func)
    }
  }

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
  const functionMap = new Map<string, BackendFunction[]>()
  const rootFunctions: BackendFunction[] = []

  functions.forEach(func => {
    if (func.pid === '0' || func.pid === '') {
      rootFunctions.push(func)
    } else {
      if (!functionMap.has(func.pid)) {
        functionMap.set(func.pid, [])
      }
      functionMap.get(func.pid)!.push(func)
    }
  })

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
            // 以 function_code 作为页面访问权限编码（如 'roleList'）
            // 路由守卫会校验用户 permissions 是否包含该编码，超级管理员绕过
            roles: [func.function_code].filter(Boolean),
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
