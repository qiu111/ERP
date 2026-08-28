<template>
  <div class="account-flow-list">
    <SearchBar
      title="账户流水汇总表"
      :fields="searchFields"
      v-model="searchModel"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="account-flow-list__table-wrap">
      <CommonTable
        v-loading="loading"
        :columns="columns"
        :data="tableData"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        :row-key="'id'"
        height="100%"
        :operation-width="90"
        @page-change="handlePageChange"
        @page-size-change="handleSizeChange"
      >
        <template #column-direction="{ row }">
          <el-tag :type="flowDirectionTagTypeMap[(row as AccountFlowItem).direction]" effect="light" size="small">
            {{ flowDirectionLabelMap[(row as AccountFlowItem).direction] }}
          </el-tag>
        </template>

        <template #column-amount="{ row }">
          <span class="amount-text">{{ formatAmount((row as AccountFlowItem).amount) }}</span>
        </template>

        <template #operation="{ row }">
          <el-button type="success" link size="small" @click="handleView(row)">
            <el-icon><View /></el-icon>
            详情
          </el-button>
        </template>
      </CommonTable>
    </div>

    <!-- 流水详情（只读，页内弹窗） -->
    <el-dialog
      v-model="detailVisible"
      title="流水详情"
      width="620px"
      top="10vh"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-descriptions v-if="detail" :column="2" border class="account-flow-descriptions">
        <el-descriptions-item label="流水号">{{ detail.flowNo }}</el-descriptions-item>
        <el-descriptions-item label="发生日期">{{ detail.occurDate }}</el-descriptions-item>
        <el-descriptions-item label="账户" :span="2">{{ detail.accountName }}</el-descriptions-item>
        <el-descriptions-item label="方向">
          <el-tag :type="flowDirectionTagTypeMap[detail.direction]" effect="light" size="small">
            {{ flowDirectionLabelMap[detail.direction] }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="金额(元)">
          <span class="amount-text">{{ formatAmount(detail.amount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="摘要" :span="2">{{ detail.summary }}</el-descriptions-item>
        <el-descriptions-item label="关联单号">{{ detail.relatedNo || '—' }}</el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import useListPage from '@/composables/useListPage'
import {
  getAccountFlowPage,
  getAccountFlowById,
  getAccountNameOptions,
  flowDirectionOptions,
  flowDirectionLabelMap,
  flowDirectionTagTypeMap,
  type AccountFlowItem,
  type FlowDirection,
} from '@/mock/finance'

const formatAmount = (n: number) =>
  (n ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const tableData = ref<AccountFlowItem[]>([])
const detailVisible = ref(false)
const detail = ref<AccountFlowItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  accountName: '',
  direction: '' as FlowDirection | '',
  occurDate: '' as [string, string] | '',
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
    prop: 'accountName',
    label: '账户:',
    type: 'select',
    placeholder: '请选择',
    options: getAccountNameOptions(),
  },
  {
    prop: 'direction',
    label: '方向:',
    type: 'select',
    placeholder: '请选择',
    options: flowDirectionOptions,
  },
  {
    prop: 'occurDate',
    label: '发生日期:',
    type: 'daterange',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
  },
  {
    prop: 'keyword',
    label: '关键字查询:',
    type: 'input',
    placeholder: '流水号/摘要/关联单号',
  },
]

const columns: TableColumn[] = [
  { prop: 'flowNo', label: '流水号', width: 140, align: 'center' },
  { prop: 'accountName', label: '账户', minWidth: 200 },
  { prop: 'direction', label: '方向', width: 90, align: 'center', slot: true },
  { prop: 'amount', label: '金额(元)', width: 130, align: 'right', slot: true },
  { prop: 'occurDate', label: '发生日期', width: 120, align: 'center' },
  { prop: 'summary', label: '摘要', minWidth: 180 },
  { prop: 'relatedNo', label: '关联单号', width: 120, align: 'center' },
]

const loadData = async () => {
  loading.value = true
  try {
    const range = Array.isArray(searchModel.occurDate) ? searchModel.occurDate : ['', '']
    const res = await getAccountFlowPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      accountName: searchModel.accountName || undefined,
      direction: (searchModel.direction || undefined) as FlowDirection | undefined,
      dateStart: range[0] || undefined,
      dateEnd: range[1] || undefined,
      keyword: searchModel.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载账户流水列表失败:', e)
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
  searchModel.accountName = ''
  searchModel.direction = ''
  searchModel.occurDate = ''
  searchModel.keyword = ''
  currentPage.value = 1
  loadData()
}

// ========== 操作 ==========
const handleView = async (row: AccountFlowItem) => {
  const res = await getAccountFlowById(row.id)
  if (res.code !== 200 || !res.data || !res.data.id) {
    ElMessage.warning('流水记录不存在')
    return
  }
  detail.value = res.data
  detailVisible.value = true
}

onMounted(() => loadData())
</script>

<style scoped lang="scss">
.account-flow-list {
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

.account-flow-descriptions {
  :deep(.el-descriptions__label) {
    width: 110px;
  }
}

.amount-text {
  font-weight: 600;
  color: #303133;
}
</style>
