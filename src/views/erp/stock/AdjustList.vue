<template>
  <div class="stock-adjust-list">
    <SearchBar
      title="库存调整"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      add-permission="erp_stock_adjust:add"
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

      <template #column-adjustNo="{ row }">
        <span class="adjust-no">{{ row.adjustNo }}</span>
      </template>

      <template #column-totalAmount="{ row }">
        <span class="amount">¥{{ row.totalAmount.toFixed(2) }}</span>
      </template>

      <template #column-adjustType="{ row }">
        <el-tag
          :type="row.adjustType === 'in' ? 'success' : 'warning'"
          effect="light"
        >
          {{ row.adjustType === 'in' ? '入库' : '出库' }}
        </el-tag>
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
          v-if="has('erp_stock_adjust:edit') && row.auditStatus === 'pending'"
          type="primary"
          link
          size="small"
          @click="handleEdit(row)"
        >
          编辑
        </el-button>
        <el-button
          v-if="has('erp_stock_adjust:view')"
          type="info"
          link
          size="small"
          @click="handleView(row)"
        >
          查看
        </el-button>
        <el-button
          v-if="has('erp_stock_adjust:delete') && row.auditStatus === 'pending'"
          type="danger"
          link
          size="small"
          @click="handleDelete(row)"
        >
          删除
        </el-button>
      </template>
    </CommonTable>

    <AdjustDialog
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
import AdjustDialog from './AdjustDialog.vue'
import {
  getStockAdjustPage,
  deleteStockAdjust,
  auditStatusOptions,
  auditStatusMap,
  warehouseOptions,
  operatorOptions,
  type StockAdjust,
} from '@/mock/stockAdjust'

const { has } = usePermission()
const tableData = ref<StockAdjust[]>([])
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
const currentRecord = ref<StockAdjust | null>(null)

let searchModel = reactive<Record<string, any>>({
  adjustNo: '',
  warehouse: '',
  operator: '',
  auditStatus: '',
  dateRange: '',
  startDate: '',
  endDate: '',
})

const searchFields: SearchField[] = [
  { prop: 'adjustNo', label: '单号', type: 'input', placeholder: '单据编号' },
  {
    prop: 'warehouse',
    label: '仓库',
    type: 'select',
    placeholder: '请选择',
    options: warehouseOptions,
  },
  {
    prop: 'operator',
    label: '操作人',
    type: 'select',
    placeholder: '请选择',
    options: operatorOptions,
  },
  {
    prop: 'auditStatus',
    label: '审核状态',
    type: 'select',
    placeholder: '请选择',
    options: auditStatusOptions,
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
  { prop: 'index', label: '序号', width: 60, align: 'center' },
  { prop: 'adjustNo', label: '单号', width: 160 },
  { prop: 'totalAmount', label: '单据金额', width: 130, align: 'right' },
  { prop: 'adjustType', label: '调整方式', width: 100, align: 'center' },
  { prop: 'warehouseCode', label: '仓库编码', width: 100 },
  { prop: 'warehouseName', label: '仓库名称', width: 100 },
  { prop: 'operator', label: '操作人', width: 100 },
  { prop: 'operateDate', label: '操作时间', width: 120, align: 'center' },
  { prop: 'auditor', label: '审核人', width: 100 },
  { prop: 'auditDate', label: '审核日期', width: 120, align: 'center' },
  { prop: 'auditStatus', label: '审核状态', width: 100, align: 'center' },
  { prop: 'operation', label: '操作', width: 180, align: 'center', fixed: 'right' },
]

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
      adjustNo: searchModel.adjustNo || undefined,
      warehouse: searchModel.warehouse || undefined,
      operator: searchModel.operator || undefined,
      auditStatus: searchModel.auditStatus || undefined,
    }
    if (searchModel.dateRange && Array.isArray(searchModel.dateRange)) {
      params.startDate = searchModel.dateRange[0] || undefined
      params.endDate = searchModel.dateRange[1] || undefined
    } else if (searchModel.startDate) {
      params.startDate = searchModel.startDate
      params.endDate = searchModel.endDate
    }

    const res = await getStockAdjustPage(params)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    console.error('加载库存调整列表失败:', err)
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
  searchModel.adjustNo = ''
  searchModel.warehouse = ''
  searchModel.operator = ''
  searchModel.auditStatus = ''
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

const handleEdit = (row: StockAdjust) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleView = (row: StockAdjust) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleDelete = async (row: StockAdjust) => {
  if (row.auditStatus !== 'pending') {
    return
  }
  return confirmDelete(deleteStockAdjust, row as any, row.adjustNo)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.stock-adjust-list {
  padding: 20px;
}

.adjust-no {
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
