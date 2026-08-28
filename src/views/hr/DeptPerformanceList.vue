<template>
  <div class="dept-performance-list">
    <SearchBar
      title="部门绩效管理"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="dept-performance-list__table-wrap">
      <CommonTable
        v-loading="loading"
        :columns="columns"
        :data="tableData"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        :row-key="'id'"
        height="100%"
        :operation-width="280"
        @page-change="handlePageChange"
        @page-size-change="handleSizeChange"
      >
        <template #column-completionRate="{ row }">
          <el-tag
            :type="rateTagType((row as DeptPerformanceItem).completionRate)"
            effect="light"
            size="small"
          >
            {{ (row as DeptPerformanceItem).completionRate.toFixed(2) }}%
          </el-tag>
        </template>

        <template #column-status="{ row }">
          <el-tag :type="perfStatusTagTypeMap[(row as DeptPerformanceItem).status]" effect="light" size="small">
            {{ perfStatusLabelMap[(row as DeptPerformanceItem).status] }}
          </el-tag>
        </template>

        <template #operation="{ row }">
          <el-button type="success" link size="small" @click="handleView(row)">
            <el-icon><View /></el-icon>
            详情
          </el-button>
          <!-- 仅待审批可编辑/审批/删除 -->
          <template v-if="(row as DeptPerformanceItem).status === 'pending'">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="success" link size="small" @click="handleApprove(row)">
              <el-icon><Check /></el-icon>
              审批
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </template>
      </CommonTable>
    </div>

    <DeptPerformanceDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { View, Edit, Delete, Check } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import useListPage from '@/composables/useListPage'
import DeptPerformanceDialog from './DeptPerformanceDialog.vue'
import {
  getDeptPerformancePage,
  deleteDeptPerformance,
  approveDeptPerformance,
  getAllDepartmentOptions,
  getDeptPerfPeriodOptions,
  perfStatusOptions,
  perfStatusLabelMap,
  perfStatusTagTypeMap,
  type DeptPerformanceItem,
  type PerfStatus,
  type HrTagType,
} from '@/mock/hr'

const tableData = ref<DeptPerformanceItem[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<DeptPerformanceItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  status: '' as PerfStatus | '',
  deptName: '',
  period: '',
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
    prop: 'status',
    label: '状态:',
    type: 'select',
    placeholder: '请选择',
    options: perfStatusOptions,
  },
  {
    prop: 'deptName',
    label: '部门:',
    type: 'select',
    placeholder: '请选择',
    options: getAllDepartmentOptions(),
  },
  {
    prop: 'period',
    label: '绩效期间:',
    type: 'select',
    placeholder: '请选择',
    options: getDeptPerfPeriodOptions(),
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '编号', width: 80, align: 'center' },
  { prop: 'deptName', label: '部门', minWidth: 140 },
  { prop: 'period', label: '绩效期间', width: 120, align: 'center' },
  { prop: 'planScore', label: '计划得分', width: 110, align: 'right' },
  { prop: 'actualScore', label: '实际得分', width: 110, align: 'right' },
  { prop: 'completionRate', label: '完成率', width: 120, align: 'right', slot: true },
  { prop: 'status', label: '状态', width: 100, align: 'center', slot: true },
  { prop: 'remark', label: '备注', minWidth: 180 },
  { prop: 'createTime', label: '创建时间', width: 160, align: 'center' },
]

// 完成率标签颜色：≥100% success，80-99.99% primary，60-79.99% warning，<60% danger
const rateTagType = (rate: number): HrTagType => {
  if (rate >= 100) return 'success'
  if (rate >= 80) return 'primary'
  if (rate >= 60) return 'warning'
  return 'danger'
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getDeptPerformancePage({
      page: currentPage.value,
      pageSize: pageSize.value,
      status: (searchModel.status || undefined) as PerfStatus | undefined,
      deptName: searchModel.deptName || undefined,
      period: searchModel.period || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载部门绩效列表失败:', e)
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
  searchModel.status = ''
  searchModel.deptName = ''
  searchModel.period = ''
  currentPage.value = 1
  loadData()
}

// ========== 操作 ==========
const handleAdd = () => {
  dialogMode.value = 'add'
  currentRecord.value = null
  dialogVisible.value = true
}
const handleView = (row: DeptPerformanceItem) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleEdit = (row: DeptPerformanceItem) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleApprove = async (row: DeptPerformanceItem) => {
  try {
    await ElMessageBox.confirm(`确定审批通过「${row.deptName}-${row.period}」部门绩效吗？`, '审批确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await approveDeptPerformance(row.id)
  if (res.code === 200 && res.data && res.data.id && res.data.status === 'approved') {
    ElMessage.success('审批成功')
    loadData()
  } else {
    ElMessage.error('审批失败')
  }
}
const handleDelete = async (row: DeptPerformanceItem) => {
  try {
    await ElMessageBox.confirm(`确定删除「${row.deptName}-${row.period}」部门绩效吗？删除后无法恢复`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await deleteDeptPerformance(row.id)
  if (res.code === 200 && res.data) {
    ElMessage.success('删除成功')
    loadData()
  } else {
    ElMessage.error('删除失败')
  }
}

onMounted(() => loadData())
</script>

<style scoped lang="scss">
.dept-performance-list {
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
</style>
