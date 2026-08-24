<template>
  <div class="search-bar">
    <div v-if="title" class="search-bar__header">
      <h2 class="search-bar__title">{{ title }}</h2>
    </div>

    <el-form :model="innerModel" inline class="search-bar__form" @submit.prevent>
      <template v-if="fields.length">
        <template v-for="field in fields" :key="field.prop">
          <el-form-item
            v-if="field.type === 'select'"
            :label="field.label"
            :prop="field.prop"
          >
            <el-select
              v-model="innerModel[field.prop]"
              :placeholder="field.placeholder || '请选择'"
              clearable
              style="width: 180px"
              @change="handleFieldChange"
            >
              <el-option
                v-for="opt in field.options"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item
            v-else-if="field.type === 'date'"
            :label="field.label"
            :prop="field.prop"
          >
            <el-date-picker
              v-model="innerModel[field.prop]"
              type="date"
              :placeholder="field.placeholder || '选择日期'"
              value-format="YYYY-MM-DD"
              style="width: 180px"
              @change="handleFieldChange"
            />
          </el-form-item>

          <el-form-item
            v-else-if="field.type === 'daterange'"
            :label="field.label"
            :prop="field.prop"
          >
            <el-date-picker
              v-model="innerModel[field.prop]"
              type="daterange"
              :start-placeholder="field.startPlaceholder || '开始日期'"
              :end-placeholder="field.endPlaceholder || '结束日期'"
              value-format="YYYY-MM-DD"
              style="width: 260px"
              @change="handleFieldChange"
            />
          </el-form-item>

          <el-form-item
            v-else-if="field.type === 'checkbox'"
            :label="field.label"
            :prop="field.prop"
          >
            <el-checkbox
              v-model="innerModel[field.prop]"
              @change="handleFieldChange"
            >
              {{ field.placeholder || field.label }}
            </el-checkbox>
          </el-form-item>

          <el-form-item
            v-else
            :label="field.label"
            :prop="field.prop"
          >
            <el-input
              v-model="innerModel[field.prop]"
              :placeholder="field.placeholder || '请输入'"
              clearable
              style="width: 200px"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
        </template>
      </template>

      <el-form-item class="search-bar__actions">
        <el-button v-if="fields.length" type="primary" @click="handleSearch">
          搜索
        </el-button>
        <el-button v-if="fields.length" @click="handleReset">
          重置
        </el-button>
        <el-button
          v-if="showAdd && has(addPermission)"
          :color="addColor"
          @click="$emit('add')"
        >
          添加
        </el-button>
        <el-button
          v-if="showDownload && has(downloadPermission)"
          :color="downloadColor"
          @click="$emit('download')"
        >
          <el-icon><Download /></el-icon>
          下载
        </el-button>
        <slot name="extra" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Download } from '@element-plus/icons-vue'
import { usePermission } from '@/composables/usePermission'

export interface SearchField {
  prop: string
  label: string
  type: 'input' | 'select' | 'date' | 'daterange' | 'checkbox'
  placeholder?: string
  startPlaceholder?: string
  endPlaceholder?: string
  options?: { label: string; value: any }[]
  defaultValue?: any
}

interface Props {
  title?: string
  fields?: SearchField[]
  modelValue?: Record<string, any>
  showAdd?: boolean
  showDownload?: boolean
  addColor?: string
  downloadColor?: string
  addPermission?: string | string[]
  downloadPermission?: string | string[]
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  fields: () => [],
  modelValue: () => ({}),
  showAdd: false,
  showDownload: false,
  addColor: '#ffbc00',
  downloadColor: '#67c23a',
  addPermission: undefined,
  downloadPermission: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, any>): void
  (e: 'search', value: Record<string, any>): void
  (e: 'reset'): void
  (e: 'change', prop: string, value: any): void
  (e: 'add'): void
  (e: 'download'): void
}>()

const { has } = usePermission()

const innerModel = ref<Record<string, any>>(JSON.parse(JSON.stringify(props.modelValue || {})))

watch(
  () => props.modelValue,
  (val) => {
    innerModel.value = JSON.parse(JSON.stringify(val || {}))
  },
  { deep: true }
)

const handleFieldChange = () => {
  emit('update:modelValue', { ...innerModel.value })
}

const handleSearch = () => {
  emit('update:modelValue', { ...innerModel.value })
  emit('search', { ...innerModel.value })
}

const handleReset = () => {
  const resetModel: Record<string, any> = {}
  props.fields.forEach((f) => {
    resetModel[f.prop] = f.type === 'checkbox' ? (f.defaultValue ?? false) : ''
  })
  innerModel.value = resetModel
  emit('update:modelValue', { ...resetModel })
  emit('reset')
  emit('search', { ...resetModel })
}
</script>

<style scoped lang="scss">
.search-bar { 
  padding: 16px 16px 0;
  background: #fff;
  border-radius: 4px;
  margin-bottom: 16px;

  &__header {
    margin-bottom: 16px;
  }

  &__title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #303133;
  }

  &__form {
    display: flex;
    flex-wrap: wrap;
    gap: 0;
  }

  &__actions {
    margin-left: auto;
  }
}
</style>
