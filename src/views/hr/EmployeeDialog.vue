<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="780px"
    top="6vh"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <!-- View 模式：详情描述 -->
    <el-descriptions v-if="props.mode === 'view' && props.record" :column="2" border>
      <el-descriptions-item label="工号">{{ props.record.empNo }}</el-descriptions-item>
      <el-descriptions-item label="姓名">{{ props.record.name }}</el-descriptions-item>
      <el-descriptions-item label="性别">{{ getGenderLabel(props.record.gender) }}</el-descriptions-item>
      <el-descriptions-item label="所属部门">{{ props.record.deptName }}</el-descriptions-item>
      <el-descriptions-item label="岗位">{{ props.record.positionName }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="employeeStatusTagTypeMap[props.record.status]" effect="light" size="small">
          {{ employeeStatusLabelMap[props.record.status] }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="联系电话">{{ props.record.phone || '—' }}</el-descriptions-item>
      <el-descriptions-item label="身份证号">{{ props.record.idCard || '—' }}</el-descriptions-item>
      <el-descriptions-item label="入职日期">{{ props.record.entryDate }}</el-descriptions-item>
      <el-descriptions-item label="出生日期">{{ props.record.birthday || '—' }}</el-descriptions-item>
      <el-descriptions-item label="邮箱" :span="2">{{ props.record.email || '—' }}</el-descriptions-item>
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
      class="employee-form"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="姓名" prop="name" required>
            <el-input v-model="formData.name" placeholder="请输入姓名" maxlength="20" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别" prop="gender" required>
            <el-select v-model="formData.gender" placeholder="请选择性别" style="width: 100%">
              <el-option
                v-for="opt in genderOptions"
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
        <el-col :span="12">
          <el-form-item label="岗位" prop="positionName" required>
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
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="formData.phone" placeholder="如 138****0001" maxlength="20" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="身份证号" prop="idCard">
            <el-input v-model="formData.idCard" placeholder="如 110***0000" maxlength="20" clearable />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="入职日期" prop="entryDate" required>
            <el-date-picker
              v-model="formData.entryDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择入职日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="出生日期" prop="birthday">
            <el-date-picker
              v-model="formData.birthday"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择出生日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="formData.email" placeholder="请输入邮箱" maxlength="60" clearable />
          </el-form-item>
        </el-col>
        <!-- 编辑时状态禁用展示 -->
        <el-col v-if="props.mode === 'edit' && formData.status" :span="12">
          <el-form-item label="状态">
            <el-select :model-value="formData.status" disabled style="width: 100%">
              <el-option
                v-for="opt in employeeStatusOptions"
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
  getEmployeeById,
  createEmployee,
  updateEmployee,
  getDepartmentOptions,
  getPositionNameOptions,
  genderOptions,
  getGenderLabel,
  employeeStatusOptions,
  employeeStatusLabelMap,
  employeeStatusTagTypeMap,
  type EmployeeItem,
  type EmployeeStatus,
  type Gender,
} from '@/mock/hr'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: EmployeeItem | null
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
  if (props.mode === 'view') return '员工详情'
  return props.mode === 'edit' ? '员工修改' : '员工添加'
})

interface FormData {
  name: string
  gender: Gender | ''
  deptName: string
  positionName: string
  phone: string
  idCard: string
  entryDate: string
  birthday: string
  email: string
  status: '' | EmployeeStatus
  remark: string
}

const defaultForm = (): FormData => ({
  name: '',
  gender: 'male',
  deptName: '',
  positionName: '',
  phone: '',
  idCard: '',
  entryDate: '',
  birthday: '',
  email: '',
  status: '',
  remark: '',
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const formData = reactive<FormData>(defaultForm())
const deptOptions = ref<{ label: string; value: string }[]>([])
const positionOptions = ref<{ label: string; value: string }[]>([])

const rules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  deptName: [{ required: true, message: '请选择部门', trigger: 'change' }],
  positionName: [{ required: true, message: '请选择岗位', trigger: 'change' }],
  entryDate: [{ required: true, message: '请选择入职日期', trigger: 'change' }],
  remark: [{ max: 225, message: '备注不超过 225 个字符', trigger: 'blur' }],
}

function reset() {
  Object.assign(formData, defaultForm())
  formRef.value?.clearValidate()
}

async function loadDetail(id: string) {
  const res = await getEmployeeById(id)
  if (res.code !== 200 || !res.data || !res.data.id) {
    ElMessage.warning('员工不存在或已删除')
    visible.value = false
    return
  }
  const r = res.data
  formData.name = r.name
  formData.gender = r.gender
  formData.deptName = r.deptName
  formData.positionName = r.positionName
  formData.phone = r.phone
  formData.idCard = r.idCard
  formData.entryDate = r.entryDate
  formData.birthday = r.birthday
  formData.email = r.email
  formData.status = r.status
  formData.remark = r.remark || ''
}

watch(
  () => [visible.value, props.mode, props.record],
  async ([vis]) => {
    if (!vis) return
    reset()
    deptOptions.value = getDepartmentOptions()
    positionOptions.value = getPositionNameOptions()
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
      gender: formData.gender as Gender,
      deptName: formData.deptName,
      positionName: formData.positionName,
      phone: formData.phone,
      idCard: formData.idCard,
      entryDate: formData.entryDate,
      birthday: formData.birthday,
      email: formData.email,
      remark: formData.remark,
    }
    if (props.mode === 'add') {
      const res = await createEmployee(payload)
      if (res.code === 200) {
        ElMessage.success('新增成功')
        emit('success')
        visible.value = false
      } else ElMessage.error('新增失败')
    } else if (props.mode === 'edit' && props.record) {
      const res = await updateEmployee(props.record.id, payload)
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
.employee-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}
</style>
