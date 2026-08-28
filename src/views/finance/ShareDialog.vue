<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="680px"
    top="8vh"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="right"
      :disabled="props.mode === 'view'"
      class="share-form"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="合作方" prop="partnerName" required>
            <el-input v-model="formData.partnerName" placeholder="请输入合作方名称" maxlength="60" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="分润期间" prop="period" required>
            <el-date-picker
              v-model="formData.period"
              type="month"
              value-format="YYYY-MM"
              placeholder="选择月份"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="分润金额" prop="shareAmount" required>
            <el-input-number
              v-model="formData.shareAmount"
              :min="0.01"
              :precision="2"
              :controls="false"
              placeholder="请输入分润金额"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="分润比例(%)" prop="ratio" required>
            <el-input-number
              v-model="formData.ratio"
              :min="0"
              :max="100"
              :precision="2"
              :controls="false"
              placeholder="请输入分润比例"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 编辑/查看：状态相关字段禁用展示（状态由"结算"动作驱动） -->
      <el-row v-if="props.mode !== 'add' && formData.status" :gutter="20">
        <el-col :span="12">
          <el-form-item label="状态">
            <el-select :model-value="formData.status" disabled style="width: 100%">
              <el-option
                v-for="opt in shareStatusOptions"
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
          placeholder="请输入备注（选填）"
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
  getShareById,
  createShare,
  updateShare,
  shareStatusOptions,
  type ShareItem,
  type ShareStatus,
} from '@/mock/finance'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: ShareItem | null
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
  if (props.mode === 'view') return '分润详情'
  return '分润添加/修改'
})

interface FormData {
  partnerName: string
  period: string
  shareAmount: number | undefined
  ratio: number | undefined
  status: '' | ShareStatus
  remark: string
}

const defaultForm = (): FormData => ({
  partnerName: '',
  period: '',
  shareAmount: undefined,
  ratio: undefined,
  status: '',
  remark: '',
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const formData = reactive<FormData>(defaultForm())

const rules: FormRules = {
  partnerName: [{ required: true, message: '请输入合作方名称', trigger: 'blur' }],
  period: [{ required: true, message: '请选择分润期间', trigger: 'change' }],
  shareAmount: [{ required: true, message: '请输入分润金额', trigger: 'blur' }],
  ratio: [{ required: true, message: '请输入分润比例', trigger: 'blur' }],
}

function reset() {
  Object.assign(formData, defaultForm())
  formRef.value?.clearValidate()
}

async function loadDetail(id: string) {
  const res = await getShareById(id)
  if (res.code !== 200 || !res.data || !res.data.id) {
    ElMessage.warning('分润记录不存在或已删除')
    visible.value = false
    return
  }
  const r = res.data
  formData.partnerName = r.partnerName
  formData.period = r.period
  formData.shareAmount = r.shareAmount
  formData.ratio = r.ratio
  formData.status = r.status
  formData.remark = r.remark || ''
}

watch(
  () => [visible.value, props.mode, props.record],
  async ([vis]) => {
    if (!vis) return
    reset()
    if (props.record && (props.mode === 'edit' || props.mode === 'view')) {
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
      partnerName: formData.partnerName,
      period: formData.period,
      shareAmount: (formData.shareAmount ?? 0) as number,
      ratio: (formData.ratio ?? 0) as number,
      remark: formData.remark,
    }
    if (props.mode === 'add') {
      const res = await createShare(payload)
      if (res.code === 200) {
        ElMessage.success('新增成功')
        emit('success')
        visible.value = false
      } else ElMessage.error('新增失败')
    } else if (props.mode === 'edit' && props.record) {
      const res = await updateShare(props.record.id, payload)
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
.share-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}
</style>
