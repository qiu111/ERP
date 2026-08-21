<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="1200px"
    :close-on-click-modal="false"
    top="5vh"
    @close="handleClose"
  >
    <div class="return-dialog">
      <div class="return-dialog__toolbar">
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
            <el-form-item label="单号" prop="returnNo">
              <el-input
                v-model="formData.returnNo"
                placeholder="请输入单号"
                :disabled="mode === 'edit'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="客户" prop="customer">
              <el-select
                v-model="formData.customer"
                placeholder="请选择"
                style="width: 100%"
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
            <el-form-item label="仓库" prop="warehouse">
              <el-select
                v-model="formData.warehouse"
                placeholder="请选择"
                style="width: 100%"
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

      <div class="return-dialog__items">
        <div class="items-header">商品明细</div>
        <el-table
          :data="formData.items"
          border
          style="width: 100%"
          :empty-text="'暂无商品明细，请点击商品选择添加'"
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
          <el-table-column label="商品编码" prop="productCode" width="100" align="center">
            <template #default="{ row }">
              <el-input
                v-if="mode !== 'view'"
                v-model="row.productCode"
                placeholder="请输入"
                size="small"
              />
              <span v-else>{{ row.productCode }}</span>
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
          <el-table-column label="采购价格" prop="purchasePrice" width="110" align="right">
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
          <el-table-column label="采购金额" prop="purchaseAmount" width="120" align="right">
            <template #default="{ row }">
              <span class="amount-cell">{{ row.purchaseAmount?.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="零售价格" prop="retailPrice" width="110" align="right">
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
          <el-table-column label="零售金额" prop="retailAmount" width="120" align="right">
            <template #default="{ row }">
              <span class="amount-cell">{{ row.retailAmount?.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="兑换积分" prop="exchangePoints" width="100" align="right">
            <template #default="{ row }">
              <el-input-number
                v-if="mode !== 'view'"
                v-model="row.exchangePoints"
                :min="0"
                size="small"
                controls-position="right"
                style="width: 100%"
                @change="calcPoints(row)"
              />
              <span v-else>{{ row.exchangePoints }}</span>
            </template>
          </el-table-column>
          <el-table-column label="总积分" prop="totalPoints" width="100" align="right">
            <template #default="{ row }">
              <span class="points-cell">{{ row.totalPoints }}</span>
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
import { ref, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { ShoppingCart } from '@element-plus/icons-vue'
import {
  addSaleReturn,
  updateSaleReturn,
  customerOptions,
  warehouseOptions,
  salespersonOptions,
  type SaleReturnItem,
  type SaleReturn,
} from '@/mock/saleReturn'
import ProductSelect from './ProductSelect.vue'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: SaleReturn | null
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
  returnNo: string
  creator: string
  createDate: string
  customer: string
  salesperson: string
  warehouse: string
  auditDate: string
  prepaymentDate: string
  remark: string
  items: SaleReturnItem[]
}

const defaultFormData = (): FormData => ({
  returnNo: '',
  creator: '超级管理员',
  createDate: new Date().toISOString().slice(0, 10),
  customer: '',
  salesperson: '',
  warehouse: '',
  auditDate: '',
  prepaymentDate: '',
  remark: '',
  items: [],
})

const formData = ref<FormData>(defaultFormData())

const formRules: FormRules<FormData> = {
  returnNo: [{ required: true, message: '请输入单号', trigger: 'blur' }],
  creator: [{ required: true, message: '请输入制单人员', trigger: 'blur' }],
  createDate: [{ required: true, message: '请选择制单日期', trigger: 'change' }],
  customer: [{ required: true, message: '请选择客户', trigger: 'change' }],
  warehouse: [{ required: true, message: '请选择仓库', trigger: 'change' }],
}

const dialogTitle = computed(() => {
  const titles: Record<string, string> = {
    add: '新增销售退货单',
    edit: '编辑销售退货单',
    view: '查看销售退货单',
  }
  return titles[props.mode] || '销售退货单'
})

const totalAmount = computed(() => {
  return formData.value.items.reduce((sum, item) => sum + (item.purchaseAmount || 0), 0)
})

const calcAmount = (row: SaleReturnItem) => {
  row.purchaseAmount = (row.quantity || 0) * (row.purchasePrice || 0)
  row.retailAmount = (row.quantity || 0) * (row.retailPrice || 0)
  calcPoints(row)
}

const calcPoints = (row: SaleReturnItem) => {
  row.totalPoints = (row.quantity || 0) * (row.exchangePoints || 0)
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.mode !== 'add' && props.record) {
        const r = props.record
        formData.value = {
          returnNo: r.returnNo,
          creator: r.creator,
          createDate: r.createDate,
          customer: r.customer,
          salesperson: r.salesperson || '',
          warehouse: r.warehouse,
          auditDate: r.auditDate || '',
          prepaymentDate: r.prepaymentDate || '',
          remark: r.remark || '',
          items: JSON.parse(JSON.stringify(r.items || [])),
        }
      } else {
        formData.value = {
          ...defaultFormData(),
          returnNo: `SR-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
        }
      }
    }
  }
)

const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
}

const removeItem = (index: number) => {
  formData.value.items.splice(index, 1)
}

const handleProductSelectConfirm = (products: Array<{ id: string; name: string; barcode: string; productCode: string; purchasePrice: number; retailPrice: number }>) => {
  products.forEach((p) => {
    const existing = formData.value.items.find(
      (item) => item.barcode === p.barcode || item.productName === p.name
    )
    if (!existing) {
      const quantity = 1
      formData.value.items.push({
        id: `item_${Date.now()}_${p.id}`,
        barcode: p.barcode,
        productName: p.name,
        productCode: p.productCode || '',
        spec: '',
        unit: '',
        quantity,
        purchasePrice: p.purchasePrice,
        purchaseAmount: quantity * p.purchasePrice,
        retailPrice: p.retailPrice,
        retailAmount: quantity * p.retailPrice,
        exchangePoints: 0,
        totalPoints: 0,
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
          purchaseAmount: (item.quantity || 0) * (item.purchasePrice || 0),
          retailAmount: (item.quantity || 0) * (item.retailPrice || 0),
          totalPoints: (item.quantity || 0) * (item.exchangePoints || 0),
        })),
        amount: totalAmount.value,
        operator: formData.value.creator,
        operateDate: formData.value.createDate,
        auditor: formData.value.auditDate ? formData.value.creator : '',
        status: 'draft' as const,
      }
      if (props.mode === 'add') {
        await addSaleReturn(payload)
      } else if (props.record) {
        await updateSaleReturn(props.record.id, payload)
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
          purchaseAmount: (item.quantity || 0) * (item.purchasePrice || 0),
          retailAmount: (item.quantity || 0) * (item.retailPrice || 0),
          totalPoints: (item.quantity || 0) * (item.exchangePoints || 0),
        })),
        amount: totalAmount.value,
        operator: formData.value.creator,
        operateDate: formData.value.createDate,
        auditor: formData.value.auditDate ? formData.value.creator : '',
        status: 'confirmed' as const,
      }
      if (props.mode === 'add') {
        await addSaleReturn(payload)
      } else if (props.record) {
        await updateSaleReturn(props.record.id, payload)
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
.return-dialog {
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

.points-cell {
  font-weight: 500;
  color: #409eff;
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-input-number) {
  width: 100%;
}
</style>
