<template>
  <el-row class="handover-page" :gutter="12">
    <!-- 左侧分类面板 -->
    <el-col :span="4" class="handover-page__left">
      <div class="handover-nav">
        <div class="handover-nav__header">
          <el-icon><SwitchButton /></el-icon>
          <span>工作交接管理</span>
        </div>
        <el-menu :default-active="activeType" class="handover-nav__menu" @select="handleTypeSelect">
          <el-menu-item index="">
            <span>全部交接</span>
          </el-menu-item>
          <el-menu-item v-for="opt in handoverTypeOptions" :key="opt.value" :index="opt.value">
            <span>{{ opt.label }}</span>
          </el-menu-item>
        </el-menu>
      </div>
    </el-col>

    <!-- 右侧列表 -->
    <el-col :span="20" class="handover-page__right">
      <div class="handover-list">
        <SearchBar
          title="列表"
          :fields="searchFields"
          v-model="searchModel"
          show-add
          @add="handleAdd"
          @search="handleSearch"
          @reset="handleReset"
        />

        <div class="handover-list__table-wrap">
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
            <template #column-type="{ row }">
              <el-tag :type="row.type === 'resign' ? 'danger' : 'primary'" effect="plain" size="small">
                {{ getTypeLabel(row.type) }}
              </el-tag>
            </template>

            <template #column-status="{ row }">
              <el-tag :type="handoverStatusTagTypeMap[row.status as HandoverStatus]" effect="light" size="small">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>

            <template #operation="{ row }">
              <el-button type="warning" link size="small" @click="handleView(row)">
                <el-icon><View /></el-icon>
                详情
              </el-button>
              <el-button
                v-if="row.status === 'pending'"
                type="primary"
                link
                size="small"
                @click="handleEdit(row)"
              >
                <el-icon><Edit /></el-icon>
                修改
              </el-button>
              <el-button
                v-if="row.status === 'pending'"
                type="success"
                link
                size="small"
                @click="handleStart(row)"
              >
                开始交接
              </el-button>
              <el-button
                v-if="row.status === 'in_progress'"
                type="success"
                link
                size="small"
                @click="handleComplete(row)"
              >
                完成交接
              </el-button>
              <el-button
                v-if="row.status === 'pending' || row.status === 'in_progress'"
                type="info"
                link
                size="small"
                @click="handleCancel(row)"
              >
                作废
              </el-button>
              <el-button
                v-if="row.status === 'pending' || row.status === 'cancelled'"
                type="danger"
                link
                size="small"
                @click="handleDelete(row)"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </CommonTable>
        </div>
      </div>
    </el-col>

    <HandoverDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      @success="loadData"
    />
  </el-row>
</template>

<script setup lang="ts">
import { View, Edit, Delete, SwitchButton } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import HandoverDialog from './HandoverDialog.vue'
import useListPage from '@/composables/useListPage'
import {
  getHandoverPage,
  deleteHandover,
  startHandover,
  completeHandover,
  cancelHandover,
  handoverTypeOptions,
  handoverStatusOptions,
  handoverStatusTagTypeMap,
  type HandoverItem,
  type HandoverType,
  type HandoverStatus,
} from '@/mock/workHandover'

const tableData = ref<HandoverItem[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<HandoverItem | null>(null)

/** 左侧面板选中分类（''=全部） */
const activeType = ref<HandoverType | ''>('')

const searchModel = reactive<Record<string, any>>({
  status: '',
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
    options: handoverStatusOptions,
  },
  {
    prop: 'keyword',
    label: '关键字:',
    type: 'input',
    placeholder: '单号/主题/人员',
  },
]

const columns: TableColumn[] = [
  { prop: 'handoverNo', label: '交接单号', width: 140, align: 'center' },
  { prop: 'subject', label: '交接主题', minWidth: 240 },
  { prop: 'type', label: '交接类型', width: 120, align: 'center', slot: true },
  { prop: 'handoverPerson', label: '交接人', width: 110, align: 'center' },
  { prop: 'receiver', label: '接收人', width: 110, align: 'center' },
  { prop: 'supervisor', label: '监督人', width: 110, align: 'center' },
  { prop: 'handoverTime', label: '交接时间', width: 160, align: 'center' },
  { prop: 'status', label: '状态', width: 100, align: 'center', slot: true },
]

function getTypeLabel(type: HandoverType): string {
  return handoverTypeOptions.find((o) => o.value === type)?.label || type
}
function getStatusLabel(status: HandoverStatus): string {
  return handoverStatusOptions.find((o) => o.value === status)?.label || status
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getHandoverPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      type: activeType.value || undefined,
      status: searchModel.status || undefined,
      keyword: searchModel.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载工作交接列表失败:', e)
  } finally {
    loading.value = false
  }
}
setLoadFn(loadData)

// ========== 左侧分类切换 ==========
const handleTypeSelect = (index: string) => {
  activeType.value = (index || '') as HandoverType | ''
  currentPage.value = 1
  loadData()
}

// ========== 搜索/重置 ==========
const handleSearch = () => {
  currentPage.value = 1
  loadData()
}
const handleReset = () => {
  searchModel.status = ''
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
const handleView = (row: HandoverItem) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleEdit = (row: HandoverItem) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleStart = async (row: HandoverItem) => {
  try {
    await ElMessageBox.confirm(`确认开始执行交接单「${row.handoverNo}」吗？`, '开始交接', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'info',
    })
  } catch {
    return
  }
  const res = await startHandover(row.id)
  if (res.code === 200 && res.data.id) {
    ElMessage.success('已开始交接')
    loadData()
  } else ElMessage.error('操作失败')
}
const handleComplete = async (row: HandoverItem) => {
  try {
    await ElMessageBox.confirm(`确认完成交接单「${row.handoverNo}」吗？`, '完成交接', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'success',
    })
  } catch {
    return
  }
  const res = await completeHandover(row.id)
  if (res.code === 200 && res.data.id) {
    ElMessage.success('交接已完成')
    loadData()
  } else ElMessage.error('操作失败')
}
const handleCancel = async (row: HandoverItem) => {
  try {
    await ElMessageBox.confirm(`确认作废交接单「${row.handoverNo}」吗？`, '作废确认', {
      confirmButtonText: '作废',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await cancelHandover(row.id)
  if (res.code === 200 && res.data.id) {
    ElMessage.success('已作废')
    loadData()
  } else ElMessage.error('操作失败')
}
const handleDelete = async (row: HandoverItem) => {
  try {
    await ElMessageBox.confirm(`确定删除交接单「${row.handoverNo}」吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await deleteHandover(row.id)
  if (res.code === 200 && res.data) {
    ElMessage.success('删除成功')
    loadData()
  } else {
    ElMessage.error('删除失败（仅待交接/已作废状态允许删除）')
  }
}

onMounted(() => loadData())
</script>

<style scoped lang="scss">
.handover-page {
  padding: 12px;
  height: calc(100vh - 100px);
  overflow: hidden;

  &__left,
  &__right {
    height: 100%;
    overflow: hidden;
  }
}

.handover-nav {
  height: 100%;
  background: #fff;
  border-radius: 4px;
  overflow: hidden auto;
  display: flex;
  flex-direction: column;

  &__header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 14px 16px;
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    border-bottom: 1px solid #f0f0f0;
  }

  &__menu {
    border-right: none;
    flex: 1;
  }
}

.handover-list {
  height: 100%;
  display: flex;
  flex-direction: column;
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
