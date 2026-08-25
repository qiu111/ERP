<template>
  <div class="purchase-return-list">
    <SearchBar
      title="退货返厂"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      add-permission="erp_purchase_return:add"
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
          v-if="has('erp_purchase_return:edit') && row.status === 'draft'"
          type="primary"
          link
          size="small"
          @click="handleEdit(row)"
        >
          编辑
        </el-button>
        <el-button
          v-if="has('erp_purchase_return:view')"
          type="info"
          link
          size="small"
          @click="handleView(row)"
        >
          查看
        </el-button>
        <el-button
          v-if="has('erp_purchase_return:delete') && row.status === 'draft'"
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
import { ElMessage } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import { usePermission } from '@/composables/usePermission'
import useListPage from '@/composables/useListPage'
import ReturnDialog from './ReturnDialog.vue'
import {
  getPurchaseReturnPage,
  deletePurchaseReturn,
  returnStatusOptions,
  returnStatusMap,
  supplierOptions,
  warehouseOptions,
  operatorOptions,
} from '@/mock/purchaseReturn'
import type { PurchaseReturn } from '@/mock/purchaseReturn'

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
const tableData = ref<PurchaseReturn[]>([])

const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<PurchaseReturn | null>(null)

let searchModel = reactive<Record<string, any>>({
  returnNo: '',
  operator: '',
  startDate: '',
  endDate: '',
  supplier: '',
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
  { prop: 'supplier', label: '供应商', minWidth: 140 },
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

    const res = await getPurchaseReturnPage(params)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    console.error('加载退货返厂列表失败:', err)
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

const handleEdit = (row: PurchaseReturn) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleView = (row: PurchaseReturn) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleDelete = (row: PurchaseReturn) => {
  confirmDelete(deletePurchaseReturn, row, row.returnNo)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.purchase-return-list {
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