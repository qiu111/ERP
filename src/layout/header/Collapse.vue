<template>
    <el-icon color="#fff" size="28" class="icons" @click="handleCollapse">
        <component :is="isCollapse ? 'Fold' : 'Expand'"></component>
    </el-icon>
</template>

<script setup lang="ts">
import useMenuStore from '@/store/menu'
const menuStore = useMenuStore()

const isCollapse = computed(() => {
    return !menuStore.getCollapse
})

const handleCollapse = () => {
    menuStore.setCollapse(!menuStore.getCollapse)
}
</script>
<style scoped lang="scss">
.icons{
    cursor: pointer;
}
</style>