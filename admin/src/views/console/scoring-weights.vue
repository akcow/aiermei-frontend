<template>
  <div class="console-page scoring-page">
    <div class="page-header"><h1 class="page-title">评分权重</h1></div>

    <div class="card console-panel panel" v-loading="loading">
      <div class="tip">建议：请将三项权重总和保持为 100，便于统一评估标准与运营复盘。</div>

      <div class="weight-row">
        <div class="weight-label">转化意向</div>
        <el-slider v-model="form.conversionIntent" :min="0" :max="100" :step="1" show-stops />
        <el-input-number v-model="form.conversionIntent" :min="0" :max="100" :step="1" />
      </div>

      <div class="weight-row">
        <div class="weight-label">消费能力</div>
        <el-slider v-model="form.spendingPower" :min="0" :max="100" :step="1" show-stops />
        <el-input-number v-model="form.spendingPower" :min="0" :max="100" :step="1" />
      </div>

      <div class="weight-row">
        <div class="weight-label">近期活跃度</div>
        <el-slider v-model="form.recentActivity" :min="0" :max="100" :step="1" show-stops />
        <el-input-number v-model="form.recentActivity" :min="0" :max="100" :step="1" />
      </div>

      <div class="summary">当前总和: <b :style="{ color: total === 100 ? '#16a34a' : '#dc2626' }">{{ total }}</b> / 100</div>
      <div class="meta">最近更新：{{ meta.updatedAt || '-' }} / {{ meta.updatedBy || '-' }}</div>
      <el-button type="primary" size="large" :disabled="total !== 100" :loading="saving" @click="save">保存权重</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getScoringWeights, updateScoringWeights } from '@/api/modules/admin-console'

const loading = ref(false)
const saving = ref(false)
const form = reactive({ conversionIntent: 50, spendingPower: 30, recentActivity: 20 })
const meta = reactive({ updatedAt: '', updatedBy: '' })
const total = computed(() => Number(form.conversionIntent) + Number(form.spendingPower) + Number(form.recentActivity))

async function load() {
  loading.value = true
  try {
    const res = await getScoringWeights()
    Object.assign(form, {
      conversionIntent: res.data.conversionIntent,
      spendingPower: res.data.spendingPower,
      recentActivity: res.data.recentActivity
    })
    meta.updatedAt = res.data.updatedAt
    meta.updatedBy = res.data.updatedBy
  } finally {
    loading.value = false
  }
}

async function save() {
  if (total.value !== 100) {
    ElMessage.warning('三项总和必须为 100')
    return
  }
  saving.value = true
  try {
    const res = await updateScoringWeights(form)
    meta.updatedAt = res.data.updatedAt
    meta.updatedBy = res.data.updatedBy
    ElMessage.success('保存成功')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped lang="scss">
.scoring-page {
  display: flex;
  flex-direction: column;
}

.panel {
  padding: 26px 28px;
  width: min(980px, 100%);
  margin: 40px auto 0;
  border-radius: 16px;
}

.tip {
  color: #6b7280;
  font-size: 13px;
  margin-bottom: 18px;
}

.weight-row {
  display: grid;
  grid-template-columns: 110px 1fr 128px;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
}

.weight-label {
  color: #111827;
  font-weight: 600;
}

:deep(.el-slider__runway) {
  margin: 0;
}

.summary {
  margin: 14px 0 8px;
  font-size: 22px;
  font-weight: 600;
}

.meta {
  margin-bottom: 18px;
  color: #6b7280;
  font-size: 14px;
}

@media (max-width: 900px) {
  .panel { padding: 18px; }
  .weight-row {
    grid-template-columns: 1fr;
    gap: 10px;
    margin-bottom: 16px;
  }
}
</style>
