<template>
  <div class="stock-transfer-list">
    <SearchBar
      title="库存调拨"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      add-permission="erp_stock_transfer:add"
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
      <template #column-transferNo="{ row }">
        <span class="transfer-no">{{ row.transferNo }}</span>
      </template>

      <template #column-totalAmount="{ row }">
        <span class="amount">¥{{ row.totalAmount.toFixed(2) }}</span>
      </template>

      <template #column-auditStatus="{ row }">
        <span
          class="status-tag"
          :style="{ color: auditStatusMap[row.auditStatus]?.color || '#909399' }"
        >
          {{ auditStatusMap[row.auditStatus]?.text || row.auditStatus }}
        </span>
      </template>

      <template #column-operation="{ row }">
        <el-button
          v-if="has('erp_stock_transfer:edit') && row.auditStatus === 'pending'"
          type="primary"
          link
          size="small"
          @click="handleEdit(row)"
        >
          编辑
        </el-button>
        <el-button
          v-if="has('erp_stock_transfer:view')"
          type="info"
          link
          size="small"
          @click="handleView(row)"
        >
          查看
        </el-button>
        <el-button
          v-if="has('erp_stock_transfer:delete') && row.auditStatus === 'pending'"
          type="danger"
          link
          size="small"
          @click="handleDelete(row)"
        >
          删除
        </el-button>
      </template>
    </CommonTable>

    <TransferDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">

import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import { usePermission } from '@/composables/usePermission'
import useListPage from '@/composables/useListPage'
import TransferDialog from './TransferDialog.vue'
import {
  getStockTransferPage,
  deleteStockTransfer,
  auditStatusOptions,
  auditStatusMap,
  warehouseOptions,
  operatorOptions,
  type StockTransfer,
} from '@/mock/stockTransfer'

const { has } = usePermission()
const tableData = ref<StockTransfer[]>([])
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

const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<StockTransfer | null>(null)

let searchModel = reactive<Record<string, any>>({
  transferNo: '',
  fromWarehouse: '',
  toWarehouse: '',
  auditStatus: '',
  operator: '',
  dateRange: '',
  startDate: '',
  endDate: '',
})

const searchFields: SearchField[] = [
  { prop: 'transferNo', label: '单号', type: 'input', placeholder: '单据编号' },
  {
    prop: 'fromWarehouse',
    label: '调出仓库',
    type: 'select',
    placeholder: '请选择',
    options: warehouseOptions,
  },
  {
    prop: 'toWarehouse',
    label: '调入仓库',
    type: 'select',
    placeholder: '请选择',
    options: warehouseOptions,
  },
  {
    prop: 'auditStatus',
    label: '审核状态',
    type: 'select',
    placeholder: '请选择',
    options: auditStatusOptions,
  },
  {
    prop: 'operator',
    label: '操作员',
    type: 'select',
    placeholder: '请选择',
    options: operatorOptions,
  },
  {
    prop: 'dateRange',
    label: '操作日期',
    type: 'daterange',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
  },
]

const columns: TableColumn[] = [
  { prop: 'transferNo', label: '单号', width: 160, sortable: true },
  { prop: 'fromWarehouseCode', label: '调出仓库编号', width: 120 },
  { prop: 'fromWarehouseName', label: '调出仓库名称', width: 120 },
  { prop: 'toWarehouseCode', label: '调入仓库编号', width: 120 },
  { prop: 'toWarehouseName', label: '调入仓库名称', width: 120 },
  { prop: 'totalAmount', label: '单据金额', width: 130, align: 'right' },
  { prop: 'operator', label: '操作人', width: 100 },
  { prop: 'operateDate', label: '操作时间', width: 120, align: 'center', sortable: true },
  { prop: 'auditor', label: '审核人', width: 100 },
  { prop: 'auditStatus', label: '审核状态', width: 100, align: 'center' },
  { prop: 'operation', label: '操作', width: 200, align: 'center', fixed: 'right' },
]

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
      transferNo: searchModel.transferNo || undefined,
      fromWarehouse: searchModel.fromWarehouse || undefined,
      toWarehouse: searchModel.toWarehouse || undefined,
      auditStatus: searchModel.auditStatus || undefined,
      operator: searchModel.operator || undefined,
    }
    if (searchModel.dateRange && Array.isArray(searchModel.dateRange)) {
      params.startDate = searchModel.dateRange[0] || undefined
      params.endDate = searchModel.dateRange[1] || undefined
    } else if (searchModel.startDate) {
      params.startDate = searchModel.startDate
      params.endDate = searchModel.endDate
    }

    const res = await getStockTransferPage(params)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    console.error('加载库存调拨列表失败:', err)
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
  searchModel.transferNo = ''
  searchModel.fromWarehouse = ''
  searchModel.toWarehouse = ''
  searchModel.auditStatus = ''
  searchModel.operator = ''
  searchModel.dateRange = ''
  searchModel.startDate = ''
  searchModel.endDate = ''
  currentPage.value = 1
  loadData()
}

const handleAdd = () => {
  dialogMode.value = 'add'
  currentRecord.value = null
  dialogVisible.value = true
}

const handleEdit = (row: StockTransfer) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleView = (row: StockTransfer) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleDelete = async (row: StockTransfer) => {
  if (row.auditStatus !== 'pending') {
    return
  }
  return confirmDelete(deleteStockTransfer, row as any, row.transferNo)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.stock-transfer-list {
  padding: 20px;
}

.transfer-no {
  font-weight: 500;
  color: #409eff;
}

.status-tag {
  font-weight: 500;
}

.amount {
  font-weight: 600;
  color: #303133;
}
</style>
