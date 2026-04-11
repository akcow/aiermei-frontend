<template>
  <view class="page detail-page">
    <view class="sticky-header">
      <view class="back" @click="goBack">
        <image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit" />
      </view>
      <view class="head-title">{{ detail.title }}</view>
    </view>
    <image :src="detail.image" mode="widthFix" class="long-image" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { trackPath } from '@/store/session';

const detail = ref({
  title: '中心环境',
  image: 'https://picsum.photos/seed/env_long/1080/3000'
});

function goBack() {
  uni.navigateBack();
}

onLoad((query) => {
  const id = String(query.id || 'env');
  trackPath(`中心详情:${id}`);
  const map: Record<string, { title: string; image: string }> = {
    env: { title: '中心环境', image: 'https://picsum.photos/seed/env_long/1080/3000' },
    equip: { title: '护理设备', image: 'https://picsum.photos/seed/equip_long/1080/3000' },
    meal: { title: '营养餐食', image: 'https://picsum.photos/seed/meal_long/1080/3000' },
    team: { title: '专家团队', image: 'https://picsum.photos/seed/team_long/1080/3000' }
  };
  detail.value = map[id] || map.env;
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
