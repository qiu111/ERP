<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="560px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      label-position="right"
    >
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="formData.username"
          placeholder="请输入用户名"
          :disabled="mode === 'edit'"
        />
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="formData.nickname" placeholder="请输入昵称" />
      </el-form-item>
      <el-form-item label="相关用户名" prop="relatedUsername">
        <el-input
          v-model="formData.relatedUsername"
          placeholder="多个用户名用逗号分隔"
        />
      </el-form-item>
      <el-form-item label="员工所属公司" prop="company">
        <el-select v-model="formData.company" placeholder="请选择" style="width: 100%">
          <el-option label="A公司" value="A公司" />
        </el-select>
      </el-form-item>
      <el-form-item label="用户角色" prop="role">
        <el-select v-model="formData.role" placeholder="请选择角色" style="width: 100%">
          <el-option
            v-for="r in roleOptions"
            :key="r"
            :label="r"
            :value="r"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio value="active">可用</el-radio>
          <el-radio value="inactive">不可用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        提交
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { addUser, updateUser, mockRoleList } from '@/mock/userAdmin'
import type { FormInstance, FormRules } from 'element-plus'
import type { UserItem } from '@/mock/userAdmin'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit'
  record?: UserItem | null
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

const roleOptions = computed(() => mockRoleList)

interface FormData {
  username: string
  nickname: string
  relatedUsername: string
  company: string
  role: string
  status: 'active' | 'inactive'
}

const defaultFormData = (): FormData => ({
  username: '',
  nickname: '',
  relatedUsername: '',
  company: 'A公司',
  role: '',
  status: 'active',
})

const formData = ref<FormData>(defaultFormData())

const formRules: FormRules<FormData> = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  role: [{ required: true, message: '请选择用户角色', trigger: 'change' }],
}

const dialogTitle = computed(() => {
  return props.mode === 'add' ? '新增用户' : '编辑用户'
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.mode === 'edit' && props.record) {
        const r = props.record
        formData.value = {
          username: r.username,
          nickname: r.nickname,
          relatedUsername: r.relatedUsername,
          company: r.company,
          role: r.role,
          status: r.status,
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
      const payload = {
        username: formData.value.username,
        nickname: formData.value.nickname,
        relatedUsername: formData.value.relatedUsername,
        company: formData.value.company,
        role: formData.value.role,
        status: formData.value.status,
      }
      if (props.mode === 'add') {
        await addUser(payload)
      } else if (props.record) {
        await updateUser(props.record.id, payload)
      }
      emit('success')
      handleClose()
    } catch (err) {
      console.error(err)
    } finally {
      submitting.value = false
    }
  })
}
</script>
