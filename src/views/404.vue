<!-- views/404.vue -->
<template>
    <div class="not-found">
      <div class="not-found-content">
        <h1>404</h1>
        <h2>页面未找到</h2>
        <p>抱歉，您访问的页面不存在。</p>
        <button @click="goHome" class="back-btn">返回个人门户</button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  const goHome = () => {
    router.push('/')
  }
  </script>
  
  <style scoped>
  .not-found {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    padding: 20px;
  }
  
  .not-found-content {
    text-align: center;
    background: white;
    padding: 60px 40px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    width: 100%;
  }
  
  .not-found-content h1 {
    font-size: 72px;
    color: #666;
    margin: 0 0 20px 0;
    font-weight: 300;
  }
  
  .not-found-content h2 {
    font-size: 24px;
    color: #333;
    margin: 0 0 16px 0;
    font-weight: 500;
  }
  
  .not-found-content p {
    color: #666;
    font-size: 16px;
    margin: 0 0 32px 0;
    line-height: 1.5;
  }
  
  .back-btn {
    padding: 12px 24px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.3s ease;
  }
  
  .back-btn:hover {
    background: #5a6fd8;
  }
  </style>