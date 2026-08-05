<!-- views/login/Index.vue -->
<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>ERP综合管理平台</h2>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="loginForm.username"
            type="text"
            placeholder="请输入用户名"
            required
            :class="{ 'error': errors.username }"
          />
          <span v-if="errors.username" class="error-text">{{ errors.username }}</span>
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            required
            :class="{ 'error': errors.password }"
          />
          <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
        </div>
        
        <div class="form-group">
          <label class="checkbox-label">
            <input
              v-model="loginForm.remember"
              type="checkbox"
            />
            记住密码
          </label>
        </div>
        
        <button 
          type="submit" 
          class="login-btn"
          :disabled="loading"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? '登录中...' : '登录' }}
        </button>
        
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user/user.ts'
import { getLogin } from '@/api/user'
import { loadDynamicRoutes } from '@/router' // 导入动态路由加载方法
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const errors = reactive({
  username: '',
  password: ''
})

const loading = ref(false)
const errorMessage = ref('')

// 表单验证
const validateForm = (): boolean => {
  let isValid = true
  errors.username = ''
  errors.password = ''
  
  if (!loginForm.username.trim()) {
    errors.username = '请输入用户名'
    isValid = false
  }
  
  if (!loginForm.password.trim()) {
    errors.password = '请输入密码'
    isValid = false
  } else if (loginForm.password.length < 6) {
    errors.password = '密码长度不能少于6位'
    isValid = false
  }
  
  return isValid
}

// 处理登录
const handleLogin = async () => {
  errorMessage.value = ''

  if (!validateForm()) {
    return
  }

  loading.value = true
  try {
    // getLogin 返回 Result<LoginResult>，http 拦截器已保证 code===200
    const result = await getLogin({
      username: loginForm.username,
      password: loginForm.password,
    })
    const { token, userInfo } = result.data

    // 通过 store 保存 token 和用户信息（store 内部已同步写入 localStorage）
    if (token) {
      userStore.setToken(token)
    }
    if (userInfo) {
      userStore.setUserInfo(userInfo)
    }

    ElMessage?.success('登录成功！')

    // 登录成功后再加载动态路由
    try {
      await loadDynamicRoutes()
    } catch (routeError) {
      console.error('动态路由加载失败:', routeError)
      // 即使动态路由加载失败，也继续跳转，只是可能部分功能不可用
    }

    // 跳转到个人门户或之前尝试访问的页面
    const redirect = router.currentRoute.value.query.redirect as string || '/'
    router.push(redirect)
  } catch (error: any) {
    console.error('登录错误:', error)
    if (error?.message) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = '登录失败，请稍后重试'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 你的样式代码保持不变 */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0;
}

.login-box {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #333;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.login-form {
  width: 100%;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.form-group input[type="text"],
.form-group input[type="password"] {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-group input[type="text"]:focus,
.form-group input[type="password"]:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.form-group input.error {
  border-color: #e74c3c;
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
}

.checkbox-label input[type="checkbox"] {
  width: auto !important;
  margin-right: 8px;
}

.error-text {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.login-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #e74c3c;
  text-align: center;
  font-size: 14px;
  background: #fdf2f2;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #fecaca;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-box {
    padding: 30px 20px;
  }
  
  .login-header h2 {
    font-size: 20px;
  }
}
</style>