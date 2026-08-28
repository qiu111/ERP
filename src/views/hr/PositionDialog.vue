<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="720px"
    top="8vh"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <!-- View 模式：详情描述 -->
    <el-descriptions v-if="props.mode === 'view' && props.record" :column="2" border>
      <el-descriptions-item label="编号">{{ props.record.code }}</el-descriptions-item>
      <el-descriptions-item label="岗位名称">{{ props.record.name }}</el-descriptions-item>
      <el-descriptions-item label="所属部门">{{ props.record.deptName }}</el-descriptions-item>
      <el-descriptions-item label="职级">
        <el-tag :type="positionLevelTagTypeMap[props.record.level]" effect="light" size="small">
          {{ getPositionLevelLabel(props.record.level) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="基础薪资(元)">
        {{ formatAmount(props.record.baseSalary) }}
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="positionStatusTagTypeMap[props.record.status]" effect="light" size="small">
          {{ positionStatusLabelMap[props.record.status] }}
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
      class="position-form"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="岗位名称" prop="name" required>
            <el-input v-model="formData.name" placeholder="请输入岗位名称" maxlength="30" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属部门" prop="deptName" required>
            <el-select v-model="formData.deptName" placeholder="请选择部门" style="width: 100%" clearable>
              <el-option
                v-for="opt in deptOptions"
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
          <el-form-item label="职级" prop="level" required>
            <el-select v-model="formData.level" placeholder="请选择职级" style="width: 100%">
              <el-option
                v-for="opt in positionLevelOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="基础薪资" prop="baseSalary" required>
            <el-input-number
              v-model="formData.baseSalary"
              :min="0"
              :precision="2"
              :controls="false"
              placeholder="请输入基础薪资"
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
                v-for="opt in positionStatusOptions"
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
  getPositionById,
  createPosition,
  updatePosition,
  getDepartmentOptions,
  positionLevelOptions,
  positionStatusOptions,
  getPositionLevelLabel,
  positionLevelTagTypeMap,
  positionStatusLabelMap,
  positionStatusTagTypeMap,
  type PositionItem,
  type PositionLevel,
  type PositionStatus,
} from '@/mock/hr'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: PositionItem | null
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
  if (props.mode === 'view') return '岗位详情'
  return props.mode === 'edit' ? '岗位修改' : '岗位添加'
})

const formatAmount = (n: number) =>
  (n ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

interface FormData {
  name: string
  deptName: string
  level: PositionLevel | ''
  baseSalary: number | undefined
  status: PositionStatus
  remark: string
}

const defaultForm = (): FormData => ({
  name: '',
  deptName: '',
  level: '',
  baseSalary: undefined,
  status: 'open',
  remark: '',
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const formData = reactive<FormData>(defaultForm())
const deptOptions = ref<{ label: string; value: string }[]>([])

const rules: FormRules = {
  name: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
  deptName: [{ required: true, message: '请选择部门', trigger: 'change' }],
  level: [{ required: true, message: '请选择职级', trigger: 'change' }],
  baseSalary: [{ required: true, message: '请输入基础薪资', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  remark: [{ max: 225, message: '备注不超过 225 个字符', trigger: 'blur' }],
}

function reset() {
  Object.assign(formData, defaultForm())
  formRef.value?.clearValidate()
}

async function loadDetail(id: string) {
  const res = await getPositionById(id)
  if (res.code !== 200 || !res.data || !res.data.id) {
    ElMessage.warning('岗位不存在或已删除')
    visible.value = false
    return
  }
  const r = res.data
  formData.name = r.name
  formData.deptName = r.deptName
  formData.level = r.level
  formData.baseSalary = r.baseSalary
  formData.status = r.status
  formData.remark = r.remark || ''
}

watch(
  () => [visible.value, props.mode, props.record],
  async ([vis]) => {
    if (!vis) return
    reset()
    deptOptions.value = getDepartmentOptions()
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
      name: formData.name,
      deptName: formData.deptName,
      level: formData.level as PositionLevel,
      baseSalary: (formData.baseSalary ?? 0) as number,
      status: formData.status,
      remark: formData.remark,
    }
    if (props.mode === 'add') {
      const res = await createPosition(payload)
      if (res.code === 200) {
        ElMessage.success('新增成功')
        emit('success')
        visible.value = false
      } else ElMessage.error('新增失败')
    } else if (props.mode === 'edit' && props.record) {
      const res = await updatePosition(props.record.id, payload)
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
.position-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}
</style>
