<template>
  <div class="users-page">
    <div class="page-header">
      <h1 class="page-title">客户管理</h1>
    </div>

    <div class="card search-bar">
      <el-form :inline="true">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="姓名或手机号" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="card">
      <el-table :data="users" v-loading="loading" style="width: 100%">
        <el-table-column label="用户" min-width="220">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="36" :src="row.avatar">{{ row.name?.charAt(0) }}</el-avatar>
              <div>
                <div>{{ row.name }}</div>
                <div class="muted">{{ row.phone || '-' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="会员等级" width="120">
          <template #default="{ row }">
            <el-tag :type="getMemberType(row.memberLevel)" size="small">{{ getMemberLabel(row.memberLevel) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="标签" min-width="220">
          <template #default="{ row }">
            <div class="tag-list">
              <el-tag
                v-for="(tag, index) in row.tags.slice(0, 3)"
                :key="getTagKey(tag, index)"
                size="small"
                type="info"
              >
                {{ getTagName(tag) }}
              </el-tag>
              <span v-if="row.tags.length > 3" class="muted">+{{ row.tags.length - 3 }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="最近活跃" width="170">
          <template #default="{ row }">{{ formatDate(row.lastActive) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="showUserDetail(row)">详情</el-button>
            <el-button type="primary" link @click="handleAnalyzeUser(row)">分析</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="loadUsers"
        @current-change="loadUsers"
      />
    </div>

    <el-drawer v-model="drawerVisible" title="客户详情" direction="rtl" size="520px">
      <template v-if="selectedUser">
        <div class="profile-block">
          <el-avatar :size="60" :src="selectedUser.avatar">{{ selectedUser.name?.charAt(0) }}</el-avatar>
          <div>
            <div class="profile-name">{{ selectedUser.name }}</div>
            <div class="muted">{{ selectedUser.phone || '-' }}</div>
          </div>
        </div>

        <el-divider content-position="left">行为路径</el-divider>
        <div class="path-list">
          <div v-for="(item, index) in userJourney.paths" :key="`${item.path}-${index}`" class="path-item">
            <span>{{ item.path }}</span>
            <span class="muted">{{ formatDate(item.timestamp) }}</span>
          </div>
        </div>

        <el-divider content-position="left">AI 分析</el-divider>
        <div class="tag-list">
          <el-tag v-for="tag in analysisTagNames" :key="tag" type="primary" size="small">{{ tag }}</el-tag>
        </div>
        <div class="analysis-script">{{ analysisResult.script || '-' }}</div>
        <el-button type="primary" size="small" @click="refreshAnalysis">重新分析</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import { analyzeUser as analyzeUserApi, getCustomerDetail, getCustomers, getUserJourney } from '@/api/modules/auth'
import type { AnalysisResult, Customer, TagItem, UserJourney } from '@/types'

const loading = ref(false)
const users = ref<Customer[]>([])
const drawerVisible = ref(false)
const selectedUser = ref<Customer | null>(null)
const userJourney = ref<UserJourney>({ uid: '', paths: [], tags: [], lastActive: '' })
const analysisResult = ref<AnalysisResult>({ tags: [], script: '' })

const searchForm = reactive({ keyword: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const analysisTagNames = computed(() => {
  if (analysisResult.value.tags.length > 0) return analysisResult.value.tags
  const merged: TagItem[] = [
    ...(analysisResult.value.concerns ?? []),
    ...(analysisResult.value.anxieties ?? []),
    ...(analysisResult.value.behaviors ?? [])
  ]
  return merged.map((item) => normalizeTagName(item)).filter(Boolean)
})

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

function getMemberType(level: string) {
  const map: Record<string, string> = { normal: 'info', gold: 'warning', diamond: 'success' }
  return map[level] || 'info'
}

function getMemberLabel(level: string) {
  const map: Record<string, string> = { normal: '普通会员', gold: '黄金会员', diamond: '钻石会员' }
  return map[level] || level
}

function getTagName(tag: Customer['tags'][number]) {
  return normalizeTagName(tag)
}

function getTagKey(tag: Customer['tags'][number], index: number) {
  if (typeof tag === 'string') return `${tag}-${index}`
  return `${tag.tagCode || tag.code || tag.tagName || tag.name || index}-${index}`
}

function normalizeTagName(tag: Customer['tags'][number] | TagItem) {
  if (typeof tag === 'string') return tag
  return tag.tagName || tag.name || tag.tagCode || tag.code || ''
}

function handleSearch() {
  pagination.page = 1
  void loadUsers()
}

function handleReset() {
  searchForm.keyword = ''
  pagination.page = 1
  void loadUsers()
}

async function loadUsers() {
  loading.value = true
  try {
    const res = await getCustomers({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined
    })
    users.value = res.data.list
    pagination.total = res.data.total
  } finally {
    loading.value = false
  }
}

async function loadUserDetails(uid: string, forceRefresh = false) {
  const [detailRes, journeyRes, analysisRes] = await Promise.all([
    getCustomerDetail(uid),
    getUserJourney(uid, 100),
    analyzeUserApi(uid, forceRefresh)
  ])

  selectedUser.value = detailRes.data
  userJourney.value = journeyRes.data
  analysisResult.value = analysisRes.data
}

async function showUserDetail(user: Customer) {
  drawerVisible.value = true
  selectedUser.value = user
  await loadUserDetails(user.uid)
}

async function handleAnalyzeUser(user: Customer) {
  drawerVisible.value = true
  selectedUser.value = user
  await loadUserDetails(user.uid, true)
}

async function refreshAnalysis() {
  if (!selectedUser.value?.uid) return
  const res = await analyzeUserApi(selectedUser.value.uid, true)
  analysisResult.value = res.data
}

onMounted(() => {
  void loadUsers()
})
</script>

<style scoped lang="scss">
.search-bar {
  margin-bottom: 16px;
  padding: 14px 16px;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.muted {
  color: #6b7280;
  font-size: 12px;
}

.profile-block {
  display: flex;
  gap: 12px;
  align-items: center;
}

.profile-name {
  font-size: 18px;
  font-weight: 600;
}

.path-item {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #f0f2f5;
  padding: 8px 0;
}

.analysis-script {
  background: #f6f8fa;
  border-radius: 8px;
  padding: 12px;
  margin: 12px 0;
  line-height: 1.6;
}
</style>
