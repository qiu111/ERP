<template>
  <div class="goods-attribute-list">
    <div class="goods-attribute-list__content">
      <SearchBar
        title="商品属性管理"
        :fields="searchFields"
        v-model="searchModel"
        show-add
        @add="handleAdd"
        @search="handleSearch"
        @reset="handleReset"
      />

      <CommonTable
        class="goods-attribute-list__table"
        v-loading="loading"
        :columns="columns"
        :data="tableData"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        :row-key="'id'"
        height="100%"
        :fit="true"
        @page-change="handlePageChange"
        @page-size-change="handleSizeChange"
      >
        <template #column-index="{ row }">
          <span>{{ row.id }}</span>
        </template>

        <template #column-attributeName="{ row }">
          <span class="attr-name">{{ row.attributeName }}</span>
        </template>

        <template #column-specModelName="{ row }">
          <span>{{ row.specModelName }}</span>
        </template>

        <template #column-inputType="{ row }">
          <el-tag
            :type="row.inputType === 'list' ? 'warning' : row.inputType === 'textarea' ? 'info' : undefined"
            effect="light"
            size="small"
          >
            {{ inputTypeLabels[row.inputType] }}
          </el-tag>
        </template>

        <template #column-optionalValues="{ row }">
          <span class="optional-values">{{ row.optionalValues || '-' }}</span>
        </template>

        <template #column-searchable="{ row }">
          <el-tag
            :type="row.searchable === 'keyword' ? 'warning' : 'info'"
            effect="light"
            size="small"
          >
            {{ searchableLabels[row.searchable] }}
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

    <GoodsAttributeDialog
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
import GoodsAttributeDialog from './GoodsAttributeDialog.vue'
import useListPage from '@/composables/useListPage'
import {
  getGoodsAttributePage,
  getAttributeModelOptions,
  deleteGoodsAttribute,
  inputTypeLabels,
  searchableLabels,
  type GoodsAttribute,
} from '@/mock/goodsAttribute'

const tableData = ref<GoodsAttribute[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const currentRecord = ref<GoodsAttribute | null>(null)
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
  { prop: 'attributeName', label: '属性名称', width: 130 },
  { prop: 'specModelName', label: '商品模型', width: 130, align: 'center' },
  { prop: 'inputType', label: '属性值的输入方式', width: 150, align: 'center' },
  { prop: 'optionalValues', label: '可选值列表', minWidth: 200 },
  { prop: 'searchable', label: '是否检索', width: 120, align: 'center' },
  { prop: 'sort', label: '排序', width: 80, align: 'center' },
  { prop: 'operation', label: '操作', width: 160, align: 'center', fixed: 'right' },
]

const loadModelOptions = async () => {
  try {
    const res = await getAttributeModelOptions()
    modelOptions.value = res.data
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
    const res = await getGoodsAttributePage({
      page: currentPage.value,
      pageSize: pageSize.value,
      specModelId: searchModel.specModelId ? Number(searchModel.specModelId) : undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    console.error('加载商品属性列表失败:', err)
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

const handleEdit = (row: GoodsAttribute) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleDelete = async (row: GoodsAttribute) => {
  try {
    await ElMessageBox.confirm(
      `确定删除属性「${row.attributeName}」吗？删除后无法恢复`,
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
    await deleteGoodsAttribute(row.id)
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
.goods-attribute-list {
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

.attr-name {
  font-weight: 500;
  color: #303133;
}

.optional-values {
  color: #606266;
}
</style>
