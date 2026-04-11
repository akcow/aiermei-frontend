<template>
  <view v-if="visible" class="overlay">
    <view class="modal">
      <view class="lock">🔒</view>
      <view class="title">登录后查看完整服务</view>
      <view class="desc">当前入口需要登录授权，授权后将自动回到目标页面。</view>
      <button class="primary" @click="$emit('success')">微信一键登录</button>
      <button class="ghost" @click="$emit('close')">取消</button>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{ visible: boolean }>();
defineEmits<{
  (e: 'close'): void;
  (e: 'success'): void;
}>();
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 48rpx;
}

.modal {
  width: 100%;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 48rpx 36rpx;
  text-align: center;
}

.lock {
  font-size: 64rpx;
  margin-bottom: 24rpx;
}

.title {
  font-size: 36rpx;
  color: #111827;
  margin-bottom: 14rpx;
}

.desc {
  font-size: 26rpx;
  color: #6b7280;
  line-height: 1.7;
  margin-bottom: 34rpx;
}

.primary {
  background: #111827;
  color: #ffffff;
  border: none;
  border-radius: 14rpx;
  font-size: 28rpx;
  margin-bottom: 22rpx;
}

.ghost {
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 26rpx;
}
</style>
