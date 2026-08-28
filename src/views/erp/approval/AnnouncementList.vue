<template>
  <div class="announcement-list">
    <SearchBar
      title="公告列表"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="announcement-list__table-wrap">
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
        <template #column-title="{ row }">
          <el-tooltip :content="row.title" placement="top" effect="dark">
            <span class="title-text">{{ row.title }}</span>
          </el-tooltip>
        </template>

        <template #operation="{ row }">
          <el-button type="warning" link size="small" @click="handleView(row)">
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

    <AnnouncementDialog
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
import AnnouncementDialog from './AnnouncementDialog.vue'
import useListPage from '@/composables/useListPage'
import {
  getAnnouncementPage,
  deleteAnnouncement,
  operatorOptions,
  type AnnouncementItem,
} from '@/mock/announcement'

const tableData = ref<AnnouncementItem[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<AnnouncementItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  operator: '',
  date: '',
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
    prop: 'operator',
    label: '发布人:',
    type: 'select',
    placeholder: '请选择',
    options: operatorOptions,
  },
  {
    prop: 'date',
    label: '选择日期:',
    type: 'date',
    placeholder: '选择日期',
  },
  {
    prop: 'keyword',
    label: '关键字:',
    type: 'input',
    placeholder: '标题/内容/备注',
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '编号', width: 80, align: 'center' },
  { prop: 'title', label: '标题', minWidth: 320, slot: true },
  { prop: 'operator', label: '操作人', width: 140, align: 'center' },
  { prop: 'operateTime', label: '操作时间', width: 180, align: 'center' },
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await getAnnouncementPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      operator: searchModel.operator || undefined,
      date: searchModel.date || undefined,
      keyword: searchModel.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载公告列表失败:', e)
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
  searchModel.operator = ''
  searchModel.date = ''
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
const handleView = (row: AnnouncementItem) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleEdit = (row: AnnouncementItem) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleDelete = async (row: AnnouncementItem) => {
  try {
    await ElMessageBox.confirm(`确定删除公告「${row.title}」吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await deleteAnnouncement(row.id)
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
.announcement-list {
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

.title-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}
</style>
