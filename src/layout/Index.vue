<template>
  <el-container class="layout-container">
      <el-aside width="auto" class="left-menu">
        <MenuBar />
      </el-aside>
      <el-container>
        <el-header class="header">
          <Header />
        </el-header>
        <el-main class="main">
          <div class="close-tabs">
            <Tabs class="tabs-content"/>
            <ColseTabs />
          </div>
          <router-view></router-view> 
        </el-main>
      </el-container>
    </el-container>
</template>

<script setup lang="ts">
import Header from '@/layout/header/Header.vue'
import MenuBar from '@/layout/menu/MenuBar.vue'
import Tabs from '@/layout/tabs/Tabs.vue'
import ColseTabs from '@/layout/tabs/ColseTabs.vue'

</script>

<style scoped lang="scss">
.layout-container{
  height: 100%;

  // 侧边栏：确保高度填满，内部 el-menu 单容器滚动
  .left-menu{
    background-color: #222d32;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .header{
    background-color: #3c8dbc;
    display: flex;
    align-items: center;
  }

  .main{
    padding: 0;
    // 内容区单容器滚动
    overflow: auto;

    .close-tabs{
      display: flex;
      justify-content: space-between;
      flex-grow: 1;
      .el-tabs{
        width: 100%;
        height: 33px !important;
        line-height: 33px !important;
        --el-tabs-header-height: 33px;
      }
      .tabs-content{
      }
    }
  }
}


</style>