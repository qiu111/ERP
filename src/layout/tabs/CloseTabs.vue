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
import { Close } from '@element-plus/icons-vue'
import { useTabsStore } from '@/store/tabs/index.ts'
import type { Tab } from '@/store/tabs/index.ts'

const store = useTabsStore()
const route = useRoute()
const router = useRouter()

const closeCurrent = () => {
    const targetName = route.path
    // 个人门户不能关闭
    if (targetName === '/dashboard') return
    const tabs = store.tabList
    let activeName = route.path
    if (activeName === targetName) {
        tabs.forEach((tab: Tab, index: number) => {
        if (tab.path === targetName) {
            const nextTab = tabs[index + 1] || tabs[index - 1]
            if (nextTab) {
            activeName = nextTab.path
            }
        }
        })
    }
    store.tabList = tabs.filter((tab: any) => tab.path !== targetName)
    router.push({ path: activeName })
}

const closeLeft = () => {
  const path = route.path
  const index = store.tabList.findIndex(item => item.path === path)
  store.tabList.splice(1, index - 1)
}

const closeRight = () => {
  const path = route.path
  const index = store.tabList.findIndex(item => item.path === path)
  store.tabList.splice(index + 1)
}

const closeAll = () => {
  store.tabList.splice(1, store.tabList.length)
  router.push({ path: '/dashboard' })
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
