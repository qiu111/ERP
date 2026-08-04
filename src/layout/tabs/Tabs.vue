<template>
  <el-tabs
    v-model="activeTab"
    type="card"
    class="demo-tabs"
    @tab-remove="removeTab"
    @tab-click="clickTab"
  >
    <el-tab-pane
      v-for="item in tabsList"
      :key="item.path"
      :label="item.title"
      :name="item.path"
      :closable="item.path !== '/dashboard'"
    >
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import {useTabsStore, Tab} from '@/store/tabs/index.ts';
import { useRoute, useRouter } from 'vue-router';
import type { TabsPaneContext } from 'element-plus';


const store = useTabsStore();
const route = useRoute();
const router = useRouter();
    
// 选项卡数据
const tabsList = computed(() => store.getTab);

// 选中选项卡
const activeTab = ref(route.path);

// 选项卡点击事件
const clickTab = (pane: TabsPaneContext) => {
    // console.log(pane);
    const {props} = pane;
    // 跳转路由
    router.push({path: props.name as string});
}
// 选项卡删除事件
const removeTab = (targetName: string) => {
  // 个人门户为默认页面，不可关闭
  if (targetName === '/dashboard') return
  const tabs = tabsList.value
  let activeName = activeTab.value
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
  // 重新设置激活的选项卡
  activeTab.value = activeName
  // 重新设置选项卡数据
  store.tabList = tabs.filter((tab:Tab) => tab.path !== targetName)
  // 路由跳转
  router.push({path: activeName})
}
// 添加选项卡
const addTab = () => {
    const {path, meta} = route;
    // console.log(path, meta);
    const tab:Tab = {
        path,
        title: meta.title as string,
    }
    store.addTab(tab);
    activeTab.value = path; // 选中当前选项卡
}

//监听当前路由
watch(
    () => route.path,
    () => {
        //添加选项卡数据
        addTab();
        // setActiveTab();
    }
)
// 设置激活的选项卡
// const setActiveTab = () => {
//     activeTab.value = route.path;
// }
onMounted(() => {
    addTab();
    // setActiveTab();
})

</script>

<style scoped lang="scss">
.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}
</style>