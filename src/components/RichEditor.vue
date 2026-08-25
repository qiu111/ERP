<template>
  <div class="rich-editor-wrapper" :style="wrapperStyle">
    <div class="rich-editor-toolbar">
      <el-button-group>
        <el-button size="small" :disabled="disabled" @click="execCommand('bold')">
          <strong>B</strong>
        </el-button>
        <el-button size="small" :disabled="disabled" @click="execCommand('italic')">
          <em>I</em>
        </el-button>
        <el-button size="small" :disabled="disabled" @click="execCommand('underline')">
          <u>U</u>
        </el-button>
      </el-button-group>
      <el-button-group>
        <el-button size="small" :disabled="disabled" @click="execCommand('justifyLeft')">
          ≡
        </el-button>
        <el-button size="small" :disabled="disabled" @click="execCommand('justifyCenter')">
          ≡
        </el-button>
        <el-button size="small" :disabled="disabled" @click="execCommand('justifyRight')">
          ≡
        </el-button>
      </el-button-group>
      <el-select
        v-model="editorFontSize"
        size="small"
        placeholder="字号"
        style="width: 90px"
        :disabled="disabled"
        @change="handleFontSize"
      >
        <el-option label="小" value="2" />
        <el-option label="正常" value="3" />
        <el-option label="中" value="4" />
        <el-option label="大" value="5" />
        <el-option label="特大" value="6" />
      </el-select>
      <el-select
        v-model="editorFontName"
        size="small"
        placeholder="字体"
        style="width: 100px"
        :disabled="disabled"
        @change="handleFontName"
      >
        <el-option label="宋体" value="SimSun" />
        <el-option label="黑体" value="SimHei" />
        <el-option label="微软雅黑" value="Microsoft YaHei" />
        <el-option label="楷体" value="KaiTi" />
        <el-option label="Arial" value="Arial" />
      </el-select>
      <el-button size="small" :disabled="disabled" @click="insertLink">
        链接
      </el-button>
      <el-button size="small" :disabled="disabled" @click="execCommand('insertUnorderedList')">
        • 列表
      </el-button>
      <el-button size="small" :disabled="disabled" @click="execCommand('insertOrderedList')">
        1. 列表
      </el-button>
      <el-button size="small" :disabled="disabled" @click="execCommand('removeFormat')">
        清除格式
      </el-button>
    </div>
    <div
      ref="editorRef"
      class="rich-editor-content"
      :style="contentStyle"
      :contenteditable="!disabled"
      :class="{ 'is-disabled': disabled }"
      @input="handleEditorInput"
      @blur="handleBlur"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'

interface Props {
  modelValue: string
  disabled?: boolean
  placeholder?: string
  minHeight?: string | number
  maxHeight?: string | number
  width?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  placeholder: '',
  minHeight: '200px',
  maxHeight: '300px',
  width: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'blur', event: FocusEvent): void
}>()

const editorRef = ref<HTMLElement | null>(null)
const editorFontSize = ref('3')
const editorFontName = ref('SimSun')

const wrapperStyle = computed<Record<string, string>>(() => {
  if (props.width === undefined) return {}
  const w = typeof props.width === 'number' ? `${props.width}px` : props.width
  return { width: w }
})

const contentStyle = computed<Record<string, string>>(() => {
  const style: Record<string, string> = {}
  if (props.minHeight !== undefined) {
    style.minHeight = typeof props.minHeight === 'number' ? `${props.minHeight}px` : props.minHeight
  }
  if (props.maxHeight !== undefined) {
    style.maxHeight = typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight
  }
  return style
})

const disabled = computed(() => !!props.disabled)

const execCommand = (command: string, value?: string) => {
  if (disabled.value) return
  editorRef.value?.focus()
  document.execCommand(command, false, value)
  handleEditorInput()
}

const handleFontSize = (val: string) => {
  execCommand('fontSize', val)
}

const handleFontName = (val: string) => {
  execCommand('fontName', val)
}

const insertLink = () => {
  if (disabled.value) return
  const url = window.prompt('请输入链接地址', 'https://')
  if (url) execCommand('createLink', url)
}

const handleEditorInput = () => {
  if (editorRef.value) {
    emit('update:modelValue', editorRef.value.innerHTML)
  }
}

const handleBlur = (e: FocusEvent) => {
  emit('blur', e)
}

// 外部 modelValue 变化时同步内部 HTML
watch(
  () => props.modelValue,
  (val) => {
    nextTick(() => {
      if (editorRef.value && editorRef.value.innerHTML !== val) {
        editorRef.value.innerHTML = val || ''
      }
    })
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.rich-editor-wrapper {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  width: 100%;
}

.rich-editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
  align-items: center;

  .el-button-group {
    :deep(.el-button) {
      padding: 6px 10px;
    }
  }
}

.rich-editor-content {
  min-height: 200px;
  max-height: 300px;
  overflow-y: auto;
  padding: 12px;
  font-size: 14px;
  line-height: 1.6;
  outline: none;
  background: #fff;

  &.is-disabled {
    background: #f5f7fa;
    cursor: not-allowed;
  }

  &:focus {
    background: #fff;
  }
}
</style>