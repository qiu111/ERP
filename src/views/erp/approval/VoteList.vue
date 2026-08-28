<template>
  <div class="vote-list">
    <SearchBar
      title="投票管理"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="vote-list__table-wrap">
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
          <el-tag :type="voteStatusTagTypeMap[row.status as VoteStatus]" effect="light" size="small">
            {{ row.status === 'open' ? '投票中' : '已结束' }}
          </el-tag>
        </template>

        <template #column-totalVotes="{ row }">
          <span>{{ row.voters.length }} / {{ row.options.reduce((s: number, o: any) => s + o.count, 0) }}</span>
        </template>

        <template #operation="{ row }">
          <el-button type="warning" link size="small" @click="handleView(row)">
            <el-icon><View /></el-icon>
            详情
          </el-button>
          <el-button
            v-if="row.status === 'open' && row.initiator === '超级管理员'"
            type="info"
            link
            size="small"
            @click="handleClose(row)"
          >
            结束
          </el-button>
          <el-button
            v-if="row.initiator === '超级管理员' && row.voters.length === 0"
            type="danger"
            link
            size="small"
            @click="handleDelete(row)"
          >
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </template>
      </CommonTable>
    </div>

    <VoteDialog v-model="dialogVisible" :mode="dialogMode" :record="currentRecord" @success="loadData" />
  </div>
</template>

<script setup lang="ts">
import { View, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import VoteDialog from './VoteDialog.vue'
import useListPage from '@/composables/useListPage'
import {
  getVotePage,
  closeVote,
  deleteVote,
  voteStatusOptions,
  voteStatusTagTypeMap,
  type VoteItem,
  type VoteStatus,
} from '@/mock/vote'
import { CURRENT_USER } from '@/mock/document'

const tableData = ref<VoteItem[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'view'>('add')
const currentRecord = ref<VoteItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  status: '',
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
  { prop: 'status', label: '状态:', type: 'select', placeholder: '请选择', options: voteStatusOptions },
  { prop: 'keyword', label: '关键字:', type: 'input', placeholder: '主题/选项' },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '编号', width: 80, align: 'center' },
  { prop: 'subject', label: '投票主题', minWidth: 260 },
  { prop: 'initiator', label: '发起人', width: 110, align: 'center' },
  { prop: 'createTime', label: '发起时间', width: 160, align: 'center' },
  { prop: 'deadline', label: '截止时间', width: 160, align: 'center' },
  { prop: 'totalVotes', label: '已投/已收', width: 100, align: 'center', slot: true },
  { prop: 'status', label: '状态', width: 100, align: 'center', slot: true },
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await getVotePage({
      page: currentPage.value,
      pageSize: pageSize.value,
      status: searchModel.status || undefined,
      keyword: searchModel.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载投票列表失败:', e)
  } finally {
    loading.value = false
  }
}
setLoadFn(loadData)

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}
const handleReset = () => {
  searchModel.status = ''
  searchModel.keyword = ''
  currentPage.value = 1
  loadData()
}

const handleAdd = () => {
  dialogMode.value = 'add'
  currentRecord.value = null
  dialogVisible.value = true
}
const handleView = (row: VoteItem) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleClose = async (row: VoteItem) => {
  try {
    await ElMessageBox.confirm(`确定结束投票「${row.subject}」吗？结束后不可再投票。`, '结束确认', {
      confirmButtonText: '结束',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await closeVote(row.id)
  if (res.code === 200 && res.data.id) {
    ElMessage.success('投票已结束')
    loadData()
  } else ElMessage.error('操作失败')
}
const handleDelete = async (row: VoteItem) => {
  try {
    await ElMessageBox.confirm(`确定删除投票「${row.subject}」吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await deleteVote(row.id)
  if (res.code === 200 && res.data) {
    ElMessage.success('删除成功')
    loadData()
  } else ElMessage.error('删除失败（仅发起人且无票数时可删除）')
}

onMounted(() => loadData())
</script>

<style scoped lang="scss">
.vote-list {
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
