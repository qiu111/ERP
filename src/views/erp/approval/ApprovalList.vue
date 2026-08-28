<template>
  <div class="approval-list-page">
    <SearchBar
      :fields="searchFields"
      v-model="searchModel"
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #extra>
        <el-button
          :color="'#ffbc00'"
          @click="handleAddSelectCategory"
        >
          <el-icon><Plus /></el-icon>
          新增
        </el-button>
      </template>
    </SearchBar>

    <!-- 表格 -->
    <div class="approval-list-page__table-wrap">
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
        <template #column-approvalAmount="{ row }">
          <span class="amount-text">
            {{ formatAmount(row.approvalAmount) }}
          </span>
        </template>

        <template #column-category="{ row }">
          <el-tag :type="getCategoryTagType(row.category)" effect="light" size="small">
            {{ getCategoryLabel(row.category) }}
          </el-tag>
        </template>

        <template #column-lastResult="{ row }">
          <el-tag
            v-if="row.lastResult !== '-'"
            :type="resultTagTypeMap[row.lastResult]"
            effect="light"
            size="small"
          >
            {{ row.lastResult }}
          </el-tag>
          <span v-else class="dash-text">-</span>
        </template>

        <template #column-status="{ row }">
          <el-tag
            :type="statusTagTypeMap[row.status]"
            effect="light"
            size="small"
          >
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>

        <template #operation="{ row }">
          <el-button
            type="primary"
            link
            size="small"
            @click="handleView(row)"
          >
            详情
          </el-button>
          <template v-if="row.status === 'initiated'">
            <el-button
              type="warning"
              link
              size="small"
              @click="handleEdit(row)"
            >
              编辑
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
        </template>
      </CommonTable>
    </div>

    <!-- 新增：选择分类弹框 -->
    <el-dialog
      v-model="categorySelectVisible"
      title="请选择新增审批的分类"
      width="420px"
      :close-on-click-modal="false"
      top="20vh"
    >
      <el-radio-group v-model="newCategory" class="category-radio-group">
        <el-radio
          v-for="opt in categoryOptions"
          :key="opt.value"
          :value="opt.value"
          border
          class="category-radio-item"
        >
          {{ opt.label }}
        </el-radio>
      </el-radio-group>
      <template #footer>
        <el-button @click="categorySelectVisible = false">取消</el-button>
        <el-button
          type="primary"
          :disabled="!newCategory"
          @click="confirmAddCategory"
        >
          确认
        </el-button>
      </template>
    </el-dialog>

    <!-- 统一弹框：新增/编辑/查看 -->
    <ApprovalFormDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :category="dialogCategory"
      :record="currentRecord"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import ApprovalFormDialog from './ApprovalFormDialog.vue'
import useListPage from '@/composables/useListPage'
import {
  getApprovalListPage,
  deleteApproval,
  getCategoryLabel,
  getStatusLabel,
  statusTagTypeMap,
  resultTagTypeMap,
  categoryOptions,
  initiatorOptions,
  type ApprovalList,
  type ApprovalCategory,
} from '@/mock/approvalList'

const tableData = ref<ApprovalList[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('view')
const dialogCategory = ref<ApprovalCategory>('expense')
const currentRecord = ref<ApprovalList | null>(null)

// 新增用的分类选择
const categorySelectVisible = ref(false)
const newCategory = ref<ApprovalCategory | ''>('')

const searchModel = reactive<Record<string, any>>({
  orderNo: '',
  category: '',
  initiator: '',
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
    label: '订单编号:',
    type: 'input',
    placeholder: '请输入订单编号',
  },
  {
    prop: 'category',
    label: '分类:',
    type: 'select',
    placeholder: '请选择',
    options: categoryOptions,
  },
  {
    prop: 'initiator',
    label: '发起人:',
    type: 'select',
    placeholder: '请选择',
    options: initiatorOptions,
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '编号', width: 90 },
  { prop: 'orderNo', label: '订单编号', minWidth: 190 },
  { prop: 'companyName', label: '公司名', minWidth: 160 },
  { prop: 'payee', label: '收款人/单位', minWidth: 200 },
  { prop: 'approvalAmount', label: '审批金额', width: 120, align: 'right' },
  { prop: 'currency', label: '币种', width: 80, align: 'center' },
  { prop: 'category', label: '分类', width: 100, align: 'center' },
  { prop: 'status', label: '审批状态', width: 120, align: 'center' },
  { prop: 'currentApprover', label: '审批人', width: 90, align: 'center' },
  { prop: 'lastResult', label: '审批结果', width: 100, align: 'center' },
  { prop: 'lastOpinion', label: '审批意见', width: 100 },
  { prop: 'initiator', label: '发起人', width: 80, align: 'center' },
  { prop: 'createTime', label: '发起时间', width: 160, align: 'center' },
]

const categoryTagTypeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  sale_order: 'primary',
  purchase_order: 'success',
  expense: 'warning',
  goods_payment: 'danger',
  purchase_contract: 'info',
  refund: 'danger',
  salary: 'success',
}
const getCategoryTagType = (c: string) => (categoryTagTypeMap[c] || 'info')

const formatAmount = (n: number) =>
  n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
      orderNo: searchModel.orderNo || undefined,
      category: searchModel.category || undefined,
      initiator: searchModel.initiator || undefined,
    }
    const res = await getApprovalListPage(params)
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
  searchModel.orderNo = ''
  searchModel.category = ''
  searchModel.initiator = ''
  currentPage.value = 1
  loadData()
}

const handleAddSelectCategory = () => {
  newCategory.value = ''
  categorySelectVisible.value = true
}

const confirmAddCategory = () => {
  if (!newCategory.value) return
  categorySelectVisible.value = false
  dialogMode.value = 'add'
  dialogCategory.value = newCategory.value
  currentRecord.value = null
  dialogVisible.value = true
}

const handleView = (row: ApprovalList) => {
  dialogMode.value = 'view'
  dialogCategory.value = row.category
  currentRecord.value = row
  dialogVisible.value = true
}

const handleEdit = (row: ApprovalList) => {
  if (row.status !== 'initiated') {
    ElMessage.warning('仅当前页面发起状态的记录可编辑')
    return
  }
  dialogMode.value = 'edit'
  dialogCategory.value = row.category
  currentRecord.value = row
  dialogVisible.value = true
}

const handleDelete = async (row: ApprovalList) => {
  if (row.status !== 'initiated') {
    ElMessage.warning('仅当前页面发起状态的记录可删除')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定删除审批记录「${row.orderNo}」吗？删除后无法恢复`,
      '删除确认',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
  } catch {
    return
  }
  try {
    loading.value = true
    await deleteApproval(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (err: any) {
    ElMessage.error(err.message || '删除失败')
  } finally {
    loading.value = false
  }
}

const handleDialogSuccess = () => {
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.approval-list-page {
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

.amount-text {
  font-weight: 600;
  color: #f56c6c;
  font-size: 13px;
}

.dash-text { color: #c0c4cc; }

.category-radio-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 8px 0;
}

.category-radio-item {
  margin-right: 0 !important;
  padding: 10px 12px;
}
</style>
