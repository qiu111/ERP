<template>
  <div class="approval-todo-list">
    <SearchBar
      title="待我审批"
      :fields="searchFields"
      v-model="searchModel"
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #extra>
        <el-button
          v-if="selectedRows.length"
          type="success"
          @click="handleBatchApprove('approve')"
        >
          <el-icon><CircleCheck /></el-icon>
          批量通过
        </el-button>
        <el-button
          v-if="selectedRows.length"
          type="danger"
          @click="handleBatchApprove('reject')"
        >
          <el-icon><CircleClose /></el-icon>
          批量驳回
        </el-button>
      </template>
    </SearchBar>

    <!-- 分类 Tab -->
    <el-tabs
      v-model="activeCategory"
      class="approval-todo-list__tabs"
      type="card"
      @tab-change="handleTabChange"
    >
      <el-tab-pane label="全部" name="all">
        <template #label>
          <span>全部</span>
          <el-badge
            v-if="categoryCounts.all > 0"
            :value="categoryCounts.all"
            class="tab-badge"
            :max="99"
          />
        </template>
      </el-tab-pane>
      <el-tab-pane
        v-for="opt in categoryOptions"
        :key="opt.value"
        :label="opt.label"
        :name="opt.value"
      >
        <template #label>
          <span>{{ opt.label }}</span>
          <el-badge
            v-if="categoryCounts[opt.value] > 0"
            :value="categoryCounts[opt.value]"
            class="tab-badge"
            :max="99"
          />
        </template>
      </el-tab-pane>
    </el-tabs>

    <!-- 表格 -->
    <div class="approval-todo-list__table-wrap">
      <CommonTable
        v-loading="loading"
        :columns="columns"
        :data="tableData"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        :row-key="'id'"
        :selectable="true"
        height="100%"
        @page-change="handlePageChange"
        @page-size-change="handleSizeChange"
        @selection-change="handleSelectionChange"
      >
        <template #column-approvalAmount="{ row }">
          <span class="amount-text">
            {{ row.currency }} {{ formatAmount(row.approvalAmount) }}
          </span>
        </template>

        <template #column-category="{ row }">
          <el-tag :type="getCategoryTagType(row.category)" effect="light" size="small">
            {{ getCategoryLabel(row.category) }}
          </el-tag>
        </template>

        <template #column-settlementApproval="{ row }">
          <el-tag type="info" effect="plain" size="small">
            {{ getSettlementApprovalLabel(row.settlementApproval) }}
          </el-tag>
        </template>

        <template #column-status="{ row }">
          <el-tag
            :type="getStatusTagType(row.status)"
            effect="light"
            size="small"
          >
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>

        <template #column-details="{ row }">
          <el-tooltip :content="row.details" placement="top" effect="dark">
            <span class="details-text">{{ row.details }}</span>
          </el-tooltip>
        </template>

        <template #operation="{ row }">
          <el-button
            type="primary"
            link
            size="small"
            @click="handleView(row)"
          >
            <el-icon><View /></el-icon>
            查看
          </el-button>
          <el-button
            type="success"
            link
            size="small"
            @click="handleApprove(row, 'approve')"
          >
            <el-icon><CircleCheck /></el-icon>
            通过
          </el-button>
          <el-button
            type="danger"
            link
            size="small"
            @click="handleApprove(row, 'reject')"
          >
            <el-icon><CircleClose /></el-icon>
            驳回
          </el-button>
        </template>
      </CommonTable>
    </div>

    <!-- 审批操作弹框 -->
    <ApprovalTodoDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      :approval-type="dialogApprovalType"
      @success="handleApprovalSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { View, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import ApprovalTodoDialog from './ApprovalTodoDialog.vue'
import useListPage from '@/composables/useListPage'
import {
  getApprovalTodoPage,
  approveTodo,
  batchApproveTodo,
  getCategoryCounts,
  getCategoryLabel,
  getSettlementApprovalLabel,
  getStatusTagType,
  getStatusText,
  categoryOptions,
  type ApprovalTodo,
  type ApprovalCategory,
} from '@/mock/approvalTodo'

const tableData = ref<ApprovalTodo[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'view' | 'approve'>('view')
const dialogApprovalType = ref<'approve' | 'reject'>('approve')
const currentRecord = ref<ApprovalTodo | null>(null)
const selectedRows = ref<ApprovalTodo[]>([])
const activeCategory = ref<ApprovalCategory | 'all'>('all')
const categoryCounts = ref<Record<string, number>>({ all: 0 })

const searchModel = reactive<Record<string, any>>({
  orderNo: '',
  minAmount: '',
  maxAmount: '',
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
    prop: 'orderNo',
    label: '订单号:',
    type: 'input',
    placeholder: '请输入订单号/编号/标题',
  },
  {
    prop: 'minAmount',
    label: '金额:',
    type: 'input',
    placeholder: '最小金额',
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '编号', width: 160 },
  { prop: 'title', label: '标题', minWidth: 180 },
  { prop: 'orderNo', label: '订单编号', width: 160 },
  { prop: 'payeeName', label: '收款人名称', minWidth: 180 },
  { prop: 'approvalAmount', label: '审批金额', width: 150, align: 'right' },
  { prop: 'currency', label: '币种', width: 90, align: 'center' },
  { prop: 'details', label: '详情', minWidth: 220 },
  { prop: 'expectedPayTime', label: '希望支付时间', width: 120, align: 'center' },
  { prop: 'category', label: '分类', width: 100, align: 'center' },
  { prop: 'settlementApproval', label: '结算审批', width: 110, align: 'center' },
  { prop: 'initiator', label: '发起人', width: 100, align: 'center' },
  { prop: 'createTime', label: '发起时间', width: 160, align: 'center' },
]

// 分类tag颜色映射
const categoryTagTypeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  sale_order: 'primary',
  purchase_order: 'success',
  expense: 'warning',
  goods_payment: 'danger',
  purchase_contract: 'info',
  refund: 'danger',
  salary: 'success',
}
const getCategoryTagType = (category: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  return categoryTagTypeMap[category] || 'info'
}

// 金额格式化
const formatAmount = (amount: number): string => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 加载分类统计
const loadCategoryCounts = async () => {
  try {
    const res = await getCategoryCounts()
    categoryCounts.value = res.data
  } catch (err) {
    console.error('加载分类统计失败:', err)
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
      orderNo: searchModel.orderNo || undefined,
      minAmount: searchModel.minAmount !== '' ? Number(searchModel.minAmount) : undefined,
      maxAmount: searchModel.maxAmount !== '' ? Number(searchModel.maxAmount) : undefined,
      category: activeCategory.value,
    }
    const res = await getApprovalTodoPage(params)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    console.error('加载待审批列表失败:', err)
  } finally {
    loading.value = false
  }
}
setLoadFn(loadData)

const handleTabChange = () => {
  currentPage.value = 1
  loadData()
}

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const handleReset = () => {
  searchModel.orderNo = ''
  searchModel.minAmount = ''
  searchModel.maxAmount = ''
  activeCategory.value = 'all'
  currentPage.value = 1
  loadData()
}

const handleView = (row: ApprovalTodo) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleApprove = async (row: ApprovalTodo, type: 'approve' | 'reject') => {
  const confirmText = type === 'approve' ? '通过' : '驳回'
  try {
    await ElMessageBox.confirm(
      `确定${confirmText}审批「${row.title}」吗？`,
      `${confirmText}确认`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: type === 'approve' ? 'success' : 'warning',
      }
    )
  } catch {
    return
  }
  dialogMode.value = 'approve'
  dialogApprovalType.value = type
  currentRecord.value = row
  dialogVisible.value = true
}

const handleBatchApprove = async (type: 'approve' | 'reject') => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要审批的记录')
    return
  }
  const confirmText = type === 'approve' ? '通过' : '驳回'
  try {
    await ElMessageBox.confirm(
      `确定批量${confirmText}选中的 ${selectedRows.value.length} 条记录吗？`,
      `批量${confirmText}确认`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: type === 'approve' ? 'success' : 'warning',
      }
    )
  } catch {
    return
  }
  try {
    loading.value = true
    const ids = selectedRows.value.map((r) => r.id)
    const res = await batchApproveTodo(ids, {
      approvalOpinion: `批量${confirmText}`,
      approvalResult: type,
    })
    if (res.data.failed.length > 0) {
      ElMessage.warning(`${confirmText}成功 ${res.data.success} 条，${res.data.failed.length} 条处理失败`)
    } else {
      ElMessage.success(`成功${confirmText} ${res.data.success} 条记录`)
    }
    selectedRows.value = []
    loadCategoryCounts()
    loadData()
  } catch (err) {
    console.error(err)
    ElMessage.error(`${confirmText}失败`)
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (rows: ApprovalTodo[]) => {
  selectedRows.value = rows
}

const handleApprovalSuccess = () => {
  loadCategoryCounts()
  loadData()
}

onMounted(() => {
  loadCategoryCounts()
  loadData()
})
</script>

<style scoped lang="scss">
.approval-todo-list {
  display: flex;
  flex-direction: column;
  padding: 16px;
  height: calc(100vh - 100px);
  overflow: hidden;

  &__tabs {
    background: #fff;
    padding: 0 16px;
    border-radius: 4px;
    margin-bottom: 16px;

    :deep(.el-tabs__header) {
      margin-bottom: 0;
    }

    :deep(.el-tabs__nav) {
      border: none;
    }

    :deep(.el-tabs__item) {
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      margin-right: 8px;
      height: 32px;
      line-height: 30px;
      padding: 0 18px;

      &.is-active {
        background: #409eff;
        color: #fff;
        border-color: #409eff;
      }
    }
  }

  &__table-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #fff;
    border-radius: 4px;
    padding: 16px;
    min-height: 0;
  }
}

.tab-badge {
  margin-left: 6px;
}

.amount-text {
  font-weight: 600;
  color: #f56c6c;
}

.details-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}
</style>
