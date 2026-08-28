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
      class="profit-bonus-form"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="员工姓名" prop="employeeName" required>
            <el-input v-model="formData.employeeName" placeholder="请输入员工姓名" maxlength="20" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="提成期间" prop="period" required>
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
          <el-form-item label="利润额(元)" prop="profitAmount" required>
            <el-input-number
              v-model="formData.profitAmount"
              :min="0"
              :precision="2"
              :controls="false"
              placeholder="请输入利润额"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="提成比例(%)" prop="bonusRate" required>
            <el-input-number
              v-model="formData.bonusRate"
              :min="0"
              :max="100"
              :precision="2"
              :controls="false"
              placeholder="请输入提成比例"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="提成金额(元)" prop="bonusAmount">
            <!-- 只读：自动计算 = 利润额 × 提成比例 / 100 -->
            <el-input-number
              :model-value="bonusAmount"
              :precision="2"
              :controls="false"
              disabled
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <!-- 编辑/查看：状态相关字段禁用展示 -->
        <el-col v-if="props.mode !== 'add' && formData.status" :span="12">
          <el-form-item label="状态">
            <el-select :model-value="formData.status" disabled style="width: 100%">
              <el-option
                v-for="opt in profitBonusStatusOptions"
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
  getProfitBonusById,
  createProfitBonus,
  updateProfitBonus,
  profitBonusStatusOptions,
  type ProfitBonusItem,
  type ProfitBonusStatus,
} from '@/mock/finance'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: ProfitBonusItem | null
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
  if (props.mode === 'view') return '利润提成详情'
  return '利润提成添加/修改'
})

interface FormData {
  employeeName: string
  period: string
  profitAmount: number | undefined
  bonusRate: number | undefined
  status: '' | ProfitBonusStatus
  remark: string
}

const defaultForm = (): FormData => ({
  employeeName: '',
  period: '',
  profitAmount: undefined,
  bonusRate: undefined,
  status: '',
  remark: '',
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const formData = reactive<FormData>(defaultForm())

// 提成金额只读自动计算：利润额 × 提成比例 / 100
const bonusAmount = computed(() => {
  const profit = formData.profitAmount ?? 0
  const rate = formData.bonusRate ?? 0
  return Math.round(((profit * rate) / 100) * 100) / 100
})

const rules: FormRules = {
  employeeName: [{ required: true, message: '请输入员工姓名', trigger: 'blur' }],
  period: [{ required: true, message: '请选择提成期间', trigger: 'change' }],
  profitAmount: [{ required: true, message: '请输入利润额', trigger: 'blur' }],
  bonusRate: [{ required: true, message: '请输入提成比例', trigger: 'blur' }],
}

function reset() {
  Object.assign(formData, defaultForm())
  formRef.value?.clearValidate()
}

async function loadDetail(id: string) {
  const res = await getProfitBonusById(id)
  if (res.code !== 200 || !res.data || !res.data.id) {
    ElMessage.warning('利润提成不存在或已删除')
    visible.value = false
    return
  }
  const r = res.data
  formData.employeeName = r.employeeName
  formData.period = r.period
  formData.profitAmount = r.profitAmount
  formData.bonusRate = r.bonusRate
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
      period: formData.period,
      profitAmount: (formData.profitAmount ?? 0) as number,
      bonusRate: (formData.bonusRate ?? 0) as number,
      remark: formData.remark,
    }
    if (props.mode === 'add') {
      const res = await createProfitBonus(payload)
      if (res.code === 200) {
        ElMessage.success('新增成功')
        emit('success')
        visible.value = false
      } else ElMessage.error('新增失败')
    } else if (props.mode === 'edit' && props.record) {
      const res = await updateProfitBonus(props.record.id, payload)
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
.profit-bonus-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}
</style>
