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
      <el-descriptions-item label="仓库名称">{{ record.name }}</el-descriptions-item>
      <el-descriptions-item label="仓库类型">
        <el-tag :type="warehouseTypeTagTypeMap[record.type]" effect="light" size="small">
          {{ record.typeLabel }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="负责人">{{ record.manager }}</el-descriptions-item>
      <el-descriptions-item label="仓库地址" :span="2">{{ record.address }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="statusTagTypeMap[record.status]" effect="light" size="small">
          {{ statusLabelMap[record.status] }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ record.createTime }}</el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">{{ record.remark || '—' }}</el-descriptions-item>
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
          placeholder="请输入仓库编号（纯数字）"
          maxlength="20"
        />
      </el-form-item>

      <el-form-item label="仓库名称" prop="name" required>
        <el-input
          v-model="formData.name"
          placeholder="请输入仓库名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="仓库类型" prop="type" required>
        <el-select v-model="formData.type" placeholder="请选择仓库类型" style="width: 100%">
          <el-option
            v-for="opt in warehouseTypeOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="负责人" prop="manager" required>
        <el-input v-model="formData.manager" placeholder="请输入负责人" maxlength="20" />
      </el-form-item>

      <el-form-item label="仓库地址" prop="address" required>
        <el-input
          v-model="formData.address"
          placeholder="请输入仓库地址"
          maxlength="100"
          show-word-limit
        />
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
  addWarehouse,
  updateWarehouse,
  warehouseTypeOptions,
  warehouseTypeLabelMap,
  warehouseTypeTagTypeMap,
  statusOptions,
  statusLabelMap,
  statusTagTypeMap,
  type Warehouse,
  type WarehouseForm,
} from '@/mock/erpBase'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: Warehouse | null
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
  type: Warehouse['type']
  address: string
  manager: string
  status: Warehouse['status']
  remark: string
}

const defaultFormData = (): FormData => ({
  code: '',
  name: '',
  type: 'finished',
  address: '',
  manager: '',
  status: 'enabled',
  remark: '',
})

const formData = ref<FormData>(defaultFormData())

const formRules: FormRules<FormData> = {
  code: [
    { required: true, message: '请输入仓库编号', trigger: 'blur' },
    { pattern: /^\d+$/, message: '编号必须为纯数字', trigger: 'blur' },
  ],
  name: [{ required: true, message: '请输入仓库名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择仓库类型', trigger: 'change' }],
  address: [{ required: true, message: '请输入仓库地址', trigger: 'blur' }],
  manager: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
  remark: [{ max: 225, message: '备注不超过 225 个字符', trigger: 'blur' }],
}

const dialogTitle = computed(() => {
  if (props.mode === 'view') return '仓库详情'
  return props.mode === 'edit' ? '修改仓库' : '新增仓库'
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
          type: r.type,
          address: r.address,
          manager: r.manager,
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
      const payload: WarehouseForm = { ...formData.value }
      if (props.mode === 'edit' && props.record) {
        await updateWarehouse(props.record.id, payload)
        ElMessage.success('修改成功')
      } else {
        await addWarehouse(payload)
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
