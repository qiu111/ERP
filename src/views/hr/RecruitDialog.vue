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
      <el-descriptions-item label="应聘岗位">{{ props.record.positionName }}</el-descriptions-item>
      <el-descriptions-item label="候选人">{{ props.record.candidateName }}</el-descriptions-item>
      <el-descriptions-item label="招聘来源">{{ props.record.recruitSource || '—' }}</el-descriptions-item>
      <el-descriptions-item label="联系电话">{{ props.record.phone || '—' }}</el-descriptions-item>
      <el-descriptions-item label="面试日期">{{ props.record.interviewDate || '—' }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="recruitStatusTagTypeMap[props.record.status]" effect="light" size="small">
          {{ getRecruitStatusLabel(props.record.status) }}
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
      class="recruit-form"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="应聘岗位" prop="positionName" required>
            <el-select v-model="formData.positionName" placeholder="请选择岗位" style="width: 100%" clearable filterable>
              <el-option
                v-for="opt in positionOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="候选人" prop="candidateName" required>
            <el-input v-model="formData.candidateName" placeholder="请输入候选人姓名" maxlength="20" clearable />
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
        <el-col :span="12">
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="formData.phone" placeholder="如 138****0011" maxlength="20" clearable />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="面试日期" prop="interviewDate" required>
            <el-date-picker
              v-model="formData.interviewDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择面试日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <!-- 编辑时状态禁用展示 -->
        <el-col v-if="props.mode === 'edit' && formData.status" :span="12">
          <el-form-item label="状态">
            <el-select :model-value="formData.status" disabled style="width: 100%">
              <el-option
                v-for="opt in recruitStatusOptions"
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
  getRecruitById,
  createRecruit,
  updateRecruit,
  getRecruitPositionNameOptions,
  getRecruitSourceOptions,
  recruitStatusOptions,
  getRecruitStatusLabel,
  recruitStatusTagTypeMap,
  type RecruitItem,
  type RecruitStatus,
} from '@/mock/hr'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: RecruitItem | null
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
  if (props.mode === 'view') return '招聘记录详情'
  return props.mode === 'edit' ? '招聘记录修改' : '招聘记录添加'
})

interface FormData {
  positionName: string
  candidateName: string
  recruitSource: string
  phone: string
  interviewDate: string
  status: '' | RecruitStatus
  remark: string
}

const defaultForm = (): FormData => ({
  positionName: '',
  candidateName: '',
  recruitSource: '',
  phone: '',
  interviewDate: '',
  status: '',
  remark: '',
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const formData = reactive<FormData>(defaultForm())
const positionOptions = ref<{ label: string; value: string }[]>([])
const recruitSourceOptions = ref<{ label: string; value: string }[]>([])

const rules: FormRules = {
  positionName: [{ required: true, message: '请选择岗位', trigger: 'change' }],
  candidateName: [{ required: true, message: '请输入候选人姓名', trigger: 'blur' }],
  interviewDate: [{ required: true, message: '请选择面试日期', trigger: 'change' }],
  remark: [{ max: 225, message: '备注不超过 225 个字符', trigger: 'blur' }],
}

function reset() {
  Object.assign(formData, defaultForm())
  formRef.value?.clearValidate()
}

async function loadDetail(id: string) {
  const res = await getRecruitById(id)
  if (res.code !== 200 || !res.data || !res.data.id) {
    ElMessage.warning('招聘记录不存在或已删除')
    visible.value = false
    return
  }
  const r = res.data
  formData.positionName = r.positionName
  formData.candidateName = r.candidateName
  formData.recruitSource = r.recruitSource
  formData.phone = r.phone
  formData.interviewDate = r.interviewDate
  formData.status = r.status
  formData.remark = r.remark || ''
}

watch(
  () => [visible.value, props.mode, props.record],
  async ([vis]) => {
    if (!vis) return
    reset()
    positionOptions.value = getRecruitPositionNameOptions()
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
      positionName: formData.positionName,
      candidateName: formData.candidateName,
      recruitSource: formData.recruitSource,
      phone: formData.phone,
      interviewDate: formData.interviewDate,
      remark: formData.remark,
    }
    if (props.mode === 'add') {
      const res = await createRecruit(payload)
      if (res.code === 200) {
        ElMessage.success('新增成功')
        emit('success')
        visible.value = false
      } else ElMessage.error('新增失败')
    } else if (props.mode === 'edit' && props.record) {
      const res = await updateRecruit(props.record.id, payload)
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
.recruit-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}
</style>
