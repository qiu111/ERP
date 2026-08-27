<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="450px"
    :close-on-click-modal="false"
    :show-close="true"
    top="15vh"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item
        label="类型名称"
        prop="modelName"
        required
      >
        <el-input
          v-model="formData.modelName"
          placeholder="请输入类型名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button
          type="primary"
          :loading="submitting"
          @click="handleSubmit"
        >
          保存
        </el-button>
        <el-button @click="handleClose">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import {
  addGoodsModel,
  updateGoodsModel,
  type GoodsModel,
  type GoodsModelForm,
} from '@/mock/goodsModel'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit'
  record?: GoodsModel | null
}

const props = withDefaults(defineProps<Props>(), {
  record: null,
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
  modelName: string
}

const formData = ref<FormData>({
  modelName: '',
})

// 自定义校验器：检查是否为空
const validateName = (_rule: any, value: string, callback: any) => {
  if (!value || !value.trim()) {
    callback(new Error('请输入类型名称'))
  } else {
    callback()
  }
}

const formRules: FormRules<FormData> = {
  modelName: [
    { required: true, validator: validateName, trigger: 'blur' },
  ],
}

const dialogTitle = computed(() => {
  return props.mode === 'edit' ? '修改商品类型' : '添加商品类型'
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.mode === 'edit' && props.record) {
        formData.value.modelName = props.record.modelName
      } else {
        formData.value.modelName = ''
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
      const payload: GoodsModelForm = {
        modelName: formData.value.modelName.trim(),
      }

      if (props.mode === 'edit' && props.record) {
        await updateGoodsModel(props.record.id, payload)
        ElMessage.success('修改成功')
      } else {
        await addGoodsModel(payload)
        ElMessage.success('新增成功')
      }
      emit('success')
      handleClose()
    } catch (err: any) {
      console.error(err)
      ElMessage.error(err.message || '保存失败')
    } finally {
      submitting.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
