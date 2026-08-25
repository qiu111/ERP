<template>
  <div class="stock-summary-list">
    <SearchBar
      title="商品库存汇总"
      :fields="searchFields"
      v-model="searchModel"
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #extra>
        <el-button
          :color="'#67c23a'"
          @click="handleExport"
        >
          + 导出
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
      <template #column-index="{ index }">
        {{ (currentPage - 1) * pageSize + index + 1 }}
      </template>

      <template #column-image="{ row }">
        <el-image
          v-if="row.imageUrl"
          :src="row.imageUrl"
          :preview-src-list="[row.imageUrl]"
          style="width: 40px; height: 40px"
          fit="cover"
        />
        <div v-else class="image-placeholder">
          <el-icon :size="24" color="#c0c4cc"><Picture /></el-icon>
        </div>
      </template>

      <template #column-stockAmount="{ row }">
        <span class="amount">¥{{ row.stockAmount.toFixed(2) }}</span>
      </template>

      <template #column-availableAmount="{ row }">
        <span class="amount">¥{{ row.availableAmount.toFixed(2) }}</span>
      </template>

      <template #column-operation="{ row }">
        <el-button
          type="primary"
          link
          size="small"
          @click="handleViewDetail(row)"
        >
          仓库明细
        </el-button>
      </template>
    </CommonTable>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import useListPage from '@/composables/useListPage'
import {
  getStockSummaryPage,
  categoryOptions,
  supplierOptions,
  type StockSummary,
} from '@/mock/stock'

const tableData = ref<StockSummary[]>([])
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
  category: '',
  supplier: '',
  productCode: '',
  productName: '',
})

const searchFields: SearchField[] = [
  {
    prop: 'category',
    label: '类别',
    type: 'select',
    placeholder: '请选择',
    options: categoryOptions,
  },
  {
    prop: 'supplier',
    label: '供应商',
    type: 'select',
    placeholder: '请选择',
    options: supplierOptions,
  },
  {
    prop: 'productCode',
    label: '货号',
    type: 'select',
    placeholder: '请选择',
    options: [],
  },
  { prop: 'productName', label: '商品名称', type: 'input', placeholder: '请输入商品名称' },
]

const columns: TableColumn[] = [
  { prop: 'index', label: '序号', width: 60, align: 'center' },
  { prop: 'image', label: '商品缩略图', width: 100, align: 'center' },
  { prop: 'productCode', label: '货号', width: 120 },
  { prop: 'barcode', label: '条码', width: 160 },
  { prop: 'productName', label: '商品名称', minWidth: 200 },
  { prop: 'category', label: '类别', width: 100 },
  { prop: 'unit', label: '单位', width: 70, align: 'center' },
  { prop: 'spec', label: '规格', width: 120 },
  { prop: 'factoryPrice', label: '出厂价', width: 100, align: 'right' },
  { prop: 'stockQty', label: '在库库存', width: 100, align: 'right' },
  { prop: 'stockAmount', label: '在库库存金额', width: 130, align: 'right' },
  { prop: 'availableQty', label: '可售库存', width: 100, align: 'right' },
  { prop: 'availableAmount', label: '可售库存金额', width: 130, align: 'right' },
  { prop: 'operation', label: '操作', width: 100, align: 'center', fixed: 'right' },
]

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
      category: searchModel.category || undefined,
      supplier: searchModel.supplier || undefined,
      productCode: searchModel.productCode || undefined,
      productName: searchModel.productName || undefined,
    }
    const res = await getStockSummaryPage(params)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    console.error('加载库存汇总失败:', err)
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
  searchModel.category = ''
  searchModel.supplier = ''
  searchModel.productCode = ''
  searchModel.productName = ''
  currentPage.value = 1
  loadData()
}

const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

const handleViewDetail = (row: StockSummary) => {
  // 跳转到仓库商品明细页面，传递货号参数
  const route = window.location.hash.replace('#', '')
  window.location.hash = `#/erp/stock/detail?productCode=${encodeURIComponent(row.productCode)}`
  // 如果使用 vue-router，应该用 router.push
  // router.push({ path: '/erp/stock/detail', query: { productCode: row.productCode } })
  ElMessage.info(`查看商品「${row.productName}」的仓库明细`)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.stock-summary-list {
  padding: 20px;
}

.amount {
  font-weight: 600;
  color: #303133;
}

.image-placeholder {
  width: 40px;
  height: 40px;
  background: #f5f7fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}
</style>
