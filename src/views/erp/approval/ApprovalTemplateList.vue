<template>
  <div class="approval-template-page">
    <SearchBar
      :fields="searchFields"
      v-model="searchModel"
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #extra>
        <el-button :color="'#ffbc00'" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增模板
        </el-button>
      </template>
    </SearchBar>

    <div class="approval-template-page__table-wrap">
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
        <template #column-category="{ row }">
          <el-tag type="primary" effect="light" size="small">{{ getCategoryLabel(row.category) }}</el-tag>
        </template>

        <template #column-applicableRoles="{ row }">
          <el-tag
            v-for="(r, i) in displayRoles(row.applicableRoles)"
            :key="i"
            :type="(i % 3 === 0) ? 'warning' : (i % 3 === 1 ? 'info' : 'success')"
            effect="plain"
            size="small"
            style="margin: 2px"
          >{{ r }}</el-tag>
        </template>

        <template #column-amountRange="{ row }">
          <span class="amount-range-text">
            ¥{{ formatAmount(row.amountRange.min) }} ～ ¥{{ row.amountRange.max === 99999999 ? '不限' : formatAmount(row.amountRange.max) }}
          </span>
        </template>

        <template #column-stepCount="{ row }">
          <el-tag type="danger" effect="dark" size="small">
            {{ row.steps.length }} 步
          </el-tag>
        </template>

        <template #column-status="{ row }">
          <el-tag
            :type="statusTagTypeMap[row.status]"
            effect="light"
            size="small"
          >{{ getStatusLabel(row.status) }}</el-tag>
        </template>

        <template #operation="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">详情</el-button>
          <el-button type="warning" link size="small" @click="handleEdit(row)">编辑</el-button>
          <el-switch
            v-model="row.status"
            :active-value="'enabled'"
            :inactive-value="'disabled'"
            size="small"
            inline-prompt
            active-text="启用"
            inactive-text="禁用"
            style="margin-right: 8px"
            @change="(v: any) => handleSwitchStatus(row, v)"
          />
          <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </CommonTable>
    </div>

    <!-- 弹框：新增/编辑/详情 -->
    <ApprovalTemplateDialog
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
import ApprovalTemplateDialog from './ApprovalTemplateDialog.vue'
import {
  getApprovalTemplatePage,
  deleteApprovalTemplate,
  switchApprovalTemplateStatus,
  getCategoryLabel,
  getStatusLabel,
  templateCategoryOptions,
  templateStatusOptions,
  statusTagTypeMap,
  type ApprovalTemplate,
  type TemplateCategory,
  type TemplateStatus,
} from '@/mock/approvalTemplate'

const tableData = ref<ApprovalTemplate[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<ApprovalTemplate | null>(null)

const searchModel = reactive<Record<string, any>>({
  category: '' as TemplateCategory | '',
  status: '' as TemplateStatus | '',
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
    label: '模板名称:',
    type: 'input',
    placeholder: '搜索模板名称/编号/描述',
  },
  {
    prop: 'category',
    label: '适用分类:',
    type: 'select',
    placeholder: '请选择',
    options: templateCategoryOptions,
  },
  {
    prop: 'status',
    label: '状态:',
    type: 'select',
    placeholder: '请选择',
    options: templateStatusOptions,
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '模板编号', width: 120, align: 'center' },
  { prop: 'name', label: '模板名称', minWidth: 260 },
  { prop: 'category', label: '适用分类', width: 110, align: 'center' },
  { prop: 'applicableRoles', label: '适用角色', minWidth: 180 },
  { prop: 'amountRange', label: '金额区间', width: 240, align: 'center' },
  { prop: 'stepCount', label: '步骤数', width: 100, align: 'center' },
  { prop: 'status', label: '状态', width: 100, align: 'center' },
  { prop: 'creator', label: '创建人', width: 110, align: 'center' },
  { prop: 'createTime', label: '创建时间', width: 170, align: 'center' },
  { prop: 'updateTime', label: '更新时间', width: 170, align: 'center' },
]

const displayRoles = (roles: string[]) => {
  if (!roles || roles.length === 0) return ['-']
  if (roles.includes('*')) return ['全部角色']
  return roles
}

const formatAmount = (n: number) =>
  n.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
      category: searchModel.category || undefined,
      status: searchModel.status || undefined,
      keyword: searchModel.keyword || undefined,
    }
    const res = await getApprovalTemplatePage(params)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}
setLoadFn(loadData)

const handleSearch = () => { currentPage.value = 1; loadData() }
const handleReset = () => {
  searchModel.category = ''
  searchModel.status = ''
  searchModel.keyword = ''
  currentPage.value = 1
  loadData()
}

const handleAdd = () => {
  dialogMode.value = 'add'
  currentRecord.value = null
  dialogVisible.value = true
}
const handleEdit = (row: ApprovalTemplate) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleView = (row: ApprovalTemplate) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleSwitchStatus = async (row: ApprovalTemplate, status: TemplateStatus) => {
  const label = status === 'enabled' ? '启用' : '禁用'
  const res = await switchApprovalTemplateStatus(row.id, status)
  if (res.code === 200 && res.data?.id) {
    ElMessage.success(`${label}成功`)
  } else {
    // 回滚
    row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
    ElMessage.error(`${label}失败`)
  }
}

const handleDelete = async (row: ApprovalTemplate) => {
  try {
    await ElMessageBox.confirm(
      `确定删除模板「${row.code} / ${row.name}」吗？删除后不可恢复。`,
      '模板删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
    )
    const res = await deleteApprovalTemplate(row.id)
    if (res.code === 200 && res.data) {
      ElMessage.success('删除成功')
      loadData()
    } else {
      ElMessage.error('删除失败')
    }
  } catch { /* cancel */ }
}

const handleSuccess = () => { loadData() }

onMounted(() => { loadData() })
</script>

<style scoped lang="scss">
.approval-template-page {
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
.amount-range-text {
  color: #606266;
  font-size: 13px;
}
</style>
