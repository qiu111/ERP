<template>
  <div class="category-tree">
    <div class="category-tree__header">
      <el-icon class="category-tree__icon"><Menu /></el-icon>
      <span>{{ title }}</span>
    </div>
    <el-tree
      :data="treeData"
      :props="treeProps"
      node-key="value"
      :default-expand-all="defaultExpandAll"
      highlight-current
      @node-click="handleNodeClick"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Menu } from '@element-plus/icons-vue'

interface CategoryOption {
  label: string
  value: string
  children?: CategoryOption[]
  [key: string]: any
}

interface Props {
  /** 扁平分类选项列表（默认按内置规则自动分组） */
  options: CategoryOption[]
  /** 树标题 */
  title?: string
  /** 自定义分组函数：返回该分类所属的一级分组名；传 null 则不分组，直接把 options 当顶层节点 */
  groupBy?: ((option: CategoryOption) => string) | null
  /** 是否默认展开全部 */
  defaultExpandAll?: boolean
  /** el-tree 的 props 配置 */
  treeProps?: { label?: string; children?: string }
}

const props = withDefaults(defineProps<Props>(), {
  title: '分类树',
  defaultExpandAll: true,
  treeProps: () => ({ label: 'label', children: 'children' }),
})

const emit = defineEmits<{
  (e: 'select', value: string, node: CategoryOption): void
}>()

interface TreeNode {
  label: string
  value: string
  children?: TreeNode[]
}

// 内置默认分组规则（兼容原自采商品分类）
const defaultGroupBy = (opt: CategoryOption): string => {
  if (opt.label.includes('包')) return '箱包类'
  if (opt.label.includes('水') || opt.label.includes('杯')) return '水杯类'
  if (opt.label.includes('礼品') || opt.label.includes('广告') || opt.label === 'U盘' || opt.label === '台灯') {
    return '工艺礼品类'
  }
  return '其他'
}

const treeData = computed<TreeNode[]>(() => {
  // 传 null 表示不分组（options 已是树形结构或无需分组）
  if (props.groupBy === null) {
    return props.options as unknown as TreeNode[]
  }
  const groupFn = props.groupBy || defaultGroupBy
  const groupMap: Record<string, TreeNode> = {}
  props.options.forEach((opt) => {
    const group = groupFn(opt)
    if (!groupMap[group]) {
      groupMap[group] = { label: group, value: `__group_${group}__`, children: [] }
    }
    groupMap[group].children!.push({
      label: opt.label,
      value: opt.value,
      children: opt.children as any,
    })
  })
  return Object.values(groupMap)
})

const handleNodeClick = (node: any) => {
  emit('select', node.value, node)
}
</script>

<style scoped lang="scss">
.category-tree {
  width: 200px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 4px;
  padding: 12px;
  overflow-y: auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  &__header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #ebeef5;
  }

  &__icon {
    color: #409eff;
  }
}

:deep(.el-tree-node__content) {
  height: 32px;
}
</style>