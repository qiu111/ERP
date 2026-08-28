<template>
  <div class="portal-panel">
    <div class="panel-header">
      <div class="panel-title">
        <el-icon v-if="icon" :size="16" :color="iconColor">
          <component :is="icon" />
        </el-icon>
        <span>{{ title }}</span>
      </div>
      <div class="panel-actions">
        <slot name="actions">
          <el-icon class="action-icon"><ArrowDown /></el-icon>
          <el-icon class="action-icon"><Refresh /></el-icon>
          <el-icon class="action-icon"><Close /></el-icon>
        </slot>
      </div>
    </div>
    <div class="panel-body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowDown, Refresh, Close } from '@element-plus/icons-vue'

// 门户面板（通用白卡片）：标题栏（图标 + 操作按钮插槽）+ 内容插槽
withDefaults(
  defineProps<{
    title: string
    icon?: any
    iconColor?: string
  }>(),
  {
    icon: null,
    iconColor: '#409eff',
  },
)
</script>

<style scoped lang="scss">
.portal-panel {
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafbfc;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.panel-actions {
  display: flex;
  gap: 12px;

  .action-icon {
    cursor: pointer;
    color: #c0c4cc;
    font-size: 14px;
    transition: color 0.2s;

    &:hover {
      color: #409eff;
    }
  }
}

.panel-body {
  padding: 16px;
}
</style>
