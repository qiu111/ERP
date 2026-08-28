<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="720px"
    top="8vh"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <!-- View 模式：详情描述 -->
    <el-descriptions v-if="props.mode === 'view' && props.record" :column="2" border>
      <el-descriptions-item label="编号">{{ props.record.code }}</el-descriptions-item>
      <el-descriptions-item label="员工姓名">{{ props.record.employeeName }}</el-descriptions-item>
      <el-descriptions-item label="工号">{{ props.record.empNo }}</el-descriptions-item>
      <el-descriptions-item label="所属部门">{{ props.record.deptName }}</el-descriptions-item>
      <el-descriptions-item label="绩效期间">{{ props.record.period }}</el-descriptions-item>
      <el-descriptions-item label="得分">{{ props.record.score }}</el-descriptions-item>
      <el-descriptions-item label="等级">
        <el-tag :type="gradeTagTypeMap[props.record.grade]" effect="light" size="small">
          {{ gradeLabelMap[props.record.grade] }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="绩效奖金(元)">
        {{ formatAmount(props.record.bonus) }}
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="perfStatusTagTypeMap[props.record.status]" effect="light" size="small">
          {{ perfStatusLabelMap[props.record.status] }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">
        {{ props.record.remark || '—' }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间" :span="2">
        {{ props.record.createTime }}
      </el-descriptions-item>
    </el-descriptions>

    <!-- Add / Edit 模式：表单 -->
    <el-form
      v-else
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="right"
      class="staff-perf-form"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="员工姓名" prop="employeeName" required>
            <el-select
              v-model="formData.employeeName"
              placeholder="请选择员工"
              style="width: 100%"
              clearable
              filterable
              @change="handleEmployeeChange"
            >
              <el-option
                v-for="opt in employeeOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属部门" prop="deptName" required>
            <el-input v-model="formData.deptName" placeholder="选择员工后自动带出" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="绩效期间" prop="period" required>
            <el-date-picker
              v-model="formData.period"
              type="month"
              value-format="YYYY-MM"
              placeholder="选择月份"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="得分" prop="score" required>
            <el-input-number
              v-model="formData.score"
              :min="0"
              :max="100"
              :precision="0"
              :controls="false"
              placeholder="0-100"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="等级">
            <el-tag :type="gradeTagTypeMap[previewGrade]" effect="light" size="small">
              {{ gradeLabelMap[previewGrade] }}
            </el-tag>
            <span class="grade-tip">（由得分自动派生）</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="绩效奖金" prop="bonus" required>
            <el-input-number
              v-model="formData.bonus"
              :min="0"
              :precision="2"
              :controls="false"
              placeholder="请输入奖金"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row v-if="props.mode === 'edit' && formData.status" :gutter="20">
        <el-col :span="12">
          <el-form-item label="状态">
            <el-select :model-value="formData.status" disabled style="width: 100%">
              <el-option
                v-for="opt in perfStatusOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          maxlength="225"
          show-word-limit
          placeholder="请输入备注（选填，最多225个字符）"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">
        {{ props.mode === 'view' ? '关闭' : '取消' }}
      </el-button>
      <el-button
        v-if="props.mode !== 'view'"
        type="primary"
        :loading="submitting"
        @click="handleSubmit"
      >
        提交
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import {
  getStaffPerformanceById,
  createStaffPerformance,
  updateStaffPerformance,
  getEmployeeNameOptions,
  getEmployeeMetaByName,
  deriveGrade,
  gradeOptions,
  gradeLabelMap,
  gradeTagTypeMap,
  perfStatusOptions,
  perfStatusLabelMap,
  perfStatusTagTypeMap,
  type StaffPerformanceItem,
  type PerformanceGrade,
  type PerfStatus,
} from '@/mock/hr'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: StaffPerformanceItem | null
}
const props = withDefaults(defineProps<Props>(), { record: null })
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const dialogTitle = computed(() => {
  if (props.mode === 'view') return '人员绩效详情'
  return props.mode === 'edit' ? '人员绩效修改' : '人员绩效添加'
})

const formatAmount = (n: number) =>
  (n ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

interface FormData {
  employeeName: string
  deptName: string
  period: string
  score: number | undefined
  bonus: number | undefined
  status: '' | PerfStatus
  remark: string
}

const defaultForm = (): FormData => ({
  employeeName: '',
  deptName: '',
  period: '',
  score: undefined,
  bonus: 0,
  status: '',
  remark: '',
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const formData = reactive<FormData>(defaultForm())
const employeeOptions = ref<{ label: string; value: string }[]>([])

// 等级由得分自动派生（预览用）
const previewGrade = computed<PerformanceGrade>(() =>
  deriveGrade(formData.score ?? 0)
)

const rules: FormRules = {
  employeeName: [{ required: true, message: '请选择员工', trigger: 'change' }],
  deptName: [{ required: true, message: '所属部门不能为空', trigger: 'change' }],
  period: [{ required: true, message: '请选择绩效期间', trigger: 'change' }],
  score: [{ required: true, message: '请输入得分', trigger: 'blur' }],
  bonus: [{ required: true, message: '请输入绩效奖金', trigger: 'blur' }],
  remark: [{ max: 225, message: '备注不超过 225 个字符', trigger: 'blur' }],
}

const handleEmployeeChange = (name: string) => {
  if (name) {
    formData.deptName = getEmployeeMetaByName(name).deptName
  } else {
    formData.deptName = ''
  }
}

function reset() {
  Object.assign(formData, defaultForm())
  formRef.value?.clearValidate()
}

async function loadDetail(id: string) {
  const res = await getStaffPerformanceById(id)
  if (res.code !== 200 || !res.data || !res.data.id) {
    ElMessage.warning('人员绩效不存在或已删除')
    visible.value = false
    return
  }
  const r = res.data
  formData.employeeName = r.employeeName
  formData.deptName = r.deptName
  formData.period = r.period
  formData.score = r.score
  formData.bonus = r.bonus
  formData.status = r.status
  formData.remark = r.remark || ''
}

watch(
  () => [visible.value, props.mode, props.record],
  async ([vis]) => {
    if (!vis) return
    reset()
    employeeOptions.value = getEmployeeNameOptions()
    if (props.record && (props.mode === 'edit' || props.mode === 'view')) {
      await loadDetail(props.record.id)
    }
  },
  { immediate: true }
)

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  submitting.value = true
  try {
    const payload = {
      employeeName: formData.employeeName,
      deptName: formData.deptName,
      period: formData.period,
      score: (formData.score ?? 0) as number,
      bonus: (formData.bonus ?? 0) as number,
      remark: formData.remark,
    }
    if (props.mode === 'add') {
      const res = await createStaffPerformance(payload)
      if (res.code === 200) {
        ElMessage.success('新增成功')
        emit('success')
        visible.value = false
      } else ElMessage.error('新增失败')
    } else if (props.mode === 'edit' && props.record) {
      const res = await updateStaffPerformance(props.record.id, payload)
      if (res.code === 200) {
        ElMessage.success('保存成功')
        emit('success')
        visible.value = false
      } else ElMessage.error('保存失败')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.staff-perf-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}

.grade-tip {
  margin-left: 8px;
  font-size: 12px;
  color: #909399;
}
</style>
