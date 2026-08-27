<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="600px"
    :close-on-click-modal="false"
    :show-close="true"
    top="10vh"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="160px"
      label-position="right"
    >
      <el-form-item label="属性名称" prop="attributeName" required>
        <el-input
          v-model="formData.attributeName"
          placeholder="请输入属性名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="所属商品类型" prop="specModelId">
        <el-select
          v-model="formData.specModelId"
          placeholder="请选择商品类型"
          clearable
          style="width: 100%;"
        >
          <el-option
            v-for="opt in modelOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input-number
          v-model="formData.sort"
          :min="0"
          :max="999"
          :precision="0"
          controls-position="right"
          style="width: 160px;"
        />
      </el-form-item>

      <el-form-item label="能否进行检索" prop="searchable">
        <el-radio-group v-model="formData.searchable">
          <el-radio value="none">不需要检索</el-radio>
          <el-radio value="keyword">关键字检索</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="该属性值的录入方式" prop="inputType">
        <el-radio-group v-model="formData.inputType">
          <el-radio value="manual">手工录入</el-radio>
          <el-radio value="list">从下面的列表选择</el-radio>
          <el-radio value="textarea">多行文本框</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="可选值列表" prop="optionalValues">
        <el-input
          v-model="formData.optionalValues"
          type="textarea"
          :rows="5"
          :disabled="formData.inputType !== 'list'"
          :placeholder="formData.inputType === 'list' ? '多个可选值时,请用英文下的,分割' : '录入方式为手工或多行文本时,此输入框不需填写'"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          提交
        </el-button>
        <el-button @click="handleClose">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import {
  addGoodsAttribute,
  updateGoodsAttribute,
  type GoodsAttribute,
  type GoodsAttributeForm,
} from '@/mock/goodsAttribute'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit'
  record?: GoodsAttribute | null
  modelOptions?: { value: number; label: string }[]
}

const props = withDefaults(defineProps<Props>(), {
  record: null,
  modelOptions: () => [],
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
  attributeName: string
  specModelId: number | null
  inputType: 'manual' | 'list' | 'textarea'
  optionalValues: string
  searchable: 'none' | 'keyword'
  sort: number
}

const defaultFormData = (): FormData => ({
  attributeName: '',
  specModelId: null,
  inputType: 'manual',
  optionalValues: '',
  searchable: 'none',
  sort: 50,
})

const formData = ref<FormData>(defaultFormData())

const validateName = (_rule: any, value: string, callback: any) => {
  if (!value || !value.trim()) {
    callback(new Error('请输入属性名称'))
  } else if (value.length > 50) {
    callback(new Error('属性名称不能超过50个字符'))
  } else {
    callback()
  }
}

const validateOptionalValues = (_rule: any, value: string, callback: any) => {
  if (formData.value.inputType === 'list' && (!value || !value.trim())) {
    callback(new Error('选择"从列表选择"时，可选值列表不能为空'))
  } else {
    callback()
  }
}

const formRules: FormRules<FormData> = {
  attributeName: [{ required: true, validator: validateName, trigger: 'blur' }],
  optionalValues: [{ validator: validateOptionalValues, trigger: 'blur' }],
}

const dialogTitle = computed(() => {
  return props.mode === 'edit' ? '修改属性' : '新增属性'
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.mode === 'edit' && props.record) {
        const r = props.record
        formData.value = {
          attributeName: r.attributeName,
          specModelId: r.specModelId,
          inputType: r.inputType,
          optionalValues: r.optionalValues,
          searchable: r.searchable,
          sort: r.sort,
        }
      } else {
        formData.value = defaultFormData()
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
      const payload: GoodsAttributeForm = {
        attributeName: formData.value.attributeName.trim(),
        specModelId: formData.value.specModelId,
        inputType: formData.value.inputType,
        optionalValues: formData.value.optionalValues.trim(),
        searchable: formData.value.searchable,
        sort: formData.value.sort,
      }

      if (props.mode === 'edit' && props.record) {
        await updateGoodsAttribute(props.record.id, payload)
        ElMessage.success('修改成功')
      } else {
        await addGoodsAttribute(payload)
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

:deep(.el-form-item) {
  margin-bottom: 18px;
}
</style>
