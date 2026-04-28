<template>
  <div class="console-page">
    <div class="page-header"><h1 class="page-title">流量来源统计</h1></div>
    <div class="card console-panel panel" v-loading="loading">
      <div class="toolbar">
        <span>统计天数</span>
        <el-input-number v-model="days" :min="1" :max="90" :step="1" />
        <el-button type="primary" @click="load">刷新</el-button>
      </div>
      <div class="total">去重总人数：<b>{{ stat.total }}</b></div>
      <div v-for="item in stat.sources" :key="item.sourceChannel" class="source-row">
        <div class="label">{{ item.label }}</div>
        <el-progress :percentage="Number((item.ratio * 100).toFixed(2))" :stroke-width="14" />
        <div class="meta">{{ item.count }} 人 ({{ (item.ratio * 100).toFixed(2) }}%)</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { getTrafficSources } from '@/api/modules/admin-console'

const loading = ref(false)
const days = ref(7)
const stat = reactive({ total: 0, sources: [] as Array<{ sourceChannel: string; label: string; count: number; ratio: number }> })

async function load() {
  loading.value = true
  try {
    const res = await getTrafficSources(days.value)
    stat.total = res.data.total
    stat.sources = res.data.sources
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped lang="scss">
.panel { padding: 16px; }
.toolbar { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
.total { margin-bottom: 10px; }
.source-row { margin-bottom: 12px; }
.label { margin-bottom: 6px; font-weight: 500; }
.meta { margin-top: 4px; color: #6b7280; font-size: 13px; }
</style>
