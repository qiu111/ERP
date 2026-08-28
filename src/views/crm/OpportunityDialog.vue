<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="760px"
    top="6vh"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <!-- View 模式：详情描述 -->
    <el-descriptions v-if="props.mode === 'view' && props.record" :column="2" border>
      <el-descriptions-item label="编号">{{ props.record.code }}</el-descriptions-item>
      <el-descriptions-item label="商机名称">{{ props.record.name }}</el-descriptions-item>
      <el-descriptions-item label="客户名称">{{ props.record.customerName }}</el-descriptions-item>
      <el-descriptions-item label="销售金额">{{ formatAmount(props.record.amount) }}</el-descriptions-item>
      <el-descriptions-item label="阶段">
        <el-tag :type="opportunityStageTagTypeMap[props.record.stage]" effect="light" size="small">
          {{ getOpportunityStageLabel(props.record.stage) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="预计成交日期">{{ props.record.expectDate || '—' }}</el-descriptions-item>
      <el-descriptions-item label="负责人">{{ props.record.owner }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ props.record.createTime }}</el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">
        {{ props.record.remark || '—' }}
      </el-descriptions-item>
    </el-descriptions>

    <!-- Add / Edit 模式：表单 -->
    <el-form
      v-else
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="108px"
      label-position="right"
      class="opportunity-form"
    >
      <el-form-item label="商机名称" prop="name" required>
        <el-input
          v-model="formData.name"
          placeholder="请输入商机名称"
          maxlength="60"
          show-word-limit
          clearable
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="客户名称" prop="customerName" required>
            <el-select
              v-model="formData.customerName"
              placeholder="请选择客户"
              style="width: 100%"
              filterable
              clearable
            >
              <el-option
                v-for="opt in customerOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="销售金额" prop="amount" required>
            <el-input-number
              v-model="formData.amount"
              :min="0"
              :precision="2"
              :step="1000"
              :controls-position="'right'"
              placeholder="请输入销售金额"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="阶段" prop="stage" required>
            <el-select v-model="formData.stage" placeholder="请选择阶段" style="width: 100%">
              <el-option
                v-for="opt in opportunityStageOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="预计成交日期" prop="expectDate">
            <el-date-picker
              v-model="formData.expectDate"
              type="date"
              placeholder="请选择预计成交日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="负责人" prop="owner" required>
            <el-select v-model="formData.owner" placeholder="请选择负责人" style="width: 100%">
              <el-option
                v-for="opt in ownerOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

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
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import {
  createOpportunity,
  updateOpportunity,
  getOpportunityById,
  getCustomerNameOptions,
  opportunityStageOptions,
  ownerOptions,
  getOpportunityStageLabel,
  opportunityStageTagTypeMap,
  type OpportunityItem,
  type OpportunityStage,
} from '@/mock/crm'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: OpportunityItem | null
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

const dialogTitle = computed(() =>
  props.mode === 'view' ? '商机详情' : props.mode === 'edit' ? '商机修改' : '商机添加'
)

interface FormData {
  name: string
  customerName: string
  amount: number
  stage: OpportunityStage | ''
  expectDate: string
  owner: string
  remark: string
}

const defaultForm = (): FormData => ({
  name: '',
  customerName: '',
  amount: 0,
  stage: 'contact',
  expectDate: '',
  owner: '',
  remark: '',
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const formData = reactive<FormData>(defaultForm())
const customerOptions = ref<{ label: string; value: string }[]>([])

const rules: FormRules = {
  name: [{ required: true, message: '请输入商机名称', trigger: 'blur' }],
  customerName: [{ required: true, message: '请选择客户', trigger: 'change' }],
  amount: [{ required: true, message: '请输入销售金额', trigger: 'change' }],
  stage: [{ required: true, message: '请选择阶段', trigger: 'change' }],
  owner: [{ required: true, message: '请选择负责人', trigger: 'change' }],
  remark: [{ max: 225, message: '备注不超过 225 个字符', trigger: 'blur' }],
}

const formatAmount = (v: any): string => {
  const n = Number(v || 0)
  return `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function reset() {
  Object.assign(formData, defaultForm())
  formRef.value?.clearValidate()
}

async function loadDetail(id: string) {
  const res = await getOpportunityById(id)
  if (res.code !== 200 || !res.data || !res.data.id) {
    ElMessage.warning('商机不存在或已删除')
    visible.value = false
    return
  }
  const r = res.data
  formData.name = r.name
  formData.customerName = r.customerName
  formData.amount = r.amount
  formData.stage = r.stage
  formData.expectDate = r.expectDate
  formData.owner = r.owner
  formData.remark = r.remark || ''
}

watch(
  () => [visible.value, props.mode, props.record],
  async ([vis]) => {
    if (!vis) return
    reset()
    customerOptions.value = getCustomerNameOptions()
    if (props.record && props.mode === 'edit') {
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
      name: formData.name,
      customerName: formData.customerName,
      amount: formData.amount,
      stage: formData.stage as OpportunityStage,
      expectDate: formData.expectDate,
      owner: formData.owner,
      remark: formData.remark,
    }
    if (props.mode === 'add') {
      const res = await createOpportunity(payload)
      if (res.code === 200) {
        ElMessage.success('新增成功')
        emit('success')
        visible.value = false
      } else ElMessage.error('新增失败')
    } else if (props.mode === 'edit' && props.record) {
      const res = await updateOpportunity(props.record.id, payload)
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
.opportunity-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}
</style>
