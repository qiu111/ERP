<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="720px"
    :close-on-click-modal="false"
    top="6vh"
    @close="handleClose"
  >
    <div v-if="record" class="approval-dialog">
      <!-- 基本信息 -->
      <el-descriptions :column="2" border size="default" class="info-section">
        <el-descriptions-item label="审批编号" :span="1">
          {{ record.code }}
        </el-descriptions-item>
        <el-descriptions-item label="审批状态" :span="1">
          <el-tag
            :type="getStatusTagType(record.status)"
            effect="light"
          >
            {{ getStatusText(record.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审批标题" :span="2">
          {{ record.title }}
        </el-descriptions-item>
        <el-descriptions-item label="订单编号">
          {{ record.orderNo }}
        </el-descriptions-item>
        <el-descriptions-item label="分类">
          <el-tag :type="categoryTagType" effect="light">
            {{ getCategoryLabel(record.category) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="收款人名称">
          {{ record.payeeName }}
        </el-descriptions-item>
        <el-descriptions-item label="审批金额">
          <span class="highlight-amount">
            {{ record.currency }} {{ formatAmount(record.approvalAmount) }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="希望支付时间">
          {{ record.expectedPayTime }}
        </el-descriptions-item>
        <el-descriptions-item label="结算审批">
          <el-tag type="info" effect="plain">
            {{ getSettlementApprovalLabel(record.settlementApproval) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发起人">
          {{ record.initiator }}
        </el-descriptions-item>
        <el-descriptions-item label="发起部门">
          {{ record.initiatorDept }}
        </el-descriptions-item>
        <el-descriptions-item label="发起时间" :span="2">
          {{ record.createTime }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 详情信息 -->
      <div class="detail-section">
        <div class="section-title">
          <el-icon><Document /></el-icon>
          <span>详细说明</span>
        </div>
        <div class="detail-content">
          {{ record.details || '暂无详细说明' }}
        </div>
      </div>

      <!-- 备注信息 -->
      <div v-if="record.remark" class="detail-section">
        <div class="section-title">
          <el-icon><ChatDotRound /></el-icon>
          <span>备注信息</span>
        </div>
        <div class="detail-content remark-content">
          {{ record.remark }}
        </div>
      </div>

      <!-- 审批操作区域 -->
      <div v-if="mode === 'approve'" class="approve-section">
        <el-divider />
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="100px"
          label-position="right"
        >
          <el-form-item label="审批结果">
            <el-radio-group v-model="formData.approvalResult">
              <el-radio value="approve" border>
                <el-icon style="color: #67c23a;"><CircleCheck /></el-icon>
                <span>审批通过</span>
              </el-radio>
              <el-radio value="reject" border>
                <el-icon style="color: #f56c6c;"><CircleClose /></el-icon>
                <span>审批驳回</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="审批意见" prop="approvalOpinion" required>
            <el-input
              v-model="formData.approvalOpinion"
              type="textarea"
              :rows="4"
              :placeholder="opinionPlaceholder"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">
        {{ mode === 'approve' ? '取消' : '关闭' }}
      </el-button>
      <el-button
        v-if="mode === 'approve'"
        :type="formData.approvalResult === 'approve' ? 'success' : 'danger'"
        :loading="submitting"
        @click="handleSubmit"
      >
        {{ formData.approvalResult === 'approve' ? '确认通过' : '确认驳回' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { Document, ChatDotRound, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import {
  getApprovalTodoById,
  approveTodo,
  getCategoryLabel,
  getSettlementApprovalLabel,
  getStatusTagType,
  getStatusText,
  type ApprovalTodo,
  type ApprovalTodoForm,
} from '@/mock/approvalTodo'

interface Props {
  modelValue: boolean
  mode: 'view' | 'approve'
  record?: ApprovalTodo | null
  approvalType?: 'approve' | 'reject'
}

const props = withDefaults(defineProps<Props>(), {
  record: null,
  approvalType: 'approve',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const detailRecord = ref<ApprovalTodo | null>(props.record)

interface FormData {
  approvalOpinion: string
  approvalResult: 'approve' | 'reject'
}

const formData = ref<FormData>({
  approvalOpinion: '',
  approvalResult: 'approve',
})

const formRules: FormRules<FormData> = {
  approvalOpinion: [
    { required: true, message: '请输入审批意见', trigger: 'blur' },
    { min: 2, max: 500, message: '审批意见长度在 2 到 500 个字符', trigger: 'blur' },
  ],
}

const dialogTitle = computed(() => {
  if (props.mode === 'approve') {
    return formData.value.approvalResult === 'approve' ? '审批通过' : '审批驳回'
  }
  return '审批详情'
})

const categoryTagTypeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  sale_order: 'primary',
  purchase_order: 'success',
  expense: 'warning',
  goods_payment: 'danger',
  purchase_contract: 'info',
  refund: 'danger',
  salary: 'success',
}

const categoryTagType = computed(() => {
  if (!detailRecord.value) return 'info'
  return categoryTagTypeMap[detailRecord.value.category] || 'info'
})

const opinionPlaceholder = computed(() => {
  return formData.value.approvalResult === 'approve'
    ? '请输入通过的审批意见（至少2个字符）'
    : '请输入驳回的原因（至少2个字符）'
})

const record = computed(() => detailRecord.value)

const formatAmount = (amount: number): string => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 加载详情
const loadDetail = async (id: string) => {
  try {
    const res = await getApprovalTodoById(id)
    detailRecord.value = res.data
  } catch (err) {
    console.error('加载审批详情失败:', err)
  }
}

// 监听弹窗打开
watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      detailRecord.value = props.record
      // 如果有id，重新加载最新详情
      if (props.record?.id) {
        await loadDetail(props.record.id)
      }
      // 审批模式初始化表单
      if (props.mode === 'approve') {
        formData.value = {
          approvalOpinion: props.approvalType === 'approve' ? '同意，审批通过。' : '不同意，驳回。',
          approvalResult: props.approvalType,
        }
      }
    }
  }
)

const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  if (!formRef.value || !detailRecord.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const payload: ApprovalTodoForm = {
        approvalOpinion: formData.value.approvalOpinion,
        approvalResult: formData.value.approvalResult,
      }
      await approveTodo(detailRecord.value.id, payload)
      ElMessage.success(
        formData.value.approvalResult === 'approve' ? '审批通过成功' : '审批驳回成功'
      )
      emit('success')
      handleClose()
    } catch (err) {
      console.error(err)
      ElMessage.error('审批操作失败')
    } finally {
      submitting.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.approval-dialog {
  .info-section {
    margin-bottom: 20px;

    :deep(.el-descriptions__label) {
      width: 110px;
      background: #fafafa;
      font-weight: 500;
    }
  }

  .detail-section {
    margin-bottom: 20px;
    padding: 12px 16px;
    background: #f9fafb;
    border-radius: 6px;

    .section-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      font-size: 14px;
      color: #303133;
      margin-bottom: 10px;
    }

    .detail-content {
      color: #606266;
      line-height: 1.8;
      font-size: 14px;
      white-space: pre-wrap;
    }

    .remark-content {
      color: #909399;
      font-style: italic;
    }
  }

  .approve-section {
    :deep(.el-radio) {
      margin-right: 24px;
    }
  }
}

.highlight-amount {
  font-size: 18px;
  font-weight: 700;
  color: #f56c6c;
}
</style>
