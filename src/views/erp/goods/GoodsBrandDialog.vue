<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="640px"
    :close-on-click-modal="false"
    :show-close="true"
    top="8vh"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="110px"
      label-position="right"
    >
      <el-form-item label="品牌名称" prop="brandName" required>
        <el-input
          v-model="formData.brandName"
          placeholder="请输入品牌名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="品牌网址" prop="brandUrl">
        <el-input
          v-model="formData.brandUrl"
          placeholder="请输入品牌网址"
        />
      </el-form-item>

      <el-form-item label="所属分类" prop="categoryId" required>
        <div class="category-select-wrapper">
          <el-select
            v-model="firstCategory"
            placeholder="请选择"
            clearable
            style="width: 50%; margin-right: 8px;"
            @change="handleFirstCategoryChange"
          >
            <el-option
              v-for="opt in firstCategoryOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
          <el-select
            v-model="formData.categoryId"
            :placeholder="secondCategory ? '请选择子分类' : '请选择'"
            clearable
            filterable
            style="flex: 1;"
            @change="handleCategoryChange"
          >
            <el-option
              v-for="opt in secondCategoryOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>
      </el-form-item>

      <el-form-item label="品牌logo" prop="brandLogo">
        <FileUpload
          v-model="formData.brandLogo"
          accept="image/*"
          :max-size="5"
          tip="图片最佳大小(120*60)"
          button-text="点击选择文件"
          button-type="warning"
          :accept-images-only="true"
        />
      </el-form-item>

      <el-form-item label="品牌排序" prop="sort">
        <el-input
          v-model.number="formData.sort"
          placeholder="请输入排序数字"
          type="number"
          :min="0"
          :max="999"
        />
      </el-form-item>

      <el-form-item label="是否推荐" prop="isRecommended">
        <el-radio-group v-model="formData.isRecommended">
          <el-radio :value="false">否</el-radio>
          <el-radio :value="true">是</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="4"
          maxlength="225"
          show-word-limit
          placeholder="请输入品牌描述（最多225个字符）"
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
import FileUpload from '@/components/FileUpload.vue'
import {
  addGoodsBrand,
  updateGoodsBrand,
  getBrandCategoryOptions,
  getBrandSubCategories,
  type GoodsBrand,
  type GoodsBrandForm,
} from '@/mock/goodsBrand'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit'
  record?: GoodsBrand | null
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

// 分类相关
const firstCategory = ref<number | null>(null)
const firstCategoryOptions = ref<{ value: number; label: string }[]>([])
const secondCategoryOptions = ref<{ value: number; label: string }[]>([])
const secondCategory = computed(() => firstCategoryOptions.value.length > 0)

interface FormData {
  brandName: string
  brandLogo: string
  brandUrl: string
  categoryId: number | null
  isRecommended: boolean
  sort: number
  description: string
}

const defaultFormData = (): FormData => ({
  brandName: '',
  brandLogo: '',
  brandUrl: '',
  categoryId: null,
  isRecommended: false,
  sort: 0,
  description: '',
})

const formData = ref<FormData>(defaultFormData())

const validateName = (_rule: any, value: string, callback: any) => {
  if (!value || !value.trim()) {
    callback(new Error('请输入品牌名称'))
  } else if (value.length > 50) {
    callback(new Error('品牌名称不能超过50个字符'))
  } else {
    callback()
  }
}

const formRules: FormRules<FormData> = {
  brandName: [{ required: true, validator: validateName, trigger: 'blur' }],
}

const dialogTitle = computed(() => {
  return props.mode === 'edit' ? '修改品牌' : '新增品牌'
})

// 加载分类选项
const loadCategoryOptions = async () => {
  try {
    const res = await getBrandCategoryOptions()
    firstCategoryOptions.value = res.data
  } catch (err) {
    console.error('加载分类选项失败:', err)
  }
}

const handleFirstCategoryChange = async (value: number | null) => {
  secondCategoryOptions.value = []
  if (value) {
    try {
      const res = await getBrandSubCategories(value)
      secondCategoryOptions.value = res.data
    } catch (err) {
      console.error('加载子分类失败:', err)
    }
  }
  // 如果有子分类，设置为第一个；如果没有子分类，直接设置为顶级分类
  if (secondCategoryOptions.value.length > 0 && secondCategoryOptions.value[0]) {
    formData.value.categoryId = secondCategoryOptions.value[0].value
  } else {
    formData.value.categoryId = value
  }
}

const handleCategoryChange = (value: number | null) => {
  formData.value.categoryId = value
}

// 初始化表单数据
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      loadCategoryOptions()
      if (props.mode === 'edit' && props.record) {
        const r = props.record
        formData.value = {
          brandName: r.brandName,
          brandLogo: r.brandLogo,
          brandUrl: r.brandUrl,
          categoryId: r.categoryId,
          isRecommended: r.isRecommended,
          sort: r.sort,
          description: r.description,
        }
        // 根据 categoryId 确定一级分类
        if (r.categoryId) {
          // 遍历顶级分类及其子分类
          for (const top of firstCategoryOptions.value) {
            if (top.value === r.categoryId) {
              firstCategory.value = top.value
              break
            }
          }
        }
      } else {
        formData.value = defaultFormData()
        firstCategory.value = null
        secondCategoryOptions.value = []
      }
    }
  }
)

const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
  firstCategory.value = null
  secondCategoryOptions.value = []
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const payload: GoodsBrandForm = {
        brandName: formData.value.brandName.trim(),
        brandLogo: formData.value.brandLogo,
        brandUrl: formData.value.brandUrl.trim(),
        categoryId: formData.value.categoryId,
        isRecommended: formData.value.isRecommended,
        sort: formData.value.sort,
        description: formData.value.description,
      }

      if (props.mode === 'edit' && props.record) {
        await updateGoodsBrand(props.record.id, payload)
        ElMessage.success('修改成功')
      } else {
        await addGoodsBrand(payload)
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
.category-select-wrapper {
  display: flex;
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}
</style>
