<template>
  <div class="budget-list">
    <SearchBar
      title="预算管理"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="budget-list__table-wrap">
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
        <template #column-budgetAmount="{ row }">
          <span class="amount-text">{{ formatAmount((row as BudgetItem).budgetAmount) }}</span>
        </template>

        <template #column-usedAmount="{ row }">
          <span>{{ formatAmount((row as BudgetItem).usedAmount) }}</span>
        </template>

        <template #column-status="{ row }">
          <el-tag :type="budgetStatusTagTypeMap[(row as BudgetItem).status]" effect="light" size="small">
            {{ budgetStatusLabelMap[(row as BudgetItem).status] }}
          </el-tag>
        </template>

        <template #operation="{ row }">
          <el-button type="success" link size="small" @click="handleView(row)">
            <el-icon><View /></el-icon>
            详情
          </el-button>
          <!-- 仅进行中可编辑/关闭/删除 -->
          <template v-if="isOpen(row)">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="warning" link size="small" @click="handleClose(row)">
              <el-icon><CircleClose /></el-icon>
              关闭预算
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </template>
      </CommonTable>
    </div>

    <BudgetDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { View, Edit, Delete, CircleClose } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import useListPage from '@/composables/useListPage'
import BudgetDialog from './BudgetDialog.vue'
import {
  getBudgetPage,
  deleteBudget,
  updateBudget,
  getBudgetPeriodOptions,
  budgetStatusOptions,
  budgetStatusLabelMap,
  budgetStatusTagTypeMap,
  type BudgetItem,
  type BudgetStatus,
} from '@/mock/finance'

const formatAmount = (n: number) =>
  (n ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const isOpen = (row: BudgetItem) => row.status === 'open'

const tableData = ref<BudgetItem[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<BudgetItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  keyword: '',
  period: '',
  status: '' as BudgetStatus | '',
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
    prop: 'keyword',
    label: '部门:',
    type: 'input',
    placeholder: '请输入部门名称',
  },
  {
    prop: 'period',
    label: '期间:',
    type: 'select',
    placeholder: '请选择',
    options: getBudgetPeriodOptions(),
  },
  {
    prop: 'status',
    label: '状态:',
    type: 'select',
    placeholder: '请选择',
    options: budgetStatusOptions,
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '预算单号', width: 100, align: 'center' },
  { prop: 'deptName', label: '部门', width: 120, align: 'center' },
  { prop: 'period', label: '预算期间', width: 110, align: 'center' },
  { prop: 'budgetAmount', label: '预算金额(元)', width: 130, align: 'right', slot: true },
  { prop: 'usedAmount', label: '已用金额(元)', width: 130, align: 'right', slot: true },
  { prop: 'status', label: '状态', width: 100, align: 'center', slot: true },
  { prop: 'remark', label: '备注', minWidth: 180 },
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await getBudgetPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      status: (searchModel.status || undefined) as BudgetStatus | undefined,
      period: searchModel.period || undefined,
      keyword: searchModel.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载预算列表失败:', e)
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
  searchModel.period = ''
  searchModel.status = ''
  currentPage.value = 1
  loadData()
}

// ========== 操作 ==========
const handleAdd = () => {
  dialogMode.value = 'add'
  currentRecord.value = null
  dialogVisible.value = true
}
const handleView = (row: BudgetItem) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleEdit = (row: BudgetItem) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleClose = async (row: BudgetItem) => {
  try {
    await ElMessageBox.confirm(
      `确定关闭预算「${row.code}」（${row.deptName} ${row.period}）吗？关闭后不可再编辑`,
      '关闭预算确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
  } catch {
    return
  }
  const res = await updateBudget(row.id, { status: 'closed' })
  if (res.code === 200 && res.data && res.data.id) {
    ElMessage.success('预算已关闭')
    loadData()
  } else {
    ElMessage.error('关闭预算失败')
  }
}
const handleDelete = async (row: BudgetItem) => {
  try {
    await ElMessageBox.confirm(`确定删除预算「${row.code}」吗？删除后无法恢复`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await deleteBudget(row.id)
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
.budget-list {
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
