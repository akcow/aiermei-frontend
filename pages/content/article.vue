<template>
  <view class="page article-page">
    <view class="head">
      <view class="back" @click="goBack">
        <image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit" />
      </view>
      <view class="head-title">文章详情</view>
    </view>

    <scroll-view scroll-y class="content-scroll">
      <view class="article-content" v-if="article">
        <image v-if="article.type === 'image'" :src="article.cover" mode="widthFix" class="cover" />
        <view v-else class="video-wrap">
          <video :src="article.mediaUrl" class="video" controls />
        </view>
        <view class="body">
          <view class="title">{{ article.title }}</view>
          <view class="meta">
            <text>{{ article.author }}</text>
            <text class="dot">·</text>
            <text>{{ formatLikes(article.likes) }} 喜欢</text>
          </view>
          <view class="text" v-html="article.content || '暂无内容'"></view>
        </view>
      </view>
      <view class="loading" v-else>
        <text>加载中...</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getArticleDetail } from '@/api/modules/content';
import type { ContentItem } from '@/types/domain';

const article = ref<ContentItem | null>(null);

function goBack() {
  uni.navigateBack();
}

function formatLikes(likes: number): string {
  if (likes >= 1000) {
    return (likes / 1000).toFixed(1) + 'k';
  }
  return String(likes);
}

onLoad(async (query) => {
  const articleId = String(query.id || '');
  if (!articleId) {
    uni.showToast({ title: '文章ID不存在', icon: 'none' });
    return;
  }
  try {
    const res = await getArticleDetail(articleId);
    article.value = res.data;
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' });
  }
});
</script>

<style scoped>
.article-page {
  background: #fff;
  min-height: 100vh;
}

.head {
  display: flex;
  align-items: center;
  padding: var(--top-safe-offset) 24rpx 16rpx;
  gap: 8rpx;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
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
  font-size: 34rpx;
  letter-spacing: 5rpx;
  color: #111827;
}

.content-scroll {
  height: calc(100vh - var(--top-safe-offset) - 60rpx);
}

.article-content {
  padding-bottom: 60rpx;
}

.cover {
  width: 100%;
}

.video-wrap {
  width: 100%;
}

.video {
  width: 100%;
  height: 420rpx;
}

.body {
  padding: 30rpx;
}

.title {
  font-size: 40rpx;
  color: #1f2937;
  line-height: 1.5;
  font-weight: 600;
}

.meta {
  margin-top: 20rpx;
  font-size: 26rpx;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.dot {
  font-size: 20rpx;
}

.text {
  margin-top: 30rpx;
  font-size: 30rpx;
  color: #374151;
  line-height: 1.9;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: #9ca3af;
  font-size: 28rpx;
}
</style>
