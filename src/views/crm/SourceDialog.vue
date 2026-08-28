<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="640px"
    top="10vh"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <!-- View 模式：详情描述 -->
    <el-descriptions v-if="props.mode === 'view' && props.record" :column="2" border>
      <el-descriptions-item label="编号">{{ props.record.code }}</el-descriptions-item>
      <el-descriptions-item label="来源名称">{{ props.record.name }}</el-descriptions-item>
      <el-descriptions-item label="排序">{{ props.record.sort }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="sourceStatusTagTypeMap[viewStatus]" effect="light" size="small">
          {{ getSourceStatusLabel(viewStatus) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">
        {{ props.record.remark || '—' }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间" :span="2">
        {{ props.record.createTime }}
      </el-descriptions-item>
    </el-descriptions>

    <!-- Add / Edit 模式：表单 -->
    <el-form
      v-else
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="96px"
      label-position="right"
      class="source-form"
    >
      <el-form-item label="来源名称" prop="name" required>
        <el-input
          v-model="formData.name"
          placeholder="请输入来源名称"
          maxlength="30"
          show-word-limit
          clearable
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="排序" prop="sort" required>
            <el-input-number v-model="formData.sort" :min="1" :max="999" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status" required>
            <el-radio-group v-model="formData.status">
              <el-radio value="enabled">启用</el-radio>
              <el-radio value="disabled">停用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          :maxlength="225"
          show-word-limit
          placeholder="请输入备注（选填，最多225个字符）"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <template v-if="props.mode === 'view' && props.record">
        <el-button
          :type="viewStatus === 'enabled' ? 'warning' : 'success'"
          :loading="toggling"
          @click="handleToggleStatus"
        >
          {{ viewStatus === 'enabled' ? '停用' : '启用' }}
        </el-button>
        <el-button type="primary" @click="visible = false">关闭</el-button>
      </template>
      <template v-else>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">提交</el-button>
      </template>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import {
  createCustomerSource,
  updateCustomerSource,
  getCustomerSourceById,
  updateCustomerSourceStatus,
  getSourceStatusLabel,
  sourceStatusTagTypeMap,
  type CustomerSource,
  type SourceStatus,
} from '@/mock/crm'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: CustomerSource | null
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

const dialogTitle = computed(() =>
  props.mode === 'view' ? '客户来源详情' : props.mode === 'edit' ? '客户来源修改' : '客户来源添加'
)

interface FormData {
  name: string
  sort: number
  status: SourceStatus
  remark: string
}

const defaultForm = (): FormData => ({
  name: '',
  sort: 1,
  status: 'enabled',
  remark: '',
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const toggling = ref(false)
const formData = reactive<FormData>(defaultForm())
const viewStatus = ref<SourceStatus>('enabled')

const rules: FormRules = {
  name: [{ required: true, message: '请输入来源名称', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序号', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  remark: [{ max: 225, message: '备注不超过 225 个字符', trigger: 'blur' }],
}

function reset() {
  Object.assign(formData, defaultForm())
  viewStatus.value = 'enabled'
  formRef.value?.clearValidate()
}

async function loadDetail(id: string) {
  const res = await getCustomerSourceById(id)
  if (res.code !== 200 || !res.data || !res.data.id) {
    ElMessage.warning('客户来源不存在或已删除')
    visible.value = false
    return
  }
  const r = res.data
  formData.name = r.name
  formData.sort = r.sort
  formData.status = r.status
  formData.remark = r.remark || ''
}

watch(
  () => [visible.value, props.mode, props.record],
  async ([vis]) => {
    if (!vis) return
    reset()
    if (props.record && props.mode === 'edit') {
      await loadDetail(props.record.id)
    }
    if (props.record && props.mode === 'view') {
      viewStatus.value = props.record.status
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
      sort: formData.sort,
      status: formData.status,
      remark: formData.remark,
    }
    if (props.mode === 'add') {
      const res = await createCustomerSource(payload)
      if (res.code === 200) {
        ElMessage.success('新增成功')
        emit('success')
        visible.value = false
      } else ElMessage.error('新增失败')
    } else if (props.mode === 'edit' && props.record) {
      const res = await updateCustomerSource(props.record.id, payload)
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

/** 启用 / 停用（仅查看模式） */
const handleToggleStatus = async () => {
  if (!props.record) return
  const next: SourceStatus = viewStatus.value === 'enabled' ? 'disabled' : 'enabled'
  toggling.value = true
  try {
    const res = await updateCustomerSourceStatus(props.record.id, next)
    if (res.code === 200) {
      viewStatus.value = next
      ElMessage.success(next === 'enabled' ? '已启用' : '已停用')
      emit('success')
    } else {
      ElMessage.error('操作失败')
    }
  } finally {
    toggling.value = false
  }
}
</script>

<style scoped lang="scss">
.source-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}
</style>
