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
      <el-descriptions-item label="部门">{{ props.record.deptName }}</el-descriptions-item>
      <el-descriptions-item label="绩效期间">{{ props.record.period }}</el-descriptions-item>
      <el-descriptions-item label="计划得分">{{ props.record.planScore }}</el-descriptions-item>
      <el-descriptions-item label="实际得分">{{ props.record.actualScore }}</el-descriptions-item>
      <el-descriptions-item label="完成率">
        {{ props.record.completionRate.toFixed(2) }}%
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
      class="dept-perf-form"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="部门" prop="deptName" required>
            <el-select v-model="formData.deptName" placeholder="请选择部门" style="width: 100%" clearable>
              <el-option
                v-for="opt in deptOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
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
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="计划得分" prop="planScore" required>
            <el-input-number
              v-model="formData.planScore"
              :min="0"
              :precision="2"
              :controls="false"
              placeholder="请输入计划得分"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="实际得分" prop="actualScore" required>
            <el-input-number
              v-model="formData.actualScore"
              :min="0"
              :precision="2"
              :controls="false"
              placeholder="请输入实际得分"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="完成率">
            <span class="rate-text">{{ previewRate.toFixed(2) }}%</span>
            <span class="rate-tip">（自动计算：实际/计划×100）</span>
          </el-form-item>
        </el-col>
        <el-col v-if="props.mode === 'edit' && formData.status" :span="12">
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
  getDeptPerformanceById,
  createDeptPerformance,
  updateDeptPerformance,
  getDepartmentOptions,
  calcCompletionRate,
  perfStatusOptions,
  perfStatusLabelMap,
  perfStatusTagTypeMap,
  type DeptPerformanceItem,
  type PerfStatus,
} from '@/mock/hr'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: DeptPerformanceItem | null
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
  if (props.mode === 'view') return '部门绩效详情'
  return props.mode === 'edit' ? '部门绩效修改' : '部门绩效添加'
})

interface FormData {
  deptName: string
  period: string
  planScore: number | undefined
  actualScore: number | undefined
  status: '' | PerfStatus
  remark: string
}

const defaultForm = (): FormData => ({
  deptName: '',
  period: '',
  planScore: undefined,
  actualScore: undefined,
  status: '',
  remark: '',
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const formData = reactive<FormData>(defaultForm())
const deptOptions = ref<{ label: string; value: string }[]>([])

// 完成率自动计算（实际/计划×100，保留 2 位）
const previewRate = computed(() =>
  calcCompletionRate(formData.planScore ?? 0, formData.actualScore ?? 0)
)

const rules: FormRules = {
  deptName: [{ required: true, message: '请选择部门', trigger: 'change' }],
  period: [{ required: true, message: '请选择绩效期间', trigger: 'change' }],
  planScore: [{ required: true, message: '请输入计划得分', trigger: 'blur' }],
  actualScore: [{ required: true, message: '请输入实际得分', trigger: 'blur' }],
  remark: [{ max: 225, message: '备注不超过 225 个字符', trigger: 'blur' }],
}

function reset() {
  Object.assign(formData, defaultForm())
  formRef.value?.clearValidate()
}

async function loadDetail(id: string) {
  const res = await getDeptPerformanceById(id)
  if (res.code !== 200 || !res.data || !res.data.id) {
    ElMessage.warning('部门绩效不存在或已删除')
    visible.value = false
    return
  }
  const r = res.data
  formData.deptName = r.deptName
  formData.period = r.period
  formData.planScore = r.planScore
  formData.actualScore = r.actualScore
  formData.status = r.status
  formData.remark = r.remark || ''
}

watch(
  () => [visible.value, props.mode, props.record],
  async ([vis]) => {
    if (!vis) return
    reset()
    deptOptions.value = getDepartmentOptions()
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
      deptName: formData.deptName,
      period: formData.period,
      planScore: (formData.planScore ?? 0) as number,
      actualScore: (formData.actualScore ?? 0) as number,
      remark: formData.remark,
    }
    if (props.mode === 'add') {
      const res = await createDeptPerformance(payload)
      if (res.code === 200) {
        ElMessage.success('新增成功')
        emit('success')
        visible.value = false
      } else ElMessage.error('新增失败')
    } else if (props.mode === 'edit' && props.record) {
      const res = await updateDeptPerformance(props.record.id, payload)
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
.dept-perf-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}

.rate-text {
  font-weight: 600;
  color: #303133;
}

.rate-tip {
  margin-left: 8px;
  font-size: 12px;
  color: #909399;
}
</style>
