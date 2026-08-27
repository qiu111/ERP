import type { TableInstance } from 'element-plus'
<template>
  <div ref="containerRef" class="common-table">
    <div v-if="$slots.toolbar" class="common-table__toolbar">
      <slot name="toolbar" />
    </div>

    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="pagedData"
      :row-key="rowKey"
      :border="border"
      :stripe="stripe"
      :height="height"
      :max-height="maxHeight"
      :tree-props="resolvedTreeProps"
      :default-expand-all="defaultExpandAll"
      :fit="resolvedFit"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
      style="width: 100%"
    >
      <el-table-column
        v-if="selectable"
        type="selection"
        width="50"
        :reserve-selection="true"
      />

      <template v-for="(col, colIndex) in resolvedColumns" :key="col.key || col.prop || col.label">
        <el-table-column
          :prop="col.prop"
          :label="col.label"
          v-bind="getColumnBindings(col)"
          :align="col.align || 'left'"
          :header-align="col.headerAlign"
          :fixed="col.fixed"
          :sortable="col.sortable ? 'custom' : false"
          :show-overflow-tooltip="col.showOverflowTooltip ?? true"
        >
          <template #default="{ row }">
            <slot
              :name="`column-${col.prop}`"
              :row="row"
              :column="col"
              :index="getRowIndex(row)"
            >
              {{ col.prop ? row[col.prop] : '' }}
            </slot>
          </template>
        </el-table-column>
      </template>

      <el-table-column
        v-if="$slots.operation"
        label="操作"
        :width="operationWidth"
        align="center"
        :fixed="'right'"
      >
        <template #default="{ row, $index }">
          <slot name="operation" :row="row" :index="$index" />
        </template>
      </el-table-column>

      <template #empty>
        <slot name="empty">
          <el-empty description="暂无数据" />
        </slot>
      </template>
    </el-table>

    <div v-if="showPagination" class="common-table__pagination">
      <el-pagination
        v-model:current-page="innerCurrentPage"
        v-model:page-size="innerPageSize"
        :page-sizes="resolvedPageSizes"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
export interface TableColumn {
  prop?: string
  label: string
  width?: number
  minWidth?: number
  align?: 'left' | 'center' | 'right'
  headerAlign?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
  sortable?: boolean
  showOverflowTooltip?: boolean
  key?: string
}

interface Props {
  columns: TableColumn[]
  data: any[]
  loading?: boolean
  total?: number
  pageSize?: number
  currentPage?: number
  pageSizes?: number[]
  stripe?: boolean
  border?: boolean
  rowKey?: string
  selectable?: boolean
  treeProps?: { children: string }
  defaultExpandAll?: boolean
  height?: string | number
  maxHeight?: string | number
  operationWidth?: number
  pagination?: boolean
  fit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  columns: () => [],
  data: () => [],
  loading: false,
  total: 0,
  pageSize: 10,
  currentPage: 1,
  stripe: true,
  border: true,
  rowKey: 'id',
  selectable: false,
  defaultExpandAll: false,
  operationWidth: 260,
  pagination: true,
  fit: true,
})

const resolvedPageSizes = computed(() => props.pageSizes ?? [10, 20, 50, 100])
const resolvedTreeProps = computed(() => props.treeProps ?? { children: 'children' })
// 统一 fit 为布尔值：即使调用方传字符串 "true"/"false"，也不会在 ElTable 触发 prop 类型警告
const resolvedFit = computed<boolean>(() => {
  const v: any = (props as any).fit
  if (typeof v === 'boolean') return v
  if (typeof v === 'string') return v === 'true' || v === ''
  return Boolean(v)
})

// 处理列配置：当所有列都使用固定 width 时，自动将最后一个数据列改为 minWidth 以实现自适应
const resolvedColumns = computed(() => {
  const cols = [...props.columns]
  // 检查是否有列使用了 minWidth 或没有 width
  const hasFlexibleColumn = cols.some((c) => !c.width || c.minWidth)
  if (!hasFlexibleColumn && cols.length > 0) {
    // 将最后一个数据列（非操作列）改为 minWidth
    const lastIndex = cols.length - 1
    const lastCol = { ...cols[lastIndex] }
    const origWidth = lastCol.width || 120
    delete lastCol.width
    lastCol.minWidth = origWidth
    cols[lastIndex] = lastCol
  }
  return cols
})

// 根据列配置生成 el-table-column 的绑定属性
const getColumnBindings = (col: TableColumn) => {
  const bindings: Record<string, any> = {}
  if (col.width != null) {
    bindings.width = col.width
  }
  if (col.minWidth != null) {
    bindings['min-width'] = col.minWidth
  }
  return bindings
}

const emit = defineEmits<{
  (e: 'page-change', page: number, pageSize: number): void
  (e: 'page-size-change', size: number): void
  (e: 'selection-change', rows: any[]): void
  (e: 'row-click', row: any, index: number): void
  (e: 'sort-change', prop: string, order: string): void
}>()

const tableRef = ref<TableInstance>()
const innerCurrentPage = ref(props.currentPage)
const innerPageSize = ref(props.pageSize)

// Watch for prop changes
watch(
  () => props.currentPage,
  (val) => { innerCurrentPage.value = val }
)
watch(
  () => props.pageSize,
  (val) => { innerPageSize.value = val }
)

// Flatten tree data for pagination support
const flattenData = (items: any[]): any[] => {
  const result: any[] = []
  const walk = (list: any[]) => {
    list.forEach((item) => {
      result.push(item)
      if (item.children && item.children.length) {
        walk(item.children)
      }
    })
  }
  walk(items)
  return result
}

const isTreeData = computed(() => {
  return props.data.some((item) => item.children && item.children.length)
})

// If pagination is handled internally (flat data), slice the data
const pagedData = computed(() => {
  if (!props.pagination || isTreeData.value) {
    return props.data
  }
  const start = (innerCurrentPage.value - 1) * innerPageSize.value
  return props.data.slice(start, start + innerPageSize.value)
})

// If total not provided, compute from data length
const total = computed(() => {
  if (props.total > 0) return props.total
  if (isTreeData.value) return flattenData(props.data).length
  return props.data.length
})

const showPagination = computed(() => {
  return props.pagination && total.value > 0
})

const handleCurrentChange = (page: number) => {
  innerCurrentPage.value = page
  emit('page-change', page, innerPageSize.value)
}

const handleSizeChange = (size: number) => {
  innerPageSize.value = size
  innerCurrentPage.value = 1
  emit('page-size-change', size)
}

const handleSelectionChange = (rows: any[]) => {
  emit('selection-change', rows)
}

const handleRowClick = (row: any) => {
  const index = props.data.findIndex((item) => item[props.rowKey] === row[props.rowKey])
  emit('row-click', row, index)
}

const getRowIndex = (row: any) => {
  return pagedData.value.findIndex((item) => item[props.rowKey] === row[props.rowKey])
}

// Expose methods
const clearSelection = () => {
  tableRef.value?.clearSelection()
}

const getSelection = () => {
  return tableRef.value?.getSelectionRows() ?? []
}

defineExpose({
  clearSelection,
  getSelection,
  tableRef,
})

const containerRef = ref<HTMLElement>()
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  innerCurrentPage.value = props.currentPage
  innerPageSize.value = props.pageSize

  nextTick(() => {
    if (containerRef.value) {
      resizeObserver = new ResizeObserver(() => {
        tableRef.value?.doLayout()
      })
      resizeObserver.observe(containerRef.value)
    }
  })
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})
</script>

<style scoped lang="scss">
.common-table {
  width: 100%;

  &__toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  &__pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}
</style>
