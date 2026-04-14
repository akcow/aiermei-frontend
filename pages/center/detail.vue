<template>
  <view class="page detail-page">
    <view class="sticky-header">
      <view class="back" @click="goBack">
        <image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit" />
      </view>
      <view class="head-title">{{ detail?.title || '加载中...' }}</view>
    </view>
    <image v-if="detail" :src="detail.detailImage" mode="widthFix" class="long-image" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getCenterSectionDetail } from '@/api/modules/center';
import { trackPath } from '@/store/session';
import type { CenterSectionDetail } from '@/types/domain';

const detail = ref<CenterSectionDetail | null>(null);

function goBack() {
  uni.navigateBack();
}

onLoad(async (query) => {
  const id = String(query.id || '');
  trackPath(`中心详情:${id}`);
  
  if (!id) {
    uni.showToast({ title: '缺少ID参数', icon: 'none' });
    return;
  }
  
  try {
    const res = await getCenterSectionDetail(id);
    detail.value = res.data;
  } catch (e) {
    console.error('Failed to load section detail:', e);
    uni.showToast({ title: '加载失败', icon: 'none' });
  }
});
</script>

<style scoped>
.detail-page {
  background: #f5f5f0;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 20;
  min-height: 108rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: var(--top-safe-offset-compact) 24rpx 10rpx;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(8rpx);
  border-bottom: 1rpx solid rgba(17, 24, 39, 0.08);
}

.back {
  min-width: 88rpx;
  color: #6b7280;
}

.back-icon {
  width: 34rpx;
  height: 34rpx;
  opacity: 0.8;
}

.head-title {
  font-size: 31rpx;
  letter-spacing: 4rpx;
  color: #111827;
}

.long-image {
  width: 100%;
}
</style>