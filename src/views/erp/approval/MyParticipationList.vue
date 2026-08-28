<template>
  <div class="my-participation-page">
    <SearchBar
      :fields="searchFields"
      v-model="searchModel"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="my-participation-page__table-wrap">
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

        <template #column-lastResult="{ row }">
          <el-tag
            v-if="row.lastResult !== '-'"
            :type="resultTagTypeMap[row.lastResult]"
            effect="light"
            size="small"
          >
            {{ row.lastResult }}
          </el-tag>
          <span v-else class="dash-text">-</span>
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
  getMyParticipationPage,
  getCategoryLabel,
  categoryOptions,
  resultTagTypeMap,
  type MyParticipationItem,
  type ApprovalCategory,
} from '@/mock/approvalMyRelated'

const tableData = ref<MyParticipationItem[]>([])
const dialogVisible = ref(false)
const dialogCategory = ref<ApprovalCategory>('expense')
const currentRecord = ref<MyParticipationItem | null>(null)

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
  { prop: 'companyName', label: '公司名', minWidth: 180 },
  { prop: 'payee', label: '收款人/单位', minWidth: 200 },
  { prop: 'approvalAmount', label: '审批金额', width: 120, align: 'right' },
  { prop: 'currency', label: '币种', width: 80, align: 'center' },
  { prop: 'category', label: '分类', width: 100, align: 'center' },
  { prop: 'currentApprover', label: '审批人', width: 90, align: 'center' },
  { prop: 'lastResult', label: '审批结果', width: 100, align: 'center' },
  { prop: 'lastOpinion', label: '审批意见', minWidth: 140 },
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
    const res = await getMyParticipationPage(params)
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

const handleView = (row: MyParticipationItem) => {
  dialogCategory.value = row.category
  // 兼容ApprovalFormDialog - 把MyParticipationItem映射为通用record
  currentRecord.value = {
    ...row,
    id: row.id,
    code: row.code,
    orderNo: row.orderNo,
    companyName: row.companyName,
    payee: row.payee,
    approvalAmount: row.approvalAmount,
    currency: row.currency,
    category: row.category,
    currentApprover: row.currentApprover,
    lastResult: row.lastResult,
    lastOpinion: row.lastOpinion,
    initiator: row.initiator,
    createTime: row.createTime,
    status: row.steps.length ? 'finished' : (row.currentApprover !== '-' ? 'approving' : 'initiated'),
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
.my-participation-page {
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
