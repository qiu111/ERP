<template>
  <div class="function-list">
    <SearchBar
      title="功能管理"
      show-add
      add-permission="functionList:add"
      @add="handleAdd"
    />

    <el-table
      v-loading="loading"
      :data="tableData"
      row-key="id"
      border
      default-expand-all
      :tree-props="{ children: 'children' }"
      style="width: 100%"
    >
      <el-table-column prop="id" label="菜单ID" width="120" />
      <el-table-column prop="name" label="菜单名称" min-width="200" />
      <el-table-column prop="code" label="菜单编码" min-width="180" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <span
            :class="['status-tag', row.status === 'normal' ? 'status-normal' : 'status-disabled']"
          >
            {{ row.status === 'normal' ? '正常' : '停用' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300" align="center">
        <template #default="{ row }">
          <el-button v-if="has('functionList:add')" type="primary" link size="small" @click="handleAddChild(row)">
            子模块
          </el-button>
          <el-button v-if="has('functionList:edit')" type="primary" link size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button
            v-if="has('functionList:toggle')"
            :type="row.status === 'normal' ? 'danger' : 'success'"
            link
            size="small"
            @click="handleToggleStatus(row)"
          >
            {{ row.status === 'normal' ? '停用' : '启用' }}
          </el-button>
          <el-button v-if="has('functionList:delete')" type="danger" link size="small" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <FunctionDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      :parent-list="tableData"
      :default-pid="defaultPid"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchBar from '@/components/SearchBar.vue'
import { usePermission } from '@/composables/usePermission'
import { getFunctionTree, toggleFunctionStatus, deleteFunction } from '@/api/function'
import type { FunctionItem } from '@/mock/function'
import FunctionDialog from './FunctionDialog.vue'

const { has } = usePermission()
const loading = ref(false)
const tableData = ref<FunctionItem[]>([])

const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const currentRecord = ref<FunctionItem | null>(null)
const defaultPid = ref('0')

const loadData = async () => {
  loading.value = true
  try {
    const res = await getFunctionTree()
    tableData.value = res.data || []
  } catch (err) {
    console.error('加载功能列表失败:', err)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogMode.value = 'add'
  currentRecord.value = null
  defaultPid.value = '0'
  dialogVisible.value = true
}

const handleAddChild = (row: FunctionItem) => {
  dialogMode.value = 'add'
  currentRecord.value = null
  defaultPid.value = row.id
  dialogVisible.value = true
}

const handleEdit = (row: FunctionItem) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleToggleStatus = async (row: FunctionItem) => {
  const newStatus = row.status === 'normal' ? 'disabled' : 'normal'
  const actionText = newStatus === 'normal' ? '启用' : '停用'
  try {
    await ElMessageBox.confirm(`确定要${actionText}「${row.name}」吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await toggleFunctionStatus(row.id, newStatus)
    ElMessage.success(`${actionText}成功`)
    loadData()
  } catch {
    // 用户取消
  }
}

const handleDelete = async (row: FunctionItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除「${row.name}」吗？子模块将一并删除。`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteFunction(row.id)
    ElMessage.success('删除成功')
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
.function-list {
  padding: 20px;
}
</style>
