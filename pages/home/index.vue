<template>
  <view class="page home-page">
    <swiper class="hero" :autoplay="true" :interval="5000" :duration="500" circular indicator-dots indicator-color="rgba(255,255,255,.25)" indicator-active-color="#fff">
      <swiper-item v-for="item in banners" :key="item.id">
        <view class="hero-item" @click="openPoster(item.id)">
          <image :src="item.image" mode="aspectFill" class="hero-image" />
          <view class="mask" />
          <view class="hero-content">
            <view class="brand">AI ER MEI</view>
            <view class="title">{{ item.title }}</view>
            <view class="cta">{{ item.buttonText }}</view>
          </view>
        </view>
      </swiper-item>
    </swiper>

    <BottomNav current="/pages/home/index" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import BottomNav from '@/components/BottomNav.vue';
import { getBanners } from '@/api/modules/center';
import { trackPath } from '@/store/session';
import type { Banner } from '@/types/domain';

const banners = ref<Banner[]>([]);

function openPoster(id: string) {
  trackPath(`海报:${id}`);
  uni.navigateTo({ url: `/pages/poster/detail?id=${id}` });
}

async function loadData() {
  const res = await getBanners();
  banners.value = res.data;
}

onLoad(() => {
  trackPath('首页');
  loadData();
});
</script>

<style scoped>
.home-page {
  padding-bottom: 0;
}

.hero {
  height: 100vh;
}

.hero-item,
.hero-image,
.mask {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.mask {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.45));
}

.hero-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-align: center;
  padding: 0 72rpx;
}

.brand {
  position: absolute;
  top: var(--top-safe-offset);
  left: 48rpx;
  font-size: 44rpx;
  letter-spacing: 6rpx;
}

.title {
  font-size: 52rpx;
  line-height: 1.7;
  letter-spacing: 4rpx;
  margin-bottom: 80rpx;
}

.cta {
  border: 1rpx solid rgba(255, 255, 255, 0.4);
  padding: 26rpx 68rpx;
  font-size: 30rpx;
  letter-spacing: 4rpx;
  backdrop-filter: blur(6rpx);
}
</style>
