<template>
    <div class="menu-logo" @click="goHome">
        <img src="@/assets/vite.svg" alt="logo">
        <span class="logotitle" v-if="showTitle">{{ title }}</span>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import useMenuStore from '@/store/menu'

const router = useRouter()

const menuStore = useMenuStore()

const showTitle = ref(true)
watch(
    () =>menuStore.getCollapse,
    (newVal: boolean) => {
        if(!newVal){
            setTimeout(() => {
                showTitle.value = !newVal
            }, 300)
        }else{
            showTitle.value = !newVal
        }
})

const title = ref('ERP综合管理平台')

const goHome = () => {
  router.push('/dashboard')
}
</script>

<style scoped lang="scss">
.menu-logo{
    display: flex;
    width: 100%;
    height: 60px;
    background-color: #3c8dbc;
    text-align: center;
    cursor: pointer;
    align-items: center;
    img{
        width: 30px;
        height: 30px;
        margin-left: 10px;
    }
    .logotitle{
        font-weight: 800;
        font-size: 20px;
        margin-left: 10px;
        color: #fff;
    }
}
</style>