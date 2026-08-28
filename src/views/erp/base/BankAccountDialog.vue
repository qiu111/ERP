<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="640px"
    top="8vh"
    :close-on-click-modal="false"
    :show-close="true"
    @close="handleClose"
  >
    <!-- 详情模式 -->
    <el-descriptions v-if="mode === 'view' && record" :column="2" border>
      <el-descriptions-item label="编号">{{ record.code }}</el-descriptions-item>
      <el-descriptions-item label="账户名称">{{ record.accountName }}</el-descriptions-item>
      <el-descriptions-item label="银行账号" :span="2">{{ record.accountNo }}</el-descriptions-item>
      <el-descriptions-item label="开户银行">{{ record.bankName }}</el-descriptions-item>
      <el-descriptions-item label="币种">
        <el-tag :type="currencyTagTypeMap[record.currency]" effect="light" size="small">
          {{ currencyLabelMap[record.currency] }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="statusTagTypeMap[record.status]" effect="light" size="small">
          {{ statusLabelMap[record.status] }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ record.createTime }}</el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">{{ record.remark || '—' }}</el-descriptions-item>
    </el-descriptions>

    <!-- 新增/编辑模式 -->
    <el-form
      v-else
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="编号" prop="code" required>
        <el-input
          v-model="formData.code"
          placeholder="请输入账户编号（纯数字）"
          maxlength="20"
        />
      </el-form-item>

      <el-form-item label="账户名称" prop="accountName" required>
        <el-input
          v-model="formData.accountName"
          placeholder="请输入账户名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="银行账号" prop="accountNo" required>
        <el-input v-model="formData.accountNo" placeholder="请输入银行账号" maxlength="25" />
      </el-form-item>

      <el-form-item label="开户银行" prop="bankName" required>
        <el-input v-model="formData.bankName" placeholder="请输入开户银行" maxlength="50" />
      </el-form-item>

      <el-form-item label="币种" prop="currency" required>
        <el-select v-model="formData.currency" placeholder="请选择币种" style="width: 100%">
          <el-option
            v-for="opt in currencyOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="状态" prop="status" required>
        <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
          <el-option
            v-for="opt in statusOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>

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
      <div class="dialog-footer">
        <el-button
          v-if="mode !== 'view'"
          type="primary"
          :loading="submitting"
          @click="handleSubmit"
        >
          提交
        </el-button>
        <el-button @click="handleClose">{{ mode === 'view' ? '关闭' : '取消' }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import {
  addBankAccount,
  updateBankAccount,
  currencyOptions,
  currencyLabelMap,
  currencyTagTypeMap,
  statusOptions,
  statusLabelMap,
  statusTagTypeMap,
  type BankAccount,
  type BankAccountForm,
} from '@/mock/erpBase'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: BankAccount | null
}

const props = withDefaults(defineProps<Props>(), {
  record: null,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const formRef = ref<FormInstance>()
const submitting = ref(false)

interface FormData {
  code: string
  accountName: string
  accountNo: string
  bankName: string
  currency: BankAccount['currency']
  status: BankAccount['status']
  remark: string
}

const defaultFormData = (): FormData => ({
  code: '',
  accountName: '',
  accountNo: '',
  bankName: '',
  currency: 'CNY',
  status: 'enabled',
  remark: '',
})

const formData = ref<FormData>(defaultFormData())

const formRules: FormRules<FormData> = {
  code: [
    { required: true, message: '请输入账户编号', trigger: 'blur' },
    { pattern: /^\d+$/, message: '编号必须为纯数字', trigger: 'blur' },
  ],
  accountName: [{ required: true, message: '请输入账户名称', trigger: 'blur' }],
  accountNo: [
    { required: true, message: '请输入银行账号', trigger: 'blur' },
    { pattern: /^\d{10,25}$/, message: '银行账号须为10-25位数字', trigger: 'blur' },
  ],
  bankName: [{ required: true, message: '请输入开户银行', trigger: 'blur' }],
  remark: [{ max: 225, message: '备注不超过 225 个字符', trigger: 'blur' }],
}

const dialogTitle = computed(() => {
  if (props.mode === 'view') return '银行账户详情'
  return props.mode === 'edit' ? '修改银行账户' : '新增银行账户'
})

// 初始化表单数据
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.mode === 'edit' && props.record) {
        const r = props.record
        formData.value = {
          code: r.code,
          accountName: r.accountName,
          accountNo: r.accountNo,
          bankName: r.bankName,
          currency: r.currency,
          status: r.status,
          remark: r.remark,
        }
      } else {
        formData.value = defaultFormData()
      }
    }
  }
)

const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const payload: BankAccountForm = { ...formData.value }
      if (props.mode === 'edit' && props.record) {
        await updateBankAccount(props.record.id, payload)
        ElMessage.success('修改成功')
      } else {
        await addBankAccount(payload)
        ElMessage.success('新增成功')
      }
      emit('success')
      handleClose()
    } catch (err: any) {
      ElMessage.error(err.message || '保存失败')
    } finally {
      submitting.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}
</style>
