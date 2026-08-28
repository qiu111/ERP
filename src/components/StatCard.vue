<template>
  <div class="stat-card" :class="{ clickable: !!to }" @click="to && router.push(to)">
    <div class="stat-info">
      <div class="stat-count">
        <span class="stat-current">{{ current }}</span>
        <span class="stat-divider">/</span>
        <span class="stat-total">{{ total }}</span>
      </div>
      <div class="stat-title">{{ title }}</div>
      <div class="stat-sub">
        <slot name="sub">
          <span>{{ subLabel }}</span>
        </slot>
        <span class="stat-percent">{{ percent }}%</span>
      </div>
      <el-progress
        :percentage="percent"
        :stroke-width="4"
        :show-text="false"
        :color="color"
        class="stat-progress"
      />
    </div>
    <div class="stat-icon" :style="{ backgroundColor: bgColor }">
      <el-icon :size="36" :color="iconColor">
        <component :is="icon" />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

// 统计卡片（门户页通用）：current/total 计数 + 进度条 + 右侧图标；to 提供时整卡可点击跳转
withDefaults(
  defineProps<{
    title: string
    current?: number
    total?: number
    subLabel?: string
    percent?: number
    color?: string
    bgColor?: string
    iconColor?: string
    icon?: any
    to?: string
  }>(),
  {
    current: 0,
    total: 0,
    subLabel: '',
    percent: 0,
    color: '#409eff',
    bgColor: '#ecf5ff',
    iconColor: '#409eff',
    icon: null,
    to: '',
  },
)

const router = useRouter()
</script>

<style scoped lang="scss">
.stat-card {
  background: #fff;
  border-radius: 6px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &.clickable {
    cursor: pointer;
  }
}

.stat-info {
  flex: 1;
}

.stat-count {
  font-size: 28px;
  font-weight: 600;
  line-height: 1.2;

  .stat-current {
    color: #303133;
  }

  .stat-divider {
    color: #c0c4cc;
    margin: 0 2px;
    font-weight: 400;
  }

  .stat-total {
    color: #909399;
    font-size: 22px;
  }
}

.stat-title {
  font-size: 14px;
  color: #606266;
  margin-top: 4px;
  margin-bottom: 8px;
}

.stat-sub {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-percent {
  color: #409eff;
}

.stat-progress {
  margin-top: 4px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 16px;
}
</style>
