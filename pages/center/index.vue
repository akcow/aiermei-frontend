<template>
  <view class="page center-page">
    <view class="hero">
      <image class="hero-image" :src="heroImage" mode="aspectFill" />
      <view class="hero-mask" />
      <view class="hero-inner fade-up">
        <view class="hero-brand">{{ brandTitle }}</view>
        <view class="hero-sub">{{ brandSubtitle }}</view>
      </view>
      <view class="scroll-hint bounce">
        <image class="hint-icon" src="/static/icons/arrow-down.svg" mode="aspectFit" />
      </view>
    </view>

    <view class="floating-sections">
      <scroll-view scroll-x class="section-scroll" enhanced show-scrollbar="false">
        <view class="section-row">
          <view class="section-card-item reveal" v-for="item in sections" :key="item.id" @click="openSection(item.id)">
            <image :src="item.coverImage" mode="aspectFill" class="section-image" />
            <view class="section-overlay" />
            <view class="section-meta">
              <view class="section-title-text">{{ item.title }}</view>
              <view class="section-desc">{{ item.desc }}</view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="content-wrap">
      <view class="split-title">
        <view class="line" />
        <text>Core Services</text>
        <view class="line" />
      </view>

      <view class="facility-block reveal" v-for="item in facilities" :key="item.id || item.title">
        <image :src="item.image" mode="aspectFill" class="facility-image" />
        <view class="facility-title">{{ item.title }}</view>
        <view class="facility-desc">{{ item.desc }}</view>
      </view>

      <view class="split-title suite-head">
        <view class="line" />
        <text>Suites</text>
        <view class="line" />
      </view>

      <view class="suite-list">
        <view class="suite-row reveal" v-for="item in suites" :key="item.id" @click="openSuite(item.id)">
          <image :src="item.images[0]" class="suite-thumb" mode="aspectFill" />
          <view class="suite-info">
            <view class="suite-name">{{ item.name }}</view>
            <view class="suite-price">{{ item.price || item.priceLabel || '--' }}</view>
            <view class="suite-feat">{{ item.features.slice(0, 2).join(' / ') }}</view>
          </view>
          <image class="arrow" src="/static/icons/arrow-right.svg" mode="aspectFit" />
        </view>
      </view>
    </view>

    <BottomNav current="/pages/center/index" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import BottomNav from '@/components/BottomNav.vue';
import { getCenterHome, getCenterSections, getSuites } from '@/api/modules/center';
import { trackPath } from '@/store/session';
import type { CenterSection, Facility, Suite } from '@/types/domain';

const heroImage = ref('https://picsum.photos/seed/storefront/1080/1920');
const brandTitle = ref('AI ER MEI');
const brandSubtitle = ref('RESIDENCES');
const sections = ref<CenterSection[]>([]);
const facilities = ref<Facility[]>([]);
const suites = ref<Suite[]>([]);

function openSection(id: string) {
  trackPath(`center-section:${id}`);
  uni.navigateTo({ url: `/pages/center/detail?id=${id}` });
}

function openSuite(id: string) {
  trackPath(`suite:${id}`);
  uni.navigateTo({ url: `/pages/suite-details/index?id=${id}` });
}

onLoad(async () => {
  trackPath('center-home');
  try {
    const [homeRes, sectionRes, suiteRes] = await Promise.all([
      getCenterHome(),
      getCenterSections(),
      getSuites()
    ]);
    heroImage.value = homeRes.data.heroImage || heroImage.value;
    brandTitle.value = homeRes.data.brandTitle || brandTitle.value;
    brandSubtitle.value = homeRes.data.brandSubtitle || brandSubtitle.value;
    facilities.value = homeRes.data.facilities || [];
    sections.value = sectionRes.data || [];
    suites.value = suiteRes.data || [];
  } catch {
    uni.showToast({ title: 'Center load failed', icon: 'none' });
  }
});
</script>

<style scoped>
.center-page {
  background: #f5f5f0;
}

.hero {
  position: relative;
  height: 75vh;
  overflow: hidden;
}

.hero-image,
.hero-mask {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero-mask {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.55));
}

.hero-inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.hero-brand {
  font-size: 70rpx;
  letter-spacing: 12rpx;
}

.hero-sub {
  font-size: 44rpx;
  letter-spacing: 8rpx;
  opacity: 0.9;
  margin-top: 10rpx;
}

.scroll-hint {
  position: absolute;
  left: 50%;
  bottom: 42rpx;
  transform: translateX(-50%);
}

.hint-icon {
  width: 34rpx;
  height: 34rpx;
  filter: brightness(0) invert(1);
  opacity: 0.75;
}

.floating-sections {
  margin-top: -130rpx;
  position: relative;
  z-index: 4;
  margin-bottom: 42rpx;
}

.section-scroll {
  white-space: nowrap;
}

.section-row {
  display: flex;
  gap: 24rpx;
  padding: 0 30rpx;
}

.section-card-item {
  width: 520rpx;
  height: 760rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(10rpx);
  padding: 8rpx;
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
}

.section-image,
.section-overlay {
  position: absolute;
  inset: 8rpx;
  width: calc(100% - 16rpx);
  height: calc(100% - 16rpx);
}

.section-overlay {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.88), rgba(0, 0, 0, 0.08));
}

.section-meta {
  position: absolute;
  left: 34rpx;
  right: 34rpx;
  bottom: 34rpx;
  color: #fff;
}

.section-title-text {
  font-size: 42rpx;
  letter-spacing: 4rpx;
  margin-bottom: 12rpx;
}

.section-desc {
  font-size: 24rpx;
  line-height: 1.7;
  opacity: 0.78;
}

.content-wrap {
  padding: 0 30rpx 180rpx;
}

.split-title {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 28rpx;
  color: #9ca3af;
  font-size: 28rpx;
  letter-spacing: 6rpx;
}

.suite-head {
  margin-top: 40rpx;
}

.line {
  flex: 1;
  height: 1rpx;
  background: rgba(17, 24, 39, 0.15);
}

.facility-block {
  margin-bottom: 36rpx;
}

.facility-image {
  width: 100%;
  height: 320rpx;
  margin-bottom: 18rpx;
  opacity: 0.9;
}

.facility-title {
  font-size: 38rpx;
  letter-spacing: 3rpx;
  margin-bottom: 8rpx;
  color: #111827;
}

.facility-desc {
  font-size: 25rpx;
  line-height: 1.75;
  color: #6b7280;
}

.suite-row {
  display: flex;
  align-items: center;
  padding: 18rpx;
  border: 1rpx solid rgba(17, 24, 39, 0.1);
  background: rgba(255, 255, 255, 0.65);
  margin-bottom: 16rpx;
}

.suite-thumb {
  width: 132rpx;
  height: 132rpx;
  margin-right: 18rpx;
}

.suite-info {
  flex: 1;
}

.suite-name {
  font-size: 34rpx;
  letter-spacing: 2rpx;
}

.suite-price {
  font-size: 29rpx;
  color: #4b5563;
  margin-top: 6rpx;
}

.suite-feat {
  font-size: 23rpx;
  color: #9ca3af;
  margin-top: 8rpx;
  line-height: 1.6;
}

.arrow {
  width: 18rpx;
  height: 18rpx;
  opacity: 0.45;
  margin-right: 8rpx;
}

.fade-up {
  animation: fadeUp 0.8s ease both;
}

.reveal {
  animation: reveal 0.8s ease both;
}

.bounce {
  animation: bounceY 1.8s ease-in-out infinite;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(24rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(18rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounceY {
  0%,
  100% {
    transform: translate(-50%, 0);
  }
  50% {
    transform: translate(-50%, 10rpx);
  }
}
</style>
