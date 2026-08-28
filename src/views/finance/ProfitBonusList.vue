<template>
  <div class="profit-bonus-list">
    <SearchBar
      title="利润提成奖励管理"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="profit-bonus-list__table-wrap">
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
        <template #column-profitAmount="{ row }">
          <span>{{ formatAmount((row as ProfitBonusItem).profitAmount) }}</span>
        </template>

        <template #column-bonusAmount="{ row }">
          <span class="amount-text">{{ formatAmount((row as ProfitBonusItem).bonusAmount) }}</span>
        </template>

        <template #column-status="{ row }">
          <el-tag :type="profitBonusStatusTagTypeMap[(row as ProfitBonusItem).status]" effect="light" size="small">
            {{ profitBonusStatusLabelMap[(row as ProfitBonusItem).status] }}
          </el-tag>
        </template>

        <template #operation="{ row }">
          <el-button type="success" link size="small" @click="handleView(row)">
            <el-icon><View /></el-icon>
            详情
          </el-button>
          <!-- 仅待审批可编辑/审批/删除 -->
          <template v-if="isPending(row)">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="success" link size="small" @click="handleApprove(row)">
              <el-icon><Check /></el-icon>
              审批通过
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </template>
      </CommonTable>
    </div>

    <ProfitBonusDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { View, Edit, Delete, Check } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import useListPage from '@/composables/useListPage'
import ProfitBonusDialog from './ProfitBonusDialog.vue'
import {
  getProfitBonusPage,
  deleteProfitBonus,
  approveProfitBonus,
  getProfitBonusPeriodOptions,
  profitBonusStatusOptions,
  profitBonusStatusLabelMap,
  profitBonusStatusTagTypeMap,
  type ProfitBonusItem,
  type ProfitBonusStatus,
} from '@/mock/finance'

const formatAmount = (n: number) =>
  (n ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const isPending = (row: ProfitBonusItem) => row.status === 'pending'

const tableData = ref<ProfitBonusItem[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<ProfitBonusItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  status: '' as ProfitBonusStatus | '',
  period: '',
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
    options: profitBonusStatusOptions,
  },
  {
    prop: 'period',
    label: '提成期间:',
    type: 'select',
    placeholder: '请选择',
    options: getProfitBonusPeriodOptions(),
  },
  {
    prop: 'keyword',
    label: '关键字查询:',
    type: 'input',
    placeholder: '单号/员工/备注',
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '提成单号', width: 100, align: 'center' },
  { prop: 'employeeName', label: '员工姓名', width: 110, align: 'center' },
  { prop: 'period', label: '提成期间', width: 110, align: 'center' },
  { prop: 'profitAmount', label: '利润额(元)', width: 130, align: 'right', slot: true },
  { prop: 'bonusRate', label: '提成比例(%)', width: 110, align: 'right' },
  { prop: 'bonusAmount', label: '提成金额(元)', width: 130, align: 'right', slot: true },
  { prop: 'status', label: '状态', width: 100, align: 'center', slot: true },
  { prop: 'remark', label: '备注', minWidth: 160 },
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await getProfitBonusPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      status: (searchModel.status || undefined) as ProfitBonusStatus | undefined,
      period: searchModel.period || undefined,
      keyword: searchModel.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载利润提成列表失败:', e)
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
  searchModel.period = ''
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
const handleView = (row: ProfitBonusItem) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleEdit = (row: ProfitBonusItem) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleApprove = async (row: ProfitBonusItem) => {
  try {
    await ElMessageBox.confirm(
      `确定对提成单「${row.code}」（${row.employeeName} ${row.period}）执行审批通过吗？`,
      '审批确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
  } catch {
    return
  }
  const res = await approveProfitBonus(row.id)
  if (res.code === 200 && res.data && res.data.id) {
    ElMessage.success('审批通过成功')
    loadData()
  } else {
    ElMessage.error('审批通过失败')
  }
}
const handleDelete = async (row: ProfitBonusItem) => {
  try {
    await ElMessageBox.confirm(`确定删除提成单「${row.code}」吗？删除后无法恢复`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await deleteProfitBonus(row.id)
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
.profit-bonus-list {
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
