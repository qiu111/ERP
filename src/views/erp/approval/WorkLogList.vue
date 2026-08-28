<template>
  <div class="work-log-page">
    <!-- 页面标题与面包屑（与截图"工作日志"一致） -->
    <div class="page-header-block" style="display: none"></div>

    <SearchBar
      :fields="searchFields"
      v-model="searchModel"
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #extra>
        <el-button
          :color="'#ffbc00'"
          @click="handleAdd"
        >
          <el-icon><Plus /></el-icon>
          添加
        </el-button>
      </template>
    </SearchBar>

    <div class="work-log-page__table-wrap">
      <CommonTable
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
        <template #column-summaryType="{ row }">
          <el-tag type="info" effect="light" size="small">
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
          <span v-if="row.auditor !== '-'">{{ row.auditor }}</span>
          <span v-else class="dash-text">-</span>
        </template>

        <template #operation="{ row }">
          <el-button type="success" link size="small" @click="handleView(row)">
            详情
          </el-button>
          <el-button
            v-if="row.auditStatus === 'pending'"
            type="primary"
            link
            size="small"
            @click="handleEdit(row)"
          >
            编辑
          </el-button>
          <el-button
            v-if="row.auditStatus === 'pending'"
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

    <!-- 新增/编辑/详情 弹框 -->
    <WorkLogDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import useListPage from '@/composables/useListPage'
import WorkLogDialog from './WorkLogDialog.vue'
import {
  getWorkLogPage,
  deleteWorkLog,
  getSummaryTypeLabel,
  getAuditStatusLabel,
  summaryTypeOptions,
  auditStatusOptions,
  auditStatusTagTypeMap,
  type WorkLogItem,
  type WorkSummaryType,
  type WorkAuditStatus,
} from '@/mock/workLog'

const tableData = ref<WorkLogItem[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<WorkLogItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  summaryType: '' as WorkSummaryType | '',
  auditStatus: '' as WorkAuditStatus | '',
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
    prop: 'summaryType',
    label: '总结类型:',
    type: 'select',
    placeholder: '请选择',
    options: summaryTypeOptions,
  },
  {
    prop: 'auditStatus',
    label: '审核状态:',
    type: 'select',
    placeholder: '请选择',
    options: auditStatusOptions,
  },
  {
    prop: 'submitDate',
    label: '提交日期:',
    type: 'date',
    placeholder: '选择日期',
  },
  {
    prop: 'keyword',
    label: '关键词:',
    type: 'input',
    placeholder: '搜索标题及内容信息',
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '编号', width: 80, align: 'center' },
  { prop: 'title', label: '标题', minWidth: 260 },
  { prop: 'summaryType', label: '总结类型', width: 110, align: 'center' },
  { prop: 'submitter', label: '提交人', width: 110, align: 'center' },
  { prop: 'submitTime', label: '提交时间', width: 170, align: 'center' },
  { prop: 'auditStatus', label: '审核状态', width: 100, align: 'center' },
  { prop: 'auditor', label: '审核人', width: 110, align: 'center' },
]

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
      summaryType: searchModel.summaryType || undefined,
      auditStatus: searchModel.auditStatus || undefined,
      submitDate: searchModel.submitDate || undefined,
      keyword: searchModel.keyword || undefined,
    }
    const res = await getWorkLogPage(params)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    console.error(err)
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
  searchModel.summaryType = ''
  searchModel.auditStatus = ''
  searchModel.submitDate = ''
  searchModel.keyword = ''
  currentPage.value = 1
  loadData()
}

const handleAdd = () => {
  dialogMode.value = 'add'
  currentRecord.value = null
  dialogVisible.value = true
}
const handleEdit = (row: WorkLogItem) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleView = (row: WorkLogItem) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleDelete = async (row: WorkLogItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除编号为「${row.code}」的工作日志吗？`,
      '删除确认',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    const res = await deleteWorkLog(row.id)
    if (res.code === 200 && res.data) {
      ElMessage.success('删除成功')
      loadData()
    } else {
      ElMessage.error('删除失败')
    }
  } catch {
    /* cancel */
  }
}

const handleSuccess = () => {
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.work-log-page {
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
    margin-top: 16px;
  }
}
.dash-text { color: #c0c4cc; }
</style>
