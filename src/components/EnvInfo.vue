<template>
  <div class="env-info">
    <el-card class="env-card">
      <template #header>
        <div class="card-header">
          <span>环境信息</span>
          <el-tag :type="envTagType">{{ currentEnv }}</el-tag>
        </div>
      </template>
      
      <el-descriptions :column="1" border>
        <el-descriptions-item label="应用标题">
          {{ appTitle }}
        </el-descriptions-item>
        <el-descriptions-item label="API基础URL">
          {{ apiBaseUrl }}
        </el-descriptions-item>
        <el-descriptions-item label="API目标地址">
          {{ apiTarget }}
        </el-descriptions-item>
        <el-descriptions-item label="当前环境">
          {{ currentEnv }}
        </el-descriptions-item>
        <el-descriptions-item label="应用版本">
          {{ appVersion }}
        </el-descriptions-item>
      </el-descriptions>
      
      <div class="env-actions">
        <el-button @click="refreshEnv" type="primary" size="small">
          刷新环境信息
        </el-button>
        <el-button @click="showAllEnv" type="info" size="small">
          查看所有环境变量
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  getAppTitle, 
  getApiBaseUrl, 
  getAppEnv, 
  getApiTarget, 
  getAllEnv,
  isDevelopment,
  isProduction,
  isTest
} from '@/utils/env'

const appTitle = ref('')
const apiBaseUrl = ref('')
const currentEnv = ref('')
const apiTarget = ref('')
const appVersion = ref('')

// 计算环境标签类型
const envTagType = computed(() => {
  if (isDevelopment()) return 'success'
  if (isProduction()) return 'danger'
  if (isTest()) return 'warning'
  return 'info'
})

// 初始化环境信息
const initEnvInfo = () => {
  appTitle.value = getAppTitle()
  apiBaseUrl.value = getApiBaseUrl()
  currentEnv.value = getAppEnv()
  apiTarget.value = getApiTarget()
  appVersion.value = import.meta.env.__APP_VERSION__ || '0.0.0'
}

// 刷新环境信息
const refreshEnv = () => {
  initEnvInfo()
  ElMessage.success('环境信息已刷新')
}

// 显示所有环境变量
const showAllEnv = () => {
  const allEnv = getAllEnv()
  console.log('所有环境变量:', allEnv)
  ElMessage.info('所有环境变量已输出到控制台')
}

onMounted(() => {
  initEnvInfo()
})
</script>

<style scoped>
.env-info {
  padding: 20px;
}

.env-card {
  max-width: 600px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.env-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
}
</style>
