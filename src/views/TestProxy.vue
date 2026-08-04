<template>
  <div class="test-proxy">
    <h1>代理配置测试页面</h1>
    
    <div class="test-section">
      <h2>代理测试</h2>
      <el-button type="primary" @click="handleTestProxy" :loading="proxyLoading">
        测试代理配置
      </el-button>
      <div v-if="proxyResult" class="result">
        <h3>代理测试结果:</h3>
        <pre>{{ JSON.stringify(proxyResult, null, 2) }}</pre>
      </div>
    </div>

    <div class="test-section">
      <h2>直接请求测试</h2>
      <el-button type="success" @click="handleTestDirect" :loading="directLoading">
        测试直接请求
      </el-button>
      <div v-if="directResult" class="result">
        <h3>直接请求结果:</h3>
        <pre>{{ JSON.stringify(directResult, null, 2) }}</pre>
      </div>
    </div>

    <div class="test-section">
      <h2>网络请求信息</h2>
      <div class="info">
        <p><strong>当前页面 URL:</strong> {{ currentUrl }}</p>
        <p><strong>API 基础路径:</strong> /api</p>
        <p><strong>api1 基础路径:</strong> api1</p>
        <p><strong>目标服务器:</strong> IP:8081</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { testProxy, testDirectRequest } from '@/utils/testProxy'

const proxyLoading = ref(false)
const directLoading = ref(false)
const proxyResult = ref<any>(null)
const directResult = ref<any>(null)
const currentUrl = ref(window.location.href)

const handleTestProxy = async () => {
  proxyLoading.value = true
  try {
    const result = await testProxy()
    proxyResult.value = result
  } catch (error: any) {
    proxyResult.value = { success: false, error: error.message }
  } finally {
    proxyLoading.value = false
  }
}

const handleTestDirect = async () => {
  directLoading.value = true
  try {
    const result = await testDirectRequest()
    directResult.value = result
  } catch (error: any) {
    directResult.value = { success: false, error: error.message }
  } finally {
    directLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.test-proxy {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  h1 {
    color: #333;
    margin-bottom: 30px;
  }

  .test-section {
    margin-bottom: 40px;
    padding: 20px;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    background: #fafafa;

    h2 {
      color: #409eff;
      margin-bottom: 15px;
    }

    .result {
      margin-top: 20px;
      padding: 15px;
      background: #fff;
      border: 1px solid #dcdfe6;
      border-radius: 4px;

      h3 {
        color: #67c23a;
        margin-bottom: 10px;
      }

      pre {
        background: #f5f7fa;
        padding: 10px;
        border-radius: 4px;
        overflow-x: auto;
        font-size: 12px;
        line-height: 1.4;
      }
    }

    .info {
      p {
        margin: 8px 0;
        font-size: 14px;
        
        strong {
          color: #606266;
        }
      }
    }
  }
}
</style>
