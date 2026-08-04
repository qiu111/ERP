<template>
    <el-breadcrumb class="breadcrumb" separator="/">
        <el-breadcrumb-item v-for="item in breadcrumbList" :key="item.path" :to="{ path: item.path }">
            <a href="/">{{ item.meta.title }}</a>
        </el-breadcrumb-item>
    </el-breadcrumb>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const breadcrumbList = computed(() => {
    return route.matched.filter(item => item.meta && item.meta.title)
})
</script>

<style scoped lang="scss">
.breadcrumb{
    margin-left: 10px;
}
:deep(.el-breadcrumb__inner), :deep(.el-breadcrumb__inner a){
    color: #fff !important;
    font-size: 16px !important;
}
</style>  