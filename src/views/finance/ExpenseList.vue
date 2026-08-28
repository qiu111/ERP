<template>
  <div class="expense-list">
    <SearchBar
      title="费用管理"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="expense-list__table-wrap">
      <CommonTable
        v-loading="loading"
        :columns="columns"
        :data="tableData"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        :row-key="'id'"
        height="100%"
        :operation-width="320"
        @page-change="handlePageChange"
        @page-size-change="handleSizeChange"
      >
        <template #column-amount="{ row }">
          <span class="amount-text">{{ formatAmount((row as ExpenseItem).amount) }}</span>
        </template>

        <template #column-status="{ row }">
          <el-tag :type="expenseStatusTagTypeMap[(row as ExpenseItem).status]" effect="light" size="small">
            {{ expenseStatusLabelMap[(row as ExpenseItem).status] }}
          </el-tag>
        </template>

        <template #operation="{ row }">
          <el-button type="success" link size="small" @click="handleView(row)">
            <el-icon><View /></el-icon>
            详情
          </el-button>
          <!-- 仅待审核可编辑/审核/删除 -->
          <template v-if="isPending(row)">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="success" link size="small" @click="handleAudit(row, 'audited')">
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
        </template>
      </CommonTable>
    </div>

    <ExpenseDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { View, Edit, Delete, Check, Close } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import useListPage from '@/composables/useListPage'
import ExpenseDialog from './ExpenseDialog.vue'
import {
  getExpensePage,
  deleteExpense,
  auditExpense,
  getExpenseTypeNameOptions,
  expenseStatusOptions,
  expenseStatusLabelMap,
  expenseStatusTagTypeMap,
  type ExpenseItem,
  type ExpenseStatus,
} from '@/mock/finance'

const formatAmount = (n: number) =>
  (n ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const isPending = (row: ExpenseItem) => row.status === 'pending'

const tableData = ref<ExpenseItem[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<ExpenseItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  status: '' as ExpenseStatus | '',
  typeName: '',
  expenseDate: '' as [string, string] | '',
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
    options: expenseStatusOptions,
  },
  {
    prop: 'typeName',
    label: '费用类型:',
    type: 'select',
    placeholder: '请选择',
    options: getExpenseTypeNameOptions(),
  },
  {
    prop: 'expenseDate',
    label: '费用日期:',
    type: 'daterange',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
  },
  {
    prop: 'keyword',
    label: '关键字查询:',
    type: 'input',
    placeholder: '单号/申请人/账户/备注',
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '单号', width: 100, align: 'center' },
  { prop: 'typeName', label: '费用类型', width: 120, align: 'center' },
  { prop: 'amount', label: '金额(元)', width: 130, align: 'right', slot: true },
  { prop: 'accountName', label: '付款账户', minWidth: 200 },
  { prop: 'expenseDate', label: '费用日期', width: 120, align: 'center' },
  { prop: 'applicant', label: '申请人', width: 110, align: 'center' },
  { prop: 'status', label: '状态', width: 100, align: 'center', slot: true },
  { prop: 'remark', label: '备注', minWidth: 180 },
]

const loadData = async () => {
  loading.value = true
  try {
    const range = Array.isArray(searchModel.expenseDate) ? searchModel.expenseDate : ['', '']
    const res = await getExpensePage({
      page: currentPage.value,
      pageSize: pageSize.value,
      status: (searchModel.status || undefined) as ExpenseStatus | undefined,
      typeName: searchModel.typeName || undefined,
      dateStart: range[0] || undefined,
      dateEnd: range[1] || undefined,
      keyword: searchModel.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载费用列表失败:', e)
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
  searchModel.typeName = ''
  searchModel.expenseDate = ''
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
const handleView = (row: ExpenseItem) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleEdit = (row: ExpenseItem) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleAudit = async (row: ExpenseItem, status: 'audited' | 'rejected') => {
  const action = status === 'audited' ? '审核通过' : '审核驳回'
  try {
    await ElMessageBox.confirm(`确定对费用单「${row.code}」执行${action}吗？`, '审核确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await auditExpense(row.id, status)
  if (res.code === 200 && res.data && res.data.id) {
    ElMessage.success(`${action}成功`)
    loadData()
  } else {
    ElMessage.error(`${action}失败`)
  }
}
const handleDelete = async (row: ExpenseItem) => {
  try {
    await ElMessageBox.confirm(`确定删除费用单「${row.code}」吗？删除后无法恢复`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await deleteExpense(row.id)
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
.expense-list {
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
