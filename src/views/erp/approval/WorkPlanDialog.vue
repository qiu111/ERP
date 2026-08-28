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
      class="work-plan-form"
    >
      <!-- 动态首字段：审核人（我的工作计划） / 执行人（我安排的工作） -->
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item
            :label="primaryFieldLabel"
            :prop="primaryFieldName"
            required
          >
            <el-select
              v-model="formData[primaryFieldName]"
              :placeholder="`请选择${primaryFieldLabel}人员`"
              style="width: 100%"
              clearable
            >
              <el-option
                v-for="opt in primaryFieldOptions"
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
          <el-form-item label="计划标题" prop="title" required>
            <el-input
              v-model="formData.title"
              placeholder="请输入计划标题"
              maxlength="80"
              show-word-limit
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="计划内容">
        <RichEditor
          v-model="formData.content"
          :disabled="props.mode === 'view'"
          :min-height="'260px'"
          :max-height="'400px'"
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="预计开始时间" prop="plannedStartTime" required>
            <el-date-picker
              v-model="formData.plannedStartTime"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="请选择预计开始时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="预计结束时间" prop="plannedEndTime" required>
            <el-date-picker
              v-model="formData.plannedEndTime"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="请选择预计结束时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- View 模式：额外信息 -->
      <template v-if="props.mode === 'view'">
        <el-row :gutter="20" v-if="formData.actualStartTime || formData.actualEndTime">
          <el-col :span="12" v-if="formData.actualStartTime">
            <el-form-item label="实际开始时间">
              <span>{{ formData.actualStartTime }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="formData.actualEndTime">
            <el-form-item label="实际结束时间">
              <span>{{ formData.actualEndTime }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="props.record && props.record.progressStatus !== 'not_started'">
          <el-col :span="24">
            <el-form-item label="完成程度">
              <el-tag
                :type="progressStatusTagTypeMap[props.record.progressStatus]"
                effect="light"
                size="default"
              >
                {{ getProgressStatusLabel(props.record.progressStatus) }}
              </el-tag>
            </el-form-item>
          </el-col>
        </el-row>
      </template>

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
        {{ props.mode === 'edit' ? '保存' : '保存' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import RichEditor from '@/components/RichEditor.vue'
import {
  createWorkPlan,
  updateWorkPlan,
  getWorkPlanById,
  auditorOptions,
  executorOptions,
  getProgressStatusLabel,
  progressStatusTagTypeMap,
  type WorkPlanItem,
} from '@/mock/workPlan'

type FirstFieldName = 'auditor' | 'executor'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: WorkPlanItem | null
  /** 弹窗首字段语义：审核人（我的工作计划） / 执行人（我安排的工作） */
  firstFieldName?: FirstFieldName
}
const props = withDefaults(defineProps<Props>(), { record: null, firstFieldName: 'auditor' })
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const dialogTitle = computed(() => {
  if (props.mode === 'view') return '工作计划详情'
  return '工作计划添加/修改'
})

const primaryFieldName = computed<FirstFieldName>(() => props.firstFieldName || 'auditor')
const primaryFieldLabel = computed(() => primaryFieldName.value === 'auditor' ? '审核人' : '执行人')
const primaryFieldOptions = computed(() => primaryFieldName.value === 'auditor' ? auditorOptions : executorOptions)

interface FormData {
  auditor: string
  executor: string
  title: string
  content: string
  plannedStartTime: string
  plannedEndTime: string
  actualStartTime?: string
  actualEndTime?: string
  remark: string
}

const pad0 = (n: number) => (n < 10 ? `0${n}` : `${n}`)
const defaultDateTime = (): string => {
  const d = new Date()
  return `${d.getFullYear()}-${pad0(d.getMonth() + 1)}-${pad0(d.getDate())} ${pad0(d.getHours())}:${pad0(d.getMinutes())}:${pad0(d.getSeconds())}`
}
const defaultForm = (): FormData => {
  const start = defaultDateTime()
  const ms = new Date(start.replace(/-/g, '/')).getTime() + 3 * 24 * 3600 * 1000
  const end = new Date(ms)
  const endStr = `${end.getFullYear()}-${pad0(end.getMonth() + 1)}-${pad0(end.getDate())} ${pad0(end.getHours())}:${pad0(end.getMinutes())}:${pad0(end.getSeconds())}`
  // 「我安排的工作」模式：auditor='-'，执行人默认超级管理员；「我的工作计划」模式：auditor=超级管理员
  if (primaryFieldName.value === 'executor') {
    return {
      auditor: '-',
      executor: '超级管理员',
      title: '',
      content: '',
      plannedStartTime: start,
      plannedEndTime: endStr,
      remark: '',
    }
  }
  return {
    auditor: '超级管理员',
    executor: '',
    title: '',
    content: '',
    plannedStartTime: start,
    plannedEndTime: endStr,
    remark: '',
  }
}

const formRef = ref<FormInstance>()
const submitting = ref(false)
const formData = reactive<FormData>(defaultForm())

const rules = computed<FormRules>(() => ({
  auditor:
    primaryFieldName.value === 'auditor'
      ? [{ required: true, message: '请选择审核人', trigger: 'change' }]
      : [],
  executor:
    primaryFieldName.value === 'executor'
      ? [{ required: true, message: '请选择执行人', trigger: 'change' }]
      : [],
  title: [{ required: true, message: '请输入计划标题', trigger: 'blur' }],
  plannedStartTime: [{ required: true, message: '请选择预计开始时间', trigger: 'change' }],
  plannedEndTime: [
    { required: true, message: '请选择预计结束时间', trigger: 'change' },
    {
      validator: (_r: any, value: string, cb: any) => {
        if (!value || !formData.plannedStartTime) return cb()
        if (
          new Date(value.replace(/-/g, '/')).getTime() <
          new Date(formData.plannedStartTime.replace(/-/g, '/')).getTime()
        ) {
          return cb(new Error('预计结束时间晚于预计开始时间'))
        }
        cb()
      },
      trigger: 'change',
    },
  ],
  remark: [{ max: 225, message: '备注不超过 225 个字符', trigger: 'blur' }],
}))

function reset() {
  Object.assign(formData, defaultForm())
  formRef.value?.clearValidate()
}

async function loadDetail(id: string) {
  const res = await getWorkPlanById(id)
  if (res.code !== 200 || !res.data || !res.data.id) {
    ElMessage.warning('计划不存在或已删除')
    visible.value = false
    return
  }
  const r = res.data
  formData.auditor = r.auditor
  formData.executor = r.executor || ''
  formData.title = r.title
  formData.content = r.content
  formData.plannedStartTime = r.plannedStartTime
  formData.plannedEndTime = r.plannedEndTime
  formData.actualStartTime = r.actualStartTime
  formData.actualEndTime = r.actualEndTime
  formData.remark = r.remark || ''
}

watch(
  () => [visible.value, props.mode, props.record, props.firstFieldName],
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
      auditor: formData.auditor,
      executor: formData.executor,
      title: formData.title,
      content: formData.content,
      plannedStartTime: formData.plannedStartTime,
      plannedEndTime: formData.plannedEndTime,
      remark: formData.remark,
    }
    if (props.mode === 'add') {
      const res = await createWorkPlan(payload)
      if (res.code === 200) {
        ElMessage.success('新增成功')
        emit('success')
        visible.value = false
      } else ElMessage.error('新增失败')
    } else if (props.mode === 'edit' && props.record) {
      const res = await updateWorkPlan(props.record.id, payload)
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
.work-plan-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}
</style>
