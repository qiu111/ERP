import { defineStore } from 'pinia'

export type Tab = {
  title: string
  path: string
}

export const useTabsStore = defineStore('tabStore', {
  state: () => ({
    tabList: [] as Tab[]
  }),
  actions: {
    addTab(tab: Tab) {
      if (this.tabList.some(item => item.path === tab.path)) return
      if (tab.path === '/dashboard') {
        this.tabList.unshift(tab)
      } else {
        this.tabList.push(tab)
      }
    }
  },
  persist: {
    storage: localStorage,
    pick: ['tabList']
  }
})
