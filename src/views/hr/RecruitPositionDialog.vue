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
      <el-descriptions-item label="招聘人数">{{ props.record.headcount }}</el-descriptions-item>
      <el-descriptions-item label="招聘来源">{{ props.record.recruitSource || '—' }}</el-descriptions-item>
      <el-descriptions-item label="薪资范围">{{ props.record.salaryRange || '—' }}</el-descriptions-item>
      <el-descriptions-item label="任职要求" :span="2">
        {{ props.record.requirement || '—' }}
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
      class="recruit-position-form"
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
          <el-form-item label="招聘人数" prop="headcount" required>
            <el-input-number
              v-model="formData.headcount"
              :min="1"
              :controls="false"
              placeholder="请输入招聘人数"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="薪资范围" prop="salaryRange">
            <el-input v-model="formData.salaryRange" placeholder="如 10k-15k" maxlength="30" clearable />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="招聘来源" prop="recruitSource">
            <el-select v-model="formData.recruitSource" placeholder="请选择招聘来源" style="width: 100%" clearable>
              <el-option
                v-for="opt in recruitSourceOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="任职要求" prop="requirement">
        <el-input
          v-model="formData.requirement"
          type="textarea"
          :rows="3"
          maxlength="200"
          show-word-limit
          placeholder="请输入任职要求"
        />
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
  getRecruitPositionById,
  createRecruitPosition,
  updateRecruitPosition,
  getDepartmentOptions,
  getRecruitSourceOptions,
  type RecruitPositionItem,
} from '@/mock/hr'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: RecruitPositionItem | null
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
  if (props.mode === 'view') return '招聘岗位详情'
  return props.mode === 'edit' ? '招聘岗位修改' : '招聘岗位添加'
})

interface FormData {
  name: string
  deptName: string
  headcount: number | undefined
  recruitSource: string
  salaryRange: string
  requirement: string
  remark: string
}

const defaultForm = (): FormData => ({
  name: '',
  deptName: '',
  headcount: 1,
  recruitSource: '',
  salaryRange: '',
  requirement: '',
  remark: '',
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const formData = reactive<FormData>(defaultForm())
const deptOptions = ref<{ label: string; value: string }[]>([])
const recruitSourceOptions = ref<{ label: string; value: string }[]>([])

const rules: FormRules = {
  name: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
  deptName: [{ required: true, message: '请选择部门', trigger: 'change' }],
  headcount: [{ required: true, message: '请输入招聘人数', trigger: 'blur' }],
  remark: [{ max: 225, message: '备注不超过 225 个字符', trigger: 'blur' }],
}

function reset() {
  Object.assign(formData, defaultForm())
  formRef.value?.clearValidate()
}

async function loadDetail(id: string) {
  const res = await getRecruitPositionById(id)
  if (res.code !== 200 || !res.data || !res.data.id) {
    ElMessage.warning('招聘岗位不存在或已删除')
    visible.value = false
    return
  }
  const r = res.data
  formData.name = r.name
  formData.deptName = r.deptName
  formData.headcount = r.headcount
  formData.recruitSource = r.recruitSource
  formData.salaryRange = r.salaryRange
  formData.requirement = r.requirement
  formData.remark = r.remark || ''
}

watch(
  () => [visible.value, props.mode, props.record],
  async ([vis]) => {
    if (!vis) return
    reset()
    deptOptions.value = getDepartmentOptions()
    recruitSourceOptions.value = getRecruitSourceOptions()
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
      headcount: (formData.headcount ?? 1) as number,
      recruitSource: formData.recruitSource,
      salaryRange: formData.salaryRange,
      requirement: formData.requirement,
      remark: formData.remark,
    }
    if (props.mode === 'add') {
      const res = await createRecruitPosition(payload)
      if (res.code === 200) {
        ElMessage.success('新增成功')
        emit('success')
        visible.value = false
      } else ElMessage.error('新增失败')
    } else if (props.mode === 'edit' && props.record) {
      const res = await updateRecruitPosition(props.record.id, payload)
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
.recruit-position-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}
</style>
