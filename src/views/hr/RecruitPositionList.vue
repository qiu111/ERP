<template>
  <div class="recruit-position-list">
    <SearchBar
      title="招聘岗位"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="recruit-position-list__table-wrap">
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
        <template #column-headcount="{ row }">
          <el-tag type="primary" effect="light" size="small">
            {{ (row as RecruitPositionItem).headcount }} 人
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

    <RecruitPositionDialog
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
import RecruitPositionDialog from './RecruitPositionDialog.vue'
import {
  getRecruitPositionPage,
  deleteRecruitPosition,
  getDepartmentOptions,
  getRecruitSourceOptions,
  type RecruitPositionItem,
} from '@/mock/hr'

const tableData = ref<RecruitPositionItem[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<RecruitPositionItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  deptName: '',
  recruitSource: '',
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
    prop: 'deptName',
    label: '所属部门:',
    type: 'select',
    placeholder: '请选择',
    options: getDepartmentOptions(),
  },
  {
    prop: 'recruitSource',
    label: '招聘来源:',
    type: 'select',
    placeholder: '请选择',
    options: getRecruitSourceOptions(),
  },
  {
    prop: 'keyword',
    label: '关键字查询:',
    type: 'input',
    placeholder: '岗位名称/要求/备注',
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '编号', width: 80, align: 'center' },
  { prop: 'name', label: '岗位名称', minWidth: 150 },
  { prop: 'deptName', label: '所属部门', width: 120, align: 'center' },
  { prop: 'headcount', label: '招聘人数', width: 100, align: 'center', slot: true },
  { prop: 'recruitSource', label: '招聘来源', width: 120, align: 'center' },
  { prop: 'salaryRange', label: '薪资范围', width: 120, align: 'center' },
  { prop: 'requirement', label: '任职要求', minWidth: 220 },
  { prop: 'createTime', label: '创建时间', width: 160, align: 'center' },
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await getRecruitPositionPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      deptName: searchModel.deptName || undefined,
      recruitSource: searchModel.recruitSource || undefined,
      keyword: searchModel.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载招聘岗位列表失败:', e)
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
  searchModel.deptName = ''
  searchModel.recruitSource = ''
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
const handleView = (row: RecruitPositionItem) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleEdit = (row: RecruitPositionItem) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleDelete = async (row: RecruitPositionItem) => {
  try {
    await ElMessageBox.confirm(`确定删除招聘岗位「${row.name}」吗？删除后无法恢复`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await deleteRecruitPosition(row.id)
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
.recruit-position-list {
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
