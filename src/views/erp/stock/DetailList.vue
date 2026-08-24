<template>
  <div class="stock-detail-list">
    <SearchBar
      title="仓库明细"
      :fields="searchFields"
      v-model="searchModel"
      @search="handleSearch"
      @reset="handleReset"
      @change="handleFieldChange"
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

      <template #column-stockQty="{ row }">
        <span
          class="stock-qty"
          :class="{ 'stock-warning': row.stockQty <= row.warningQty }"
        >
          {{ row.stockQty }}
        </span>
      </template>

      <template #column-warningQty="{ row }">
        <span class="warning-qty">{{ row.warningQty }}</span>
      </template>

      <template #column-stockAmount="{ row }">
        <span class="amount">¥{{ row.stockAmount.toFixed(2) }}</span>
      </template>

      <template #column-availableAmount="{ row }">
        <span class="amount">¥{{ row.availableAmount.toFixed(2) }}</span>
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
import {
  getStockDetailPage,
  warehouseOptions,
  supplierOptions,
  categoryOptions,
  type StockDetail,
} from '@/mock/stock'

const loading = ref(false)
const tableData = ref<StockDetail[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

let searchModel = reactive<Record<string, any>>({
  warehouse: '',
  supplier: '',
  keyword: '',
  category: '',
  warningOnly: false,
})

const searchFields: SearchField[] = [
  {
    prop: 'warehouse',
    label: '仓库',
    type: 'select',
    placeholder: '请选择',
    options: warehouseOptions,
  },
  {
    prop: 'supplier',
    label: '供应商',
    type: 'select',
    placeholder: '请选择',
    options: supplierOptions,
  },
  { prop: 'keyword', label: '关键字', type: 'input', placeholder: '请输入条码/名称' },
  {
    prop: 'category',
    label: '类别',
    type: 'select',
    placeholder: '请选择',
    options: categoryOptions,
  },
  {
    prop: 'warningOnly',
    label: '',
    type: 'checkbox',
    placeholder: '只显示预警商品',
    defaultValue: false,
  },
]

const columns: TableColumn[] = [
  { prop: 'index', label: '序号', width: 60, align: 'center' },
  { prop: 'warehouseCode', label: '仓库编码', width: 100 },
  { prop: 'warehouseName', label: '仓库名称', width: 100 },
  { prop: 'image', label: '缩略图', width: 80, align: 'center' },
  { prop: 'stockQty', label: '在库库存', width: 100, align: 'right' },
  { prop: 'barcode', label: '条码', width: 140 },
  { prop: 'productName', label: '商品名称', minWidth: 200 },
  { prop: 'category', label: '类别', width: 100 },
  { prop: 'unit', label: '单位', width: 70, align: 'center' },
  { prop: 'spec', label: '规格', width: 120 },
  { prop: 'factoryPrice', label: '出厂价', width: 100, align: 'right' },
  { prop: 'warningQty', label: '预警库存', width: 100, align: 'right' },
  { prop: 'stockAmount', label: '在库库存金额', width: 130, align: 'right' },
  { prop: 'availableQty', label: '可售库存', width: 100, align: 'right' },
  { prop: 'availableAmount', label: '可售库存金额', width: 130, align: 'right' },
]

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
      warehouse: searchModel.warehouse || undefined,
      supplier: searchModel.supplier || undefined,
      category: searchModel.category || undefined,
      keyword: searchModel.keyword || undefined,
      warningOnly: searchModel.warningOnly || undefined,
    }
    const res = await getStockDetailPage(params)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    console.error('加载仓库明细失败:', err)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number, size: number) => {
  currentPage.value = page
  pageSize.value = size
  loadData()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadData()
}

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const handleFieldChange = (prop: string, value: any) => {
  if (prop === 'warningOnly') {
    currentPage.value = 1
    loadData()
  }
}

const handleReset = () => {
  searchModel.warehouse = ''
  searchModel.supplier = ''
  searchModel.keyword = ''
  searchModel.category = ''
  searchModel.warningOnly = false
  currentPage.value = 1
  loadData()
}

const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.stock-detail-list {
  padding: 20px;
}

.amount {
  font-weight: 600;
  color: #303133;
}

.stock-qty {
  font-weight: 600;

  &.stock-warning {
    color: #f56c6c;
  }
}

.warning-qty {
  color: #e6a23c;
  font-weight: 500;
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
