<template>
  <div class="account-list">
    <SearchBar
      title="账户管理"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="account-list__table-wrap">
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
        <template #column-type="{ row }">
          <el-tag :type="accountTypeTagTypeMap[(row as AccountItem).type]" effect="light" size="small">
            {{ accountTypeLabelMap[(row as AccountItem).type] }}
          </el-tag>
        </template>

        <template #column-currency="{ row }">
          <span>{{ currencyLabelMap[(row as AccountItem).currency] }}</span>
        </template>

        <template #column-balance="{ row }">
          <span class="balance-text">{{ formatAmount((row as AccountItem).balance) }}</span>
        </template>

        <template #column-status="{ row }">
          <el-tag :type="enableStatusTagTypeMap[(row as AccountItem).status]" effect="light" size="small">
            {{ enableStatusLabelMap[(row as AccountItem).status] }}
          </el-tag>
        </template>

        <template #operation="{ row }">
          <el-button type="success" link size="small" @click="handleView(row)">
            <el-icon><View /></el-icon>
            详情
          </el-button>
          <el-button type="primary" link size="small" @click="handleEdit(row)">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </template>
      </CommonTable>
    </div>

    <AccountDialog
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
import AccountDialog from './AccountDialog.vue'
import {
  getAccountPage,
  deleteAccount,
  accountTypeOptions,
  accountTypeLabelMap,
  accountTypeTagTypeMap,
  currencyLabelMap,
  enableStatusOptions,
  enableStatusLabelMap,
  enableStatusTagTypeMap,
  type AccountItem,
  type AccountType,
  type EnableStatus,
} from '@/mock/finance'

const formatAmount = (n: number) =>
  (n ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const tableData = ref<AccountItem[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<AccountItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  type: '' as AccountType | '',
  status: '' as EnableStatus | '',
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
    prop: 'type',
    label: '账户类型:',
    type: 'select',
    placeholder: '请选择',
    options: accountTypeOptions,
  },
  {
    prop: 'status',
    label: '状态:',
    type: 'select',
    placeholder: '请选择',
    options: enableStatusOptions,
  },
  {
    prop: 'keyword',
    label: '关键字查询:',
    type: 'input',
    placeholder: '账户名称/备注',
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '编号', width: 80, align: 'center' },
  { prop: 'name', label: '账户名称', minWidth: 220 },
  { prop: 'type', label: '账户类型', width: 100, align: 'center', slot: true },
  { prop: 'currency', label: '币种', width: 90, align: 'center', slot: true },
  { prop: 'balance', label: '余额', width: 140, align: 'right', slot: true },
  { prop: 'status', label: '状态', width: 90, align: 'center', slot: true },
  { prop: 'remark', label: '备注', minWidth: 180 },
  { prop: 'createTime', label: '创建时间', width: 160, align: 'center' },
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await getAccountPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      type: (searchModel.type || undefined) as AccountType | undefined,
      status: (searchModel.status || undefined) as EnableStatus | undefined,
      keyword: searchModel.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载账户列表失败:', e)
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
  searchModel.type = ''
  searchModel.status = ''
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
const handleView = (row: AccountItem) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleEdit = (row: AccountItem) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleDelete = async (row: AccountItem) => {
  try {
    await ElMessageBox.confirm(`确定删除账户「${row.name}」吗？删除后无法恢复`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await deleteAccount(row.id)
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
.account-list {
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

.balance-text {
  font-weight: 600;
  color: #303133;
}
</style>
