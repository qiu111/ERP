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
import { useTabsStore } from '@/store/tabs/index.ts';
import type { TabsPaneContext } from 'element-plus'
import type { Tab } from '@/store/tabs/index.ts';
const store = useTabsStore();
const route = useRoute();
const router = useRouter();

const tabsList = computed(() => store.tabList);

const activeTab = ref(route.path);

const clickTab = (pane: TabsPaneContext) => {
    const { props } = pane;
    router.push({ path: props.name as string });
}

const removeTab = (targetName: string) => {
  // 个人门户为默认页面，不可关闭
  if (targetName === '/dashboard') return
  const tabs = tabsList.value
  let activeName = activeTab.value
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
  activeTab.value = activeName
  store.tabList = tabs.filter((tab: Tab) => tab.path !== targetName)
  router.push({ path: activeName })
}

const addTab = () => {
    const { path, meta } = route;
    const tab: Tab = {
        path,
        title: meta.title as string,
    }
    store.addTab(tab);
    activeTab.value = path;
}

watch(
    () => route.path,
    () => {
        addTab();
    }
)
onMounted(() => {
    addTab();
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