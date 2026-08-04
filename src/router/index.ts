// router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/Index.vue'
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
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        component: () => import('@/views/dashboard/Index.vue'),
        name: 'dashboard',
        meta: {
          title: '个人门户',
          icon: 'House',
          roles: ['sys:user'],
          requiresAuth: true
        },
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/404.vue'),
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: staticRoutes
})

// 动态路由状态
let dynamicRoutesLoaded = false

// 动态加载路由 - 单独的方法，供外部调用
export async function loadDynamicRoutes() {
  if (dynamicRoutesLoaded) return

  try {
    // getMenu() 返回 Result<BackendFunction[]>，result.data 即菜单数组
    const result = await getMenu()
    const functionsData = result.data
    const dynamicRoutes = transformFunctionsToRoutes(functionsData)
    addDynamicRoutes(router, dynamicRoutes)
    dynamicRoutesLoaded = true
    console.log('动态路由加载成功')
  } catch (error) {
    console.error('动态路由加载失败:', error)
    dynamicRoutesLoaded = false
    throw error // 抛出错误以便调用方处理
  }
}

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 不需要认证的路由
  if (to.meta.requiresAuth === false) {
    // 如果已登录且访问登录页，重定向到个人门户
    if (to.path === '/login' && userStore.isAuthenticated) {
      next('/')
    } else {
      next()
    }
    return
  }
  
  // 需要认证的路由
  if (to.meta.requiresAuth === true) {
    // 检查用户是否已登录
    if (!userStore.isAuthenticated) {
      // 未登录，重定向到登录页，并记录当前路由以便登录后跳转
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }
  
  // 正常导航
  next()
})

export default router