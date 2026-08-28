<template>
  <div class="my-initiation-page">
    <SearchBar
      :fields="searchFields"
      v-model="searchModel"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="my-initiation-page__table-wrap">
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
        <template #column-approvalAmount="{ row }">
          <span class="amount-text">{{ formatAmount(row.approvalAmount) }}</span>
        </template>

        <template #column-category="{ row }">
          <el-tag :type="getCategoryTagType(row.category)" effect="light" size="small">
            {{ getCategoryLabel(row.category) }}
          </el-tag>
        </template>

        <template #column-saleType="{ row }">
          <span :class="{ 'dash-text': row.saleType === '-' }">{{ row.saleType }}</span>
        </template>

        <template #column-purchaseType="{ row }">
          <span :class="{ 'dash-text': row.purchaseType === '-' }">{{ row.purchaseType }}</span>
        </template>

        <template #column-status="{ row }">
          <el-tag
            :type="statusTagTypeMap[row.status]"
            effect="light"
            size="small"
          >
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>

        <template #operation="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">详情</el-button>
        </template>
      </CommonTable>
    </div>

    <!-- 详情弹框：复用ApprovalFormDialog view模式 -->
    <ApprovalFormDialog
      v-model="dialogVisible"
      mode="view"
      :category="dialogCategory"
      :record="currentRecord"
    />
  </div>
</template>

<script setup lang="ts">
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import ApprovalFormDialog from './ApprovalFormDialog.vue'
import useListPage from '@/composables/useListPage'
import {
  getMyInitiationPage,
  getCategoryLabel,
  getStatusLabel,
  categoryOptions,
  statusTagTypeMap,
  type MyInitiationItem,
  type ApprovalCategory,
} from '@/mock/approvalMyRelated'

const tableData = ref<MyInitiationItem[]>([])
const dialogVisible = ref(false)
const dialogCategory = ref<ApprovalCategory>('expense')
const currentRecord = ref<MyInitiationItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  orderNo: '',
  category: '',
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
    prop: 'orderNo',
    label: '订单编号:',
    type: 'input',
    placeholder: '请输入订单编号',
  },
  {
    prop: 'category',
    label: '分类:',
    type: 'select',
    placeholder: '请选择',
    options: categoryOptions,
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '编号', width: 90 },
  { prop: 'orderNo', label: '订单编号', minWidth: 180 },
  { prop: 'category', label: '分类', width: 100, align: 'center' },
  { prop: 'approvalAmount', label: '单据金额', width: 120, align: 'right' },
  { prop: 'saleType', label: '销售类型', minWidth: 140 },
  { prop: 'purchaseType', label: '采购类型', minWidth: 140 },
  { prop: 'status', label: '审批状态', width: 120, align: 'center' },
  { prop: 'initiator', label: '发起人', width: 80, align: 'center' },
  { prop: 'createTime', label: '发起时间', width: 160, align: 'center' },
]

const categoryTagTypeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  sale_order: 'primary',
  purchase_order: 'success',
  expense: 'warning',
  goods_payment: 'danger',
  purchase_contract: 'info',
  refund: 'danger',
  salary: 'success',
}
const getCategoryTagType = (c: string) => categoryTagTypeMap[c] || 'info'

const formatAmount = (n: number) =>
  n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
      orderNo: searchModel.orderNo || undefined,
      category: searchModel.category || undefined,
    }
    const res = await getMyInitiationPage(params)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    console.error(err)
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
  searchModel.orderNo = ''
  searchModel.category = ''
  currentPage.value = 1
  loadData()
}

const handleView = (row: MyInitiationItem) => {
  dialogCategory.value = row.category
  currentRecord.value = {
    ...row,
    id: row.id,
    code: row.code,
    orderNo: row.orderNo,
    companyName: '--',
    payee: '-',
    approvalAmount: row.approvalAmount,
    currency: row.currency,
    category: row.category,
    currentApprover: '-',
    lastResult: row.steps.length ? row.steps[row.steps.length - 1].result : '-',
    lastOpinion: row.steps.length ? row.steps[row.steps.length - 1].opinion : '-',
    initiator: row.initiator,
    createTime: row.createTime,
    status: row.status,
    steps: row.steps,
    formData: row.formData,
  } as any
  dialogVisible.value = true
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.my-initiation-page {
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
    margin-top: 16px;
  }
}

.amount-text {
  font-weight: 600;
  color: #f56c6c;
  font-size: 13px;
}

.dash-text { color: #c0c4cc; }
</style>
