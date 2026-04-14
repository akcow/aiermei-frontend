<template>
  <view class="page sub-page">
    <view class="head">
      <view class="back" @click="goBack">
        <image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit" />
      </view>
      <view class="head-title">{{ title }}</view>
    </view>

    <view class="body" v-if="type === 'evaluation'">
      <view class="card center">
        <view class="tip">Rate this service</view>
        <view class="stars">
          <text class="star" :class="{ on: index <= rating }" v-for="index in 5" :key="index" @click="rating = index">*</text>
        </view>
      </view>
      <view class="card">
        <view class="tip">Comment</view>
        <textarea class="textarea" v-model="content" placeholder="Leave your feedback..." />
      </view>
      <button class="submit" :class="{ disabled: rating === 0 }" @click="submitEvaluationAction">Submit</button>
      <view class="done" v-if="submitted">Submitted successfully</view>
    </view>

    <view class="body" v-else-if="type === 'hotline'">
      <view class="card hotline" v-for="item in hotlineListData" :key="item.number">
        <view>
          <view class="tip">{{ item.label }}</view>
          <view class="hotline-number">{{ item.number }}</view>
        </view>
        <view class="call" @click="call(item.number)">
          <image class="call-icon" src="/static/icons/phone.svg" mode="aspectFit" />
        </view>
      </view>
      <view class="card center" v-if="serviceQrCodeUrl">
        <view class="tip">Service QR Code</view>
        <image class="qr" :src="serviceQrCodeUrl" mode="aspectFill" />
        <view class="a">{{ serviceQrTips }}</view>
      </view>
    </view>

    <view class="body faq-body" v-else-if="type === 'faq'">
      <view v-if="!faqCategory">
        <view class="faq-entry" v-for="item in faqCategories" :key="item.id" @click="openFaqCategory(item.id)">
          <view class="faq-entry-text">{{ item.name }}</view>
          <image class="faq-entry-arrow" src="/static/icons/arrow-right.svg" mode="aspectFit" />
        </view>
      </view>
      <view v-else>
        <view class="faq-back" @click="faqCategory = ''">
          <image class="faq-back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit" />
          <text>{{ currentFaqCategoryName }}</text>
        </view>
        <view class="faq-item" v-for="(item, idx) in currentFaqQuestions" :key="item.id" @click="toggleFaq(idx)">
          <view class="faq-header">
            <view class="faq-q">{{ item.title }}</view>
            <image class="faq-arrow" :class="{ expanded: expandedFaq === idx }" src="/static/icons/arrow-down.svg" mode="aspectFit" />
          </view>
          <view class="faq-a" v-if="expandedFaq === idx">{{ item.content }}</view>
        </view>
      </view>
    </view>

    <view class="body" v-else-if="type === 'package'">
      <view class="card package" v-for="item in suites" :key="item.id" @click="openSuite(item.id)">
        <image :src="item.images[0]" class="pkg-cover" mode="aspectFill" />
        <view class="pkg-title">{{ item.name }}</view>
        <view class="pkg-desc">{{ item.size }} / {{ item.features.join(' | ') }}</view>
        <view class="pkg-price">{{ item.price || item.priceLabel || '--' }}</view>
      </view>
    </view>

    <view class="body" v-else-if="type === 'coupon'">
      <view class="card coupon" v-for="item in coupons" :key="item.id">
        <view class="left-bar" :class="{ off: item.status !== 'AVAILABLE' }" />
        <view>
          <view class="q">{{ item.name }}</view>
          <view class="a">Expires {{ item.expiry }}</view>
        </view>
        <view class="coupon-right">
          <view class="coupon-money">{{ item.valueLabel || item.value || '--' }}</view>
          <view class="coupon-state" :class="{ off: item.status !== 'AVAILABLE' }">{{ item.status }}</view>
        </view>
      </view>
    </view>

    <view class="body" v-else-if="type === 'postpartum'">
      <view class="card service" v-for="item in services" :key="item.id">
        <view class="row-between">
          <view class="q">{{ item.name }}</view>
          <view class="status">{{ item.status }}</view>
        </view>
        <view class="a">{{ item.expert }} / {{ item.time }}</view>
      </view>
    </view>

    <view class="body" v-else-if="type === 'complaint'">
      <view class="card">
        <view class="tip">Complaint Type</view>
        <view class="type-grid">
          <view
            class="type-item"
            :class="{ active: complaintType === t.value }"
            v-for="t in complaintOptions"
            :key="t.value"
            @click="complaintType = t.value"
          >
            {{ t.label }}
          </view>
        </view>
      </view>
      <view class="card">
        <view class="tip">Description</view>
        <textarea class="textarea" v-model="content" placeholder="Describe your issue..." />
      </view>
      <button class="submit" :class="{ disabled: !content.trim() }" @click="submitComplaintAction">Submit</button>
      <view class="done" v-if="submitted">Submitted successfully</view>
    </view>

    <view class="body" v-else>
      <view class="card center">Page under construction</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getSuites } from '@/api/modules/center';
import {
  getFaqCategories,
  getFaqItems,
  getMemberCoupons,
  getPostpartumServices,
  getServiceHotlines,
  submitComplaint,
  submitEvaluation
} from '@/api/modules/member';
import { hotlineList } from '@/mock/data';
import { trackPath } from '@/store/session';
import type { Coupon, FaqCategory, FaqItem, HotlineInfo, PostpartumService, Suite } from '@/types/domain';

const type = ref('evaluation');
const rating = ref(0);
const content = ref('');
const submitted = ref(false);

const complaintOptions = [
  { label: 'Service Quality', value: 'SERVICE_QUALITY' as const },
  { label: 'Facility Environment', value: 'FACILITY_ENVIRONMENT' as const },
  { label: 'Catering Suggestion', value: 'CATERING_SUGGESTION' as const },
  { label: 'Other', value: 'OTHER' as const }
];
const complaintType = ref<(typeof complaintOptions)[number]['value']>(complaintOptions[0].value);

const faqCategories = ref<FaqCategory[]>([]);
const faqMap = ref<Record<string, FaqItem[]>>({});
const faqCategory = ref('');
const expandedFaq = ref<number | null>(null);

const suites = ref<Suite[]>([]);
const coupons = ref<Coupon[]>([]);
const services = ref<PostpartumService[]>([]);
const hotlineListData = ref<HotlineInfo[]>(hotlineList);
const serviceQrCodeUrl = ref('');
const serviceQrTips = ref('');

const titleMap: Record<string, string> = {
  evaluation: 'Service Evaluation',
  faq: 'FAQ',
  package: 'Packages',
  hotline: 'Hotline',
  coupon: 'Coupons',
  postpartum: 'Postpartum Services',
  complaint: 'Complaint'
};

const title = computed(() => titleMap[type.value] || 'Detail');
const currentFaqQuestions = computed(() => faqMap.value[faqCategory.value] || []);
const currentFaqCategoryName = computed(
  () => faqCategories.value.find((item) => item.id === faqCategory.value)?.name || 'FAQ'
);

function goBack() {
  uni.navigateBack();
}

async function submitEvaluationAction() {
  if (rating.value === 0) {
    return;
  }
  await submitEvaluation({
    score: rating.value,
    content: content.value || `score ${rating.value}`
  });
  submitted.value = true;
}

async function submitComplaintAction() {
  if (!content.value.trim()) {
    return;
  }
  await submitComplaint({
    complaintType: complaintType.value,
    content: content.value
  });
  submitted.value = true;
}

function call(phone: string) {
  uni.makePhoneCall({ phoneNumber: phone.replace(/-/g, '') });
}

function openSuite(id: string) {
  uni.navigateTo({ url: `/pages/suite-details/index?id=${id}` });
}

function toggleFaq(idx: number) {
  expandedFaq.value = expandedFaq.value === idx ? null : idx;
}

async function openFaqCategory(categoryId: string) {
  faqCategory.value = categoryId;
  expandedFaq.value = null;
  if (faqMap.value[categoryId]) {
    return;
  }
  const res = await getFaqItems(categoryId);
  faqMap.value = {
    ...faqMap.value,
    [categoryId]: res.data
  };
}

async function loadByType() {
  if (type.value === 'faq') {
    const categoriesRes = await getFaqCategories();
    faqCategories.value = categoriesRes.data;
  }
  if (type.value === 'package') {
    suites.value = (await getSuites()).data;
  }
  if (type.value === 'coupon') {
    coupons.value = (await getMemberCoupons()).data;
  }
  if (type.value === 'postpartum') {
    services.value = (await getPostpartumServices()).data;
  }
  if (type.value === 'hotline') {
    try {
      const response = await getServiceHotlines();
      hotlineListData.value = response.data.hotlines || hotlineListData.value;
      serviceQrCodeUrl.value = response.data.serviceQrCodeUrl || '';
      serviceQrTips.value = response.data.serviceQrTips || '';
    } catch {
      hotlineListData.value = hotlineList;
    }
  }
}

onLoad(async (query) => {
  type.value = String(query.id || 'evaluation');
  trackPath(`member-sub:${type.value}`);
  try {
    await loadByType();
  } catch {
    uni.showToast({ title: 'Data load failed', icon: 'none' });
  }
});
</script>

<style scoped>
.sub-page {
  background: #f5f5f0;
  min-height: 100vh;
}

.head {
  display: flex;
  align-items: center;
  padding: var(--top-safe-offset) 24rpx 16rpx;
  gap: 8rpx;
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
  font-size: 34rpx;
  letter-spacing: 3rpx;
  color: #111827;
}

.body {
  padding: 10rpx 24rpx 60rpx;
}

.card {
  position: relative;
  background: #fff;
  border: 1rpx solid rgba(17, 24, 39, 0.1);
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.card.center {
  text-align: center;
}

.tip {
  color: #9ca3af;
  font-size: 22rpx;
  margin-bottom: 10rpx;
}

.stars {
  display: flex;
  justify-content: center;
  gap: 12rpx;
}

.star {
  font-size: 58rpx;
  color: #e5e7eb;
}

.star.on {
  color: #111827;
}

.textarea {
  width: 100%;
  min-height: 220rpx;
  font-size: 27rpx;
  line-height: 1.75;
}

.submit {
  width: 100%;
  min-height: 94rpx;
  background: #111827;
  color: #fff;
  font-size: 28rpx;
}

.submit.disabled {
  opacity: 0.35;
}

.done {
  margin-top: 16rpx;
  text-align: center;
  color: #6b7280;
  font-size: 24rpx;
}

.hotline {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hotline-number {
  font-size: 36rpx;
  color: #111827;
}

.call {
  width: 74rpx;
  height: 74rpx;
  background: #111827;
  display: flex;
  align-items: center;
  justify-content: center;
}

.call-icon {
  width: 28rpx;
  height: 28rpx;
  filter: brightness(0) invert(1);
}

.qr {
  width: 360rpx;
  height: 360rpx;
}

.q {
  font-size: 28rpx;
  color: #1f2937;
}

.a {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #6b7280;
  line-height: 1.6;
}

.package {
  overflow: hidden;
}

.pkg-cover {
  width: 100%;
  height: 320rpx;
  margin-bottom: 12rpx;
}

.pkg-title {
  font-size: 32rpx;
  color: #111827;
}

.pkg-desc {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #6b7280;
  line-height: 1.6;
}

.pkg-price {
  margin-top: 10rpx;
  font-size: 30rpx;
  color: #111827;
}

.coupon {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 28rpx;
}

.left-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 8rpx;
  background: #111827;
}

.left-bar.off {
  background: #d1d5db;
}

.coupon-right {
  text-align: right;
}

.coupon-money {
  font-size: 36rpx;
  color: #111827;
}

.coupon-state {
  margin-top: 6rpx;
  font-size: 20rpx;
  border: 1rpx solid rgba(17, 24, 39, 0.15);
  padding: 4rpx 10rpx;
  display: inline-block;
}

.coupon-state.off {
  color: #9ca3af;
  border-color: #e5e7eb;
}

.service .row-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status {
  font-size: 22rpx;
  color: #111827;
  border: 1rpx solid rgba(17, 24, 39, 0.15);
  padding: 6rpx 12rpx;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10rpx;
}

.type-item {
  min-height: 74rpx;
  border: 1rpx solid rgba(17, 24, 39, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #6b7280;
}

.type-item.active {
  background: #111827;
  color: #fff;
  border-color: #111827;
}

.faq-item {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  overflow: hidden;
}

.faq-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
}

.faq-q {
  font-size: 30rpx;
  color: #333;
}

.faq-arrow {
  width: 24rpx;
  height: 24rpx;
  opacity: 0.5;
  transition: transform 0.3s ease;
}

.faq-arrow.expanded {
  transform: rotate(180deg);
}

.faq-a {
  padding: 0 32rpx 28rpx;
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
}

.faq-body {
  padding-top: 40rpx;
}

.faq-entry {
  background: #fff;
  border-radius: 16rpx;
  padding: 36rpx 32rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.faq-entry-text {
  font-size: 32rpx;
  color: #333;
}

.faq-entry-arrow {
  width: 24rpx;
  height: 24rpx;
  opacity: 0.4;
}

.faq-back {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 20rpx 0 30rpx;
  font-size: 30rpx;
  color: #666;
}

.faq-back-icon {
  width: 24rpx;
  height: 24rpx;
  opacity: 0.6;
}
</style>
