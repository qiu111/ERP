<template>
  <div class="logistics-list">
    <SearchBar
      title="物流公司管理"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="logistics-list__table-wrap">
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
        <template #column-status="{ row }">
          <el-tag
            :type="statusTagTypeMap[(row as Logistics).status]"
            effect="light"
            size="small"
          >
            {{ statusLabelMap[(row as Logistics).status] }}
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
            :type="(row as Logistics).status === 'enabled' ? 'warning' : 'success'"
            link
            size="small"
            @click="handleToggleStatus(row)"
          >
            {{ (row as Logistics).status === 'enabled' ? '停用' : '启用' }}
          </el-button>
        </template>
      </CommonTable>
    </div>

    <LogisticsDialog
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
import LogisticsDialog from './LogisticsDialog.vue'
import useListPage from '@/composables/useListPage'
import {
  getLogisticsPage,
  deleteLogistics,
  toggleLogisticsStatus,
  statusOptions,
  statusLabelMap,
  statusTagTypeMap,
  type Logistics,
  type CommonStatus,
} from '@/mock/erpBase'

const tableData = ref<Logistics[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<Logistics | null>(null)

const searchModel = reactive<Record<string, any>>({
  keyword: '',
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
    placeholder: '编号/名称/联系人/电话/地址',
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
  { prop: 'name', label: '物流公司名称', minWidth: 200 },
  { prop: 'contact', label: '联系人', width: 100, align: 'center' },
  { prop: 'phone', label: '联系电话', width: 130, align: 'center' },
  { prop: 'address', label: '地址', minWidth: 180 },
  { prop: 'status', label: '状态', width: 90, align: 'center', slot: true },
  { prop: 'createTime', label: '创建时间', width: 160, align: 'center' },
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await getLogisticsPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchModel.keyword || undefined,
      status: searchModel.status || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载物流公司列表失败:', e)
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
const handleView = (row: Logistics) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleEdit = (row: Logistics) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleDelete = async (row: Logistics) => {
  try {
    await ElMessageBox.confirm(
      `确定删除物流公司「${row.name}」吗？删除后无法恢复`,
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
    await deleteLogistics(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (err: any) {
    ElMessage.error(err.message || '删除失败')
  } finally {
    loading.value = false
  }
}
const handleToggleStatus = async (row: Logistics) => {
  const actionText = row.status === 'enabled' ? '停用' : '启用'
  try {
    await ElMessageBox.confirm(`确定${actionText}物流公司「${row.name}」吗？`, `${actionText}确认`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    loading.value = true
    await toggleLogisticsStatus(row.id)
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
.logistics-list {
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
