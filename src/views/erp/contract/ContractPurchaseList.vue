<template>
  <div class="contract-purchase-list">
    <SearchBar
      title="采购合同"
      :fields="searchFields"
      v-model="searchModel"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="contract-purchase-list__table-wrap">
      <CommonTable
        v-loading="loading"
        :columns="columns"
        :data="tableData"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        :row-key="'id'"
        height="100%"
        :operation-width="200"
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
            type="danger"
            link
            size="small"
            @click="handleStatusAction(row as ContractItem, 'terminate')"
          >
            <el-icon><CircleClose /></el-icon>
            终止
          </el-button>
        </template>
      </CommonTable>
    </div>

    <ContractDialog
      v-model="dialogVisible"
      mode="view"
      :record="currentRecord"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { View, Promotion, CircleClose } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import ContractDialog from './ContractDialog.vue'
import useListPage from '@/composables/useListPage'
import {
  getContractPage,
  submitContract,
  terminateContract,
  typeLabel,
  typeTagTypeMap,
  statusLabel,
  statusTagTypeMap,
  contractStatusOptions,
  type ContractItem,
  type ContractStatus,
} from '@/mock/contract'

const tableData = ref<ContractItem[]>([])
const dialogVisible = ref(false)
const currentRecord = ref<ContractItem | null>(null)

const searchModel = reactive<Record<string, any>>({
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

// 固定查询采购类型合同（复用 contract.ts 的 types 过滤参数）
const loadData = async () => {
  loading.value = true
  try {
    const res = await getContractPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      types: ['purchase'],
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
    console.error('加载采购合同列表失败:', e)
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
  searchModel.status = ''
  searchModel.dateRange = []
  searchModel.keyword = ''
  currentPage.value = 1
  loadData()
}

// ========== 操作 ==========
const handleView = (row: ContractItem) => {
  currentRecord.value = row
  dialogVisible.value = true
}

// ========== 状态流转（提交/终止） ==========
const STATUS_ACTION_CONF = {
  submit: {
    title: '提交确认',
    tip: (r: ContractItem) => `确定将采购合同「${r.contractNo}」提交进入履行阶段吗？`,
    success: '提交成功，合同已进入履行阶段',
    api: submitContract,
  },
  terminate: {
    title: '终止确认',
    tip: (r: ContractItem) => `确定终止采购合同「${r.contractNo}」吗？终止后不可恢复`,
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

onMounted(() => loadData())
</script>

<style scoped lang="scss">
.contract-purchase-list {
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
