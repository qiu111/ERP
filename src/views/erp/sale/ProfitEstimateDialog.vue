<template>
  <el-dialog
    v-model="visible"
    title="利润估算"
    width="1200px"
    :close-on-click-modal="false"
    top="5vh"
  >
    <div class="profit-estimate">
      <el-table
        :data="profitItems"
        border
        style="width: 100%"
        :empty-text="'暂无商品数据'"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="业务类型" prop="businessType" width="110">
          <template #default="{ row }">
            <el-select v-model="row.businessType" size="small" style="width: 100%">
              <el-option label="出口退税" value="出口退税" />
              <el-option label="出口免税" value="出口免税" />
              <el-option label="内销A类" value="内销A类" />
              <el-option label="内销B类" value="内销B类" />
              <el-option label="内销C类" value="内销C类" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="商品名称" prop="productName" width="120">
          <template #default="{ row }">
            <el-input v-model="row.productName" size="small" placeholder="请输入" />
          </template>
        </el-table-column>
        <el-table-column label="商品昵称" prop="productNickname" width="130">
          <template #default="{ row }">
            <el-input v-model="row.productNickname" size="small" placeholder="请输入" />
          </template>
        </el-table-column>
        <el-table-column label="单位" prop="unit" width="70" align="center">
          <template #default="{ row }">
            <el-input v-model="row.unit" size="small" placeholder="请输入" />
          </template>
        </el-table-column>
        <el-table-column label="数量" prop="quantity" width="100" align="right">
          <template #default="{ row }">
            <el-input-number
              v-model="row.quantity"
              :min="0"
              size="small"
              controls-position="right"
              style="width: 100%"
              @change="calcRow(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="零售价格" prop="retailPrice" width="110" align="right">
          <template #default="{ row }">
            <el-input-number
              v-model="row.retailPrice"
              :min="0"
              :precision="2"
              size="small"
              controls-position="right"
              style="width: 100%"
              @change="calcRow(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="汇率" prop="exchangeRate" width="90" align="right">
          <template #default="{ row }">
            <el-input-number
              v-model="row.exchangeRate"
              :min="0"
              :precision="4"
              size="small"
              controls-position="right"
              style="width: 100%"
              @change="calcRow(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="退税率(13%请填0.13)" prop="refundRate" width="140" align="right">
          <template #default="{ row }">
            <el-input-number
              v-model="row.refundRate"
              :min="0"
              :max="1"
              :step="0.01"
              :precision="2"
              size="small"
              controls-position="right"
              style="width: 100%"
              @change="calcRow(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="采购单价" prop="purchasePrice" width="110" align="right">
          <template #default="{ row }">
            <el-input-number
              v-model="row.purchasePrice"
              :min="0"
              :precision="2"
              size="small"
              controls-position="right"
              style="width: 100%"
              @change="calcRow(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="利润" prop="profit" width="100" align="right">
          <template #default="{ row }">
            <span class="profit-cell">{{ row.profit?.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="换汇成本" prop="exchangeCost" width="110" align="right">
          <template #default="{ row }">
            <span>{{ row.exchangeCost?.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="销售金额" prop="saleAmount" width="120" align="right">
          <template #default="{ row }">
            <span class="sale-amount">{{ row.saleAmount?.toFixed(2) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="section-title">业务费用</div>
      <el-row :gutter="10" class="expense-row">
        <el-col :span="3">
          <div class="expense-label">内陆运输费</div>
          <el-input-number v-model="expenses.inland" :min="0" size="small" controls-position="right" style="width: 100%" />
        </el-col>
        <el-col :span="3">
          <div class="expense-label">海运费</div>
          <el-input-number v-model="expenses.ocean" :min="0" size="small" controls-position="right" style="width: 100%" />
        </el-col>
        <el-col :span="3">
          <div class="expense-label">港杂费</div>
          <el-input-number v-model="expenses.port" :min="0" size="small" controls-position="right" style="width: 100%" />
        </el-col>
        <el-col :span="3">
          <div class="expense-label">其他费用</div>
          <el-input-number v-model="expenses.other1" :min="0" size="small" controls-position="right" style="width: 100%" />
        </el-col>
        <el-col :span="3">
          <div class="expense-label">其他费用</div>
          <el-input-number v-model="expenses.other2" :min="0" size="small" controls-position="right" style="width: 100%" />
        </el-col>
        <el-col :span="3">
          <div class="expense-label">其他费用</div>
          <el-input-number v-model="expenses.other3" :min="0" size="small" controls-position="right" style="width: 100%" />
        </el-col>
        <el-col :span="3">
          <div class="expense-label">费用合计</div>
          <span class="expense-total">{{ expenseTotal.toFixed(2) }}</span>
        </el-col>
      </el-row>

      <div class="section-title">汇总统计</div>
      <el-table :data="summaryData" border style="width: 100%" :show-header="true">
        <el-table-column label="销售总金额" prop="totalSale" align="center">
          <template #default>
            <span class="summary-value">{{ totalSaleAmount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="采购金额" prop="totalPurchase" align="center">
          <template #default>
            <span class="summary-value">{{ totalPurchaseAmount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="费用金额" prop="totalExpense" align="center">
          <template #default>
            <span class="summary-value">{{ expenseTotal.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="利润金额" prop="totalProfit" align="center">
          <template #default>
            <span class="summary-value profit">{{ totalProfit.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="利润率" prop="profitRate" align="center">
          <template #default>
            <span class="summary-value profit">{{ profitRate.toFixed(2) }}%</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" align="center">
          <template #default>
            <span class="summary-value">{{ calcRemark }}</span>
          </template>
        </el-table-column>
        <el-table-column label="金额" prop="remarkAmount" align="center">
          <template #default>
            <span class="summary-value">{{ remarkAmount.toFixed(2) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="calc-btn-wrapper">
        <el-button type="primary" @click="handleCalculate">计算</el-button>
      </div>

      <div class="remark-section">
        <div class="remark-title">备注：</div>
        <div class="remark-content">
          <div>1、内销A类：有票进有票出类型</div>
          <div>2、内销B类：无票进有票出类型</div>
          <div>3、内销C类：无票进无票出类型</div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">

export interface ProfitItem {
  id: string
  businessType: string
  productName: string
  productNickname: string
  unit: string
  quantity: number
  retailPrice: number
  exchangeRate: number
  refundRate: number
  purchasePrice: number
  profit: number
  exchangeCost: number
  saleAmount: number
}

export interface ProfitExpenses {
  inland: number
  ocean: number
  port: number
  other1: number
  other2: number
  other3: number
}

interface Props {
  modelValue: boolean
  items?: { productName: string; unit: string; quantity: number; unitPrice: number; spec: string }[]
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const profitItems = ref<ProfitItem[]>([])

const expenses = ref<ProfitExpenses>({
  inland: 0,
  ocean: 0,
  port: 0,
  other1: 0,
  other2: 0,
  other3: 0,
})

const summaryData = ref([{}])

const expenseTotal = computed(() => {
  const e = expenses.value
  return e.inland + e.ocean + e.port + e.other1 + e.other2 + e.other3
})

const totalSaleAmount = computed(() => {
  return profitItems.value.reduce((sum, item) => sum + (item.saleAmount || 0), 0)
})

const totalPurchaseAmount = computed(() => {
  return profitItems.value.reduce((sum, item) => {
    const qty = item.quantity || 0
    const price = item.purchasePrice || 0
    return sum + qty * price
  }, 0)
})

const totalProfit = computed(() => {
  return profitItems.value.reduce((sum, item) => sum + (item.profit || 0), 0)
})

const profitRate = computed(() => {
  if (totalSaleAmount.value === 0) return 0
  return (totalProfit.value / totalSaleAmount.value) * 100
})

const remarkAmount = computed(() => {
  return totalSaleAmount.value - totalPurchaseAmount.value - expenseTotal.value
})

const calcRemark = computed(() => {
  if (remarkAmount.value > 0) return '盈利'
  if (remarkAmount.value < 0) return '亏损'
  return '持平'
})

const calcRow = (row: ProfitItem) => {
  const qty = row.quantity || 0
  const retail = row.retailPrice || 0
  const rate = row.exchangeRate || 1
  const refund = row.refundRate || 0
  const purchase = row.purchasePrice || 0

  // 销售金额 = 零售价格 * 数量
  row.saleAmount = qty * retail
  // 利润 = 销售金额 - 采购金额
  const saleRmb = retail * rate * qty * (1 + refund)
  row.profit = saleRmb - purchase * qty
  // 换汇成本 = 采购单价 / 汇率
  row.exchangeCost = rate > 0 ? purchase / rate : 0
}

const handleCalculate = () => {
  profitItems.value.forEach((row) => calcRow(row))
  summaryData.value = [{}]
  ElMessage.success('计算完成')
}

const handleConfirm = () => {
  visible.value = false
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      // 从父组件传入的商品数据初始化
      if (props.items && props.items.length > 0) {
        profitItems.value = props.items.map((item, idx) => ({
          id: `profit_${idx}`,
          businessType: '出口退税',
          productName: item.productName || '',
          productNickname: item.productName || '',
          unit: item.unit || '',
          quantity: item.quantity || 0,
          retailPrice: item.unitPrice || 0,
          exchangeRate: 1,
          refundRate: 0.13,
          purchasePrice: Math.round((item.unitPrice || 0) * 0.7 * 100) / 100,
          profit: 0,
          exchangeCost: 0,
          saleAmount: item.amount || 0,
        }))
      } else {
        profitItems.value = [
          {
            id: 'profit_1',
            businessType: '出口退税',
            productName: '',
            productNickname: '',
            unit: '',
            quantity: 0,
            retailPrice: 0,
            exchangeRate: 1,
            refundRate: 0.13,
            purchasePrice: 0,
            profit: 0,
            exchangeCost: 0,
            saleAmount: 0,
          },
        ]
      }
      summaryData.value = [{}]
    }
  }
)
</script>

<style scoped lang="scss">
.profit-estimate {
  padding: 0;

  .section-title {
    font-weight: 600;
    margin: 16px 0 10px;
    color: #303133;
    font-size: 14px;
  }

  .expense-row {
    margin-bottom: 0;
  }

  .expense-label {
    text-align: center;
    font-size: 13px;
    color: #606266;
    margin-bottom: 6px;
  }

  .expense-total {
    display: block;
    text-align: center;
    font-weight: 600;
    color: #f56c6c;
    font-size: 15px;
  }

  .profit-cell {
    font-weight: 600;
    color: #67c23a;
  }

  .sale-amount {
    font-weight: 500;
  }

  .summary-value {
    font-weight: 500;
  }

  .summary-value.profit {
    color: #f56c6c;
    font-weight: 600;
  }

  .calc-btn-wrapper {
    margin-top: 16px;
    text-align: center;
  }

  .remark-section {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px dashed #e4e7ed;

    .remark-title {
      font-weight: 600;
      margin-bottom: 8px;
      color: #303133;
    }

    .remark-content {
      font-size: 13px;
      color: #606266;
      line-height: 1.8;
    }
  }

  :deep(.el-input-number) {
    width: 100%;
  }

  :deep(.el-select) {
    width: 100%;
  }
}
</style>