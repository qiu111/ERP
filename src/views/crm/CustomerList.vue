<template>
  <div class="customer-list">
    <SearchBar
      title="客户管理"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="customer-list__table-wrap">
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
        <template #column-level="{ row }">
          <el-tag :type="customerLevelTagTypeMap[row.level as CustomerLevel]" effect="light" size="small">
            {{ getCustomerLevelLabel(row.level as CustomerLevel) }}
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

    <CustomerDialog
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
import CustomerDialog from './CustomerDialog.vue'
import useListPage from '@/composables/useListPage'
import {
  getCustomerPage,
  deleteCustomer,
  getCustomerSourceOptions,
  customerLevelOptions,
  ownerOptions,
  getCustomerLevelLabel,
  customerLevelTagTypeMap,
  type CustomerItem,
  type CustomerLevel,
} from '@/mock/crm'

const tableData = ref<CustomerItem[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<CustomerItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  sourceName: '',
  level: '',
  owner: '',
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
    prop: 'sourceName',
    label: '客户来源:',
    type: 'select',
    placeholder: '请选择',
    options: getCustomerSourceOptions(),
  },
  {
    prop: 'level',
    label: '客户级别:',
    type: 'select',
    placeholder: '请选择',
    options: customerLevelOptions,
  },
  {
    prop: 'owner',
    label: '负责人:',
    type: 'select',
    placeholder: '请选择',
    options: ownerOptions,
  },
  {
    prop: 'keyword',
    label: '关键字查询:',
    type: 'input',
    placeholder: '客户名称/联系人',
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '编号', width: 80, align: 'center' },
  { prop: 'name', label: '客户名称', minWidth: 190 },
  { prop: 'sourceName', label: '客户来源', width: 120, align: 'center' },
  { prop: 'industry', label: '所属行业', width: 110, align: 'center' },
  { prop: 'contact', label: '联系人', width: 90, align: 'center' },
  { prop: 'phone', label: '联系电话', width: 130, align: 'center' },
  { prop: 'owner', label: '负责人', width: 110, align: 'center' },
  { prop: 'level', label: '客户级别', width: 100, align: 'center', slot: true },
  { prop: 'address', label: '联系地址', minWidth: 200 },
  { prop: 'createTime', label: '创建时间', width: 160, align: 'center' },
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await getCustomerPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      sourceName: searchModel.sourceName || undefined,
      level: searchModel.level || undefined,
      owner: searchModel.owner || undefined,
      keyword: searchModel.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载客户列表失败:', e)
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
  searchModel.sourceName = ''
  searchModel.level = ''
  searchModel.owner = ''
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
const handleView = (row: CustomerItem) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleEdit = (row: CustomerItem) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleDelete = async (row: CustomerItem) => {
  try {
    await ElMessageBox.confirm(`确定删除客户「${row.name}」吗？删除后无法恢复`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await deleteCustomer(row.id)
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
.customer-list {
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
