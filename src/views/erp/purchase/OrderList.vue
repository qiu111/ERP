<template>
  <div class="purchase-order-list">
    <SearchBar
      title="采购订单"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      add-permission="erp_purchase_order:add"
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #extra>
        <el-button
          v-if="has('erp_purchase_order:export')"
          :color="'#67c23a'"
          @click="handleExport"
        >
          导出
        </el-button>
      </template>
    </SearchBar>

    <CommonTable
      v-loading="loading"
      :columns="columns"
      :data="tableData"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      :row-key="'id'"
      @page-change="handlePageChange"
      @page-size-change="handleSizeChange"
    >
      <template #column-status="{ row }">
        <span
          class="status-tag"
          :style="{ color: orderStatusMap[row.status]?.color || '#909399' }"
        >
          {{ orderStatusMap[row.status]?.text || row.status }}
        </span>
      </template>

      <template #column-totalAmount="{ row }">
        <span class="amount">¥{{ row.totalAmount.toFixed(2) }}</span>
      </template>

      <template #column-purchaseType="{ row }">
        {{ purchaseTypeMap[row.purchaseType] || row.purchaseType }}
      </template>

      <template #column-paymentMethod="{ row }">
        {{ paymentMethodMap[row.paymentMethod] || row.paymentMethod }}
      </template>

      <template #column-shippingMethod="{ row }">
        {{ shippingMethodMap[row.shippingMethod] || row.shippingMethod }}
      </template>

      <template #operation="{ row }">
        <el-button
          v-if="has('erp_purchase_order:edit') && row.status === 'draft'"
          type="primary"
          link
          size="small"
          @click="handleEdit(row)"
        >
          编辑
        </el-button>
        <el-button
          v-if="has('erp_purchase_order:view')"
          type="info"
          link
          size="small"
          @click="handleView(row)"
        >
          查看
        </el-button>
        <el-button
          v-if="has('erp_purchase_order:delete') && row.status === 'draft'"
          type="danger"
          link
          size="small"
          @click="handleDelete(row)"
        >
          删除
        </el-button>
      </template>
    </CommonTable>

    <OrderDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import { usePermission } from '@/composables/usePermission'
import useListPage from '@/composables/useListPage'
import OrderDialog from './OrderDialog.vue'
import {
  getPurchaseOrderPage,
  deletePurchaseOrder,
  orderStatusOptions,
  orderStatusMap,
  purchaseTypeMap,
  paymentMethodMap,
  shippingMethodMap,
} from '@/mock/purchaseOrder'
import type { PurchaseOrder } from '@/mock/purchaseOrder'

const { has } = usePermission()
const {
  currentPage,
  pageSize,
  total,
  loading,
  handlePageChange,
  handleSizeChange,
  setLoadFn,
  confirmDelete,
} = useListPage()
const tableData = ref<PurchaseOrder[]>([])

const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<PurchaseOrder | null>(null)

let searchModel = reactive<Record<string, any>>({
  keyword: '',
  status: '',
})

const searchFields: SearchField[] = [
  { prop: 'keyword', label: '单号/采购员', type: 'input', placeholder: '请输入单号或采购员' },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: orderStatusOptions,
  },
]

const columns: TableColumn[] = [
  { prop: 'orderNo', label: '采购单号', width: 160, align: 'center' },
  { prop: 'purchaseType', label: '采购类型', width: 120, align: 'center' },
  { prop: 'company', label: '采购公司', minWidth: 140 },
  { prop: 'warehouse', label: '仓库', width: 120 },
  { prop: 'buyer', label: '采购员', width: 100 },
  { prop: 'deliveryDate', label: '交货日期', width: 120, align: 'center' },
  { prop: 'totalAmount', label: '采购金额', width: 130, align: 'right' },
  { prop: 'paymentMethod', label: '付款方式', width: 120 },
  { prop: 'shippingMethod', label: '运输方式', width: 120 },
  { prop: 'status', label: '状态', width: 100, align: 'center' },
  { prop: 'createTime', label: '创建时间', width: 160, align: 'center' },
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await getPurchaseOrderPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchModel.keyword || undefined,
      status: searchModel.status || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    console.error('加载采购订单列表失败:', err)
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
  searchModel.status = ''
  currentPage.value = 1
  loadData()
}

const handleAdd = () => {
  dialogMode.value = 'add'
  currentRecord.value = null
  dialogVisible.value = true
}

const handleEdit = (row: PurchaseOrder) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleView = (row: PurchaseOrder) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleDelete = (row: PurchaseOrder) => {
  confirmDelete(deletePurchaseOrder, row, row.orderNo)
}

const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.purchase-order-list {
  padding: 20px;
}

.status-tag {
  font-weight: 500;
}

.amount {
  font-weight: 600;
  color: #303133;
}
</style>