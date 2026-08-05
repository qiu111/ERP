<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="580px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="所属菜单">
        <el-tree-select
          v-model="formData.pid"
          :data="parentOptions"
          :props="{ label: 'name', value: 'id', children: 'children' }"
          check-strictly
          clearable
          :render-after-expand="false"
          placeholder="请选择所属菜单（留空为顶级）"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="菜单ID" prop="id">
        <el-input
          v-model="formData.id"
          placeholder="请输入菜单ID"
          :disabled="mode === 'edit'"
        />
      </el-form-item>

      <el-form-item label="功能名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入功能名称" />
      </el-form-item>

      <el-form-item label="连接地址">
        <el-input v-model="formData.url" placeholder="请输入连接地址（如 /system/user）" />
      </el-form-item>

      <el-form-item label="编码" prop="code">
        <el-input v-model="formData.code" placeholder="请输入功能编码" />
      </el-form-item>

      <el-form-item label="类型">
        <el-radio-group v-model="formData.type">
          <el-radio value="function">功能</el-radio>
          <el-radio value="menu">菜单</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="图标">
        <el-input v-model="formData.icon" placeholder="请输入图标名称" />
      </el-form-item>

      <el-form-item label="排序">
        <el-input-number
          v-model="formData.sort"
          :min="0"
          :max="9999"
          controls-position="right"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="是否启用">
        <el-radio-group v-model="formData.enabled">
          <el-radio :value="true">是</el-radio>
          <el-radio :value="false">否</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="备注">
        <el-input
          v-model="formData.memo"
          type="textarea"
          :rows="3"
          maxlength="225"
          show-word-limit
          placeholder="请输入备注信息"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        提交
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { addFunction, updateFunction } from '@/api/function'
import type { FunctionItem } from '@/mock/function'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit'
  record?: FunctionItem | null
  parentList?: FunctionItem[]
  defaultPid?: string
}

const props = withDefaults(defineProps<Props>(), {
  record: null,
  parentList: () => [],
  defaultPid: '0',
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

interface FormData {
  id: string
  pid: string
  name: string
  code: string
  url: string
  type: 'menu' | 'function'
  icon: string
  sort: number
  enabled: boolean
  memo: string
}

const defaultFormData = (): FormData => ({
  id: '',
  pid: '0',
  name: '',
  code: '',
  url: '',
  type: 'menu',
  icon: '',
  sort: 0,
  enabled: true,
  memo: '',
})

const formData = ref<FormData>(defaultFormData())

const formRules: FormRules<FormData> = {
  id: [{ required: true, message: '请输入菜单ID', trigger: 'blur' }],
  name: [{ required: true, message: '请输入功能名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入功能编码', trigger: 'blur' }],
}

const dialogTitle = computed(() => {
  return props.mode === 'add' ? '新增功能' : '编辑功能'
})

// 所属菜单选项
const parentOptions = computed(() => {
  if (!props.record) return props.parentList
  // 编辑时，排除当前节点及其子节点，防止循环引用
  const excludeIds = new Set<string>()
  const collectIds = (items: FunctionItem[]) => {
    items.forEach((item) => {
      if (item.id === props.record!.id) {
        excludeIds.add(item.id)
        const walk = (children?: FunctionItem[]) => {
          children?.forEach((c) => {
            excludeIds.add(c.id)
            walk(c.children)
          })
        }
        walk(item.children)
      }
    })
  }
  collectIds(props.parentList)

  const filterTree = (items: FunctionItem[]): FunctionItem[] => {
    return items
      .filter((item) => !excludeIds.has(item.id))
      .map((item) => ({
        ...item,
        children: item.children ? filterTree(item.children) : undefined,
      }))
  }
  return filterTree(props.parentList)
})

// 监听弹窗打开，初始化表单
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.mode === 'edit' && props.record) {
        const record = props.record
        formData.value = {
          id: record.id,
          pid: record.pid,
          name: record.name,
          code: record.code,
          url: record.url || '',
          type: record.type || 'menu',
          icon: record.icon || '',
          sort: record.sort ?? 0,
          enabled: record.enabled ?? (record.status === 'normal'),
          memo: record.memo || '',
        }
      } else {
        formData.value = {
          ...defaultFormData(),
          id: Date.now().toString(),
          pid: props.defaultPid || '0',
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
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const payload: Partial<FunctionItem> = {
        id: formData.value.id,
        pid: formData.value.pid,
        name: formData.value.name,
        code: formData.value.code,
        url: formData.value.url,
        type: formData.value.type,
        icon: formData.value.icon,
        sort: formData.value.sort,
        status: formData.value.enabled ? 'normal' : 'disabled',
        enabled: formData.value.enabled,
        memo: formData.value.memo,
      }
      if (props.mode === 'add') {
        await addFunction(payload)
      } else if (props.record) {
        await updateFunction(props.record.id, payload)
      }
      emit('success')
      handleClose()
    } catch (err) {
      console.error(err)
    } finally {
      submitting.value = false
    }
  })
}
</script>
