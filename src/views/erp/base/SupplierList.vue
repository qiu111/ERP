<template>
  <div class="supplier-list">
    <SearchBar
      title="供应商管理"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="supplier-list__table-wrap">
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
          <el-tag
            :type="supplierLevelTagTypeMap[row.level as SupplierLevel]"
            effect="light"
            size="small"
          >
            {{ supplierLevelLabelMap[row.level as SupplierLevel] }}
          </el-tag>
        </template>

        <template #column-status="{ row }">
          <el-tag
            :type="statusTagTypeMap[row.status as CommonStatus]"
            effect="light"
            size="small"
          >
            {{ statusLabelMap[row.status as CommonStatus] }}
          </el-tag>
        </template>

        <template #operation="{ row }">
          <el-button type="info" link size="small" @click="handleView(row)">
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
          <el-button
            :type="(row as Supplier).status === 'enabled' ? 'warning' : 'success'"
            link
            size="small"
            @click="handleToggleStatus(row)"
          >
            {{ (row as Supplier).status === 'enabled' ? '停用' : '启用' }}
          </el-button>
        </template>
      </CommonTable>
    </div>

    <SupplierDialog
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
import SupplierDialog from './SupplierDialog.vue'
import useListPage from '@/composables/useListPage'
import {
  getSupplierPage,
  deleteSupplier,
  toggleSupplierStatus,
  supplierLevelOptions,
  supplierLevelLabelMap,
  supplierLevelTagTypeMap,
  statusOptions,
  statusLabelMap,
  statusTagTypeMap,
  type Supplier,
  type SupplierLevel,
  type CommonStatus,
} from '@/mock/erpBase'

const tableData = ref<Supplier[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<Supplier | null>(null)

const searchModel = reactive<Record<string, any>>({
  keyword: '',
  level: '',
  status: '',
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
    label: '关键字:',
    type: 'input',
    placeholder: '编号/名称/联系人/地址',
  },
  {
    prop: 'level',
    label: '等级:',
    type: 'select',
    placeholder: '请选择',
    options: supplierLevelOptions,
  },
  {
    prop: 'status',
    label: '状态:',
    type: 'select',
    placeholder: '请选择',
    options: statusOptions,
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '编号', width: 90, align: 'center' },
  { prop: 'name', label: '供应商名称', minWidth: 200 },
  { prop: 'contact', label: '联系人', width: 100, align: 'center' },
  { prop: 'phone', label: '联系电话', width: 130, align: 'center' },
  { prop: 'address', label: '地址', minWidth: 180 },
  { prop: 'level', label: '等级', width: 90, align: 'center', slot: true },
  { prop: 'status', label: '状态', width: 90, align: 'center', slot: true },
  { prop: 'createTime', label: '创建时间', width: 160, align: 'center' },
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await getSupplierPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchModel.keyword || undefined,
      level: searchModel.level || undefined,
      status: searchModel.status || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载供应商列表失败:', e)
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
  searchModel.level = ''
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
const handleView = (row: Supplier) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleEdit = (row: Supplier) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleDelete = async (row: Supplier) => {
  try {
    await ElMessageBox.confirm(
      `确定删除供应商「${row.name}」吗？删除后无法恢复`,
      '删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
  } catch {
    return
  }
  try {
    loading.value = true
    await deleteSupplier(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (err: any) {
    ElMessage.error(err.message || '删除失败')
  } finally {
    loading.value = false
  }
}
const handleToggleStatus = async (row: Supplier) => {
  const actionText = row.status === 'enabled' ? '停用' : '启用'
  try {
    await ElMessageBox.confirm(`确定${actionText}供应商「${row.name}」吗？`, `${actionText}确认`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    loading.value = true
    await toggleSupplierStatus(row.id)
    ElMessage.success(`${actionText}成功`)
    loadData()
  } catch (err: any) {
    ElMessage.error(err.message || `${actionText}失败`)
  } finally {
    loading.value = false
  }
}

onMounted(() => loadData())
</script>

<style scoped lang="scss">
.supplier-list {
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
