<template>
  <div class="reception-todo-list">
    <SearchBar
      title="待我审批接待"
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

    <!-- 接待类型 Tab -->
    <el-tabs
      v-model="activeType"
      class="reception-todo-list__tabs"
      type="card"
      @tab-change="handleTabChange"
    >
      <el-tab-pane label="全部" name="all">
        <template #label>
          <span>全部</span>
          <el-badge
            v-if="typeCounts.all > 0"
            :value="typeCounts.all"
            class="tab-badge"
            :max="99"
          />
        </template>
      </el-tab-pane>
      <el-tab-pane
        v-for="opt in receptionTypeOptions"
        :key="opt.value"
        :label="opt.label"
        :name="opt.value"
      >
        <template #label>
          <span>{{ opt.label }}</span>
          <el-badge
            v-if="typeCounts[opt.value] > 0"
            :value="typeCounts[opt.value]"
            class="tab-badge"
            :max="99"
          />
        </template>
      </el-tab-pane>
    </el-tabs>

    <!-- 表格 -->
    <div class="reception-todo-list__table-wrap">
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
        <template #column-title="{ row }">
          <el-tooltip :content="row.title" placement="top" effect="dark">
            <span class="title-text">{{ row.title }}</span>
          </el-tooltip>
        </template>

        <template #column-receptionType="{ row }">
          <el-tag :type="typeTagTypeMap[row.receptionType as ReceptionType]" effect="light" size="small">
            {{ getTypeLabel(row.receptionType) }}
          </el-tag>
        </template>

        <template #column-level="{ row }">
          <el-tag :type="levelTagTypeMap[row.level as ReceptionLevel]" effect="light" size="small">
            {{ getLevelLabel(row.level) }}
          </el-tag>
        </template>

        <template #column-estimatedCost="{ row }">
          <span class="amount-text">¥ {{ formatAmount(row.estimatedCost) }}</span>
        </template>

        <template #operation="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">
            <el-icon><View /></el-icon>
            查看
          </el-button>
          <el-button type="success" link size="small" @click="handleApprove(row, 'approve')">
            <el-icon><CircleCheck /></el-icon>
            通过
          </el-button>
          <el-button type="danger" link size="small" @click="handleApprove(row, 'reject')">
            <el-icon><CircleClose /></el-icon>
            驳回
          </el-button>
        </template>
      </CommonTable>
    </div>

    <!-- 审批操作弹框 -->
    <ReceptionDialog
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
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import ReceptionDialog from './ReceptionDialog.vue'
import useListPage from '@/composables/useListPage'
import {
  getReceptionTodoPage,
  batchApproveReception,
  getReceptionTypeCounts,
  getTypeLabel,
  getLevelLabel,
  typeTagTypeMap,
  levelTagTypeMap,
  receptionTypeOptions,
  receptionLevelOptions,
  type ReceptionItem,
  type ReceptionType,
  type ReceptionLevel,
} from '@/mock/reception'

const tableData = ref<ReceptionItem[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'view' | 'approve'>('view')
const dialogApprovalType = ref<'approve' | 'reject'>('approve')
const currentRecord = ref<ReceptionItem | null>(null)
const selectedRows = ref<ReceptionItem[]>([])
const activeType = ref<ReceptionType | 'all'>('all')
const typeCounts = ref<Record<string, number>>({ all: 0 })

const searchModel = reactive<Record<string, any>>({
  keyword: '',
  level: '',
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
    label: '搜索:',
    type: 'input',
    placeholder: '标题/客户名称/接待地点',
  },
  {
    prop: 'level',
    label: '接待级别:',
    type: 'select',
    placeholder: '请选择',
    options: receptionLevelOptions,
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '编号', width: 80, align: 'center' },
  { prop: 'title', label: '接待标题', minWidth: 220, slot: true },
  { prop: 'customerName', label: '客户名称', width: 120 },
  { prop: 'receptionType', label: '接待类型', width: 100, align: 'center', slot: true },
  { prop: 'level', label: '接待级别', width: 90, align: 'center', slot: true },
  { prop: 'receptionTime', label: '接待时间', width: 150, align: 'center' },
  { prop: 'receptionPlace', label: '接待地点', minWidth: 160 },
  { prop: 'estimatedCost', label: '预计费用', width: 120, align: 'right', slot: true },
  { prop: 'host', label: '接待人', width: 110, align: 'center' },
  { prop: 'submitter', label: '发起人', width: 110, align: 'center' },
  { prop: 'createTime', label: '发起时间', width: 150, align: 'center' },
]

const formatAmount = (amount: number): string => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 加载类型统计
const loadTypeCounts = async () => {
  try {
    const res = await getReceptionTypeCounts()
    typeCounts.value = res.data
  } catch (err) {
    console.error('加载接待类型统计失败:', err)
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getReceptionTodoPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      type: activeType.value === 'all' ? undefined : activeType.value,
      level: (searchModel.level as any) || undefined,
      keyword: searchModel.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    console.error('加载待审批接待失败:', err)
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
  searchModel.keyword = ''
  searchModel.level = ''
  activeType.value = 'all'
  currentPage.value = 1
  loadData()
}

const handleView = (row: ReceptionItem) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleApprove = async (row: ReceptionItem, type: 'approve' | 'reject') => {
  const confirmText = type === 'approve' ? '通过' : '驳回'
  try {
    await ElMessageBox.confirm(
      `确定${confirmText}接待「${row.title}」吗？`,
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
    ElMessage.warning('请先选择要审批的接待记录')
    return
  }
  const confirmText = type === 'approve' ? '通过' : '驳回'
  try {
    await ElMessageBox.confirm(
      `确定批量${confirmText}选中的 ${selectedRows.value.length} 条接待记录吗？`,
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
    const res = await batchApproveReception(ids, {
      approvalOpinion: `批量${confirmText}（示例意见）`,
      approvalResult: type,
    })
    if (res.data.failed.length > 0) {
      ElMessage.warning(`${confirmText}成功 ${res.data.success} 条，${res.data.failed.length} 条处理失败`)
    } else {
      ElMessage.success(`成功${confirmText} ${res.data.success} 条接待记录`)
    }
    selectedRows.value = []
    loadTypeCounts()
    loadData()
  } catch (err) {
    console.error(err)
    ElMessage.error(`批量${confirmText}失败`)
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (rows: ReceptionItem[]) => {
  selectedRows.value = rows
}

const handleApprovalSuccess = () => {
  loadTypeCounts()
  loadData()
}

onMounted(() => {
  loadTypeCounts()
  loadData()
})
</script>

<style scoped lang="scss">
.reception-todo-list {
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

.title-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}
</style>
