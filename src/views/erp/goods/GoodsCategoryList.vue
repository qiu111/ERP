<template>
  <div class="goods-category-list">
    <!-- 左侧分类树 -->
    <CategoryTree
      :options="treeOptions"
      @select="handleCategorySelect"
    />

    <!-- 右侧内容区 -->
    <div class="goods-category-list__content">
      <SearchBar
        title="商品分类管理"
        :fields="searchFields"
        v-model="searchModel"
        show-add
        @add="handleAdd"
        @search="handleSearch"
        @reset="handleReset"
      >
        <template #extra>
          <el-button
            v-if="selectedRows.length"
            type="danger"
            @click="handleBatchDelete"
          >
            <el-icon><Delete /></el-icon>
            批量删除
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
        :selectable="true"
        @page-change="handlePageChange"
        @page-size-change="handleSizeChange"
        @selection-change="handleSelectionChange"
      >
        <template #column-name="{ row }">
          <div class="category-name-cell">
            <el-icon
              v-if="!row.parentId"
              class="category-icon"
              style="color: #409eff;"
            >
              <Folder />
            </el-icon>
            <el-icon
              v-else
              class="category-icon"
              style="color: #e6a23c;"
            >
              <Document />
            </el-icon>
            <span>{{ row.name }}</span>
          </div>
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

        <template #column-isVisible="{ row }">
          <el-tag
            :type="row.isVisible ? 'success' : 'info'"
            effect="light"
            size="small"
          >
            {{ row.isVisible ? '是' : '否' }}
          </el-tag>
        </template>

        <template #column-group="{ row }">
          <span>分组{{ row.group }}</span>
        </template>

        <template #column-operation="{ row }">
          <el-button
            v-if="!row.parentId"
            type="primary"
            link
            size="small"
            @click="handleAddChild(row)"
          >
            <el-icon><Plus /></el-icon>
            添加子菜单
          </el-button>
          <el-button
            type="primary"
            link
            size="small"
            @click="handleEdit(row)"
          >
            <el-icon><Edit /></el-icon>
            修改
          </el-button>
          <el-button
            type="danger"
            link
            size="small"
            @click="handleDelete(row)"
          >
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </template>
      </CommonTable>
    </div>

    <GoodsCategoryDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      :parent-categories="topCategoryOptions"
      :parent-category="currentParent"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { Delete, Folder, Document, Plus, Edit } from '@element-plus/icons-vue'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import CategoryTree from '@/components/CategoryTree.vue'
import GoodsCategoryDialog from './GoodsCategoryDialog.vue'
import useListPage from '@/composables/useListPage'
import {
  getCategoryPage,
  deleteCategory,
  batchDeleteCategory,
  getTopCategories,
  groupOptions,
  type GoodsCategory,
} from '@/mock/goodsCategory'

const tableData = ref<GoodsCategory[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'addChild'>('add')
const currentRecord = ref<GoodsCategory | null>(null)
const selectedCategory = ref<string | null>(null)
const selectedRows = ref<GoodsCategory[]>([])
const topCategoryOptions = ref<{ value: string; label: string }[]>([])
const currentParent = ref<string | null>(null)

const searchModel = reactive<Record<string, any>>({
  keyword: '',
  isRecommended: '',
  isVisible: '',
})

const {
  currentPage,
  pageSize,
  total,
  loading,
  handlePageChange,
  handleSizeChange,
  setLoadFn,
} = useListPage()

const searchFields: SearchField[] = [
  {
    prop: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '搜索分类名称',
  },
  {
    prop: 'isRecommended',
    label: '是否推荐',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '是', value: 'true' },
      { label: '否', value: 'false' },
    ],
  },
  {
    prop: 'isVisible',
    label: '是否显示',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '是', value: 'true' },
      { label: '否', value: 'false' },
    ],
  },
]

const columns: TableColumn[] = [
  { prop: 'id', label: '分类ID', width: 100 },
  { prop: 'name', label: '分类名称', width: 150 },
  { prop: 'mobileName', label: '手机显示名称', width: 150 },
  { prop: 'isRecommended', label: '是否推荐', width: 90, align: 'center' },
  { prop: 'isVisible', label: '是否显示', width: 90, align: 'center' },
  { prop: 'group', label: '分组', width: 80, align: 'center' },
  { prop: 'sort', label: '排序', width: 80, align: 'center' },
  { prop: 'operation', label: '操作', width: 280, align: 'center', fixed: 'right' },
]

// 构建树形选项（用于左侧分类树）
const treeOptions = computed(() => {
  return [
    { label: '顶级分类', value: '__root__' },
    { label: '皮具箱包', value: '1001' },
    { label: '水杯茶具', value: '1002' },
    { label: '工艺礼品', value: '1003' },
    { label: '家居清洁', value: '1004' },
  ]
})

// 加载顶级分类选项
const loadTopCategories = async () => {
  try {
    const res = await getTopCategories()
    topCategoryOptions.value = res.data.map((c) => ({ value: c.id, label: c.name }))
  } catch (err) {
    console.error('加载顶级分类失败:', err)
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchModel.keyword || undefined,
      isRecommended: searchModel.isRecommended === 'true' ? true : searchModel.isRecommended === 'false' ? false : undefined,
      isVisible: searchModel.isVisible === 'true' ? true : searchModel.isVisible === 'false' ? false : undefined,
      parentId: selectedCategory.value || null,
    }
    const res = await getCategoryPage(params)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    console.error('加载分类列表失败:', err)
  } finally {
    loading.value = false
  }
}
setLoadFn(loadData)

// 分类树选中处理
const handleCategorySelect = (value: string) => {
  if (value === '__root__') {
    selectedCategory.value = null
  } else {
    selectedCategory.value = value
  }
  currentPage.value = 1
  loadData()
}

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const handleReset = () => {
  searchModel.keyword = ''
  searchModel.isRecommended = ''
  searchModel.isVisible = ''
  selectedCategory.value = null
  currentPage.value = 1
  loadData()
}

const handleAdd = () => {
  dialogMode.value = 'add'
  currentRecord.value = null
  currentParent.value = selectedCategory.value || null
  dialogVisible.value = true
}

const handleAddChild = (row: GoodsCategory) => {
  dialogMode.value = 'addChild'
  currentRecord.value = null
  currentParent.value = row.id
  dialogVisible.value = true
}

const handleEdit = (row: GoodsCategory) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  currentParent.value = row.parentId
  dialogVisible.value = true
}

const handleDelete = async (row: GoodsCategory) => {
  try {
    await ElMessageBox.confirm(
      `确定删除分类「${row.name}」吗？删除后无法恢复`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
  } catch {
    return
  }
  try {
    loading.value = true
    await deleteCategory(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (err: any) {
    ElMessage.error(err.message || '删除失败')
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (rows: GoodsCategory[]) => {
  selectedRows.value = rows
}

const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的分类')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定删除选中的 ${selectedRows.value.length} 个分类吗？删除后无法恢复`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
  } catch {
    return
  }
  try {
    loading.value = true
    const ids = selectedRows.value.map((r) => r.id)
    const res = await batchDeleteCategory(ids)
    if (res.data.failed.length > 0) {
      ElMessage.warning(`成功删除 ${res.data.success} 个，${res.data.failed.length} 个因存在子分类无法删除`)
    } else {
      ElMessage.success(`成功删除 ${res.data.success} 个分类`)
    }
    selectedRows.value = []
    loadData()
  } catch (err) {
    console.error(err)
    ElMessage.error('删除失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTopCategories()
  loadData()
})
</script>

<style scoped lang="scss">
.goods-category-list {
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

.category-name-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.category-icon {
  font-size: 16px;
}
</style>
