<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="560px"
    :close-on-click-modal="false"
    :show-close="true"
    top="12vh"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      label-position="right"
    >
      <el-form-item label="规格名称" prop="specName" required>
        <el-input
          v-model="formData.specName"
          placeholder="请输入规格名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="所属商品类型" prop="specModelId" required>
        <el-select
          v-model="formData.specModelId"
          placeholder="请选择商品类型"
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

      <el-form-item label="能否进行检索" prop="searchable">
        <el-radio-group v-model="formData.searchable">
          <el-radio value="none">不需要检索</el-radio>
          <el-radio value="keyword">关键字检索</el-radio>
        </el-radio-group>
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

      <el-form-item label="规格项" prop="specItems">
        <el-input
          v-model="formData.specItems"
          type="textarea"
          :rows="5"
          placeholder="多个规格项时,请用逗号分隔"
          maxlength="500"
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
  addGoodsSpec,
  updateGoodsSpec,
  type GoodsSpec,
  type GoodsSpecForm,
} from '@/mock/goodsSpec'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit'
  record?: GoodsSpec | null
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
  specName: string
  specModelId: number | null
  searchable: 'none' | 'keyword'
  sort: number
  specItems: string
}

const defaultFormData = (): FormData => ({
  specName: '',
  specModelId: null,
  searchable: 'none',
  sort: 50,
  specItems: '',
})

const formData = ref<FormData>(defaultFormData())

// 校验规则
const validateSpecName = (_rule: any, value: string, callback: any) => {
  if (!value || !value.trim()) {
    callback(new Error('请输入规格名称'))
  } else if (value.length > 50) {
    callback(new Error('规格名称不能超过50个字符'))
  } else {
    callback()
  }
}

const validateSpecModelId = (_rule: any, value: number, callback: any) => {
  if (!value) {
    callback(new Error('请选择所属商品类型'))
  } else {
    callback()
  }
}

const formRules: FormRules<FormData> = {
  specName: [{ required: true, validator: validateSpecName, trigger: 'blur' }],
  specModelId: [{ required: true, validator: validateSpecModelId, trigger: 'change' }],
}

const dialogTitle = computed(() => {
  return props.mode === 'edit' ? '修改规格' : '新增规格'
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.mode === 'edit' && props.record) {
        const r = props.record
        formData.value = {
          specName: r.specName,
          specModelId: r.specModelId,
          searchable: r.searchable,
          sort: r.sort,
          specItems: r.specItems,
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
      const payload: GoodsSpecForm = {
        specName: formData.value.specName.trim(),
        specModelId: formData.value.specModelId!,
        searchable: formData.value.searchable,
        sort: formData.value.sort,
        specItems: formData.value.specItems.trim(),
      }

      if (props.mode === 'edit' && props.record) {
        await updateGoodsSpec(props.record.id, payload)
        ElMessage.success('修改成功')
      } else {
        await addGoodsSpec(payload)
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
