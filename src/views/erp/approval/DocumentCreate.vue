<template>
  <div class="doc-create">
    <div class="doc-create__header">
      <el-icon><Edit /></el-icon>
      <span>发起公文</span>
      <el-tag v-if="editingId" type="warning" effect="plain" size="small" closable @close="resetForm">
        正在编辑草稿：{{ editingDocNo }}
      </el-tag>
    </div>

    <el-card shadow="never" class="doc-create__card">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="108px"
        label-position="right"
        class="doc-create__form"
      >
        <el-row :gutter="20">
          <el-col :span="16">
            <el-form-item label="公文标题" prop="title" required>
              <el-input
                v-model="formData.title"
                placeholder="请输入公文标题"
                maxlength="80"
                show-word-limit
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="文种" prop="docType" required>
              <el-select v-model="formData.docType" placeholder="请选择文种" style="width: 100%">
                <el-option
                  v-for="opt in docTypeOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="缓急" prop="urgency">
              <el-select v-model="formData.urgency" placeholder="默认普通" style="width: 100%">
                <el-option
                  v-for="opt in docUrgencyOptions"
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
            <el-form-item label="主送人员" prop="recipients" required>
              <el-select
                v-model="formData.recipients"
                placeholder="请选择主送人员（可多选）"
                style="width: 100%"
                multiple
                collapse-tags
                collapse-tags-tooltip
              >
                <el-option
                  v-for="opt in recipientOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="正文内容" prop="content" required>
          <RichEditor
            v-model="formData.content"
            :min-height="'220px'"
            :max-height="'360px'"
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

        <div class="doc-create__actions">
          <el-button type="warning" @click="handleSave(true)" :loading="submitting">
            存草稿
          </el-button>
          <el-button type="primary" @click="handleSave(false)" :loading="submitting">
            {{ editingId ? '保存并发送' : '提交并发送' }}
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Edit } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import RichEditor from '@/components/RichEditor.vue'
import {
  createDocument,
  getDocumentById,
  sendDocument,
  docTypeOptions,
  docUrgencyOptions,
  recipientOptions,
  type DocType,
  type DocUrgency,
} from '@/mock/document'

interface FormData {
  title: string
  docType: DocType | ''
  urgency: DocUrgency
  recipients: string[]
  content: string
  remark: string
}

const defaultForm = (): FormData => ({
  title: '',
  docType: '',
  urgency: '普通',
  recipients: [],
  content: '',
  remark: '',
})

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const editingId = ref('')
const editingDocNo = ref('')
const formData = reactive<FormData>(defaultForm())

const rules: FormRules = {
  title: [{ required: true, message: '请输入公文标题', trigger: 'blur' }],
  docType: [{ required: true, message: '请选择文种', trigger: 'change' }],
  recipients: [{ required: true, message: '请选择主送人员', trigger: 'change' }],
  content: [{ required: true, message: '请输入正文内容', trigger: 'blur' }],
  remark: [{ max: 225, message: '备注不超过 225 个字符', trigger: 'blur' }],
}

function resetForm() {
  editingId.value = ''
  editingDocNo.value = ''
  Object.assign(formData, defaultForm())
  formRef.value?.clearValidate()
  if (route.query.id) router.replace({ path: route.path })
}

/** 从待发公文页跳转编辑草稿 */
async function loadDraft(id: string) {
  const res = await getDocumentById(id)
  if (res.code !== 200 || !res.data || !res.data.id || res.data.status !== 'draft') {
    ElMessage.warning('草稿不存在或已发送')
    router.replace({ path: route.path })
    return
  }
  editingId.value = res.data.id
  editingDocNo.value = res.data.docNo
  formData.title = res.data.title
  formData.docType = res.data.docType
  formData.urgency = res.data.urgency
  formData.recipients = [...res.data.recipients]
  formData.content = res.data.content
  formData.remark = res.data.remark || ''
}

onMounted(() => {
  const id = route.query.id as string
  if (id) loadDraft(id)
})

const handleSave = async (asDraft: boolean) => {
  if (!formRef.value) return
  try { await formRef.value.validate() } catch { return }
  submitting.value = true
  try {
    if (!editingId.value) {
      // 新建：草稿或直接发送
      const res = await createDocument({
        title: formData.title,
        docType: formData.docType as DocType,
        urgency: formData.urgency,
        recipients: formData.recipients,
        content: formData.content,
        remark: formData.remark,
      }, asDraft)
      if (res.code === 200) {
        ElMessage.success(asDraft ? '已存入待发公文' : `公文已发送（${res.data.docNo}）`)
        resetForm()
      } else ElMessage.error('操作失败')
    } else {
      // 编辑草稿场景：发送走草稿更新+发送；存草稿重新创建并删除旧草稿
      const { updateDocumentDraft } = await import('@/mock/document')
      const res = await updateDocumentDraft(editingId.value, {
        title: formData.title,
        docType: formData.docType as DocType,
        urgency: formData.urgency,
        recipients: formData.recipients,
        content: formData.content,
        remark: formData.remark,
      }, asDraft)
      if (res.code === 200 && res.data.id) {
        ElMessage.success(asDraft ? '草稿已保存' : `公文已发送（${res.data.docNo}）`)
        resetForm()
      } else ElMessage.error('操作失败')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.doc-create {
  padding: 16px;
  height: calc(100vh - 100px);
  overflow: auto;

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
  }

  &__card {
    max-width: 960px;
  }

  &__actions {
    display: flex;
    justify-content: center;
    gap: 12px;
    padding: 12px 0 4px;
  }
}
</style>
