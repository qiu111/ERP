<template>
  <div class="employee-list">
    <SearchBar
      title="员工管理"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="employee-list__table-wrap">
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
        <template #column-gender="{ row }">
          <span>{{ getGenderLabel((row as EmployeeItem).gender) }}</span>
        </template>

        <template #column-status="{ row }">
          <el-tag :type="employeeStatusTagTypeMap[(row as EmployeeItem).status]" effect="light" size="small">
            {{ employeeStatusLabelMap[(row as EmployeeItem).status] }}
          </el-tag>
        </template>

        <template #operation="{ row }">
          <el-button type="success" link size="small" @click="handleView(row)">
            <el-icon><View /></el-icon>
            详情
          </el-button>
          <el-button type="primary" link size="small" @click="handleEdit(row)">
            <el-icon><Edit /></el-icon>
            修改
          </el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </template>
      </CommonTable>
    </div>

    <EmployeeDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { View, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import useListPage from '@/composables/useListPage'
import EmployeeDialog from './EmployeeDialog.vue'
import {
  getEmployeePage,
  deleteEmployee,
  getDepartmentOptions,
  genderOptions,
  getGenderLabel,
  employeeStatusOptions,
  employeeStatusLabelMap,
  employeeStatusTagTypeMap,
  type EmployeeItem,
  type EmployeeStatus,
  type Gender,
} from '@/mock/hr'

const tableData = ref<EmployeeItem[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<EmployeeItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  keyword: '',
  deptName: '',
  status: '' as EmployeeStatus | '',
  gender: '' as Gender | '',
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
    options: getDepartmentOptions(),
  },
  {
    prop: 'status',
    label: '状态:',
    type: 'select',
    placeholder: '请选择',
    options: employeeStatusOptions,
  },
  {
    prop: 'gender',
    label: '性别:',
    type: 'select',
    placeholder: '请选择',
    options: genderOptions,
  },
  {
    prop: 'keyword',
    label: '关键字查询:',
    type: 'input',
    placeholder: '姓名/工号',
  },
]

const columns: TableColumn[] = [
  { prop: 'empNo', label: '工号', width: 130, align: 'center' },
  { prop: 'name', label: '姓名', width: 100, align: 'center' },
  { prop: 'gender', label: '性别', width: 80, align: 'center', slot: true },
  { prop: 'deptName', label: '所属部门', width: 120, align: 'center' },
  { prop: 'positionName', label: '岗位', width: 130, align: 'center' },
  { prop: 'phone', label: '联系电话', width: 130, align: 'center' },
  { prop: 'entryDate', label: '入职日期', width: 120, align: 'center' },
  { prop: 'status', label: '状态', width: 100, align: 'center', slot: true },
  { prop: 'email', label: '邮箱', minWidth: 180 },
  { prop: 'createTime', label: '创建时间', width: 160, align: 'center' },
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await getEmployeePage({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchModel.keyword || undefined,
      deptName: searchModel.deptName || undefined,
      status: (searchModel.status || undefined) as EmployeeStatus | undefined,
      gender: (searchModel.gender || undefined) as Gender | undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载员工列表失败:', e)
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
  searchModel.gender = ''
  currentPage.value = 1
  loadData()
}

// ========== 操作 ==========
const handleAdd = () => {
  dialogMode.value = 'add'
  currentRecord.value = null
  dialogVisible.value = true
}
const handleView = (row: EmployeeItem) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleEdit = (row: EmployeeItem) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleDelete = async (row: EmployeeItem) => {
  try {
    await ElMessageBox.confirm(`确定删除员工「${row.name}」吗？删除后无法恢复`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await deleteEmployee(row.id)
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
.employee-list {
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
