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
      class="refund-form"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="客户名称" prop="customerName" required>
            <el-input
              v-model="formData.customerName"
              placeholder="请输入客户名称（公司名请带“示例”标注）"
              maxlength="60"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="关联订单号" prop="orderNo" required>
            <el-input v-model="formData.orderNo" placeholder="如 SO20260801" maxlength="30" clearable />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="退款金额(元)" prop="amount" required>
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
          <el-form-item label="退款日期" prop="refundDate" required>
            <el-date-picker
              v-model="formData.refundDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="退款原因" prop="reason" required>
        <el-input
          v-model="formData.reason"
          type="textarea"
          :rows="2"
          maxlength="100"
          show-word-limit
          placeholder="请输入退款原因"
        />
      </el-form-item>

      <!-- 编辑/查看：状态相关字段禁用展示 -->
      <el-row v-if="props.mode !== 'add' && formData.status" :gutter="20">
        <el-col :span="12">
          <el-form-item label="状态">
            <el-select :model-value="formData.status" disabled style="width: 100%">
              <el-option
                v-for="opt in refundStatusOptions"
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
          :rows="2"
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
  getRefundById,
  createRefund,
  updateRefund,
  refundStatusOptions,
  type RefundItem,
  type RefundStatus,
} from '@/mock/finance'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: RefundItem | null
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
  if (props.mode === 'view') return '退款单详情'
  return '退款单添加/修改'
})

interface FormData {
  customerName: string
  orderNo: string
  amount: number | undefined
  reason: string
  refundDate: string
  status: '' | RefundStatus
  remark: string
}

const defaultForm = (): FormData => ({
  customerName: '',
  orderNo: '',
  amount: undefined,
  reason: '',
  refundDate: '',
  status: '',
  remark: '',
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const formData = reactive<FormData>(defaultForm())

const rules: FormRules = {
  customerName: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  orderNo: [{ required: true, message: '请输入关联订单号', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入退款金额', trigger: 'blur' }],
  reason: [{ required: true, message: '请输入退款原因', trigger: 'blur' }],
  refundDate: [{ required: true, message: '请选择退款日期', trigger: 'change' }],
}

function reset() {
  Object.assign(formData, defaultForm())
  formRef.value?.clearValidate()
}

async function loadDetail(id: string) {
  const res = await getRefundById(id)
  if (res.code !== 200 || !res.data || !res.data.id) {
    ElMessage.warning('退款单不存在或已删除')
    visible.value = false
    return
  }
  const r = res.data
  formData.customerName = r.customerName
  formData.orderNo = r.orderNo
  formData.amount = r.amount
  formData.reason = r.reason
  formData.refundDate = r.refundDate
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
      customerName: formData.customerName,
      orderNo: formData.orderNo,
      amount: formData.amount as number,
      reason: formData.reason,
      refundDate: formData.refundDate,
      remark: formData.remark,
    }
    if (props.mode === 'add') {
      const res = await createRefund(payload)
      if (res.code === 200) {
        ElMessage.success('新增成功')
        emit('success')
        visible.value = false
      } else ElMessage.error('新增失败')
    } else if (props.mode === 'edit' && props.record) {
      const res = await updateRefund(props.record.id, payload)
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
.refund-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}
</style>
