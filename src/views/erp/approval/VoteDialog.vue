<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="680px"
    top="8vh"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <!-- 新增模式 -->
    <el-form
      v-if="mode === 'add'"
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="96px"
    >
      <el-form-item label="投票主题" prop="subject" required>
        <el-input
          v-model="formData.subject"
          placeholder="请输入投票主题"
          maxlength="60"
          show-word-limit
          clearable
        />
      </el-form-item>
      <el-form-item label="截止时间" prop="deadline" required>
        <el-date-picker
          v-model="formData.deadline"
          type="datetime"
          placeholder="请选择截止时间"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DD HH:mm"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item
        v-for="(opt, idx) in formData.options"
        :key="idx"
        :label="`选项${idx + 1}`"
        :prop="`options.${idx}`"
        :rules="{ required: true, message: '选项内容不能为空', trigger: 'blur' }"
      >
        <div class="option-row">
          <el-input
            v-model="formData.options[idx]"
            placeholder="请输入选项内容"
            maxlength="40"
            :disabled="mode !== 'add'"
          />
          <el-button
            v-if="formData.options.length > 2"
            type="danger"
            link
            @click="formData.options.splice(idx, 1)"
          >
            删除
          </el-button>
        </div>
      </el-form-item>
      <el-form-item label-width="96px">
        <el-button type="primary" plain @click="addOption" :disabled="formData.options.length >= 6">
          <el-icon><Plus /></el-icon>
          添加选项
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 详情模式 -->
    <template v-else>
      <el-descriptions :column="2" border class="vote-detail">
        <el-descriptions-item label="编号">{{ record?.code }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="voteStatusTagTypeMap[record?.status as VoteStatus]" effect="light" size="small">
            {{ record?.status === 'open' ? '投票中' : '已结束' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="投票主题" :span="2">{{ record?.subject }}</el-descriptions-item>
        <el-descriptions-item label="发起人">{{ record?.initiator }}</el-descriptions-item>
        <el-descriptions-item label="截止时间">{{ record?.deadline }}</el-descriptions-item>
      </el-descriptions>

      <div class="block-title">选项与票数</div>
      <div class="vote-options">
        <div
          v-for="opt in record?.options || []"
          :key="opt.label"
          class="vote-option"
          :class="{ 'is-mine': record?.myVote === opt.label }"
        >
          <el-radio
            v-if="canVote"
            :model-value="selected"
            :value="opt.label"
            @change="selected = opt.label"
          >
            {{ opt.label }}
          </el-radio>
          <template v-else>
            <span class="vote-option__label">
              <el-icon v-if="record?.myVote === opt.label" color="#409eff"><CircleCheckFilled /></el-icon>
              {{ opt.label }}
            </span>
          </template>
          <div class="vote-option__bar">
            <el-progress
              :percentage="optPercent(opt.count)"
              :stroke-width="10"
              :show-text="false"
            />
            <span class="vote-option__count">{{ opt.count }} 票</span>
          </div>
        </div>
      </div>

      <el-empty
        v-if="canVote && !selected"
        description="请选择一个选项后点击下方投票按钮"
        :image-size="48"
      />
    </template>

    <template #footer>
      <el-button @click="visible = false">
        {{ mode === 'add' ? '取消' : '关闭' }}
      </el-button>
      <el-button
        v-if="mode === 'add'"
        type="primary"
        :loading="submitting"
        @click="handleCreate"
      >
        提交
      </el-button>
      <el-button v-if="canVote" type="primary" :disabled="!selected" :loading="voting" @click="handleVote">
        投票
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Plus, CircleCheckFilled } from '@element-plus/icons-vue'
import {
  castVote,
  createVote,
  voteStatusTagTypeMap,
  type VoteItem,
  type VoteStatus,
} from '@/mock/vote'

interface Props {
  modelValue: boolean
  mode: 'add' | 'view'
  record?: VoteItem | null
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

const dialogTitle = computed(() => (props.mode === 'add' ? '发起投票' : '投票详情'))

/** 可投票：详情模式 + 投票中 + 我未投过 */
const canVote = computed(
  () =>
    props.mode === 'view' &&
    props.record?.status === 'open' &&
    !props.record?.voters?.length
)

const formRef = ref<FormInstance>()
const submitting = ref(false)
const voting = ref(false)
const selected = ref('')
const formData = reactive<{ subject: string; deadline: string; options: string[] }>({
  subject: '',
  deadline: '',
  options: ['', ''],
})

const rules: FormRules = {
  subject: [{ required: true, message: '请输入投票主题', trigger: 'blur' }],
  deadline: [{ required: true, message: '请选择截止时间', trigger: 'change' }],
}

function addOption() {
  formData.options.push('')
}

function optPercent(count: number): number {
  const totalVotes = props.record?.options.reduce((s, o) => s + o.count, 0) || 0
  if (!totalVotes) return 0
  return Math.round((count / totalVotes) * 100)
}

watch(visible, (v) => {
  if (v) {
    selected.value = ''
    formData.subject = ''
    formData.deadline = ''
    formData.options = ['', '']
    formRef.value?.clearValidate()
  }
})

const handleCreate = async () => {
  if (!formRef.value) return
  try { await formRef.value.validate() } catch { return }
  submitting.value = true
  try {
    const res = await createVote({
      subject: formData.subject,
      deadline: formData.deadline,
      options: formData.options.filter((o) => o.trim()),
    })
    if (res.code === 200) {
      ElMessage.success('投票已发起')
      emit('success')
      visible.value = false
    } else ElMessage.error('发起失败')
  } finally {
    submitting.value = false
  }
}

const handleVote = async () => {
  if (!props.record || !selected.value) return
  voting.value = true
  try {
    const res = await castVote(props.record.id, selected.value)
    if (res.code === 200 && res.data.id) {
      ElMessage.success('投票成功')
      // 用最新数据刷新详情展示
      props.record.options = res.data.options
      props.record.myVote = res.data.myVote
      props.record.voters = res.data.voters
      selected.value = ''
      emit('success')
    } else ElMessage.error('投票失败（可能已结束或已投过）')
  } finally {
    voting.value = false
  }
}
</script>

<style scoped lang="scss">
.option-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.vote-detail {
  margin-bottom: 12px;
}

.block-title {
  font-weight: 600;
  margin: 8px 0;
  color: #303133;
}

.vote-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 320px;
  overflow: auto;
}

.vote-option {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 10px 14px;

  &.is-mine {
    border-color: #b3d8ff;
    background: #f0f7ff;
  }

  &__label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
  }

  &__bar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 4px;
    padding-left: 24px;

    .el-progress {
      flex: 1;
    }
  }

  &__count {
    color: #909399;
    font-size: 13px;
    white-space: nowrap;
  }
}
</style>
