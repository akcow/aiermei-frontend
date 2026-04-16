<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '240px'" class="layout-aside" :class="{ collapsed: isCollapse }">
      <div class="logo">
        <span class="logo-text">AI ER MEI</span>
        <span class="logo-mini">A</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        router
        class="layout-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>数据概览</template>
        </el-menu-item>
        
        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>
        
        <el-menu-item index="/orders">
          <el-icon><Document /></el-icon>
          <template #title>订单管理</template>
        </el-menu-item>
        
        <el-sub-menu index="/content">
          <template #title>
            <el-icon><DocumentCopy /></el-icon>
            <span>内容管理</span>
          </template>
          <el-menu-item index="/content/articles">文章管理</el-menu-item>
          <el-menu-item index="/content/banners">海报管理</el-menu-item>
          <el-menu-item index="/content/magazines">杂志管理</el-menu-item>
          <el-menu-item index="/content/suites">房型管理</el-menu-item>
        </el-sub-menu>
        
        <el-menu-item index="/coupons">
          <el-icon><Ticket /></el-icon>
          <template #title>优惠券管理</template>
        </el-menu-item>
        
        <el-menu-item index="/feedback">
          <el-icon><ChatDotRound /></el-icon>
          <template #title>反馈管理</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <!-- 主内容区 -->
    <el-container class="layout-main">
      <!-- 顶部栏 -->
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon 
            class="collapse-btn" 
            @click="isCollapse = !isCollapse"
          >
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
        </div>
        
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" :src="userStore.user?.avatar">
                {{ userStore.user?.name?.charAt(0) }}
              </el-avatar>
              <span class="user-name">{{ userStore.user?.name }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 内容区 -->
      <el-main class="layout-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapse = ref(false)
const activeMenu = computed(() => route.path)

function handleCommand(command: string) {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userStore.logout()
      router.push({ name: 'Login' })
    }).catch(() => {})
  } else if (command === 'profile') {
    // TODO: 个人信息页面
  }
}
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
}

.layout-aside {
  background: #111827;
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 2px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  
  .logo-text {
    position: absolute;
    white-space: nowrap;
    transition: opacity 0.3s ease;
  }
  
  .logo-mini {
    font-size: 24px;
    position: absolute;
    transition: opacity 0.3s ease;
  }
}

.layout-aside:not(.collapsed) .logo .logo-text {
  opacity: 1;
}

.layout-aside:not(.collapsed) .logo .logo-mini {
  opacity: 0;
}

.layout-aside.collapsed .logo .logo-text {
  opacity: 0;
}

.layout-aside.collapsed .logo .logo-mini {
  opacity: 1;
}

.layout-menu {
  border-right: none;
  background: transparent;
  
  &:not(.el-menu--collapse) {
    width: 240px;
  }
  
  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    color: rgba(255, 255, 255, 0.7);
    height: 48px;
    line-height: 48px;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }
  }
  
  :deep(.el-menu-item.is-active) {
    color: #fff;
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  // 子菜单样式修复
  :deep(.el-sub-menu) {
    .el-menu {
      background: #1a1f2c;
    }
    
    .el-menu-item {
      padding-left: 50px !important;
      min-width: auto;
      color: rgba(255, 255, 255, 0.7);
      background: #1a1f2c;
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.05);
      }
      
      &.is-active {
        color: #fff;
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
  }
  
  :deep(.el-icon) {
    color: inherit;
  }
}

.layout-main {
  background: #f5f5f0;
}

.layout-header {
  background: #fff;
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s;
  
  &:hover {
    color: #111827;
  }
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(17, 24, 39, 0.04);
  }
  
  .user-name {
    font-size: 14px;
    color: #1f2937;
  }
}

.layout-content {
  padding: 24px;
  overflow-y: auto;
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
