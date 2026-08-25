<template>
  <div class="sale-order-list">
    <SearchBar
      title="销售订单"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      add-permission="erp_sale_order:add"
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #extra>
        <el-button
          v-if="has('erp_sale_order:export')"
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

      <template #column-saleType="{ row }">
        {{ row.saleType }}
      </template>

      <template #column-currency="{ row }">
        {{ currencyMap[row.currency] || row.currency }}
      </template>

      <template #operation="{ row }">
        <el-button
          v-if="has('erp_sale_order:edit') && row.status === 'draft'"
          type="primary"
          link
          size="small"
          @click="handleEdit(row)"
        >
          编辑
        </el-button>
        <el-button
          v-if="has('erp_sale_order:view')"
          type="info"
          link
          size="small"
          @click="handleView(row)"
        >
          查看
        </el-button>
        <el-button
          v-if="has('erp_sale_order:delete') && row.status === 'draft'"
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
  getSaleOrderPage,
  deleteSaleOrder,
  orderStatusOptions,
  orderStatusMap,
  currencyMap,
  salespersonOptions,
  warehouses,
  currencies,
  customerOptions,
  saleTypes,
} from '@/mock/saleOrder'
import type { SaleOrder } from '@/mock/saleOrder'

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
const tableData = ref<SaleOrder[]>([])

const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<SaleOrder | null>(null)

let searchModel = reactive<Record<string, any>>({
  orderNo: '',
  salesperson: '',
  startDate: '',
  endDate: '',
  customer: '',
  status: '',
  warehouse: '',
  saleType: '',
  currency: '',
})

const searchFields: SearchField[] = [
  { prop: 'orderNo', label: '销售单号', type: 'input', placeholder: '请输入销售单号' },
  {
    prop: 'salesperson',
    label: '操作员',
    type: 'select',
    placeholder: '请选择',
    options: salespersonOptions,
  },
  {
    prop: 'dateRange',
    label: '时间',
    type: 'daterange',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
  },
  {
    prop: 'currency',
    label: '币种',
    type: 'select',
    placeholder: '请选择',
    options: currencies,
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
    options: orderStatusOptions,
  },
  {
    prop: 'saleType',
    label: '类型',
    type: 'select',
    placeholder: '请选择',
    options: saleTypes,
  },
  {
    prop: 'warehouse',
    label: '仓库',
    type: 'select',
    placeholder: '请选择',
    options: warehouses,
  },
]

const columns: TableColumn[] = [
  { prop: 'index', label: '序号', width: 60, align: 'center' },
  { prop: 'orderNo', label: '销售单号', width: 160, align: 'center' },
  { prop: 'saleType', label: '类型', width: 100, align: 'center' },
  { prop: 'warehouse', label: '仓库', width: 100 },
  { prop: 'customer', label: '客户', minWidth: 120 },
  { prop: 'currency', label: '币种', width: 80, align: 'center' },
  { prop: 'totalAmount', label: '订单金额', width: 110, align: 'right' },
  { prop: 'salesperson', label: '销售人员', width: 100 },
  { prop: 'company', label: '所属公司', width: 100 },
  { prop: 'createDate', label: '操作日期', width: 110, align: 'center' },
  { prop: 'status', label: '状态', width: 90, align: 'center' },
]

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
      orderNo: searchModel.orderNo || undefined,
      salesperson: searchModel.salesperson || undefined,
      customer: searchModel.customer || undefined,
      status: searchModel.status || undefined,
      warehouse: searchModel.warehouse || undefined,
      saleType: searchModel.saleType || undefined,
      currency: searchModel.currency || undefined,
    }
    if (searchModel.dateRange && Array.isArray(searchModel.dateRange)) {
      params.startDate = searchModel.dateRange[0] || undefined
      params.endDate = searchModel.dateRange[1] || undefined
    } else if (searchModel.startDate) {
      params.startDate = searchModel.startDate
      params.endDate = searchModel.endDate
    }

    const res = await getSaleOrderPage(params)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    console.error('加载销售订单列表失败:', err)
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
  searchModel.salesperson = ''
  searchModel.dateRange = ''
  searchModel.startDate = ''
  searchModel.endDate = ''
  searchModel.customer = ''
  searchModel.status = ''
  searchModel.warehouse = ''
  searchModel.saleType = ''
  searchModel.currency = ''
  currentPage.value = 1
  loadData()
}

const handleAdd = () => {
  dialogMode.value = 'add'
  currentRecord.value = null
  dialogVisible.value = true
}

const handleEdit = (row: SaleOrder) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleView = (row: SaleOrder) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleDelete = (row: SaleOrder) => confirmDelete(deleteSaleOrder, row, row.orderNo)

const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.sale-order-list {
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