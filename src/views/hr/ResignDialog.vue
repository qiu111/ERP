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
      <el-descriptions-item label="所属部门">{{ props.record.deptName }}</el-descriptions-item>
      <el-descriptions-item label="离职原因">{{ getResignReasonLabel(props.record.reason) }}</el-descriptions-item>
      <el-descriptions-item label="申请日期">{{ props.record.applyDate }}</el-descriptions-item>
      <el-descriptions-item label="离职日期">{{ props.record.resignDate || '—' }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="resignStatusTagTypeMap[props.record.status]" effect="light" size="small">
          {{ resignStatusLabelMap[props.record.status] }}
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
      class="resign-form"
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
          <el-form-item label="离职原因" prop="reason" required>
            <el-select v-model="formData.reason" placeholder="请选择离职原因" style="width: 100%">
              <el-option
                v-for="opt in resignReasonOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="申请日期" prop="applyDate" required>
            <el-date-picker
              v-model="formData.applyDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择申请日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="离职日期" prop="resignDate">
            <el-date-picker
              v-model="formData.resignDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择预计离职日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <!-- 编辑时状态禁用展示 -->
        <el-col v-if="props.mode === 'edit' && formData.status" :span="12">
          <el-form-item label="状态">
            <el-select :model-value="formData.status" disabled style="width: 100%">
              <el-option
                v-for="opt in resignStatusOptions"
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
  getResignationById,
  createResignation,
  updateResignation,
  getEmployeeNameOptions,
  getEmployeeMetaByName,
  resignReasonOptions,
  resignStatusOptions,
  getResignReasonLabel,
  resignStatusLabelMap,
  resignStatusTagTypeMap,
  type ResignationItem,
  type ResignReason,
  type ResignStatus,
} from '@/mock/hr'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: ResignationItem | null
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
  if (props.mode === 'view') return '离职申请详情'
  return props.mode === 'edit' ? '离职申请修改' : '离职申请添加'
})

interface FormData {
  employeeName: string
  deptName: string
  reason: ResignReason | ''
  applyDate: string
  resignDate: string
  status: '' | ResignStatus
  remark: string
}

const defaultForm = (): FormData => ({
  employeeName: '',
  deptName: '',
  reason: '',
  applyDate: '',
  resignDate: '',
  status: '',
  remark: '',
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const formData = reactive<FormData>(defaultForm())
const employeeOptions = ref<{ label: string; value: string }[]>([])

// 异步校验：离职日期须晚于申请日期
const validateResignDate = (
  _rule: unknown,
  value: string,
  callback: (error?: string | Error) => void
): void => {
  if (value && formData.applyDate && value <= formData.applyDate) {
    callback(new Error('离职日期须晚于申请日期'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  employeeName: [{ required: true, message: '请选择员工', trigger: 'change' }],
  deptName: [{ required: true, message: '所属部门不能为空', trigger: 'change' }],
  reason: [{ required: true, message: '请选择离职原因', trigger: 'change' }],
  applyDate: [{ required: true, message: '请选择申请日期', trigger: 'change' }],
  resignDate: [{ validator: validateResignDate, trigger: ['blur', 'change'] }],
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
  const res = await getResignationById(id)
  if (res.code !== 200 || !res.data || !res.data.id) {
    ElMessage.warning('离职申请不存在或已删除')
    visible.value = false
    return
  }
  const r = res.data
  formData.employeeName = r.employeeName
  formData.deptName = r.deptName
  formData.reason = r.reason
  formData.applyDate = r.applyDate
  formData.resignDate = r.resignDate
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
      reason: formData.reason as ResignReason,
      applyDate: formData.applyDate,
      resignDate: formData.resignDate,
      remark: formData.remark,
    }
    if (props.mode === 'add') {
      const res = await createResignation(payload)
      if (res.code === 200) {
        ElMessage.success('新增成功')
        emit('success')
        visible.value = false
      } else ElMessage.error('新增失败')
    } else if (props.mode === 'edit' && props.record) {
      const res = await updateResignation(props.record.id, payload)
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
.resign-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}
</style>
