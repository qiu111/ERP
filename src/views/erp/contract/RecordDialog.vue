<template>
  <ContractDialog
    v-model="visible"
    :mode="mode"
    :record="record"
    :title="dialogTitle"
    @success="emit('success')"
  />
</template>

<script setup lang="ts">
import ContractDialog from './ContractDialog.vue'
import type { ContractItem } from '@/mock/contract'

interface Props {
  modelValue: boolean
  mode: 'add' | 'view'
  record?: ContractItem | null
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

const dialogTitle = computed(() => (props.mode === 'view' ? '合同详情' : '合同收录'))
</script>
