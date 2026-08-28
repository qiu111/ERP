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
      class="payable-form"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="供应商" prop="supplierName" required>
            <el-input v-model="formData.supplierName" placeholder="请输入供应商名称" maxlength="60" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="关联订单号" prop="orderNo" required>
            <el-input v-model="formData.orderNo" placeholder="请输入关联订单号" maxlength="40" clearable />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="应付金额" prop="amount" required>
            <el-input-number
              v-model="formData.amount"
              :min="0.01"
              :precision="2"
              :controls="false"
              placeholder="请输入应付金额"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="到期日" prop="dueDate" required>
            <el-date-picker
              v-model="formData.dueDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="已付金额">
            <!-- 只读：已付金额由"登记付款"动作驱动 -->
            <el-input-number
              :model-value="formData.paidAmount"
              :precision="2"
              :controls="false"
              disabled
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <!-- 编辑/查看：状态相关字段禁用展示（状态按已付金额自动派生） -->
        <el-col v-if="props.mode !== 'add' && formData.status" :span="12">
          <el-form-item label="状态">
            <el-select :model-value="formData.status" disabled style="width: 100%">
              <el-option
                v-for="opt in payStatusOptions"
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
  getPayableById,
  createPayable,
  updatePayable,
  payStatusOptions,
  type PayableItem,
  type PayStatus,
} from '@/mock/finance'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: PayableItem | null
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
  if (props.mode === 'view') return '应付单详情'
  return '应付单添加/修改'
})

interface FormData {
  supplierName: string
  orderNo: string
  amount: number | undefined
  paidAmount: number
  dueDate: string
  status: '' | PayStatus
  remark: string
}

const defaultForm = (): FormData => ({
  supplierName: '',
  orderNo: '',
  amount: undefined,
  paidAmount: 0,
  dueDate: '',
  status: '',
  remark: '',
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const formData = reactive<FormData>(defaultForm())

const rules: FormRules = {
  supplierName: [{ required: true, message: '请输入供应商名称', trigger: 'blur' }],
  orderNo: [{ required: true, message: '请输入关联订单号', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入应付金额', trigger: 'blur' }],
  dueDate: [{ required: true, message: '请选择到期日', trigger: 'change' }],
}

function reset() {
  Object.assign(formData, defaultForm())
  formRef.value?.clearValidate()
}

async function loadDetail(id: string) {
  const res = await getPayableById(id)
  if (res.code !== 200 || !res.data || !res.data.id) {
    ElMessage.warning('应付单不存在或已删除')
    visible.value = false
    return
  }
  const r = res.data
  formData.supplierName = r.supplierName
  formData.orderNo = r.orderNo
  formData.amount = r.amount
  formData.paidAmount = r.paidAmount
  formData.dueDate = r.dueDate
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
      supplierName: formData.supplierName,
      orderNo: formData.orderNo,
      amount: (formData.amount ?? 0) as number,
      paidAmount: formData.paidAmount ?? 0,
      dueDate: formData.dueDate,
      remark: formData.remark,
    }
    if (props.mode === 'add') {
      const res = await createPayable(payload)
      if (res.code === 200) {
        ElMessage.success('新增成功')
        emit('success')
        visible.value = false
      } else ElMessage.error('新增失败')
    } else if (props.mode === 'edit' && props.record) {
      const res = await updatePayable(props.record.id, payload)
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
.payable-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}
</style>
