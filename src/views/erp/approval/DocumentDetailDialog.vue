<template>
  <el-dialog
    v-model="visible"
    title="公文详情"
    width="780px"
    top="6vh"
    destroy-on-close
  >
    <el-descriptions :column="2" border class="doc-detail">
      <el-descriptions-item label="公文字号" :span="2">{{ record?.docNo }}</el-descriptions-item>
      <el-descriptions-item label="标题" :span="2">{{ record?.title }}</el-descriptions-item>
      <el-descriptions-item label="文种">{{ record?.docType }}</el-descriptions-item>
      <el-descriptions-item label="缓急">
        <el-tag :type="urgencyTagTypeMap[record?.urgency as DocUrgency]" effect="light" size="small">
          {{ record?.urgency }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="发起人">{{ record?.initiator }}</el-descriptions-item>
      <el-descriptions-item label="发起时间">{{ record?.createTime }}</el-descriptions-item>
      <el-descriptions-item label="主送人员" :span="2">
        <el-tag
          v-for="p in record?.recipients || []"
          :key="p"
          size="small"
          effect="plain"
          class="recipient-tag"
        >
          {{ p }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="docStatusTagTypeMap[record?.status as DocStatus]" effect="light" size="small">
          {{ getStatusLabel(record?.status) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="发送时间">{{ record?.sendTime || '—' }}</el-descriptions-item>
      <el-descriptions-item label="正文" :span="2">
        <div class="doc-content" v-html="record?.content"></div>
      </el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">{{ record?.remark || '—' }}</el-descriptions-item>
    </el-descriptions>

    <template v-if="record?.records?.length">
      <div class="block-title">处理记录</div>
      <el-table :data="record.records" size="small" border>
        <el-table-column label="处理人" prop="person" width="110" align="center" />
        <el-table-column label="动作" width="90" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.action === 'reject' ? 'danger' : row.action === 'agree' ? 'success' : 'info'"
              effect="light"
              size="small"
            >
              {{ getActionLabel(row.action) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="意见" prop="opinion" show-overflow-tooltip />
        <el-table-column label="时间" prop="time" width="150" align="center" />
      </el-table>
    </template>

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {
  docStatusOptions,
  docStatusTagTypeMap,
  processActionOptions,
  urgencyTagTypeMap,
  type DocumentItem,
  type DocStatus,
  type DocUrgency,
  type ProcessAction,
} from '@/mock/document'

interface Props {
  modelValue: boolean
  record?: DocumentItem | null
}
const props = withDefaults(defineProps<Props>(), { record: null })
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

function getStatusLabel(status?: DocStatus): string {
  return docStatusOptions.find((o) => o.value === status)?.label || (status ?? '')
}
function getActionLabel(action: ProcessAction): string {
  return processActionOptions.find((o) => o.value === action)?.label || action
}
</script>

<style scoped lang="scss">
.doc-detail {
  margin-bottom: 12px;
}

.recipient-tag {
  margin-right: 6px;
}

.doc-content {
  max-height: 240px;
  overflow: auto;
  line-height: 1.7;

  :deep(p) {
    margin: 0 0 8px;
  }
}

.block-title {
  font-weight: 600;
  margin: 8px 0;
  color: #303133;
}
</style>
