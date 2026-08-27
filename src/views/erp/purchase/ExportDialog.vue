<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="1280px"
    :close-on-click-modal="false"
    top="3vh"
    @close="handleClose"
  >
    <div class="export-dialog">
      <div class="export-dialog__toolbar">
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
          @click="handleInvoice"
        >
          发票开具
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
            <el-form-item label="关联订单" prop="relatedOrder">
              <el-select
                v-model="formData.relatedOrder"
                placeholder="请选择"
                clearable
                style="width: 100%"
                @change="handleRelatedOrderChange"
              >
                <el-option
                  v-for="opt in relatedOrderOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="销售公司" prop="salesCompany">
              <el-select
                v-model="formData.salesCompany"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in salesCompanyOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="订单编号" prop="orderNo">
              <el-input
                v-model="formData.orderNo"
                placeholder="请输入订单编号"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="客户名称" prop="customerName">
              <el-input
                v-model="formData.customerName"
                placeholder="请输入客户名称"
              />
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
                  v-for="opt in warehouseOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="销售人员" prop="salesperson">
              <el-select
                v-model="formData.salesperson"
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
        </el-row>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="出口日期" prop="exportDate">
              <el-date-picker
                v-model="formData.exportDate"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="成交方式" prop="tradeMethod">
              <el-select
                v-model="formData.tradeMethod"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in tradeMethodOptions"
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
              >
                <el-option
                  v-for="opt in portOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="目的港口" prop="destinationPort">
              <el-select
                v-model="formData.destinationPort"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in portOptions"
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
            <el-form-item label="报关合同号" prop="declarationContractNo">
              <el-input
                v-model="formData.declarationContractNo"
                placeholder="请输入报关合同号"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="提单号码" prop="billOfLadingNo">
              <el-input
                v-model="formData.billOfLadingNo"
                placeholder="请输入提单号码"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="船名航次" prop="vesselVoyage">
              <el-input
                v-model="formData.vesselVoyage"
                placeholder="请输入船名航次"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="征免性质" prop="taxExemptionNature">
              <el-select
                v-model="formData.taxExemptionNature"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in taxExemptionOptions"
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
            <el-form-item label="包装种类" prop="packagingType">
              <el-select
                v-model="formData.packagingType"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in packagingTypeOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="报关件数" prop="declarationQty">
              <el-input-number
                v-model="formData.declarationQty"
                :min="0"
                :precision="0"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="毛重(千克)" prop="grossWeight">
              <el-input-number
                v-model="formData.grossWeight"
                :min="0"
                :precision="2"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="净重(千克)" prop="netWeight">
              <el-input-number
                v-model="formData.netWeight"
                :min="0"
                :precision="2"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
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
          <el-col :span="6">
            <el-form-item label="审核人" prop="auditor">
              <el-select
                v-model="formData.auditor"
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
          <el-col :span="6">
            <el-form-item label="收汇币种" prop="settlementCurrency">
              <el-select
                v-model="formData.settlementCurrency"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in settlementCurrencyOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="运输方式" prop="transportMethod">
              <el-select
                v-model="formData.transportMethod"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in transportMethodOptions"
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

      <div class="export-dialog__items">
        <div class="items-header">商品明细</div>
        <el-table
          :data="formData.items"
          border
          style="width: 100%"
          :empty-text="'暂无商品明细'"
        >
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column label="操作" width="80" align="center" fixed="left">
            <template #default="{ $index }">
              <el-button
                v-if="mode !== 'view'"
                type="primary"
                link
                size="small"
                @click="addItem"
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
          <el-table-column label="货源地" prop="sourceArea" width="110">
            <template #default="{ row }">
              <el-select
                v-if="mode !== 'view'"
                v-model="row.sourceArea"
                placeholder="请选择"
                size="small"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in sourceAreaOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
              <span v-else>{{ row.sourceArea }}</span>
            </template>
          </el-table-column>
          <el-table-column label="供应商" prop="supplier" width="130">
            <template #default="{ row }">
              <el-select
                v-if="mode !== 'view'"
                v-model="row.supplier"
                placeholder="请选择"
                size="small"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in supplierOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
              <span v-else>{{ row.supplier }}</span>
            </template>
          </el-table-column>
          <el-table-column label="HS编码" prop="hsCode" width="130">
            <template #default="{ row }">
              <el-input
                v-if="mode !== 'view'"
                v-model="row.hsCode"
                placeholder="请输入"
                size="small"
              />
              <span v-else>{{ row.hsCode }}</span>
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
          <el-table-column label="规格" prop="spec" width="100">
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
          <el-table-column label="单位" prop="unit" width="70" align="center">
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
          <el-table-column label="数量" prop="quantity" width="90" align="right">
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
          <el-table-column label="销售单价" prop="salePrice" width="100" align="right">
            <template #default="{ row }">
              <el-input-number
                v-if="mode !== 'view'"
                v-model="row.salePrice"
                :min="0"
                :precision="2"
                size="small"
                controls-position="right"
                style="width: 100%"
                @change="calcAmount(row)"
              />
              <span v-else>{{ row.salePrice?.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="销售金额" prop="saleAmount" width="110" align="right">
            <template #default="{ row }">
              <span class="amount-cell">{{ row.saleAmount?.toFixed(2) }}</span>
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
        提交
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">

import type { FormInstance, FormRules } from 'element-plus'
import {
  addPurchaseExport,
  updatePurchaseExport,
  tradeMethodOptions,
  portOptions,
  taxExemptionOptions,
  packagingTypeOptions,
  settlementCurrencyOptions,
  transportMethodOptions,
  salesCompanyOptions,
  warehouseOptions,
  operatorOptions,
  sourceAreaOptions,
  supplierOptions,
  type ExportItem,
  type PurchaseExport,
} from '@/mock/purchaseExport'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: PurchaseExport | null
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

// 关联订单选项（示例数据）
const relatedOrderOptions = [
  { label: 'SO-2026-0008', value: 'SO-2026-0008' },
  { label: 'SO-2026-0007', value: 'SO-2026-0007' },
  { label: 'SO-2026-0005', value: 'SO-2026-0005' },
]

interface FormData {
  exportNo: string
  relatedOrder: string
  salesCompany: string
  orderNo: string
  customerName: string
  creator: string
  createDate: string
  warehouse: string
  salesperson: string
  exportDate: string
  tradeMethod: string
  loadingPort: string
  destinationPort: string
  declarationContractNo: string
  billOfLadingNo: string
  vesselVoyage: string
  taxExemptionNature: string
  packagingType: string
  declarationQty: number
  grossWeight: number
  netWeight: number
  auditDate: string
  auditor: string
  settlementCurrency: string
  transportMethod: string
  remark: string
  items: ExportItem[]
}

const defaultFormData = (): FormData => ({
  exportNo: '',
  relatedOrder: '',
  salesCompany: '',
  orderNo: '',
  customerName: '',
  creator: '超级管理员',
  createDate: new Date().toISOString().slice(0, 10),
  warehouse: '',
  salesperson: '',
  exportDate: '',
  tradeMethod: '',
  loadingPort: '',
  destinationPort: '',
  declarationContractNo: '',
  billOfLadingNo: '',
  vesselVoyage: '',
  taxExemptionNature: '',
  packagingType: '',
  declarationQty: 0,
  grossWeight: 0,
  netWeight: 0,
  auditDate: '',
  auditor: '',
  settlementCurrency: '',
  transportMethod: '',
  remark: '',
  items: [],
})

const formData = ref<FormData>(defaultFormData())

const formRules: FormRules<FormData> = {
  exportNo: [{ required: true, message: '请输入单号', trigger: 'blur' }],
  creator: [{ required: true, message: '请输入制单人员', trigger: 'blur' }],
  createDate: [{ required: true, message: '请选择制单日期', trigger: 'change' }],
  salesCompany: [{ required: true, message: '请选择销售公司', trigger: 'change' }],
  warehouse: [{ required: true, message: '请选择仓库', trigger: 'change' }],
  tradeMethod: [{ required: true, message: '请选择成交方式', trigger: 'change' }],
  loadingPort: [{ required: true, message: '请选择起运港口', trigger: 'change' }],
  destinationPort: [{ required: true, message: '请选择目的港口', trigger: 'change' }],
}

const dialogTitle = computed(() => {
  const titles: Record<string, string> = {
    add: '新增外贸出货单',
    edit: '编辑外贸出货单',
    view: '查看外贸出货单',
  }
  return titles[props.mode] || '外贸出货单'
})

const totalAmount = computed(() => {
  return formData.value.items.reduce((sum, item) => sum + (item.saleAmount || 0), 0)
})

const calcAmount = (row: ExportItem) => {
  row.saleAmount = (row.quantity || 0) * (row.salePrice || 0)
}

const addItem = () => {
  formData.value.items.push({
    id: `item_${Date.now()}`,
    sourceArea: '',
    supplier: '',
    hsCode: '',
    productName: '',
    spec: '',
    unit: '',
    quantity: 1,
    salePrice: 0,
    saleAmount: 0,
  })
}

const removeItem = (index: number) => {
  formData.value.items.splice(index, 1)
}

const handleRelatedOrderChange = (val: string) => {
  if (val) {
    // 根据关联订单自动填充订单编号
    formData.value.orderNo = val
  }
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.mode !== 'add' && props.record) {
        const r = props.record
        formData.value = {
          exportNo: r.exportNo,
          relatedOrder: r.relatedOrder || '',
          salesCompany: r.salesCompany,
          orderNo: r.orderNo || '',
          customerName: r.customerName || '',
          creator: r.creator,
          createDate: r.createDate,
          warehouse: r.warehouse,
          salesperson: r.salesperson || '',
          exportDate: r.exportDate || '',
          tradeMethod: r.tradeMethod,
          loadingPort: r.loadingPort,
          destinationPort: r.destinationPort,
          declarationContractNo: r.declarationContractNo || '',
          billOfLadingNo: r.billOfLadingNo || '',
          vesselVoyage: r.vesselVoyage || '',
          taxExemptionNature: r.taxExemptionNature || '',
          packagingType: r.packagingType || '',
          declarationQty: r.declarationQty || 0,
          grossWeight: r.grossWeight || 0,
          netWeight: r.netWeight || 0,
          auditDate: r.auditDate || '',
          auditor: r.auditor || '',
          settlementCurrency: r.settlementCurrency,
          transportMethod: r.transportMethod,
          remark: r.remark || '',
          items: JSON.parse(JSON.stringify(r.items || [])),
        }
      } else {
        formData.value = {
          ...defaultFormData(),
          exportNo: `EX-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
        }
      }
    }
  }
)

const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
}

const buildPayload = () => ({
  ...formData.value,
  items: formData.value.items.map((item) => ({
    ...item,
    saleAmount: (item.quantity || 0) * (item.salePrice || 0),
  })),
  amount: totalAmount.value,
  operator: formData.value.creator,
  operateDate: formData.value.createDate,
})

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const payload = {
        ...buildPayload(),
        status: 'draft' as const,
      }
      if (props.mode === 'add') {
        await addPurchaseExport(payload)
      } else if (props.record) {
        await updatePurchaseExport(props.record.id, payload)
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
        ...buildPayload(),
        status: 'confirmed' as const,
      }
      if (props.mode === 'add') {
        await addPurchaseExport(payload)
      } else if (props.record) {
        await updatePurchaseExport(props.record.id, payload)
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

const handleInvoice = () => {
  ElMessage.info('发票开具功能开发中...')
}
</script>

<style scoped lang="scss">
.export-dialog {
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
  margin-bottom: 12px;
}

:deep(.el-input-number) {
  width: 100%;
}
</style>