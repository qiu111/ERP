<template>
  <MenuLogo />
  <el-menu :default-active="defaultActive" class="el-menu-vertical-demo"
    :collapse="isCollapse"
    @select="handleSelect"
    background-color="#ffffff"
    :unique-opened="true"
    >
    <MenuItem :menuList="menuList"></MenuItem>
  </el-menu>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import MenuItem from './MenuItem.vue'
import MenuLogo from './MenuLogo.vue'
import { useRoute, useRouter } from 'vue-router'
import useMenuStore from '@/store/menu'
import type { NavItem } from '@/types'

const router = useRouter()
const menuStore = useMenuStore()
const route = useRoute()

const isCollapse = computed(() => menuStore.getCollapse)
const handleSelect = (index: string) => {
  router.push(index)
}

const defaultActive = computed(() => route.path)

// 菜单列表：从 menuStore 读取，数据由 loadDynamicRoutes 统一写入
// 开发首次加载前若 store 为空，使用空数组占位，等待路由守卫触发加载
const menuList = computed<NavItem[]>(() => menuStore.getMenuList)
</script>
<style scoped lang="scss">
.el-menu-vertical-demo:not(.el-menu--collapse) {
  min-height: 400px;
}

// 让 el-menu 填满侧边栏剩余空间，自身成为唯一滚动容器
.el-menu-vertical-demo {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
