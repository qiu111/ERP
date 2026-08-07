// router/index.ts
// import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { transformFunctionsToRoutes, addDynamicRoutes, backendToNavItems } from '@/utils/dynamicRoutes'
import { useUserStore } from '@/store/user/user.ts'
import useMenuStore from '@/store/menu'
import { getMenu } from '@/api/user'

// 静态路由（无需认证）
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
          requiresAuth: true
        },
      }
    ]
  },
  // 注意：404 兜底路由延迟到动态路由加载完成后注册，防止动态路由被提前匹配
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: staticRoutes
})

// 动态路由加载状态
let dynamicRoutesLoaded = false
let loadPromise: Promise<void> | null = null
let notFoundRouteAdded = false

// 注册 404 兜底路由（必须在动态路由之后注册）
function registerNotFoundRoute(router: any) {
  if (notFoundRouteAdded) return
  router.addRoute({
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/404.vue'),
    meta: { requiresAuth: false }
  })
  notFoundRouteAdded = true
}

// 动态加载路由 - 登录成功后调用
export async function loadDynamicRoutes() {
  if (dynamicRoutesLoaded) return
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    try {
      const result = await getMenu()
      const functionsData = result.data
      const dynamicRoutes = transformFunctionsToRoutes(functionsData)

      const existingPaths = new Set(router.getRoutes().map(r => r.path))
      const filteredRoutes = dynamicRoutes.filter(
        route => !existingPaths.has(route.path)
      )

      dynamicRoutesLoaded = true
      addDynamicRoutes(router, filteredRoutes)
      // 动态路由注册完成后，再注册 404 兜底路由，确保它最后匹配
      registerNotFoundRoute(router)

      const menuStore = useMenuStore()
      menuStore.setMenuList(backendToNavItems(functionsData))

      console.log('动态路由加载成功，共注册', filteredRoutes.length, '条路由')
    } catch (error) {
      console.error('动态路由加载失败:', error)
      dynamicRoutesLoaded = false
      throw error
    } finally {
      loadPromise = null
    }
  })()

  return loadPromise
}

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()

  // 公开路由白名单（无需登录即可访问）
  const publicPaths = ['/login', '/403', '/404']

  // 公开路由直接放行
  if (publicPaths.includes(to.path)) {
    if (to.path === '/login' && userStore.isAuthenticated) {
      next('/')
    } else {
      next()
    }
    return
  }

  // 未登录访问非公开路由 → 跳转登录页
  if (!userStore.isAuthenticated) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
    return
  }

  // 已认证但动态路由还未加载 → 加载后再导航
  if (!dynamicRoutesLoaded) {
    try {
      await loadDynamicRoutes()
      next({ ...to, replace: true })
    } catch {
      next(false)
    }
    return
  }

  // 权限由后台控制：后台返回的菜单数据已按用户权限过滤
  // 用户无权限的页面不会出现在菜单中，对应路由也不会被注册
  // 若访问未注册的路由，将由 404 兜底路由处理
  next()
})

export default router
