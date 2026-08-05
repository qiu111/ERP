<template>
  <MenuLogo />
  <el-menu :default-active="defaultActive" class="el-menu-vertical-demo"
    :collapse="isCollapse"
    @open="handleOpen"
    @close="handleClose"
    @select="handleSelect"
    background-color="#ffffff"
    :unique-opened="true"
    >
    <MenuItemVue :menuList="menuList"></MenuItemVue>
  </el-menu>
</template>
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import MenuItemVue from './MenuItem.vue'
import MenuLogo from './menuLogo.vue'
import { useRoute, useRouter } from 'vue-router'
import useMenuStore from '@/store/menu'

const router = useRouter()
import { mockNavData, type NavItem } from '@/mock/user'

const menuStore = useMenuStore()
const route = useRoute()

const isCollapse = computed(() => {
  return menuStore.getCollapse
})
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleSelect = (index: string) => {
  // 仅在叶子菜单（el-menu-item）时跳转，子菜单（el-sub-menu）点击仅展开/收起
  router.push(index)
}

// 当前激活的菜单
const defaultActive = computed(() => {
  return route.path
})

// 菜单列表：优先读取 store，开发环境下首次挂载时填充 mock 数据
const menuList = computed<NavItem[]>(() => {
  return menuStore.getMenuList?.length
    ? menuStore.getMenuList
    : buildDefaultMenu()
})

// 构造默认菜单：直接使用 mockNavData，个人门户指向 /dashboard
function buildDefaultMenu(): NavItem[] {
  return [...mockNavData]
}

// 组件挂载时写入 store，便于其他组件复用
onMounted(() => {
  if (!menuStore.getMenuList?.length) {
    menuStore.setMenuList(buildDefaultMenu())
  }
})
</script>
<style scoped lang="scss">
.el-menu-vertical-demo:not(.el-menu--collapse) {
  // width: 200px;
  min-height: 400px;
}

// 让 el-menu 填满侧边栏剩余空间，自身成为唯一滚动容器
.el-menu-vertical-demo {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
