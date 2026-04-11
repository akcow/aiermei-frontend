<template>
  <view class="header">
    <view class="left" @click="goBack" v-if="showBack">
      <image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit" />
    </view>
    <view class="title">{{ title }}</view>
    <view class="right"><slot /></view>
  </view>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string;
    showBack?: boolean;
  }>(),
  {
    showBack: true
  }
);

function goBack() {
  uni.navigateBack({ delta: 1 });
}
</script>

<style scoped>
.header {
  min-height: 114rpx;
  padding: var(--top-safe-offset) 28rpx 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.left,
.right {
  width: 100rpx;
  color: #6b7280;
}

.back-icon {
  width: 36rpx;
  height: 36rpx;
}

.title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  letter-spacing: 4rpx;
  color: #111827;
}
</style>
