<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="640px"
    :close-on-click-modal="false"
    top="8vh"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      label-position="right"
    >
      <el-form-item label="分类名称" prop="name" required>
        <el-input
          v-model="formData.name"
          placeholder="请输入分类名称"
        />
      </el-form-item>

      <el-form-item label="手机分类名称" prop="mobileName">
        <el-input
          v-model="formData.mobileName"
          placeholder="请输入手机端显示的分类名称（留空则同分类名称）"
        />
      </el-form-item>

      <el-form-item label="所属分类" prop="parentId">
        <div class="parent-select-wrapper">
          <el-select
            v-model="selectedParentLevel"
            placeholder="请选择层级"
            style="width: 120px; margin-right: 8px;"
            @change="handleLevelChange"
          >
            <el-option label="顶级分类" value="top" />
            <el-option
              v-if="parentCategoryOptions.length > 0"
              label="二级分类"
              value="sub"
            />
          </el-select>
          <el-select
            v-model="formData.parentId"
            :placeholder="parentSelectPlaceholder"
            clearable
            filterable
            style="flex: 1;"
            @change="handleParentChange"
          >
            <el-option
              v-for="opt in currentParentOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>
      </el-form-item>

      <el-form-item label="导航显示" prop="isVisible">
        <el-radio-group v-model="formData.isVisible">
          <el-radio :value="true">是</el-radio>
          <el-radio :value="false">否</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="是否推荐" prop="isRecommended">
        <el-radio-group v-model="formData.isRecommended">
          <el-radio :value="true">是</el-radio>
          <el-radio :value="false">否</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="分类分组" prop="group">
        <el-select
          v-model="formData.group"
          placeholder="请选择分组"
          style="width: 200px;"
        >
          <el-option
            v-for="opt in groupOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="分类图片" prop="image">
        <div class="image-upload-wrapper">
          <el-upload
            class="image-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleImageChange"
            accept="image/*"
          >
            <el-button type="primary">点击选择文件</el-button>
          </el-upload>
          <span class="image-tip">图片最佳大小(120*60)</span>
        </div>
      </el-form-item>

      <el-form-item label="显示排序" prop="sort">
        <el-input-number
          v-model="formData.sort"
          :min="0"
          :max="999"
          :precision="0"
          controls-position="right"
          style="width: 200px;"
        />
      </el-form-item>

      <el-form-item label="分佣比例" prop="commissionRate">
        <div class="commission-wrapper">
          <el-input-number
            v-model="formData.commissionRate"
            :min="0"
            :max="100"
            :precision="0"
            controls-position="right"
            style="width: 200px;"
          />
          <span class="commission-unit">%</span>
        </div>
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="4"
          maxlength="225"
          show-word-limit
          placeholder="请输入备注信息（最多225个字符）"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="primary"
        :loading="submitting"
        @click="handleSubmit"
      >
        提交
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import {
  addCategory,
  updateCategory,
  getTopCategories,
  getSubCategories,
  groupOptions,
  type GoodsCategory,
  type GoodsCategoryForm,
} from '@/mock/goodsCategory'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'addChild'
  record?: GoodsCategory | null
  parentCategories?: { value: string; label: string }[]
  parentCategory?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  record: null,
  parentCategories: () => [],
  parentCategory: null,
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

// 所属分类相关
const selectedParentLevel = ref<'top' | 'sub'>('top')
const topCategoryOptions = ref<{ value: string; label: string }[]>([])
const subCategoryOptions = ref<{ value: string; label: string }[]>([])

interface FormData {
  name: string
  mobileName: string
  isRecommended: boolean
  isVisible: boolean
  group: number
  sort: number
  parentId: string | null
  image: string
  commissionRate: number
  remark: string
}

const defaultFormData = (): FormData => ({
  name: '',
  mobileName: '',
  isRecommended: false,
  isVisible: true,
  group: 0,
  sort: 50,
  parentId: null,
  image: '',
  commissionRate: 0,
  remark: '',
})

const formData = ref<FormData>(defaultFormData())

// 校验规则
const validateName = (_rule: any, value: string, callback: any) => {
  if (!value || !value.trim()) {
    callback(new Error('请输入分类名称'))
  } else if (value.length > 50) {
    callback(new Error('分类名称不能超过50个字符'))
  } else {
    callback()
  }
}

const formRules: FormRules<FormData> = {
  name: [{ required: true, validator: validateName, trigger: 'blur' }],
}

const dialogTitle = computed(() => {
  const titles: Record<string, string> = {
    add: '新增分类',
    edit: '修改分类',
    addChild: '新增子分类',
  }
  return titles[props.mode] || '分类'
})

const parentSelectPlaceholder = computed(() => {
  if (selectedParentLevel.value === 'top') {
    return '请选择顶级分类（不选则为顶级）'
  }
  return '请选择所属二级分类'
})

// 当前可选的父级选项
const currentParentOptions = computed(() => {
  if (selectedParentLevel.value === 'top') {
    return topCategoryOptions.value
  }
  return subCategoryOptions.value
})

// 加载父级分类选项
const loadParentOptions = async () => {
  try {
    const topRes = await getTopCategories()
    topCategoryOptions.value = topRes.data.map((c) => ({ value: c.id, label: c.name }))
    
    // 如果是编辑模式且有父级，需要加载对应的子分类
    if (props.mode === 'edit' && props.record?.parentId) {
      const subRes = await getSubCategories(props.record.parentId)
      subCategoryOptions.value = subRes.data.map((c) => ({ value: c.id, label: c.name }))
    }
  } catch (err) {
    console.error('加载分类选项失败:', err)
  }
}

// 处理层级变化
const handleLevelChange = () => {
  formData.value.parentId = null
  if (selectedParentLevel.value === 'sub' && topCategoryOptions.value.length > 0) {
    // 切换到二级时，先加载所有顶级下的子分类
    loadAllSubCategories()
  }
}

// 加载所有子分类选项（用于二级选择）
const loadAllSubCategories = async () => {
  try {
    const allSubs: { value: string; label: string }[] = []
    for (const top of topCategoryOptions.value) {
      const res = await getSubCategories(top.value)
      res.data.forEach((sub) => {
        allSubs.push({ value: sub.id, label: `${top.label} - ${sub.name}` })
      })
    }
    subCategoryOptions.value = allSubs
  } catch (err) {
    console.error('加载子分类失败:', err)
  }
}

// 处理父级选择变化
const handleParentChange = (value: string | null) => {
  formData.value.parentId = value
}

// 处理图片选择
const handleImageChange = (file: any) => {
  if (file.raw) {
    formData.value.image = file.name
  }
}

// 打开对话框时初始化数据
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      loadParentOptions()
      
      if (props.mode === 'edit' && props.record) {
        const r = props.record
        formData.value = {
          name: r.name,
          mobileName: r.mobileName || '',
          isRecommended: r.isRecommended,
          isVisible: r.isVisible,
          group: r.group,
          sort: r.sort,
          parentId: r.parentId,
          image: r.image || '',
          commissionRate: r.commissionRate || 0,
          remark: r.remark || '',
        }
        // 根据 parentId 设置层级
        if (r.parentId) {
          // 判断 parentId 是否在顶级分类中
          const isTopLevel = topCategoryOptions.value.some((o) => o.value === r.parentId)
          selectedParentLevel.value = isTopLevel ? 'top' : 'sub'
        } else {
          selectedParentLevel.value = 'top'
        }
      } else if (props.mode === 'addChild' && props.parentCategory) {
        // 新增子分类模式
        selectedParentLevel.value = 'top'
        formData.value = {
          ...defaultFormData(),
          parentId: props.parentCategory,
        }
        // 设置默认手机分类名称
        formData.value.mobileName = ''
        // 加载对应子分类
        const loadSubs = async () => {
          const res = await getSubCategories(props.parentCategory!)
          subCategoryOptions.value = res.data.map((c) => ({ value: c.id, label: c.name }))
        }
        loadSubs()
      } else {
        // 新增顶级分类
        selectedParentLevel.value = 'top'
        formData.value = defaultFormData()
      }
    }
  }
)

const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
  selectedParentLevel.value = 'top'
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const payload: GoodsCategoryForm = {
        ...formData.value,
        mobileName: formData.value.mobileName || formData.value.name,
      }
      
      if (props.mode === 'edit' && props.record) {
        await updateCategory(props.record.id, payload)
        ElMessage.success('修改成功')
      } else {
        await addCategory(payload)
        ElMessage.success('新增成功')
      }
      emit('success')
      handleClose()
    } catch (err) {
      console.error(err)
      ElMessage.error('保存失败')
    } finally {
      submitting.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.parent-select-wrapper {
  display: flex;
  width: 100%;
}

.image-upload-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.image-tip {
  font-size: 12px;
  color: #f56c6c;
}

.commission-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.commission-unit {
  color: #606266;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}
</style>
