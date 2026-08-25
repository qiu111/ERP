<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="960px"
    :close-on-click-modal="false"
    top="5vh"
    @close="handleClose"
  >
    <div class="self-goods-dialog">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="110px"
        label-position="right"
        :disabled="mode === 'view'"
      >
        <!-- 通用信息 -->
        <div class="form-section">
          <div class="form-section__title">通用信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="商品分类" prop="category">
                <el-select
                  v-model="formData.category"
                  placeholder="请选择分类"
                  filterable
                  style="width: 100%"
                >
                  <el-option
                    v-for="opt in categoryOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="商品名称" prop="productName">
                <el-input
                  v-model="formData.productName"
                  placeholder="请输入商品名称"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="昵称" prop="nickname">
                <el-input
                  v-model="formData.nickname"
                  placeholder="请输入昵称"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="商品品牌" prop="brand">
                <el-select
                  v-model="formData.brand"
                  placeholder="请选择品牌"
                  clearable
                  style="width: 100%"
                >
                  <el-option
                    v-for="opt in brandOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="产地" prop="origin">
                <el-input
                  v-model="formData.origin"
                  placeholder="请输入产地"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="商品货号" prop="productCode">
                <el-input
                  v-model="formData.productCode"
                  placeholder="请输入商品货号"
                  :disabled="mode === 'edit'"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="单位" prop="unit">
                <el-select
                  v-model="formData.unit"
                  placeholder="请选择单位"
                  style="width: 100%"
                >
                  <el-option
                    v-for="opt in unitOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="商品重量" prop="weight">
                <div class="weight-input">
                  <el-input-number
                    v-model="formData.weight"
                    :min="0"
                    :precision="0"
                    controls-position="right"
                    style="width: calc(100% - 50px)"
                  />
                  <span class="weight-unit">g</span>
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="采购价" prop="purchasePrice">
                <el-input-number
                  v-model="formData.purchasePrice"
                  :min="0"
                  :precision="2"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="供应商" prop="supplier">
                <el-select
                  v-model="formData.supplier"
                  placeholder="请选择供应商"
                  style="width: 100%"
                >
                  <el-option
                    v-for="opt in supplierOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="市场价" prop="marketPrice">
                <el-input-number
                  v-model="formData.marketPrice"
                  :min="0"
                  :precision="2"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="成本价" prop="costPrice">
                <el-input-number
                  v-model="formData.costPrice"
                  :min="0"
                  :precision="2"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="会员价" prop="memberPrice">
                <el-input-number
                  v-model="formData.memberPrice"
                  :min="0"
                  :precision="2"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="兑换积分" prop="exchangePoints">
                <el-input-number
                  v-model="formData.exchangePoints"
                  :min="0"
                  :precision="0"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 出口业务必填 -->
        <div class="form-section">
          <div class="form-section__title form-section__title--required">
            出口业务必填
          </div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="报关英文名" prop="customsEnglishName">
                <el-input
                  v-model="formData.customsEnglishName"
                  placeholder="请输入报关英文名"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="货源地" prop="sourcePlace">
                <el-input
                  v-model="formData.sourcePlace"
                  placeholder="请输入货源地"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="出口HS编码" prop="hsCode">
                <el-input
                  v-model="formData.hsCode"
                  placeholder="请输入出口HS编码"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="出口退税率" prop="exportRebateRate">
                <div class="rebate-input">
                  <el-input-number
                    v-model="formData.exportRebateRate"
                    :min="0"
                    :max="100"
                    :precision="0"
                    controls-position="right"
                    style="width: calc(100% - 30px)"
                  />
                  <span class="rebate-unit">%</span>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 更多选项 -->
        <div class="form-section">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="是否包邮">
                <el-checkbox v-model="formData.isFreeShipping" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="上架情况">
                <el-checkbox v-model="formData.isOnShelf" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="是否推荐">
                <el-checkbox v-model="formData.isRecommended" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="是否新品">
                <el-checkbox v-model="formData.isNew" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="是否热卖">
                <el-checkbox v-model="formData.isHotSale" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="是否参与积分">
                <el-checkbox v-model="formData.isPointsParticipation" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="商品关键词" prop="keywords">
                <el-input
                  v-model="formData.keywords"
                  placeholder="请输入商品关键词，多个用逗号分隔"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="商品简介" prop="description">
                <el-input
                  v-model="formData.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入商品简介"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 商品详情描述（富文本编辑器） -->
        <div class="form-section">
          <el-form-item label="商品详情描述" prop="detailDescription" label-width="130px" required>
            <RichEditor
              v-model="formData.detailDescription"
              :disabled="mode === 'view'"
            />
            <div class="form-tip">
              注意：此数据同步合同数据
            </div>
          </el-form-item>
        </div>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="handleClose">
        {{ mode === 'view' ? '关闭' : '取消' }}
      </el-button>
      <el-button
        v-if="mode !== 'view'"
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
import { ref, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  addSelfGoods,
  updateSelfGoods,
  brandOptions,
  categoryOptions,
  supplierOptions,
  unitOptions,
  type SelfGoods,
} from '@/mock/goodsSelf'
import RichEditor from '@/components/RichEditor.vue'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: SelfGoods | null
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
  productCode: string
  productName: string
  nickname: string
  brand: string
  origin: string
  category: string
  spec: string
  unit: string
  weight: number
  purchasePrice: number
  supplier: string
  marketPrice: number
  costPrice: number
  memberPrice: number
  exchangePoints: number
  customsEnglishName: string
  sourcePlace: string
  hsCode: string
  exportRebateRate: number
  isFreeShipping: boolean
  isOnShelf: boolean
  isRecommended: boolean
  isNew: boolean
  isHotSale: boolean
  isPointsParticipation: boolean
  keywords: string
  description: string
  detailDescription: string
  sortOrder: number
}

const defaultFormData = (): FormData => ({
  productCode: '',
  productName: '',
  nickname: '',
  brand: '',
  origin: '',
  category: '',
  spec: '默认规格:默认',
  unit: '个',
  weight: 0,
  purchasePrice: 0,
  supplier: '',
  marketPrice: 0,
  costPrice: 0,
  memberPrice: 0,
  exchangePoints: 0,
  customsEnglishName: '',
  sourcePlace: '',
  hsCode: '',
  exportRebateRate: 0,
  isFreeShipping: false,
  isOnShelf: true,
  isRecommended: false,
  isNew: false,
  isHotSale: false,
  isPointsParticipation: false,
  keywords: '',
  description: '',
  detailDescription: '',
  sortOrder: 5,
})

const formData = ref<FormData>(defaultFormData())

const formRules: FormRules<FormData> = {
  category: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  productName: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  productCode: [{ required: true, message: '请输入商品货号', trigger: 'blur' }],
  unit: [{ required: true, message: '请选择单位', trigger: 'change' }],
  purchasePrice: [{ required: true, message: '请输入采购价', trigger: 'blur' }],
  supplier: [{ required: true, message: '请选择供应商', trigger: 'change' }],
  sourcePlace: [{ required: true, message: '请输入货源地', trigger: 'blur' }],
  detailDescription: [{ required: true, message: '请输入商品详情描述', trigger: 'blur' }],
}

const dialogTitle = computed(() => {
  const titles: Record<string, string> = {
    add: '新增商品',
    edit: '修改商品',
    view: '查看商品',
  }
  return titles[props.mode] || '商品'
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.mode !== 'add' && props.record) {
        const r = props.record
        formData.value = {
          productCode: r.productCode,
          productName: r.productName,
          nickname: r.nickname || '',
          brand: r.brand || '',
          origin: r.origin || '',
          category: r.category,
          spec: r.spec || '默认规格:默认',
          unit: r.unit || '个',
          weight: r.weight || 0,
          purchasePrice: r.purchasePrice || 0,
          supplier: r.supplier || '',
          marketPrice: r.marketPrice || 0,
          costPrice: r.costPrice || 0,
          memberPrice: r.memberPrice || 0,
          exchangePoints: r.exchangePoints || 0,
          customsEnglishName: r.customsEnglishName || '',
          sourcePlace: r.sourcePlace || '',
          hsCode: r.hsCode || '',
          exportRebateRate: r.exportRebateRate || 0,
          isFreeShipping: r.isFreeShipping || false,
          isOnShelf: r.isOnShelf ?? true,
          isRecommended: r.isRecommended || false,
          isNew: r.isNew || false,
          isHotSale: r.isHotSale || false,
          isPointsParticipation: r.isPointsParticipation || false,
          keywords: r.keywords || '',
          description: r.description || '',
          detailDescription: r.detailDescription || '',
          sortOrder: r.sortOrder || 5,
        }
      } else {
        formData.value = {
          ...defaultFormData(),
          productCode: `SP${Date.now().toString().slice(-6)}`,
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
      const payload = {
        ...formData.value,
      }
      if (props.mode === 'add') {
        await addSelfGoods(payload)
      } else if (props.record) {
        await updateSelfGoods(props.record.id, payload)
      }
      ElMessage.success('保存成功')
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

<style scoped lang="scss">
.self-goods-dialog {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 10px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c0c4cc;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f7fa;
  }
}

.form-section {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
    padding-left: 10px;
    border-left: 3px solid #409eff;

    &--required {
      border-left-color: #f56c6c;
    }
  }
}

.weight-input {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.weight-unit {
  color: #909399;
  font-size: 14px;
}

.rebate-input {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.rebate-unit {
  color: #909399;
  font-size: 14px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  padding-left: 110px;
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-checkbox) {
  height: 32px;
  line-height: 32px;
}
</style>