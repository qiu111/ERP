<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="720px"
    :close-on-click-modal="false"
    top="6vh"
    @close="handleClose"
  >
    <div v-if="record" class="reception-dialog">
      <!-- 基本信息 -->
      <el-descriptions :column="2" border size="default" class="info-section">
        <el-descriptions-item label="接待编号" :span="1">
          {{ record.code }}
        </el-descriptions-item>
        <el-descriptions-item label="审批状态" :span="1">
          <el-tag :type="statusTagTypeMap[record.status]" effect="light">
            {{ getStatusLabel(record.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="接待标题" :span="2">
          {{ record.title }}
        </el-descriptions-item>
        <el-descriptions-item label="客户名称">
          {{ record.customerName }}
        </el-descriptions-item>
        <el-descriptions-item label="接待类型">
          <el-tag :type="typeTagTypeMap[record.receptionType]" effect="light">
            {{ getTypeLabel(record.receptionType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="接待级别">
          <el-tag :type="levelTagTypeMap[record.level]" effect="light">
            {{ getLevelLabel(record.level) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="接待时间">
          {{ record.receptionTime }}
        </el-descriptions-item>
        <el-descriptions-item label="接待地点" :span="2">
          {{ record.receptionPlace }}
        </el-descriptions-item>
        <el-descriptions-item label="接待人">
          {{ record.host }}
        </el-descriptions-item>
        <el-descriptions-item label="陪同人员">
          {{ record.companions || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="预计费用">
          <span class="highlight-amount">
            ¥ {{ formatAmount(record.estimatedCost) }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="发起人">
          {{ record.submitter }}
        </el-descriptions-item>
        <el-descriptions-item label="发起时间">
          {{ record.createTime }}
        </el-descriptions-item>
        <el-descriptions-item label="审批人">
          {{ record.approver }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 事由说明 -->
      <div class="detail-section">
        <div class="section-title">
          <el-icon><Document /></el-icon>
          <span>接待事由</span>
        </div>
        <div class="detail-content">
          {{ record.content || '暂无接待事由' }}
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

      <!-- 已处理的审批结果 -->
      <div v-if="record.status !== 'pending'" class="detail-section">
        <div class="section-title">
          <el-icon><Finished /></el-icon>
          <span>审批结果</span>
        </div>
        <div class="detail-content">
          <el-tag
            :type="statusTagTypeMap[record.status]"
            effect="light"
            size="small"
            style="margin-right: 8px;"
          >
            {{ getStatusLabel(record.status) }}
          </el-tag>
          <span>{{ record.approvalTime }}</span>
        </div>
        <div class="detail-content remark-content">
          {{ record.approvalOpinion || '-' }}
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
import { Document, ChatDotRound, Finished, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import {
  getReceptionById,
  approveReception,
  getStatusLabel,
  getTypeLabel,
  getLevelLabel,
  statusTagTypeMap,
  typeTagTypeMap,
  levelTagTypeMap,
  type ReceptionItem,
  type ReceptionApproveForm,
} from '@/mock/reception'

interface Props {
  modelValue: boolean
  mode: 'view' | 'approve'
  record?: ReceptionItem | null
  /** 打开弹框时的预设审批结果（通过/驳回） */
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
const detailRecord = ref<ReceptionItem | null>(props.record)

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
    return formData.value.approvalResult === 'approve' ? '接待审批通过' : '接待审批驳回'
  }
  return '接待详情'
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
    const res = await getReceptionById(id)
    detailRecord.value = res.data
  } catch (err) {
    console.error('加载接待详情失败:', err)
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
          approvalOpinion: props.approvalType === 'approve' ? '同意，按示例方案安排接待。' : '不同意，驳回。',
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
      const payload: ReceptionApproveForm = {
        approvalOpinion: formData.value.approvalOpinion,
        approvalResult: formData.value.approvalResult,
      }
      const res = await approveReception(detailRecord.value!.id, payload)
      if (res.code === 200 && res.data.id) {
        ElMessage.success(
          formData.value.approvalResult === 'approve' ? '审批通过成功' : '审批驳回成功'
        )
        emit('success')
        handleClose()
      } else {
        ElMessage.error('审批失败：该记录可能已被处理')
      }
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
.reception-dialog {
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
  font-size: 16px;
  font-weight: 700;
  color: #f56c6c;
}
</style>
