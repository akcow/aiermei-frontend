<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '240px'" class="layout-aside" :class="{ collapsed: isCollapse }">
      <div class="logo">
        <span class="logo-text">AI ER MEI</span>
        <span class="logo-mini">A</span>
      </div>

      <el-menu :default-active="activeMenu" :collapse="isCollapse" :collapse-transition="false" router class="layout-menu">
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>

        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <template #title>客户管理</template>
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
          <el-menu-item index="/content/banners">Banner管理</el-menu-item>
          <el-menu-item index="/content/magazines">杂志管理</el-menu-item>
          <el-menu-item index="/content/suites">套餐管理</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="/service">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>服务配置</span>
          </template>
          <el-menu-item index="/service/faq">FAQ管理</el-menu-item>
          <el-menu-item index="/service/hotline">热线管理</el-menu-item>
          <el-menu-item index="/service/center">中心配置</el-menu-item>
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

    <el-container class="layout-main">
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
        </div>

        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" :src="userStore.user?.avatar">{{ userStore.user?.name?.charAt(0) }}</el-avatar>
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
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import {
  ArrowDown,
  ChatDotRound,
  DataAnalysis,
  Document,
  DocumentCopy,
  Expand,
  Fold,
  Setting,
  Ticket,
  User
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapse = ref(false)
const activeMenu = computed(() => route.path)

function handleCommand(command: string) {
  if (command === 'logout') {
    ElMessageBox.confirm('确认退出登录吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userStore.logout()
      router.push({ name: 'Login' })
    }).catch(() => {})
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
}

.logo-text,
.logo-mini {
  position: absolute;
  transition: opacity 0.3s ease;
}

.layout-aside:not(.collapsed) .logo-text,
.layout-aside.collapsed .logo-mini {
  opacity: 1;
}

.layout-aside:not(.collapsed) .logo-mini,
.layout-aside.collapsed .logo-text {
  opacity: 0;
}

.layout-menu {
  border-right: none;
  background: transparent;
}

.layout-menu:not(.el-menu--collapse) {
  width: 240px;
}

.layout-menu :deep(.el-menu-item),
.layout-menu :deep(.el-sub-menu__title) {
  color: rgba(255, 255, 255, 0.75);
  height: 48px;
  line-height: 48px;
}

.layout-menu :deep(.el-menu-item:hover),
.layout-menu :deep(.el-sub-menu__title:hover) {
  background-color: rgba(255, 255, 255, 0.06);
}

.layout-menu :deep(.el-menu-item.is-active) {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.12);
}

.layout-menu :deep(.el-sub-menu .el-menu) {
  background: #1a1f2c;
}

.layout-menu :deep(.el-sub-menu .el-menu-item) {
  padding-left: 50px !important;
  min-width: auto;
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

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #6b7280;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
}

.user-info:hover {
  background: rgba(17, 24, 39, 0.04);
}

.layout-content {
  padding: 24px;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
