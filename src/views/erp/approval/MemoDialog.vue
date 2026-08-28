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
      class="memo-form"
    >
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="标题" prop="title" required>
            <el-input
              v-model="formData.title"
              placeholder="请输入备忘标题"
              maxlength="80"
              show-word-limit
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="分类" prop="category" required>
            <el-select v-model="formData.category" placeholder="请选择分类" style="width: 100%" clearable>
              <el-option
                v-for="opt in memoCategoryOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="内容">
        <RichEditor
          v-model="formData.content"
          :disabled="props.mode === 'view'"
          :min-height="'200px'"
          :max-height="'340px'"
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="是否提醒" prop="remind">
            <el-checkbox v-model="formData.remind" :disabled="props.mode === 'view'">是</el-checkbox>
          </el-form-item>
        </el-col>
        <el-col v-if="formData.remind" :span="12">
          <el-form-item label="提醒时间" prop="remindTime" required>
            <el-date-picker
              v-model="formData.remindTime"
              type="datetime"
              placeholder="请选择提醒时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

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

      <!-- View 模式：操作信息 -->
      <template v-if="props.mode === 'view' && props.record">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="添加人">
              <span>{{ props.record.creator }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作时间">
              <span>{{ props.record.operateTime }}</span>
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
  createMemo,
  updateMemo,
  getMemoById,
  memoCategoryOptions,
  type MemoItem,
  type MemoCategory,
} from '@/mock/memo'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: MemoItem | null
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

const dialogTitle = computed(() => (props.mode === 'view' ? '备忘录详情' : '备忘录修改/添加'))

interface FormData {
  title: string
  category: MemoCategory | ''
  content: string
  remind: boolean
  remindTime: string
  remark: string
}

const defaultForm = (): FormData => ({
  title: '',
  category: '',
  content: '',
  remind: false,
  remindTime: '',
  remark: '',
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const formData = reactive<FormData>(defaultForm())

const rules: FormRules = {
  title: [{ required: true, message: '请输入备忘标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  remindTime: [{ required: true, message: '勾选提醒后请选择提醒时间', trigger: 'change' }],
  remark: [{ max: 225, message: '备注不超过 225 个字符', trigger: 'blur' }],
}

function reset() {
  Object.assign(formData, defaultForm())
  formRef.value?.clearValidate()
}

async function loadDetail(id: string) {
  const res = await getMemoById(id)
  if (res.code !== 200 || !res.data || !res.data.id) {
    ElMessage.warning('备忘不存在或已删除')
    visible.value = false
    return
  }
  const r = res.data
  formData.title = r.title
  formData.category = r.category
  formData.content = r.content
  formData.remind = r.remind
  formData.remindTime = r.remindTime || ''
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
      title: formData.title,
      category: formData.category as MemoCategory,
      content: formData.content,
      remind: formData.remind,
      remindTime: formData.remind ? formData.remindTime : undefined,
      remark: formData.remark,
    }
    if (props.mode === 'add') {
      const res = await createMemo(payload)
      if (res.code === 200) {
        ElMessage.success('新增成功')
        emit('success')
        visible.value = false
      } else ElMessage.error('新增失败')
    } else if (props.mode === 'edit' && props.record) {
      const res = await updateMemo(props.record.id, payload)
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
.memo-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}
</style>
