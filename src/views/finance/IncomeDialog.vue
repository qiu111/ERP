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
      class="income-form"
    >
      <el-form-item label="收入来源" prop="source" required>
        <el-input
          v-model="formData.source"
          placeholder="请输入收入来源"
          maxlength="80"
          clearable
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="金额(元)" prop="amount" required>
            <el-input-number
              v-model="formData.amount"
              :min="0.01"
              :precision="2"
              :controls="false"
              placeholder="请输入金额"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="收款账户" prop="accountName" required>
            <el-select v-model="formData.accountName" placeholder="请选择收款账户" style="width: 100%">
              <el-option
                v-for="opt in accountNameOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="收入日期" prop="incomeDate" required>
            <el-date-picker
              v-model="formData.incomeDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="经手人" prop="handler" required>
            <el-input v-model="formData.handler" placeholder="请输入经手人" maxlength="20" clearable />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 编辑/查看：状态相关字段禁用展示 -->
      <el-row v-if="props.mode !== 'add' && formData.status" :gutter="20">
        <el-col :span="12">
          <el-form-item label="状态">
            <el-select :model-value="formData.status" disabled style="width: 100%">
              <el-option
                v-for="opt in incomeStatusOptions"
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
  getIncomeById,
  createIncome,
  updateIncome,
  getAccountNameOptions,
  incomeStatusOptions,
  type IncomeItem,
  type IncomeStatus,
} from '@/mock/finance'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: IncomeItem | null
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
  if (props.mode === 'view') return '收入单详情'
  return '收入单添加/修改'
})

const accountNameOptions = getAccountNameOptions()

interface FormData {
  source: string
  amount: number | undefined
  accountName: string
  incomeDate: string
  handler: string
  status: '' | IncomeStatus
  remark: string
}

const defaultForm = (): FormData => ({
  source: '',
  amount: undefined,
  accountName: '',
  incomeDate: '',
  handler: '超级管理员',
  status: '',
  remark: '',
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const formData = reactive<FormData>(defaultForm())

const rules: FormRules = {
  source: [{ required: true, message: '请输入收入来源', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  accountName: [{ required: true, message: '请选择收款账户', trigger: 'change' }],
  incomeDate: [{ required: true, message: '请选择收入日期', trigger: 'change' }],
  handler: [{ required: true, message: '请输入经手人', trigger: 'blur' }],
}

function reset() {
  Object.assign(formData, defaultForm())
  formRef.value?.clearValidate()
}

async function loadDetail(id: string) {
  const res = await getIncomeById(id)
  if (res.code !== 200 || !res.data || !res.data.id) {
    ElMessage.warning('收入单不存在或已删除')
    visible.value = false
    return
  }
  const r = res.data
  formData.source = r.source
  formData.amount = r.amount
  formData.accountName = r.accountName
  formData.incomeDate = r.incomeDate
  formData.handler = r.handler
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
      source: formData.source,
      amount: formData.amount as number,
      accountName: formData.accountName,
      incomeDate: formData.incomeDate,
      handler: formData.handler,
      remark: formData.remark,
    }
    if (props.mode === 'add') {
      const res = await createIncome(payload)
      if (res.code === 200) {
        ElMessage.success('新增成功')
        emit('success')
        visible.value = false
      } else ElMessage.error('新增失败')
    } else if (props.mode === 'edit' && props.record) {
      const res = await updateIncome(props.record.id, payload)
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
.income-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}
</style>
