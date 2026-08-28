<template>
  <div class="recruit-list">
    <SearchBar
      title="招聘管理"
      :fields="searchFields"
      v-model="searchModel"
      show-add
      @add="handleAdd"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="recruit-list__table-wrap">
      <CommonTable
        v-loading="loading"
        :columns="columns"
        :data="tableData"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        :row-key="'id'"
        height="100%"
        :operation-width="340"
        @page-change="handlePageChange"
        @page-size-change="handleSizeChange"
      >
        <template #column-status="{ row }">
          <el-tag :type="recruitStatusTagTypeMap[(row as RecruitItem).status]" effect="light" size="small">
            {{ getRecruitStatusLabel((row as RecruitItem).status) }}
          </el-tag>
        </template>

        <template #operation="{ row }">
          <el-button type="success" link size="small" @click="handleView(row)">
            <el-icon><View /></el-icon>
            详情
          </el-button>
          <!-- 待面试：编辑/推进/删除 -->
          <template v-if="(row as RecruitItem).status === 'pending'">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="primary" link size="small" @click="handleAdvance(row, 'interviewed')">
              <el-icon><Promotion /></el-icon>
              推进面试
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
          <!-- 已面试：面试通过/淘汰 -->
          <template v-else-if="(row as RecruitItem).status === 'interviewed'">
            <el-button type="success" link size="small" @click="handleAudit(row, 'pass')">
              <el-icon><Check /></el-icon>
              面试通过
            </el-button>
            <el-button type="warning" link size="small" @click="handleAudit(row, 'reject')">
              <el-icon><Close /></el-icon>
              面试淘汰
            </el-button>
          </template>
          <!-- 已录用：办理入职 -->
          <template v-else-if="(row as RecruitItem).status === 'offered'">
            <el-button type="success" link size="small" @click="handleAdvance(row, 'onboarded')">
              <el-icon><CircleCheck /></el-icon>
              办理入职
            </el-button>
          </template>
        </template>
      </CommonTable>
    </div>

    <RecruitDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :record="currentRecord"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { View, Edit, Delete, Check, Close, Promotion, CircleCheck } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import useListPage from '@/composables/useListPage'
import RecruitDialog from './RecruitDialog.vue'
import {
  getRecruitPage,
  deleteRecruit,
  advanceRecruit,
  auditInterview,
  getRecruitPositionNameOptions,
  getRecruitSourceOptions,
  recruitStatusOptions,
  getRecruitStatusLabel,
  recruitStatusTagTypeMap,
  type RecruitItem,
  type RecruitStatus,
} from '@/mock/hr'

const tableData = ref<RecruitItem[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentRecord = ref<RecruitItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  status: '' as RecruitStatus | '',
  positionName: '',
  recruitSource: '',
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
    options: recruitStatusOptions,
  },
  {
    prop: 'positionName',
    label: '应聘岗位:',
    type: 'select',
    placeholder: '请选择',
    options: getRecruitPositionNameOptions(),
  },
  {
    prop: 'recruitSource',
    label: '招聘来源:',
    type: 'select',
    placeholder: '请选择',
    options: getRecruitSourceOptions(),
  },
  {
    prop: 'keyword',
    label: '关键字查询:',
    type: 'input',
    placeholder: '候选人/岗位/备注',
  },
]

const columns: TableColumn[] = [
  { prop: 'code', label: '编号', width: 80, align: 'center' },
  { prop: 'positionName', label: '应聘岗位', minWidth: 150 },
  { prop: 'candidateName', label: '候选人', width: 100, align: 'center' },
  { prop: 'recruitSource', label: '招聘来源', width: 120, align: 'center' },
  { prop: 'phone', label: '联系电话', width: 130, align: 'center' },
  { prop: 'interviewDate', label: '面试日期', width: 120, align: 'center' },
  { prop: 'status', label: '状态', width: 100, align: 'center', slot: true },
  { prop: 'remark', label: '备注', minWidth: 180 },
  { prop: 'createTime', label: '创建时间', width: 160, align: 'center' },
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await getRecruitPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      status: (searchModel.status || undefined) as RecruitStatus | undefined,
      positionName: searchModel.positionName || undefined,
      recruitSource: searchModel.recruitSource || undefined,
      keyword: searchModel.keyword || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error('加载招聘列表失败:', e)
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
  searchModel.positionName = ''
  searchModel.recruitSource = ''
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
const handleView = (row: RecruitItem) => {
  dialogMode.value = 'view'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleEdit = (row: RecruitItem) => {
  dialogMode.value = 'edit'
  currentRecord.value = row
  dialogVisible.value = true
}
const handleAdvance = async (row: RecruitItem, stage: RecruitStatus) => {
  const label = getRecruitStatusLabel(stage)
  try {
    await ElMessageBox.confirm(`确定将招聘单「${row.code}」推进至「${label}」吗？`, '推进确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await advanceRecruit(row.id, stage)
  if (res.code === 200 && res.data && res.data.id && res.data.status === stage) {
    ElMessage.success(`已推进至「${label}」`)
    loadData()
  } else {
    ElMessage.error('推进失败')
  }
}
const handleAudit = async (row: RecruitItem, result: 'pass' | 'reject') => {
  const action = result === 'pass' ? '面试通过' : '面试淘汰'
  try {
    await ElMessageBox.confirm(`确定对招聘单「${row.code}」执行${action}吗？`, '面试结果确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await auditInterview(row.id, result)
  if (res.code === 200 && res.data && res.data.id) {
    ElMessage.success(`${action}成功`)
    loadData()
  } else {
    ElMessage.error(`${action}失败`)
  }
}
const handleDelete = async (row: RecruitItem) => {
  try {
    await ElMessageBox.confirm(`确定删除招聘单「${row.code}」吗？删除后无法恢复`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = await deleteRecruit(row.id)
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
.recruit-list {
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
