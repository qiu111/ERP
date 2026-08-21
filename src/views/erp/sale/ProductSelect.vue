<template>
  <el-dialog
    v-model="visible"
    title="商品选择"
    width="900px"
    :close-on-click-modal="false"
    append-to-body
    @close="handleClose"
  >
    <div class="product-select">
      <div class="product-select__left">
        <el-tree
          :data="treeData"
          :props="{ label: 'label', children: 'children' }"
          node-key="id"
          :default-expand-all="true"
          highlight-current
          @node-click="handleNodeClick"
        />
      </div>
      <div class="product-select__right">
        <div class="right-header">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索商品名称或条码"
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
          :data="filteredProducts"
          border
          height="360"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column label="条码" prop="barcode" width="100" align="center" />
          <el-table-column label="商品名称" prop="name" min-width="140" />
          <el-table-column label="商品编码" prop="productCode" width="100" align="center" />
          <el-table-column label="采购价" prop="purchasePrice" width="100" align="right">
            <template #default="{ row }">
              ¥{{ row.purchasePrice.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="零售价" prop="retailPrice" width="100" align="right">
            <template #default="{ row }">
              ¥{{ row.retailPrice.toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>

        <div class="right-footer">
          <span class="selected-info">
            已选择 <strong>{{ selectedProducts.length }}</strong> 个商品
          </span>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { productCategories, mockProducts } from '@/mock/purchaseOrder'

interface ProductItem {
  id: string
  barcode: string
  name: string
  productCode: string
  purchasePrice: number
  retailPrice: number
  marketPrice: number
  factoryPrice: number
  costPrice: number
  category: string
}

// 扩展 mockProducts 添加 productCode 和 retailPrice
const extendedProducts: ProductItem[] = mockProducts.map((p, idx) => ({
  ...p,
  productCode: `P${String(idx + 1).padStart(3, '0')}`,
  purchasePrice: p.factoryPrice,
  retailPrice: p.marketPrice,
}))

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', products: ProductItem[]): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const treeData = ref(productCategories)
const searchKeyword = ref('')
const selectedCategory = ref<string>('')
const selectedProducts = ref<ProductItem[]>([])

const filteredProducts = computed(() => {
  let result = [...extendedProducts]
  if (selectedCategory.value) {
    result = result.filter((p) => p.category === selectedCategory.value)
  }
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(kw) ||
        p.barcode.toLowerCase().includes(kw)
    )
  }
  return result
})

const handleNodeClick = (node: any) => {
  selectedCategory.value = node.id
}

const handleSearch = () => {
  // filteredProducts is reactive, no extra action needed
}

const handleSelectionChange = (rows: ProductItem[]) => {
  selectedProducts.value = rows
}

const handleClose = () => {
  visible.value = false
  searchKeyword.value = ''
  selectedCategory.value = ''
  selectedProducts.value = []
}

const handleConfirm = () => {
  emit('confirm', selectedProducts.value)
  handleClose()
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      searchKeyword.value = ''
      selectedCategory.value = ''
      selectedProducts.value = []
    }
  }
)
</script>

<style scoped lang="scss">
.product-select {
  display: flex;
  gap: 16px;
  min-height: 420px;

  &__left {
    width: 200px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 8px;
    overflow-y: auto;
    min-height: 360px;
  }

  &__right {
    flex: 1;
    display: flex;
    flex-direction: column;

    .right-header {
      display: flex;
      gap: 10px;
      margin-bottom: 12px;
    }

    .right-footer {
      margin-top: 10px;
      display: flex;
      justify-content: flex-end;

      .selected-info {
        color: #606266;
        font-size: 13px;

        strong {
          color: #409eff;
        }
      }
    }
  }
}
</style>
