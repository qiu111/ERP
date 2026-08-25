<template>
  <div class="company-list">
    <SearchBar
      title="公司信息管理"
      show-add
      add-permission="companyInfo:add"
      v-model="searchParams"
      :fields="searchFields"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
    />

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
      <template #operation="{ row }">
        <el-button type="info" link size="small" @click="handleDetail(row)">
          详情
        </el-button>
        <el-button v-if="has('companyInfo:edit')" type="primary" link size="small" @click="handleEdit(row)">
          编辑
        </el-button>
        <el-button v-if="has('companyInfo:delete')" type="danger" link size="small" @click="handleDelete(row)">
          删除
        </el-button>
      </template>
    </CommonTable>

    <CompanyDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import { usePermission } from '@/composables/usePermission'
import useListPage from '@/composables/useListPage'
import CompanyDialog from './CompanyDialog.vue'
import { getCompanyPage, deleteCompany } from '@/mock/company'
import type { CompanyItem } from '@/mock/company'

const { has } = usePermission()
const tableData = ref<CompanyItem[]>([])
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

const searchParams = ref<Record<string, any>>({
  keyword: '',
})

const searchFields: SearchField[] = [
  {
    prop: 'keyword',
    label: '搜索',
    type: 'input',
    placeholder: '公司名称/简称',
  },
]

const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const currentRecord = ref<CompanyItem | null>(null)

const columns: TableColumn[] = [
  { prop: 'id', label: '编号', width: 70, align: 'center' },
  { prop: 'companyName', label: '公司名称', minWidth: 180 },
  { prop: 'companyShortName', label: '公司简称', minWidth: 160 },
  { prop: 'bankName', label: '开户银行', minWidth: 200 },
  { prop: 'bankAccount', label: '开户账号', minWidth: 180 },
  { prop: 'phone', label: '电话', minWidth: 110 },
  { prop: 'fax', label: '传真', minWidth: 110 },
  { prop: 'companyAddress', label: '公司地址', minWidth: 220 },
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await getCompanyPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchParams.value.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    console.error('加载公司信息列表失败:', err)
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
  searchParams.value = {
    keyword: '',
  }
  currentPage.value = 1
  loadData()
}

const handleAdd = () => {
  dialogMode.value = 'add'
  currentRecord.value = null
  dialogVisible.value = true
}

const handleEdit = (row: CompanyItem) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleDetail = (row: CompanyItem) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleDelete = (row: CompanyItem) => confirmDelete(deleteCompany, row, row.companyName)

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.company-list {
  padding: 20px;
}
</style>
