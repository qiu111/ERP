<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="1200px"
    :close-on-click-modal="false"
    top="3vh"
    @close="handleClose"
  >
    <div class="order-dialog">
      <div v-if="mode !== 'view'" class="dialog-toolbar">
        <el-button type="primary" size="small" @click="handleGeneratePI">生成PI</el-button>
        <el-button type="primary" size="small" @click="handleGenerateContract">销售合同</el-button>
        <el-button type="primary" size="small" @click="handleOpenProfit">利润估算</el-button>
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
            <el-form-item label="订单编号" prop="orderNo">
              <el-input
                v-model="formData.orderNo"
                placeholder="请输入订单编号"
                :disabled="mode === 'edit'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="业务类型" prop="saleType">
              <el-select
                v-model="formData.saleType"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in saleTypes"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="销售公司" prop="company">
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
          <el-col :span="6">
            <el-form-item label="客户" prop="customer">
              <el-select
                v-model="formData.customer"
                placeholder="请选择"
                style="width: 100%"
                filterable
                allow-create
                default-first-option
              >
                <el-option
                  v-for="opt in customerOptions"
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
            <el-form-item label="销售员" prop="salesperson">
              <el-select
                v-model="formData.salesperson"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in salespersonOptions"
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
            <el-form-item label="预收日期" prop="prepaymentDate">
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
            <el-form-item label="交易方式" prop="tradeMethod">
              <el-select
                v-model="formData.tradeMethod"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in tradeMethods"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="起运港口" prop="loadingPort">
              <el-select
                v-model="formData.loadingPort"
                placeholder="请选择"
                style="width: 100%"
                clearable
              >
                <el-option
                  v-for="opt in ports"
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
            <el-form-item label="目的港口" prop="destinationPort">
              <el-select
                v-model="formData.destinationPort"
                placeholder="请选择"
                style="width: 100%"
                clearable
                filterable
                allow-create
                default-first-option
              >
                <el-option
                  v-for="opt in ports"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
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
          <el-col :span="6">
            <el-form-item label="收款方式" prop="paymentMethod">
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
          <el-col :span="6">
            <el-form-item label="收款币种" prop="currency">
              <el-select
                v-model="formData.currency"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in currencies"
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
            <el-form-item label="订单来源" prop="orderSource">
              <el-select
                v-model="formData.orderSource"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in orderSources"
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
                :rows="2"
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
          :empty-text="'暂无商品明细，请点击下方按钮添加'"
        >
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column label="操作" width="80" align="center" fixed="left">
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
          <el-table-column label="供应商名称" prop="supplierName" width="120">
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
          <el-table-column label="商品名称" prop="productName" width="150">
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
          <el-table-column label="数量" prop="quantity" width="100" align="right">
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
          <el-table-column label="销售单价" prop="unitPrice" width="110" align="right">
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
          <el-table-column label="销售金额" prop="amount" width="120" align="right">
            <template #default="{ row }">
              <span class="amount-cell">{{ row.amount?.toFixed(2) }}</span>
            </template>
          </el-table-column>
        </el-table>

        <div class="items-toolbar">
          <el-button
            v-if="mode !== 'view'"
            type="primary"
            size="small"
            @click="addItem"
          >
            <el-icon><Plus /></el-icon>
            添加商品
          </el-button>
        </div>

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
  </el-dialog>

  <ProfitEstimateDialog
    v-model="profitVisible"
    :items="formData.items.map(i => ({
      productName: i.productName,
      unit: i.unit,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      spec: i.spec,
    }))"
  />
</template>

<script setup lang="ts">

import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import ProfitEstimateDialog from './ProfitEstimateDialog.vue'
import {
  addSaleOrder,
  updateSaleOrder,
  saleTypes,
  companies,
  warehouses,
  tradeMethods,
  ports,
  shippingMethods,
  paymentMethods,
  currencies,
  orderSources,
  customerOptions,
  salespersonOptions,
  type SaleOrderItem,
  type SaleOrder,
} from '@/mock/saleOrder'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: SaleOrder | null
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
const profitVisible = ref(false)

interface FormData {
  orderNo: string
  saleType: string
  customer: string
  company: string
  creator: string
  createDate: string
  warehouse: string
  salesperson: string
  deliveryDate: string
  prepaymentDate: string
  tradeMethod: string
  loadingPort: string
  destinationPort: string
  shippingMethod: string
  declarationContractNo: string
  paymentMethod: string
  currency: string
  prepaymentPct: number
  midTermPct: number
  balancePct: number
  orderSource: string
  remark: string
  items: SaleOrderItem[]
}

const defaultFormData = (): FormData => ({
  orderNo: '',
  saleType: '出口销售',
  customer: '',
  company: '',
  creator: '超级管理员',
  createDate: new Date().toISOString().slice(0, 10),
  warehouse: '',
  salesperson: '销售经理',
  deliveryDate: '',
  prepaymentDate: '',
  tradeMethod: 'FOB',
  loadingPort: '',
  destinationPort: '',
  shippingMethod: 'sea',
  declarationContractNo: '',
  paymentMethod: 'telegraphic_transfer',
  currency: 'USD',
  prepaymentPct: 30,
  midTermPct: 30,
  balancePct: 40,
  orderSource: '手工创建',
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
  orderNo: [{ required: true, message: '请输入订单编号', trigger: 'blur' }],
  saleType: [{ required: true, message: '请选择业务类型', trigger: 'change' }],
  customer: [{ required: true, message: '请选择客户', trigger: 'change' }],
  creator: [{ required: true, message: '请输入制单人员', trigger: 'blur' }],
  createDate: [{ required: true, message: '请选择制单日期', trigger: 'change' }],
  company: [{ required: true, message: '请选择销售公司', trigger: 'change' }],
  warehouse: [{ required: true, message: '请选择仓库', trigger: 'change' }],
  salesperson: [{ required: true, message: '请选择销售员', trigger: 'change' }],
  deliveryDate: [{ required: true, message: '请选择交货日期', trigger: 'change' }],
  tradeMethod: [{ required: true, message: '请选择交易方式', trigger: 'change' }],
  currency: [{ required: true, message: '请选择收款币种', trigger: 'change' }],
  prepaymentPct: [{ validator: validatePctSum, trigger: 'change' }],
  midTermPct: [{ validator: validatePctSum, trigger: 'change' }],
  balancePct: [{ validator: validatePctSum, trigger: 'change' }],
}

const dialogTitle = computed(() => {
  const titles: Record<string, string> = {
    add: '新增销售订单',
    edit: '编辑销售订单',
    view: '查看销售订单',
  }
  return titles[props.mode] || '销售订单'
})

const totalAmount = computed(() => {
  return formData.value.items.reduce((sum, item) => sum + (item.amount || 0), 0)
})

const calcAmount = (row: SaleOrderItem) => {
  row.amount = (row.quantity || 0) * (row.unitPrice || 0)
}

const addItem = () => {
  formData.value.items.push({
    id: `item_${Date.now()}`,
    supplierCode: '',
    supplierName: '',
    productName: '',
    spec: '',
    unit: '',
    quantity: 1,
    unitPrice: 0,
    amount: 0,
  })
}

const removeItem = (index: number) => {
  formData.value.items.splice(index, 1)
}

const handleGeneratePI = () => {
  ElMessage.success('生成PI功能开发中...')
}

const handleGenerateContract = () => {
  ElMessage.success('销售合同功能开发中...')
}

const handleOpenProfit = () => {
  profitVisible.value = true
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.mode !== 'add' && props.record) {
        const r = props.record
        formData.value = {
          orderNo: r.orderNo,
          saleType: r.saleType,
          customer: r.customer,
          company: r.company,
          creator: r.creator,
          createDate: r.createDate,
          warehouse: r.warehouse,
          salesperson: r.salesperson,
          deliveryDate: r.deliveryDate,
          prepaymentDate: r.prepaymentDate || '',
          tradeMethod: r.tradeMethod,
          loadingPort: r.loadingPort || '',
          destinationPort: r.destinationPort || '',
          shippingMethod: r.shippingMethod,
          declarationContractNo: r.declarationContractNo || '',
          paymentMethod: r.paymentMethod,
          currency: r.currency,
          prepaymentPct: r.prepaymentPct || 0,
          midTermPct: r.midTermPct || 0,
          balancePct: r.balancePct || 0,
          orderSource: r.orderSource || '',
          remark: r.remark || '',
          items: JSON.parse(JSON.stringify(r.items || [])),
        }
      } else {
        formData.value = {
          ...defaultFormData(),
          orderNo: `SO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
        }
      }
    }
  }
)

const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
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
        status: 'draft' as const,
      }
      if (props.mode === 'add') {
        await addSaleOrder(payload)
      } else if (props.record) {
        await updateSaleOrder(props.record.id, payload)
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
        status: 'confirmed' as const,
      }
      if (props.mode === 'add') {
        await addSaleOrder(payload)
      } else if (props.record) {
        await updateSaleOrder(props.record.id, payload)
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
  &__items {
    margin-top: 16px;

    &-header {
      font-weight: 600;
      margin-bottom: 10px;
      color: #303133;
    }

    &-toolbar {
      margin-top: 10px;
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

.dialog-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
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