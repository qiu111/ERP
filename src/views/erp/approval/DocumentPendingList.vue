<template>
  <div class="doc-list">
    <SearchBar
      title="待发公文"
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

        <template #operation="{ row }">
          <el-button type="primary" link size="small" @click="handleEdit(row)">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button type="success" link size="small" @click="handleSend(row)">
            发送
          </el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </template>
      </CommonTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import useListPage from '@/composables/useListPage'
import {
  getDocumentPage,
  sendDocument,
  deleteDocument,
  docTypeOptions,
  urgencyTagTypeMap,
  type DocumentItem,
  type DocUrgency,
} from '@/mock/document'

const router = useRouter()
const tableData = ref<DocumentItem[]>([])

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
  { prop: 'title', label: '标题', minWidth: 280 },
  { prop: 'docType', label: '文种', width: 100, align: 'center', slot: true },
  { prop: 'urgency', label: '缓急', width: 90, align: 'center', slot: true },
  { prop: 'createTime', label: '发起时间', width: 160, align: 'center' },
  { prop: 'remark', label: '备注', minWidth: 140, showOverflowTooltip: true },
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await getDocumentPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      view: 'pending',
      docType: searchModel.docType || undefined,
      keyword: searchModel.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载待发公文失败:', e)
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

const handleEdit = (row: DocumentItem) => {
  router.push({ path: '/oa/document/create', query: { id: row.id } })
}
const handleSend = async (row: DocumentItem) => {
  try {
    await ElMessageBox.confirm(`确定发送公文「${row.title}」吗？发送后主送人员将收到公文。`, '发送确认', {
      confirmButtonText: '发送',
      cancelButtonText: '取消',
      type: 'info',
    })
  } catch {
    return
  }
  const res = await sendDocument(row.id)
  if (res.code === 200 && res.data.id) {
    ElMessage.success(`已发送（${res.data.docNo}）`)
    loadData()
  } else ElMessage.error('发送失败')
}
const handleDelete = async (row: DocumentItem) => {
  try {
    await ElMessageBox.confirm(`确定删除草稿「${row.title}」吗？`, '删除确认', {
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
