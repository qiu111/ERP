<template>
  <div class="reception-initiated-list">
    <SearchBar
      title="我发起的接待"
      :fields="searchFields"
      v-model="searchModel"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="reception-initiated-list__table-wrap">
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

        <template #column-receptionType="{ row }">
          <el-tag :type="typeTagTypeMap[row.receptionType as ReceptionType]" effect="light" size="small">
            {{ getTypeLabel(row.receptionType) }}
          </el-tag>
        </template>

        <template #column-level="{ row }">
          <el-tag :type="levelTagTypeMap[row.level as ReceptionLevel]" effect="light" size="small">
            {{ getLevelLabel(row.level) }}
          </el-tag>
        </template>

        <template #column-estimatedCost="{ row }">
          <span class="amount-text">¥ {{ formatAmount(row.estimatedCost) }}</span>
        </template>

        <template #column-status="{ row }">
          <el-tag :type="statusTagTypeMap[row.status as ReceptionStatus]" effect="light" size="small">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>

        <template #operation="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">
            <el-icon><View /></el-icon>
            详情
          </el-button>
        </template>
      </CommonTable>
    </div>

    <!-- 详情弹框：复用 ReceptionDialog view 模式 -->
    <ReceptionDialog
      v-model="dialogVisible"
      mode="view"
      :record="currentRecord"
    />
  </div>
</template>

<script setup lang="ts">
import { View } from '@element-plus/icons-vue'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import ReceptionDialog from './ReceptionDialog.vue'
import useListPage from '@/composables/useListPage'
import {
  getMyReceptionPage,
  getStatusLabel,
  getTypeLabel,
  getLevelLabel,
  statusTagTypeMap,
  typeTagTypeMap,
  levelTagTypeMap,
  receptionTypeOptions,
  receptionStatusOptions,
  type ReceptionItem,
  type ReceptionType,
  type ReceptionLevel,
  type ReceptionStatus,
} from '@/mock/reception'

const tableData = ref<ReceptionItem[]>([])
const dialogVisible = ref(false)
const currentRecord = ref<ReceptionItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  keyword: '',
  type: '' as ReceptionType | '',
  status: '',
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
    label: '搜索:',
    type: 'input',
    placeholder: '标题/客户名称/接待地点',
  },
  {
    prop: 'type',
    label: '接待类型:',
    type: 'select',
    placeholder: '请选择',
    options: receptionTypeOptions,
  },
  {
    prop: 'status',
    label: '审批状态:',
    type: 'select',
    placeholder: '请选择',
    options: receptionStatusOptions,
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '编号', width: 80, align: 'center' },
  { prop: 'title', label: '接待标题', minWidth: 220, slot: true },
  { prop: 'customerName', label: '客户名称', width: 120 },
  { prop: 'receptionType', label: '接待类型', width: 100, align: 'center', slot: true },
  { prop: 'level', label: '接待级别', width: 90, align: 'center', slot: true },
  { prop: 'receptionTime', label: '接待时间', width: 150, align: 'center' },
  { prop: 'estimatedCost', label: '预计费用', width: 120, align: 'right', slot: true },
  { prop: 'status', label: '审批状态', width: 100, align: 'center', slot: true },
  { prop: 'approver', label: '审批人', width: 110, align: 'center' },
  { prop: 'createTime', label: '发起时间', width: 150, align: 'center' },
]

const formatAmount = (amount: number): string => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getMyReceptionPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchModel.keyword || undefined,
      type: searchModel.type || undefined,
      status: searchModel.status || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    console.error('加载我发起的接待失败:', err)
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
  searchModel.keyword = ''
  searchModel.type = ''
  searchModel.status = ''
  currentPage.value = 1
  loadData()
}

const handleView = (row: ReceptionItem) => {
  currentRecord.value = row
  dialogVisible.value = true
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.reception-initiated-list {
  display: flex;
  flex-direction: column;
  padding: 16px;
  height: calc(100vh - 100px);
  overflow: hidden;

  &__table-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #fff;
    border-radius: 4px;
    padding: 16px;
    min-height: 0;
  }
}

.amount-text {
  font-weight: 600;
  color: #f56c6c;
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
