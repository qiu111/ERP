<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="680px"
    top="8vh"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="right"
      :disabled="props.mode === 'view'"
      class="budget-form"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="部门" prop="deptName" required>
            <el-input v-model="formData.deptName" placeholder="请输入部门名称" maxlength="30" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="预算期间" prop="period" required>
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
          <el-form-item label="预算金额" prop="budgetAmount" required>
            <el-input-number
              v-model="formData.budgetAmount"
              :min="0.01"
              :precision="2"
              :controls="false"
              placeholder="请输入预算金额"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="已用金额" prop="usedAmount" required>
            <el-input-number
              v-model="formData.usedAmount"
              :min="0"
              :precision="2"
              :controls="false"
              placeholder="请输入已用金额"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 编辑/查看：状态相关字段禁用展示（状态由"关闭预算"动作驱动） -->
      <el-row v-if="props.mode !== 'add' && formData.status" :gutter="20">
        <el-col :span="12">
          <el-form-item label="状态">
            <el-select :model-value="formData.status" disabled style="width: 100%">
              <el-option
                v-for="opt in budgetStatusOptions"
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
          placeholder="请输入备注（选填）"
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
  getBudgetById,
  createBudget,
  updateBudget,
  budgetStatusOptions,
  type BudgetItem,
  type BudgetStatus,
} from '@/mock/finance'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: BudgetItem | null
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
  if (props.mode === 'view') return '预算详情'
  return '预算添加/修改'
})

interface FormData {
  deptName: string
  period: string
  budgetAmount: number | undefined
  usedAmount: number | undefined
  status: '' | BudgetStatus
  remark: string
}

const defaultForm = (): FormData => ({
  deptName: '',
  period: '',
  budgetAmount: undefined,
  usedAmount: 0,
  status: '',
  remark: '',
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const formData = reactive<FormData>(defaultForm())

// 异步校验：已用金额不能超过预算金额
const validateUsedAmount = (
  _rule: unknown,
  value: number | undefined,
  callback: (error?: string | Error) => void
): void => {
  if (value != null && formData.budgetAmount != null && value > formData.budgetAmount) {
    callback(new Error('已用金额不能超过预算金额'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  deptName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
  period: [{ required: true, message: '请选择预算期间', trigger: 'change' }],
  budgetAmount: [{ required: true, message: '请输入预算金额', trigger: 'blur' }],
  usedAmount: [{ validator: validateUsedAmount, trigger: ['blur', 'change'] }],
}

function reset() {
  Object.assign(formData, defaultForm())
  formRef.value?.clearValidate()
}

async function loadDetail(id: string) {
  const res = await getBudgetById(id)
  if (res.code !== 200 || !res.data || !res.data.id) {
    ElMessage.warning('预算不存在或已删除')
    visible.value = false
    return
  }
  const r = res.data
  formData.deptName = r.deptName
  formData.period = r.period
  formData.budgetAmount = r.budgetAmount
  formData.usedAmount = r.usedAmount
  formData.status = r.status
  formData.remark = r.remark || ''
}

watch(
  () => [visible.value, props.mode, props.record],
  async ([vis]) => {
    if (!vis) return
    reset()
    if (props.record && (props.mode === 'edit' || props.mode === 'view')) {
      await loadDetail(props.record.id)
    }
  },
  { immediate: true }
)

const handleSubmit = async () => {
  if (!formRef.value) return
  try { await formRef.value.validate() } catch { return }
  submitting.value = true
  try {
    const payload = {
      deptName: formData.deptName,
      period: formData.period,
      budgetAmount: (formData.budgetAmount ?? 0) as number,
      usedAmount: formData.usedAmount ?? 0,
      remark: formData.remark,
    }
    if (props.mode === 'add') {
      const res = await createBudget(payload)
      if (res.code === 200) {
        ElMessage.success('新增成功')
        emit('success')
        visible.value = false
      } else ElMessage.error('新增失败')
    } else if (props.mode === 'edit' && props.record) {
      const res = await updateBudget(props.record.id, payload)
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
.budget-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}
</style>
