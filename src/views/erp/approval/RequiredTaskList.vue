<template>
  <div class="required-task-list">
    <SearchBar
      :title="pageTitle"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="required-task-list__table-wrap">
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

        <template #column-cycle="{ row }">
          <span>{{ getCycleLabel(row.cycle) }}</span>
        </template>

        <!-- 完成情况：今日未执行=红 / 今日已执行=绿 -->
        <template #column-todayDone="{ row }">
          <span :class="row.todayDone ? 'done-text' : 'undone-text'">
            {{ row.todayDone ? '今日已执行' : '今日未执行' }}
          </span>
        </template>

        <template #column-taskTime="{ row }">
          <span>{{ row.taskStartTime }}--{{ row.taskEndTime }}</span>
        </template>

        <template #column-needRemind="{ row }">
          <span>{{ row.needRemind ? '是' : '否' }}</span>
        </template>

        <template #column-remindTime="{ row }">
          <span v-if="row.needRemind && row.remindHours">{{ row.remindHours }}小时</span>
          <span v-else class="dash-text">-</span>
        </template>

        <template #operation="{ row }">
          <el-button type="success" link size="small" @click="handleView(row)">
            <el-icon><View /></el-icon>
            详情
          </el-button>
          <!-- 编辑条件：今日未执行（已执行的当日不可再修改） -->
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
        </template>
      </CommonTable>
    </div>

    <RequiredTaskDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { View, Edit } from '@element-plus/icons-vue'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import useListPage from '@/composables/useListPage'
import RequiredTaskDialog from './RequiredTaskDialog.vue'
import {
  getRequiredTaskPage,
  taskCycleOptions,
  getCycleLabel,
  type RequiredTaskItem,
  type TaskCycle,
} from '@/mock/requiredTask'

const pageTitle = '必做任务'

const tableData = ref<RequiredTaskItem[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<RequiredTaskItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  cycle: '' as TaskCycle | '',
  taskTime: '' as [string, string] | '',
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
    prop: 'cycle',
    label: '任务周期:',
    type: 'select',
    placeholder: '请选择',
    options: taskCycleOptions,
  },
  {
    prop: 'taskTime',
    label: '任务时间:',
    type: 'timerange',
    startPlaceholder: '开始时间',
    endPlaceholder: '结束时间',
  },
  {
    prop: 'keyword',
    label: '搜索内容:',
    type: 'input',
    placeholder: '请输入任务标题或内容',
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '编号', width: 80, align: 'center' },
  { prop: 'title', label: '标题', minWidth: 240, slot: true },
  { prop: 'cycle', label: '任务周期', width: 110, align: 'center', slot: true },
  { prop: 'todayDone', label: '完成情况', width: 110, align: 'center', slot: true },
  { prop: 'taskTime', label: '任务时间', width: 140, align: 'center', slot: true },
  { prop: 'needRemind', label: '是否提醒', width: 100, align: 'center', slot: true },
  { prop: 'remindTime', label: '提醒时间', width: 110, align: 'center', slot: true },
  { prop: 'submitter', label: '提交人', width: 110, align: 'center' },
  { prop: 'submitTime', label: '提交时间', width: 160, align: 'center' },
]

const canEdit = (row: RequiredTaskItem) => !row.todayDone

// ========== 数据加载 ==========
const loadData = async () => {
  loading.value = true
  try {
    const timeRange = Array.isArray(searchModel.taskTime) ? searchModel.taskTime : ['', '']
    const res = await getRequiredTaskPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      cycle: searchModel.cycle || undefined,
      timeStart: timeRange[0] || undefined,
      timeEnd: timeRange[1] || undefined,
      keyword: searchModel.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载必做任务失败:', e)
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
  searchModel.cycle = ''
  searchModel.taskTime = ''
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
const handleView = (row: RequiredTaskItem) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleEdit = (row: RequiredTaskItem) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}

onMounted(() => loadData())
</script>

<style scoped lang="scss">
.required-task-list {
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

.done-text {
  color: #67c23a;
}
.undone-text {
  color: #f56c6c;
}
</style>
