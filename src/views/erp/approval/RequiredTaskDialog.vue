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
      class="required-task-form"
    >
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="任务标题" prop="title" required>
            <el-input
              v-model="formData.title"
              placeholder="请输入任务标题"
              maxlength="80"
              show-word-limit
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="任务内容">
        <RichEditor
          v-model="formData.content"
          :disabled="props.mode === 'view'"
          :min-height="'220px'"
          :max-height="'360px'"
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="任务周期" prop="cycle" required>
            <el-select
              v-model="formData.cycle"
              placeholder="请选择任务周期"
              style="width: 100%"
              clearable
            >
              <el-option
                v-for="opt in taskCycleOptions"
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
          <el-form-item label="任务时间" prop="taskTimeRange" required>
            <el-time-picker
              v-model="formData.taskTimeRange"
              is-range
              value-format="HH:mm"
              format="HH:mm"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="是否提醒" prop="needRemind">
            <el-checkbox v-model="formData.needRemind">是</el-checkbox>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item v-if="formData.needRemind" label="提醒时间" prop="remindHours">
            <div class="remind-cell">
              <el-input-number
                v-model="formData.remindHours"
                :min="1"
                :max="720"
                :controls="false"
                placeholder="请输入"
                style="width: 140px"
              />
              <span class="remind-unit">小时</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- View 模式：提交信息 -->
      <template v-if="props.mode === 'view' && props.record">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="提交人">
              <span>{{ props.record.submitter }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="提交时间">
              <span>{{ props.record.submitTime }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="完成情况">
              <span :class="props.record.todayDone ? 'done-text' : 'undone-text'">
                {{ props.record.todayDone ? '今日已执行' : '今日未执行' }}
              </span>
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
  createRequiredTask,
  updateRequiredTask,
  getRequiredTaskById,
  taskCycleOptions,
  type RequiredTaskItem,
} from '@/mock/requiredTask'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: RequiredTaskItem | null
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
  if (props.mode === 'view') return '必做任务详情'
  return '必做任务添加/修改'
})

interface FormData {
  title: string
  content: string
  cycle: '' | RequiredTaskItem['cycle']
  taskTimeRange: [string, string] | ''
  needRemind: boolean
  remindHours: number | undefined
}

const pad0 = (n: number) => (n < 10 ? `0${n}` : `${n}`)
const nowHM = (): string => {
  const d = new Date()
  return `${pad0(d.getHours())}:${pad0(d.getMinutes())}`
}
const defaultForm = (): FormData => ({
  title: '',
  content: '',
  cycle: 'daily',
  taskTimeRange: [nowHM(), nowHM()],
  needRemind: false,
  remindHours: 24,
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const formData = reactive<FormData>(defaultForm())

const rules = computed<FormRules>(() => ({
  title: [{ required: true, message: '请输入任务标题', trigger: 'blur' }],
  cycle: [{ required: true, message: '请选择任务周期', trigger: 'change' }],
  taskTimeRange: [
    { required: true, message: '请选择任务时间', trigger: 'change' },
    {
      validator: (_r: any, value: [string, string] | '', cb: any) => {
        if (!Array.isArray(value) || !value[0] || !value[1]) return cb()
        if (value[1] < value[0]) {
          return cb(new Error('任务结束时间不能早于开始时间'))
        }
        cb()
      },
      trigger: 'change',
    },
  ],
  remindHours: formData.needRemind
    ? [{ required: true, message: '请输入提醒时间', trigger: 'blur' }]
    : [],
}))

function reset() {
  Object.assign(formData, defaultForm())
  formRef.value?.clearValidate()
}

async function loadDetail(id: string) {
  const res = await getRequiredTaskById(id)
  if (res.code !== 200 || !res.data || !res.data.id) {
    ElMessage.warning('任务不存在或已删除')
    visible.value = false
    return
  }
  const r = res.data
  formData.title = r.title
  formData.content = r.content
  formData.cycle = r.cycle
  formData.taskTimeRange = [r.taskStartTime, r.taskEndTime]
  formData.needRemind = r.needRemind
  formData.remindHours = r.remindHours || 24
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
    const range = formData.taskTimeRange as [string, string]
    const payload = {
      title: formData.title,
      content: formData.content,
      cycle: formData.cycle as RequiredTaskItem['cycle'],
      taskStartTime: range[0],
      taskEndTime: range[1],
      needRemind: formData.needRemind,
      remindHours: formData.needRemind ? formData.remindHours : undefined,
    }
    if (props.mode === 'add') {
      const res = await createRequiredTask(payload)
      if (res.code === 200) {
        ElMessage.success('新增成功')
        emit('success')
        visible.value = false
      } else ElMessage.error('新增失败')
    } else if (props.mode === 'edit' && props.record) {
      const res = await updateRequiredTask(props.record.id, payload)
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
.required-task-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}

.remind-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.remind-unit {
  color: #606266;
}

.done-text {
  color: #67c23a;
}
.undone-text {
  color: #f56c6c;
}
</style>
