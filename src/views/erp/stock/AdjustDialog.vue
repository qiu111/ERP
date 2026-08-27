<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="1100px"
    :close-on-click-modal="false"
    top="5vh"
    @close="handleClose"
  >
    <div class="adjust-dialog">
      <div class="adjust-dialog__toolbar">
        <el-button
          v-if="mode !== 'view'"
          type="warning"
          @click="productSelectVisible = true"
        >
          <el-icon><ShoppingCart /></el-icon>
          商品选择
        </el-button>
      </div>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        label-position="right"
        :disabled="mode === 'view'"
      >
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="单号" prop="adjustNo">
              <el-input
                v-model="formData.adjustNo"
                placeholder="请输入单号"
                :disabled="mode === 'edit'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="方式" prop="adjustType">
              <el-select
                v-model="formData.adjustType"
                placeholder="请选择"
                style="width: 100%"
                @change="handleTypeChange"
              >
                <el-option
                  v-for="opt in adjustTypeOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="仓库" prop="warehouseName">
              <el-select
                v-model="formData.warehouseName"
                placeholder="请选择"
                style="width: 100%"
                @change="handleWarehouseChange"
              >
                <el-option
                  v-for="opt in warehouseOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="经办人" prop="operator">
              <el-select
                v-model="formData.operator"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in operatorOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="制单人员" prop="creator">
              <el-input
                v-model="formData.creator"
                placeholder="请输入制单人员"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="制单日期" prop="createDate">
              <el-date-picker
                v-model="formData.createDate"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="调整原因" prop="adjustReason">
              <el-input
                v-model="formData.adjustReason"
                type="textarea"
                :rows="2"
                placeholder="请输入调整原因"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div class="adjust-dialog__items">
        <el-table
          :data="formData.items"
          border
          style="width: 100%"
          :empty-text="'暂无商品明细，请点击商品选择添加'"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column label="操作" width="80" align="center" fixed="left">
            <template #default="{ $index }">
              <el-button
                v-if="mode !== 'view'"
                type="primary"
                link
                size="small"
                @click="addRow"
              >
                +
              </el-button>
              <el-button
                v-if="mode !== 'view'"
                type="danger"
                link
                size="small"
                @click="removeItem($index)"
              >
                -
              </el-button>
            </template>
          </el-table-column>
          <el-table-column label="条形码" prop="barcode" width="100" align="center">
            <template #default="{ row }">
              <span>{{ row.barcode || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="商品名称" prop="productName" min-width="140">
            <template #default="{ row }">
              <el-input
                v-if="mode !== 'view'"
                v-model="row.productName"
                placeholder="请输入"
                size="small"
              />
              <span v-else>{{ row.productName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="规格" prop="spec" width="120">
            <template #default="{ row }">
              <el-input
                v-if="mode !== 'view'"
                v-model="row.spec"
                placeholder="请输入"
                size="small"
              />
              <span v-else>{{ row.spec }}</span>
            </template>
          </el-table-column>
          <el-table-column label="单位" prop="unit" width="80" align="center">
            <template #default="{ row }">
              <el-input
                v-if="mode !== 'view'"
                v-model="row.unit"
                placeholder="请输入"
                size="small"
              />
              <span v-else>{{ row.unit }}</span>
            </template>
          </el-table-column>
          <el-table-column label="数量" prop="quantity" width="110" align="right">
            <template #default="{ row }">
              <el-input-number
                v-if="mode !== 'view'"
                v-model="row.quantity"
                :min="0"
                size="small"
                controls-position="right"
                style="width: 100%"
                @change="calcAmount(row)"
              />
              <span v-else>{{ row.quantity }}</span>
            </template>
          </el-table-column>
          <el-table-column label="出厂价" prop="factoryPrice" width="110" align="right">
            <template #default="{ row }">
              <el-input-number
                v-if="mode !== 'view'"
                v-model="row.factoryPrice"
                :min="0"
                :precision="2"
                size="small"
                controls-position="right"
                style="width: 100%"
                @change="calcAmount(row)"
              />
              <span v-else>{{ row.factoryPrice?.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="金额" prop="amount" width="120" align="right">
            <template #default="{ row }">
              <span class="amount-cell">{{ row.amount?.toFixed(2) }}</span>
            </template>
          </el-table-column>
        </el-table>

        <div class="items-footer">
          <span class="total-label">合计：</span>
          <span class="total-amount">¥{{ totalAmount.toFixed(2) }}</span>
        </div>
      </div>
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
        保存
      </el-button>
    </template>

    <ProductSelect
      v-model="productSelectVisible"
      @confirm="handleProductSelectConfirm"
    />
  </el-dialog>
</template>

<script setup lang="ts">

import { ShoppingCart } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  addStockAdjust,
  updateStockAdjust,
  adjustTypeOptions,
  warehouseOptions,
  operatorOptions,
  type AdjustItem,
  type StockAdjust,
} from '@/mock/stockAdjust'
import ProductSelect from './ProductSelect.vue'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: StockAdjust | null
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
const productSelectVisible = ref(false)

interface FormData {
  adjustNo: string
  adjustType: 'in' | 'out'
  warehouseName: string
  warehouseCode: string
  creator: string
  createDate: string
  operator: string
  adjustReason: string
  items: AdjustItem[]
}

const defaultFormData = (): FormData => ({
  adjustNo: '',
  adjustType: 'in',
  warehouseName: '',
  warehouseCode: '',
  creator: '超级管理员',
  createDate: new Date().toISOString().slice(0, 10),
  operator: '',
  adjustReason: '',
  items: [],
})

const formData = ref<FormData>(defaultFormData())

const formRules: FormRules<FormData> = {
  adjustNo: [{ required: true, message: '请输入单号', trigger: 'blur' }],
  adjustType: [{ required: true, message: '请选择方式', trigger: 'change' }],
  warehouseName: [{ required: true, message: '请选择仓库', trigger: 'change' }],
  creator: [{ required: true, message: '请输入制单人员', trigger: 'blur' }],
  createDate: [{ required: true, message: '请选择制单日期', trigger: 'change' }],
  operator: [{ required: true, message: '请选择经办人', trigger: 'change' }],
}

const dialogTitle = computed(() => {
  const titles: Record<string, string> = {
    add: '新增库存调整单',
    edit: '编辑库存调整单',
    view: '查看库存调整单',
  }
  return titles[props.mode] || '库存调整单'
})

const totalAmount = computed(() => {
  return formData.value.items.reduce((sum, item) => sum + (item.amount || 0), 0)
})

const calcAmount = (row: AdjustItem) => {
  row.amount = (row.quantity || 0) * (row.factoryPrice || 0)
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.mode !== 'add' && props.record) {
        const r = props.record
        formData.value = {
          adjustNo: r.adjustNo,
          adjustType: r.adjustType,
          warehouseName: r.warehouseName,
          warehouseCode: r.warehouseCode,
          creator: r.operator,
          createDate: r.operateDate,
          operator: r.operator,
          adjustReason: r.adjustReason || '',
          items: JSON.parse(JSON.stringify(r.items || [])),
        }
      } else {
        formData.value = {
          ...defaultFormData(),
          adjustNo: `SA-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
        }
      }
    }
  }
)

const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
}

const addRow = () => {
  formData.value.items.push({
    id: `item_${Date.now()}`,
    barcode: '',
    productName: '',
    spec: '',
    unit: '',
    quantity: 1,
    factoryPrice: 0,
    amount: 0,
  })
}

const removeItem = (index: number) => {
  formData.value.items.splice(index, 1)
}

const handleTypeChange = () => {
  // 可以根据方式做一些联动
}

const handleWarehouseChange = () => {
  const opt = warehouseOptions.find((o) => o.value === formData.value.warehouseName)
  formData.value.warehouseCode = opt?.code || ''
}

const handleProductSelectConfirm = (products: Array<{ id: string; name: string; barcode: string; purchasePrice: number }>) => {
  products.forEach((p) => {
    const existing = formData.value.items.find((item) => item.barcode === p.barcode)
    if (!existing) {
      const quantity = 1
      formData.value.items.push({
        id: `item_${Date.now()}_${p.id}`,
        barcode: p.barcode,
        productName: p.name,
        spec: '',
        unit: '',
        quantity,
        factoryPrice: p.purchasePrice,
        amount: quantity * p.purchasePrice,
      })
    }
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const payload = {
        ...formData.value,
        items: formData.value.items.map((item) => ({
          ...item,
          amount: (item.quantity || 0) * (item.factoryPrice || 0),
        })),
        operateDate: formData.value.createDate,
        operateCode: formData.value.warehouseCode,
        auditStatus: 'pending' as const,
        adjustReason: formData.value.adjustReason,
      }
      if (props.mode === 'add') {
        await addStockAdjust(payload)
      } else if (props.record) {
        await updateStockAdjust(props.record.id, payload)
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
.adjust-dialog {
  &__toolbar {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;
  }

  &__items {
    margin-top: 16px;

    &-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 12px 16px;
      background: #f5f7fa;
      border: 1px solid #ebeef5;
      border-top: none;
      border-radius: 0 0 4px 4px;
    }
  }
}

.total-label {
  font-weight: 600;
  color: #303133;
  margin-right: 8px;
}

.total-amount {
  font-weight: 700;
  font-size: 16px;
  color: #f56c6c;
}

.amount-cell {
  font-weight: 500;
  color: #303133;
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-input-number) {
  width: 100%;
}
</style>
