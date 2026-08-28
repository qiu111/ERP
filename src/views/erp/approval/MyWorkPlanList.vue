<template>
  <div class="my-work-plan-list">
    <SearchBar
      :title="pageTitle"
      :fields="searchFields"
      v-model="searchModel"
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #extra>
        <el-button :color="'#ffbc00'" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加
        </el-button>
      </template>
    </SearchBar>

    <div class="my-work-plan-list__table-wrap">
      <CommonTable
        v-loading="loading"
        :columns="columns"
        :data="tableData"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        :row-key="'id'"
        height="100%"
        @page-change="handlePageChange"
        @page-size-change="handleSizeChange"
      >
        <template #column-title="{ row }">
          <el-tooltip :content="row.title" placement="top" effect="dark">
            <span class="title-text">{{ row.title }}</span>
          </el-tooltip>
        </template>

        <template #column-auditor="{ row }">
          <span v-if="row.auditor && row.auditor !== '-'">{{ row.auditor }}</span>
          <span v-else class="dash-text">-</span>
        </template>

        <template #column-progressStatus="{ row }">
          <el-tag
            :type="progressStatusTagTypeMap[row.progressStatus]"
            effect="light"
            size="small"
          >
            {{ getProgressStatusLabel(row.progressStatus) }}
          </el-tag>
        </template>

        <!-- 开始时间列：not_started/in_progress 未开始 -> 红 + 预计 Tag；audited/completed -> 蓝/正常 + 实际 Tag -->
        <template #column-startTime="{ row }">
          <div class="time-cell">
            <template v-if="isPlannedOnly(row, 'start')">
              <span class="planned-red-text">{{ row.plannedStartTime }}</span>
              <el-tag type="success" effect="plain" size="small">预计</el-tag>
            </template>
            <template v-else>
              <span>{{ row.actualStartTime || row.plannedStartTime }}</span>
              <el-tag v-if="row.actualStartTime" type="primary" effect="plain" size="small">实际</el-tag>
            </template>
          </div>
        </template>

        <template #column-endTime="{ row }">
          <div class="time-cell">
            <template v-if="isPlannedOnly(row, 'end')">
              <span class="planned-red-text">{{ row.plannedEndTime }}</span>
              <el-tag type="success" effect="plain" size="small">预计</el-tag>
            </template>
            <template v-else>
              <span>{{ row.actualEndTime || row.plannedEndTime }}</span>
              <el-tag v-if="row.actualEndTime" type="primary" effect="plain" size="small">实际</el-tag>
            </template>
          </div>
        </template>

        <template #operation="{ row }">
          <el-button type="success" link size="small" @click="handleView(row)">
            <el-icon><View /></el-icon>
            详情
          </el-button>
          <!-- 可编辑条件：not_started / in_progress 且非已审核 -->
          <el-button
            v-if="canEdit(row)"
            type="primary"
            link
            size="small"
            @click="handleEdit(row)"
          >
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <!-- 删除条件：未审核的 草稿/进行中 -->
          <el-button
            v-if="canDelete(row)"
            type="danger"
            link
            size="small"
            @click="handleDelete(row)"
          >
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
          <!-- 开始：还未开始 -> 进行中 -->
          <el-button
            v-if="row.progressStatus === 'not_started'"
            type="success"
            link
            size="small"
            @click="handleAction(row, 'start')"
          >
            <el-icon><VideoPlay /></el-icon>
            开始
          </el-button>
          <!-- 完成：进行中 -> completed -->
          <el-button
            v-if="row.progressStatus === 'in_progress'"
            type="warning"
            link
            size="small"
            @click="handleAction(row, 'finish')"
          >
            <el-icon><CircleCheckFilled /></el-icon>
            完成
          </el-button>
          <!-- 重新开始：已取消 -> not_started -->
          <el-button
            v-if="row.progressStatus === 'cancelled'"
            type="primary"
            link
            size="small"
            @click="handleAction(row, 'reopen')"
          >
            <el-icon><RefreshRight /></el-icon>
            重新开始
          </el-button>
        </template>
      </CommonTable>
    </div>

    <WorkPlanDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import {
  View,
  Plus,
  Edit,
  Delete,
  VideoPlay,
  CircleCheckFilled,
  RefreshRight,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import useListPage from '@/composables/useListPage'
import WorkPlanDialog from './WorkPlanDialog.vue'
import {
  getWorkPlanPage,
  deleteWorkPlan,
  changeWorkPlanProgress,
  auditorOptions,
  progressStatusOptions,
  timeTypeOptions,
  getProgressStatusLabel,
  progressStatusTagTypeMap,
  type WorkPlanItem,
  type WorkProgressStatus,
  type WorkTimeType,
} from '@/mock/workPlan'

const pageTitle = '我的工作计划'
const CURRENT_SUBMITTER = '超级管理员' // 「我的」：默认只看当前登录用户发起

const tableData = ref<WorkPlanItem[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<WorkPlanItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  auditor: '',
  progressStatus: '' as WorkProgressStatus | '',
  timeType: '' as WorkTimeType | '',
  date: '',
  keyword: '',
})

const {
  currentPage,
  pageSize,
  total,
  loading,
  handlePageChange,
  handleSizeChange,
  setLoadFn,
} = useListPage()

const searchFields: SearchField[] = [
  {
    prop: 'auditor',
    label: '审核人:',
    type: 'select',
    placeholder: '请选择人员',
    options: auditorOptions,
    span: 8,
  },
  {
    prop: 'progressStatus',
    label: '完成程度:',
    type: 'select',
    placeholder: '请选择',
    options: progressStatusOptions,
    span: 8,
  },
  {
    prop: 'timeType',
    label: '时间类型:',
    type: 'select',
    placeholder: '请选择',
    options: timeTypeOptions,
    span: 8,
  },
  {
    prop: 'date',
    label: '日期:',
    type: 'date',
    placeholder: '选择日期',
    span: 12,
  },
  {
    prop: 'keyword',
    label: '搜索:',
    type: 'input',
    placeholder: '计划主题及内容',
    span: 12,
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '编号', width: 80, align: 'center' },
  { prop: 'title', label: '工作标题', minWidth: 260, slot: true },
  { prop: 'auditor', label: '审核人', width: 120, align: 'center', slot: true },
  { prop: 'progressStatus', label: '完成程度', width: 110, align: 'center', slot: true },
  { prop: 'startTime', label: '开始时间', width: 210, align: 'center', slot: true },
  { prop: 'endTime', label: '完成时间', width: 210, align: 'center', slot: true },
]

/** 开始/结束时间是否仅用预计（还未开始/进行中 时） */
const isPlannedOnly = (row: WorkPlanItem, kind: 'start' | 'end'): boolean => {
  if (row.progressStatus === 'not_started' || row.progressStatus === 'in_progress') {
    if (kind === 'start') return !row.actualStartTime
    return !row.actualEndTime
  }
  return false
}
const canEdit = (row: WorkPlanItem) => row.progressStatus === 'not_started' || row.progressStatus === 'in_progress'
const canDelete = (row: WorkPlanItem) => row.progressStatus === 'not_started' || row.progressStatus === 'in_progress' || row.progressStatus === 'cancelled'

// ========== 数据加载 ==========
const loadData = async () => {
  loading.value = true
  try {
    const res = await getWorkPlanPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      submitter: CURRENT_SUBMITTER, // 「我的工作计划」强制过滤为当前用户
      auditor: searchModel.auditor || undefined,
      progressStatus: searchModel.progressStatus || undefined,
      timeType: searchModel.timeType || undefined,
      date: searchModel.date || undefined,
      keyword: searchModel.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载我的工作计划失败:', e)
  } finally {
    loading.value = false
  }
}
setLoadFn(loadData)

// ========== 搜索/重置 ==========
const handleSearch = () => {
  currentPage.value = 1
  loadData()
}
const handleReset = () => {
  searchModel.auditor = ''
  searchModel.progressStatus = ''
  searchModel.timeType = ''
  searchModel.date = ''
  searchModel.keyword = ''
  currentPage.value = 1
  loadData()
}

// ========== 操作 ==========
const handleAdd = () => {
  dialogMode.value = 'add'
  currentRecord.value = null
  dialogVisible.value = true
}
const handleView = (row: WorkPlanItem) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleEdit = (row: WorkPlanItem) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleDelete = async (row: WorkPlanItem) => {
  try {
    await ElMessageBox.confirm(`确定删除「${row.title}」吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await deleteWorkPlan(row.id)
  if (res.code === 200 && res.data) {
    ElMessage.success('删除成功')
    loadData()
  } else {
    ElMessage.error('删除失败')
  }
}
const handleAction = async (row: WorkPlanItem, action: 'start' | 'finish' | 'reopen') => {
  const map: Record<string, string> = {
    start: '开始执行',
    finish: '标记完成',
    reopen: '重新开启',
  }
  try {
    await ElMessageBox.confirm(`确定对「${row.title}」执行【${map[action]}】操作？`, `${map[action]}确认`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await changeWorkPlanProgress(row.id, action)
  if (res.code === 200 && res.data && res.data.id) {
    ElMessage.success(`${map[action]}成功`)
    loadData()
  } else {
    ElMessage.error(`${map[action]}失败：当前状态不允许`)
  }
}

const handleSuccess = () => loadData()

onMounted(() => loadData())
</script>

<style scoped lang="scss">
.my-work-plan-list {
  display: flex;
  flex-direction: column;
  padding: 16px;
  height: calc(100vh - 100px);
  overflow: hidden;

  &__table-wrap {
    flex: 1;
    min-height: 0;
    background: #fff;
    border-radius: 4px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.title-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.dash-text {
  color: #909399;
}

.time-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.planned-red-text {
  color: #f56c6c;
}
</style>
