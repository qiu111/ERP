<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="1200px"
    :close-on-click-modal="false"
    top="5vh"
    @close="handleClose"
  >
    <div class="order-dialog">
      <div class="order-dialog__toolbar">
        <!-- <el-button v-if="mode !== 'view'" type="primary" @click="handleAddRow">
          <el-icon><Edit /></el-icon>
          新增
        </el-button> -->
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
          <el-col :span="6">
            <el-form-item label="采购单号" prop="orderNo">
              <el-input
                v-model="formData.orderNo"
                placeholder="请输入采购单号"
                :disabled="mode === 'edit'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="采购类型" prop="purchaseType">
              <el-select
                v-model="formData.purchaseType"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in purchaseTypes"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="关联订单" prop="relatedOrder">
              <el-input
                v-model="formData.relatedOrder"
                placeholder="请输入关联订单"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="采购公司" prop="company">
              <el-select
                v-model="formData.company"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in companies"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="制单人员" prop="creator">
              <el-input
                v-model="formData.creator"
                placeholder="请输入制单人员"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
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
          <el-col :span="6">
            <el-form-item label="仓库" prop="warehouse">
              <el-select
                v-model="formData.warehouse"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in warehouses"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="采购员" prop="buyer">
              <el-input
                v-model="formData.buyer"
                placeholder="请输入采购员"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="交货日期" prop="deliveryDate">
              <el-date-picker
                v-model="formData.deliveryDate"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="预付款日期" prop="prepaymentDate">
              <el-date-picker
                v-model="formData.prepaymentDate"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="交易价格" prop="tradePrice">
              <el-select
                v-model="formData.tradePrice"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option label="市场价" value="市场价" />
                <el-option label="出厂价" value="出厂价" />
                <el-option label="成本价" value="成本价" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="付款方式" prop="paymentMethod">
              <el-select
                v-model="formData.paymentMethod"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in paymentMethods"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="预付款" prop="prepaymentPct">
              <el-input-number
                v-model="formData.prepaymentPct"
                :min="0"
                :max="100"
                :precision="0"
                :step="5"
                controls-position="right"
                style="width: 100%"
              />
              <span class="percent-sign">%</span>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="中期款" prop="midTermPct">
              <el-input-number
                v-model="formData.midTermPct"
                :min="0"
                :max="100"
                :precision="0"
                :step="5"
                controls-position="right"
                style="width: 100%"
              />
              <span class="percent-sign">%</span>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="尾款" prop="balancePct">
              <el-input-number
                v-model="formData.balancePct"
                :min="0"
                :max="100"
                :precision="0"
                :step="5"
                controls-position="right"
                style="width: 100%"
              />
              <span class="percent-sign">%</span>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="运输方式" prop="shippingMethod">
              <el-select
                v-model="formData.shippingMethod"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in shippingMethods"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="formData.remark"
                type="textarea"
                :rows="3"
                placeholder="请输入备注信息"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div class="order-dialog__items">
        <div class="items-header">商品明细</div>
        <el-table
          :data="formData.items"
          border
          style="width: 100%"
          :empty-text="'暂无商品明细，请点击新增或商品选择添加'"
        >
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column label="操作" width="100" align="center" fixed="left">
            <template #default="{ $index }">
              <el-button
                v-if="mode !== 'view'"
                type="danger"
                link
                size="small"
                @click="removeItem($index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
          <el-table-column label="供应商编号" prop="supplierCode" width="120">
            <template #default="{ row }">
              <el-input
                v-if="mode !== 'view'"
                v-model="row.supplierCode"
                placeholder="请输入"
                size="small"
              />
              <span v-else>{{ row.supplierCode }}</span>
            </template>
          </el-table-column>
          <el-table-column label="供应商名称" prop="supplierName" width="160">
            <template #default="{ row }">
              <el-input
                v-if="mode !== 'view'"
                v-model="row.supplierName"
                placeholder="请输入"
                size="small"
              />
              <span v-else>{{ row.supplierName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="商品名称" prop="productName" width="160">
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
          <el-table-column label="采购数量" prop="quantity" width="110" align="right">
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
          <el-table-column label="采购单价" prop="unitPrice" width="110" align="right">
            <template #default="{ row }">
              <el-input-number
                v-if="mode !== 'view'"
                v-model="row.unitPrice"
                :min="0"
                :precision="2"
                size="small"
                controls-position="right"
                style="width: 100%"
                @change="calcAmount(row)"
              />
              <span v-else>{{ row.unitPrice?.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="采购金额" prop="amount" width="120" align="right">
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
        type="success"
        @click="handleSave"
      >
        保存
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

    <ProductSelect
      v-model="productSelectVisible"
      @confirm="handleProductSelectConfirm"
    />
  </el-dialog>
</template>

<script setup lang="ts">

import { Edit, ShoppingCart } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  addPurchaseOrder,
  updatePurchaseOrder,
  purchaseTypes,
  companies,
  warehouses,
  paymentMethods,
  shippingMethods,
} from '@/mock/purchaseOrder'
import type { PurchaseOrder, PurchaseOrderItem } from '@/mock/purchaseOrder'
import ProductSelect from './ProductSelect.vue'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: PurchaseOrder | null
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
  orderNo: string
  purchaseType: string
  relatedOrder: string
  company: string
  creator: string
  createDate: string
  warehouse: string
  buyer: string
  deliveryDate: string
  prepaymentDate: string
  tradePrice: string
  paymentMethod: string
  prepaymentPct: number
  midTermPct: number
  balancePct: number
  shippingMethod: string
  remark: string
  items: PurchaseOrderItem[]
}

const defaultFormData = (): FormData => ({
  orderNo: '',
  purchaseType: '',
  relatedOrder: '',
  company: '',
  creator: '超级管理员',
  createDate: new Date().toISOString().slice(0, 10),
  warehouse: '',
  buyer: '',
  deliveryDate: '',
  prepaymentDate: '',
  tradePrice: '',
  paymentMethod: '',
  prepaymentPct: 0,
  midTermPct: 0,
  balancePct: 0,
  shippingMethod: '',
  remark: '',
  items: [],
})

const formData = ref<FormData>(defaultFormData())

const validatePctSum = (_rule: any, _value: any, callback: (error?: Error) => void) => {
  const sum = formData.value.prepaymentPct + formData.value.midTermPct + formData.value.balancePct
  if (sum !== 100) {
    callback(new Error('预付款+中期款+尾款比例合计必须为100%'))
  } else {
    callback()
  }
}

const formRules: FormRules<FormData> = {
  orderNo: [{ required: true, message: '请输入采购单号', trigger: 'blur' }],
  purchaseType: [{ required: true, message: '请选择采购类型', trigger: 'change' }],
  company: [{ required: true, message: '请选择采购公司', trigger: 'change' }],
  creator: [{ required: true, message: '请输入制单人员', trigger: 'blur' }],
  createDate: [{ required: true, message: '请选择制单日期', trigger: 'change' }],
  warehouse: [{ required: true, message: '请选择仓库', trigger: 'change' }],
  buyer: [{ required: true, message: '请输入采购员', trigger: 'blur' }],
  deliveryDate: [{ required: true, message: '请选择交货日期', trigger: 'change' }],
  paymentMethod: [{ required: true, message: '请选择付款方式', trigger: 'change' }],
  prepaymentPct: [{ validator: validatePctSum, trigger: 'change' }],
  midTermPct: [{ validator: validatePctSum, trigger: 'change' }],
  balancePct: [{ validator: validatePctSum, trigger: 'change' }],
}

const dialogTitle = computed(() => {
  const titles: Record<string, string> = {
    add: '新增采购订单',
    edit: '编辑采购订单',
    view: '查看采购订单',
  }
  return titles[props.mode] || '采购订单'
})

const totalAmount = computed(() => {
  return formData.value.items.reduce((sum, item) => sum + (item.amount || 0), 0)
})

const calcAmount = (row: PurchaseOrderItem) => {
  row.amount = (row.quantity || 0) * (row.unitPrice || 0)
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.mode !== 'add' && props.record) {
        const r = props.record
        formData.value = {
          orderNo: r.orderNo,
          purchaseType: r.purchaseType,
          relatedOrder: r.relatedOrder || '',
          company: r.company,
          creator: r.creator,
          createDate: r.createDate,
          warehouse: r.warehouse,
          buyer: r.buyer,
          deliveryDate: r.deliveryDate,
          prepaymentDate: r.prepaymentDate || '',
          tradePrice: r.tradePrice || '',
          paymentMethod: r.paymentMethod,
          prepaymentPct: r.prepaymentPct || 0,
          midTermPct: r.midTermPct || 0,
          balancePct: r.balancePct || 0,
          shippingMethod: r.shippingMethod || '',
          remark: r.remark || '',
          items: JSON.parse(JSON.stringify(r.items || [])),
        }
      } else {
        formData.value = {
          ...defaultFormData(),
          orderNo: `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
        }
      }
    }
  }
)

const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
}

// const handleAddRow = () => {
//   formData.value.items.push({
//     id: `item_${Date.now()}`,
//     supplierCode: '',
//     supplierName: '',
//     productName: '',
//     spec: '',
//     unit: '',
//     quantity: 1,
//     unitPrice: 0,
//     amount: 0,
//   })
// }

const removeItem = (index: number) => {
  formData.value.items.splice(index, 1)
}

const handleProductSelectConfirm = (products: Array<{ id: string; name: string; factoryPrice: number; costPrice: number; marketPrice: number }>) => {
  products.forEach((p) => {
    const existing = formData.value.items.find(
      (item) => item.productName === p.name
    )
    if (!existing) {
      const price =
        formData.value.tradePrice === '市场价'
          ? p.marketPrice
          : formData.value.tradePrice === '成本价'
            ? p.costPrice
            : p.factoryPrice
      formData.value.items.push({
        id: `item_${Date.now()}_${p.id}`,
        supplierCode: '',
        supplierName: '',
        productName: p.name,
        spec: '',
        unit: '',
        quantity: 1,
        unitPrice: price,
        amount: price,
      })
    }
  })
}

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const payload = {
        ...formData.value,
        items: formData.value.items.map((item) => ({
          ...item,
          amount: (item.quantity || 0) * (item.unitPrice || 0),
        })),
        totalAmount: totalAmount.value,
        status: 'draft',
      }
      if (props.mode === 'add') {
        await addPurchaseOrder(payload)
      } else if (props.record) {
        await updatePurchaseOrder(props.record.id, payload)
      }
      ElMessage.success('已保存为草稿')
      emit('success')
      handleClose()
    } catch (err) {
      console.error(err)
    } finally {
      submitting.value = false
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
          amount: (item.quantity || 0) * (item.unitPrice || 0),
        })),
        totalAmount: totalAmount.value,
        status: 'confirmed',
      }
      if (props.mode === 'add') {
        await addPurchaseOrder(payload)
      } else if (props.record) {
        await updatePurchaseOrder(props.record.id, payload)
      }
      ElMessage.success('提交成功')
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
.order-dialog {
  &__toolbar {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;
  }

  &__items {
    margin-top: 16px;

    &-header {
      font-weight: 600;
      margin-bottom: 10px;
      color: #303133;
    }

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

.percent-sign {
  margin-left: 4px;
  color: #606266;
  font-size: 13px;
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