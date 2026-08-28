<template>
  <div class="income-list">
    <SearchBar
      title="收入管理"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="income-list__table-wrap">
      <CommonTable
        v-loading="loading"
        :columns="columns"
        :data="tableData"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        :row-key="'id'"
        height="100%"
        :operation-width="260"
        @page-change="handlePageChange"
        @page-size-change="handleSizeChange"
      >
        <template #column-amount="{ row }">
          <span class="amount-text">{{ formatAmount((row as IncomeItem).amount) }}</span>
        </template>

        <template #column-status="{ row }">
          <el-tag :type="incomeStatusTagTypeMap[(row as IncomeItem).status]" effect="light" size="small">
            {{ incomeStatusLabelMap[(row as IncomeItem).status] }}
          </el-tag>
        </template>

        <template #operation="{ row }">
          <el-button type="success" link size="small" @click="handleView(row)">
            <el-icon><View /></el-icon>
            详情
          </el-button>
          <!-- 仅待确认可编辑/确认/删除 -->
          <template v-if="isPending(row)">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="success" link size="small" @click="handleConfirm(row)">
              <el-icon><Check /></el-icon>
              确认收款
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </template>
      </CommonTable>
    </div>

    <IncomeDialog
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
import IncomeDialog from './IncomeDialog.vue'
import {
  getIncomePage,
  deleteIncome,
  confirmIncome,
  getAccountNameOptions,
  incomeStatusOptions,
  incomeStatusLabelMap,
  incomeStatusTagTypeMap,
  type IncomeItem,
  type IncomeStatus,
} from '@/mock/finance'

const formatAmount = (n: number) =>
  (n ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const isPending = (row: IncomeItem) => row.status === 'pending'

const tableData = ref<IncomeItem[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<IncomeItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  status: '' as IncomeStatus | '',
  accountName: '',
  incomeDate: '' as [string, string] | '',
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
    options: incomeStatusOptions,
  },
  {
    prop: 'accountName',
    label: '收款账户:',
    type: 'select',
    placeholder: '请选择',
    options: getAccountNameOptions(),
  },
  {
    prop: 'incomeDate',
    label: '收入日期:',
    type: 'daterange',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
  },
  {
    prop: 'keyword',
    label: '关键字查询:',
    type: 'input',
    placeholder: '单号/来源/经手人/备注',
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '单号', width: 100, align: 'center' },
  { prop: 'source', label: '收入来源', minWidth: 200 },
  { prop: 'amount', label: '金额(元)', width: 130, align: 'right', slot: true },
  { prop: 'accountName', label: '收款账户', minWidth: 200 },
  { prop: 'incomeDate', label: '收入日期', width: 120, align: 'center' },
  { prop: 'handler', label: '经手人', width: 110, align: 'center' },
  { prop: 'status', label: '状态', width: 100, align: 'center', slot: true },
  { prop: 'remark', label: '备注', minWidth: 160 },
]

const loadData = async () => {
  loading.value = true
  try {
    const range = Array.isArray(searchModel.incomeDate) ? searchModel.incomeDate : ['', '']
    const res = await getIncomePage({
      page: currentPage.value,
      pageSize: pageSize.value,
      status: (searchModel.status || undefined) as IncomeStatus | undefined,
      accountName: searchModel.accountName || undefined,
      dateStart: range[0] || undefined,
      dateEnd: range[1] || undefined,
      keyword: searchModel.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载收入列表失败:', e)
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
  searchModel.accountName = ''
  searchModel.incomeDate = ''
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
const handleView = (row: IncomeItem) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleEdit = (row: IncomeItem) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleConfirm = async (row: IncomeItem) => {
  try {
    await ElMessageBox.confirm(
      `确定确认收入单「${row.code}」收款 ${formatAmount(row.amount)} 元吗？`,
      '确认收款',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
  } catch {
    return
  }
  const res = await confirmIncome(row.id)
  if (res.code === 200 && res.data && res.data.id) {
    ElMessage.success('确认收款成功')
    loadData()
  } else {
    ElMessage.error('确认收款失败')
  }
}
const handleDelete = async (row: IncomeItem) => {
  try {
    await ElMessageBox.confirm(`确定删除收入单「${row.code}」吗？删除后无法恢复`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await deleteIncome(row.id)
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
.income-list {
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
