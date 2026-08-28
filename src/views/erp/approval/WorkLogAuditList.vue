<template>
  <div class="work-log-audit-list">
    <SearchBar
      :title="pageTitle"
      :fields="searchFields"
      v-model="searchModel"
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #extra>
        <el-button
          v-if="selectedRows.length"
          type="success"
          @click="handleBatchApprove('passed')"
        >
          <el-icon><CircleCheck /></el-icon>
          批量通过
        </el-button>
        <el-button
          v-if="selectedRows.length"
          type="danger"
          @click="handleBatchApprove('rejected')"
        >
          <el-icon><CircleClose /></el-icon>
          批量驳回
        </el-button>
      </template>
    </SearchBar>

    <!-- 表格 -->
    <div class="work-log-audit-list__table-wrap">
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

        <template #column-summaryType="{ row }">
          <el-tag type="primary" effect="plain" size="small">
            {{ getSummaryTypeLabel(row.summaryType) }}
          </el-tag>
        </template>

        <template #column-auditStatus="{ row }">
          <el-tag
            :type="auditStatusTagTypeMap[row.auditStatus]"
            effect="light"
            size="small"
          >
            {{ getAuditStatusLabel(row.auditStatus) }}
          </el-tag>
        </template>

        <template #column-auditor="{ row }">
          <span>{{ row.auditor && row.auditor !== '-' ? row.auditor : '-' }}</span>
        </template>

        <template #operation="{ row }">
          <el-button
            type="primary"
            link
            size="small"
            @click="handleView(row)"
          >
            <el-icon><View /></el-icon>
            详情
          </el-button>
          <el-button
            v-if="canAudit(row)"
            type="success"
            link
            size="small"
            @click="handleAudit(row, 'passed')"
          >
            <el-icon><CircleCheck /></el-icon>
            通过
          </el-button>
          <el-button
            v-if="canAudit(row)"
            type="danger"
            link
            size="small"
            @click="handleAudit(row, 'rejected')"
          >
            <el-icon><CircleClose /></el-icon>
            驳回
          </el-button>
        </template>
      </CommonTable>
    </div>

    <!-- 详情 / 审核 弹框（复用 WorkLogDialog） -->
    <WorkLogDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      :audit-type="dialogAuditType"
      :auditor-name="CURRENT_AUDITOR"
      @success="handleSuccess"
      @audit-success="handleAuditSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { View, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import WorkLogDialog from './WorkLogDialog.vue'
import useListPage from '@/composables/useListPage'
import {
  getWorkLogPage,
  batchAuditWorkLog,
  summaryTypeOptions,
  auditStatusOptions,
  departmentOptions,
  submitterOptions,
  getSummaryTypeLabel,
  getAuditStatusLabel,
  auditStatusTagTypeMap,
  type WorkLogItem,
  type WorkAuditResult,
} from '@/mock/workLog'

/** 当前审核人（模拟当前登录人：超级管理员） */
const CURRENT_AUDITOR = '超级管理员'

const pageTitle = '日志审核'

const tableData = ref<WorkLogItem[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'view' | 'audit'>('view')
const dialogAuditType = ref<WorkAuditResult>('passed')
const currentRecord = ref<WorkLogItem | null>(null)
const selectedRows = ref<WorkLogItem[]>([])

const searchModel = reactive<Record<string, any>>({
  department: '',
  submitter: '',
  summaryType: '',
  auditStatus: '',
  submitDate: '',
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
    prop: 'department',
    label: '部门列表:',
    type: 'select',
    placeholder: '请选择',
    options: departmentOptions,
    span: 6,
  },
  {
    prop: 'submitter',
    label: '提交人:',
    type: 'select',
    placeholder: '请选择',
    options: submitterOptions,
    span: 6,
  },
  {
    prop: 'summaryType',
    label: '总结类型:',
    type: 'select',
    placeholder: '请选择',
    options: summaryTypeOptions,
    span: 6,
  },
  {
    prop: 'auditStatus',
    label: '审核状态:',
    type: 'select',
    placeholder: '请选择',
    options: auditStatusOptions,
    span: 6,
  },
  {
    prop: 'submitDate',
    label: '提交日期:',
    type: 'date',
    placeholder: '选择日期',
    span: 12,
  },
  {
    prop: 'keyword',
    label: '关键词:',
    type: 'input',
    placeholder: '搜索标题及内容信息',
    span: 12,
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '编号', width: 80, align: 'center' },
  { prop: 'title', label: '标题', minWidth: 260, slot: true },
  { prop: 'summaryType', label: '总结类型', width: 110, align: 'center', slot: true },
  { prop: 'submitter', label: '提交人', width: 100, align: 'center' },
  { prop: 'submitTime', label: '提交时间', width: 160, align: 'center' },
  { prop: 'auditStatus', label: '审核状态', width: 100, align: 'center', slot: true },
  { prop: 'auditor', label: '审核人', width: 100, align: 'center', slot: true },
]

/** 是否可审核（未审核 / 审核中 才能操作） */
const canAudit = (row: WorkLogItem): boolean => {
  return row.auditStatus === 'pending' || row.auditStatus === 'auditing'
}

// =========== 数据加载 ===========
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      department: searchModel.department || undefined,
      submitter: searchModel.submitter || undefined,
      summaryType: searchModel.summaryType || undefined,
      auditStatus: searchModel.auditStatus || undefined,
      submitDate: searchModel.submitDate || undefined,
      keyword: searchModel.keyword || undefined,
    }
    const res = await getWorkLogPage(params)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    console.error('加载日志审核列表失败:', err)
  } finally {
    loading.value = false
  }
}
setLoadFn(loadData)

// =========== 搜索/重置 ===========
const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const handleReset = () => {
  searchModel.department = ''
  searchModel.submitter = ''
  searchModel.summaryType = ''
  searchModel.auditStatus = ''
  searchModel.submitDate = ''
  searchModel.keyword = ''
  currentPage.value = 1
  loadData()
}

// =========== 操作：详情 / 通过 / 驳回 ===========
const handleView = (row: WorkLogItem) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleAudit = async (row: WorkLogItem, type: WorkAuditResult) => {
  if (!canAudit(row)) {
    ElMessage.warning('当前状态不可审核')
    return
  }
  const confirmText = type === 'passed' ? '通过' : '驳回'
  try {
    await ElMessageBox.confirm(
      `确定${confirmText}审核「${row.title}」吗？`,
      `${confirmText}确认`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: type === 'passed' ? 'success' : 'warning',
      }
    )
  } catch {
    return
  }
  dialogMode.value = 'audit'
  dialogAuditType.value = type
  currentRecord.value = row
  dialogVisible.value = true
}

const handleBatchApprove = async (type: WorkAuditResult) => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要审核的记录')
    return
  }
  const confirmText = type === 'passed' ? '通过' : '驳回'
  try {
    await ElMessageBox.confirm(
      `确定批量${confirmText}选中的 ${selectedRows.value.length} 条记录吗？（已通过/已驳回的记录会自动跳过）`,
      `批量${confirmText}确认`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: type === 'passed' ? 'success' : 'warning',
      }
    )
  } catch {
    return
  }
  try {
    loading.value = true
    const ids = selectedRows.value.map((r) => r.id)
    const res = await batchAuditWorkLog(ids, {
      auditor: CURRENT_AUDITOR,
      auditResult: type,
      auditOpinion: `批量${confirmText}`,
    })
    if (res.data.failed.length > 0) {
      ElMessage.warning(`${confirmText}成功 ${res.data.success} 条，${res.data.failed.length} 条处理失败`)
    } else {
      ElMessage.success(`成功${confirmText} ${res.data.success} 条记录`)
    }
    selectedRows.value = []
    loadData()
  } catch (err) {
    console.error(err)
    ElMessage.error(`${confirmText}失败`)
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (rows: WorkLogItem[]) => {
  selectedRows.value = rows
}

const handleSuccess = () => {
  loadData()
}

const handleAuditSuccess = () => {
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.work-log-audit-list {
  display: flex;
  flex-direction: column;
  padding: 16px;
  height: calc(100vh - 100px);
  overflow: hidden;

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

.title-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}
</style>
