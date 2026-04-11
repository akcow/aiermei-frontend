<template>
  <view class="page suite-page">
    <view class="head">
      <view class="back" @click="goBack">
        <image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit" />
      </view>
      <view class="head-title">套房详情</view>
    </view>

    <view class="list-wrap">
      <view class="suite-card" v-for="item in suites" :key="item.id" @click="openDetail(item)">
        <view class="suite-cover-wrap">
          <image :src="item.images[0]" class="suite-cover" mode="aspectFill" />
          <view class="suite-cover-mask">沉浸式房型展示</view>
        </view>
        <view class="suite-body">
          <view class="suite-row">
            <view>
              <view class="suite-name">{{ item.name }}</view>
              <view class="suite-feat">{{ item.size }} / {{ item.features.join(' | ') }}</view>
            </view>
            <view class="suite-price">{{ item.price }}</view>
          </view>
          <button class="suite-btn">查看详情</button>
        </view>
      </view>
    </view>

    <view class="overlay" v-if="selected">
      <view class="detail-panel slide-in">
        <view class="detail-hero">
          <image :src="selected.images[currentImageIndex]" class="detail-img" mode="aspectFill" />
          <view class="hero-mask" />
          <view class="close" @click="selected = null">
            <image class="close-icon" src="/static/icons/arrow-left.svg" mode="aspectFit" />
          </view>
          <view class="carousel-controls">
            <view class="ctrl" @click="prev">
              <image class="ctrl-icon" src="/static/icons/arrow-left.svg" mode="aspectFit" />
            </view>
            <view class="ctrl" @click="next">
              <image class="ctrl-icon" src="/static/icons/arrow-right.svg" mode="aspectFit" />
            </view>
          </view>
          <view class="indicators">
            <view class="ind" :class="{ active: index === currentImageIndex }" v-for="(_, index) in selected.images" :key="index" />
          </view>
        </view>

        <scroll-view scroll-y class="detail-scroll">
          <view class="detail-content">
            <view class="detail-title">{{ selected.name }}</view>
            <view class="detail-tags">
              <text class="tag" v-for="f in selected.features" :key="f">{{ f }}</text>
            </view>
            <view class="detail-price">{{ selected.price }}</view>
            <view class="detail-desc">
              基于产后阶段和家庭需求提供套房级照护计划，包含空间服务、营养餐食、护理响应与康复课程配置。
            </view>
            <button class="book-btn">预约到店顾问</button>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getSuites } from '@/api/modules/center';
import { trackPath } from '@/store/session';
import type { Suite } from '@/types/domain';

const suites = ref<Suite[]>([]);
const selected = ref<Suite | null>(null);
const currentImageIndex = ref(0);

function goBack() {
  uni.navigateBack();
}

function openDetail(item: Suite) {
  selected.value = item;
  currentImageIndex.value = 0;
}

function prev() {
  if (!selected.value) return;
  const total = selected.value.images.length;
  currentImageIndex.value = (currentImageIndex.value - 1 + total) % total;
}

function next() {
  if (!selected.value) return;
  const total = selected.value.images.length;
  currentImageIndex.value = (currentImageIndex.value + 1) % total;
}

onLoad(async () => {
  trackPath('套房详情');
  suites.value = (await getSuites()).data;
});
</script>

<style scoped>
.suite-page {
  background: #f5f5f0;
  min-height: 100vh;
}

.head {
  display: flex;
  align-items: center;
  padding: var(--top-safe-offset) 24rpx 16rpx;
}

.back {
  min-width: 88rpx;
  color: #6b7280;
}

.back-icon {
  width: 36rpx;
  height: 36rpx;
  opacity: 0.8;
}

.head-title {
  font-size: 34rpx;
  color: #111827;
  letter-spacing: 5rpx;
}

.list-wrap {
  padding: 10rpx 24rpx 40rpx;
}

.suite-card {
  background: #fff;
  border: 1rpx solid rgba(17, 24, 39, 0.1);
  margin-bottom: 16rpx;
}

.suite-cover-wrap {
  position: relative;
  height: 320rpx;
}

.suite-cover {
  width: 100%;
  height: 100%;
  opacity: 0.86;
}

.suite-cover-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 22rpx;
  letter-spacing: 3rpx;
  background: rgba(0, 0, 0, 0.2);
}

.suite-body {
  padding: 18rpx;
}

.suite-row {
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
}

.suite-name {
  font-size: 32rpx;
  color: #111827;
}

.suite-feat {
  margin-top: 8rpx;
  font-size: 23rpx;
  color: #6b7280;
  line-height: 1.6;
}

.suite-price {
  font-size: 30rpx;
  color: #111827;
}

.suite-btn {
  margin-top: 14rpx;
  min-height: 78rpx;
  background: #111827;
  color: #fff;
  font-size: 24rpx;
  letter-spacing: 4rpx;
}

.overlay {
  position: fixed;
  inset: 0;
  z-index: 130;
  background: #f5f5f0;
}

.detail-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detail-hero {
  position: relative;
  height: 45vh;
}

.detail-img,
.hero-mask {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero-mask {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.38), rgba(0, 0, 0, 0.16));
}

.close {
  position: absolute;
  left: 20rpx;
  top: var(--top-safe-offset-compact);
  min-width: 90rpx;
  height: 56rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.28);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-icon {
  width: 32rpx;
  height: 32rpx;
  filter: brightness(0) invert(1);
}

.carousel-controls {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 14rpx;
}

.ctrl {
  min-width: 90rpx;
  height: 58rpx;
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10rpx;
}

.ctrl-icon {
  width: 28rpx;
  height: 28rpx;
  filter: brightness(0) invert(1);
}

.indicators {
  position: absolute;
  left: 50%;
  bottom: 24rpx;
  transform: translateX(-50%);
  display: flex;
  gap: 8rpx;
}

.ind {
  height: 4rpx;
  width: 10rpx;
  background: rgba(255, 255, 255, 0.4);
}

.ind.active {
  width: 30rpx;
  background: #fff;
}

.detail-scroll {
  flex: 1;
}

.detail-content {
  padding: 24rpx;
}

.detail-title {
  font-size: 40rpx;
  letter-spacing: 5rpx;
  color: #111827;
}

.detail-tags {
  margin-top: 16rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.tag {
  background: #fff;
  border: 1rpx solid rgba(17, 24, 39, 0.12);
  color: #6b7280;
  font-size: 22rpx;
  padding: 8rpx 14rpx;
}

.detail-price {
  margin-top: 20rpx;
  font-size: 34rpx;
  color: #111827;
}

.detail-desc {
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #6b7280;
  line-height: 1.8;
}

.book-btn {
  margin-top: 24rpx;
  width: 100%;
  min-height: 92rpx;
  background: #111827;
  color: #fff;
  font-size: 28rpx;
  letter-spacing: 4rpx;
}

.slide-in {
  animation: slideIn .3s ease both;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: .5;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
