<template>
  <div class="warning-setting-page">
    <el-row :gutter="20">
      <!-- 左侧仓库导航 -->
      <el-col :span="4">
        <div class="warehouse-nav">
          <div class="warehouse-nav__title">
            <el-icon><Grid /></el-icon>
            <span>全部仓库</span>
          </div>
          <el-menu
            :default-active="activeWarehouse"
            class="warehouse-nav__menu"
            @select="handleWarehouseSelect"
          >
            <el-menu-item
              v-for="item in warehouseNavItems"
              :key="item.value"
              :index="item.value"
            >
              <el-icon v-if="item.type === 'root'"><OfficeBuilding /></el-icon>
              <el-icon v-else-if="item.type === 'warehouse'"><Warehouse /></el-icon>
              <el-icon v-else-if="item.type === 'notify'"><Bell /></el-icon>
              <span>{{ item.label }}</span>
              <el-badge
                v-if="item.type === 'notify' && notifyCount > 0"
                :value="notifyCount"
                class="notify-badge"
              />
            </el-menu-item>
          </el-menu>
        </div>
      </el-col>

      <!-- 右侧预警设置内容 -->
      <el-col :span="20">
        <div class="setting-content">
          <div class="setting-content__header">
            <div class="header-title">
              <el-icon><Document /></el-icon>
              <span>库存预警设置</span>
            </div>
          </div>

          <div class="setting-content__search">
            <el-form :inline="true" :model="searchModel" class="search-form">
              <el-form-item label="货号:">
                <el-select
                  v-model="searchModel.goodsNo"
                  placeholder="请选择"
                  style="width: 220px"
                  clearable
                >
                  <el-option
                    v-for="opt in goodsNoOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="条码:">
                <el-input
                  v-model="searchModel.barcode"
                  placeholder="请输入条码"
                  style="width: 200px"
                  clearable
                />
              </el-form-item>
              <el-form-item label="品牌:">
                <el-select
                  v-model="searchModel.brand"
                  placeholder="请选择"
                  style="width: 180px"
                  clearable
                >
                  <el-option
                    v-for="opt in brandOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :icon="Search" @click="handleSearch">
                  查询
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <div class="setting-content__table">
            <el-table
              v-loading="loading"
              :data="tableData"
              border
              style="width: 100%"
              :row-key="'id'"
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" width="50" />
              <el-table-column label="货号" prop="goodsNo" width="100">
                <template #default="{ row }">
                  <span class="goods-no">{{ row.goodsNo }}</span>
                </template>
              </el-table-column>
              <el-table-column label="条码" prop="barcode" width="120" />
              <el-table-column label="商品名称" prop="productName" min-width="150" />
              <el-table-column label="规格" prop="spec" width="130" />
              <el-table-column label="品牌" prop="brand" width="90" />
              <el-table-column label="单位" prop="unit" width="70" align="center" />
              <el-table-column label="仓库" prop="warehouseName" width="110">
                <template #default="{ row }">
                  <el-tag size="small" effect="plain">{{ row.warehouseName }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="在库库存" prop="stockQty" width="100" align="right" />
              <el-table-column label="可售库存" prop="availableQty" width="100" align="right">
                <template #default="{ row }">
                  <span
                    :class="{
                      'qty-warn': row.availableQty < row.warningQty,
                    }"
                  >
                    {{ row.availableQty }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="预警库存" width="130" align="right">
                <template #default="{ row }">
                  <el-input-number
                    v-if="!viewMode"
                    v-model="row.warningQty"
                    :min="0"
                    size="small"
                    controls-position="right"
                    style="width: 100%"
                    @change="calcSuggest(row)"
                  />
                  <span v-else>{{ row.warningQty }}</span>
                </template>
              </el-table-column>
              <el-table-column label="建议采购量" width="130" align="right">
                <template #default="{ row }">
                  <span
                    :class="{
                      'suggest-highlight': row.suggestPurchaseQty > 0,
                    }"
                  >
                    {{ row.suggestPurchaseQty }}
                  </span>
                </template>
              </el-table-column>
            </el-table>

            <!-- 合计行 -->
            <div class="table-footer">
              <div class="footer-row">
                <span class="footer-label">合计：</span>
                <div class="footer-stats">
                  <span>共 {{ total }} 条记录</span>
                  <span>在库库存合计：<b>{{ totalStockQty }}</b></span>
                  <span>可售库存合计：<b>{{ totalAvailableQty }}</b></span>
                  <span>预警数量合计：<b>{{ totalWarningQty }}</b></span>
                  <span>建议采购合计：
                    <b :class="{ 'suggest-highlight': totalSuggestQty > 0 }">{{ totalSuggestQty }}</b>
                  </span>
                </div>
                <div class="footer-actions">
                  <el-button
                    v-if="selectedIds.length > 0"
                    type="primary"
                    size="small"
                    @click="handleBatchSave"
                  >
                    批量保存 ({{ selectedIds.length }})
                  </el-button>
                  <el-button
                    v-if="modifiedRows.length > 0"
                    type="success"
                    size="small"
                    @click="handleSaveAll"
                  >
                    保存全部修改 ({{ modifiedRows.length }})
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <el-pagination
              class="table-pagination"
              background
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="pageSize"
              :current-page="currentPage"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">

import {
  Grid,
  OfficeBuilding,
  Box,
  Bell,
  Document,
  Search,
} from '@element-plus/icons-vue'

// 模板中使用 <Warehouse /> ，但 @element-plus/icons-vue 中不存在名为 Warehouse 的图标
// 使用语义最接近的 Box（盒子/仓库货架）图标作为替代
const Warehouse = Box
import useListPage from '@/composables/useListPage'
import {
  getWarningSettingPage,
  batchUpdateWarningQty,
  warehouseNavItems,
  goodsNoOptions,
  brandOptions,
  type WarningSettingRecord,
} from '@/mock/stockWarning'

const {
  currentPage,
  pageSize,
  total,
  loading,
  handleSizeChange,
  setLoadFn,
} = useListPage()
const viewMode = ref(false)
const tableData = ref<WarningSettingRecord[]>([])

const activeWarehouse = ref('__all__')
const notifyCount = ref(0)
const selectedIds = ref<string[]>([])
const modifiedRows = ref<WarningSettingRecord[]>([])
const originalSnapshot = new Map<string, { warningQty: number; suggestPurchaseQty: number }>()

let searchModel = reactive<Record<string, any>>({
  goodsNo: '',
  barcode: '',
  brand: '',
})

const totalStockQty = computed(() => {
  return tableData.value.reduce((sum, r) => sum + r.stockQty, 0)
})

const totalAvailableQty = computed(() => {
  return tableData.value.reduce((sum, r) => sum + r.availableQty, 0)
})

const totalWarningQty = computed(() => {
  return tableData.value.reduce((sum, r) => sum + (r.warningQty || 0), 0)
})

const totalSuggestQty = computed(() => {
  return tableData.value.reduce((sum, r) => sum + (r.suggestPurchaseQty || 0), 0)
})

const saveSnapshot = (rows: WarningSettingRecord[]) => {
  originalSnapshot.clear()
  for (const r of rows) {
    originalSnapshot.set(r.id, {
      warningQty: r.warningQty,
      suggestPurchaseQty: r.suggestPurchaseQty,
    })
  }
}

const calcSuggest = (row: WarningSettingRecord) => {
  if (row.availableQty < row.warningQty) {
    row.suggestPurchaseQty = row.warningQty * 2 - row.availableQty
  } else {
    row.suggestPurchaseQty = 0
  }
  updateModifiedStatus(row)
}

const updateModifiedStatus = (row: WarningSettingRecord) => {
  const snap = originalSnapshot.get(row.id)
  if (!snap) return
  const changed =
    snap.warningQty !== row.warningQty ||
    snap.suggestPurchaseQty !== row.suggestPurchaseQty
  if (changed) {
    if (!modifiedRows.value.find((r) => r.id === row.id)) {
      modifiedRows.value.push(row)
    }
  } else {
    modifiedRows.value = modifiedRows.value.filter((r) => r.id !== row.id)
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getWarningSettingPage({
      page: currentPage.value,
      pageSize: pageSize.value,
      warehouse: activeWarehouse.value,
      goodsNo: searchModel.goodsNo || undefined,
      barcode: searchModel.barcode || undefined,
      brand: searchModel.brand || undefined,
    })
    tableData.value = res.data.list
    total.value = res.data.total
    saveSnapshot(res.data.list)
    modifiedRows.value = []
  } catch (err) {
    console.error('加载库存预警设置失败:', err)
  } finally {
    loading.value = false
  }
}
setLoadFn(loadData)

const loadNotifyCount = async () => {
  try {
    const res = await getWarningSettingPage({
      page: 1,
      pageSize: 99999,
      warehouse: '__notify__',
    })
    notifyCount.value = res.data.total
  } catch {
    notifyCount.value = 0
  }
}

const handleWarehouseSelect = (key: string) => {
  activeWarehouse.value = key
  currentPage.value = 1
  modifiedRows.value = []
  loadData()
}

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadData()
}

const handleSelectionChange = (rows: WarningSettingRecord[]) => {
  selectedIds.value = rows.map((r) => r.id)
}

const handleBatchSave = async () => {
  const toUpdate = tableData.value.filter((r) => selectedIds.value.includes(r.id))
  const payload = toUpdate.map((r) => ({
    id: r.id,
    warningQty: r.warningQty,
    suggestPurchaseQty: r.suggestPurchaseQty,
  }))
  if (payload.length === 0) return
  const res = await batchUpdateWarningQty(payload)
  ElMessage.success(res.message)
  loadData()
}

const handleSaveAll = async () => {
  if (modifiedRows.value.length === 0) return
  const payload = modifiedRows.value.map((r) => ({
    id: r.id,
    warningQty: r.warningQty,
    suggestPurchaseQty: r.suggestPurchaseQty,
  }))
  const res = await batchUpdateWarningQty(payload)
  ElMessage.success(res.message)
  loadData()
}

watch(activeWarehouse, () => {
  // 通知列表或特定页面切换
  if (activeWarehouse.value === '__notify__') {
    // 通知列表可作为只读视图
  }
})

onMounted(() => {
  loadData()
  loadNotifyCount()
})
</script>

<style scoped lang="scss">
.warning-setting-page {
  padding: 20px;
  min-height: calc(100vh - 100px);
}

.warehouse-nav {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;

  &__title {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 18px;
    font-weight: 600;
    font-size: 15px;
    color: #303133;
    border-bottom: 1px solid #ebeef5;

    .el-icon {
      color: #409eff;
      font-size: 18px;
    }
  }

  &__menu {
    border-right: none;
    padding: 8px 0;

    :deep(.el-menu-item) {
      position: relative;
      height: 40px;
      line-height: 40px;
      font-size: 14px;

      &.is-active {
        background: #ecf5ff;
        color: #409eff;
        border-right: 3px solid #409eff;
      }

      .el-icon {
        margin-right: 8px;
        font-size: 15px;
        color: #909399;
      }

      &.is-active .el-icon {
        color: #409eff;
      }
    }

    :deep(.notify-badge) {
      margin-left: 8px;
    }
  }
}

.setting-content {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 20px 24px;

  &__header {
    .header-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 17px;
      color: #303133;
      padding-bottom: 16px;
      border-bottom: 1px solid #ebeef5;
      margin-bottom: 18px;

      .el-icon {
        color: #67c23a;
        font-size: 19px;
      }
    }
  }

  &__search {
    margin-bottom: 16px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 4px;

    .search-form {
      margin-bottom: 0;
    }
  }

  &__table {
    margin-top: 10px;
  }
}

.goods-no {
  font-weight: 500;
  color: #409eff;
}

.qty-warn {
  color: #f56c6c;
  font-weight: 600;
}

.suggest-highlight {
  color: #e6a23c;
  font-weight: 600;
}

.table-footer {
  padding: 12px 16px;
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  border-top: none;
  margin-top: -1px;

  .footer-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }

  .footer-label {
    font-weight: 600;
    color: #303133;
  }

  .footer-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;

    b {
      color: #303133;
    }
  }

  .footer-actions {
    display: flex;
    gap: 10px;
  }
}

.table-pagination {
  margin-top: 16px;
  text-align: right;
}

:deep(.el-input-number) {
  width: 100%;
}
</style>
