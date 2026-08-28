<template>
  <div class="enterprise-portal">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="item in stats" :key="item.key">
        <StatCard
          :title="item.title"
          :current="item.current"
          :total="item.total"
          :percent="item.percent"
          :color="statColors[item.key].main"
          :bg-color="statColors[item.key].bg"
          :icon-color="statColors[item.key].main"
          :icon="statIcons[item.key]"
        >
          <template #sub>
            <span>
              环比
              <span :class="item.trend === 'up' ? 'trend-up' : 'trend-down'">
                {{ item.trend === 'up' ? '↑' : '↓' }} {{ item.trendPercent }}%
              </span>
            </span>
          </template>
        </StatCard>
      </el-col>
    </el-row>

    <!-- 中部：企业信息 + 企业待办 -->
    <el-row :gutter="16" class="middle-row">
      <el-col :xs="24" :md="12">
        <PortalPanel title="企业信息" :icon="OfficeBuilding" icon-color="#409eff">
          <div class="profile-list">
              <div class="profile-item">
                <span class="profile-label">企业名称</span>
                <span class="profile-value">{{ profile.name }}</span>
              </div>
              <div class="profile-item">
                <span class="profile-label">所属行业</span>
                <span class="profile-value">{{ profile.industry }}</span>
              </div>
              <div class="profile-item">
                <span class="profile-label">企业地址</span>
                <span class="profile-value">{{ profile.address }}</span>
              </div>
              <div class="profile-item">
                <span class="profile-label">法定代表人</span>
                <span class="profile-value">{{ profile.legalPerson }}</span>
              </div>
              <div class="profile-item">
                <span class="profile-label">成立年份</span>
                <span class="profile-value">{{ profile.foundedYear }} 年</span>
              </div>
              <div class="profile-item">
                <span class="profile-label">在职员工</span>
                <span class="profile-value">{{ profile.employeeCount }} 人</span>
              </div>
            </div>
            <div class="shortcut-title">快捷入口</div>
            <div class="shortcut-btns">
              <el-button
                v-for="entry in quickEntries"
                :key="entry.key"
                size="small"
                plain
                @click="router.push(entry.path)"
              >
                {{ entry.label }}
              </el-button>
            </div>
        </PortalPanel>
      </el-col>

      <el-col :xs="24" :md="12">
        <PortalPanel title="企业待办" :icon="Tickets" icon-color="#e6a23c">
          <div class="summary-grid">
            <div
              v-for="s in summaryCards"
              :key="s.label"
              class="summary-item"
              @click="router.push(s.path)"
            >
              <el-badge :value="s.value" :max="99" type="warning">
                <div class="summary-icon" :style="{ backgroundColor: s.bg }">
                  <el-icon :size="24" :color="s.color"><component :is="s.icon" /></el-icon>
                </div>
              </el-badge>
              <span class="summary-label">{{ s.label }}</span>
            </div>
          </div>
        </PortalPanel>
      </el-col>
    </el-row>

    <!-- 底部：最新公告 + 部门动态 -->
    <el-row :gutter="16" class="bottom-row">
      <el-col :xs="24" :md="12">
        <PortalPanel title="最新公告" :icon="Bell" icon-color="#67c23a">
          <template #actions>
            <el-icon class="action-icon" @click="router.push('/oa/notice/list')"><More /></el-icon>
          </template>
          <div class="notice-list">
            <div v-for="item in notices" :key="item.id" class="notice-item">
              <el-icon class="notice-icon" color="#67c23a"><Bell /></el-icon>
              <span class="notice-text">{{ item.title }}</span>
              <span class="notice-time">{{ item.operateTime }}</span>
            </div>
            <el-empty v-if="notices.length === 0" description="暂无公告" :image-size="60" />
          </div>
        </PortalPanel>
      </el-col>

      <el-col :xs="24" :md="12">
        <PortalPanel title="部门动态" :icon="ChatDotRound" icon-color="#e6a23c">
          <div class="dynamic-list">
            <div v-for="item in dynamics" :key="item.id" class="dynamic-item">
              <el-tag :type="deptDynamicTypeMap[item.type].tag" size="small" effect="light" class="dynamic-tag">
                {{ item.dept }}
              </el-tag>
              <span class="dynamic-text">{{ item.content }}</span>
              <span class="dynamic-time">{{ item.time }}</span>
            </div>
            <el-empty v-if="dynamics.length === 0" description="暂无动态" :image-size="60" />
          </div>
        </PortalPanel>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import {
  Bell,
  More,
  Tickets,
  OfficeBuilding,
  ChatDotRound,
  TrendCharts,
  ShoppingCart,
  Warning,
  UserFilled,
  Document,
  ChatLineSquare,
  EditPen,
  List,
  DataAnalysis,
  Finished,
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import StatCard from '@/components/StatCard.vue'
import PortalPanel from '@/components/PortalPanel.vue'
import {
  getCompanyProfile,
  getPortalStats,
  getDeptDynamics,
  getQuickEntries,
  getPortalSummary,
  deptDynamicTypeMap,
  type CompanyProfile,
  type PortalStatItem,
  type DeptDynamicItem,
  type QuickEntryItem,
  type PortalSummary,
} from '@/mock/enterprisePortal'
import { getAnnouncementPage } from '@/mock/announcement'

const router = useRouter()

// ===== 概览统计 =====
const statColors: Record<PortalStatItem['key'], { main: string; bg: string }> = {
  sales: { main: '#409eff', bg: '#ecf5ff' },
  purchase: { main: '#67c23a', bg: '#f0f9eb' },
  stock_warning: { main: '#f56c6c', bg: '#fef0f0' },
  employee: { main: '#e6a23c', bg: '#fdf6ec' },
}
const statIcons: Record<PortalStatItem['key'], any> = {
  sales: markRaw(TrendCharts),
  purchase: markRaw(ShoppingCart),
  stock_warning: markRaw(Warning),
  employee: markRaw(UserFilled),
}
const stats = ref<PortalStatItem[]>([])

// ===== 企业信息 =====
const profile = ref<CompanyProfile>({
  name: '-', industry: '-', address: '-', legalPerson: '-', employeeCount: 0, foundedYear: 0,
})
const quickEntries = ref<QuickEntryItem[]>([])

// ===== 企业待办 =====
const summary = ref<PortalSummary>({
  pendingApproval: 0, unreadNotice: 0, todoDocument: 0, deptPlan: 0,
})
const summaryCards = computed(() => [
  { label: '待我审批', value: summary.value.pendingApproval, path: '/oa/approval/todo', icon: markRaw(Document), color: '#e6a23c', bg: '#fdf6ec' },
  { label: '待处理公文', value: summary.value.todoDocument, path: '/oa/document/todo', icon: markRaw(ChatLineSquare), color: '#409eff', bg: '#ecf5ff' },
  { label: '未读公告', value: summary.value.unreadNotice, path: '/oa/notice/list', icon: markRaw(Bell), color: '#67c23a', bg: '#f0f9eb' },
  { label: '部门计划', value: summary.value.deptPlan, path: '/oa/plan/dept', icon: markRaw(EditPen), color: '#f56c6c', bg: '#fef0f0' },
])

// ===== 最新公告 / 部门动态 =====
const notices = ref<{ id: string; title: string; operateTime: string }[]>([])
const dynamics = ref<DeptDynamicItem[]>([])

onMounted(async () => {
  const [p, s, q, sum, n, d] = await Promise.all([
    getCompanyProfile(),
    getPortalStats(),
    getQuickEntries(),
    getPortalSummary(),
    getAnnouncementPage({ page: 1, pageSize: 5 }),
    getDeptDynamics(6),
  ])
  profile.value = p.data
  stats.value = s.data
  quickEntries.value = q.data
  summary.value = sum.data
  notices.value = n.data.list.map((r) => ({ id: r.id, title: r.title, operateTime: r.operateTime }))
  dynamics.value = d.data
})
</script>

<style scoped lang="scss">
.enterprise-portal {
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

/* ===== 统计卡片环比 ===== */
.trend-up {
  color: #f56c6c;
}

.trend-down {
  color: #67c23a;
}

/* ===== 企业信息 ===== */
.profile-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}

.profile-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  padding: 6px 10px;
  background: #f8f9fb;
  border-radius: 4px;
}

.profile-label {
  width: 90px;
  flex-shrink: 0;
  color: #909399;
}

.profile-value {
  color: #303133;
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

/* ===== 企业待办 ===== */
.summary-grid {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;

  &:hover .summary-icon {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.summary-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.summary-label {
  font-size: 12px;
  color: #606266;
}

/* ===== 最新公告 ===== */
.notice-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notice-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fb;
  border-radius: 4px;
  border-left: 3px solid #67c23a;

  &:hover {
    background: #eef1f6;
  }
}

.notice-icon {
  flex-shrink: 0;
}

.notice-text {
  flex: 1;
  font-size: 13px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notice-time {
  flex-shrink: 0;
  font-size: 12px;
  color: #909399;
}

/* ===== 部门动态 ===== */
.dynamic-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dynamic-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fb;
  border-radius: 4px;

  &:hover {
    background: #eef1f6;
  }
}

.dynamic-tag {
  flex-shrink: 0;
  width: 84px;
  justify-content: center;
}

.dynamic-text {
  flex: 1;
  font-size: 13px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dynamic-time {
  flex-shrink: 0;
  font-size: 12px;
  color: #909399;
}
</style>
