<template>
  <web-view v-if="isWeb && url" :src="url" />
  <view v-else class="page article-page">
    <view class="head">
      <view class="back" @click="goBack">
        <image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit" />
      </view>
      <view class="title">{{ title || 'Article Detail' }}</view>
    </view>

    <view class="content-wrap">
      <video
        v-if="type === 'video' && url"
        class="video"
        :src="url"
        controls
        show-center-play-btn
        show-mute-btn
      />
      <image v-else-if="url" class="cover" :src="url" mode="widthFix" />
      <image v-else-if="cover" class="cover" :src="cover" mode="widthFix" />
      <view v-else class="empty">No content available</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const url = ref('');
const title = ref('');
const type = ref('');
const cover = ref('');

const isWeb = computed(() => /^https?:\/\//.test(url.value) && type.value !== 'video');

function decode(input: unknown) {
  if (typeof input !== 'string') {
    return '';
  }
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}

function goBack() {
  uni.navigateBack();
}

onLoad((query) => {
  url.value = decode(query.url);
  title.value = decode(query.title);
  type.value = decode(query.type);
  cover.value = decode(query.cover);
});
</script>

<style scoped>
.article-page {
  background: #fff9f9;
  min-height: 100vh;
}

.head {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: var(--top-safe-offset-compact) 24rpx 14rpx;
  border-bottom: 1rpx solid #fee2e2;
}

.back {
  min-width: 70rpx;
}

.back-icon {
  width: 34rpx;
  height: 34rpx;
}

.title {
  font-size: 32rpx;
  color: #be123c;
}

.content-wrap {
  padding: 24rpx;
}

.video,
.cover {
  width: 100%;
  border-radius: 20rpx;
  overflow: hidden;
}

.empty {
  text-align: center;
  color: #6b7280;
  padding: 80rpx 0;
}
</style>
