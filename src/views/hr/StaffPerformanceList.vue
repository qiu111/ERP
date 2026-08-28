<template>
  <div class="staff-performance-list">
    <SearchBar
      title="人员绩效管理"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="staff-performance-list__table-wrap">
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
        <template #column-score="{ row }">
          <span class="amount-text">{{ (row as StaffPerformanceItem).score }}</span>
        </template>

        <template #column-grade="{ row }">
          <el-tag :type="gradeTagTypeMap[(row as StaffPerformanceItem).grade]" effect="light" size="small">
            {{ gradeLabelMap[(row as StaffPerformanceItem).grade] }}
          </el-tag>
        </template>

        <template #column-bonus="{ row }">
          <span class="amount-text">{{ formatAmount((row as StaffPerformanceItem).bonus) }}</span>
        </template>

        <template #column-status="{ row }">
          <el-tag :type="perfStatusTagTypeMap[(row as StaffPerformanceItem).status]" effect="light" size="small">
            {{ perfStatusLabelMap[(row as StaffPerformanceItem).status] }}
          </el-tag>
        </template>

        <template #operation="{ row }">
          <el-button type="success" link size="small" @click="handleView(row)">
            <el-icon><View /></el-icon>
            详情
          </el-button>
          <!-- 仅待审批可编辑/审批/删除 -->
          <template v-if="(row as StaffPerformanceItem).status === 'pending'">
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

    <StaffPerformanceDialog
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
import StaffPerformanceDialog from './StaffPerformanceDialog.vue'
import {
  getStaffPerformancePage,
  deleteStaffPerformance,
  approveStaffPerformance,
  getAllDepartmentOptions,
  getStaffPerfPeriodOptions,
  perfStatusOptions,
  gradeLabelMap,
  gradeTagTypeMap,
  perfStatusLabelMap,
  perfStatusTagTypeMap,
  type StaffPerformanceItem,
  type PerfStatus,
} from '@/mock/hr'

const formatAmount = (n: number) =>
  (n ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const tableData = ref<StaffPerformanceItem[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<StaffPerformanceItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  status: '' as PerfStatus | '',
  deptName: '',
  period: '',
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
    prop: 'status',
    label: '状态:',
    type: 'select',
    placeholder: '请选择',
    options: perfStatusOptions,
  },
  {
    prop: 'deptName',
    label: '所属部门:',
    type: 'select',
    placeholder: '请选择',
    options: getAllDepartmentOptions(),
  },
  {
    prop: 'period',
    label: '绩效期间:',
    type: 'select',
    placeholder: '请选择',
    options: getStaffPerfPeriodOptions(),
  },
  {
    prop: 'keyword',
    label: '关键字查询:',
    type: 'input',
    placeholder: '姓名/工号/备注',
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '编号', width: 80, align: 'center' },
  { prop: 'empNo', label: '工号', width: 130, align: 'center' },
  { prop: 'employeeName', label: '姓名', width: 100, align: 'center' },
  { prop: 'deptName', label: '所属部门', width: 120, align: 'center' },
  { prop: 'period', label: '绩效期间', width: 110, align: 'center' },
  { prop: 'score', label: '得分', width: 90, align: 'right', slot: true },
  { prop: 'grade', label: '等级', width: 90, align: 'center', slot: true },
  { prop: 'bonus', label: '绩效奖金(元)', width: 140, align: 'right', slot: true },
  { prop: 'status', label: '状态', width: 100, align: 'center', slot: true },
  { prop: 'remark', label: '备注', minWidth: 180 },
  { prop: 'createTime', label: '创建时间', width: 160, align: 'center' },
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await getStaffPerformancePage({
      page: currentPage.value,
      pageSize: pageSize.value,
      status: (searchModel.status || undefined) as PerfStatus | undefined,
      deptName: searchModel.deptName || undefined,
      period: searchModel.period || undefined,
      keyword: searchModel.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载人员绩效列表失败:', e)
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
const handleView = (row: StaffPerformanceItem) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleEdit = (row: StaffPerformanceItem) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleApprove = async (row: StaffPerformanceItem) => {
  try {
    await ElMessageBox.confirm(`确定审批通过绩效单「${row.code}」吗？`, '审批确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await approveStaffPerformance(row.id)
  if (res.code === 200 && res.data && res.data.id && res.data.status === 'approved') {
    ElMessage.success('审批成功')
    loadData()
  } else {
    ElMessage.error('审批失败')
  }
}
const handleDelete = async (row: StaffPerformanceItem) => {
  try {
    await ElMessageBox.confirm(`确定删除绩效单「${row.code}」吗？删除后无法恢复`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await deleteStaffPerformance(row.id)
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
.staff-performance-list {
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

.amount-text {
  font-weight: 600;
  color: #303133;
}
</style>
