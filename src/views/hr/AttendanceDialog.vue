<template>
  <el-dialog
    v-model="visible"
    title="考勤详情"
    width="680px"
    top="10vh"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <el-descriptions v-if="props.record" :column="2" border>
      <el-descriptions-item label="编号">{{ props.record.code }}</el-descriptions-item>
      <el-descriptions-item label="考勤日期">{{ props.record.attendDate }}</el-descriptions-item>
      <el-descriptions-item label="工号">{{ props.record.empNo }}</el-descriptions-item>
      <el-descriptions-item label="员工姓名">{{ props.record.employeeName }}</el-descriptions-item>
      <el-descriptions-item label="所属部门">{{ props.record.deptName }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="attendanceStatusTagTypeMap[props.record.status]" effect="light" size="small">
          {{ attendanceStatusLabelMap[props.record.status] }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="上班打卡">{{ props.record.clockIn || '—' }}</el-descriptions-item>
      <el-descriptions-item label="下班打卡">{{ props.record.clockOut || '—' }}</el-descriptions-item>
      <el-descriptions-item label="工时(小时)">{{ props.record.workHours }}</el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">
        {{ props.record.remark || '—' }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间" :span="2">
        {{ props.record.createTime }}
      </el-descriptions-item>
    </el-descriptions>

    <template #footer>
      <el-button type="primary" @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {
  attendanceStatusLabelMap,
  attendanceStatusTagTypeMap,
  type AttendanceItem,
} from '@/mock/hr'

interface Props {
  modelValue: boolean
  record?: AttendanceItem | null
}
const props = withDefaults(defineProps<Props>(), { record: null })
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})
</script>
