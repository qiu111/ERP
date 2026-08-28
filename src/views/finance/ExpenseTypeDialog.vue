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
      class="expense-type-form"
    >
      <el-form-item label="费用名称" prop="name" required>
        <el-input
          v-model="formData.name"
          placeholder="请输入费用名称"
          maxlength="40"
          clearable
        />
      </el-form-item>

      <el-form-item label="状态" prop="status" required>
        <el-radio-group v-model="formData.status">
          <el-radio v-for="opt in enableStatusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>

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
  getExpenseTypeById,
  createExpenseType,
  updateExpenseType,
  enableStatusOptions,
  type ExpenseTypeItem,
  type EnableStatus,
} from '@/mock/finance'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: ExpenseTypeItem | null
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
  if (props.mode === 'view') return '费用类型详情'
  return '费用类型添加/修改'
})

interface FormData {
  name: string
  status: EnableStatus
  remark: string
}

const defaultForm = (): FormData => ({
  name: '',
  status: 'enabled',
  remark: '',
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const formData = reactive<FormData>(defaultForm())

const rules: FormRules = {
  name: [{ required: true, message: '请输入费用名称', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

function reset() {
  Object.assign(formData, defaultForm())
  formRef.value?.clearValidate()
}

async function loadDetail(id: string) {
  const res = await getExpenseTypeById(id)
  if (res.code !== 200 || !res.data || !res.data.id) {
    ElMessage.warning('费用类型不存在或已删除')
    visible.value = false
    return
  }
  const r = res.data
  formData.name = r.name
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
      status: formData.status,
      remark: formData.remark,
    }
    if (props.mode === 'add') {
      const res = await createExpenseType(payload)
      if (res.code === 200) {
        ElMessage.success('新增成功')
        emit('success')
        visible.value = false
      } else ElMessage.error('新增失败')
    } else if (props.mode === 'edit' && props.record) {
      const res = await updateExpenseType(props.record.id, payload)
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
.expense-type-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}
</style>
