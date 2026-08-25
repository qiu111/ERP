<template>
  <div class="sale-return-list">
    <SearchBar
      title="销售退货"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      add-permission="erp_sale_return:add"
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
          :style="{ color: returnStatusMap[row.status]?.color || '#909399' }"
        >
          {{ returnStatusMap[row.status]?.text || row.status }}
        </span>
      </template>

      <template #column-amount="{ row }">
        <span class="amount">¥{{ row.amount.toFixed(2) }}</span>
      </template>

      <template #operation="{ row }">
        <el-button
          v-if="has('erp_sale_return:edit') && row.status === 'draft'"
          type="primary"
          link
          size="small"
          @click="handleEdit(row)"
        >
          编辑
        </el-button>
        <el-button
          v-if="has('erp_sale_return:view')"
          type="info"
          link
          size="small"
          @click="handleView(row)"
        >
          查看
        </el-button>
        <el-button
          v-if="has('erp_sale_return:delete') && row.status === 'draft'"
          type="danger"
          link
          size="small"
          @click="handleDelete(row)"
        >
          删除
        </el-button>
      </template>
    </CommonTable>

    <ReturnDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import { usePermission } from '@/composables/usePermission'
import useListPage from '@/composables/useListPage'
import ReturnDialog from './ReturnDialog.vue'
import {
  getSaleReturnPage,
  deleteSaleReturn,
  returnStatusOptions,
  returnStatusMap,
  customerOptions,
  warehouseOptions,
  operatorOptions,
} from '@/mock/saleReturn'
import type { SaleReturn } from '@/mock/saleReturn'

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
const tableData = ref<SaleReturn[]>([])

const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<SaleReturn | null>(null)

let searchModel = reactive<Record<string, any>>({
  returnNo: '',
  operator: '',
  startDate: '',
  endDate: '',
  customer: '',
  status: '',
  warehouse: '',
})

const searchFields: SearchField[] = [
  { prop: 'returnNo', label: '单据编号', type: 'input', placeholder: '请输入单据编号' },
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
    prop: 'customer',
    label: '客户',
    type: 'select',
    placeholder: '请选择',
    options: customerOptions,
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择',
    options: returnStatusOptions,
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
  { prop: 'returnNo', label: '单号', width: 160, align: 'center' },
  { prop: 'warehouse', label: '仓库', width: 120 },
  { prop: 'customer', label: '客户', minWidth: 140 },
  { prop: 'amount', label: '单据金额', width: 130, align: 'right' },
  { prop: 'operator', label: '操作员', width: 100 },
  { prop: 'operateDate', label: '操作日期', width: 120, align: 'center' },
  { prop: 'auditor', label: '审核人', width: 100 },
  { prop: 'status', label: '状态', width: 100, align: 'center' },
]

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
      returnNo: searchModel.returnNo || undefined,
      operator: searchModel.operator || undefined,
      customer: searchModel.customer || undefined,
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

    const res = await getSaleReturnPage(params)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    console.error('加载销售退货列表失败:', err)
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
  searchModel.returnNo = ''
  searchModel.operator = ''
  searchModel.dateRange = ''
  searchModel.startDate = ''
  searchModel.endDate = ''
  searchModel.customer = ''
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

const handleEdit = (row: SaleReturn) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleView = (row: SaleReturn) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleDelete = (row: SaleReturn) => confirmDelete(deleteSaleReturn, row, row.returnNo)

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.sale-return-list {
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
