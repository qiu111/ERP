<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="760px"
    top="6vh"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <!-- View 模式：详情描述 -->
    <el-descriptions v-if="props.mode === 'view' && props.record" :column="2" border>
      <el-descriptions-item label="编号">{{ props.record.code }}</el-descriptions-item>
      <el-descriptions-item label="客户名称">{{ props.record.name }}</el-descriptions-item>
      <el-descriptions-item label="客户来源">{{ props.record.sourceName }}</el-descriptions-item>
      <el-descriptions-item label="所属行业">{{ props.record.industry || '—' }}</el-descriptions-item>
      <el-descriptions-item label="联系人">{{ props.record.contact || '—' }}</el-descriptions-item>
      <el-descriptions-item label="联系电话">{{ props.record.phone || '—' }}</el-descriptions-item>
      <el-descriptions-item label="负责人">{{ props.record.owner }}</el-descriptions-item>
      <el-descriptions-item label="客户级别">
        <el-tag :type="customerLevelTagTypeMap[props.record.level]" effect="light" size="small">
          {{ getCustomerLevelLabel(props.record.level) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="联系地址" :span="2">
        {{ props.record.address || '—' }}
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
      label-width="108px"
      label-position="right"
      class="customer-form"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="客户名称" prop="name" required>
            <el-input
              v-model="formData.name"
              placeholder="请输入客户名称"
              maxlength="50"
              show-word-limit
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客户来源" prop="sourceName" required>
            <el-select v-model="formData.sourceName" placeholder="请选择客户来源" style="width: 100%" clearable>
              <el-option
                v-for="opt in sourceOptions"
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
          <el-form-item label="所属行业" prop="industry">
            <el-input v-model="formData.industry" placeholder="请输入所属行业" maxlength="30" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客户级别" prop="level" required>
            <el-select v-model="formData.level" placeholder="请选择客户级别" style="width: 100%">
              <el-option
                v-for="opt in customerLevelOptions"
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
          <el-form-item label="联系人" prop="contact" required>
            <el-input v-model="formData.contact" placeholder="请输入联系人" maxlength="20" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="formData.phone" placeholder="请输入联系电话" maxlength="20" clearable />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="负责人" prop="owner" required>
            <el-select v-model="formData.owner" placeholder="请选择负责人" style="width: 100%">
              <el-option
                v-for="opt in ownerOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系地址" prop="address">
            <el-input v-model="formData.address" placeholder="请输入联系地址" maxlength="80" clearable />
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
  createCustomer,
  updateCustomer,
  getCustomerById,
  getCustomerSourceOptions,
  customerLevelOptions,
  ownerOptions,
  getCustomerLevelLabel,
  customerLevelTagTypeMap,
  type CustomerItem,
  type CustomerLevel,
} from '@/mock/crm'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: CustomerItem | null
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
  props.mode === 'view' ? '客户详情' : props.mode === 'edit' ? '客户修改' : '客户添加'
)

interface FormData {
  name: string
  sourceName: string
  industry: string
  level: CustomerLevel | ''
  contact: string
  phone: string
  owner: string
  address: string
  remark: string
}

const defaultForm = (): FormData => ({
  name: '',
  sourceName: '',
  industry: '',
  level: 'normal',
  contact: '',
  phone: '',
  owner: '',
  address: '',
  remark: '',
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const formData = reactive<FormData>(defaultForm())
const sourceOptions = ref<{ label: string; value: string }[]>([])

const rules: FormRules = {
  name: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  sourceName: [{ required: true, message: '请选择客户来源', trigger: 'change' }],
  level: [{ required: true, message: '请选择客户级别', trigger: 'change' }],
  contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  owner: [{ required: true, message: '请选择负责人', trigger: 'change' }],
  remark: [{ max: 225, message: '备注不超过 225 个字符', trigger: 'blur' }],
}

function reset() {
  Object.assign(formData, defaultForm())
  formRef.value?.clearValidate()
}

async function loadDetail(id: string) {
  const res = await getCustomerById(id)
  if (res.code !== 200 || !res.data || !res.data.id) {
    ElMessage.warning('客户不存在或已删除')
    visible.value = false
    return
  }
  const r = res.data
  formData.name = r.name
  formData.sourceName = r.sourceName
  formData.industry = r.industry
  formData.level = r.level
  formData.contact = r.contact
  formData.phone = r.phone
  formData.owner = r.owner
  formData.address = r.address
  formData.remark = r.remark || ''
}

watch(
  () => [visible.value, props.mode, props.record],
  async ([vis]) => {
    if (!vis) return
    reset()
    sourceOptions.value = getCustomerSourceOptions()
    if (props.record && props.mode === 'edit') {
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
      sourceName: formData.sourceName,
      industry: formData.industry,
      level: formData.level as CustomerLevel,
      contact: formData.contact,
      phone: formData.phone,
      owner: formData.owner,
      address: formData.address,
      remark: formData.remark,
    }
    if (props.mode === 'add') {
      const res = await createCustomer(payload)
      if (res.code === 200) {
        ElMessage.success('新增成功')
        emit('success')
        visible.value = false
      } else ElMessage.error('新增失败')
    } else if (props.mode === 'edit' && props.record) {
      const res = await updateCustomer(props.record.id, payload)
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
.customer-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}
</style>
