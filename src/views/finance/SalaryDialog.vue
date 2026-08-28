<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="680px"
    top="8vh"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <!-- 查看模式：el-descriptions 展示 -->
    <el-descriptions v-if="props.mode === 'view' && detail" :column="2" border class="salary-descriptions">
      <el-descriptions-item label="工资单号">{{ detail.code }}</el-descriptions-item>
      <el-descriptions-item label="员工姓名">{{ detail.employeeName }}</el-descriptions-item>
      <el-descriptions-item label="工资月份">{{ detail.month }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="salaryStatusTagTypeMap[detail.status]" effect="light" size="small">
          {{ salaryStatusLabelMap[detail.status] }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="基本工资(元)">{{ formatAmount(detail.baseSalary) }}</el-descriptions-item>
      <el-descriptions-item label="奖金(元)">{{ formatAmount(detail.bonus) }}</el-descriptions-item>
      <el-descriptions-item label="扣款(元)">{{ formatAmount(detail.deduction) }}</el-descriptions-item>
      <el-descriptions-item label="应发工资(元)">
        <span class="amount-text">{{ formatAmount(detail.netSalary) }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="发放日期">{{ detail.payDate || '—' }}</el-descriptions-item>
      <el-descriptions-item label="备注">{{ detail.remark || '—' }}</el-descriptions-item>
    </el-descriptions>

    <!-- 新增/编辑模式：表单 -->
    <el-form
      v-else
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="right"
      class="salary-form"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="员工姓名" prop="employeeName" required>
            <el-input v-model="formData.employeeName" placeholder="请输入员工姓名" maxlength="20" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="工资月份" prop="month" required>
            <el-date-picker
              v-model="formData.month"
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
          <el-form-item label="基本工资" prop="baseSalary" required>
            <el-input-number
              v-model="formData.baseSalary"
              :min="0"
              :precision="2"
              :controls="false"
              placeholder="请输入基本工资"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="奖金" prop="bonus">
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

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="扣款" prop="deduction">
            <el-input-number
              v-model="formData.deduction"
              :min="0"
              :precision="2"
              :controls="false"
              placeholder="请输入扣款"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="应发工资" prop="netSalary">
            <!-- 只读：自动计算 = 基本工资 + 奖金 - 扣款 -->
            <el-input-number
              :model-value="netSalary"
              :precision="2"
              :controls="false"
              disabled
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 编辑：状态相关字段禁用展示 -->
      <el-row v-if="props.mode !== 'add' && formData.status" :gutter="20">
        <el-col :span="12">
          <el-form-item label="状态">
            <el-select :model-value="formData.status" disabled style="width: 100%">
              <el-option
                v-for="opt in salaryStatusOptions"
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
  getSalaryById,
  createSalary,
  updateSalary,
  salaryStatusOptions,
  salaryStatusLabelMap,
  salaryStatusTagTypeMap,
  type SalaryItem,
  type SalaryStatus,
} from '@/mock/finance'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: SalaryItem | null
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
  if (props.mode === 'view') return '工资单详情'
  return '工资单添加/修改'
})

const formatAmount = (n: number) =>
  (n ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

interface FormData {
  employeeName: string
  month: string
  baseSalary: number | undefined
  bonus: number | undefined
  deduction: number | undefined
  status: '' | SalaryStatus
  remark: string
}

const defaultForm = (): FormData => ({
  employeeName: '',
  month: '',
  baseSalary: undefined,
  bonus: 0,
  deduction: 0,
  status: '',
  remark: '',
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const formData = reactive<FormData>(defaultForm())
const detail = ref<SalaryItem | null>(null)

// 应发工资只读自动计算：基本工资 + 奖金 - 扣款
const netSalary = computed(() => {
  const base = formData.baseSalary ?? 0
  const bonus = formData.bonus ?? 0
  const ded = formData.deduction ?? 0
  return Math.round((base + bonus - ded) * 100) / 100
})

const rules: FormRules = {
  employeeName: [{ required: true, message: '请输入员工姓名', trigger: 'blur' }],
  month: [{ required: true, message: '请选择工资月份', trigger: 'change' }],
  baseSalary: [{ required: true, message: '请输入基本工资', trigger: 'blur' }],
}

function reset() {
  Object.assign(formData, defaultForm())
  detail.value = null
  formRef.value?.clearValidate()
}

async function loadDetail(id: string) {
  const res = await getSalaryById(id)
  if (res.code !== 200 || !res.data || !res.data.id) {
    ElMessage.warning('工资单不存在或已删除')
    visible.value = false
    return
  }
  const r = res.data
  detail.value = r
  formData.employeeName = r.employeeName
  formData.month = r.month
  formData.baseSalary = r.baseSalary
  formData.bonus = r.bonus
  formData.deduction = r.deduction
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
      employeeName: formData.employeeName,
      month: formData.month,
      baseSalary: (formData.baseSalary ?? 0) as number,
      bonus: formData.bonus ?? 0,
      deduction: formData.deduction ?? 0,
      remark: formData.remark,
    }
    if (props.mode === 'add') {
      const res = await createSalary(payload)
      if (res.code === 200) {
        ElMessage.success('新增成功')
        emit('success')
        visible.value = false
      } else ElMessage.error('新增失败')
    } else if (props.mode === 'edit' && props.record) {
      const res = await updateSalary(props.record.id, payload)
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
.salary-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}

.salary-descriptions {
  :deep(.el-descriptions__label) {
    width: 110px;
  }
}

.amount-text {
  font-weight: 600;
  color: #303133;
}
</style>
