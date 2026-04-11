<template>
  <view class="bottom-nav">
    <view v-for="item in items" :key="item.path" class="nav-item" :class="{ active: current === item.path }" @click="go(item.path)">
      <image class="icon" :src="item.iconPath" mode="aspectFit" />
      <text class="label">{{ item.label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{ current: string }>();

const items = [
  { path: '/pages/home/index', label: '首页', iconPath: '/static/icons/home.svg' },
  { path: '/pages/center/index', label: '中心', iconPath: '/static/icons/grid.svg' },
  { path: '/pages/content/index', label: '内容', iconPath: '/static/icons/message.svg' },
  { path: '/pages/member/index', label: '会员', iconPath: '/static/icons/user.svg' }
];

function go(path: string) {
  if (path === props.current) {
    return;
  }
  uni.reLaunch({ url: path });
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 138rpx;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10rpx);
  border-top: 1rpx solid rgba(17, 24, 39, 0.1);
  display: flex;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 50;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  color: #9ca3af;
}

.nav-item.active {
  color: #111827;
}

.icon {
  width: 34rpx;
  height: 34rpx;
  opacity: 0.45;
}

.label {
  font-size: 22rpx;
  letter-spacing: 2rpx;
}

.nav-item.active .icon {
  opacity: 0.95;
}
</style>
