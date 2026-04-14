<template>
  <view class="page detail-page">
    <view class="sticky-header">
      <view class="back" @click="goBack">
        <image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit" />
      </view>
      <view class="head-title">{{ detail.title || 'Center Detail' }}</view>
    </view>
    <image :src="detail.detailImage" mode="widthFix" class="long-image" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getCenterSectionDetail } from '@/api/modules/center';
import { trackPath } from '@/store/session';
import type { CenterSectionDetail } from '@/types/domain';

const detail = ref<CenterSectionDetail>({
  id: '',
  title: '',
  detailImage: 'https://picsum.photos/seed/env_long/1080/3000'
});

function goBack() {
  uni.navigateBack();
}

onLoad(async (query) => {
  const id = String(query.id || '');
  trackPath(`center-detail:${id}`);
  if (!id) {
    return;
  }
  try {
    const response = await getCenterSectionDetail(id);
    detail.value = response.data;
  } catch {
    uni.showToast({ title: 'Load failed', icon: 'none' });
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
