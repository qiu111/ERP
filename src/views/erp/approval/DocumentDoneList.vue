<template>
  <div class="doc-list">
    <SearchBar
      title="已处理公文"
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

        <template #column-myAction="{ row }">
          <el-tag
            :type="getMyAction(row) === '驳回' ? 'danger' : getMyAction(row) === '同意' ? 'success' : 'info'"
            effect="light"
            size="small"
          >
            {{ getMyAction(row) }}
          </el-tag>
        </template>

        <template #operation="{ row }">
          <el-button type="warning" link size="small" @click="handleView(row)">
            <el-icon><View /></el-icon>
            详情
          </el-button>
        </template>
      </CommonTable>
    </div>

    <DocumentDetailDialog v-model="detailVisible" :record="currentRecord" />
  </div>
</template>

<script setup lang="ts">
import { View } from '@element-plus/icons-vue'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import DocumentDetailDialog from './DocumentDetailDialog.vue'
import useListPage from '@/composables/useListPage'
import {
  getDocumentPage,
  processActionOptions,
  docTypeOptions,
  urgencyTagTypeMap,
  CURRENT_USER,
  type DocumentItem,
  type DocUrgency,
} from '@/mock/document'

const tableData = ref<DocumentItem[]>([])
const detailVisible = ref(false)
const currentRecord = ref<DocumentItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  docType: '',
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
  { prop: 'docType', label: '文种:', type: 'select', placeholder: '请选择', options: docTypeOptions },
  { prop: 'keyword', label: '关键字:', type: 'input', placeholder: '字号/标题' },
]

const columns: TableColumn[] = [
  { prop: 'docNo', label: '公文字号', width: 150, align: 'center' },
  { prop: 'title', label: '标题', minWidth: 240 },
  { prop: 'docType', label: '文种', width: 100, align: 'center', slot: true },
  { prop: 'urgency', label: '缓急', width: 90, align: 'center', slot: true },
  { prop: 'initiator', label: '发起人', width: 110, align: 'center' },
  { prop: 'sendTime', label: '发送时间', width: 160, align: 'center' },
  { prop: 'myAction', label: '我的处理', width: 100, align: 'center', slot: true },
]

/** 当前用户对此公文的处理动作 */
function getMyAction(row: DocumentItem): string {
  const rec = row.records.find((r) => r.person === CURRENT_USER)
  if (!rec) return '—'
  return processActionOptions.find((o) => o.value === rec.action)?.label || rec.action
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getDocumentPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      view: 'done',
      docType: searchModel.docType || undefined,
      keyword: searchModel.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载已处理公文失败:', e)
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
  searchModel.docType = ''
  searchModel.keyword = ''
  currentPage.value = 1
  loadData()
}
const handleView = (row: DocumentItem) => {
  currentRecord.value = row
  detailVisible.value = true
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
