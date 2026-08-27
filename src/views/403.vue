<!-- views/403.vue -->
<template>
  <div class="forbidden">
    <div class="forbidden-content">
      <h1>403</h1>
      <h2>无访问权限</h2>
      <p>抱歉，您没有权限访问该页面，请联系管理员开通权限。</p>
      <button @click="goHome" class="back-btn">返回个人门户</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.forbidden {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 20px;
}

.forbidden-content {
  text-align: center;
  background: white;
  padding: 60px 40px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.forbidden-content h1 {
  font-size: 72px;
  color: #f56c6c;
  margin: 0 0 20px 0;
  font-weight: 300;
}

.forbidden-content h2 {
  font-size: 24px;
  color: #333;
  margin: 0 0 16px 0;
  font-weight: 500;
}

.forbidden-content p {
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
