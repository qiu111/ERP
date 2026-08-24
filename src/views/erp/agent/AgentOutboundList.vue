<template>
  <div class="agent-outbound-list">
    <SearchBar
      title="代理商出库单"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      add-permission="erp_agent_outbound:add"
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    />

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
          :style="{ color: outboundStatusMap[row.status]?.color || '#909399' }"
        >
          {{ outboundStatusMap[row.status]?.text || row.status }}
        </span>
      </template>

      <template #column-costAmountTotal="{ row }">
        <span class="amount">¥{{ Number(row.costAmountTotal).toFixed(2) }}</span>
      </template>

      <template #operation="{ row }">
        <el-button
          v-if="has('erp_agent_outbound:edit') && row.status === 'draft'"
          type="primary"
          link
          size="small"
          @click="handleEdit(row)"
        >
          编辑
        </el-button>
        <el-button
          v-if="has('erp_agent_outbound:view')"
          type="info"
          link
          size="small"
          @click="handleView(row)"
        >
          查看
        </el-button>
        <el-button
          v-if="has('erp_agent_outbound:delete') && row.status === 'draft'"
          type="danger"
          link
          size="small"
          @click="handleDelete(row)"
        >
          删除
        </el-button>
      </template>
    </CommonTable>

    <AgentOutboundDialog
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
import AgentOutboundDialog from './AgentOutboundDialog.vue'
import {
  queryAgentOutbounds,
  deleteAgentOutbound,
  outboundStatusOptions,
  outboundStatusMap,
  operationCenterOptions,
  logisticsCompanyOptions,
  operatorOptions,
} from '@/mock/agentOutbound'
import type { AgentOutbound } from '@/mock/agentOutbound'

const { has } = usePermission()
const loading = ref(false)
const tableData = ref<AgentOutbound[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<AgentOutbound | null>(null)

let searchModel = reactive<Record<string, any>>({
  orderNo: '',
  status: '',
  createDate: '',
  operationCenter: '',
  logisticsCompany: '',
  operator: '',
})

const searchFields: SearchField[] = [
  { prop: 'orderNo', label: '单据编号', type: 'input', placeholder: '请输入单据编号' },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择',
    options: outboundStatusOptions,
  },
  {
    prop: 'createDate',
    label: '时间',
    type: 'date',
    placeholder: '选择日期',
  },
  {
    prop: 'operationCenter',
    label: '运营中心',
    type: 'select',
    placeholder: '请选择',
    options: operationCenterOptions,
  },
  {
    prop: 'logisticsCompany',
    label: '物流厂家',
    type: 'select',
    placeholder: '选择',
    options: logisticsCompanyOptions,
  },
  {
    prop: 'operator',
    label: '操作员',
    type: 'select',
    placeholder: '请选择',
    options: operatorOptions,
  },
]

const columns: TableColumn[] = [
  { prop: 'index', label: '序号', width: 60, align: 'center' },
  { prop: 'orderNo', label: '单号', width: 160, align: 'center' },
  { prop: 'operationCenter', label: '运营中心', width: 160 },
  { prop: 'trackingNo', label: '物流单号', width: 200 },
  { prop: 'logisticsCompany', label: '物流厂家', width: 120 },
  { prop: 'costAmountTotal', label: '成本价金额', width: 130, align: 'right' },
  { prop: 'status', label: '状态', width: 90, align: 'center' },
  { prop: 'operator', label: '操作员', width: 100 },
  { prop: 'operateDate', label: '操作日期', width: 120, align: 'center' },
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await queryAgentOutbounds({
      page: currentPage.value,
      pageSize: pageSize.value,
      orderNo: searchModel.orderNo || undefined,
      status: searchModel.status || undefined,
      operationCenter: searchModel.operationCenter || undefined,
      logisticsCompany: searchModel.logisticsCompany || undefined,
      operator: searchModel.operator || undefined,
      createDate: searchModel.createDate || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (err) {
    console.error('加载代理商出库单列表失败:', err)
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
  searchModel.status = ''
  searchModel.createDate = ''
  searchModel.operationCenter = ''
  searchModel.logisticsCompany = ''
  searchModel.operator = ''
  currentPage.value = 1
  loadData()
}

const handleAdd = () => {
  dialogMode.value = 'add'
  currentRecord.value = null
  dialogVisible.value = true
}

const handleEdit = (row: AgentOutbound) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleView = (row: AgentOutbound) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}

const handleDelete = async (row: AgentOutbound) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除代理商出库单「${row.orderNo}」吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    await deleteAgentOutbound(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.agent-outbound-list {
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
