<template>
  <div class="attendance-list">
    <SearchBar
      title="考勤管理"
      :fields="searchFields"
      v-model="searchModel"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="attendance-list__table-wrap">
      <CommonTable
        v-loading="loading"
        :columns="columns"
        :data="tableData"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        :row-key="'id'"
        height="100%"
        :operation-width="100"
        @page-change="handlePageChange"
        @page-size-change="handleSizeChange"
      >
        <template #column-clockIn="{ row }">
          <span v-if="(row as AttendanceItem).clockIn">{{ (row as AttendanceItem).clockIn }}</span>
          <span v-else class="dash-text">—</span>
        </template>

        <template #column-clockOut="{ row }">
          <span v-if="(row as AttendanceItem).clockOut">{{ (row as AttendanceItem).clockOut }}</span>
          <span v-else class="dash-text">—</span>
        </template>

        <template #column-status="{ row }">
          <el-tag :type="attendanceStatusTagTypeMap[(row as AttendanceItem).status]" effect="light" size="small">
            {{ attendanceStatusLabelMap[(row as AttendanceItem).status] }}
          </el-tag>
        </template>

        <template #operation="{ row }">
          <el-button type="success" link size="small" @click="handleView(row)">
            <el-icon><View /></el-icon>
            详情
          </el-button>
        </template>
      </CommonTable>
    </div>

    <AttendanceDialog
      v-model="dialogVisible"
      :record="currentRecord"
    />
  </div>
</template>

<script setup lang="ts">
import { View } from '@element-plus/icons-vue'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import useListPage from '@/composables/useListPage'
import AttendanceDialog from './AttendanceDialog.vue'
import {
  getAttendancePage,
  getAllDepartmentOptions,
  attendanceStatusOptions,
  attendanceStatusLabelMap,
  attendanceStatusTagTypeMap,
  type AttendanceItem,
  type AttendanceStatus,
} from '@/mock/hr'

const tableData = ref<AttendanceItem[]>([])
const dialogVisible = ref(false)
const currentRecord = ref<AttendanceItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  keyword: '',
  deptName: '',
  status: '' as AttendanceStatus | '',
  attendDate: '' as [string, string] | '',
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
    prop: 'deptName',
    label: '所属部门:',
    type: 'select',
    placeholder: '请选择',
    options: getAllDepartmentOptions(),
  },
  {
    prop: 'status',
    label: '考勤状态:',
    type: 'select',
    placeholder: '请选择',
    options: attendanceStatusOptions,
  },
  {
    prop: 'attendDate',
    label: '考勤日期:',
    type: 'daterange',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
  },
  {
    prop: 'keyword',
    label: '关键字查询:',
    type: 'input',
    placeholder: '员工姓名/工号',
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '编号', width: 80, align: 'center' },
  { prop: 'empNo', label: '工号', width: 130, align: 'center' },
  { prop: 'employeeName', label: '员工姓名', width: 100, align: 'center' },
  { prop: 'deptName', label: '所属部门', width: 120, align: 'center' },
  { prop: 'attendDate', label: '考勤日期', width: 120, align: 'center' },
  { prop: 'clockIn', label: '上班打卡', width: 100, align: 'center', slot: true },
  { prop: 'clockOut', label: '下班打卡', width: 100, align: 'center', slot: true },
  { prop: 'workHours', label: '工时(小时)', width: 100, align: 'right' },
  { prop: 'status', label: '状态', width: 100, align: 'center', slot: true },
  { prop: 'remark', label: '备注', minWidth: 180 },
  { prop: 'createTime', label: '创建时间', width: 160, align: 'center' },
]

const loadData = async () => {
  loading.value = true
  try {
    const range = Array.isArray(searchModel.attendDate) ? searchModel.attendDate : ['', '']
    const res = await getAttendancePage({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchModel.keyword || undefined,
      deptName: searchModel.deptName || undefined,
      status: (searchModel.status || undefined) as AttendanceStatus | undefined,
      dateStart: range[0] || undefined,
      dateEnd: range[1] || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载考勤列表失败:', e)
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
  searchModel.keyword = ''
  searchModel.deptName = ''
  searchModel.status = ''
  searchModel.attendDate = ''
  currentPage.value = 1
  loadData()
}

// ========== 操作 ==========
const handleView = (row: AttendanceItem) => {
  currentRecord.value = row
  dialogVisible.value = true
}

onMounted(() => loadData())
</script>

<style scoped lang="scss">
.attendance-list {
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

.dash-text {
  color: #c0c4cc;
}
</style>
