<template>
  <div class="self-goods-list">
    <!-- 左侧分类树 -->
    <CategoryTree
      :options="categoryOptions"
      @select="handleCategorySelect"
    />

    <!-- 右侧内容区 -->
    <div class="self-goods-list__content">
      <SearchBar
        title="自采商品管理"
        :fields="searchFields"
        v-model="searchModel"
        show-add
        @add="handleAdd"
        @search="handleSearch"
        @reset="handleReset"
      >
        <template #extra>
          <el-button
            type="success"
            @click="handleExport"
          >
            <el-icon><Download /></el-icon>
            数据导出
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

        <template #column-productName="{ row }">
          <span class="product-name">{{ row.productName }}</span>
        </template>

        <template #column-productCode="{ row }">
          <span>{{ row.productCode }}</span>
        </template>

        <template #column-purchasePrice="{ row }">
          <span class="price">¥{{ row.purchasePrice.toFixed(2) }}</span>
        </template>

        <template #column-isOnShelf="{ row }">
          <el-tag
            :type="row.isOnShelf ? 'success' : 'info'"
            effect="light"
            size="small"
          >
            {{ row.isOnShelf ? '是' : '否' }}
          </el-tag>
        </template>

        <template #column-isRecommended="{ row }">
          <el-tag
            :type="row.isRecommended ? 'warning' : 'info'"
            effect="light"
            size="small"
          >
            {{ row.isRecommended ? '是' : '否' }}
          </el-tag>
        </template>

        <template #column-isNew="{ row }">
          <el-tag
            :type="row.isNew ? 'success' : 'info'"
            effect="light"
            size="small"
          >
            {{ row.isNew ? '是' : '否' }}
          </el-tag>
        </template>

        <template #column-isHotSale="{ row }">
          <el-tag
            :type="row.isHotSale ? 'danger' : 'info'"
            effect="light"
            size="small"
          >
            {{ row.isHotSale ? '是' : '否' }}
          </el-tag>
        </template>

        <template #column-spec="{ row }">
          <span>{{ row.spec || '-' }}</span>
        </template>

        <template #column-operation="{ row }">
          <el-button
            type="primary"
            link
            size="small"
            @click="handleEdit(row)"
          >
            编辑
          </el-button>
          <el-button
            type="info"
            link
            size="small"
            @click="handleView(row)"
          >
            查看
          </el-button>
          <el-button
            type="danger"
            link
            size="small"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </CommonTable>
    </div>

    <SelfGoodsDialog
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
import { Download } from '@element-plus/icons-vue'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import CategoryTree from '@/components/CategoryTree.vue'
import SelfGoodsDialog from './SelfGoodsDialog.vue'
import useListPage from '@/composables/useListPage'
import {
  getSelfGoodsPage,
  deleteSelfGoods,
  brandOptions,
  shelfStatusOptions,
  categoryOptions,
  type SelfGoods,
} from '@/mock/goodsSelf'

const tableData = ref<SelfGoods[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<SelfGoods | null>(null)
const selectedCategory = ref('')

const searchModel = reactive<Record<string, any>>({
  brand: '',
  shelfStatus: '',
  keyword: '',
})

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

const searchFields: SearchField[] = [
  {
    prop: 'brand',
    label: '所属品牌',
    type: 'select',
    placeholder: '请选择',
    options: brandOptions,
  },
  {
    prop: 'shelfStatus',
    label: '上架情况',
    type: 'select',
    placeholder: '请选择',
    options: shelfStatusOptions,
  },
  {
    prop: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '搜索商品名称',
  },
]

const columns: TableColumn[] = [
  { prop: 'index', label: '编号', width: 80, align: 'center' },
  { prop: 'productName', label: '商品名称', width: 180 },
  { prop: 'spec', label: '商品规格', width: 120 },
  { prop: 'productCode', label: '货号', width: 100 },
  { prop: 'category', label: '分类', width: 100 },
  { prop: 'purchasePrice', label: '采购价格', width: 100, align: 'right' },
  { prop: 'isOnShelf', label: '上架情况', width: 90, align: 'center' },
  { prop: 'isRecommended', label: '是否推荐', width: 90, align: 'center' },
  { prop: 'isNew', label: '新品', width: 80, align: 'center' },
  { prop: 'isHotSale', label: '是否热卖', width: 90, align: 'center' },
  { prop: 'sortOrder', label: '排序', width: 80, align: 'center' },
  { prop: 'operation', label: '操作', width: 180, align: 'center', fixed: 'right' },
]

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
      brand: searchModel.brand || undefined,
      keyword: searchModel.keyword || undefined,
      shelfStatus: searchModel.shelfStatus || undefined,
      category: selectedCategory.value || undefined,
    }
    const res = await getSelfGoodsPage(params)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    console.error('加载自采商品列表失败:', err)
  } finally {
    loading.value = false
  }
}
setLoadFn(loadData)

// 分类树选中处理
const handleCategorySelect = (value: string) => {
  selectedCategory.value = value
  currentPage.value = 1
  loadData()
}

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const handleReset = () => {
  searchModel.brand = ''
  searchModel.shelfStatus = ''
  searchModel.keyword = ''
  selectedCategory.value = ''
  currentPage.value = 1
  loadData()
}

const handleAdd = () => {
  dialogMode.value = 'add'
  currentRecord.value = null
  dialogVisible.value = true
}

const handleEdit = (row: SelfGoods) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleView = (row: SelfGoods) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleDelete = (row: SelfGoods) => confirmDelete(deleteSelfGoods, row, row.productName)

const handleExport = () => {
  ElMessage.success('导出成功')
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.self-goods-list {
  display: flex;
  gap: 16px;
  padding: 16px;
  height: calc(100vh - 100px);

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.product-name {
  font-weight: 500;
  color: #303133;
}

.price {
  font-weight: 600;
  color: #303133;
}
</style>