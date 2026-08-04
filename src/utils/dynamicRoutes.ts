// utils/dynamicRoutes.ts
import type { RouteRecordRaw } from 'vue-router'

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
export interface DynamicRoute extends RouteRecordRaw {
  children?: DynamicRoute[]
}

/**
 * 将后端功能数据转换为Vue Router路由
 * @param functions 后端返回的功能数据数组
 * @returns 转换后的路由数组
 */
export function transformFunctionsToRoutes(functions: BackendFunction[]): DynamicRoute[] {
  // 按pid分组，用于构建层级关系
  const functionMap = new Map<string, BackendFunction[]>()
  const rootFunctions: BackendFunction[] = []

  // 分类功能数据
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

  // 递归构建路由
  const buildRoutes = (parentFunctions: BackendFunction[]): DynamicRoute[] => {
    return parentFunctions.map(func => {
      const route: DynamicRoute = {
        path: func.url || `/${func.function_code || func.id}`,
        name: func.function_code || func.id,
        meta: {
          title: func.text || func.function_name,
          icon: func.function_icon || func.iconCls,
          roles: [`${func.group_code}:${func.function_code || func.function_name}`],
          // 可以添加更多元信息
          functionId: func.function_id,
          functionCode: func.function_code,
          functionName: func.function_name,
          groupId: func.group_code
        }
      }

      // 处理有子功能的情况
      if (functionMap.has(func.id) && functionMap.get(func.id)!.length > 0) {
        route.children = buildRoutes(functionMap.get(func.id)!)
        
        // 如果当前路由有子路由，但自己没有指定路径，则设置为布局路由
        if (!route.path || route.path === '/' || !route.path.startsWith('/')) {
          route.path = ''
          route.component = () => import('@/layout/Index.vue')
        }
      } else {
        // 叶子节点路由 - 设置组件
        if (route.path && !route.component) {
          // 这里需要根据你的实际组件路径来动态导入
          // 你可以创建一个映射或者根据function_code来决定导入哪个组件
          route.component = loadComponentByFunctionCode(func.function_code)
        }
      }

      return route
    })
  }

  // 根据功能code动态加载组件的示例函数（需要根据实际情况调整）
  const loadComponentByFunctionCode = (functionCode: string) => {
    // 这里是一个示例映射，你需要根据实际的组件路径来配置
    const componentMap: Record<string, string> = {
      'my_center': '@/views/dashboard/Index.vue',
      'userList': '@/views/system/User/UserList.vue',
      'roleList': '@/views/system/Role/RoleList.vue',
      // 添加更多的映射...
    }

    const componentPath = componentMap[functionCode] || '@/views/404.vue'
    return () => import(/* @vite-ignore */ componentPath)
  }

  // 构建路由，确保根路由有Layout组件
  const allRoutes = buildRoutes(rootFunctions)

  // 处理根路由，确保有Layout包裹
  return allRoutes.map(route => {
    // 如果是顶级路由且没有指定组件，使用Layout
    if (!route.component) {
      return {
        path: '/',
        component: () => import('@/layout/Index.vue'),
        redirect: allRoutes.find(r => r.path === '/dashboard')?.path || '/dashboard',
        children: [route]
      }
    }
    
    return route
  })
}

/**
 * 动态添加路由到路由器
 * @param router Vue Router实例
 * @param dynamicRoutes 动态路由数组
 */
export function addDynamicRoutes(router: any, dynamicRoutes: DynamicRoute[]) {
  // 清空或备份现有路由（如果需要）
  
  // 添加动态路由
  dynamicRoutes.forEach(route => {
    router.addRoute(route)
  })
  
  // 或者添加到一个动态路由名称下
  // router.addRoute('dynamic', ...dynamicRoutes)
}