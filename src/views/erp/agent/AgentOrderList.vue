<template>
  <div class="agent-order-list">
    <SearchBar
      title="代理商要货单"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      add-permission="erp_agent_order:add"
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #extra>
        <el-button
          v-if="has('erp_agent_order:export')"
          :color="'#67c23a'"
          @click="handleExport"
        >
          导出
        </el-button>
      </template>
    </SearchBar>

    <CommonTable
      v-loading="loading"
      :columns="columns"
      :data="tableData"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      :row-key="'id'"
      @page-change="handlePageChange"
      @page-size-change="handleSizeChange"
    >
      <template #column-status="{ row }">
        <span
          class="status-tag"
          :style="{ color: orderStatusMap[row.status]?.color || '#909399' }"
        >
          {{ orderStatusMap[row.status]?.text || row.status }}
        </span>
      </template>

      <template #column-amount="{ row }">
        <span class="amount">¥{{ row.amount.toFixed(2) }}</span>
      </template>

      <template #operation="{ row }">
        <el-button
          v-if="has('erp_agent_order:edit') && row.status === 'draft'"
          type="primary"
          link
          size="small"
          @click="handleEdit(row)"
        >
          编辑
        </el-button>
        <el-button
          v-if="has('erp_agent_order:view')"
          type="info"
          link
          size="small"
          @click="handleView(row)"
        >
          查看
        </el-button>
        <el-button
          v-if="has('erp_agent_order:delete') && row.status === 'draft'"
          type="danger"
          link
          size="small"
          @click="handleDelete(row)"
        >
          删除
        </el-button>
      </template>
    </CommonTable>

    <AgentOrderDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import { usePermission } from '@/composables/usePermission'
import AgentOrderDialog from './AgentOrderDialog.vue'
import {
  getAgentOrderPage,
  deleteAgentOrder,
  orderStatusOptions,
  orderStatusMap,
  operationCenterOptions,
} from '@/mock/agentOrder'
import type { AgentOrder } from '@/mock/agentOrder'

const { has } = usePermission()
const loading = ref(false)
const tableData = ref<AgentOrder[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<AgentOrder | null>(null)

let searchModel = reactive<Record<string, any>>({
  orderNo: '',
  operationCenter: '',
  dateRange: '',
  startDate: '',
  endDate: '',
  status: '',
})

const searchFields: SearchField[] = [
  { prop: 'orderNo', label: '要货单号', type: 'input', placeholder: '请输入要货单号' },
  {
    prop: 'operationCenter',
    label: '运营中心',
    type: 'select',
    placeholder: '请选择',
    options: operationCenterOptions,
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择',
    options: orderStatusOptions,
  },
  {
    prop: 'dateRange',
    label: '时间',
    type: 'daterange',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
  },
]

const columns: TableColumn[] = [
  { prop: 'index', label: '序号', width: 60, align: 'center' },
  { prop: 'orderNo', label: '单号', width: 160, align: 'center' },
  { prop: 'operationCenter', label: '运营中心', width: 160 },
  { prop: 'amount', label: '单据金额', width: 130, align: 'right' },
  { prop: 'status', label: '状态', width: 90, align: 'center' },
  { prop: 'operator', label: '操作员', width: 100 },
  { prop: 'operateDate', label: '操作日期', width: 120, align: 'center' },
]

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
      orderNo: searchModel.orderNo || undefined,
      operationCenter: searchModel.operationCenter || undefined,
      status: searchModel.status || undefined,
    }
    if (searchModel.dateRange && Array.isArray(searchModel.dateRange)) {
      params.startDate = searchModel.dateRange[0] || undefined
      params.endDate = searchModel.dateRange[1] || undefined
    } else if (searchModel.startDate) {
      params.startDate = searchModel.startDate
      params.endDate = searchModel.endDate
    }

    const res = await getAgentOrderPage(params)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    console.error('加载代理商要货单列表失败:', err)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number, size: number) => {
  currentPage.value = page
  pageSize.value = size
  loadData()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadData()
}

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const handleReset = () => {
  searchModel.orderNo = ''
  searchModel.operationCenter = ''
  searchModel.dateRange = ''
  searchModel.startDate = ''
  searchModel.endDate = ''
  searchModel.status = ''
  currentPage.value = 1
  loadData()
}

const handleAdd = () => {
  dialogMode.value = 'add'
  currentRecord.value = null
  dialogVisible.value = true
}

const handleEdit = (row: AgentOrder) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleView = (row: AgentOrder) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleDelete = async (row: AgentOrder) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除代理商要货单「${row.orderNo}」吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    await deleteAgentOrder(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch {
    // 用户取消
  }
}

const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.agent-order-list {
  padding: 20px;
}

.status-tag {
  font-weight: 500;
}

.amount {
  font-weight: 600;
  color: #303133;
}
</style>
