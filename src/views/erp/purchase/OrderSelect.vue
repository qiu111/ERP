<template>
  <el-dialog
    v-model="visible"
    title="选择采购订单"
    width="800px"
    :close-on-click-modal="false"
    append-to-body
    @close="handleClose"
  >
    <div class="order-select">
      <div class="order-select__search">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索订单号或供应商"
          clearable
          style="width: 240px"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>

      <el-table
        :data="filteredOrders"
        border
        height="360"
        highlight-current-row
        @row-click="handleRowClick"
      >
        <el-table-column label="订单号" prop="orderNo" width="160" align="center" />
        <el-table-column label="供应商" prop="company" min-width="140" />
        <el-table-column label="仓库" prop="warehouse" width="120" />
        <el-table-column label="采购员" prop="buyer" width="100" />
        <el-table-column label="采购金额" prop="totalAmount" width="120" align="right">
          <template #default="{ row }">
            ¥{{ row.totalAmount?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="status" width="100" align="center">
          <template #default="{ row }">
            <span>{{ orderStatusMap[row.status]?.text || row.status }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :disabled="!selectedOrder" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">

import { Search } from '@element-plus/icons-vue'
import { getPurchaseOrderPage, orderStatusMap } from '@/mock/purchaseOrder'
import type { PurchaseOrder } from '@/mock/purchaseOrder'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'select', order: { orderNo: string; supplier: string; warehouse: string; buyer: string; items: Array<{ productName: string; spec: string; unit: string; quantity: number; unitPrice: number; amount: number }> }): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const searchKeyword = ref('')
const orderList = ref<PurchaseOrder[]>([])
const selectedOrder = ref<PurchaseOrder | null>(null)

const filteredOrders = computed(() => {
  if (!searchKeyword.value) return orderList.value
  const kw = searchKeyword.value.toLowerCase()
  return orderList.value.filter(
    (o) =>
      o.orderNo.toLowerCase().includes(kw) ||
      o.company.toLowerCase().includes(kw) ||
      o.warehouse.toLowerCase().includes(kw) ||
      o.buyer.toLowerCase().includes(kw)
  )
})

const loadOrders = async () => {
  const res = await getPurchaseOrderPage({ page: 1, pageSize: 100 })
  orderList.value = res.data.list.filter(
    (o) => o.status === 'draft' || o.status === 'confirmed'
  )
}

const handleSearch = () => {
  // filteredOrders is reactive, no extra action needed
}

const handleRowClick = (row: PurchaseOrder) => {
  selectedOrder.value = row
}

const handleClose = () => {
  visible.value = false
  searchKeyword.value = ''
  selectedOrder.value = null
}

const handleConfirm = () => {
  if (!selectedOrder.value) return
  const order = selectedOrder.value
  emit('select', {
    orderNo: order.orderNo,
    supplier: order.company,
    warehouse: order.warehouse,
    buyer: order.buyer,
    items: order.items.map((item) => ({
      productName: item.productName,
      spec: item.spec,
      unit: item.unit,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.amount,
    })),
  })
  handleClose()
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      loadOrders()
      searchKeyword.value = ''
      selectedOrder.value = null
    }
  }
)
</script>

<style scoped lang="scss">
.order-select {
  &__search {
    display: flex;
    gap: 10px;
    margin-bottom: 12px;
  }
}
</style>
