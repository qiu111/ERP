<template>
  <div class="refund-list">
    <SearchBar
      title="退款管理"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="refund-list__table-wrap">
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
          <span class="amount-text">{{ formatAmount((row as RefundItem).amount) }}</span>
        </template>

        <template #column-status="{ row }">
          <el-tag :type="refundStatusTagTypeMap[(row as RefundItem).status]" effect="light" size="small">
            {{ refundStatusLabelMap[(row as RefundItem).status] }}
          </el-tag>
        </template>

        <template #operation="{ row }">
          <el-button type="success" link size="small" @click="handleView(row)">
            <el-icon><View /></el-icon>
            详情
          </el-button>
          <!-- 仅待审核可编辑/审核/删除 -->
          <template v-if="isPending(row)">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="success" link size="small" @click="handleAudit(row, 'refunded')">
              <el-icon><Check /></el-icon>
              通过
            </el-button>
            <el-button type="warning" link size="small" @click="handleAudit(row, 'rejected')">
              <el-icon><Close /></el-icon>
              驳回
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </template>
      </CommonTable>
    </div>

    <RefundDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { View, Edit, Delete, Check, Close } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import useListPage from '@/composables/useListPage'
import RefundDialog from './RefundDialog.vue'
import {
  getRefundPage,
  deleteRefund,
  auditRefund,
  refundStatusOptions,
  refundStatusLabelMap,
  refundStatusTagTypeMap,
  type RefundItem,
  type RefundStatus,
} from '@/mock/finance'

const formatAmount = (n: number) =>
  (n ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const isPending = (row: RefundItem) => row.status === 'pending'

const tableData = ref<RefundItem[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<RefundItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  status: '' as RefundStatus | '',
  refundDate: '' as [string, string] | '',
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
    options: refundStatusOptions,
  },
  {
    prop: 'refundDate',
    label: '退款日期:',
    type: 'daterange',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
  },
  {
    prop: 'keyword',
    label: '关键字查询:',
    type: 'input',
    placeholder: '单号/客户/订单号/原因',
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '退款单号', width: 100, align: 'center' },
  { prop: 'customerName', label: '客户名称', minWidth: 180 },
  { prop: 'orderNo', label: '关联订单号', width: 130, align: 'center' },
  { prop: 'amount', label: '退款金额(元)', width: 130, align: 'right', slot: true },
  { prop: 'reason', label: '退款原因', minWidth: 180 },
  { prop: 'refundDate', label: '退款日期', width: 120, align: 'center' },
  { prop: 'status', label: '状态', width: 100, align: 'center', slot: true },
  { prop: 'remark', label: '备注', minWidth: 160 },
]

const loadData = async () => {
  loading.value = true
  try {
    const range = Array.isArray(searchModel.refundDate) ? searchModel.refundDate : ['', '']
    const res = await getRefundPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      status: (searchModel.status || undefined) as RefundStatus | undefined,
      dateStart: range[0] || undefined,
      dateEnd: range[1] || undefined,
      keyword: searchModel.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载退款列表失败:', e)
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
  searchModel.refundDate = ''
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
const handleView = (row: RefundItem) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleEdit = (row: RefundItem) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleAudit = async (row: RefundItem, status: 'refunded' | 'rejected') => {
  const action = status === 'refunded' ? '审核通过（退款）' : '审核驳回'
  try {
    await ElMessageBox.confirm(`确定对退款单「${row.code}」执行${action}吗？`, '审核确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await auditRefund(row.id, status)
  if (res.code === 200 && res.data && res.data.id) {
    ElMessage.success(`${action}成功`)
    loadData()
  } else {
    ElMessage.error(`${action}失败`)
  }
}
const handleDelete = async (row: RefundItem) => {
  try {
    await ElMessageBox.confirm(`确定删除退款单「${row.code}」吗？删除后无法恢复`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await deleteRefund(row.id)
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
.refund-list {
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
