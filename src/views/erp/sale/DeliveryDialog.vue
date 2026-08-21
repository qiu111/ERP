<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="1300px"
    :close-on-click-modal="false"
    top="3vh"
    @close="handleClose"
  >
    <div class="delivery-dialog">
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
            <el-form-item label="单号" prop="deliveryNo">
              <el-input
                v-model="formData.deliveryNo"
                placeholder="请输入单号"
                :disabled="mode === 'edit'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="订单号" prop="orderNo">
              <el-select
                v-model="formData.orderNo"
                placeholder="请选择订单号"
                style="width: 100%"
                filterable
                allow-create
                default-first-option
              >
                <el-option
                  v-for="opt in orderNoOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
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
        </el-row>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="客户" prop="customer">
              <el-select
                v-model="formData.customer"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in deliveryCustomerOptions"
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
                  v-for="opt in deliveryOperatorOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
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
                  v-for="opt in deliveryWarehouseOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="审核日期" prop="auditDate">
              <el-date-picker
                v-model="formData.auditDate"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
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
            <el-form-item label="操作员" prop="operator">
              <el-select
                v-model="formData.operator"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in deliveryOperatorOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="formData.remark"
                placeholder="请输入备注信息"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div class="delivery-dialog__items">
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
          <el-table-column label="条码" prop="barcode" width="100">
            <template #default="{ row }">
              <el-input
                v-if="mode !== 'view'"
                v-model="row.barcode"
                placeholder="请输入"
                size="small"
              />
              <span v-else>{{ row.barcode }}</span>
            </template>
          </el-table-column>
          <el-table-column label="商品名称" prop="productName" width="140">
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
          <el-table-column label="采购价格" prop="purchasePrice" width="100" align="right">
            <template #default="{ row }">
              <el-input-number
                v-if="mode !== 'view'"
                v-model="row.purchasePrice"
                :min="0"
                :precision="2"
                size="small"
                controls-position="right"
                style="width: 100%"
                @change="calcAmount(row)"
              />
              <span v-else>{{ row.purchasePrice?.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="采购金额" prop="purchaseAmount" width="110" align="right">
            <template #default="{ row }">
              <span class="amount-cell">{{ row.purchaseAmount?.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="零售价格" prop="retailPrice" width="100" align="right">
            <template #default="{ row }">
              <el-input-number
                v-if="mode !== 'view'"
                v-model="row.retailPrice"
                :min="0"
                :precision="2"
                size="small"
                controls-position="right"
                style="width: 100%"
                @change="calcAmount(row)"
              />
              <span v-else>{{ row.retailPrice?.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="零售金额" prop="retailAmount" width="110" align="right">
            <template #default="{ row }">
              <span class="amount-cell">{{ row.retailAmount?.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="兑换积分" prop="exchangePoints" width="90" align="right">
            <template #default="{ row }">
              <el-input-number
                v-if="mode !== 'view'"
                v-model="row.exchangePoints"
                :min="0"
                size="small"
                controls-position="right"
                style="width: 100%"
              />
              <span v-else>{{ row.exchangePoints }}</span>
            </template>
          </el-table-column>
          <el-table-column label="总积分" prop="totalPoints" width="100" align="right">
            <template #default="{ row }">
              <span class="amount-cell">{{ row.totalPoints }}</span>
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
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  addSaleDelivery,
  updateSaleDelivery,
  deliveryCustomerOptions,
  deliveryWarehouseOptions,
  deliveryOperatorOptions,
  deliveryAuditorOptions,
  type DeliveryItem,
  type SaleDelivery,
} from '@/mock/saleDelivery'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: SaleDelivery | null
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

// Generate mock order number options
const orderNoOptions = [
  { label: 'SO-2026-0008', value: 'SO-2026-0008' },
  { label: 'SO-2026-0007', value: 'SO-2026-0007' },
  { label: 'SO-2026-0006', value: 'SO-2026-0006' },
  { label: 'SO-2026-0005', value: 'SO-2026-0005' },
  { label: 'SO-2026-0004', value: 'SO-2026-0004' },
  { label: 'SO-2026-0003', value: 'SO-2026-0003' },
]

interface FormData {
  deliveryNo: string
  orderNo: string
  customer: string
  salesperson: string
  warehouse: string
  operator: string
  creator: string
  createDate: string
  auditDate: string
  auditor: string
  prepaymentDate: string
  remark: string
  items: DeliveryItem[]
}

const defaultFormData = (): FormData => ({
  deliveryNo: '',
  orderNo: '',
  customer: '',
  salesperson: '超级管理员',
  warehouse: '',
  operator: '超级管理员',
  creator: '超级管理员',
  createDate: new Date().toISOString().slice(0, 10),
  auditDate: '',
  auditor: '',
  prepaymentDate: '',
  remark: '',
  items: [],
})

const formData = ref<FormData>(defaultFormData())

const formRules: FormRules<FormData> = {
  deliveryNo: [{ required: true, message: '请输入单号', trigger: 'blur' }],
  customer: [{ required: true, message: '请选择客户', trigger: 'change' }],
  creator: [{ required: true, message: '请输入制单人员', trigger: 'blur' }],
  createDate: [{ required: true, message: '请选择制单日期', trigger: 'change' }],
  warehouse: [{ required: true, message: '请选择仓库', trigger: 'change' }],
  operator: [{ required: true, message: '请选择操作员', trigger: 'change' }],
}

const dialogTitle = computed(() => {
  const titles: Record<string, string> = {
    add: '新增销售出库单',
    edit: '编辑销售出库单',
    view: '查看销售出库单',
  }
  return titles[props.mode] || '销售出库单'
})

const totalAmount = computed(() => {
  return formData.value.items.reduce((sum, item) => sum + (item.retailAmount || 0), 0)
})

const calcAmount = (row: DeliveryItem) => {
  const qty = row.quantity || 0
  row.purchaseAmount = qty * (row.purchasePrice || 0)
  row.retailAmount = qty * (row.retailPrice || 0)
  row.totalPoints = qty * (row.exchangePoints || 0)
}

const addItem = () => {
  formData.value.items.push({
    id: `item_${Date.now()}`,
    barcode: '',
    productName: '',
    spec: '',
    unit: '',
    quantity: 1,
    purchasePrice: 0,
    purchaseAmount: 0,
    retailPrice: 0,
    retailAmount: 0,
    exchangePoints: 0,
    totalPoints: 0,
  })
}

const removeItem = (index: number) => {
  formData.value.items.splice(index, 1)
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.mode !== 'add' && props.record) {
        const r = props.record
        formData.value = {
          deliveryNo: r.deliveryNo,
          orderNo: r.orderNo,
          customer: r.customer,
          salesperson: r.salesperson,
          warehouse: r.warehouse,
          operator: r.operator,
          creator: r.operator,
          createDate: r.operateDate,
          auditDate: r.auditDate || '',
          auditor: r.auditor || '',
          prepaymentDate: r.prepaymentDate || '',
          remark: r.remark || '',
          items: JSON.parse(JSON.stringify(r.items || [])),
        }
      } else {
        formData.value = {
          ...defaultFormData(),
          deliveryNo: `SO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
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
        operateDate: formData.value.createDate,
        items: formData.value.items.map((item) => ({
          ...item,
          purchaseAmount: (item.quantity || 0) * (item.purchasePrice || 0),
          retailAmount: (item.quantity || 0) * (item.retailPrice || 0),
          totalPoints: (item.quantity || 0) * (item.exchangePoints || 0),
        })),
        totalAmount: totalAmount.value,
        status: 'draft' as const,
      }
      if (props.mode === 'add') {
        await addSaleDelivery(payload)
      } else if (props.record) {
        await updateSaleDelivery(props.record.id, payload)
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
        operateDate: formData.value.createDate,
        items: formData.value.items.map((item) => ({
          ...item,
          purchaseAmount: (item.quantity || 0) * (item.purchasePrice || 0),
          retailAmount: (item.quantity || 0) * (item.retailPrice || 0),
          totalPoints: (item.quantity || 0) * (item.exchangePoints || 0),
        })),
        totalAmount: totalAmount.value,
        status: 'confirmed' as const,
      }
      if (props.mode === 'add') {
        await addSaleDelivery(payload)
      } else if (props.record) {
        await updateSaleDelivery(props.record.id, payload)
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
.delivery-dialog {
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