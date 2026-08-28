<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="78%"
    top="5vh"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <div class="approval-template-dialog">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="110px"
        label-position="right"
        :disabled="mode === 'view'"
      >
        <!-- Section 1: 基础信息 -->
        <div class="form-section">
          <div class="section-title">基础信息</div>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="模板编号" prop="code">
                <el-input v-model="formData.code" placeholder="留空则自动编号 TPL-XXXX" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="模板名称" prop="name" required>
                <el-input
                  v-model="formData.name"
                  placeholder="请输入模板名称"
                  maxlength="60"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="适用分类" prop="category" required>
                <el-select
                  v-model="formData.category"
                  placeholder="请选择适用分类"
                  style="width: 100%"
                >
                  <el-option
                    v-for="opt in templateCategoryOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="模板状态" prop="status">
                <el-radio-group v-model="formData.status">
                  <el-radio
                    v-for="opt in templateStatusOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >{{ opt.label }}</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="适用角色" prop="applicableRoles">
                <el-select
                  v-model="formData.applicableRoles"
                  multiple
                  collapse-tags
                  collapse-tags-tooltip
                  placeholder="可多选，不选默认全部角色"
                  style="width: 100%"
                >
                  <el-option
                    v-for="opt in commonRoleOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="创建人" prop="creator">
                <el-select v-model="formData.creator" placeholder="请选择创建人" style="width: 100%">
                  <el-option label="超级管理员" value="超级管理员" />
                  <el-option label="C用户" value="C用户" />
                  <el-option label="主理人" value="主理人" />
                  <el-option label="A用户" value="A用户" />
                  <el-option label="B用户" value="B用户" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="生效金额(元)" required>
                <div class="amount-range-inputs">
                  <el-input-number
                    v-model="formData.amountRange.min"
                    :min="0"
                    :max="99999999"
                    :step="1000"
                    :controls="false"
                    placeholder="最小"
                    style="width: 45%"
                  />
                  <span class="dash-center">～</span>
                  <el-input-number
                    v-model="formData.amountRange.max"
                    :min="0"
                    :max="99999999"
                    :step="1000"
                    :controls="false"
                    placeholder="最大（99999999 表示不限）"
                    style="width: 45%"
                  />
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="备注说明" prop="description">
                <el-input
                  v-model="formData.description"
                  type="textarea"
                  :rows="2"
                  placeholder="简要说明本模板的适用场景、注意事项等（非必填）"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- Section 2: 审批步骤配置 -->
        <div class="form-section">
          <div class="section-title">
            <span>审批步骤配置</span>
            <el-button
              v-if="mode !== 'view'"
              type="primary"
              link
              size="small"
              @click="addStep"
            >
              <el-icon><Plus /></el-icon>
              新增审批步骤
            </el-button>
          </div>

          <el-table
            :data="formData.steps"
            size="small"
            border
            style="width: 100%"
            :header-cell-style="{ background: '#f5f7fa' }"
          >
            <el-table-column label="序号" width="70" align="center">
              <template #default="{ $index }">
                <el-tag type="primary" size="small" effect="dark">第 {{ $index + 1 }} 步</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="审批角色" min-width="180">
              <template #default="{ row }">
                <el-select
                  v-if="mode !== 'view'"
                  v-model="row.approverRole"
                  placeholder="请选择审批角色"
                  style="width: 100%"
                  @change="handleRoleChange(row)"
                >
                  <el-option
                    v-for="opt in commonRoleOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.label"
                  />
                </el-select>
                <span v-else>{{ row.approverRole }}</span>
              </template>
            </el-table-column>
            <el-table-column label="默认审批人" min-width="160">
              <template #default="{ row }">
                <el-select
                  v-if="mode !== 'view'"
                  v-model="row.approverName"
                  placeholder="请选择审批人"
                  filterable
                  style="width: 100%"
                >
                  <el-option label="超级管理员" value="超级管理员" />
                  <el-option label="C用户" value="C用户" />
                  <el-option label="主理人" value="主理人" />
                  <el-option label="A用户" value="A用户" />
                  <el-option label="B用户" value="B用户" />
                  <el-option label="示例总经理-演示" value="示例总经理-演示" />
                </el-select>
                <span v-else>{{ row.approverName }}</span>
              </template>
            </el-table-column>
            <el-table-column label="允许跳过" width="110" align="center">
              <template #default="{ row }">
                <el-switch
                  v-model="row.allowSkip"
                  :disabled="mode === 'view'"
                  inline-prompt
                  active-text="可"
                  inactive-text="否"
                />
              </template>
            </el-table-column>
            <el-table-column label="步骤说明" min-width="200">
              <template #default="{ row }">
                <el-input
                  v-if="mode !== 'view'"
                  v-model="row.description"
                  placeholder="可选：本步骤的特殊说明"
                  size="small"
                />
                <span v-else>{{ row.description || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column
              v-if="mode !== 'view'"
              label="操作"
              width="90"
              align="center"
            >
              <template #default="{ $index }">
                <el-button
                  type="danger"
                  link
                  size="small"
                  :disabled="formData.steps.length <= 1"
                  @click="removeStep($index)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- Section 3 (View only): 创建/更新时间展示 -->
        <div v-if="mode === 'view' && props.record" class="form-section">
          <div class="meta-row"><span class="meta-label">创建时间：</span>{{ props.record.createTime }}</div>
          <div class="meta-row"><span class="meta-label">更新时间：</span>{{ props.record.updateTime }}</div>
          <div class="meta-row"><span class="meta-label">创建人：</span>{{ props.record.creator }}</div>
        </div>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="handleClose">
        {{ mode === 'view' ? '关闭' : '取消' }}
      </el-button>
      <el-button
        v-if="mode !== 'view'"
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
import { Plus } from '@element-plus/icons-vue'
import {
  createApprovalTemplate,
  updateApprovalTemplate,
  getApprovalTemplateById,
  templateCategoryOptions,
  templateStatusOptions,
  commonRoleOptions,
  approverPool,
  type ApprovalTemplate,
  type TemplateStep,
  type TemplateCategory,
  type TemplateStatus,
} from '@/mock/approvalTemplate'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: ApprovalTemplate | null
}
const props = withDefaults(defineProps<Props>(), { record: null })

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})
const dialogTitle = computed(() => {
  if (props.mode === 'add') return '🆕 新增审批模板'
  if (props.mode === 'edit') return '✏️ 编辑审批模板'
  return '📋 审批模板详情'
})

// ========== Form 定义 ==========
interface FormData {
  code: string
  name: string
  category: TemplateCategory | ''
  status: TemplateStatus
  applicableRoles: string[]
  amountRange: { min: number; max: number }
  creator: string
  description: string
  steps: TemplateStep[]
}

const defaultFormData = (): FormData => ({
  code: '',
  name: '',
  category: '',
  status: 'enabled',
  applicableRoles: [],
  amountRange: { min: 0, max: 99999999 },
  creator: '超级管理员',
  description: '',
  steps: [
    { seq: 1, approverRole: '部门主管', approverName: 'C用户', allowSkip: false },
    { seq: 2, approverRole: '财务会计', approverName: '主理人', allowSkip: false },
  ],
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const formData = reactive<FormData>(defaultFormData())

const rules: FormRules = {
  name: [
    { required: true, message: '请输入模板名称', trigger: 'blur' },
    { min: 2, max: 60, message: '长度在 2 到 60 个字符', trigger: 'blur' },
  ],
  category: [{ required: true, message: '请选择适用分类', trigger: 'change' }],
}

function resetForm() {
  Object.assign(formData, defaultFormData())
  formRef.value?.clearValidate()
}

async function loadDetail(id: string) {
  const res = await getApprovalTemplateById(id)
  if (res.code !== 200 || !res.data?.id) {
    ElMessage.warning('模板不存在或已被删除')
    visible.value = false
    return
  }
  const r = res.data
  formData.code = r.code
  formData.name = r.name
  formData.category = r.category
  formData.status = r.status
  formData.applicableRoles = r.applicableRoles?.includes('*') ? [] : [...(r.applicableRoles || [])]
  formData.amountRange = { min: r.amountRange?.min ?? 0, max: r.amountRange?.max ?? 99999999 }
  formData.creator = r.creator
  formData.description = r.description || ''
  formData.steps = JSON.parse(JSON.stringify(r.steps || []))
}

watch(
  () => [visible.value, props.mode, props.record],
  async ([vis]) => {
    if (!vis) return
    resetForm()
    if (props.record && (props.mode === 'edit' || props.mode === 'view')) {
      await loadDetail(props.record.id)
    }
  },
  { immediate: true }
)

// ========= 步骤 增删 =========
function addStep() {
  const nextSeq = formData.steps.length + 1
  formData.steps.push({
    seq: nextSeq,
    approverRole: '',
    approverName: '',
    allowSkip: false,
  })
}
function removeStep(idx: number) {
  formData.steps.splice(idx, 1)
  formData.steps.forEach((s, i) => (s.seq = i + 1))
}
function handleRoleChange(row: TemplateStep) {
  // 选完角色自动填默认审批人（若在 pool 中存在）
  const matched = approverPool.find((a) => a.role === row.approverRole)
  if (matched) row.approverName = matched.name
}

// ========= 提交 =========
const handleClose = () => { visible.value = false }

const handleSubmit = async () => {
  if (!formRef.value) return
  try { await formRef.value.validate() } catch { return }

  // 校验步骤：至少 1 步，每步必填 role + approverName
  if (!formData.steps || formData.steps.length === 0) {
    ElMessage.warning('至少配置一个审批步骤')
    return
  }
  for (let i = 0; i < formData.steps.length; i++) {
    const s = formData.steps[i]
    if (!s.approverRole || !s.approverName) {
      ElMessage.warning(`第 ${i + 1} 步请填写审批角色和默认审批人`)
      return
    }
  }

  submitting.value = true
  try {
    const payload = {
      code: formData.code || undefined,
      name: formData.name,
      category: formData.category as TemplateCategory,
      status: formData.status,
      applicableRoles:
        formData.applicableRoles.length === 0 ? ['*'] : formData.applicableRoles,
      amountRange: formData.amountRange,
      creator: formData.creator,
      description: formData.description,
      steps: formData.steps.map((s, i) => ({ ...s, seq: i + 1 })),
    }
    if (props.mode === 'add') {
      const res = await createApprovalTemplate(payload)
      if (res.code === 200 && res.data?.id) {
        ElMessage.success('新增模板成功')
        emit('success')
        visible.value = false
      } else {
        ElMessage.error('新增失败')
      }
    } else if (props.mode === 'edit' && props.record) {
      const res = await updateApprovalTemplate(props.record.id, payload)
      if (res.code === 200 && res.data?.id) {
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
</script>

<style scoped lang="scss">
.approval-template-dialog {
  .form-section {
    background: #fff;
    border-radius: 4px;
    padding: 10px 20px 0;
    margin-bottom: 16px;
    border: 1px solid #ebeef5;
  }
  .section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    margin: 8px 0 16px;
    padding-left: 10px;
    border-left: 3px solid #409eff;
  }
  .amount-range-inputs {
    display: flex;
    align-items: center;
    gap: 6px;
    .dash-center { color: #909399; font-weight: 600; }
  }
  .meta-row {
    padding: 3px 0;
    color: #606266;
    .meta-label {
      display: inline-block;
      width: 90px;
      color: #909399;
    }
  }
}
</style>
