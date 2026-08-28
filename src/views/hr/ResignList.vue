<template>
  <div class="resign-list">
    <SearchBar
      title="离职管理"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="resign-list__table-wrap">
      <CommonTable
        v-loading="loading"
        :columns="columns"
        :data="tableData"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        :row-key="'id'"
        height="100%"
        :operation-width="340"
        @page-change="handlePageChange"
        @page-size-change="handleSizeChange"
      >
        <template #column-reason="{ row }">
          <span>{{ getResignReasonLabel((row as ResignationItem).reason) }}</span>
        </template>

        <template #column-status="{ row }">
          <el-tag :type="resignStatusTagTypeMap[(row as ResignationItem).status]" effect="light" size="small">
            {{ resignStatusLabelMap[(row as ResignationItem).status] }}
          </el-tag>
        </template>

        <template #column-resignDate="{ row }">
          <span v-if="(row as ResignationItem).resignDate">{{ (row as ResignationItem).resignDate }}</span>
          <span v-else class="dash-text">—</span>
        </template>

        <template #operation="{ row }">
          <el-button type="success" link size="small" @click="handleView(row)">
            <el-icon><View /></el-icon>
            详情
          </el-button>
          <!-- 待审批：编辑/通过/驳回/删除 -->
          <template v-if="(row as ResignationItem).status === 'pending'">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="success" link size="small" @click="handleAudit(row, 'approved')">
              <el-icon><Check /></el-icon>
              通过
            </el-button>
            <el-button type="warning" link size="small" @click="handleAudit(row, 'rejected')">
              <el-icon><Close /></el-icon>
              驳回
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
          <!-- 已通过：办理离职 -->
          <template v-else-if="(row as ResignationItem).status === 'approved'">
            <el-button type="success" link size="small" @click="handleComplete(row)">
              <el-icon><CircleCheck /></el-icon>
              办理离职
            </el-button>
          </template>
        </template>
      </CommonTable>
    </div>

    <ResignDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { View, Edit, Delete, Check, Close, CircleCheck } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import useListPage from '@/composables/useListPage'
import ResignDialog from './ResignDialog.vue'
import {
  getResignationPage,
  deleteResignation,
  auditResign,
  completeResign,
  getAllDepartmentOptions,
  resignStatusOptions,
  getResignReasonLabel,
  resignStatusLabelMap,
  resignStatusTagTypeMap,
  type ResignationItem,
  type ResignStatus,
} from '@/mock/hr'

function todayStr(): string {
  const n = new Date()
  const p = (x: number) => (x < 10 ? `0${x}` : `${x}`)
  return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`
}

const tableData = ref<ResignationItem[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<ResignationItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  status: '' as ResignStatus | '',
  deptName: '',
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
    options: resignStatusOptions,
  },
  {
    prop: 'deptName',
    label: '所属部门:',
    type: 'select',
    placeholder: '请选择',
    options: getAllDepartmentOptions(),
  },
  {
    prop: 'keyword',
    label: '关键字查询:',
    type: 'input',
    placeholder: '员工姓名/备注',
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '编号', width: 80, align: 'center' },
  { prop: 'employeeName', label: '员工姓名', width: 100, align: 'center' },
  { prop: 'deptName', label: '所属部门', width: 120, align: 'center' },
  { prop: 'reason', label: '离职原因', width: 110, align: 'center', slot: true },
  { prop: 'applyDate', label: '申请日期', width: 120, align: 'center' },
  { prop: 'resignDate', label: '离职日期', width: 120, align: 'center', slot: true },
  { prop: 'status', label: '状态', width: 100, align: 'center', slot: true },
  { prop: 'remark', label: '备注', minWidth: 180 },
  { prop: 'createTime', label: '创建时间', width: 160, align: 'center' },
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await getResignationPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      status: (searchModel.status || undefined) as ResignStatus | undefined,
      deptName: searchModel.deptName || undefined,
      keyword: searchModel.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载离职列表失败:', e)
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
const handleView = (row: ResignationItem) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleEdit = (row: ResignationItem) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleAudit = async (row: ResignationItem, status: 'approved' | 'rejected') => {
  const action = status === 'approved' ? '审批通过' : '审批驳回'
  try {
    await ElMessageBox.confirm(`确定对离职申请「${row.code}」执行${action}吗？`, '审批确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await auditResign(row.id, status)
  if (res.code === 200 && res.data && res.data.id && res.data.status === status) {
    ElMessage.success(`${action}成功`)
    loadData()
  } else {
    ElMessage.error(`${action}失败`)
  }
}
const handleComplete = async (row: ResignationItem) => {
  let resignDate = ''
  try {
    const { value } = await ElMessageBox.prompt('请输入离职日期', '办理离职', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: todayStr(),
      inputPattern: /^\d{4}-\d{2}-\d{2}$/,
      inputErrorMessage: '请输入正确的日期格式（YYYY-MM-DD）',
    })
    resignDate = value
  } catch {
    return
  }
  const res = await completeResign(row.id, resignDate)
  if (res.code === 200 && res.data && res.data.id && res.data.status === 'done') {
    ElMessage.success('离职办理成功，员工状态已同步更新')
    loadData()
  } else {
    ElMessage.error('办理失败')
  }
}
const handleDelete = async (row: ResignationItem) => {
  try {
    await ElMessageBox.confirm(`确定删除离职申请「${row.code}」吗？删除后无法恢复`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await deleteResignation(row.id)
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
.resign-list {
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
