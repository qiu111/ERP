<template>
  <div class="goods-spec-list">
    <!-- 内容区 -->
    <div class="goods-spec-list__content">
      <SearchBar
        title="商品规格管理"
        :fields="searchFields"
        v-model="searchModel"
        show-add
        @add="handleAdd"
        @search="handleSearch"
        @reset="handleReset"
      />

      <CommonTable
        class="goods-spec-list__table"
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

        <template #column-specModelName="{ row }">
          <span>{{ row.specModelName }}</span>
        </template>

        <template #column-specName="{ row }">
          <span class="spec-name">{{ row.specName }}</span>
        </template>

        <template #column-specItems="{ row }">
          <span class="spec-items">{{ row.specItems }}</span>
        </template>

        <template #column-searchable="{ row }">
          <el-tag
            :type="row.searchable === 'keyword' ? 'warning' : 'info'"
            effect="light"
            size="small"
          >
            {{ row.searchable === 'keyword' ? '关键字检索' : '不需要检索' }}
          </el-tag>
        </template>

        <template #column-sort="{ row }">
          <span>{{ row.sort }}</span>
        </template>

        <template #column-operation="{ row }">
          <el-button
            type="primary"
            link
            size="small"
            @click="handleEdit(row)"
          >
            修改
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

    <GoodsSpecDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      :model-options="modelOptions"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import GoodsSpecDialog from './GoodsSpecDialog.vue'
import useListPage from '@/composables/useListPage'
import {
  getGoodsSpecPage,
  getSpecModelOptions,
  deleteGoodsSpec,
  type GoodsSpec,
} from '@/mock/goodsSpec'

const tableData = ref<GoodsSpec[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const currentRecord = ref<GoodsSpec | null>(null)
const modelOptions = ref<{ value: number; label: string }[]>([])

const searchModel = reactive<Record<string, any>>({
  specModelId: '',
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
    prop: 'specModelId',
    label: '所属商品模型',
    type: 'select',
    placeholder: '请选择',
    options: [],
  },
]

const columns: TableColumn[] = [
  { prop: 'index', label: '编号', width: 80, align: 'center' },
  { prop: 'specModelName', label: '规格模型', width: 120, align: 'center' },
  { prop: 'specName', label: '规格名称', width: 120 },
  { prop: 'specItems', label: '规格项', minWidth: 250 },
  { prop: 'searchable', label: '是否检索', width: 120, align: 'center' },
  { prop: 'sort', label: '排序', width: 80, align: 'center' },
  { prop: 'operation', label: '操作', width: 160, align: 'center', fixed: 'right' },
]

// 加载商品模型选项
const loadModelOptions = async () => {
  try {
    const res = await getSpecModelOptions()
    modelOptions.value = res.data
    // 更新 searchFields 的 options
    const field = searchFields.find((f) => f.prop === 'specModelId')
    if (field) {
      field.options = res.data.map((o) => ({
        label: o.label,
        value: String(o.value),
      }))
    }
  } catch (err) {
    console.error('加载商品模型选项失败:', err)
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getGoodsSpecPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      specModelId: searchModel.specModelId ? Number(searchModel.specModelId) : undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    console.error('加载商品规格列表失败:', err)
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
  searchModel.specModelId = ''
  currentPage.value = 1
  loadData()
}

const handleAdd = () => {
  dialogMode.value = 'add'
  currentRecord.value = null
  dialogVisible.value = true
}

const handleEdit = (row: GoodsSpec) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleDelete = async (row: GoodsSpec) => {
  try {
    await ElMessageBox.confirm(
      `确定删除规格「${row.specName}」吗？删除后无法恢复`,
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
    await deleteGoodsSpec(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (err: any) {
    ElMessage.error(err.message || '删除失败')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadModelOptions()
  loadData()
})
</script>

<style scoped lang="scss">
.goods-spec-list {
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

.spec-name {
  font-weight: 500;
  color: #303133;
}

.spec-items {
  color: #606266;
}
</style>
