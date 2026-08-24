<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="1200px"
    :close-on-click-modal="false"
    top="5vh"
    @close="handleClose"
  >
    <div class="check-dialog">
      <div class="check-dialog__toolbar">
        <el-button
          v-if="mode !== 'view'"
          type="success"
          @click="handleSaveDraft"
        >
          <el-icon><Document /></el-icon>
          保存
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
            <el-form-item label="单号" prop="checkNo">
              <el-input
                v-model="formData.checkNo"
                placeholder="请输入单号"
                :disabled="mode === 'edit'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="盘点仓库" prop="warehouseName">
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
          <el-col :span="6">
            <el-form-item label="盘点人" prop="checker">
              <el-select
                v-model="formData.checker"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in checkerOptions"
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
        </el-row>

        <el-row :gutter="20">
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
                placeholder="请输入调整原因说明"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div class="check-dialog__items">
        <el-table
          :data="formData.items"
          border
          style="width: 100%"
          :empty-text="'正在努力地加载数据中，请稍候……'"
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
          <el-table-column label="系统库存" prop="systemQty" width="100" align="right">
            <template #default="{ row }">
              <el-input-number
                v-if="mode !== 'view'"
                v-model="row.systemQty"
                :min="0"
                size="small"
                controls-position="right"
                style="width: 100%"
              />
              <span v-else>{{ row.systemQty }}</span>
            </template>
          </el-table-column>
          <el-table-column label="实际盘点量" prop="actualQty" width="110" align="right">
            <template #default="{ row }">
              <el-input-number
                v-if="mode !== 'view'"
                v-model="row.actualQty"
                :min="0"
                size="small"
                controls-position="right"
                style="width: 100%"
              />
              <span v-else>{{ row.actualQty }}</span>
            </template>
          </el-table-column>
          <el-table-column label="差异原因" prop="diffReason" min-width="150">
            <template #default="{ row }">
              <el-input
                v-if="mode !== 'view'"
                v-model="row.diffReason"
                placeholder="请输入差异原因"
                size="small"
              />
              <span v-else>{{ row.diffReason || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="系统库存出厂价" width="130" align="right">
            <template #default="{ row }">
              <el-input-number
                v-if="mode !== 'view'"
                v-model="row.factoryPrice"
                :min="0"
                :precision="2"
                size="small"
                controls-position="right"
                style="width: 100%"
              />
              <span v-else>{{ row.factoryPrice?.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="系统库存金额" width="120" align="right">
            <template #default="{ row }">
              <span class="amount-cell">
                ¥{{ getSystemAmount(row).toFixed(2) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="实际盘点金额" width="120" align="right">
            <template #default="{ row }">
              <span class="amount-cell">
                ¥{{ getActualAmount(row).toFixed(2) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="盈亏金额" width="120" align="right">
            <template #default="{ row }">
              <span
                class="amount-cell"
                :class="{
                  'profit': getProfitAmount(row) > 0,
                  'loss': getProfitAmount(row) < 0,
                }"
              >
                ¥{{ getProfitAmount(row).toFixed(2) }}
              </span>
            </template>
          </el-table-column>
        </el-table>

        <div class="items-footer">
          <div class="summary-item">
            <span class="summary-label">系统库存金额合计：</span>
            <span class="summary-value">¥{{ totalSystemAmount.toFixed(2) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">实际盘点金额合计：</span>
            <span class="summary-value">¥{{ totalActualAmount.toFixed(2) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">盈亏金额合计：</span>
            <span
              class="summary-value"
              :class="{
                'profit': totalProfitAmount > 0,
                'loss': totalProfitAmount < 0,
              }"
            >
              {{ totalProfitAmount >= 0 ? '+' : '' }}¥{{ totalProfitAmount.toFixed(2) }}
            </span>
          </div>
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
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import {
  addStockCheck,
  updateStockCheck,
  warehouseOptions,
  checkerOptions,
  type CheckItem,
  type StockCheck,
} from '@/mock/stockCheck'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: StockCheck | null
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
  checkNo: string
  warehouseName: string
  warehouseCode: string
  checker: string
  creator: string
  createDate: string
  adjustReason: string
  items: CheckItem[]
}

const defaultFormData = (): FormData => ({
  checkNo: '',
  warehouseName: '',
  warehouseCode: '',
  checker: '',
  creator: '系统管理员',
  createDate: new Date().toISOString().slice(0, 10),
  adjustReason: '',
  items: [],
})

const formData = ref<FormData>(defaultFormData())

const formRules: FormRules<FormData> = {
  checkNo: [{ required: true, message: '请输入单号', trigger: 'blur' }],
  warehouseName: [{ required: true, message: '请选择盘点仓库', trigger: 'change' }],
  checker: [{ required: true, message: '请选择盘点人', trigger: 'change' }],
  creator: [{ required: true, message: '请输入制单人员', trigger: 'blur' }],
  createDate: [{ required: true, message: '请选择制单日期', trigger: 'change' }],
}

const dialogTitle = computed(() => {
  const titles: Record<string, string> = {
    add: '新增库存盘点单',
    edit: '编辑库存盘点单',
    view: '查看库存盘点单',
  }
  return titles[props.mode] || '库存盘点单'
})

const getSystemAmount = (row: CheckItem) => {
  return (row.systemQty || 0) * (row.factoryPrice || 0)
}

const getActualAmount = (row: CheckItem) => {
  return (row.actualQty || 0) * (row.factoryPrice || 0)
}

const getProfitAmount = (row: CheckItem) => {
  return getActualAmount(row) - getSystemAmount(row)
}

const totalSystemAmount = computed(() => {
  return formData.value.items.reduce((sum, item) => sum + getSystemAmount(item), 0)
})

const totalActualAmount = computed(() => {
  return formData.value.items.reduce((sum, item) => sum + getActualAmount(item), 0)
})

const totalProfitAmount = computed(() => {
  return formData.value.items.reduce((sum, item) => sum + getProfitAmount(item), 0)
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.mode !== 'add' && props.record) {
        const r = props.record
        formData.value = {
          checkNo: r.checkNo,
          warehouseName: r.warehouseName,
          warehouseCode: r.warehouseCode,
          checker: r.checker,
          creator: r.creator,
          createDate: r.createDate,
          adjustReason: r.adjustReason || '',
          items: JSON.parse(JSON.stringify(r.items || [])),
        }
      } else {
        formData.value = {
          ...defaultFormData(),
          checkNo: `SCK-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
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
    systemQty: 0,
    actualQty: 0,
    diffReason: '',
    factoryPrice: 0,
  })
}

const removeItem = (index: number) => {
  formData.value.items.splice(index, 1)
}

const handleWarehouseChange = () => {
  const opt = warehouseOptions.find((o) => o.value === formData.value.warehouseName)
  formData.value.warehouseCode = opt?.code || ''
}

const handleSaveDraft = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const payload = {
        ...formData.value,
        operator: formData.value.checker,
        operateDate: formData.value.createDate,
        auditor: '',
        auditDate: '',
        auditStatus: 'pending' as const,
      }
      if (props.mode === 'add') {
        await addStockCheck(payload)
      } else if (props.record) {
        await updateStockCheck(props.record.id, payload)
      }
      ElMessage.success('已保存')
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
    if (formData.value.items.length === 0) {
      ElMessage.warning('请至少添加一条盘点明细')
      return
    }
    submitting.value = true
    try {
      const payload = {
        ...formData.value,
        operator: formData.value.checker,
        operateDate: formData.value.createDate,
        auditor: '',
        auditDate: '',
        auditStatus: 'pending' as const,
      }
      if (props.mode === 'add') {
        await addStockCheck(payload)
      } else if (props.record) {
        await updateStockCheck(props.record.id, payload)
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
.check-dialog {
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
      gap: 32px;
      padding: 14px 20px;
      background: #f5f7fa;
      border: 1px solid #ebeef5;
      border-top: none;
      border-radius: 0 0 4px 4px;
      flex-wrap: wrap;
    }
  }
}

.summary-item {
  display: flex;
  align-items: center;
}

.summary-label {
  font-weight: 500;
  color: #606266;
  margin-right: 6px;
}

.summary-value {
  font-weight: 600;
  color: #303133;

  &.profit {
    color: #67c23a;
  }

  &.loss {
    color: #f56c6c;
  }
}

.amount-cell {
  font-weight: 500;
  color: #303133;

  &.profit {
    color: #67c23a;
  }

  &.loss {
    color: #f56c6c;
  }
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-input-number) {
  width: 100%;
}
</style>
