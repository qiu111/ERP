<template>
  <div class="agent-goods-list">
    <!-- 左侧分类树 -->
    <CategoryTree
      :options="categoryOptions"
      @select="handleCategorySelect"
    />

    <!-- 右侧内容区 -->
    <div class="agent-goods-list__content">
      <SearchBar
        title="代理商商品管理"
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

        <template #column-spec="{ row }">
          <span>{{ row.spec || '-' }}</span>
        </template>

        <template #column-barcode="{ row }">
          <span>{{ row.barcode }}</span>
        </template>

        <template #column-memberPrice="{ row }">
          <span class="price">¥{{ row.memberPrice.toFixed(2) }}</span>
        </template>

        <template #column-isOnShelf="{ row }">
          <el-tag
            :type="row.isOnShelf ? 'success' : 'info'"
            effect="light"
            size="small"
          >
            {{ row.isOnShelf ? '上架' : '下架' }}
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

    <AgentGoodsDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">

import { Download } from '@element-plus/icons-vue'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import CategoryTree from '@/components/CategoryTree.vue'
import AgentGoodsDialog from './AgentGoodsDialog.vue'
import useListPage from '@/composables/useListPage'
import {
  getAgentGoodsPage,
  deleteAgentGoods,
  brandOptions,
  shelfStatusOptions,
  categoryOptions,
  storeOptions,
  type AgentGoods,
} from '@/mock/goodsAgent'

const tableData = ref<AgentGoods[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<AgentGoods | null>(null)
const selectedCategory = ref('')

const searchModel = reactive<Record<string, any>>({
  brand: '',
  shelfStatus: '',
  keyword: '',
  store: '',
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
  {
    prop: 'store',
    label: '所属门店',
    type: 'select',
    placeholder: '请选择',
    options: storeOptions,
  },
]

const columns: TableColumn[] = [
  { prop: 'index', label: '编号', width: 80, align: 'center' },
  { prop: 'productName', label: '商品名称', width: 180 },
  { prop: 'spec', label: '商品规格', width: 120 },
  { prop: 'barcode', label: '条形码', width: 140 },
  { prop: 'category', label: '分类', width: 100 },
  { prop: 'memberPrice', label: '会员价格', width: 100, align: 'right' },
  { prop: 'isOnShelf', label: '上架情况', width: 90, align: 'center' },
  { prop: 'isRecommended', label: '是否推荐', width: 90, align: 'center' },
  { prop: 'isNew', label: '新品', width: 80, align: 'center' },
  { prop: 'isHotSale', label: '是否热卖', width: 90, align: 'center' },
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
      store: searchModel.store || undefined,
      category: selectedCategory.value || undefined,
    }
    const res = await getAgentGoodsPage(params)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    console.error('加载代理商商品列表失败:', err)
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
  searchModel.store = ''
  selectedCategory.value = ''
  currentPage.value = 1
  loadData()
}

const handleAdd = () => {
  dialogMode.value = 'add'
  currentRecord.value = null
  dialogVisible.value = true
}

const handleEdit = (row: AgentGoods) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleView = (row: AgentGoods) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleDelete = (row: AgentGoods) => confirmDelete(deleteAgentGoods, row, row.productName)

const handleExport = () => {
  ElMessage.success('导出成功')
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.agent-goods-list {
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
