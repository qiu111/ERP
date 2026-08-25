<template>
  <div class="purchase-receive-list">
    <SearchBar
      title="采购收货"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      add-permission="erp_purchase_receive:add"
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    />

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
      <template #column-index="{ index }">
        {{ (currentPage - 1) * pageSize + index + 1 }}
      </template>

      <template #column-status="{ row }">
        <span
          class="status-tag"
          :style="{ color: receiveStatusMap[row.status]?.color || '#909399' }"
        >
          {{ receiveStatusMap[row.status]?.text || row.status }}
        </span>
      </template>

      <template #column-amount="{ row }">
        <span class="amount">¥{{ row.amount.toFixed(2) }}</span>
      </template>

      <template #operation="{ row }">
        <el-button
          v-if="has('erp_purchase_receive:edit') && row.status === 'draft'"
          type="primary"
          link
          size="small"
          @click="handleEdit(row)"
        >
          编辑
        </el-button>
        <el-button
          v-if="has('erp_purchase_receive:view')"
          type="info"
          link
          size="small"
          @click="handleView(row)"
        >
          查看
        </el-button>
        <el-button
          v-if="has('erp_purchase_receive:delete') && row.status === 'draft'"
          type="danger"
          link
          size="small"
          @click="handleDelete(row)"
        >
          删除
        </el-button>
      </template>
    </CommonTable>

    <ReceiveDialog
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
import ReceiveDialog from './ReceiveDialog.vue'
import {
  getPurchaseReceivePage,
  deletePurchaseReceive,
  receiveStatusOptions,
  receiveStatusMap,
  supplierOptions,
  warehouseOptions,
  operatorOptions,
} from '@/mock/purchaseReceive'
import type { PurchaseReceive } from '@/mock/purchaseReceive'

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
const tableData = ref<PurchaseReceive[]>([])

const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<PurchaseReceive | null>(null)

let searchModel = reactive<Record<string, any>>({
  receiveNo: '',
  operator: '',
  startDate: '',
  endDate: '',
  supplier: '',
  status: '',
  warehouse: '',
})

const searchFields: SearchField[] = [
  { prop: 'receiveNo', label: '单据编号', type: 'input', placeholder: '请输入单据编号' },
  {
    prop: 'operator',
    label: '操作员',
    type: 'select',
    placeholder: '请选择',
    options: operatorOptions,
  },
  {
    prop: 'dateRange',
    label: '时间',
    type: 'daterange',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
  },
  {
    prop: 'supplier',
    label: '供应商',
    type: 'select',
    placeholder: '请选择',
    options: supplierOptions,
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择',
    options: receiveStatusOptions,
  },
  {
    prop: 'warehouse',
    label: '仓库',
    type: 'select',
    placeholder: '请选择',
    options: warehouseOptions,
  },
]

const columns: TableColumn[] = [
  { prop: 'index', label: '序号', width: 60, align: 'center' },
  { prop: 'receiveNo', label: '单号', width: 160, align: 'center' },
  { prop: 'warehouse', label: '仓库', width: 120 },
  { prop: 'supplier', label: '供应商', minWidth: 140 },
  { prop: 'amount', label: '单据金额', width: 130, align: 'right' },
  { prop: 'operator', label: '操作员', width: 100 },
  { prop: 'operateDate', label: '操作日期', width: 120, align: 'center' },
  { prop: 'prepaymentTime', label: '预付款时间', width: 120, align: 'center' },
  { prop: 'auditor', label: '审核人', width: 100 },
  { prop: 'status', label: '状态', width: 100, align: 'center' },
]

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
      receiveNo: searchModel.receiveNo || undefined,
      operator: searchModel.operator || undefined,
      supplier: searchModel.supplier || undefined,
      status: searchModel.status || undefined,
      warehouse: searchModel.warehouse || undefined,
    }
    // Handle date range
    if (searchModel.dateRange && Array.isArray(searchModel.dateRange)) {
      params.startDate = searchModel.dateRange[0] || undefined
      params.endDate = searchModel.dateRange[1] || undefined
    } else if (searchModel.startDate) {
      params.startDate = searchModel.startDate
      params.endDate = searchModel.endDate
    }

    const res = await getPurchaseReceivePage(params)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    console.error('加载采购收货列表失败:', err)
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
  searchModel.receiveNo = ''
  searchModel.operator = ''
  searchModel.dateRange = ''
  searchModel.startDate = ''
  searchModel.endDate = ''
  searchModel.supplier = ''
  searchModel.status = ''
  searchModel.warehouse = ''
  currentPage.value = 1
  loadData()
}

const handleAdd = () => {
  dialogMode.value = 'add'
  currentRecord.value = null
  dialogVisible.value = true
}

const handleEdit = (row: PurchaseReceive) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleView = (row: PurchaseReceive) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleDelete = (row: PurchaseReceive) => {
  confirmDelete(deletePurchaseReceive, row, row.receiveNo)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.purchase-receive-list {
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
