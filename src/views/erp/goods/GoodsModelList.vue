<template>
  <div class="goods-model-list">
    <!-- 内容区 -->
    <div class="goods-model-list__content">
      <SearchBar
        title="商品模型管理"
        :fields="searchFields"
        v-model="searchModel"
        show-add
        @add="handleAdd"
        @search="handleSearch"
        @reset="handleReset"
      />

      <CommonTable
        class="goods-model-list__table"
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

        <template #column-modelName="{ row }">
          <span class="model-name">{{ row.modelName }}</span>
        </template>

        <template #column-operator="{ row }">
          <span>{{ row.operator }}</span>
        </template>

        <template #column-updateTime="{ row }">
          <span>{{ row.updateTime }}</span>
        </template>

        <template #column-operation="{ row }">
          <el-button
            type="success"
            link
            size="small"
            @click="handleViewAttributes(row)"
          >
            属性列表
          </el-button>
          <el-button
            type="warning"
            link
            size="small"
            @click="handleViewSpecs(row)"
          >
            规格列表
          </el-button>
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

    <GoodsModelDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import GoodsModelDialog from './GoodsModelDialog.vue'
import useListPage from '@/composables/useListPage'
import {
  getGoodsModelPage,
  deleteGoodsModel,
  type GoodsModel,
} from '@/mock/goodsModel'

const tableData = ref<GoodsModel[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const currentRecord = ref<GoodsModel | null>(null)

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
    label: '关键词',
    type: 'input',
    placeholder: '搜索模型名称',
  },
]

const columns: TableColumn[] = [
  { prop: 'index', label: '编号', width: 100, align: 'center' },
  { prop: 'modelName', label: '模型名', width: 200 },
  { prop: 'operator', label: '操作人', width: 150, align: 'center' },
  { prop: 'updateTime', label: '操作时间', width: 180, align: 'center' },
  { prop: 'operation', label: '操作', width: 320, align: 'center', fixed: 'right' },
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await getGoodsModelPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchModel.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    console.error('加载商品模型列表失败:', err)
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

const handleEdit = (row: GoodsModel) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleViewAttributes = (row: GoodsModel) => {
  ElMessageBox.alert(
    `模型「${row.modelName}」的属性列表功能开发中...`,
    '属性列表',
    {
      confirmButtonText: '确定',
    }
  )
}

const handleViewSpecs = (row: GoodsModel) => {
  ElMessageBox.alert(
    `模型「${row.modelName}」的规格列表功能开发中...`,
    '规格列表',
    {
      confirmButtonText: '确定',
    }
  )
}

const handleDelete = async (row: GoodsModel) => {
  try {
    await ElMessageBox.confirm(
      `确定删除模型「${row.modelName}」吗？删除后无法恢复`,
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
    await deleteGoodsModel(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (err: any) {
    ElMessage.error(err.message || '删除失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.goods-model-list {
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

.model-name {
  font-weight: 500;
  color: #303133;
}
</style>
