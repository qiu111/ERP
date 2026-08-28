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
      class="receivable-form"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="客户名称" prop="customerName" required>
            <el-input v-model="formData.customerName" placeholder="请输入客户名称" maxlength="60" clearable />
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
          <el-form-item label="应收金额" prop="amount" required>
            <el-input-number
              v-model="formData.amount"
              :min="0.01"
              :precision="2"
              :controls="false"
              placeholder="请输入应收金额"
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
          <el-form-item label="已收金额">
            <!-- 只读：已收金额由"登记收款"动作驱动 -->
            <el-input-number
              :model-value="formData.receivedAmount"
              :precision="2"
              :controls="false"
              disabled
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <!-- 编辑/查看：状态相关字段禁用展示（状态按已收金额自动派生） -->
        <el-col v-if="props.mode !== 'add' && formData.status" :span="12">
          <el-form-item label="状态">
            <el-select :model-value="formData.status" disabled style="width: 100%">
              <el-option
                v-for="opt in receiveStatusOptions"
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
  getReceivableById,
  createReceivable,
  updateReceivable,
  receiveStatusOptions,
  type ReceivableItem,
  type PayStatus,
} from '@/mock/finance'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: ReceivableItem | null
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
  if (props.mode === 'view') return '应收单详情'
  return '应收单添加/修改'
})

interface FormData {
  customerName: string
  orderNo: string
  amount: number | undefined
  receivedAmount: number
  dueDate: string
  status: '' | PayStatus
  remark: string
}

const defaultForm = (): FormData => ({
  customerName: '',
  orderNo: '',
  amount: undefined,
  receivedAmount: 0,
  dueDate: '',
  status: '',
  remark: '',
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const formData = reactive<FormData>(defaultForm())

const rules: FormRules = {
  customerName: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  orderNo: [{ required: true, message: '请输入关联订单号', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入应收金额', trigger: 'blur' }],
  dueDate: [{ required: true, message: '请选择到期日', trigger: 'change' }],
}

function reset() {
  Object.assign(formData, defaultForm())
  formRef.value?.clearValidate()
}

async function loadDetail(id: string) {
  const res = await getReceivableById(id)
  if (res.code !== 200 || !res.data || !res.data.id) {
    ElMessage.warning('应收单不存在或已删除')
    visible.value = false
    return
  }
  const r = res.data
  formData.customerName = r.customerName
  formData.orderNo = r.orderNo
  formData.amount = r.amount
  formData.receivedAmount = r.receivedAmount
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
      customerName: formData.customerName,
      orderNo: formData.orderNo,
      amount: (formData.amount ?? 0) as number,
      receivedAmount: formData.receivedAmount ?? 0,
      dueDate: formData.dueDate,
      remark: formData.remark,
    }
    if (props.mode === 'add') {
      const res = await createReceivable(payload)
      if (res.code === 200) {
        ElMessage.success('新增成功')
        emit('success')
        visible.value = false
      } else ElMessage.error('新增失败')
    } else if (props.mode === 'edit' && props.record) {
      const res = await updateReceivable(props.record.id, payload)
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
.receivable-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}
</style>
