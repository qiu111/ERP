<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="880px"
    top="4vh"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <!-- View 模式：el-descriptions 只读详情 -->
    <template v-if="props.mode === 'view'">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="合同编号">{{ detail?.contractNo }}</el-descriptions-item>
        <el-descriptions-item label="合同名称">{{ detail?.name }}</el-descriptions-item>
        <el-descriptions-item label="合同类型">
          <el-tag v-if="detail" :type="typeTagTypeMap[detail.type]" effect="light" size="small">
            {{ typeLabel[detail.type] }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="合同状态">
          <el-tag v-if="detail" :type="statusTagTypeMap[detail.status]" effect="light" size="small">
            {{ statusLabel[detail.status] }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="对方单位">{{ detail?.party }}</el-descriptions-item>
        <el-descriptions-item label="合同金额">￥{{ (detail?.amount ?? 0).toLocaleString('zh-CN') }}</el-descriptions-item>
        <el-descriptions-item label="签订日期">{{ detail?.signDate }}</el-descriptions-item>
        <el-descriptions-item label="履行期限">{{ detail?.startDate }} ~ {{ detail?.endDate }}</el-descriptions-item>
        <el-descriptions-item label="经办人">{{ detail?.handler }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detail?.createTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detail?.remark || '—' }}</el-descriptions-item>
        <el-descriptions-item label="合同条款" :span="2">
          <template v-if="detail && detail.terms.length">
            <div v-for="(t, i) in detail.terms" :key="i" class="view-term">
              <div class="view-term__name">{{ i + 1 }}. {{ t.termName }}</div>
              <div class="view-term__content">{{ t.content }}</div>
            </div>
          </template>
          <span v-else class="dash-text">—</span>
        </el-descriptions-item>
        <el-descriptions-item label="附件" :span="2">
          <template v-if="detail && detail.attachments.length">
            <el-tag v-for="a in detail.attachments" :key="a" class="view-attach" effect="plain">{{ a }}</el-tag>
          </template>
          <span v-else class="dash-text">—</span>
        </el-descriptions-item>
      </el-descriptions>
    </template>

    <!-- add/edit 模式：表单 -->
    <el-form
      v-else
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="right"
      class="contract-form"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="合同名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入合同名称" maxlength="80" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="合同类型" prop="type">
            <el-select v-model="formData.type" placeholder="请选择合同类型" style="width: 100%">
              <el-option
                v-for="opt in contractTypeOptions"
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
          <el-form-item label="对方单位" prop="party">
            <el-input v-model="formData.party" placeholder="请输入对方单位" maxlength="80" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="合同金额" prop="amount">
            <el-input-number
              v-model="formData.amount"
              :min="0"
              :precision="2"
              :controls="false"
              placeholder="请输入合同金额"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="签订日期" prop="signDate">
            <el-date-picker
              v-model="formData.signDate"
              type="date"
              placeholder="选择签订日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="开始日期" prop="startDate">
            <el-date-picker
              v-model="formData.startDate"
              type="date"
              placeholder="选择开始日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="结束日期" prop="endDate">
            <el-date-picker
              v-model="formData.endDate"
              type="date"
              placeholder="选择结束日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="经办人" prop="handler">
        <el-input v-model="formData.handler" placeholder="请输入经办人" maxlength="40" clearable />
      </el-form-item>

      <!-- 条款动态增删 -->
      <el-form-item label="合同条款">
        <div class="term-editor">
          <div v-for="(t, i) in formData.terms" :key="i" class="term-editor__row">
            <el-input
              v-model="t.termName"
              placeholder="条款名称"
              maxlength="50"
              style="width: 200px"
            />
            <el-input
              v-model="t.content"
              placeholder="条款内容（最多225个字符）"
              maxlength="225"
              style="flex: 1"
            />
            <el-button type="danger" link @click="removeTerm(i)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
          <el-button type="primary" plain size="small" @click="addTerm">
            <el-icon><Plus /></el-icon>
            添加条款
          </el-button>
        </div>
      </el-form-item>

      <!-- 附件（文件名列表 + FileUpload 追加） -->
      <el-form-item label="附件">
        <div class="attach-editor">
          <div v-if="formData.attachments.length" class="attach-editor__list">
            <el-tag
              v-for="(a, i) in formData.attachments"
              :key="`${a}-${i}`"
              closable
              effect="plain"
              @close="removeAttachment(i)"
            >
              {{ a }}
            </el-tag>
          </div>
          <FileUpload
            multiple
            :limit="10"
            button-text="添加附件"
            @file-change="handleFilesSelected"
          />
        </div>
      </el-form-item>

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
import { Delete, Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import FileUpload from '@/components/FileUpload.vue'
import {
  createContract,
  updateContract,
  getContractById,
  contractTypeOptions,
  typeLabel,
  typeTagTypeMap,
  statusLabel,
  statusTagTypeMap,
  type ContractItem,
  type ContractType,
} from '@/mock/contract'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: ContractItem | null
  /** 覆盖默认标题（供合同收录等场景复用） */
  title?: string
}
const props = withDefaults(defineProps<Props>(), { record: null, title: '' })
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const dialogTitle = computed(() =>
  props.title || (props.mode === 'view' ? '合同详情' : props.mode === 'add' ? '登记合同' : '编辑合同')
)

interface FormData {
  name: string
  type: ContractType | ''
  party: string
  amount: number | undefined
  signDate: string
  startDate: string
  endDate: string
  terms: { termName: string; content: string }[]
  attachments: string[]
  handler: string
  remark: string
}

const defaultForm = (): FormData => ({
  name: '',
  type: '',
  party: '',
  amount: undefined,
  signDate: '',
  startDate: '',
  endDate: '',
  terms: [],
  attachments: [],
  handler: '超级管理员',
  remark: '',
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const formData = reactive<FormData>(defaultForm())
const detail = ref<ContractItem | null>(null)

/** 起止日期异步校验：结束日期必须晚于开始日期 */
const validateEndDate = (_r: any, value: string, cb: (error?: Error) => void) => {
  if (!value || !formData.startDate) return cb()
  Promise.resolve().then(() => {
    const end = new Date(value.replace(/-/g, '/')).getTime()
    const start = new Date(formData.startDate.replace(/-/g, '/')).getTime()
    if (end <= start) {
      cb(new Error('结束日期必须晚于开始日期'))
    } else {
      cb()
    }
  })
}

const rules: FormRules = {
  name: [{ required: true, message: '请输入合同名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择合同类型', trigger: 'change' }],
  party: [{ required: true, message: '请输入对方单位', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入合同金额', trigger: 'blur' }],
  signDate: [{ required: true, message: '请选择签订日期', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [
    { required: true, message: '请选择结束日期', trigger: 'change' },
    { validator: validateEndDate, trigger: 'change' },
  ],
  remark: [{ max: 225, message: '备注不超过 225 个字符', trigger: 'blur' }],
}

function reset() {
  Object.assign(formData, defaultForm())
  detail.value = null
  formRef.value?.clearValidate()
}

// ========== 条款动态增删 ==========
function addTerm() {
  formData.terms.push({ termName: '', content: '' })
}
function removeTerm(index: number) {
  formData.terms.splice(index, 1)
}

// ========== 附件 ==========
function handleFilesSelected(files: File[]) {
  files.forEach((f) => {
    if (f.name && !formData.attachments.includes(f.name)) {
      formData.attachments.push(f.name)
    }
  })
}
function removeAttachment(index: number) {
  formData.attachments.splice(index, 1)
}

async function loadDetail(id: string) {
  const res = await getContractById(id)
  if (res.code !== 200 || !res.data || !res.data.id) {
    ElMessage.warning('合同不存在或已删除')
    visible.value = false
    return
  }
  detail.value = res.data
  const r = res.data
  formData.name = r.name
  formData.type = r.type
  formData.party = r.party
  formData.amount = r.amount
  formData.signDate = r.signDate
  formData.startDate = r.startDate
  formData.endDate = r.endDate
  formData.terms = r.terms.map((t) => ({ termName: t.termName, content: t.content }))
  formData.attachments = [...r.attachments]
  formData.handler = r.handler
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
      name: formData.name.trim(),
      type: formData.type as ContractType,
      party: formData.party.trim(),
      amount: formData.amount ?? 0,
      signDate: formData.signDate,
      startDate: formData.startDate,
      endDate: formData.endDate,
      terms: formData.terms
        .map((t) => ({ termName: t.termName.trim(), content: t.content.trim() }))
        .filter((t) => t.termName || t.content),
      attachments: [...formData.attachments],
      handler: formData.handler.trim() || '超级管理员',
      remark: formData.remark,
    }
    if (props.mode === 'add') {
      const res = await createContract(payload)
      if (res.code === 200) {
        ElMessage.success('登记成功，合同已创建为草稿')
        emit('success')
        visible.value = false
      } else ElMessage.error('登记失败')
    } else if (props.mode === 'edit' && props.record) {
      const res = await updateContract(props.record.id, payload)
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
.contract-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}

.term-editor {
  width: 100%;

  &__row {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    margin-bottom: 8px;
  }
}

.attach-editor {
  width: 100%;

  &__list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;
  }
}

.view-term {
  &:not(:last-child) {
    margin-bottom: 8px;
  }

  &__name {
    font-weight: 600;
    color: #303133;
  }

  &__content {
    color: #606266;
    line-height: 1.6;
    white-space: pre-wrap;
  }
}

.view-attach {
  margin-right: 8px;
}

.dash-text {
  color: #c0c4cc;
}
</style>
