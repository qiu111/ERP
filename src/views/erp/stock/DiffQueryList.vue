<template>
  <div class="stock-diff-list">
    <SearchBar
      title="库存差异查询"
      :fields="searchFields"
      v-model="searchModel"
      show-export
      export-permission="erp_stock_diff:export"
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
    />

    <CommonTable
      v-loading="loading"
      :columns="columns"
      :data="tableData"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      :row-key="'id'"
      :fit="false"
      @page-change="handlePageChange"
      @page-size-change="handleSizeChange"
    >
      <template #column-checkNo="{ row }">
        <span class="check-no">{{ row.checkNo }}</span>
      </template>

      <template #column-systemQty="{ row }">
        <span :class="{ 'qty-diff': row.diffQty !== 0 }">{{ row.systemQty }}</span>
      </template>

      <template #column-actualQty="{ row }">
        <span :class="{ 'qty-diff': row.diffQty !== 0 }">{{ row.actualQty }}</span>
      </template>

      <template #column-diffQty="{ row }">
        <span
          :class="{
            'qty-diff': row.diffQty < 0,
            'qty-surplus': row.diffQty > 0,
          }"
        >
          {{ row.diffQty > 0 ? '+' : '' }}{{ row.diffQty }}
        </span>
      </template>

      <template #column-factoryPrice="{ row }">
        ¥{{ row.factoryPrice.toFixed(2) }}
      </template>

      <template #column-systemAmount="{ row }">
        <span class="amount">¥{{ row.systemAmount.toFixed(2) }}</span>
      </template>

      <template #column-actualAmount="{ row }">
        <span class="amount">¥{{ row.actualAmount.toFixed(2) }}</span>
      </template>

      <template #column-profitLossAmount="{ row }">
        <span
          class="amount"
          :class="{
            'profit': row.profitLossAmount > 0,
            'loss': row.profitLossAmount < 0,
          }"
        >
          {{ row.profitLossAmount >= 0 ? '+' : '' }}¥{{ row.profitLossAmount.toFixed(2) }}
        </span>
      </template>

      <template #column-changeStockFlag="{ row }">
        <el-tag
          size="small"
          :type="row.changeStockFlag === 'yes' ? 'success' : 'info'"
          effect="plain"
        >
          {{ row.changeStockFlag === 'yes' ? '已更改' : '未更改' }}
        </el-tag>
      </template>

      <template #column-diffReason="{ row }">
        <span v-if="row.diffReason" class="diff-reason">{{ row.diffReason }}</span>
        <span v-else class="no-diff">-</span>
      </template>
    </CommonTable>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import useListPage from '@/composables/useListPage'
import {
  getStockDiffPage,
  warehouseOptions,
  checkNoOptions,
  categoryOptions,
  type StockDiffRecord,
} from '@/mock/stockDiffQuery'

const tableData = ref<StockDiffRecord[]>([])
const {
  currentPage,
  pageSize,
  total,
  loading,
  handlePageChange,
  handleSizeChange,
  setLoadFn,
} = useListPage()

let searchModel = reactive<Record<string, any>>({
  checkNo: '',
  warehouse: '',
  keyword: '',
  category: '',
})

const searchFields: SearchField[] = [
  {
    prop: 'checkNo',
    label: '单号',
    type: 'select',
    placeholder: '请选择',
    options: checkNoOptions,
  },
  {
    prop: 'warehouse',
    label: '仓库',
    type: 'select',
    placeholder: '请选择',
    options: warehouseOptions,
  },
  {
    prop: 'keyword',
    label: '关键字',
    type: 'input',
    placeholder: '请输入商品货号/商品名称',
  },
  {
    prop: 'category',
    label: '类别',
    type: 'select',
    placeholder: '请选择',
    options: categoryOptions,
  },
]

const columns: TableColumn[] = [
  { prop: 'checkNo', label: '单号', width: 140, fixed: 'left' },
  { prop: 'warehouseName', label: '仓库名称', width: 100 },
  { prop: 'goodsNo', label: '货号', width: 100 },
  { prop: 'barcode', label: '条码', width: 110 },
  { prop: 'productName', label: '商品名称', minWidth: 140 },
  { prop: 'spec', label: '规格', width: 120 },
  { prop: 'brand', label: '品牌', width: 90 },
  { prop: 'category', label: '类别', width: 100 },
  { prop: 'factoryPrice', label: '出厂价', width: 100, align: 'right' },
  { prop: 'systemQty', label: '系统库存', width: 100, align: 'right' },
  { prop: 'actualQty', label: '实际盘点数量', width: 120, align: 'right' },
  { prop: 'diffQty', label: '差异数量', width: 100, align: 'right' },
  { prop: 'systemAmount', label: '系统库存金额', width: 120, align: 'right' },
  { prop: 'actualAmount', label: '实际盘点金额', width: 120, align: 'right' },
  { prop: 'changeStockFlag', label: '是否更改库存', width: 110, align: 'center' },
  { prop: 'profitLossAmount', label: '盈亏金额', width: 120, align: 'right' },
  { prop: 'diffReason', label: '差异原因', minWidth: 180, fixed: 'right' },
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await getStockDiffPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      checkNo: searchModel.checkNo || undefined,
      warehouse: searchModel.warehouse || undefined,
      keyword: searchModel.keyword || undefined,
      category: searchModel.category || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    console.error('加载库存差异查询失败:', err)
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
  searchModel.checkNo = ''
  searchModel.warehouse = ''
  searchModel.keyword = ''
  searchModel.category = ''
  currentPage.value = 1
  loadData()
}

const handleExport = () => {
  ElMessage.success('导出功能：mock 环境提示 - 已触发导出库存差异数据')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.stock-diff-list {
  padding: 20px;
}

.check-no {
  font-weight: 500;
  color: #409eff;
}

.amount {
  font-weight: 500;
  color: #303133;

  &.profit {
    color: #67c23a;
  }

  &.loss {
    color: #f56c6c;
  }
}

.qty-diff {
  color: #f56c6c;
  font-weight: 500;
}

.qty-surplus {
  color: #67c23a;
  font-weight: 500;
}

.diff-reason {
  color: #606266;
}

.no-diff {
  color: #c0c4cc;
}
</style>
