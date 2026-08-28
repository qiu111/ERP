<template>
  <div class="organization-list">
    <SearchBar
      title="组织架构图管理"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      @add="handleAddRoot"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="organization-list__table-wrap">
      <el-table
        v-loading="loading"
        :data="treeData"
        row-key="id"
        :tree-props="{ children: 'children' }"
        default-expand-all
        border
        stripe
        height="100%"
      >
        <el-table-column prop="code" label="编号" width="90" align="center" />
        <el-table-column prop="name" label="部门名称" min-width="220" />
        <el-table-column prop="leader" label="负责人" width="120" align="center" />
        <el-table-column prop="sort" label="排序" width="90" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="enableStatusTagTypeMap[(row as Department).status]"
              effect="light"
              size="small"
            >
              {{ enableStatusLabelMap[(row as Department).status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" align="center" />
        <el-table-column label="操作" width="260" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleAddChild(row as Department)">
              <el-icon><Plus /></el-icon>
              新增子部门
            </el-button>
            <el-button type="warning" link size="small" @click="handleView(row as Department)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
            <el-button type="primary" link size="small" @click="handleEdit(row as Department)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              :type="(row as Department).status === 'enabled' ? 'info' : 'success'"
              link
              size="small"
              @click="handleToggleStatus(row as Department)"
            >
              {{ (row as Department).status === 'enabled' ? '停用' : '启用' }}
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row as Department)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无数据" />
        </template>
      </el-table>
    </div>

    <DepartmentDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      :parent-id="currentParentId"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { Plus, View, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import useListPage from '@/composables/useListPage'
import DepartmentDialog from './DepartmentDialog.vue'
import {
  listDepartments,
  deleteDepartment,
  updateDepartmentStatus,
  enableStatusOptions,
  enableStatusLabelMap,
  enableStatusTagTypeMap,
  type Department,
  type DepartmentNode,
  type EnableStatus,
} from '@/mock/hr'

const treeData = ref<DepartmentNode[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<Department | null>(null)
const currentParentId = ref<string>('0')

const searchModel = reactive<Record<string, any>>({
  keyword: '',
  status: '' as EnableStatus | '',
})

const { loading, setLoadFn } = useListPage()

const searchFields: SearchField[] = [
  {
    prop: 'keyword',
    label: '关键字:',
    type: 'input',
    placeholder: '部门名称/负责人',
  },
  {
    prop: 'status',
    label: '状态:',
    type: 'select',
    placeholder: '请选择',
    options: enableStatusOptions,
  },
]

const loadData = () => {
  loading.value = true
  try {
    treeData.value = listDepartments(
      searchModel.keyword || undefined,
      (searchModel.status || undefined) as EnableStatus | undefined
    )
  } catch (e) {
    console.error('加载部门树失败:', e)
  } finally {
    loading.value = false
  }
}
setLoadFn(loadData)

// ========== 搜索/重置 ==========
const handleSearch = () => {
  loadData()
}
const handleReset = () => {
  searchModel.keyword = ''
  searchModel.status = ''
  loadData()
}

// ========== 操作 ==========
const handleAddRoot = () => {
  dialogMode.value = 'add'
  currentRecord.value = null
  currentParentId.value = '0'
  dialogVisible.value = true
}
const handleAddChild = (row: Department) => {
  dialogMode.value = 'add'
  currentRecord.value = null
  currentParentId.value = row.id
  dialogVisible.value = true
}
const handleView = (row: Department) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  currentParentId.value = row.parentId
  dialogVisible.value = true
}
const handleEdit = (row: Department) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  currentParentId.value = row.parentId
  dialogVisible.value = true
}
const handleToggleStatus = async (row: Department) => {
  const next: EnableStatus = row.status === 'enabled' ? 'disabled' : 'enabled'
  const action = next === 'enabled' ? '启用' : '停用'
  try {
    await ElMessageBox.confirm(`确定${action}部门「${row.name}」吗？`, '状态确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await updateDepartmentStatus(row.id, next)
  if (res.code === 200 && res.data && res.data.id) {
    ElMessage.success(`${action}成功`)
    loadData()
  } else {
    ElMessage.error(`${action}失败`)
  }
}
const handleDelete = async (row: Department) => {
  try {
    await ElMessageBox.confirm(`确定删除部门「${row.name}」吗？删除后无法恢复`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await deleteDepartment(row.id)
  if (res.code === 200 && res.data) {
    ElMessage.success('删除成功')
    loadData()
  } else {
    ElMessage.error('删除失败：该部门下存在子部门，请先处理子部门')
  }
}

onMounted(() => loadData())
</script>

<style scoped lang="scss">
.organization-list {
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
