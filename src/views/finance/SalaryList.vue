<template>
  <div class="salary-list">
    <SearchBar
      title="工资管理"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="salary-list__table-wrap">
      <CommonTable
        v-loading="loading"
        :columns="columns"
        :data="tableData"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        :row-key="'id'"
        height="100%"
        :operation-width="320"
        @page-change="handlePageChange"
        @page-size-change="handleSizeChange"
      >
        <template #column-baseSalary="{ row }">
          <span class="amount-text">{{ formatAmount((row as SalaryItem).baseSalary) }}</span>
        </template>

        <template #column-bonus="{ row }">
          <span>{{ formatAmount((row as SalaryItem).bonus) }}</span>
        </template>

        <template #column-deduction="{ row }">
          <span>{{ formatAmount((row as SalaryItem).deduction) }}</span>
        </template>

        <template #column-netSalary="{ row }">
          <span class="amount-text">{{ formatAmount((row as SalaryItem).netSalary) }}</span>
        </template>

        <template #column-status="{ row }">
          <el-tag :type="salaryStatusTagTypeMap[(row as SalaryItem).status]" effect="light" size="small">
            {{ salaryStatusLabelMap[(row as SalaryItem).status] }}
          </el-tag>
        </template>

        <template #operation="{ row }">
          <el-button type="success" link size="small" @click="handleView(row)">
            <el-icon><View /></el-icon>
            详情
          </el-button>
          <!-- 仅待发放可编辑/发放/删除 -->
          <template v-if="isPending(row)">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="success" link size="small" @click="handlePay(row)">
              <el-icon><Money /></el-icon>
              发放
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </template>
      </CommonTable>
    </div>

    <SalaryDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { View, Edit, Delete, Money } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import useListPage from '@/composables/useListPage'
import SalaryDialog from './SalaryDialog.vue'
import {
  getSalaryPage,
  deleteSalary,
  paySalary,
  getSalaryMonthOptions,
  salaryStatusOptions,
  salaryStatusLabelMap,
  salaryStatusTagTypeMap,
  type SalaryItem,
  type SalaryStatus,
} from '@/mock/finance'

const formatAmount = (n: number) =>
  (n ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const isPending = (row: SalaryItem) => row.status === 'pending'

function todayStr(): string {
  const n = new Date()
  const pad = (v: number) => (v < 10 ? `0${v}` : `${v}`)
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`
}

const tableData = ref<SalaryItem[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<SalaryItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  status: '' as SalaryStatus | '',
  month: '',
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
    options: salaryStatusOptions,
  },
  {
    prop: 'month',
    label: '工资月份:',
    type: 'select',
    placeholder: '请选择',
    options: getSalaryMonthOptions(),
  },
  {
    prop: 'keyword',
    label: '关键字查询:',
    type: 'input',
    placeholder: '单号/员工/备注',
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '工资单号', width: 100, align: 'center' },
  { prop: 'employeeName', label: '员工姓名', width: 110, align: 'center' },
  { prop: 'month', label: '工资月份', width: 110, align: 'center' },
  { prop: 'baseSalary', label: '基本工资(元)', width: 130, align: 'right', slot: true },
  { prop: 'bonus', label: '奖金(元)', width: 110, align: 'right', slot: true },
  { prop: 'deduction', label: '扣款(元)', width: 110, align: 'right', slot: true },
  { prop: 'netSalary', label: '应发工资(元)', width: 130, align: 'right', slot: true },
  { prop: 'status', label: '状态', width: 100, align: 'center', slot: true },
  { prop: 'payDate', label: '发放日期', width: 120, align: 'center' },
  { prop: 'remark', label: '备注', minWidth: 160 },
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await getSalaryPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      status: (searchModel.status || undefined) as SalaryStatus | undefined,
      month: searchModel.month || undefined,
      keyword: searchModel.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载工资列表失败:', e)
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
  searchModel.month = ''
  searchModel.keyword = ''
  currentPage.value = 1
  loadData()
}

// ========== 操作 ==========
const handleAdd = () => {
  dialogMode.value = 'add'
  currentRecord.value = null
  dialogVisible.value = true
}
const handleView = (row: SalaryItem) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleEdit = (row: SalaryItem) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}
const handlePay = async (row: SalaryItem) => {
  let payDate = ''
  try {
    const { value } = await ElMessageBox.prompt(
      `确定发放工资单「${row.code}」（${row.employeeName} ${row.month}）的工资吗？请输入发放日期`,
      '工资发放',
      {
        confirmButtonText: '确定发放',
        cancelButtonText: '取消',
        inputValue: todayStr(),
        inputPattern: /^\d{4}-\d{2}-\d{2}$/,
        inputErrorMessage: '请输入正确的日期格式（YYYY-MM-DD）',
      }
    )
    payDate = value
  } catch {
    return
  }
  const res = await paySalary(row.id, payDate)
  if (res.code === 200 && res.data && res.data.id) {
    ElMessage.success('工资发放成功')
    loadData()
  } else {
    ElMessage.error('工资发放失败')
  }
}
const handleDelete = async (row: SalaryItem) => {
  try {
    await ElMessageBox.confirm(`确定删除工资单「${row.code}」吗？删除后无法恢复`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await deleteSalary(row.id)
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
.salary-list {
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

.amount-text {
  font-weight: 600;
  color: #303133;
}
</style>
