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
      class="announcement-form"
    >
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="标题" prop="title" required>
            <el-input
              v-model="formData.title"
              placeholder="请输入公告标题"
              maxlength="80"
              show-word-limit
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="内容">
        <RichEditor
          v-model="formData.content"
          :disabled="props.mode === 'view'"
          :min-height="'220px'"
          :max-height="'360px'"
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="查看选择人" prop="viewers">
            <el-select
              v-model="formData.viewers"
              placeholder="请选择可查看人员"
              style="width: 100%"
              multiple
              collapse-tags
              collapse-tags-tooltip
              clearable
            >
              <el-option
                v-for="opt in viewerOptions"
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
          <el-form-item label="上传附件" prop="attachments">
            <!-- 详情模式：附件名称标签 -->
            <div v-if="props.mode === 'view'" class="attachment-tags">
              <template v-if="formData.attachments.length">
                <el-tag
                  v-for="name in formData.attachments"
                  :key="name"
                  type="info"
                  effect="plain"
                  class="attachment-tag"
                >
                  <el-icon><Paperclip /></el-icon>
                  {{ name }}
                </el-tag>
              </template>
              <span v-else class="dash-text">无附件</span>
            </div>
            <!-- 编辑模式：Mock 上传（仅记录文件名） -->
            <FileUpload
              v-else
              button-text="点击选择文件"
              button-type="primary"
              :multiple="false"
              :limit="1"
              @change="handleFileSelected"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 已选附件（编辑模式） -->
      <el-row v-if="props.mode !== 'view' && formData.attachments.length" :gutter="20">
        <el-col :span="24">
          <el-form-item label="附件列表">
            <div class="attachment-tags">
              <el-tag
                v-for="(name, idx) in formData.attachments"
                :key="name"
                type="info"
                effect="plain"
                closable
                class="attachment-tag"
                @close="formData.attachments.splice(idx, 1)"
              >
                <el-icon><Paperclip /></el-icon>
                {{ name }}
              </el-tag>
            </div>
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
            <el-form-item label="操作人">
              <span>{{ props.record.operator }}</span>
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
import { Paperclip } from '@element-plus/icons-vue'
import RichEditor from '@/components/RichEditor.vue'
import FileUpload from '@/components/FileUpload.vue'
import {
  createAnnouncement,
  updateAnnouncement,
  getAnnouncementById,
  viewerOptions,
  type AnnouncementItem,
} from '@/mock/announcement'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: AnnouncementItem | null
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
  if (props.mode === 'view') return '公告详情'
  return '公告修改/添加'
})

interface FormData {
  title: string
  content: string
  viewers: string[]
  attachments: string[]
  remark: string
}

const defaultForm = (): FormData => ({
  title: '',
  content: '',
  viewers: [],
  attachments: [],
  remark: '',
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const formData = reactive<FormData>(defaultForm())

const rules: FormRules = {
  title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  remark: [{ max: 225, message: '备注不超过 225 个字符', trigger: 'blur' }],
}

function reset() {
  Object.assign(formData, defaultForm())
  formRef.value?.clearValidate()
}

/** Mock 上传：仅记录文件名（去重） */
const handleFileSelected = (file: unknown) => {
  const f = file as { name?: string } | null
  if (f && f.name && !formData.attachments.includes(f.name)) {
    formData.attachments.push(f.name)
  }
}

async function loadDetail(id: string) {
  const res = await getAnnouncementById(id)
  if (res.code !== 200 || !res.data || !res.data.id) {
    ElMessage.warning('公告不存在或已删除')
    visible.value = false
    return
  }
  const r = res.data
  formData.title = r.title
  formData.content = r.content
  formData.viewers = [...(r.viewers || [])]
  formData.attachments = [...(r.attachments || [])]
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
      content: formData.content,
      viewers: formData.viewers,
      attachments: formData.attachments,
      remark: formData.remark,
    }
    if (props.mode === 'add') {
      const res = await createAnnouncement(payload)
      if (res.code === 200) {
        ElMessage.success('新增成功')
        emit('success')
        visible.value = false
      } else ElMessage.error('新增失败')
    } else if (props.mode === 'edit' && props.record) {
      const res = await updateAnnouncement(props.record.id, payload)
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
.announcement-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}

.attachment-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
}

.attachment-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.dash-text {
  color: #909399;
}
</style>
