<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="640px"
    top="8vh"
    :close-on-click-modal="false"
    :show-close="true"
    @close="handleClose"
  >
    <!-- 详情模式 -->
    <el-descriptions v-if="mode === 'view' && record" :column="2" border>
      <el-descriptions-item label="编号">{{ record.code }}</el-descriptions-item>
      <el-descriptions-item label="供应商名称">{{ record.name }}</el-descriptions-item>
      <el-descriptions-item label="联系人">{{ record.contact }}</el-descriptions-item>
      <el-descriptions-item label="联系电话">{{ record.phone || '—' }}</el-descriptions-item>
      <el-descriptions-item label="地址" :span="2">{{ record.address || '—' }}</el-descriptions-item>
      <el-descriptions-item label="等级">
        <el-tag :type="supplierLevelTagTypeMap[record.level]" effect="light" size="small">
          {{ supplierLevelLabelMap[record.level] }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="statusTagTypeMap[record.status]" effect="light" size="small">
          {{ statusLabelMap[record.status] }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">{{ record.remark || '—' }}</el-descriptions-item>
      <el-descriptions-item label="创建时间" :span="2">{{ record.createTime }}</el-descriptions-item>
    </el-descriptions>

    <!-- 新增/编辑模式 -->
    <el-form
      v-else
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="编号" prop="code" required>
        <el-input
          v-model="formData.code"
          placeholder="请输入供应商编号（纯数字）"
          maxlength="20"
        />
      </el-form-item>

      <el-form-item label="供应商名称" prop="name" required>
        <el-input
          v-model="formData.name"
          placeholder="请输入供应商名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="联系人" prop="contact" required>
        <el-input v-model="formData.contact" placeholder="请输入联系人" maxlength="20" />
      </el-form-item>

      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入联系电话" maxlength="20" />
      </el-form-item>

      <el-form-item label="地址" prop="address">
        <el-input
          v-model="formData.address"
          placeholder="请输入地址"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="等级" prop="level" required>
        <el-select v-model="formData.level" placeholder="请选择等级" style="width: 100%">
          <el-option
            v-for="opt in supplierLevelOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="状态" prop="status" required>
        <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
          <el-option
            v-for="opt in statusOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
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
      <div class="dialog-footer">
        <el-button
          v-if="mode !== 'view'"
          type="primary"
          :loading="submitting"
          @click="handleSubmit"
        >
          提交
        </el-button>
        <el-button @click="handleClose">{{ mode === 'view' ? '关闭' : '取消' }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import {
  addSupplier,
  updateSupplier,
  supplierLevelOptions,
  supplierLevelLabelMap,
  supplierLevelTagTypeMap,
  statusOptions,
  statusLabelMap,
  statusTagTypeMap,
  type Supplier,
  type SupplierForm,
} from '@/mock/erpBase'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: Supplier | null
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
  code: string
  name: string
  contact: string
  phone: string
  address: string
  level: Supplier['level']
  status: Supplier['status']
  remark: string
}

const defaultFormData = (): FormData => ({
  code: '',
  name: '',
  contact: '',
  phone: '',
  address: '',
  level: 'normal',
  status: 'enabled',
  remark: '',
})

const formData = ref<FormData>(defaultFormData())

const formRules: FormRules<FormData> = {
  code: [
    { required: true, message: '请输入供应商编号', trigger: 'blur' },
    { pattern: /^\d+$/, message: '编号必须为纯数字', trigger: 'blur' },
  ],
  name: [{ required: true, message: '请输入供应商名称', trigger: 'blur' }],
  contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  remark: [{ max: 225, message: '备注不超过 225 个字符', trigger: 'blur' }],
}

const dialogTitle = computed(() => {
  if (props.mode === 'view') return '供应商详情'
  return props.mode === 'edit' ? '修改供应商' : '新增供应商'
})

// 初始化表单数据
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.mode === 'edit' && props.record) {
        const r = props.record
        formData.value = {
          code: r.code,
          name: r.name,
          contact: r.contact,
          phone: r.phone,
          address: r.address,
          level: r.level,
          status: r.status,
          remark: r.remark,
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
      const payload: SupplierForm = { ...formData.value }
      if (props.mode === 'edit' && props.record) {
        await updateSupplier(props.record.id, payload)
        ElMessage.success('修改成功')
      } else {
        await addSupplier(payload)
        ElMessage.success('新增成功')
      }
      emit('success')
      handleClose()
    } catch (err: any) {
      ElMessage.error(err.message || '保存失败')
    } finally {
      submitting.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}
</style>
