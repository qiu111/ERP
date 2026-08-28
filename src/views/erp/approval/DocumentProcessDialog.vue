<template>
  <el-dialog
    v-model="visible"
    title="公文处理"
    width="680px"
    top="8vh"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <!-- 公文概要 -->
    <el-descriptions :column="2" border class="process-summary">
      <el-descriptions-item label="公文字号" :span="2">{{ record?.docNo }}</el-descriptions-item>
      <el-descriptions-item label="标题" :span="2">{{ record?.title }}</el-descriptions-item>
      <el-descriptions-item label="文种">{{ record?.docType }}</el-descriptions-item>
      <el-descriptions-item label="缓急">
        <el-tag :type="urgencyTagTypeMap[record?.urgency as DocUrgency]" effect="light" size="small">
          {{ record?.urgency }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="正文" :span="2">
        <div class="doc-content" v-html="record?.content"></div>
      </el-descriptions-item>
    </el-descriptions>

    <!-- 处理操作区 -->
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="88px">
      <el-form-item label="处理动作" prop="action" required>
        <el-radio-group v-model="formData.action">
          <el-radio
            v-for="opt in processActionOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="处理意见" prop="opinion" required>
        <el-input
          v-model="formData.opinion"
          type="textarea"
          :rows="3"
          maxlength="200"
          show-word-limit
          placeholder="请输入处理意见（2-200字）"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import {
  processActionOptions,
  processDocument,
  urgencyTagTypeMap,
  type DocumentItem,
  type DocUrgency,
  type ProcessAction,
} from '@/mock/document'

interface Props {
  modelValue: boolean
  record?: DocumentItem | null
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

const formRef = ref<FormInstance>()
const submitting = ref(false)
const formData = reactive<{ action: ProcessAction | ''; opinion: string }>({
  action: '',
  opinion: '',
})

const rules: FormRules = {
  action: [{ required: true, message: '请选择处理动作', trigger: 'change' }],
  opinion: [
    { required: true, message: '请输入处理意见', trigger: 'blur' },
    { min: 2, max: 200, message: '意见长度 2-200 字', trigger: 'blur' },
  ],
}

watch(visible, (v) => {
  if (v) {
    formData.action = ''
    formData.opinion = ''
    formRef.value?.clearValidate()
  }
})

const handleSubmit = async () => {
  if (!formRef.value || !props.record) return
  try { await formRef.value.validate() } catch { return }
  submitting.value = true
  try {
    const res = await processDocument(props.record.id, {
      action: formData.action as ProcessAction,
      opinion: formData.opinion,
    })
    if (res.code === 200 && res.data.id) {
      ElMessage.success(res.data.status === 'completed' ? '处理成功，公文已完成' : '处理成功')
      emit('success')
      visible.value = false
    } else {
      ElMessage.error('处理失败（公文可能已被撤回或已处理）')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.process-summary {
  margin-bottom: 16px;
}

.doc-content {
  max-height: 180px;
  overflow: auto;
  line-height: 1.7;

  :deep(p) {
    margin: 0 0 8px;
  }
}
</style>
