<template>
  <view class="empty-state">
    <view class="empty-icon-wrapper">
      <image class="empty-icon" src="/static/icons/empty-box.svg" mode="aspectFit" />
    </view>
    <view class="empty-text">
      <text class="title">{{ title }}</text>
      <text class="subtitle">{{ subtitle }}</text>
    </view>
    <slot name="action"></slot>
  </view>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  subtitle?: string;
}

withDefaults(defineProps<Props>(), {
  title: '暂无记录',
  subtitle: '目前还没有相关内容显示哦'
});
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  animation: fadeIn 0.6s ease-out;
}

.empty-icon-wrapper {
  width: 240rpx;
  height: 240rpx;
  background: #f9f9f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 48rpx;
}

.empty-icon {
  width: 120rpx;
  height: 120rpx;
  opacity: 0.2;
}

.empty-text {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.title {
  font-size: 32rpx;
  font-weight: 500;
  color: #111827;
  letter-spacing: 2rpx;
}

.subtitle {
  font-size: 24rpx;
  color: #9ca3af;
  letter-spacing: 1rpx;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
