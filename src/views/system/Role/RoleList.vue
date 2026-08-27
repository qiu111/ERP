<template>
  <div class="role-list">
    <SearchBar
      title="角色管理"
      show-add
      add-permission="roleList:add"
      @add="handleAdd"
    />

    <CommonTable
      v-loading="loading"
      :columns="columns"
      :data="tableData"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      :row-key="'id'"
      @page-change="handlePageChange"
      @page-size-change="handleSizeChange"
    >
      <template #column-status="{ row }">
        <span
          :class="['status-tag', row.status === 'enabled' ? 'status-enabled' : 'status-disabled']"
        >
          {{ row.status === 'enabled' ? '已启用' : '已停用' }}
        </span>
      </template>

      <template #operation="{ row }">
        <el-button v-if="has('roleList:edit')" type="primary" link size="small" @click="handleEdit(row)">
          编辑
        </el-button>
        <el-button v-if="has('roleList:grant')" type="warning" link size="small" @click="handleGrant(row)">
          授权
        </el-button>
        <el-button
          v-if="has('roleList:toggle')"
          :type="row.status === 'enabled' ? 'danger' : 'success'"
          link
          size="small"
          @click="handleToggleStatus(row)"
        >
          {{ row.status === 'enabled' ? '停用' : '启用' }}
        </el-button>
      </template>
    </CommonTable>

    <RoleDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import { usePermission } from '@/composables/usePermission'
import useListPage from '@/composables/useListPage'
import RoleDialog from './RoleDialog.vue'
import { getRolePage, toggleRoleStatus } from '@/mock/role'
import type { RoleItem } from '@/mock/role'

const { has } = usePermission()
const tableData = ref<RoleItem[]>([])
const {
  currentPage,
  pageSize,
  total,
  loading,
  handlePageChange,
  handleSizeChange,
  setLoadFn,
  confirmDelete,
} = useListPage()

const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const currentRecord = ref<RoleItem | null>(null)

const columns: TableColumn[] = [
  { prop: 'id', label: '角色编号', width: 120, align: 'center' },
  { prop: 'name', label: '角色名', minWidth: 200 },
  { prop: 'operator', label: '操作人', width: 140 },
  { prop: 'operateTime', label: '操作时间', width: 180 },
  { prop: 'status', label: '状态', width: 100, align: 'center' },
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await getRolePage({
      page: currentPage.value,
      pageSize: pageSize.value,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    console.error('加载角色列表失败:', err)
  } finally {
    loading.value = false
  }
}
setLoadFn(loadData)

const handleAdd = () => {
  dialogMode.value = 'add'
  currentRecord.value = null
  dialogVisible.value = true
}

const handleEdit = (row: RoleItem) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleGrant = (row: RoleItem) => {
  ElMessageBox.alert(`为角色「${row.name}」配置权限`, '权限配置', {
    confirmButtonText: '确定',
  })
}

const handleToggleStatus = async (row: RoleItem) => {
  const newStatus = row.status === 'enabled' ? 'disabled' : 'enabled'
  const actionText = newStatus === 'enabled' ? '启用' : '停用'
  try {
    await ElMessageBox.confirm(`确定要${actionText}「${row.name}」吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await toggleRoleStatus(row.id, newStatus)
    ElMessage.success(`${actionText}成功`)
    loadData()
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.role-list {
  padding: 20px;
}
</style>
