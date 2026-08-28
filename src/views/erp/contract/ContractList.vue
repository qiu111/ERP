<template>
  <div class="contract-list">
    <SearchBar
      title="合同列表"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="contract-list__table-wrap">
      <CommonTable
        v-loading="loading"
        :columns="columns"
        :data="tableData"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        :row-key="'id'"
        height="100%"
        :operation-width="330"
        @page-change="handlePageChange"
        @page-size-change="handleSizeChange"
      >
        <template #column-type="{ row }">
          <el-tag :type="typeTagTypeMap[(row as ContractItem).type]" effect="light" size="small">
            {{ typeLabel[(row as ContractItem).type] }}
          </el-tag>
        </template>

        <template #column-amount="{ row }">
          <span>￥{{ (row as ContractItem).amount.toLocaleString('zh-CN') }}</span>
        </template>

        <template #column-status="{ row }">
          <el-tag :type="statusTagTypeMap[(row as ContractItem).status]" effect="light" size="small">
            {{ statusLabel[(row as ContractItem).status] }}
          </el-tag>
        </template>

        <template #operation="{ row }">
          <el-button type="warning" link size="small" @click="handleView(row)">
            <el-icon><View /></el-icon>
            详情
          </el-button>
          <el-button
            v-if="(row as ContractItem).status === 'draft'"
            type="primary"
            link
            size="small"
            @click="handleEdit(row)"
          >
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button
            v-if="(row as ContractItem).status === 'draft'"
            type="success"
            link
            size="small"
            @click="handleStatusAction(row as ContractItem, 'submit')"
          >
            <el-icon><Promotion /></el-icon>
            提交
          </el-button>
          <el-button
            v-if="(row as ContractItem).status === 'executing'"
            type="success"
            link
            size="small"
            @click="handleStatusAction(row as ContractItem, 'complete')"
          >
            <el-icon><CircleCheck /></el-icon>
            完成
          </el-button>
          <el-button
            v-if="(row as ContractItem).status === 'executing'"
            type="danger"
            link
            size="small"
            @click="handleStatusAction(row as ContractItem, 'terminate')"
          >
            <el-icon><CircleClose /></el-icon>
            终止
          </el-button>
          <el-button
            v-if="(row as ContractItem).status === 'draft'"
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

    <ContractDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { View, Edit, Delete, Promotion, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import ContractDialog from './ContractDialog.vue'
import useListPage from '@/composables/useListPage'
import {
  getContractPage,
  deleteContract,
  submitContract,
  completeContract,
  terminateContract,
  contractTypeOptions,
  contractStatusOptions,
  typeLabel,
  typeTagTypeMap,
  statusLabel,
  statusTagTypeMap,
  type ContractItem,
  type ContractType,
  type ContractStatus,
} from '@/mock/contract'

const tableData = ref<ContractItem[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<ContractItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  type: '',
  status: '',
  dateRange: [],
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
    prop: 'type',
    label: '合同类型:',
    type: 'select',
    placeholder: '请选择',
    options: contractTypeOptions,
  },
  {
    prop: 'status',
    label: '状态:',
    type: 'select',
    placeholder: '请选择',
    options: contractStatusOptions,
  },
  {
    prop: 'dateRange',
    label: '签订日期:',
    type: 'daterange',
  },
  {
    prop: 'keyword',
    label: '关键字查询:',
    type: 'input',
    placeholder: '编号/名称/对方单位/经办人/条款',
  },
]

const columns: TableColumn[] = [
  { prop: 'contractNo', label: '合同编号', width: 130, align: 'center' },
  { prop: 'name', label: '合同名称', minWidth: 220 },
  { prop: 'type', label: '类型', width: 90, align: 'center', slot: true },
  { prop: 'party', label: '对方单位', minWidth: 180 },
  { prop: 'amount', label: '合同金额', width: 130, align: 'right', slot: true },
  { prop: 'signDate', label: '签订日期', width: 110, align: 'center' },
  { prop: 'status', label: '状态', width: 100, align: 'center', slot: true },
  { prop: 'handler', label: '经办人', width: 100, align: 'center' },
  { prop: 'createTime', label: '创建时间', width: 150, align: 'center' },
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await getContractPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      types: searchModel.type ? [searchModel.type as ContractType] : undefined,
      status: (searchModel.status as ContractStatus) || undefined,
      dateRange:
        Array.isArray(searchModel.dateRange) && searchModel.dateRange.length === 2
          ? searchModel.dateRange
          : undefined,
      keyword: searchModel.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载合同列表失败:', e)
  } finally {
    loading.value = false
  }
}
setLoadFn(loadData)

// ========== 搜索/重置 ==========
const handleSearch = () => {
  currentPage.value = 1
  loadData()
}
const handleReset = () => {
  searchModel.type = ''
  searchModel.status = ''
  searchModel.dateRange = []
  searchModel.keyword = ''
  currentPage.value = 1
  loadData()
}

// ========== 弹框操作 ==========
const handleAdd = () => {
  dialogMode.value = 'add'
  currentRecord.value = null
  dialogVisible.value = true
}
const handleView = (row: ContractItem) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleEdit = (row: ContractItem) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}

// ========== 状态流转（提交/完成/终止） ==========
const STATUS_ACTION_CONF = {
  submit: {
    title: '提交确认',
    tip: (r: ContractItem) => `确定将合同「${r.contractNo}」提交进入履行阶段吗？`,
    success: '提交成功，合同已进入履行阶段',
    api: submitContract,
  },
  complete: {
    title: '完成确认',
    tip: (r: ContractItem) => `确定将合同「${r.contractNo}」标记为已完成吗？`,
    success: '操作成功，合同已完成',
    api: completeContract,
  },
  terminate: {
    title: '终止确认',
    tip: (r: ContractItem) => `确定终止合同「${r.contractNo}」吗？终止后不可恢复`,
    success: '操作成功，合同已终止',
    api: terminateContract,
  },
} as const

type StatusActionKey = keyof typeof STATUS_ACTION_CONF

const handleStatusAction = async (row: ContractItem, key: StatusActionKey) => {
  const conf = STATUS_ACTION_CONF[key]
  try {
    await ElMessageBox.confirm(conf.tip(row), conf.title, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await conf.api(row.id)
  if (res.code === 200 && res.data && res.data.id) {
    ElMessage.success(conf.success)
    loadData()
  } else {
    ElMessage.error('操作失败')
  }
}

// ========== 删除（仅草稿） ==========
const handleDelete = async (row: ContractItem) => {
  try {
    await ElMessageBox.confirm(`确定删除合同「${row.contractNo}」吗？删除后无法恢复`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await deleteContract(row.id)
  if (res.code === 200 && res.data) {
    ElMessage.success('删除成功')
    loadData()
  } else {
    ElMessage.error('删除失败')
  }
}

onMounted(() => loadData())
</script>

<style scoped lang="scss">
.contract-list {
  display: flex;
  flex-direction: column;
  padding: 16px;
  height: calc(100vh - 100px);
  overflow: hidden;

  &__table-wrap {
    flex: 1;
    min-height: 0;
    background: #fff;
    border-radius: 4px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}
</style>
