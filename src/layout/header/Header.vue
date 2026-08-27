<template>
    <div class="header-container">
        <div class="header-left">
            <Collapse />
            <Breadcrumb />
        </div>
        <!-- 右侧：用户信息 + 退出 -->
        <div v-if="userStore.isAuthenticated" class="header-right">
            <el-dropdown trigger="click" @command="handleCommand">
                <div class="user-info">
                    <el-avatar :size="32" :icon="UserFilled" />
                    <span class="user-name">{{ displayName }}</span>
                    <el-icon class="arrow-icon"><ArrowDown /></el-icon>
                </div>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item command="profile">
                            <el-icon><User /></el-icon>
                            个人中心
                        </el-dropdown-item>
                        <el-dropdown-item divided command="logout">
                            <el-icon><SwitchButton /></el-icon>
                            退出登录
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>
</template>

<script setup lang="ts">
import { User, UserFilled, ArrowDown, SwitchButton } from '@element-plus/icons-vue'
import Collapse from './Collapse.vue'
import Breadcrumb from './Breadcrumb.vue'
import { useUserStore } from '@/store/user/user.ts'

const router = useRouter()
const userStore = useUserStore()

// 展示名：优先 name，其次 username，最后占位
const displayName = computed(() => {
  const info = userStore.userInfo
  return info?.name || info?.username || '用户'
})

// 下拉菜单命令分发
const handleCommand = async (command: string) => {
  if (command === 'profile') {
    router.push('/dashboard')
  } else if (command === 'logout') {
    await handleLogout()
  }
}

// 退出登录：二次确认 → 清理登录态 → 跳转登录页
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch {
    // 用户取消，不做处理
  }
}
</script>

<style scoped lang="scss">
.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  margin-left: auto;
  padding-right: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .user-name {
    color: #fff;
    font-size: 14px;
  }

  .arrow-icon {
    color: #fff;
    font-size: 12px;
  }
}
</style>
