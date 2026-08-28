<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="640px"
    top="8vh"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <!-- View 模式：详情描述 -->
    <el-descriptions v-if="props.mode === 'view' && props.record" :column="2" border>
      <el-descriptions-item label="编号">{{ props.record.code }}</el-descriptions-item>
      <el-descriptions-item label="部门名称">{{ props.record.name }}</el-descriptions-item>
      <el-descriptions-item label="上级部门">{{ parentLabel }}</el-descriptions-item>
      <el-descriptions-item label="负责人">{{ props.record.leader || '—' }}</el-descriptions-item>
      <el-descriptions-item label="排序">{{ props.record.sort }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="enableStatusTagTypeMap[props.record.status]" effect="light" size="small">
          {{ enableStatusLabelMap[props.record.status] }}
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
      label-width="100px"
      label-position="right"
      class="dept-form"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="上级部门" prop="parentId" required>
            <el-select v-model="formData.parentId" placeholder="请选择上级部门" style="width: 100%">
              <el-option
                v-for="opt in parentOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="部门名称" prop="name" required>
            <el-input v-model="formData.name" placeholder="请输入部门名称" maxlength="30" clearable />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="负责人" prop="leader">
            <el-input v-model="formData.leader" placeholder="请输入负责人" maxlength="20" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序" prop="sort">
            <el-input-number
              v-model="formData.sort"
              :min="0"
              :controls="false"
              placeholder="请输入排序"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="状态" prop="status" required>
            <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
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
          placeholder="请输入备注（选填，最多225个字符）"
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
  getDepartmentById,
  createDepartment,
  updateDepartment,
  getDepartmentIdOptions,
  enableStatusOptions,
  enableStatusLabelMap,
  enableStatusTagTypeMap,
  type Department,
  type EnableStatus,
} from '@/mock/hr'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: Department | null
  /** 新增子部门时预置的父级部门 ID */
  parentId?: string
}
const props = withDefaults(defineProps<Props>(), { record: null, parentId: '0' })
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const dialogTitle = computed(() => {
  if (props.mode === 'view') return '部门详情'
  return props.mode === 'edit' ? '部门修改' : '部门添加'
})

interface FormData {
  parentId: string
  name: string
  leader: string
  sort: number | undefined
  status: EnableStatus
  remark: string
}

const defaultForm = (): FormData => ({
  parentId: props.parentId || '0',
  name: '',
  leader: '',
  sort: 1,
  status: 'enabled',
  remark: '',
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const formData = reactive<FormData>(defaultForm())
const parentOptions = ref<{ label: string; value: string }[]>([])

const rules: FormRules = {
  parentId: [{ required: true, message: '请选择上级部门', trigger: 'change' }],
  name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  remark: [{ max: 225, message: '备注不超过 225 个字符', trigger: 'blur' }],
}

const parentLabel = computed(() => {
  if (!props.record) return '—'
  if (props.record.parentId === '0') return '顶级部门'
  const opt = parentOptions.value.find((o) => o.value === props.record!.parentId)
  return opt ? opt.label : '—'
})

function reset() {
  Object.assign(formData, defaultForm())
  formData.parentId = props.parentId || '0'
  formRef.value?.clearValidate()
}

async function loadDetail(id: string) {
  const res = await getDepartmentById(id)
  if (res.code !== 200 || !res.data || !res.data.id) {
    ElMessage.warning('部门不存在或已删除')
    visible.value = false
    return
  }
  const r = res.data
  formData.parentId = r.parentId
  formData.name = r.name
  formData.leader = r.leader
  formData.sort = r.sort
  formData.status = r.status
  formData.remark = r.remark || ''
}

watch(
  () => [visible.value, props.mode, props.record, props.parentId],
  async ([vis]) => {
    if (!vis) return
    parentOptions.value = [
      { label: '顶级部门', value: '0' },
      ...getDepartmentIdOptions(),
    ]
    reset()
    if (props.record && (props.mode === 'edit' || props.mode === 'view')) {
      await loadDetail(props.record.id)
    }
  },
  { immediate: true }
)

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  submitting.value = true
  try {
    const payload = {
      parentId: formData.parentId,
      name: formData.name,
      leader: formData.leader,
      sort: formData.sort ?? 1,
      status: formData.status,
      remark: formData.remark,
    }
    if (props.mode === 'add') {
      const res = await createDepartment(payload)
      if (res.code === 200) {
        ElMessage.success('新增成功')
        emit('success')
        visible.value = false
      } else ElMessage.error('新增失败')
    } else if (props.mode === 'edit' && props.record) {
      const res = await updateDepartment(props.record.id, payload)
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
.dept-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}
</style>
