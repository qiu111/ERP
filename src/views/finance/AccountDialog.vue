<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="560px"
    top="10vh"
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
      class="account-form"
    >
      <el-form-item label="账户名称" prop="name" required>
        <el-input
          v-model="formData.name"
          placeholder="请输入账户名称（公司名请带“示例”标注）"
          maxlength="60"
          clearable
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="账户类型" prop="type" required>
            <el-select v-model="formData.type" placeholder="请选择账户类型" style="width: 100%">
              <el-option
                v-for="opt in accountTypeOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
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
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="余额" prop="balance">
            <!-- 余额只读展示，由收付款/流水驱动，编辑不可改 -->
            <el-input-number
              :model-value="formData.balance"
              :precision="2"
              :controls="false"
              disabled
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status" required>
            <el-select v-model="formData.status" style="width: 100%">
              <el-option
                v-for="opt in enableStatusOptions"
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

      <!-- View 模式：创建信息 -->
      <el-form-item v-if="props.mode === 'view' && props.record" label="创建时间">
        <span>{{ props.record.createTime }}</span>
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
  getAccountById,
  createAccount,
  updateAccount,
  accountTypeOptions,
  currencyOptions,
  enableStatusOptions,
  type AccountItem,
  type AccountType,
  type Currency,
  type EnableStatus,
} from '@/mock/finance'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: AccountItem | null
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
  if (props.mode === 'view') return '账户详情'
  return '账户添加/修改'
})

interface FormData {
  name: string
  type: '' | AccountType
  currency: Currency
  balance: number
  status: EnableStatus
  remark: string
}

const defaultForm = (): FormData => ({
  name: '',
  type: '',
  currency: 'CNY',
  balance: 0,
  status: 'enabled',
  remark: '',
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const formData = reactive<FormData>(defaultForm())

const rules: FormRules = {
  name: [{ required: true, message: '请输入账户名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择账户类型', trigger: 'change' }],
  currency: [{ required: true, message: '请选择币种', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

function reset() {
  Object.assign(formData, defaultForm())
  formRef.value?.clearValidate()
}

async function loadDetail(id: string) {
  const res = await getAccountById(id)
  if (res.code !== 200 || !res.data || !res.data.id) {
    ElMessage.warning('账户不存在或已删除')
    visible.value = false
    return
  }
  const r = res.data
  formData.name = r.name
  formData.type = r.type
  formData.currency = r.currency
  formData.balance = r.balance
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
      name: formData.name,
      type: formData.type as AccountType,
      currency: formData.currency,
      status: formData.status,
      remark: formData.remark,
    }
    if (props.mode === 'add') {
      const res = await createAccount(payload)
      if (res.code === 200) {
        ElMessage.success('新增成功')
        emit('success')
        visible.value = false
      } else ElMessage.error('新增失败')
    } else if (props.mode === 'edit' && props.record) {
      const res = await updateAccount(props.record.id, payload)
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
.account-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}
</style>
