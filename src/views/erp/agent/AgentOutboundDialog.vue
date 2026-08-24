<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="1280px"
    :close-on-click-modal="false"
    top="3vh"
    @close="handleClose"
  >
    <div class="agent-outbound-dialog">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="90px"
        label-position="right"
        :disabled="mode === 'view'"
      >
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="单号:" prop="orderNo">
              <el-input
                v-model="formData.orderNo"
                placeholder="系统自动生成"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="订单号:" prop="relatedOrderNo">
              <el-select
                v-model="formData.relatedOrderNo"
                placeholder="请选择订单号"
                style="width: 100%"
                clearable
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
            <el-form-item label="运营中心:" prop="operationCenter">
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
            <el-form-item label="制单人员:" prop="creator">
              <el-input v-model="formData.creator" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="制单日期:" prop="createDate">
              <el-input v-model="formData.createDate" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="销售员:" prop="salesman">
              <el-select
                v-model="formData.salesman"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in salesmanOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="仓库:" prop="warehouse">
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
            <el-form-item label="物流厂家:" prop="logisticsCompany">
              <el-select
                v-model="formData.logisticsCompany"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in logisticsCompanyOptions"
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
            <el-form-item label="物流单号:" prop="trackingNo">
              <el-input
                v-model="formData.trackingNo"
                placeholder="请输入物流单号"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="运费:" prop="freight">
              <el-input-number
                v-model="formData.freight"
                :min="0"
                :precision="2"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="预付款:" prop="prepayment">
              <el-input-number
                v-model="formData.prepayment"
                :min="0"
                :precision="2"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注:" prop="remark">
              <el-input
                v-model="formData.remark"
                type="textarea"
                :rows="2"
                placeholder="请输入备注"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div class="items-section">
        <el-table
          :data="formData.items"
          border
          style="width: 100%"
          :empty-text="'暂无商品明细'"
        >
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column label="货号" prop="productCode" width="120" align="center">
            <template #default="{ row }">
              <el-input
                v-if="mode !== 'view'"
                v-model="row.productCode"
                placeholder="-"
                size="small"
              />
              <span v-else>{{ row.productCode || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="条形码" prop="barcode" width="110" align="center">
            <template #default="{ row }">
              <el-input
                v-if="mode !== 'view'"
                v-model="row.barcode"
                placeholder="-"
                size="small"
              />
              <span v-else>{{ row.barcode || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="商品名称" prop="productName" min-width="150">
            <template #default="{ row }">
              <el-input
                v-if="mode !== 'view'"
                v-model="row.productName"
                placeholder="-"
                size="small"
              />
              <span v-else>{{ row.productName || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="规格" prop="spec" width="130">
            <template #default="{ row }">
              <el-input
                v-if="mode !== 'view'"
                v-model="row.spec"
                placeholder="-"
                size="small"
              />
              <span v-else>{{ row.spec || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="单位" prop="unit" width="80" align="center">
            <template #default="{ row }">
              <el-input
                v-if="mode !== 'view'"
                v-model="row.unit"
                placeholder="-"
                size="small"
              />
              <span v-else>{{ row.unit || '-' }}</span>
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
                @change="calcCostAmount(row)"
              />
              <span v-else class="qty-view">{{ row.quantity }}</span>
            </template>
          </el-table-column>
          <el-table-column label="成本价" prop="costPrice" width="110" align="right">
            <template #default="{ row }">
              <el-input-number
                v-if="mode !== 'view'"
                v-model="row.costPrice"
                :min="0"
                :precision="2"
                size="small"
                controls-position="right"
                style="width: 100%"
                @change="calcCostAmount(row)"
              />
              <span v-else>{{ Number(row.costPrice || 0).toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="成本金额" prop="costAmount" width="120" align="right">
            <template #default="{ row }">
              <span class="amount-cell">{{ Number(row.costAmount || 0).toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            v-if="mode !== 'view'"
            label="操作"
            width="80"
            align="center"
            fixed="right"
          >
            <template #default="{ $index }">
              <el-button
                type="danger"
                link
                size="small"
                @click="removeItem($index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="items-toolbar" v-if="mode !== 'view'">
          <el-button type="primary" size="small" @click="addItem">
            <el-icon><Plus /></el-icon>
            添加商品
          </el-button>
        </div>

        <div class="items-footer">
          <span class="total-label">成本价金额合计：</span>
          <span class="total-amount">¥{{ totalCostAmount.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">
        {{ mode === 'view' ? '关闭' : '取消' }}
      </el-button>
      <el-button
        v-if="mode !== 'view'"
        type="danger"
        plain
        :loading="submitting"
        @click="handleSave"
      >
        保存
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  createAgentOutbound,
  updateAgentOutbound,
  operationCenterOptions,
  warehouseOptions,
  logisticsCompanyOptions,
  operatorOptions,
  salesmanOptions,
  relatedOrderOptions,
  type AgentOutboundItem,
  type AgentOutbound,
} from '@/mock/agentOutbound'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  record?: AgentOutbound | null
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
  relatedOrderNo: string
  operationCenter: string
  creator: string
  createDate: string
  salesman: string
  warehouse: string
  logisticsCompany: string
  trackingNo: string
  freight: number
  prepayment: number
  remark: string
  items: AgentOutboundItem[]
}

const todayStr = () => {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

const defaultFormData = (): FormData => ({
  orderNo: '',
  relatedOrderNo: '',
  operationCenter: '',
  creator: '超级管理员',
  createDate: todayStr(),
  salesman: '超级管理员',
  warehouse: '上海港口',
  logisticsCompany: '顺丰',
  trackingNo: '',
  freight: 0,
  prepayment: 0,
  remark: '',
  items: [
    {
      id: `item_${Date.now()}_0`,
      productCode: '-',
      barcode: '-',
      productName: '-',
      spec: '-',
      unit: '-',
      quantity: 0,
      costPrice: 0,
      costAmount: 0,
    },
  ],
})

const formData = ref<FormData>(defaultFormData())

const formRules: FormRules<FormData> = {
  operationCenter: [{ required: true, message: '请选择运营中心', trigger: 'change' }],
  salesman: [{ required: true, message: '请选择销售员', trigger: 'change' }],
  warehouse: [{ required: true, message: '请选择仓库', trigger: 'change' }],
  logisticsCompany: [{ required: true, message: '请选择物流厂家', trigger: 'change' }],
}

const dialogTitle = computed(() => {
  const titles: Record<string, string> = {
    add: '新增代理商出库单',
    edit: '编辑代理商出库单',
    view: '查看代理商出库单',
  }
  return titles[props.mode] || '代理商出库单'
})

const totalCostAmount = computed(() => {
  return formData.value.items.reduce((sum, it) => sum + (it.costAmount || 0), 0)
})

const calcCostAmount = (row: AgentOutboundItem) => {
  row.costAmount = (row.quantity || 0) * (row.costPrice || 0)
}

const addItem = () => {
  formData.value.items.push({
    id: `item_${Date.now()}_${formData.value.items.length}`,
    productCode: '-',
    barcode: '-',
    productName: '-',
    spec: '-',
    unit: '-',
    quantity: 0,
    costPrice: 0,
    costAmount: 0,
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
          relatedOrderNo: r.relatedOrderNo,
          operationCenter: r.operationCenter,
          creator: r.creator,
          createDate: r.createDate,
          salesman: r.salesman,
          warehouse: r.warehouse,
          logisticsCompany: r.logisticsCompany,
          trackingNo: r.trackingNo,
          freight: r.freight || 0,
          prepayment: r.prepayment || 0,
          remark: r.remark || '',
          items: JSON.parse(JSON.stringify(r.items || [])),
        }
      } else {
        formData.value = defaultFormData()
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
      const items = formData.value.items.map((it) => ({
        ...it,
        costAmount: (it.quantity || 0) * (it.costPrice || 0),
      }))
      const payload = {
        ...formData.value,
        items,
        costAmountTotal: totalCostAmount.value,
        status: 'draft' as const,
      }
      if (props.mode === 'add') {
        await createAgentOutbound(payload)
      } else if (props.record) {
        await updateAgentOutbound(props.record.id, payload)
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
.agent-outbound-dialog {
  .items-section {
    margin-top: 16px;

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
  font-size: 14px;
}

.total-amount {
  font-weight: 700;
  color: #f56c6c;
  font-size: 16px;
}

.amount-cell {
  font-weight: 500;
  color: #303133;
}

.qty-view {
  color: #f56c6c;
  font-weight: 600;
}
</style>
