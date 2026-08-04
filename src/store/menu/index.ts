import { defineStore } from 'pinia'
import type { NavItem } from '@/mock/user'

// 菜单 store：持有侧边栏渲染所需的唯一数据源
const useMenuStore = defineStore('menu', {
  state: () => ({
    collapse: false,
    /** 侧边栏渲染用的菜单树，开发环境取值 mockNavData */
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
