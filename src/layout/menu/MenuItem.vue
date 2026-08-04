<template>
    <template v-for="menu in menuList" :key="menu.path">
        <!-- 有下级菜单 -->
        <el-sub-menu
            v-if="menu.children && menu.children.length > 0"
            :index="menu.path"
        >
            <template #title>
                <el-icon v-if="menu.icon" style="color: #666; font-size: 20px;">
                    <component :is="menu.icon"></component>
                </el-icon>
                <span>{{ menu.title }}</span>
            </template>
            <!-- 递归渲染下级菜单 -->
            <menu-item :menuList="menu.children"></menu-item>
        </el-sub-menu>
        <!-- 没有下级菜单 -->
        <el-menu-item v-else :index="menu.path">
            <el-icon v-if="menu.icon">
                <component :is="menu.icon"></component>
            </el-icon>
            <template #title>{{ menu.title }}</template>
        </el-menu-item>
    </template>
</template>

<script setup lang="ts">
import type { NavItem } from '@/mock/user'

defineProps<{
  menuList: NavItem[]
}>()
</script>

<style scoped></style>
