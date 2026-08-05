// router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { transformFunctionsToRoutes, addDynamicRoutes } from '@/utils/dynamicRoutes'
import { useUserStore } from '@/store/user/user.ts'
import { getMenu } from '@/api/user'

// 静态路由
const staticRoutes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Index.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/403.vue'),
    meta: {
      title: '无访问权限',
      requiresAuth: false
    }
  },
  {
    path: '/',
    name: 'layout-root',
    component: () => import('@/layout/Index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        component: () => import('@/views/dashboard/Index.vue'),
        name: 'dashboard',
        meta: {
          title: '个人门户',
          icon: 'House',
          roles: ['my_center'],
          requiresAuth: true
        },
      }
    ]
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes: staticRoutes
})

// 404 兜底路由
const notFoundRoute: RouteRecordRaw = {
  path: '/:pathMatch(.*)*',
  name: 'NotFound',
  component: () => import('@/views/404.vue'),
  meta: { requiresAuth: false }
}

// 动态路由加载状态
let dynamicRoutesLoaded = false

// 递归获取所有路由路径（包括子路由）
const getAllPaths = (routes: any[]): string[] => {
  const paths: string[] = []
  routes.forEach(route => {
    paths.push(route.path)
    if (route.children?.length) {
      paths.push(...getAllPaths(route.children))
    }
  })
  return paths
}

// 动态加载路由 - 登录成功后调用
export async function loadDynamicRoutes() {
  if (dynamicRoutesLoaded) return

  try {
    const result = await getMenu()
    const functionsData = result.data
    const dynamicRoutes = transformFunctionsToRoutes(functionsData)

    // 获取已有路由路径（递归），避免与静态路由子路由冲突
    const existingPaths = new Set(getAllPaths(router.getRoutes()))
    const filteredRoutes = dynamicRoutes.filter(
      route => !existingPaths.has(route.path)
    )

    // 先标记，防止重入
    dynamicRoutesLoaded = true
    // 将所有动态路由挂到 'layout-root' (Layout) 父路由下
    addDynamicRoutes(router, filteredRoutes)
    // 最后注册 404 兜底
    router.addRoute(notFoundRoute)

    // 同时将菜单数据写入 menuStore，供侧边栏动态渲染
    const { backendToNavItems } = await import('@/utils/dynamicRoutes')
    const { default: useMenuStore } = await import('@/store/menu')
    const menuStore = useMenuStore()
    menuStore.setMenuList(backendToNavItems(functionsData))

    console.log('动态路由加载成功，共注册', filteredRoutes.length, '条路由')
  } catch (error) {
    console.error('动态路由加载失败:', error)
    dynamicRoutesLoaded = false
    throw error
  }
}

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()

  // 不需要认证的路由
  if (to.meta.requiresAuth === false) {
    if (to.path === '/login' && userStore.isAuthenticated) {
      next('/')
    } else {
      next()
    }
    return
  }

  // 需要认证的路由
  if (to.meta.requiresAuth === true) {
    if (!userStore.isAuthenticated) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }

  // 已认证但动态路由还未加载 → 加载后再导航
  if (userStore.isAuthenticated && !dynamicRoutesLoaded) {
    try {
      await loadDynamicRoutes()
      // 重新导航到目标路由
      next({ ...to, replace: true })
    } catch {
      next(false)
    }
    return
  }

  // 权限校验：meta.roles 定义了访问该路由所需的权限编码
  // 超级管理员（sys:admin）或拥有任一指定权限的用户允许访问，否则跳转 403
  const requiredRoles = to.meta.roles as string[] | undefined
  if (requiredRoles && requiredRoles.length > 0) {
    if (!userStore.hasAnyPermission(requiredRoles)) {
      next({ path: '/403', replace: true })
      return
    }
  }

  next()
})

export default router
