<template>
  <div class="close-tabs">
    <el-dropdown>
    <span class="el-dropdown-link">
      <el-icon class="el-icon--right">
        <Close />
      </el-icon>
      关闭
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="closeCurrent">关闭当前</el-dropdown-item>
        <el-dropdown-item @click="closeLeft">关闭左侧</el-dropdown-item>
        <el-dropdown-item @click="closeRight">关闭右侧</el-dropdown-item>
        <el-dropdown-item @click="closeAll">关闭所有</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useTabsStore } from '@/store/tabs/index.ts';
import type { Tab } from '@/store/tabs/index.ts';
const store = useTabsStore();
const route = useRoute() // 获取当前路由
const router = useRouter() // 获取路由实例
// 关闭当前
const closeCurrent = () => {
    const targetName = route.path
    // 个人门户不能关闭
    if (targetName === '/dashboard') return
    // 获取选项卡数据
    const tabs = store.getTab
    // 获取当前激活的选项卡
    let activeName = route.path
    // 判断当前选项卡是否是激活的选项卡
    if (activeName === targetName) {
        tabs.forEach((tab:Tab, index:number) => {
        if (tab.path === targetName) {
            const nextTab = tabs[index + 1] || tabs[index - 1]
            if (nextTab) {
            activeName = nextTab.path
            }
        }
        })
    }
    // 重新设置选项卡数据
    store.tabList = tabs.filter((tab:any) => tab.path !== targetName)
    // 路由跳转
    router.push({path: activeName})
}
// 关闭左侧
const closeLeft = () => {
  const path = route.path
  //找到当前路由的索引
  const index = store.tabList.findIndex(item => item.path === path)
  store.tabList.splice(1, index-1)
}
// 关闭右侧
const closeRight = () => {
  const path = route.path
  //找到当前路由的索引
  const index = store.tabList.findIndex(item => item.path === path)
  store.tabList.splice(index+1)
}
// 关闭所有
const closeAll = () => {
  store.tabList.splice(1, store.tabList.length)
  // 路由跳转
  router.push({path: '/dashboard'})
}
</script>
<style scoped lang="scss">
.el-dropdown-link {
  cursor: pointer;
//   color: var(--el-color-primary);
  display: flex;
  align-items: center;
}
.el-dropdown-link:focus{
  outline: none;
}
.close-tabs{
  width: 60px;
  height: 40px;
  position: fixed;
  right: 0;
  top: 58px;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
