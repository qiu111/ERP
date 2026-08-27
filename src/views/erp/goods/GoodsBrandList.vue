<template>
  <div class="goods-brand-list">
    <div class="goods-brand-list__content">
      <SearchBar
        title="商品品牌管理"
        :fields="searchFields"
        v-model="searchModel"
        show-add
        @add="handleAdd"
        @search="handleSearch"
        @reset="handleReset"
      />

      <CommonTable
        class="goods-brand-list__table"
        v-loading="loading"
        :columns="columns"
        :data="tableData"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        :row-key="'id'"
        height="100%"
        @page-change="handlePageChange"
        @page-size-change="handleSizeChange"
      >
        <template #column-index="{ row }">
          <span>{{ row.id }}</span>
        </template>

        <template #column-brandName="{ row }">
          <span class="brand-name">{{ row.brandName }}</span>
        </template>

        <template #column-brandLogo="{ row }">
          <el-image
            v-if="row.brandLogo"
            :src="row.brandLogo"
            :preview-src-list="[row.brandLogo]"
            fit="cover"
            style="width: 50px; height: 50px; border-radius: 4px;"
          />
          <div v-else class="brand-logo-placeholder">
            <el-icon :size="24"><Picture /></el-icon>
          </div>
        </template>

        <template #column-categoryName="{ row }">
          <span>{{ row.categoryName }}</span>
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

        <template #column-sort="{ row }">
          <span>{{ row.sort }}</span>
        </template>

        <template #column-operation="{ row }">
          <el-button type="primary" link size="small" @click="handleEdit(row)">
            修改
          </el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </CommonTable>
    </div>

    <GoodsBrandDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { Picture } from '@element-plus/icons-vue'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import GoodsBrandDialog from './GoodsBrandDialog.vue'
import useListPage from '@/composables/useListPage'
import {
  getGoodsBrandPage,
  getBrandCategoryOptions,
  deleteGoodsBrand,
  type GoodsBrand,
} from '@/mock/goodsBrand'

const tableData = ref<GoodsBrand[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const currentRecord = ref<GoodsBrand | null>(null)
const categoryOptions = ref<{ value: number; label: string }[]>([])

const searchModel = reactive<Record<string, any>>({
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
} = useListPage()

const searchFields: SearchField[] = [
  {
    prop: 'keyword',
    label: '品牌名称',
    type: 'input',
    placeholder: '搜索品牌名称',
  },
]

const columns: TableColumn[] = [
  { prop: 'index', label: '编号', width: 80, align: 'center' },
  { prop: 'brandName', label: '品牌名称', width: 130 },
  { prop: 'brandLogo', label: '品牌logo', width: 90, align: 'center' },
  { prop: 'categoryName', label: '品牌分类', width: 150, align: 'center' },
  { prop: 'isRecommended', label: '是否推荐', width: 100, align: 'center' },
  { prop: 'sort', label: '排序', width: 80, align: 'center' },
  { prop: 'operation', label: '操作', width: 160, align: 'center', fixed: 'right' },
]

const loadCategoryOptions = async () => {
  try {
    const res = await getBrandCategoryOptions()
    categoryOptions.value = res.data
  } catch (err) {
    console.error('加载品牌分类选项失败:', err)
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getGoodsBrandPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchModel.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    console.error('加载商品品牌列表失败:', err)
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
  searchModel.keyword = ''
  currentPage.value = 1
  loadData()
}

const handleAdd = () => {
  dialogMode.value = 'add'
  currentRecord.value = null
  dialogVisible.value = true
}

const handleEdit = (row: GoodsBrand) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleDelete = async (row: GoodsBrand) => {
  try {
    await ElMessageBox.confirm(
      `确定删除品牌「${row.brandName}」吗？删除后无法恢复`,
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
    await deleteGoodsBrand(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (err: any) {
    ElMessage.error(err.message || '删除失败')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadCategoryOptions()
  loadData()
})
</script>

<style scoped lang="scss">
.goods-brand-list {
  display: flex;
  flex-direction: column;
  padding: 16px;
  height: calc(100vh - 100px);
  overflow: hidden;

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__table {
    flex: 1;
    height: 0;
    overflow: hidden;

    :deep(.common-table) {
      height: 100%;
      display: flex;
      flex-direction: column;

      .el-table {
        flex: 1;
      }

      .common-table__pagination {
        flex-shrink: 0;
      }
    }
  }
}

.brand-name {
  font-weight: 500;
  color: #303133;
}

.brand-logo-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: #f0f0f0;
  border-radius: 4px;
  color: #ccc;
}
</style>
