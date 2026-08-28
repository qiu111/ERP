<template>
  <div class="dashboard">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="item in statCards" :key="item.title">
        <StatCard
          :title="item.title"
          :current="item.current"
          :total="item.total"
          :sub-label="item.subLabel"
          :percent="item.percent"
          :color="item.color"
          :bg-color="item.bgColor"
          :icon-color="item.iconColor"
          :icon="item.icon"
          :to="item.path"
        />
      </el-col>
    </el-row>

    <!-- 中部：我的提醒 + 我的视图 -->
    <el-row :gutter="16" class="middle-row">
      <!-- 我的提醒 -->
      <el-col :xs="24" :md="12">
        <PortalPanel title="我的提醒" :icon="Bell" icon-color="#e6a23c">
          <div class="notice-list">
            <div
              v-for="(notice, idx) in notices"
              :key="idx"
              class="notice-item"
              :class="{ clickable: notice.path }"
              @click="notice.path && router.push(notice.path)"
            >
              <el-icon class="notice-icon" color="#f56c6c"><Bell /></el-icon>
              <span class="notice-text">{{ notice.text }}</span>
              <el-tag v-if="notice.tag" :type="notice.tagType" size="small" effect="light">
                {{ notice.tag }}
              </el-tag>
              <el-icon v-if="notice.bell" class="notice-bell" color="#e6a23c"><Bell /></el-icon>
            </div>
          </div>
        </PortalPanel>
      </el-col>

      <!-- 我的视图 -->
      <el-col :xs="24" :md="12">
        <PortalPanel title="我的视图" :icon="Grid" icon-color="#409eff">
          <div class="view-icons">
            <div
              v-for="view in myViews"
              :key="view.name"
              class="view-item"
              :class="{ clickable: view.path }"
              @click="view.path && router.push(view.path)"
            >
              <div class="view-icon" :style="{ backgroundColor: view.bgColor }">
                <el-icon :size="28" :color="view.iconColor">
                  <component :is="view.icon" />
                </el-icon>
              </div>
              <span class="view-name">{{ view.name }}</span>
            </div>
          </div>
          <div class="shortcut-title">快捷方式</div>
          <div class="shortcut-btns">
            <el-button
              v-for="action in shortcutActions"
              :key="action.label"
              :type="action.type"
              size="small"
              plain
              @click="handleShortcut(action)"
            >
              {{ action.label }}
            </el-button>
          </div>
        </PortalPanel>
      </el-col>
    </el-row>

    <!-- 底部：待办事项 + 我安排的工作 -->
    <el-row :gutter="16" class="bottom-row">
      <!-- 待办事项 -->
      <el-col :xs="24" :md="12">
        <PortalPanel title="待办事项" :icon="Tickets" icon-color="#67c23a">
          <div class="todo-list">
            <div
              v-for="(todo, idx) in todoItems"
              :key="idx"
              class="todo-item"
              :class="{ clickable: todo.path }"
              @click="todo.path && router.push(todo.path)"
            >
              <div class="todo-type" :style="{ backgroundColor: todo.typeColor }">
                <el-icon :size="14" color="#fff"><component :is="todo.typeIcon" /></el-icon>
              </div>
              <div class="todo-content">
                <div class="todo-title">
                  <span class="todo-date">[{{ todo.startDate }} 开始]</span>
                  <span class="todo-name">{{ todo.name }}</span>
                </div>
              </div>
              <el-tag :type="todo.statusType" size="small" effect="light" round>
                {{ todo.status }}
              </el-tag>
            </div>
          </div>
        </PortalPanel>
      </el-col>

      <!-- 我安排的工作 -->
      <el-col :xs="24" :md="12">
        <PortalPanel title="我安排的工作" :icon="Document" icon-color="#e6a23c">
          <el-tabs v-model="activeWorkTab" class="work-tabs">
            <el-tab-pane
              v-for="tab in workTabs"
              :key="tab.name"
              :label="tab.label"
              :name="tab.name"
            >
              <template #label>
                <span class="tab-label">
                  {{ tab.label }}
                  <el-badge
                    v-if="tab.count > 0"
                    :value="tab.count"
                    :max="99"
                    class="tab-badge"
                  />
                </span>
              </template>
            </el-tab-pane>
          </el-tabs>
          <div class="work-list">
            <div
              v-for="(work, idx) in workItems"
              :key="idx"
              class="todo-item"
              :class="{ clickable: work.path }"
              @click="work.path && router.push(work.path)"
            >
              <div class="todo-content">
                <div class="todo-title">
                  <span class="todo-date">[{{ work.startDate }} 开始]</span>
                  <span class="todo-name">{{ work.name }}</span>
                </div>
              </div>
              <el-tag :type="work.statusType" size="small" effect="light" round>
                {{ work.status }}
              </el-tag>
            </div>
          </div>
        </PortalPanel>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import {
  Bell,
  Grid,
  Tickets,
  Document,
  TrendCharts,
  EditPen,
  List,
  Warning,
  View,
  Calendar,
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import StatCard from '@/components/StatCard.vue'
import PortalPanel from '@/components/PortalPanel.vue'

const router = useRouter()

// 顶部统计卡片数据（path：点击跳转目标，无 path 则不可点击）
const statCards = reactive([
  {
    title: '我的计划',
    path: '/oa/plan/mine',
    current: 0,
    total: 2,
    subLabel: '已开展',
    percent: 0,
    color: '#409eff',
    bgColor: '#ecf5ff',
    iconColor: '#409eff',
    icon: markRaw(TrendCharts),
  },
  {
    title: '我的必做任务',
    path: '/oa/required-task',
    current: 0,
    total: 0,
    subLabel: '已开展',
    percent: 0,
    color: '#67c23a',
    bgColor: '#f0f9eb',
    iconColor: '#67c23a',
    icon: markRaw(List),
  },
  {
    title: '我的审批',
    path: '/oa/approval/todo',
    current: 0,
    total: 0,
    subLabel: '已审批',
    percent: 0,
    color: '#e6a23c',
    bgColor: '#fdf6ec',
    iconColor: '#e6a23c',
    icon: markRaw(Document),
  },
  {
    title: '我的BUG',
    current: 0,
    total: 0,
    subLabel: '进展',
    percent: 0,
    color: '#f56c6c',
    bgColor: '#fef0f0',
    iconColor: '#f56c6c',
    icon: markRaw(Warning),
  },
])

// 我的提醒数据（path：点击跳转目标）
const notices = ref([
  { text: '今天是2026年08月04日，星期二', tag: '', tagType: '', bell: false, path: '' },
  { text: '[08:30] 检查今天考勤了吗?', tag: '公司', tagType: 'warning', bell: true, path: '/hr/attendance' },
])

// 我的视图数据（path：点击跳转目标）
const myViews = reactive([
  { name: '工作审批', path: '/oa/approval/todo', icon: markRaw(Document), bgColor: '#e6f7ff', iconColor: '#1890ff' },
  { name: '工作计划', path: '/oa/plan/mine', icon: markRaw(Calendar), bgColor: '#fff7e6', iconColor: '#fa8c16' },
  { name: '必做任务', path: '/oa/required-task', icon: markRaw(List), bgColor: '#f6ffed', iconColor: '#52c41a' },
  { name: '工作日志', path: '/oa/log/work', icon: markRaw(EditPen), bgColor: '#f9f0ff', iconColor: '#722ed1' },
  { name: '我的项目', icon: markRaw(View), bgColor: '#fff1f0', iconColor: '#f5222d' },
])

// 快捷方式（跳转到对应列表页新增）
const shortcutActions = [
  { label: '新增工作计划', type: 'primary', path: '/oa/plan/mine' },
  { label: '新增任务', type: 'success', path: '/oa/required-task' },
  { label: '新增日志', type: 'warning', path: '/oa/log/work' },
  { label: '新增BUG', type: 'danger', path: '' },
]

const handleShortcut = (action: { label: string; path: string }) => {
  if (action.path) {
    router.push(action.path)
  } else {
    ElMessage.info('BUG 管理功能暂未开放')
  }
}

// 待办事项数据（path：点击跳转目标）
const todoItems = reactive([
  {
    startDate: '2025-12-31',
    name: '税务备案单证快速生成',
    path: '/oa/plan/mine',
    status: '未开展',
    statusType: 'info' as const,
    typeIcon: markRaw(EditPen),
    typeColor: '#409eff',
  },
  {
    startDate: '2026-01-04',
    name: '付款申请流水列表导出',
    path: '/oa/plan/mine',
    status: '未开展',
    statusType: 'info' as const,
    typeIcon: markRaw(List),
    typeColor: '#67c23a',
  },
])

// 我安排的工作 tabs
const activeWorkTab = ref('pending')
const workTabs = [
  { name: 'pending', label: '未开展', count: 13 },
  { name: 'started', label: '已开展', count: 0 },
  { name: 'approval', label: '待我审批的工作', count: 0 },
  { name: 'flow', label: '待我审批的流程', count: 0 },
]

// 我安排的工作数据（path：点击跳转目标）
const workItems = reactive([
  {
    startDate: '2025-12-31',
    name: '4 代理业务支付审批流程',
    path: '/oa/plan/assigned',
    status: '未开展',
    statusType: 'info' as const,
  },
  {
    startDate: '2025-12-31',
    name: '5"我的报销"页面增加',
    path: '/oa/plan/assigned',
    status: '未开展',
    statusType: 'info' as const,
  },
  {
    startDate: '2025-12-31',
    name: '6 审批通过的提醒功能',
    path: '/oa/plan/assigned',
    status: '未开展',
    statusType: 'info' as const,
  },
])
</script>

<style scoped lang="scss">
.dashboard {
  padding: 12px;
  background: #f0f2f5;
  min-height: 100%;
}

/* ===== 布局 ===== */
.stat-row,
.middle-row,
.bottom-row {
  margin-bottom: 16px;
}

/* ===== 可点击跳转 ===== */
.notice-item.clickable,
.todo-item.clickable {
  cursor: pointer;
}

/* ===== 我的提醒 ===== */
.notice-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notice-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fdf6ec;
  border-radius: 4px;
  border-left: 3px solid #e6a23c;
}

.notice-icon {
  flex-shrink: 0;
}

.notice-text {
  flex: 1;
  font-size: 13px;
  color: #606266;
}

.notice-bell {
  margin-left: auto;
}

/* ===== 我的视图 ===== */
.view-icons {
  display: flex;
  justify-content: space-around;
  margin-bottom: 16px;
}

.view-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;

  &:hover .view-icon {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.view-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.view-name {
  font-size: 12px;
  color: #606266;
}

.shortcut-title {
  font-size: 13px;
  color: #909399;
  margin-bottom: 10px;
  padding-top: 8px;
  border-top: 1px dashed #ebeef5;
}

.shortcut-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* ===== 待办事项 & 我安排的工作 ===== */
.todo-list,
.work-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #f8f9fb;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: #eef1f6;
  }
}

.todo-type {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.todo-content {
  flex: 1;
  min-width: 0;
}

.todo-title {
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.todo-date {
  color: #909399;
  margin-right: 6px;
}

.todo-name {
  color: #303133;
}

/* ===== 工作 tabs ===== */
.work-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 12px;
  }

  :deep(.el-tabs__item) {
    font-size: 13px;
  }
}

.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.tab-badge {
  margin-left: 2px;
}
</style>
