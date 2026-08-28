<template>
  <div class="doc-list">
    <SearchBar
      title="我发起的公文"
      :fields="searchFields"
      v-model="searchModel"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="doc-list__table-wrap">
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
        <template #column-docType="{ row }">
          <el-tag effect="plain" size="small">{{ row.docType }}</el-tag>
        </template>

        <template #column-urgency="{ row }">
          <el-tag :type="urgencyTagTypeMap[row.urgency as DocUrgency]" effect="light" size="small">
            {{ row.urgency }}
          </el-tag>
        </template>

        <template #column-status="{ row }">
          <el-tag :type="docStatusTagTypeMap[row.status as DocStatus]" effect="light" size="small">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>

        <template #operation="{ row }">
          <el-button type="warning" link size="small" @click="handleView(row)">
            <el-icon><View /></el-icon>
            详情
          </el-button>
          <el-button
            v-if="row.status === 'sent' && row.records.length === 0"
            type="info"
            link
            size="small"
            @click="handleWithdraw(row)"
          >
            撤回
          </el-button>
          <el-button
            v-if="row.status === 'withdrawn'"
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

    <DocumentDetailDialog v-model="detailVisible" :record="currentRecord" />
  </div>
</template>

<script setup lang="ts">
import { View, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import DocumentDetailDialog from './DocumentDetailDialog.vue'
import useListPage from '@/composables/useListPage'
import {
  getDocumentPage,
  withdrawDocument,
  deleteDocument,
  docTypeOptions,
  docStatusOptions,
  docStatusTagTypeMap,
  urgencyTagTypeMap,
  type DocumentItem,
  type DocStatus,
  type DocUrgency,
} from '@/mock/document'

const tableData = ref<DocumentItem[]>([])
const detailVisible = ref(false)
const currentRecord = ref<DocumentItem | null>(null)

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
  { prop: 'status', label: '状态:', type: 'select', placeholder: '请选择', options: docStatusOptions.filter((o) => o.value !== 'draft') },
  { prop: 'keyword', label: '关键字:', type: 'input', placeholder: '字号/标题' },
]

const columns: TableColumn[] = [
  { prop: 'docNo', label: '公文字号', width: 150, align: 'center' },
  { prop: 'title', label: '标题', minWidth: 250 },
  { prop: 'docType', label: '文种', width: 100, align: 'center', slot: true },
  { prop: 'urgency', label: '缓急', width: 90, align: 'center', slot: true },
  { prop: 'recipients', label: '主送人员', width: 180, showOverflowTooltip: true },
  { prop: 'sendTime', label: '发送时间', width: 160, align: 'center' },
  { prop: 'status', label: '状态', width: 100, align: 'center', slot: true },
]

function getStatusLabel(status: DocStatus): string {
  return docStatusOptions.find((o) => o.value === status)?.label || status
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getDocumentPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      view: 'initiated',
      status: searchModel.status || undefined,
      keyword: searchModel.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载我发起的公文失败:', e)
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
const handleView = (row: DocumentItem) => {
  currentRecord.value = row
  detailVisible.value = true
}
const handleWithdraw = async (row: DocumentItem) => {
  try {
    await ElMessageBox.confirm(`确定撤回公文「${row.title}」吗？`, '撤回确认', {
      confirmButtonText: '撤回',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await withdrawDocument(row.id)
  if (res.code === 200 && res.data.id) {
    ElMessage.success('已撤回')
    loadData()
  } else ElMessage.error('撤回失败（可能已有人处理）')
}
const handleDelete = async (row: DocumentItem) => {
  try {
    await ElMessageBox.confirm(`确定删除公文「${row.title}」吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await deleteDocument(row.id)
  if (res.code === 200 && res.data) {
    ElMessage.success('删除成功')
    loadData()
  } else ElMessage.error('删除失败')
}

onMounted(() => loadData())
</script>

<style scoped lang="scss">
.doc-list {
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
