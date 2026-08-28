<template>
  <div class="share-list">
    <SearchBar
      title="分润管理"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="share-list__table-wrap">
      <CommonTable
        v-loading="loading"
        :columns="columns"
        :data="tableData"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        :row-key="'id'"
        height="100%"
        :operation-width="320"
        @page-change="handlePageChange"
        @page-size-change="handleSizeChange"
      >
        <template #column-shareAmount="{ row }">
          <span class="amount-text">{{ formatAmount((row as ShareItem).shareAmount) }}</span>
        </template>

        <template #column-status="{ row }">
          <el-tag :type="shareStatusTagTypeMap[(row as ShareItem).status]" effect="light" size="small">
            {{ shareStatusLabelMap[(row as ShareItem).status] }}
          </el-tag>
        </template>

        <template #operation="{ row }">
          <el-button type="success" link size="small" @click="handleView(row)">
            <el-icon><View /></el-icon>
            详情
          </el-button>
          <!-- 仅待结算可编辑/结算/删除 -->
          <template v-if="isPending(row)">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="success" link size="small" @click="handleSettle(row)">
              <el-icon><Check /></el-icon>
              结算
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </template>
      </CommonTable>
    </div>

    <ShareDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { View, Edit, Delete, Check } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import useListPage from '@/composables/useListPage'
import ShareDialog from './ShareDialog.vue'
import {
  getSharePage,
  deleteShare,
  settleShare,
  getSharePeriodOptions,
  shareStatusOptions,
  shareStatusLabelMap,
  shareStatusTagTypeMap,
  type ShareItem,
  type ShareStatus,
} from '@/mock/finance'

const formatAmount = (n: number) =>
  (n ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const isPending = (row: ShareItem) => row.status === 'pending'

const tableData = ref<ShareItem[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<ShareItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  status: '' as ShareStatus | '',
  period: '',
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
    prop: 'status',
    label: '状态:',
    type: 'select',
    placeholder: '请选择',
    options: shareStatusOptions,
  },
  {
    prop: 'period',
    label: '分润期间:',
    type: 'select',
    placeholder: '请选择',
    options: getSharePeriodOptions(),
  },
  {
    prop: 'keyword',
    label: '关键字查询:',
    type: 'input',
    placeholder: '单号/合作方/备注',
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '分润单号', width: 100, align: 'center' },
  { prop: 'partnerName', label: '合作方', minWidth: 200 },
  { prop: 'period', label: '分润期间', width: 110, align: 'center' },
  { prop: 'shareAmount', label: '分润金额(元)', width: 130, align: 'right', slot: true },
  { prop: 'ratio', label: '分润比例(%)', width: 110, align: 'right' },
  { prop: 'status', label: '状态', width: 100, align: 'center', slot: true },
  { prop: 'remark', label: '备注', minWidth: 160 },
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await getSharePage({
      page: currentPage.value,
      pageSize: pageSize.value,
      status: (searchModel.status || undefined) as ShareStatus | undefined,
      period: searchModel.period || undefined,
      keyword: searchModel.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载分润列表失败:', e)
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
  searchModel.status = ''
  searchModel.period = ''
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
const handleView = (row: ShareItem) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleEdit = (row: ShareItem) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleSettle = async (row: ShareItem) => {
  try {
    await ElMessageBox.confirm(
      `确定对分润单「${row.code}」（${row.partnerName} ${row.period}）执行结算吗？`,
      '结算确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
  } catch {
    return
  }
  const res = await settleShare(row.id)
  if (res.code === 200 && res.data && res.data.id) {
    ElMessage.success('结算成功')
    loadData()
  } else {
    ElMessage.error('结算失败')
  }
}
const handleDelete = async (row: ShareItem) => {
  try {
    await ElMessageBox.confirm(`确定删除分润单「${row.code}」吗？删除后无法恢复`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await deleteShare(row.id)
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
.share-list {
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

.amount-text {
  font-weight: 600;
  color: #303133;
}
</style>
