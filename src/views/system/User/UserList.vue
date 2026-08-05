<template>
  <div class="user-list">
    <SearchBar
      title="用户管理"
      show-add
      add-permission="userList:add"
      v-model="searchParams"
      :fields="searchFields"
      @search="handleSearch"
      @reset="handleReset"
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
          :class="['status-tag', row.status === 'active' ? 'status-active' : 'status-inactive']"
        >
          {{ row.status === 'active' ? '可用' : '不可用' }}
        </span>
      </template>

      <template #column-relatedUsername="{ row }">
        <span v-if="row.relatedUsername" class="related-username">
          {{ row.relatedUsername }}
        </span>
        <span v-else class="text-muted">-</span>
      </template>

      <template #operation="{ row }">
        <el-button v-permission="'userList:dataPermission'" type="warning" link size="small" @click="handleDataPermission(row)">
          数据权限
        </el-button>
        <el-button v-permission="'userList:edit'" type="primary" link size="small" @click="handleEdit(row)">
          编辑
        </el-button>
        <el-button
          v-permission="'userList:toggle'"
          :type="row.status === 'active' ? 'danger' : 'success'"
          link
          size="small"
          @click="handleToggleStatus(row)"
        >
          {{ row.status === 'active' ? '停用' : '启用' }}
        </el-button>
      </template>
    </CommonTable>

    <UserDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import UserDialog from './UserDialog.vue'
import {
  getUserPage,
  toggleUserStatus,
  mockRoleList,
} from '@/mock/userAdmin'
import type { UserItem } from '@/mock/userAdmin'

const loading = ref(false)
const tableData = ref<UserItem[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const searchParams = ref<Record<string, any>>({
  status: '',
  role: '',
  lastLoginDate: '',
  keyword: '',
})

const searchFields: SearchField[] = [
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '可用', value: 'active' },
      { label: '不可用', value: 'inactive' },
    ],
  },
  {
    prop: 'role',
    label: '用户角色',
    type: 'select',
    placeholder: '请选择',
    options: mockRoleList.map((r) => ({ label: r, value: r })),
  },
  {
    prop: 'lastLoginDate',
    label: '最后登录时间',
    type: 'date',
    placeholder: '选择日期',
  },
  {
    prop: 'keyword',
    label: '搜索',
    type: 'input',
    placeholder: '昵称/用户名',
  },
]

const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const currentRecord = ref<UserItem | null>(null)

const columns: TableColumn[] = [
  { prop: 'id', label: '编号', width: 80, align: 'center' },
  { prop: 'username', label: '用户名', minWidth: 120 },
  { prop: 'relatedUsername', label: '相关用户名', minWidth: 180 },
  { prop: 'nickname', label: '昵称', minWidth: 100 },
  { prop: 'company', label: '员工所属公司', minWidth: 110 },
  { prop: 'role', label: '用户角色', minWidth: 130 },
  { prop: 'status', label: '状态', width: 90, align: 'center' },
  { prop: 'operator', label: '操作人', minWidth: 100 },
  { prop: 'lastLoginTime', label: '最后登录时间', minWidth: 150, align: 'center' },
  { prop: 'operateTime', label: '操作时间', minWidth: 150, align: 'center' },
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await getUserPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchParams.value.keyword || undefined,
      status: searchParams.value.status || undefined,
      role: searchParams.value.role || undefined,
      lastLoginDate: searchParams.value.lastLoginDate || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    console.error('加载用户列表失败:', err)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const handleReset = () => {
  searchParams.value = {
    status: '',
    role: '',
    lastLoginDate: '',
    keyword: '',
  }
  currentPage.value = 1
  loadData()
}

const handlePageChange = (page: number, size: number) => {
  currentPage.value = page
  pageSize.value = size
  loadData()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadData()
}

const handleAdd = () => {
  dialogMode.value = 'add'
  currentRecord.value = null
  dialogVisible.value = true
}

const handleEdit = (row: UserItem) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleDataPermission = (row: UserItem) => {
  ElMessageBox.alert(`为用户「${row.username}」配置数据权限`, '数据权限配置', {
    confirmButtonText: '确定',
  })
}

const handleToggleStatus = async (row: UserItem) => {
  const newStatus = row.status === 'active' ? 'inactive' : 'active'
  const actionText = newStatus === 'active' ? '启用' : '停用'
  try {
    await ElMessageBox.confirm(`确定要${actionText}用户「${row.username}」吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await toggleUserStatus(row.id, newStatus)
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
.user-list {
  padding: 20px;
}

.related-username {
  color: #606266;
}

.text-muted {
  color: #c0c4cc;
}
</style>
