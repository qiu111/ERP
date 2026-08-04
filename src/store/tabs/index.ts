import { defineStore } from 'pinia'
// 定义选项卡数据类型
export type Tab = {
    title: string;
    path: string;

} 
// 定义选项卡列表类型
export type TabState = {
    tabList: Tab[];
}

export const useTabsStore = defineStore('tabStore', {
    state: (): TabState => ({
        tabList: []
    }),
    getters: {
        getTab: (state) => {
            return state.tabList
        }
    },
    actions: {
        addTab(tab: Tab) {
            // 判断数据是否存在
            if(this.tabList.some(item => item.path === tab.path)) return
            if (tab.path === '/dashboard'){
                this.tabList.unshift(tab)
            } else {
                this.tabList.push(tab)
            }
        }
    },
    persist: {
        enabled: true, // 开启持久化
        strategies: [
            {
                storage: localStorage,
                paths: ['tabList']
            }
        ]
    }
})  