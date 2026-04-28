<template>
  <div class="console-page">
    <div class="page-header">
      <h1 class="page-title">标签审批池</h1>
    </div>

    <div class="card console-panel panel">
      <div class="toolbar">
        <el-select v-model="query.status" clearable placeholder="状态" style="width: 150px" @change="loadList">
          <el-option label="待审批" value="PENDING" />
          <el-option label="已通过" value="APPROVED" />
          <el-option label="已拒绝" value="REJECTED" />
          <el-option label="已并入" value="MERGED" />
        </el-select>
        <el-input v-model="query.keyword" clearable placeholder="标签名/编码" style="width: 220px" @keyup.enter="loadList" />
        <el-button type="primary" @click="loadList">查询</el-button>
      </div>

      <el-table :data="list" v-loading="loading">
        <el-table-column prop="tagName" label="标签名" min-width="180" />
        <el-table-column prop="tagCode" label="标签编码" min-width="200" />
        <el-table-column prop="mentionCount" label="提及数" width="100" />
        <el-table-column prop="status" label="状态" width="120" />
        <el-table-column prop="lastSeenAt" label="最后出现" min-width="180" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row.pendingId)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.pageSize"
        :total="total"
        layout="total, prev, pager, next, sizes"
        @current-change="loadList"
        @size-change="loadList"
      />
    </div>

    <el-drawer v-model="drawerVisible" title="审批详情" size="60%" destroy-on-close>
      <template v-if="detail">
        <div class="detail-grid">
          <div><b>标签:</b> {{ detail.tagName }} ({{ detail.tagCode }})</div>
          <div><b>AI原因:</b> {{ detail.aiReason || '-' }}</div>
          <div><b>候选数:</b> {{ detail.candidateCount }}</div>
        </div>

        <el-table :data="detail.candidates" size="small" style="margin-top: 12px">
          <el-table-column prop="rankNo" label="排名" width="70" />
          <el-table-column prop="tagName" label="候选标签" />
          <el-table-column prop="tagCode" label="编码" />
          <el-table-column prop="similarity" label="相似度" width="120" />
        </el-table>

        <h4 style="margin:16px 0 8px">提及明细</h4>
        <el-table :data="mentions" v-loading="mentionsLoading" size="small">
          <el-table-column prop="uid" label="UID" min-width="180" />
          <el-table-column prop="sourceType" label="来源" width="120" />
          <el-table-column prop="sourceContext" label="上下文" min-width="220" show-overflow-tooltip />
          <el-table-column prop="createdAt" label="时间" min-width="180" />
        </el-table>

        <div class="actions">
          <el-select v-model="reviewAction" style="width: 140px">
            <el-option label="通过" value="APPROVE" />
            <el-option label="拒绝" value="REJECT" />
            <el-option label="并入" value="MERGE" />
          </el-select>
          <el-select v-if="reviewAction === 'MERGE'" v-model="targetTagCode" style="width: 240px" placeholder="选择合并目标">
            <el-option v-for="item in detail.candidates" :key="item.tagCode" :label="`${item.tagName} (${item.tagCode})`" :value="item.tagCode" />
          </el-select>
          <el-input v-model="reviewDescription" style="width: 220px" placeholder="备注（可选）" />
          <el-button type="primary" :loading="reviewing" @click="submitReview">提交审批</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getTagMentions,
  getTagPendingDetail,
  getTagPendingList,
  reviewTagPending
} from '@/api/modules/admin-console'
import type { TagMention, TagPendingDetail, TagPendingItem } from '@/types'

const loading = ref(false)
const list = ref<TagPendingItem[]>([])
const total = ref(0)
const query = ref({ status: 'PENDING', keyword: '', page: 1, pageSize: 20 })

const drawerVisible = ref(false)
const detail = ref<TagPendingDetail | null>(null)
const mentions = ref<TagMention[]>([])
const mentionsLoading = ref(false)
const reviewAction = ref<'APPROVE' | 'REJECT' | 'MERGE'>('APPROVE')
const targetTagCode = ref('')
const reviewDescription = ref('')
const reviewing = ref(false)

async function loadList() {
  loading.value = true
  try {
    const res = await getTagPendingList(query.value)
    list.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

async function openDetail(pendingId: string) {
  drawerVisible.value = true
  const [detailRes, mentionRes] = await Promise.all([
    getTagPendingDetail(pendingId),
    getTagMentions(pendingId, { page: 1, pageSize: 20 })
  ])
  detail.value = detailRes.data
  mentions.value = mentionRes.data.list
  reviewAction.value = 'APPROVE'
  targetTagCode.value = detail.value.candidates[0]?.tagCode || ''
  reviewDescription.value = ''
}

async function submitReview() {
  if (!detail.value) return
  if (reviewAction.value === 'MERGE' && !targetTagCode.value) {
    ElMessage.warning('并入操作需要选择目标标签')
    return
  }

  reviewing.value = true
  try {
    await reviewTagPending(detail.value.pendingId, {
      action: reviewAction.value,
      targetTagCode: reviewAction.value === 'MERGE' ? targetTagCode.value : undefined,
      description: reviewDescription.value || undefined
    })
    ElMessage.success('审批已提交')
    drawerVisible.value = false
    await loadList()
  } finally {
    reviewing.value = false
  }
}

onMounted(loadList)
</script>

<style scoped lang="scss">
.panel { padding: 16px; }
.toolbar { display: flex; gap: 10px; margin-bottom: 12px; }
.detail-grid { display: grid; gap: 8px; }
.actions { display: flex; gap: 10px; margin-top: 14px; align-items: center; flex-wrap: wrap; }
</style>
