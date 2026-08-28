<template>
  <div class="memo-list">
    <SearchBar
      title="备忘录管理"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="memo-list__table-wrap">
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
        <template #column-category="{ row }">
          <el-tag :type="categoryTagTypeMap[row.category as MemoCategory]" effect="light" size="small">
            {{ row.category }}
          </el-tag>
        </template>

        <template #column-remind="{ row }">
          <span>{{ row.remind ? '是' : '否' }}</span>
        </template>

        <template #column-remindTime="{ row }">
          <span v-if="row.remind">{{ row.remindTime }}</span>
          <span v-else class="dash-text">—</span>
        </template>

        <template #operation="{ row }">
          <el-button type="warning" link size="small" @click="handleView(row)">
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

    <MemoDialog
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
import MemoDialog from './MemoDialog.vue'
import useListPage from '@/composables/useListPage'
import {
  getMemoPage,
  deleteMemo,
  memoCategoryOptions,
  type MemoItem,
  type MemoCategory,
} from '@/mock/memo'

const categoryTagTypeMap: Record<MemoCategory, 'info' | 'warning' | 'danger'> = {
  '日常记事': 'info',
  '工作提醒': 'warning',
  '重要事项': 'danger',
}

const tableData = ref<MemoItem[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<MemoItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  category: '',
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
    prop: 'category',
    label: '分类:',
    type: 'select',
    placeholder: '请选择',
    options: memoCategoryOptions,
  },
  {
    prop: 'keyword',
    label: '关键字查询:',
    type: 'input',
    placeholder: '标题/内容/备注',
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '编号', width: 80, align: 'center' },
  { prop: 'title', label: '标题', minWidth: 280 },
  { prop: 'category', label: '分类', width: 120, align: 'center', slot: true },
  { prop: 'remind', label: '是否提醒', width: 100, align: 'center', slot: true },
  { prop: 'remindTime', label: '提醒时间', width: 160, align: 'center', slot: true },
  { prop: 'creator', label: '添加人', width: 120, align: 'center' },
  { prop: 'operateTime', label: '操作时间', width: 160, align: 'center' },
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await getMemoPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      category: searchModel.category || undefined,
      keyword: searchModel.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载备忘录列表失败:', e)
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
  searchModel.category = ''
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
const handleView = (row: MemoItem) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleEdit = (row: MemoItem) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleDelete = async (row: MemoItem) => {
  try {
    await ElMessageBox.confirm(`确定删除备忘「${row.title}」吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await deleteMemo(row.id)
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
.memo-list {
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

.dash-text {
  color: #c0c4cc;
}
</style>
