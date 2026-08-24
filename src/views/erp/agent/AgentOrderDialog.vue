<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="1200px"
    :close-on-click-modal="false"
    top="3vh"
    @close="handleClose"
  >
    <div class="agent-order-dialog">
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
            <el-form-item label="要货单号" prop="orderNo">
              <el-input
                v-model="formData.orderNo"
                placeholder="请输入要货单号"
                :disabled="mode === 'edit'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="代理商" prop="agent">
              <el-select
                v-model="formData.agent"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in agentOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="运营中心" prop="operationCenter">
              <el-select
                v-model="formData.operationCenter"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in operationCenterOptions"
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
            <el-form-item label="操作员" prop="operator">
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
          <el-col :span="6">
            <el-form-item label="操作日期" prop="operateDate">
              <el-date-picker
                v-model="formData.operateDate"
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

      <div class="items-section">
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
          <el-table-column label="条形码" prop="barcode" width="110" align="center">
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
          <el-table-column label="商品编码" prop="productCode" width="110" align="center">
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
          <el-table-column label="单价" prop="unitPrice" width="110" align="right">
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
          <el-table-column label="金额" prop="amount" width="120" align="right">
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
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  addAgentOrder,
  updateAgentOrder,
  agentOptions,
  operationCenterOptions,
  warehouseOptions,
  operatorOptions,
  type AgentOrderItem,
  type AgentOrder,
} from '@/mock/agentOrder'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: AgentOrder | null
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
  orderNo: string
  agent: string
  operationCenter: string
  creator: string
  createDate: string
  operator: string
  operateDate: string
  warehouse: string
  remark: string
  items: AgentOrderItem[]
}

const defaultFormData = (): FormData => ({
  orderNo: '',
  agent: '',
  operationCenter: '',
  creator: '张主管',
  createDate: new Date().toISOString().slice(0, 10),
  operator: '张主管',
  operateDate: new Date().toISOString().slice(0, 10),
  warehouse: '',
  remark: '',
  items: [],
})

const formData = ref<FormData>(defaultFormData())

const formRules: FormRules<FormData> = {
  orderNo: [{ required: true, message: '请输入要货单号', trigger: 'blur' }],
  agent: [{ required: true, message: '请选择代理商', trigger: 'change' }],
  operationCenter: [{ required: true, message: '请选择运营中心', trigger: 'change' }],
  creator: [{ required: true, message: '请输入制单人员', trigger: 'blur' }],
  createDate: [{ required: true, message: '请选择制单日期', trigger: 'change' }],
  operator: [{ required: true, message: '请选择操作员', trigger: 'change' }],
  operateDate: [{ required: true, message: '请选择操作日期', trigger: 'change' }],
  warehouse: [{ required: true, message: '请选择仓库', trigger: 'change' }],
}

const dialogTitle = computed(() => {
  const titles: Record<string, string> = {
    add: '新增代理商要货单',
    edit: '编辑代理商要货单',
    view: '查看代理商要货单',
  }
  return titles[props.mode] || '代理商要货单'
})

const totalAmount = computed(() => {
  return formData.value.items.reduce((sum, item) => sum + (item.amount || 0), 0)
})

const calcAmount = (row: AgentOrderItem) => {
  row.amount = (row.quantity || 0) * (row.unitPrice || 0)
}

const addItem = () => {
  formData.value.items.push({
    id: `item_${Date.now()}`,
    barcode: '',
    productName: '',
    productCode: '',
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

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.mode !== 'add' && props.record) {
        const r = props.record
        formData.value = {
          orderNo: r.orderNo,
          agent: r.agent,
          operationCenter: r.operationCenter,
          creator: r.creator,
          createDate: r.createDate,
          operator: r.operator,
          operateDate: r.operateDate,
          warehouse: r.warehouse,
          remark: r.remark || '',
          items: JSON.parse(JSON.stringify(r.items || [])),
        }
      } else {
        formData.value = {
          ...defaultFormData(),
          orderNo: `AO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
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
        amount: totalAmount.value,
        status: 'draft' as const,
      }
      if (props.mode === 'add') {
        await addAgentOrder(payload)
      } else if (props.record) {
        await updateAgentOrder(props.record.id, payload)
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
        amount: totalAmount.value,
        status: 'confirmed' as const,
      }
      if (props.mode === 'add') {
        await addAgentOrder(payload)
      } else if (props.record) {
        await updateAgentOrder(props.record.id, payload)
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
.agent-order-dialog {
  .items-section {
    margin-top: 16px;

    .items-header {
      font-weight: 600;
      margin-bottom: 10px;
      color: #303133;
    }

    .items-toolbar {
      margin-top: 10px;
    }

    .items-footer {
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
