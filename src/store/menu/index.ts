import type { NavItem } from '@/types'

// 菜单 store：持有侧边栏渲染所需的唯一数据源
// 数据由 loadDynamicRoutes 统一写入（从后端/API 获取），确保菜单与路由同源
const useMenuStore = defineStore('menu', {
  state: () => ({
    collapse: false,
    /** 侧边栏渲染用的菜单树，由 loadDynamicRoutes 填充 */
    menuList: [] as NavItem[],
  }),
  getters: {
    getCollapse: (state) => state.collapse,
    getMenuList: (state) => state.menuList,
  },
  actions: {
    setCollapse(collapse: boolean) {
      this.collapse = collapse
    },
    setMenuList(list: NavItem[]) {
      this.menuList = list
    },
  },
})

export default useMenuStore
