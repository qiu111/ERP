<template>
  <div class="contract-record-list">
    <SearchBar
      title="合同收录"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="contract-record-list__table-wrap">
      <CommonTable
        v-loading="loading"
        :columns="columns"
        :data="tableData"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        :row-key="'id'"
        height="100%"
        :operation-width="180"
        @page-change="handlePageChange"
        @page-size-change="handleSizeChange"
      >
        <template #column-type="{ row }">
          <el-tag :type="typeTagTypeMap[(row as ContractItem).type]" effect="light" size="small">
            {{ typeLabel[(row as ContractItem).type] }}
          </el-tag>
        </template>

        <template #column-amount="{ row }">
          <span>￥{{ (row as ContractItem).amount.toLocaleString('zh-CN') }}</span>
        </template>

        <template #column-status="{ row }">
          <el-tag :type="statusTagTypeMap[(row as ContractItem).status]" effect="light" size="small">
            {{ statusLabel[(row as ContractItem).status] }}
          </el-tag>
        </template>

        <template #operation="{ row }">
          <el-button type="warning" link size="small" @click="handleView(row)">
            <el-icon><View /></el-icon>
            详情
          </el-button>
          <el-button
            v-if="(row as ContractItem).status === 'draft'"
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

    <RecordDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { View, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import RecordDialog from './RecordDialog.vue'
import useListPage from '@/composables/useListPage'
import {
  getContractPage,
  deleteContract,
  typeLabel,
  typeTagTypeMap,
  statusLabel,
  statusTagTypeMap,
  type ContractItem,
} from '@/mock/contract'

const tableData = ref<ContractItem[]>([])
const dialogVisible = ref(false)
// 收录页仅支持：收录新合同（add）/ 详情（view）
const dialogMode = ref<'add' | 'view'>('add')
const currentRecord = ref<ContractItem | null>(null)

const searchModel = reactive<Record<string, any>>({
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
    prop: 'keyword',
    label: '关键字查询:',
    type: 'input',
    placeholder: '编号/名称/对方单位/经办人/条款',
  },
]

const columns: TableColumn[] = [
  { prop: 'contractNo', label: '合同编号', width: 130, align: 'center' },
  { prop: 'name', label: '合同名称', minWidth: 220 },
  { prop: 'type', label: '类型', width: 90, align: 'center', slot: true },
  { prop: 'party', label: '对方单位', minWidth: 180 },
  { prop: 'amount', label: '合同金额', width: 130, align: 'right', slot: true },
  { prop: 'signDate', label: '签订日期', width: 110, align: 'center' },
  { prop: 'status', label: '状态', width: 100, align: 'center', slot: true },
  { prop: 'handler', label: '经办人', width: 100, align: 'center' },
  { prop: 'createTime', label: '收录时间', width: 150, align: 'center' },
]

// 全部合同按创建时间（收录时间）降序
const loadData = async () => {
  loading.value = true
  try {
    const res = await getContractPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchModel.keyword || undefined,
      orderBy: 'createTime',
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载合同收录列表失败:', e)
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
const handleView = (row: ContractItem) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleDelete = async (row: ContractItem) => {
  try {
    await ElMessageBox.confirm(`确定删除合同「${row.contractNo}」吗？删除后无法恢复`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await deleteContract(row.id)
  if (res.code === 200 && res.data) {
    ElMessage.success('删除成功')
    loadData()
  } else {
    ElMessage.error('删除失败（仅草稿状态的合同可删除）')
  }
}

onMounted(() => loadData())
</script>

<style scoped lang="scss">
.contract-record-list {
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
