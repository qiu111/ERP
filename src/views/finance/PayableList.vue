<template>
  <div class="payable-list">
    <SearchBar
      title="应付款管理"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="payable-list__table-wrap">
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
        <template #column-amount="{ row }">
          <span class="amount-text">{{ formatAmount((row as PayableItem).amount) }}</span>
        </template>

        <template #column-paidAmount="{ row }">
          <span>{{ formatAmount((row as PayableItem).paidAmount) }}</span>
        </template>

        <template #column-status="{ row }">
          <el-tag :type="payStatusTagTypeMap[(row as PayableItem).status]" effect="light" size="small">
            {{ payStatusLabelMap[(row as PayableItem).status] }}
          </el-tag>
        </template>

        <template #operation="{ row }">
          <el-button type="success" link size="small" @click="handleView(row)">
            <el-icon><View /></el-icon>
            详情
          </el-button>
          <!-- 仅未付可编辑/删除 -->
          <template v-if="isUnpaid(row)">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
          <!-- 非已付可登记付款 -->
          <el-button
            v-if="!isPaid(row)"
            type="success"
            link
            size="small"
            @click="handlePay(row)"
          >
            <el-icon><Money /></el-icon>
            登记付款
          </el-button>
        </template>
      </CommonTable>
    </div>

    <PayableDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { View, Edit, Delete, Money } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import useListPage from '@/composables/useListPage'
import PayableDialog from './PayableDialog.vue'
import {
  getPayablePage,
  deletePayable,
  payPaid,
  payStatusOptions,
  payStatusLabelMap,
  payStatusTagTypeMap,
  type PayableItem,
  type PayStatus,
} from '@/mock/finance'

const formatAmount = (n: number) =>
  (n ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const isUnpaid = (row: PayableItem) => row.status === 'unpaid'
const isPaid = (row: PayableItem) => row.status === 'paid'

const tableData = ref<PayableItem[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<PayableItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  status: '' as PayStatus | '',
  dueDate: '' as [string, string] | '',
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
    options: payStatusOptions,
  },
  {
    prop: 'dueDate',
    label: '到期日:',
    type: 'daterange',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
  },
  {
    prop: 'keyword',
    label: '关键字查询:',
    type: 'input',
    placeholder: '单号/供应商/订单号/备注',
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '应付单号', width: 100, align: 'center' },
  { prop: 'supplierName', label: '供应商', minWidth: 200 },
  { prop: 'orderNo', label: '关联订单号', width: 130, align: 'center' },
  { prop: 'amount', label: '应付金额(元)', width: 130, align: 'right', slot: true },
  { prop: 'paidAmount', label: '已付金额(元)', width: 130, align: 'right', slot: true },
  { prop: 'dueDate', label: '到期日', width: 120, align: 'center' },
  { prop: 'status', label: '状态', width: 100, align: 'center', slot: true },
  { prop: 'remark', label: '备注', minWidth: 160 },
]

const loadData = async () => {
  loading.value = true
  try {
    const range = Array.isArray(searchModel.dueDate) ? searchModel.dueDate : ['', '']
    const res = await getPayablePage({
      page: currentPage.value,
      pageSize: pageSize.value,
      status: (searchModel.status || undefined) as PayStatus | undefined,
      dateStart: range[0] || undefined,
      dateEnd: range[1] || undefined,
      keyword: searchModel.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载应付款列表失败:', e)
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
  searchModel.dueDate = ''
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
const handleView = (row: PayableItem) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleEdit = (row: PayableItem) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}
const handlePay = async (row: PayableItem) => {
  const remaining = Math.round(((row.amount ?? 0) - (row.paidAmount ?? 0)) * 100) / 100
  let value = ''
  try {
    const { value: v } = await ElMessageBox.prompt(
      `应付单「${row.code}」剩余应付 ${formatAmount(remaining)} 元，请输入本次付款金额`,
      '登记付款',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: String(remaining),
        inputPattern: /^\d+(\.\d{1,2})?$/,
        inputErrorMessage: '请输入正确的金额（最多两位小数）',
      }
    )
    value = v
  } catch {
    return
  }
  const amount = Number(value)
  if (!(amount > 0)) {
    ElMessage.error('付款金额必须大于0')
    return
  }
  if (amount > remaining) {
    ElMessage.error('付款金额不能超过剩余应付金额')
    return
  }
  const res = await payPaid(row.id, amount)
  if (res.code === 200 && res.data && res.data.id) {
    ElMessage.success('登记付款成功')
    loadData()
  } else {
    ElMessage.error('登记付款失败')
  }
}
const handleDelete = async (row: PayableItem) => {
  try {
    await ElMessageBox.confirm(`确定删除应付单「${row.code}」吗？删除后无法恢复`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await deletePayable(row.id)
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
.payable-list {
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
