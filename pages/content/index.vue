<template>
  <view class="page content-page">
    <view class="content-head">
      <view class="title">内容中心</view>
    </view>

    <view class="main-wrap">
      <view class="fortune-card fade-in">
        <view class="fortune-top">
          <view>
            <view class="fortune-title">今日好运签</view>
            <view class="fortune-sub">Daily Fortune</view>
          </view>
          <view class="fortune-date">{{ formatDate(fortune?.date) }}</view>
        </view>
        <view class="fortune-grid">
          <view class="fortune-col">
            <view class="small-label">宜</view>
            <view class="small-text">{{ fortune?.suitable || '放松训练' }}</view>
          </view>
          <view class="divider" />
          <view class="fortune-col">
            <view class="small-label">忌</view>
            <view class="small-text">{{ fortune?.avoid || '焦虑熬夜' }}</view>
          </view>
        </view>
        <view class="fortune-text">{{ typedGreeting }}</view>
      </view>

      <view class="qa-head">
        <view class="line" />
        <text>AI 问答精选</text>
        <view class="line" />
      </view>

      <view class="qa-list">
        <view class="qa-item" v-for="(item, idx) in questions.slice(0, 2)" :key="idx" @click="openQa(item)">
          <text class="qa-q">{{ item.question }}</text>
          <image class="qa-arrow" src="/static/icons/arrow-right.svg" mode="aspectFit" />
        </view>
        <view class="qa-ai" @click="openAIChat">
          <view class="qa-ai-left">AI 专家对话</view>
          <image class="qa-arrow white" src="/static/icons/arrow-right.svg" mode="aspectFit" />
        </view>
      </view>

      <view class="tab-row">
        <view
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          v-for="tab in tabs"
          :key="tab.id"
          @click="switchTab(tab.id)"
        >
          {{ tab.label }}
        </view>
      </view>

      <view class="article-list">
        <view class="article-card reveal" v-for="item in articles" :key="item.id" @click="openArticle(item.id)">
          <view class="cover-wrap">
            <image :src="item.cover" mode="aspectFill" class="cover" />
            <view v-if="item.type === 'video'" class="play">
              <image class="play-icon" src="/static/icons/play.svg" mode="aspectFit" />
            </view>
          </view>
          <view class="article-body">
            <view class="article-title">{{ item.title }}</view>
            <view class="article-meta">{{ item.author }} / Like {{ item.likes }}</view>
          </view>
        </view>
      </view>
    </view>

    <view class="overlay" v-if="selectedQa" @click="selectedQa = null">
      <view class="qa-modal pop-in" @click.stop>
        <view class="modal-close" @click="selectedQa = null">
          <image class="close-icon" src="/static/icons/close.svg" mode="aspectFit" />
        </view>
        <view class="modal-q">{{ selectedQa?.question }}</view>
        <view class="modal-a">{{ selectedQa?.answer }}</view>
        <button class="primary-btn modal-btn" @click="selectedQa = null">知道了</button>
      </view>
    </view>

    <view class="ai-drawer" :class="{ open: isAIChatOpen }">
      <view class="ai-header">
        <view class="ai-title">AI 专家问答</view>
        <view class="modal-close" @click="closeAIChat">
          <image class="close-icon" src="/static/icons/close.svg" mode="aspectFit" />
        </view>
      </view>
      <scroll-view scroll-y class="ai-messages" :scroll-top="scrollTop">
        <view class="msg" :class="m.role" v-for="(m, i) in messages" :key="i">{{ m.text }}</view>
      </scroll-view>
      <view class="ai-preset-row">
        <text class="preset" v-for="(p, i) in presets" :key="i" @click="input = p">{{ p }}</text>
      </view>
      <view class="ai-input-row">
        <input class="ai-input" v-model="input" placeholder="输入你的问题..." confirm-type="send" @confirm="send" />
        <view class="send" @click="send">
          <image class="send-icon" src="/static/icons/send.svg" mode="aspectFit" />
        </view>
      </view>
    </view>

    <BottomNav current="/pages/content/index" />
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import BottomNav from '@/components/BottomNav.vue';
import { getTodayFortune, getPresetQuestions, getArticles } from '@/api/modules/content';
import { createSSEConnection, type SSEEvent } from '@/api/http';
import { getLocalProfile } from '@/store/session';
import { trackPath } from '@/store/session';
import type { ContentItem, FortuneCard, PresetQuestion } from '@/types/domain';

const activeTab = ref('pregnancy');
const tabs = [
  { id: 'pregnancy', label: '孕期' },
  { id: 'postpartum', label: '月子' },
  { id: 'parenting', label: '育儿' },
  { id: 'nanny', label: '月嫂' }
];

const fortune = ref<FortuneCard | null>(null);
const articles = ref<ContentItem[]>([]);
const questions = ref<PresetQuestion[]>([]);
const selectedQa = ref<PresetQuestion | null>(null);
const isAIChatOpen = ref(false);

const typedGreeting = ref('');
let typingTimer: ReturnType<typeof setInterval> | null = null;

const messages = ref<{ role: string; text: string }[]>([]);
const input = ref('');
const scrollTop = ref(0);
const presets = ['剖宫产后多久能做康复？', '新生儿作息怎么建立？', '怎么选月子套餐？'];

let sseConnection: UniApp.RequestTask | null = null;
let currentSessionId: string | null = null;

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length >= 3) {
    return `${parseInt(parts[2])} ${getMonthShort(parts[1])}`;
  }
  return dateStr;
}

function getMonthShort(month: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[parseInt(month) - 1] || month;
}

async function switchTab(tabId: string) {
  activeTab.value = tabId;
  await loadArticles(tabId);
}

async function loadArticles(category: string) {
  try {
    const res = await getArticles(category, 1, 10);
    articles.value = res.data.list;
  } catch (e) {
    console.error('Failed to load articles:', e);
  }
}

function openQa(item: PresetQuestion) {
  selectedQa.value = item;
}

function openArticle(articleId: string) {
  uni.navigateTo({ url: `/pages/content/article?id=${articleId}` });
}

function openAIChat() {
  const profile = getLocalProfile();
  if (!profile.isLoggedIn) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return;
  }
  isAIChatOpen.value = true;
  if (messages.value.length === 0) {
    messages.value = [
      { role: 'ai', text: '你好，我是你的产后照护助手。' },
      { role: 'ai', text: '你可以问我恢复、喂养、情绪或套餐问题。' }
    ];
  }
}

function closeAIChat() {
  isAIChatOpen.value = false;
  if (sseConnection) {
    sseConnection.abort();
    sseConnection = null;
  }
}

function startTyping(greeting: string) {
  typedGreeting.value = '';
  let idx = 0;
  if (typingTimer) {
    clearInterval(typingTimer);
  }
  typingTimer = setInterval(() => {
    if (idx >= greeting.length) {
      if (typingTimer) {
        clearInterval(typingTimer);
      }
      return;
    }
    typedGreeting.value += greeting[idx];
    idx += 1;
  }, 42);
}

async function send() {
  const text = input.value.trim();
  if (!text) return;

  const profile = getLocalProfile();
  if (!profile.isLoggedIn) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return;
  }

  messages.value.push({ role: 'user', text });
  input.value = '';

  const aiMessageIndex = messages.value.length;
  messages.value.push({ role: 'ai', text: '' });

  try {
    const requestData: { sessionId?: string; message: string } = { message: text };
    if (currentSessionId) {
      requestData.sessionId = currentSessionId;
    }

    sseConnection = createSSEConnection({
      url: '/api/v1/ai/chat',
      data: requestData,
      header: { 'X-Uid': profile.uid },
      onEvent: (event: SSEEvent) => {
        handleSSEEvent(event, aiMessageIndex);
      },
      onError: (error) => {
        messages.value[aiMessageIndex].text = '抱歉，连接出现问题，请稍后重试。';
      },
      onComplete: () => {
        sseConnection = null;
      }
    });
  } catch (e) {
    messages.value[aiMessageIndex].text = '抱歉，发送失败，请稍后重试。';
  }
}

function handleSSEEvent(event: SSEEvent, messageIndex: number) {
  switch (event.event) {
    case 'start':
      currentSessionId = event.data.sessionId;
      break;
    case 'delta':
      messages.value[messageIndex].text += event.data.content;
      scrollToBottom();
      break;
    case 'suggestion':
      // 可以在消息末尾添加推荐问题
      break;
    case 'done':
      sseConnection?.abort();
      sseConnection = null;
      break;
    case 'error':
      messages.value[messageIndex].text = `错误: ${event.data.message}`;
      sseConnection?.abort();
      sseConnection = null;
      break;
  }
}

function scrollToBottom() {
  nextTick(() => {
    scrollTop.value = scrollTop.value + 100;
  });
}

onLoad(async () => {
  trackPath('内容中心');
  
  // 并行加载所有数据
  const [fortuneRes, qRes, articlesRes] = await Promise.all([
    getTodayFortune().catch(() => ({ data: null, code: 0, message: '' })),
    getPresetQuestions(2).catch(() => ({ data: [], code: 0, message: '' })),
    getArticles(activeTab.value, 1, 10).catch(() => ({ data: { list: [], total: 0, page: 1, pageSize: 10 }, code: 0, message: '' }))
  ]);
  
  fortune.value = fortuneRes.data;
  questions.value = qRes.data;
  articles.value = articlesRes.data.list;

  if (fortune.value?.greeting) {
    startTyping(fortune.value.greeting);
  } else {
    startTyping('根据你最近浏览路径，建议本周优先关注产后修复课程与夜间喂养节律。');
  }
});

onUnload(() => {
  if (typingTimer) {
    clearInterval(typingTimer);
  }
  if (sseConnection) {
    sseConnection.abort();
  }
});
</script>

<style scoped>
.content-page {
  background: #fff9f9;
}

.content-head {
  padding: calc(var(--top-safe-offset) + 12rpx) 30rpx 10rpx;
}

.title {
  font-size: 50rpx;
  color: #fb7185;
  letter-spacing: 4rpx;
}

.main-wrap {
  padding: 0 26rpx 170rpx;
}

.fortune-card {
  background: #fff1f2;
  border: 1rpx solid #fecdd3;
  border-radius: 30rpx;
  padding: 28rpx;
  margin-bottom: 28rpx;
}

.fortune-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 22rpx;
}

.fortune-title {
  font-size: 48rpx;
  color: #f43f5e;
}

.fortune-sub {
  margin-top: 6rpx;
  color: #fb7185;
  font-size: 28rpx;
  letter-spacing: 2rpx;
}

.fortune-date {
  font-size: 40rpx;
  color: #fb7185;
}

.fortune-grid {
  display: flex;
  gap: 16rpx;
  align-items: stretch;
}

.fortune-col {
  flex: 1;
}

.divider {
  width: 1rpx;
  background: #fda4af;
  opacity: 0.6;
}

.small-label {
  font-size: 28rpx;
  color: #fb7185;
  margin-bottom: 10rpx;
}

.small-text {
  font-size: 28rpx;
  color: #4b5563;
  line-height: 2.4;
}

.fortune-text {
  margin-top: 30rpx;
  min-height: 180rpx;
  font-size: 32rpx;
  line-height: 2.5;
  color: #6b7280;
}

.qa-head {
  display: flex;
  align-items: center;
  gap: 12rpx;
  color: #fb7185;
  font-size: 26rpx;
  letter-spacing: 4rpx;
  margin: 18rpx 0;
}

.line {
  flex: 1;
  height: 1rpx;
  background: #fecdd3;
}

.qa-list {
  display: grid;
  gap: 12rpx;
}

.qa-item,
.qa-ai {
  min-height: 108rpx;
  border-radius: 26rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.qa-item {
  background: #fff;
  border: 1rpx solid #ffe4e6;
}

.qa-ai {
  background: #fb7185;
}

.qa-q,
.qa-ai-left {
  font-size: 29rpx;
  color: #4b5563;
}

.qa-ai-left {
  color: #fff;
}

.qa-arrow {
  width: 18rpx;
  height: 18rpx;
  margin-right: 6rpx;
  opacity: 0.55;
}

.qa-arrow.white {
  opacity: 0.95;
  filter: brightness(0) invert(1);
}

.tab-row {
  margin-top: 22rpx;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;
}

.tab-btn {
  min-height: 82rpx;
  border-radius: 9999rpx;
  background: #fff;
  border: 1rpx solid #ffe4e6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #fb7185;
}

.tab-btn.active {
  background: #fb7185;
  color: #fff;
}

.article-list {
  margin-top: 24rpx;
  display: grid;
  gap: 18rpx;
}

.article-card {
  border-radius: 28rpx;
  overflow: hidden;
  background: #fff;
  border: 1rpx solid #ffe4e6;
}

.cover-wrap {
  position: relative;
  height: 350rpx;
}

.cover {
  width: 100%;
  height: 100%;
}

.play {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  width: 82rpx;
  height: 82rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(6rpx);
}

.play-icon {
  width: 34rpx;
  height: 34rpx;
  filter: brightness(0) invert(1);
}

.article-body {
  padding: 24rpx;
}

.article-title {
  font-size: 30rpx;
  line-height: 1.7;
  color: #1f2937;
}

.article-meta {
  margin-top: 12rpx;
  font-size: 28rpx;
  color: #fb7185;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.36);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx;
  z-index: 120;
}

.qa-modal {
  width: 100%;
  background: #fff;
  border-radius: 30rpx;
  padding: 32rpx;
  position: relative;
}

.modal-close {
  width: 58rpx;
  height: 58rpx;
  border-radius: 50%;
  background: #ffe4e6;
  color: #fb7185;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-icon {
  width: 24rpx;
  height: 24rpx;
}

.qa-modal .modal-close {
  position: absolute;
  right: 22rpx;
  top: 22rpx;
}

.modal-q {
  font-size: 40rpx;
  color: #f43f5e;
  margin: 22rpx 0 16rpx;
  line-height: 1.6;
}

.modal-a {
  font-size: 31rpx;
  line-height: 1.86;
  color: #6b7280;
}

.modal-btn {
  margin-top: 28rpx;
}

.ai-drawer {
  position: fixed;
  inset: 0;
  background: #fff9f9;
  z-index: 140;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}

.ai-drawer.open {
  transform: translateX(0);
}

.ai-header {
  padding: var(--top-safe-offset-compact) 24rpx 14rpx;
  border-bottom: 1rpx solid #fecdd3;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ai-title {
  font-size: 40rpx;
  color: #fb7185;
}

.ai-messages {
  flex: 1;
  padding: 24rpx;
}

.msg {
  max-width: 86%;
  padding: 18rpx 20rpx;
  border-radius: 22rpx;
  font-size: 29rpx;
  line-height: 1.72;
  margin-bottom: 14rpx;
}

.msg.ai {
  background: #fff;
  border: 1rpx solid #ffe4e6;
  color: #4b5563;
}

.msg.user {
  margin-left: auto;
  background: #fb7185;
  color: #fff;
}

.ai-preset-row {
  padding: 8rpx 18rpx;
  display: flex;
  gap: 10rpx;
  overflow-x: auto;
  white-space: nowrap;
}

.preset {
  display: inline-block;
  background: #ffe4e6;
  color: #fb7185;
  border-radius: 9999rpx;
  padding: 10rpx 16rpx;
  font-size: 26rpx;
}

.ai-input-row {
  display: flex;
  gap: 10rpx;
  padding: 14rpx 18rpx calc(18rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #fecdd3;
}

.ai-input {
  flex: 1;
  min-height: 78rpx;
  border-radius: 18rpx;
  background: #fff;
  border: 1rpx solid #fecdd3;
  padding: 0 18rpx;
  font-size: 29rpx;
}

.send {
  width: 78rpx;
  height: 78rpx;
  border-radius: 18rpx;
  background: #fb7185;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-icon {
  width: 30rpx;
  height: 30rpx;
  filter: brightness(0) invert(1);
}

.fade-in {
  animation: fadeIn 0.5s ease both;
}

.reveal {
  animation: rise 0.55s ease both;
}

.pop-in {
  animation: popIn 0.22s ease both;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes rise {
  from { opacity: 0; transform: translateY(14rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
</style>