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
      label-width="96px"
      label-position="right"
      :disabled="isReadonlyMode"
      class="work-log-form"
    >
      <!-- 第一行：总结标题 + 总结类型 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="总结标题" prop="title" required>
            <el-input
              v-model="formData.title"
              placeholder="请输入总结标题"
              maxlength="80"
              show-word-limit
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="总结类型" prop="summaryType" required>
            <el-select
              v-model="formData.summaryType"
              placeholder="请选择总结类型"
              style="width: 100%"
              clearable
            >
              <el-option
                v-for="opt in summaryTypeOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第二行：审核人 + 总结日期 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="审核人" prop="auditor" required>
            <el-select
              v-model="formData.auditor"
              placeholder="请选择审核人"
              style="width: 100%"
              clearable
            >
              <el-option
                v-for="opt in auditorOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="总结日期">
            <el-date-picker
              v-model="formData.summaryDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 工作计划（只读列表） -->
      <el-form-item label="工作计划">
        <div class="plan-block">
          <template v-if="formData.workPlans && formData.workPlans.length">
            <div
              v-for="(p, idx) in formData.workPlans"
              :key="p.id || idx"
              class="plan-row"
            >
              <span class="plan-date">{{ p.date }}</span>
              <span class="plan-content">{{ p.content }}</span>
              <el-tag
                :type="planStatusTagTypeMap[p.status]"
                size="small"
                effect="plain"
              >
                {{ getPlanStatusLabel(p.status) }}
              </el-tag>
            </div>
          </template>
          <el-empty v-else description="暂无工作计划" :image-size="60" />
        </div>
      </el-form-item>

      <!-- 总结内容：使用公共 RichEditor 组件 -->
      <el-form-item label="总结内容">
        <RichEditor
          v-model="formData.summaryContent"
          :disabled="isReadonlyMode"
          :min-height="'240px'"
          :max-height="'360px'"
        />
      </el-form-item>

      <!-- 上传附件：调用公共 FileUpload 组件，多选逐个追加 -->
      <el-form-item label="上传附件">
        <div class="attachment-wrap">
          <FileUpload
            v-if="!isReadonlyMode"
            v-model="uploadSlot"
            button-text="选择附件"
            button-type="default"
            :multiple="false"
            :limit="1"
            tip="支持常见办公文档/图片/压缩包，单文件 ≤10MB"
            @change="handleFileSelected"
          />
          <div
            v-if="formData.attachments && formData.attachments.length"
            class="attachment-list"
          >
            <div
              v-for="(f, idx) in formData.attachments"
              :key="f.id || idx"
              class="attachment-item"
            >
              <el-icon class="att-icon"><Paperclip /></el-icon>
              <span class="att-name" :title="f.fileName">{{ f.fileName }}</span>
              <span class="att-size">{{ f.fileSize }}</span>
              <el-icon
                v-if="!isReadonlyMode"
                class="att-remove"
                title="移除"
                @click="removeAttachment(idx)"
              ><Close /></el-icon>
            </div>
          </div>
        </div>
      </el-form-item>
    </el-form>

    <!-- 审核结果（view 模式且非 pending 时显示） -->
    <div
      v-if="props.mode === 'view' && props.record && props.record.auditStatus !== 'pending'"
      class="audit-panel"
    >
      <div class="audit-title">审核结果</div>
      <div class="audit-row">
        <span class="audit-label">审核状态</span>
        <el-tag
          :type="auditStatusTagTypeMap[props.record.auditStatus]"
          effect="light"
          size="small"
        >{{ getAuditStatusLabel(props.record.auditStatus) }}</el-tag>
      </div>
      <div v-if="props.record.auditTime" class="audit-row">
        <span class="audit-label">审核时间</span>
        <span>{{ props.record.auditTime }}</span>
      </div>
      <div v-if="props.record.auditOpinion" class="audit-row">
        <span class="audit-label">审核意见</span>
        <span class="audit-opinion">{{ props.record.auditOpinion }}</span>
      </div>
    </div>

    <!-- 审核操作区（audit 模式独占） -->
    <div v-if="props.mode === 'audit'" class="audit-operation">
      <el-divider />
      <el-form
        ref="auditFormRef"
        :model="auditForm"
        :rules="auditRules"
        label-width="96px"
        label-position="right"
      >
        <el-form-item label="当前审核人">
          <span>{{ auditForm.auditor }}</span>
        </el-form-item>
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditForm.auditResult">
            <el-radio value="passed" border>
              <el-icon style="color: #67c23a;"><CircleCheck /></el-icon>
              <span>审核通过</span>
            </el-radio>
            <el-radio value="rejected" border>
              <el-icon style="color: #f56c6c;"><CircleClose /></el-icon>
              <span>审核驳回</span>
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见" prop="auditOpinion" required>
          <el-input
            v-model="auditForm.auditOpinion"
            type="textarea"
            :rows="4"
            :placeholder="opinionPlaceholder"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="handleClose">
        {{ props.mode === 'view' ? '关闭' : '取消' }}
      </el-button>
      <el-button
        v-if="!isReadonlyMode"
        type="primary"
        :loading="submitting"
        @click="handleSubmit"
      >
        {{ props.mode === 'edit' ? '保存修改' : '提交' }}
      </el-button>
      <template v-if="props.mode === 'audit'">
        <el-button
          type="danger"
          :loading="auditSubmitting"
          @click="handleAuditSubmit('rejected')"
        >
          <el-icon><CircleClose /></el-icon>
          驳回
        </el-button>
        <el-button
          type="success"
          :loading="auditSubmitting"
          @click="handleAuditSubmit('passed')"
        >
          <el-icon><CircleCheck /></el-icon>
          通过
        </el-button>
      </template>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Paperclip, Close, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import RichEditor from '@/components/RichEditor.vue'
import FileUpload from '@/components/FileUpload.vue'
import {
  createWorkLog,
  updateWorkLog,
  getWorkLogById,
  auditWorkLog,
  summaryTypeOptions,
  auditorOptions,
  getAuditStatusLabel,
  getPlanStatusLabel,
  planStatusTagTypeMap,
  auditStatusTagTypeMap,
  type WorkLogItem,
  type WorkPlanItem,
  type WorkAttachmentItem,
  type WorkAuditResult,
} from '@/mock/workLog'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view' | 'audit'
  record?: WorkLogItem | null
  /** 审核预设结果（audit 模式可选，默认 'passed'） */
  auditType?: WorkAuditResult
  /** 当前审核人（默认超级管理员） */
  auditorName?: string
}
const props = withDefaults(defineProps<Props>(), {
  record: null,
  auditType: 'passed',
  auditorName: '超级管理员',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
  (e: 'auditSuccess', result: WorkAuditResult, record: WorkLogItem): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const isReadonlyMode = computed(() => props.mode === 'view' || props.mode === 'audit')

const dialogTitle = computed(() => {
  if (props.mode === 'add') return '新增工作日志'
  if (props.mode === 'edit') return '编辑工作日志'
  if (props.mode === 'audit') return '审核日志'
  return '日志详情'
})

interface FormData {
  title: string
  summaryType: WorkLogItem['summaryType'] | ''
  auditor: string
  summaryDate: string
  summaryContent: string
  workPlans: WorkPlanItem[]
  attachments: WorkAttachmentItem[]
}

const defaultFormData = (): FormData => {
  const now = new Date()
  const y = now.getFullYear()
  const m = (now.getMonth() + 1).toString().padStart(2, '0')
  const d = now.getDate().toString().padStart(2, '0')
  const today = `${y}-${m}-${d}`
  return {
    title: `${today} 超级管理员的工作总结`,
    summaryType: 'daily',
    auditor: '超级管理员',
    summaryDate: today,
    summaryContent: '',
    workPlans: [],
    attachments: [],
  }
}

const formRef = ref<FormInstance>()
const submitting = ref(false)
const formData = reactive<FormData>(defaultFormData())

// 单文件接收槽，每次 @change 后转为 WorkAttachmentItem 追加，然后清空
const uploadSlot = ref('')

const rules: FormRules = {
  title: [{ required: true, message: '请输入总结标题', trigger: 'blur' }],
  summaryType: [{ required: true, message: '请选择总结类型', trigger: 'change' }],
  auditor: [{ required: true, message: '请选择审核人', trigger: 'change' }],
}

// =========== 审核模式 ===========
const auditFormRef = ref<FormInstance>()
const auditSubmitting = ref(false)
interface AuditFormData {
  auditor: string
  auditResult: WorkAuditResult
  auditOpinion: string
}
const auditForm = reactive<AuditFormData>({
  auditor: props.auditorName,
  auditResult: props.auditType,
  auditOpinion: '',
})
const auditRules: FormRules<AuditFormData> = {
  auditOpinion: [
    { required: true, message: '请填写审核意见', trigger: 'blur' },
    { min: 2, max: 500, message: '审核意见长度在 2 到 500 个字符', trigger: 'blur' },
  ],
}
const opinionPlaceholder = computed(() =>
  auditForm.auditResult === 'passed'
    ? '请输入通过的审核意见（至少2个字符）'
    : '请输入驳回的原因（至少2个字符）'
)

// =========== 初始化 ===========
function resetForm() {
  Object.assign(formData, defaultFormData())
  uploadSlot.value = ''
  formRef.value?.clearValidate()
  auditForm.auditor = props.auditorName
  auditForm.auditResult = props.auditType
  auditForm.auditOpinion = ''
  auditFormRef.value?.clearValidate()
}

async function loadDetail(id: string) {
  const res = await getWorkLogById(id)
  if (res.code !== 200 || !res.data || !res.data.id) {
    ElMessage.warning('日志不存在或已被删除')
    visible.value = false
    return
  }
  const r = res.data
  formData.title = r.title
  formData.summaryType = r.summaryType
  formData.auditor = r.auditor
  formData.summaryDate = r.summaryDate
  formData.summaryContent = r.summaryContent
  formData.workPlans = JSON.parse(JSON.stringify(r.workPlans || []))
  formData.attachments = JSON.parse(JSON.stringify(r.attachments || []))
}

watch(
  () => [visible.value, props.mode, props.record, props.auditType, props.auditorName],
  async ([vis]) => {
    if (!vis) return
    resetForm()
    if (props.record && (props.mode === 'edit' || props.mode === 'view' || props.mode === 'audit')) {
      await loadDetail(props.record.id)
    }
  },
  { immediate: true }
)

// =========== 附件：公共 FileUpload → WorkAttachmentItem[] ===========
const _formatBytes = (bytes: number): string => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let size = bytes
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  return `${size.toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}
const _nowStr = () => {
  const d = new Date()
  const p = (n: number) => (n < 10 ? '0' + n : '' + n)
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}
function handleFileSelected(file: any) {
  if (isReadonlyMode.value || !file) return
  // FileUpload 公共组件 UploadedFile 结构：{ name, url, size }
  const att: WorkAttachmentItem = {
    id: `ATT_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    fileName: file.name || '未命名文件',
    fileSize: _formatBytes(file.size || 0),
    uploadTime: _nowStr(),
    url: file.url || '',
  }
  formData.attachments.push(att)
  ElMessage.success(`已添加附件：${att.fileName}`)
  // 清空接收槽以便再次选择同名文件
  uploadSlot.value = ''
}
function removeAttachment(index: number) {
  formData.attachments.splice(index, 1)
}

// =========== 提交 ===========
const handleClose = () => { visible.value = false }

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  submitting.value = true
  try {
    const payload = {
      title: formData.title,
      summaryType: formData.summaryType as WorkLogItem['summaryType'],
      auditor: formData.auditor,
      summaryDate: formData.summaryDate,
      summaryContent: formData.summaryContent,
      workPlans: formData.workPlans,
      attachments: formData.attachments,
    }
    if (props.mode === 'add') {
      const res = await createWorkLog(payload)
      if (res.code === 200) {
        ElMessage.success('新增工作日志成功')
        emit('success')
        visible.value = false
      } else {
        ElMessage.error('新增失败')
      }
    } else if (props.mode === 'edit' && props.record) {
      const res = await updateWorkLog(props.record.id, payload)
      if (res.code === 200) {
        ElMessage.success('修改成功')
        emit('success')
        visible.value = false
      } else {
        ElMessage.error('修改失败')
      }
    }
  } finally {
    submitting.value = false
  }
}

// =========== 审核提交 ===========
const handleAuditSubmit = async (result: WorkAuditResult) => {
  if (!props.record) return
  auditForm.auditResult = result
  if (!auditFormRef.value) return
  try {
    await auditFormRef.value.validate()
  } catch {
    return
  }
  auditSubmitting.value = true
  try {
    const res = await auditWorkLog(props.record.id, {
      auditor: auditForm.auditor,
      auditResult: auditForm.auditResult,
      auditOpinion: auditForm.auditOpinion,
    })
    if (res.code === 200 && res.data && res.data.id) {
      ElMessage.success(auditForm.auditResult === 'passed' ? '审核通过成功' : '审核驳回成功')
      emit('auditSuccess', auditForm.auditResult, res.data)
      emit('success')
      visible.value = false
    } else {
      ElMessage.error(res.message || (auditForm.auditResult === 'passed' ? '通过失败' : '驳回失败'))
    }
  } finally {
    auditSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
.work-log-form {
  /* 顶部表单直接置于 Dialog body，避免层层卡片视觉堆积 */
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}

/* 工作计划块（只读） */
.plan-block {
  width: 100%;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background: #fafbfc;
  padding: 10px 14px;
  min-height: 96px;

  .plan-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 0;
    border-bottom: 1px dashed #ebeef5;
    &:last-child { border-bottom: none; }
  }
  .plan-date {
    flex-shrink: 0;
    width: 110px;
    color: #606266;
    font-size: 13px;
  }
  .plan-content {
    flex: 1;
    color: #303133;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

/* 附件区 */
.attachment-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .attachment-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .attachment-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    background: #fff;
    width: fit-content;
    min-width: 360px;
    max-width: 600px;
  }
  .att-icon { color: #409eff; font-size: 15px; }
  .att-name {
    color: #303133;
    max-width: 300px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .att-size { color: #909399; font-size: 12px; margin-left: auto; }
  .att-remove {
    color: #c0c4cc;
    cursor: pointer;
    font-size: 14px;
    margin-left: 6px;
    transition: color 0.2s;
    &:hover { color: #f56c6c; }
  }
}

/* 审核结果面板（View 模式） */
.audit-panel {
  margin-top: 4px;
  padding: 14px 18px;
  background: #f8fafc;
  border: 1px dashed #ebeef5;
  border-radius: 6px;

  .audit-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 10px;
  }
  .audit-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 4px 0;
    font-size: 13px;
  }
  .audit-label {
    color: #909399;
    width: 72px;
    flex-shrink: 0;
  }
  .audit-opinion {
    color: #303133;
    white-space: pre-wrap;
    line-height: 1.6;
  }
}

/* 审核操作区（Audit 模式） */
.audit-operation {
  margin-top: 4px;
}
</style>
