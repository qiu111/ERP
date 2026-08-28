<template>
  <div class="opportunity-list">
    <SearchBar
      title="商机管理"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="opportunity-list__table-wrap">
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
        <template #column-amount="{ row }">
          <span>{{ formatAmount(row.amount) }}</span>
        </template>

        <template #column-stage="{ row }">
          <el-tag :type="opportunityStageTagTypeMap[row.stage as OpportunityStage]" effect="light" size="small">
            {{ getOpportunityStageLabel(row.stage as OpportunityStage) }}
          </el-tag>
        </template>

        <template #operation="{ row }">
          <el-button type="success" link size="small" @click="handleView(row)">
            <el-icon><View /></el-icon>
            详情
          </el-button>
          <el-button type="primary" link size="small" @click="handleEdit(row)">
            <el-icon><Edit /></el-icon>
            修改
          </el-button>
          <!-- 推进阶段：仅未成交/未搁置的商机可推进 -->
          <el-dropdown
            v-if="canAdvance(row)"
            trigger="click"
            @command="(cmd) => handleAdvance(row, cmd as OpportunityStage)"
          >
            <el-button type="warning" link size="small">
              <el-icon><Top /></el-icon>
              推进阶段
              <el-icon><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="opt in advanceOptions(row)"
                  :key="opt.value"
                  :command="opt.value"
                >
                  {{ opt.label }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button type="danger" link size="small" @click="handleDelete(row)">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </template>
      </CommonTable>
    </div>

    <OpportunityDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { View, Edit, Delete, ArrowDown, Top } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import OpportunityDialog from './OpportunityDialog.vue'
import useListPage from '@/composables/useListPage'
import {
  getOpportunityPage,
  deleteOpportunity,
  advanceOpportunity,
  opportunityStageOptions,
  ownerOptions,
  getOpportunityStageLabel,
  opportunityStageTagTypeMap,
  type OpportunityItem,
  type OpportunityStage,
} from '@/mock/crm'

/** 阶段推进顺序（lost 可从任意进行中阶段直接搁置） */
const STAGE_ORDER: OpportunityStage[] = ['contact', 'quote', 'negotiate', 'won']

const tableData = ref<OpportunityItem[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<OpportunityItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  stage: '',
  owner: '',
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
    prop: 'stage',
    label: '阶段:',
    type: 'select',
    placeholder: '请选择',
    options: opportunityStageOptions,
  },
  {
    prop: 'owner',
    label: '负责人:',
    type: 'select',
    placeholder: '请选择',
    options: ownerOptions,
  },
  {
    prop: 'keyword',
    label: '关键字查询:',
    type: 'input',
    placeholder: '商机名称/客户名称',
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '编号', width: 80, align: 'center' },
  { prop: 'name', label: '商机名称', minWidth: 220 },
  { prop: 'customerName', label: '客户名称', minWidth: 180 },
  { prop: 'amount', label: '销售金额', width: 130, align: 'right', slot: true },
  { prop: 'stage', label: '阶段', width: 100, align: 'center', slot: true },
  { prop: 'expectDate', label: '预计成交日期', width: 130, align: 'center' },
  { prop: 'owner', label: '负责人', width: 110, align: 'center' },
  { prop: 'createTime', label: '创建时间', width: 160, align: 'center' },
]

const formatAmount = (v: any): string => {
  const n = Number(v || 0)
  return `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const canAdvance = (row: OpportunityItem): boolean => {
  const stage = row.stage as OpportunityStage
  return stage !== 'won' && stage !== 'lost'
}

const advanceOptions = (row: OpportunityItem): { label: string; value: OpportunityStage }[] => {
  const cur = row.stage as OpportunityStage
  const idx = STAGE_ORDER.indexOf(cur)
  if (idx === -1) return []
  const opts = STAGE_ORDER.slice(idx + 1).map((s) => ({
    label: getOpportunityStageLabel(s),
    value: s,
  }))
  opts.push({ label: getOpportunityStageLabel('lost'), value: 'lost' })
  return opts
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getOpportunityPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      stage: searchModel.stage || undefined,
      owner: searchModel.owner || undefined,
      keyword: searchModel.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载商机列表失败:', e)
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
  searchModel.stage = ''
  searchModel.owner = ''
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
const handleView = (row: OpportunityItem) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleEdit = (row: OpportunityItem) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleAdvance = async (row: OpportunityItem, stage: OpportunityStage) => {
  const res = await advanceOpportunity(row.id, stage)
  if (res.code === 200) {
    ElMessage.success(`商机已推进至「${getOpportunityStageLabel(stage)}」`)
    loadData()
  } else {
    ElMessage.error('推进失败')
  }
}
const handleDelete = async (row: OpportunityItem) => {
  try {
    await ElMessageBox.confirm(`确定删除商机「${row.name}」吗？删除后无法恢复`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await deleteOpportunity(row.id)
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
.opportunity-list {
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
