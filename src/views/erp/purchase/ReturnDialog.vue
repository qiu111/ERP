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
            <el-form-item label="供应商" prop="supplier">
              <el-select
                v-model="formData.supplier"
                placeholder="请选择"
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
            <el-form-item label="采购员" prop="buyer">
              <el-input
                v-model="formData.buyer"
                placeholder="请输入采购员"
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
          <el-table-column label="退货数量" prop="returnQuantity" width="110" align="right">
            <template #default="{ row }">
              <el-input-number
                v-if="mode !== 'view'"
                v-model="row.returnQuantity"
                :min="0"
                size="small"
                controls-position="right"
                style="width: 100%"
                @change="calcAmount(row)"
              />
              <span v-else>{{ row.returnQuantity }}</span>
            </template>
          </el-table-column>
          <el-table-column label="退货原因" prop="returnReason" width="130">
            <template #default="{ row }">
              <el-select
                v-if="mode !== 'view'"
                v-model="row.returnReason"
                placeholder="请选择"
                size="small"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in returnReasonOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
              <span v-else>{{ row.returnReason }}</span>
            </template>
          </el-table-column>
          <el-table-column label="出厂价格" prop="factoryPrice" width="110" align="right">
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
          <el-table-column label="出厂金额" prop="factoryAmount" width="120" align="right">
            <template #default="{ row }">
              <span class="amount-cell">{{ row.factoryAmount?.toFixed(2) }}</span>
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

import { ShoppingCart } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  addPurchaseReturn,
  updatePurchaseReturn,
  supplierOptions,
  warehouseOptions,
  returnReasonOptions,
  type ReturnItem,
  type PurchaseReturn,
} from '@/mock/purchaseReturn'
import ProductSelect from './ProductSelect.vue'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: PurchaseReturn | null
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
  supplier: string
  buyer: string
  warehouse: string
  auditDate: string
  prepaymentDate: string
  remark: string
  items: ReturnItem[]
}

const defaultFormData = (): FormData => ({
  returnNo: '',
  creator: '超级管理员',
  createDate: new Date().toISOString().slice(0, 10),
  supplier: '',
  buyer: '',
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
  supplier: [{ required: true, message: '请选择供应商', trigger: 'change' }],
  warehouse: [{ required: true, message: '请选择仓库', trigger: 'change' }],
}

const dialogTitle = computed(() => {
  const titles: Record<string, string> = {
    add: '新增退货返厂单',
    edit: '编辑退货返厂单',
    view: '查看退货返厂单',
  }
  return titles[props.mode] || '退货返厂单'
})

const totalAmount = computed(() => {
  return formData.value.items.reduce((sum, item) => sum + (item.factoryAmount || 0), 0)
})

const calcAmount = (row: ReturnItem) => {
  row.factoryAmount = (row.returnQuantity || 0) * (row.factoryPrice || 0)
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
          supplier: r.supplier,
          buyer: r.buyer || '',
          warehouse: r.warehouse,
          auditDate: r.auditDate || '',
          prepaymentDate: r.prepaymentDate || '',
          remark: r.remark || '',
          items: JSON.parse(JSON.stringify(r.items || [])),
        }
      } else {
        formData.value = {
          ...defaultFormData(),
          returnNo: `RT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
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

const handleProductSelectConfirm = (products: Array<{ id: string; name: string; barcode: string; factoryPrice: number; costPrice: number; marketPrice: number }>) => {
  products.forEach((p) => {
    const existing = formData.value.items.find(
      (item) => item.barcode === p.barcode || item.productName === p.name
    )
    if (!existing) {
      formData.value.items.push({
        id: `item_${Date.now()}_${p.id}`,
        barcode: p.barcode,
        productName: p.name,
        spec: '',
        unit: '',
        returnQuantity: 1,
        returnReason: '',
        factoryPrice: p.factoryPrice,
        factoryAmount: p.factoryPrice,
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
          factoryAmount: (item.returnQuantity || 0) * (item.factoryPrice || 0),
        })),
        amount: totalAmount.value,
        operator: formData.value.creator,
        operateDate: formData.value.createDate,
        auditor: formData.value.auditDate ? formData.value.creator : '',
        status: 'draft' as const,
      }
      if (props.mode === 'add') {
        await addPurchaseReturn(payload)
      } else if (props.record) {
        await updatePurchaseReturn(props.record.id, payload)
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
          factoryAmount: (item.returnQuantity || 0) * (item.factoryPrice || 0),
        })),
        amount: totalAmount.value,
        operator: formData.value.creator,
        operateDate: formData.value.createDate,
        auditor: formData.value.auditDate ? formData.value.creator : '',
        status: 'confirmed' as const,
      }
      if (props.mode === 'add') {
        await addPurchaseReturn(payload)
      } else if (props.record) {
        await updatePurchaseReturn(props.record.id, payload)
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

:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-input-number) {
  width: 100%;
}
</style>