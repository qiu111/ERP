<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="760px"
    top="6vh"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="108px"
      label-position="right"
      :disabled="props.mode === 'view'"
      class="handover-form"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="交接单号">
            <el-input :model-value="handoverNoText" placeholder="保存后自动生成" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="交接类型" prop="type" required>
            <el-select v-model="formData.type" placeholder="请选择交接类型" style="width: 100%">
              <el-option
                v-for="opt in handoverTypeOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="交接主题" prop="subject" required>
            <el-input
              v-model="formData.subject"
              placeholder="请输入交接主题"
              maxlength="80"
              show-word-limit
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="交接人" prop="handoverPerson" required label-width="84px">
            <el-select v-model="formData.handoverPerson" placeholder="请选择" style="width: 100%" clearable>
              <el-option
                v-for="opt in handoverPersonOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="接收人" prop="receiver" required label-width="84px">
            <el-select v-model="formData.receiver" placeholder="请选择" style="width: 100%" clearable>
              <el-option
                v-for="opt in handoverPersonOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="监督人" prop="supervisor" label-width="84px">
            <el-select v-model="formData.supervisor" placeholder="请选择（选填）" style="width: 100%" clearable>
              <el-option
                v-for="opt in handoverPersonOptions"
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
          <el-form-item label="交接时间" prop="handoverTime" required>
            <el-date-picker
              v-model="formData.handoverTime"
              type="datetime"
              placeholder="请选择交接时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="交接内容">
        <RichEditor
          v-model="formData.content"
          :disabled="props.mode === 'view'"
          :min-height="'180px'"
          :max-height="'300px'"
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="24">
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
        </el-col>
      </el-row>

      <!-- View 模式：状态信息 -->
      <template v-if="props.mode === 'view' && props.record">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态">
              <el-tag :type="handoverStatusTagTypeMap[props.record.status]" effect="light" size="small">
                {{ getStatusLabel(props.record.status) }}
              </el-tag>
            </el-form-item>
          </el-col>
        </el-row>
      </template>
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
import RichEditor from '@/components/RichEditor.vue'
import {
  createHandover,
  updateHandover,
  getHandoverById,
  handoverTypeOptions,
  handoverPersonOptions,
  handoverStatusOptions,
  handoverStatusTagTypeMap,
  type HandoverItem,
  type HandoverType,
  type HandoverStatus,
} from '@/mock/workHandover'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: HandoverItem | null
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

const dialogTitle = computed(() => (props.mode === 'view' ? '交接详情' : '工作交接修改/添加'))

interface FormData {
  type: HandoverType | ''
  subject: string
  handoverPerson: string
  receiver: string
  supervisor: string
  handoverTime: string
  content: string
  remark: string
}

const defaultForm = (): FormData => ({
  type: '',
  subject: '',
  handoverPerson: '',
  receiver: '',
  supervisor: '',
  handoverTime: '',
  content: '',
  remark: '',
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const handoverNoText = ref('')
const formData = reactive<FormData>(defaultForm())

const rules: FormRules = {
  type: [{ required: true, message: '请选择交接类型', trigger: 'change' }],
  subject: [{ required: true, message: '请输入交接主题', trigger: 'blur' }],
  handoverPerson: [{ required: true, message: '请选择交接人', trigger: 'change' }],
  receiver: [{ required: true, message: '请选择接收人', trigger: 'change' }],
  handoverTime: [{ required: true, message: '请选择交接时间', trigger: 'change' }],
  remark: [{ max: 225, message: '备注不超过 225 个字符', trigger: 'blur' }],
}

function getStatusLabel(status: HandoverStatus): string {
  return handoverStatusOptions.find((o) => o.value === status)?.label || status
}

function reset() {
  Object.assign(formData, defaultForm())
  handoverNoText.value = ''
  formRef.value?.clearValidate()
}

async function loadDetail(id: string) {
  const res = await getHandoverById(id)
  if (res.code !== 200 || !res.data || !res.data.id) {
    ElMessage.warning('交接单不存在或已删除')
    visible.value = false
    return
  }
  const r = res.data
  handoverNoText.value = r.handoverNo
  formData.type = r.type
  formData.subject = r.subject
  formData.handoverPerson = r.handoverPerson
  formData.receiver = r.receiver
  formData.supervisor = r.supervisor || ''
  formData.handoverTime = r.handoverTime
  formData.content = r.content || ''
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
      type: formData.type as HandoverType,
      subject: formData.subject,
      handoverPerson: formData.handoverPerson,
      receiver: formData.receiver,
      supervisor: formData.supervisor,
      handoverTime: formData.handoverTime,
      content: formData.content,
      remark: formData.remark,
    }
    if (props.mode === 'add') {
      const res = await createHandover(payload)
      if (res.code === 200) {
        ElMessage.success(`新增成功，交接单号：${res.data.handoverNo}`)
        emit('success')
        visible.value = false
      } else ElMessage.error('新增失败')
    } else if (props.mode === 'edit' && props.record) {
      const res = await updateHandover(props.record.id, payload)
      if (res.code === 200 && res.data.id) {
        ElMessage.success('保存成功')
        emit('success')
        visible.value = false
      } else ElMessage.error('保存失败（仅待交接状态允许修改）')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.handover-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}
</style>
