<template>
  <div class="file-upload">
    <div class="file-upload__wrapper">
      <el-upload
        class="file-upload__inner"
        :action="uploadUrl"
        :accept="accept"
        :auto-upload="false"
        :limit="limit"
        :multiple="multiple"
        :show-file-list="false"
        :on-change="handleFileChange"
        :before-upload="beforeUpload"
        :file-list="fileList"
      >
        <slot name="trigger">
          <el-button :type="buttonType">
            <el-icon v-if="icon"><component :is="icon" /></el-icon>
            {{ buttonText }}
          </el-button>
        </slot>
      </el-upload>
      <span v-if="tip" class="file-upload__tip">{{ tip }}</span>
    </div>

    <!-- 已选中文件预览 -->
    <div v-if="previewFile" class="file-upload__preview">
      <template v-if="isImage">
        <el-image
          :src="previewFile.url"
          :preview-src-list="[previewFile.url]"
          fit="cover"
          :initial-index="0"
          style="width: 80px; height: 80px;"
        />
      </template>
      <template v-else>
        <div class="file-upload__file-icon">
          <el-icon size="40"><Document /></el-icon>
        </div>
      </template>
      <div class="file-upload__preview-info">
        <div class="file-upload__file-name" :title="previewFile.name">
          {{ previewFile.name }}
        </div>
        <div class="file-upload__file-size">
          {{ formatSize(previewFile.size) }}
        </div>
      </div>
      <el-icon
        class="file-upload__remove"
        @click.stop="handleRemove"
      >
        <Close />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Document, Close } from '@element-plus/icons-vue'
import { markRaw } from 'vue'

interface UploadedFile {
  name: string
  url: string
  size: number
  raw?: File
}

interface Props {
  modelValue?: string | UploadedFile | UploadedFile[]
  uploadUrl?: string
  accept?: string
  limit?: number
  multiple?: boolean
  maxSize?: number
  tip?: string
  buttonText?: string
  buttonType?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  icon?: any
  acceptImagesOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  uploadUrl: '/api/upload',
  accept: '',
  limit: 1,
  multiple: false,
  maxSize: 10 * 1024 * 1024, // 10MB
  tip: '',
  buttonText: '点击选择文件',
  buttonType: 'primary',
  icon: null,
  acceptImagesOnly: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | UploadedFile | UploadedFile[]): void
  (e: 'change', value: UploadedFile | UploadedFile[] | null): void
  (e: 'file-change', file: File[]): void
  (e: 'error', message: string): void
}>()

// 单文件模式
const fileList = ref<any[]>([])
const previewFile = ref<UploadedFile | null>(null)

const isImage = computed(() => {
  if (!previewFile.value) return false
  return previewFile.value.url.startsWith('data:image') ||
    /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(previewFile.value.name)
})

const formatSize = (bytes: number): string => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let size = bytes
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  return `${size.toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}

const validateFile = (file: File): boolean => {
  // 检查大小
  if (file.size > props.maxSize) {
    emit('error', `文件大小不能超过 ${formatSize(props.maxSize)}`)
    return false
  }
  // 检查图片类型
  if (props.acceptImagesOnly) {
    if (!file.type.startsWith('image/')) {
      emit('error', '只能上传图片文件')
      return false
    }
  }
  // 检查 accept
  if (props.accept) {
    const acceptTypes = props.accept.split(',').map(t => t.trim())
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    const fileType = file.type
    const accepted = acceptTypes.some(type => {
      if (type.endsWith('/*')) {
        return fileType.startsWith(type.replace('/*', '/'))
      }
      if (type.startsWith('.')) {
        return fileExt === type.toLowerCase()
      }
      return type === fileType
    })
    if (!accepted) {
      emit('error', `文件格式不支持，允许的格式：${props.accept}`)
      return false
    }
  }
  return true
}

const beforeUpload = (file: File): boolean => {
  return validateFile(file)
}

const handleFileChange = (uploadFile: any) => {
  if (!beforeUpload(uploadFile.raw)) return

  const file = uploadFile.raw as File
  const reader = new FileReader()
  reader.onload = (e) => {
    const url = e.target?.result as string
    const uploaded: UploadedFile = {
      name: file.name,
      url,
      size: file.size,
      raw: file,
    }
    setFile(uploaded)
  }
  reader.readAsDataURL(file)
}

const setFile = (file: UploadedFile | null) => {
  if (props.multiple) {
    // 多文件模式
    if (file) {
      const current = Array.isArray(previewFile.value) ? previewFile.value as any[] : []
      previewFile.value = [...current, file] as any
      emit('file-change', [file.raw!])
    }
  } else {
    // 单文件模式
    previewFile.value = file
    if (file) {
      emit('update:modelValue', file.url)
      emit('change', file)
      emit('file-change', [file.raw!])
    } else {
      emit('update:modelValue', '')
      emit('change', null)
    }
  }
}

const handleRemove = () => {
  if (props.multiple) {
    // 多文件：移除最后一个
    const list = (previewFile.value as any[]).slice(0, -1)
    previewFile.value = list.length ? list as any : null
    emit('update:modelValue', list.map(f => f.url))
    emit('change', list)
  } else {
    setFile(null)
  }
}

// 初始化
watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      previewFile.value = null
      fileList.value = []
    }
  }
)

defineExpose({
  clear: () => {
    previewFile.value = null
    fileList.value = []
  },
  getFile: () => previewFile.value,
})
</script>

<style scoped lang="scss">
.file-upload {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__inner {
    :deep(.el-upload) {
      display: inline-block;
    }
  }

  &__tip {
    font-size: 12px;
    color: #f56c6c;
  }

  &__preview {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background: #f5f7fa;
    max-width: 320px;
  }

  &__file-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    background: #e4e7ed;
    border-radius: 4px;
    color: #909399;
  }

  &__preview-info {
    flex: 1;
    min-width: 0;
  }

  &__file-name {
    font-size: 13px;
    color: #303133;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__file-size {
    font-size: 12px;
    color: #909399;
    margin-top: 2px;
  }

  &__remove {
    position: absolute;
    top: 4px;
    right: 4px;
    font-size: 14px;
    color: #909399;
    cursor: pointer;
    z-index: 1;

    &:hover {
      color: #f56c6c;
    }
  }
}
</style>
