<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="520px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="角色编号" prop="id">
        <el-input
          v-model="formData.id"
          placeholder="请输入角色编号"
          :disabled="mode === 'edit'"
        />
      </el-form-item>
      <el-form-item label="角色名" prop="name">
        <el-input v-model="formData.name" placeholder="请输入角色名" />
      </el-form-item>
      <el-form-item label="操作人" prop="operator">
        <el-input v-model="formData.operator" placeholder="请输入操作人" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio value="enabled">启用</el-radio>
          <el-radio value="disabled">停用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
        />
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
import { addRole, updateRole } from '@/mock/role'
import type { FormInstance, FormRules } from 'element-plus'
import type { RoleItem } from '@/mock/role'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit'
  record?: RoleItem | null
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
  id: string
  name: string
  operator: string
  status: 'enabled' | 'disabled'
  remark: string
}

const defaultFormData = (): FormData => ({
  id: '',
  name: '',
  operator: 'admin',
  status: 'enabled',
  remark: '',
})

const formData = ref<FormData>(defaultFormData())

const formRules: FormRules<FormData> = {
  id: [{ required: true, message: '请输入角色编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入角色名', trigger: 'blur' }],
}

const dialogTitle = computed(() => {
  return props.mode === 'add' ? '新增角色' : '编辑角色'
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.mode === 'edit' && props.record) {
        const r = props.record
        formData.value = {
          id: r.id,
          name: r.name,
          operator: r.operator,
          status: r.status,
          remark: r.remark || '',
        }
      } else {
        formData.value = {
          ...defaultFormData(),
          id: String(Date.now()),
        }
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
        id: formData.value.id,
        name: formData.value.name,
        operator: formData.value.operator,
        status: formData.value.status,
        remark: formData.value.remark,
        operateTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      }
      if (props.mode === 'add') {
        await addRole(payload)
      } else if (props.record) {
        await updateRole(props.record.id, payload)
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
