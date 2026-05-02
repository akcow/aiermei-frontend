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

    <div class="card list-wrap" v-loading="loading">
      <div class="card-grid">
        <article v-for="user in users" :key="user.uid" class="lead-card">
          <div class="lead-header">
            <div class="identity">
              <el-avatar :size="48" :src="user.avatar">{{ user.name?.charAt(0) }}</el-avatar>
              <div class="meta">
                <h3>{{ user.name }}</h3>
                <p class="phone-meta">
                  <span class="phone-text">{{ user.phone || '-' }}</span>
                  <el-icon v-if="user.phone && user.phone !== '-'" class="reveal-icon" @click.stop="togglePhone(user)">
                    <View v-if="user.phone.includes('*')" />
                    <Hide v-else />
                  </el-icon>
                </p>
              </div>
            </div>
          </div>

          <div class="tag-row">
            <el-tag v-for="(tag, index) in user.tags.slice(0, 4)" :key="getTagKey(tag, index)" effect="plain" round>
              {{ getTagName(tag) }}
            </el-tag>
          </div>

          <p class="quote">{{ insightPreview(user) }}</p>

          <div class="metric-row">
            <div class="metric-item">
              <label>意向</label>
              <b class="c-intent">{{ metricPreview(user, 'conversionIntent') }}%</b>
            </div>
            <div class="metric-item">
              <label>消费</label>
              <b class="c-spending">{{ metricPreview(user, 'spendingPower') }}%</b>
            </div>
            <div class="metric-item">
              <label>急迫</label>
              <b class="c-urgency">{{ metricPreview(user, 'urgency') }}%</b>
            </div>
          </div>

          <div class="footer-row">
            <el-button text @click="openProfileDialog(user)">展开卡片</el-button>
            <el-button type="primary" text @click="openProfileDialog(user)">提交评分</el-button>
          </div>
        </article>
      </div>

      <el-empty v-if="!users.length && !loading" description="暂无客户数据" />

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[12, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="loadUsers"
        @current-change="loadUsers"
      />
    </div>

    <el-dialog
      v-model="profileDialogVisible"
      class="profile-dialog"
      width="68vw"
      top="8vh"
      :close-on-click-modal="false"
      :before-close="handleDialogBeforeClose"
      destroy-on-close
    >
      <template #header>
        <div v-if="selectedUser" class="dialog-head">
          <div class="identity">
            <el-avatar :size="48" :src="selectedUser.avatar">{{ selectedUser.name?.charAt(0) }}</el-avatar>
            <div class="meta">
              <h2>{{ selectedUser.name }}</h2>
              <p class="phone-meta">
                <span class="phone-text">{{ selectedUser.phone || '-' }}</span>
                <el-icon v-if="selectedUser.phone && selectedUser.phone !== '-'" class="reveal-icon" @click.stop="togglePhone(selectedUser)">
                  <View v-if="selectedUser.phone.includes('*')" />
                  <Hide v-else />
                </el-icon>
              </p>
              <p class="last-active">最后更新：{{ formatDate(selectedUser.lastActive) }}</p>
            </div>
          </div>
          <el-button type="primary" plain :loading="submittingScore" @click="submitManualScore">确认提交评分</el-button>
        </div>
      </template>

      <template v-if="selectedUser">
        <section class="ai-summary">
          <div class="summary-title">AI洞察摘要</div>
          <p>{{ analysisResult.script || '暂无AI摘要' }}</p>
        </section>

        <el-tabs class="detail-tabs">
          <el-tab-pane label="人工评分面板">
            <section class="panel">
              <h3>多维度意向分校准</h3>
              <div v-for="dim in scoreDimensions" :key="dim.key" class="score-block">
                <div class="score-title">{{ dim.label }}</div>
                <div class="score-main">
                  <el-slider v-model="dim.score" :min="0" :max="100" :step="1" />
                  <span class="score-pill">{{ dim.score }}%</span>
                </div>
              </div>

              <el-input
                v-model="manualScoreNote"
                type="textarea"
                :rows="2"
                maxlength="300"
                show-word-limit
                placeholder="评分备注（选填）"
              />

              <div class="confirm-row">
                <div>
                  <p class="subtle">建议综合等级</p>
                  <b class="grade-text">{{ scoreGrade }}</b>
                </div>
                <el-button type="primary" :loading="submittingScore" @click="submitManualScore">确认提交</el-button>
              </div>
            </section>
          </el-tab-pane>

          <el-tab-pane label="人工纠偏机制">
            <section class="panel">
              <h3>标签纠偏与完善</h3>
              <p class="subtle">点击标签可溯源，关闭图标用于删除标签</p>
              <div class="tag-row">
                <el-tag
                  v-for="tag in customerTags"
                  :key="tag.tagCode"
                  class="trace-tag"
                  closable
                  @click.stop="openTagTrace(tag)"
                  @close="removeTag(tag)"
                >
                  {{ tag.tagName }}
                </el-tag>
                <span v-if="!customerTags.length" class="subtle">暂无标签</span>
              </div>

              <p class="subtle minor-top">补充线下调研特征</p>
              <div class="quick-add-row">
                <el-input v-model="newTagName" placeholder="输入新特征标签（如：家属陪同、停车需求）" maxlength="30" />
                <el-input v-model="tagCorrectionReason" placeholder="纠偏理由（选填）" maxlength="120" />
                <el-button type="primary" :loading="addingTag" @click="addTag">新增标签</el-button>
              </div>
            </section>
          </el-tab-pane>

          <el-tab-pane label="行为路径与日志">
            <div class="dialog-grid">
              <section class="panel">
                <h3>行为路径溯源</h3>
                <div class="journey-list">
                  <div v-for="(item, index) in userJourney.paths" :key="`${item.path}-${index}`" class="journey-item">
                    <span>{{ item.path }}</span>
                    <span class="subtle">{{ formatDate(item.timestamp) }}</span>
                  </div>
                  <span v-if="!userJourney.paths.length" class="subtle">暂无路径数据</span>
                </div>
              </section>

              <section class="panel">
                <h3>纠偏操作日志</h3>
                <el-table :data="tagCorrectionLogs" size="small" max-height="240">
                  <el-table-column prop="action" label="动作" width="80" />
                  <el-table-column prop="tagName" label="标签" min-width="120" />
                  <el-table-column prop="reason" label="原因" min-width="140" />
                  <el-table-column prop="operator" label="操作人" width="90" />
                </el-table>
              </section>
            </div>
          </el-tab-pane>
        </el-tabs>
      </template>
    </el-dialog>

    <el-dialog v-model="tagTraceVisible" width="560px" title="标签溯源记录" append-to-body destroy-on-close>
      <div class="trace-head">标签：{{ activeTraceTagName }}</div>
      <el-timeline v-loading="tagTraceLoading">
        <el-timeline-item
          v-for="item in tagTraceRecords"
          :key="item.id"
          :timestamp="formatDate(item.occurredAt)"
          placement="top"
        >
          <div class="trace-item">
            <p class="trace-meta">来源：{{ sourceTypeLabel(item.sourceType) }} · 事件：{{ eventTypeLabel(item.sourceEventType) }}</p>
            <p class="trace-context">{{ item.sourceContext }}</p>
          </div>
        </el-timeline-item>
      </el-timeline>
      <el-empty v-if="!tagTraceLoading && !tagTraceRecords.length" description="暂无溯源记录" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import { View, Hide } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { analyzeUser as analyzeUserApi, getCustomerDetail, getCustomers, getUserJourney } from '@/api/modules/auth'
import {
  addCustomerTag,
  getCustomerManualScoreDraft,
  getCustomerTagCorrectionLogs,
  getCustomerTagTrace,
  getCustomerPhone,
  getCustomerTags,
  removeCustomerTag,
  submitCustomerManualScore
} from '@/api/modules/customer-profile'
import type {
  AnalysisResult,
  Customer,
  CustomerManualScoreSubmitRequest,
  CustomerTag,
  CustomerTagCorrectionLog,
  CustomerTagTraceRecord,
  UserJourney
} from '@/types'

const loading = ref(false)
const users = ref<Customer[]>([])
const profileDialogVisible = ref(false)
const selectedUser = ref<Customer | null>(null)
const userJourney = ref<UserJourney>({ uid: '', paths: [], tags: [], lastActive: '' })
const analysisResult = ref<AnalysisResult>({ tags: [], script: '' })
const customerTags = ref<CustomerTag[]>([])
const tagCorrectionLogs = ref<CustomerTagCorrectionLog[]>([])
const tagTraceVisible = ref(false)
const tagTraceLoading = ref(false)
const activeTraceTagName = ref('')
const tagTraceRecords = ref<CustomerTagTraceRecord[]>([])

const searchForm = reactive({ keyword: '' })
const pagination = reactive({ page: 1, pageSize: 12, total: 0 })

const scoreDimensions = reactive([
  { key: 'conversionIntent', label: '转化意向度', score: 60 },
  { key: 'spendingPower', label: '消费能力', score: 55 },
  { key: 'urgency', label: '孕产急迫度', score: 65 }
])
const manualScoreNote = ref('')
const submittingScore = ref(false)

const newTagName = ref('')
const tagCorrectionReason = ref('')
const addingTag = ref(false)

const initialScoreSnapshot = ref('')
const initialNoteSnapshot = ref('')

const updateSnapshots = () => {
  initialScoreSnapshot.value = JSON.stringify(scoreDimensions.map((x) => ({ key: x.key, score: x.score })))
  initialNoteSnapshot.value = manualScoreNote.value
}

const overallManualScore = computed(() => {
  const sum = scoreDimensions.reduce((acc, item) => acc + Number(item.score || 0), 0)
  return Math.round(sum / scoreDimensions.length)
})

const scoreGrade = computed(() => {
  if (overallManualScore.value >= 85) return 'A 综合判定'
  if (overallManualScore.value >= 60) return 'B 综合判定'
  return 'C 综合判定'
})

const hasUnsavedScoreChanges = computed(() => {
  const currentScore = JSON.stringify(scoreDimensions.map((x) => ({ key: x.key, score: x.score })))
  return currentScore !== initialScoreSnapshot.value || manualScoreNote.value !== initialNoteSnapshot.value
})

function formatDate(date: string) {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

function getTagName(tag: Customer['tags'][number]) {
  if (typeof tag === 'string') return tag
  return tag.tagName || tag.name || tag.tagCode || tag.code || ''
}

function getTagKey(tag: Customer['tags'][number], index: number) {
  if (typeof tag === 'string') return `${tag}-${index}`
  return `${tag.tagCode || tag.code || tag.tagName || tag.name || index}-${index}`
}

function metricPreview(user: Customer, type: 'conversionIntent' | 'spendingPower' | 'urgency') {
  const seed = Number(user.uid.replace(/\D/g, '')) % 100
  if (type === 'conversionIntent') return Math.max(40, Math.min(95, 45 + (seed % 50)))
  if (type === 'spendingPower') return Math.max(45, Math.min(96, 50 + ((seed + 9) % 45)))
  return Math.max(30, Math.min(92, 35 + ((seed + 17) % 50)))
}

function insightPreview(user: Customer) {
  const tags = user.tags.slice(0, 3).map((x) => getTagName(x)).filter(Boolean)
  if (!tags.length) return '近期互动稳定，建议补充线下沟通记录完善画像。'
  return `重点关注：${tags.join('、')}。建议结合到店沟通进一步核验。`
}

function sourceTypeLabel(sourceType: string) {
  const map: Record<string, string> = {
    AI_CHAT: 'AI对话',
    PAGE_VIEW: '页面浏览',
    ARTICLE_VIEW: '内容阅读',
    MANUAL: '人工录入'
  }
  return map[sourceType] || sourceType || '未知来源'
}

function eventTypeLabel(eventType?: string) {
  if (!eventType) return '未知事件'
  const map: Record<string, string> = {
    AI_CHAT: 'AI对话消息',
    PAGE_VIEW: '页面访问事件',
    ARTICLE_VIEW: '文章阅读事件',
    MANUAL_TAG_ADD: '人工补录标签'
  }
  return map[eventType] || eventType
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

async function loadProfileData(uid: string) {
  const [detailRes, journeyRes, analysisRes, tagsRes, scoreDraftRes, logsRes] = await Promise.all([
    getCustomerDetail(uid),
    getUserJourney(uid, 100),
    analyzeUserApi(uid, false),
    getCustomerTags(uid),
    getCustomerManualScoreDraft(uid),
    getCustomerTagCorrectionLogs(uid)
  ])

  selectedUser.value = detailRes.data
  userJourney.value = journeyRes.data
  analysisResult.value = analysisRes.data
  customerTags.value = tagsRes.data
  tagCorrectionLogs.value = logsRes.data
  manualScoreNote.value = scoreDraftRes.data.note || ''

  for (const dim of scoreDimensions) {
    const found = scoreDraftRes.data.dimensions.find((item) => item.key === dim.key)
    if (found) dim.score = found.score
  }

  initialScoreSnapshot.value = JSON.stringify(scoreDimensions.map((x) => ({ key: x.key, score: x.score })))
  initialNoteSnapshot.value = manualScoreNote.value
}


async function openProfileDialog(user: Customer) {
  selectedUser.value = user
  // Reset score dimensions to defaults
  scoreDimensions[0].score = 60
  scoreDimensions[1].score = 55
  scoreDimensions[2].score = 65
  manualScoreNote.value = ''
  updateSnapshots()
  
  profileDialogVisible.value = true
  await loadProfileData(user.uid)
}


async function submitManualScore() {
  if (!selectedUser.value?.uid) return
  const payload: CustomerManualScoreSubmitRequest = {
    dimensions: scoreDimensions.map((item) => ({ key: item.key as any, label: item.label, score: Number(item.score) })),
    note: manualScoreNote.value || undefined
  }
  submittingScore.value = true
  try {
    await submitCustomerManualScore(selectedUser.value.uid, payload)
    initialScoreSnapshot.value = JSON.stringify(scoreDimensions.map((x) => ({ key: x.key, score: x.score })))
    initialNoteSnapshot.value = manualScoreNote.value
    ElMessage.success('人工评分已确认提交')
  } finally {
    submittingScore.value = false
  }
}

async function addTag() {
  if (!selectedUser.value?.uid) return
  const tagName = newTagName.value.trim()
  if (!tagName) {
    ElMessage.warning('请先输入标签名称')
    return
  }
  addingTag.value = true
  try {
    await addCustomerTag(selectedUser.value.uid, {
      tagName,
      reason: tagCorrectionReason.value || undefined
    })
    const [tagsRes, logsRes] = await Promise.all([
      getCustomerTags(selectedUser.value.uid),
      getCustomerTagCorrectionLogs(selectedUser.value.uid)
    ])
    customerTags.value = tagsRes.data
    tagCorrectionLogs.value = logsRes.data
    newTagName.value = ''
    tagCorrectionReason.value = ''
    ElMessage.success('标签已新增')
  } finally {
    addingTag.value = false
  }
}

async function removeTag(tag: CustomerTag) {
  if (!selectedUser.value?.uid) return
  const reason = await ElMessageBox.prompt('请输入删除标签原因（选填）', `删除标签：${tag.tagName}`, {
    confirmButtonText: '确认删除',
    cancelButtonText: '取消',
    inputPlaceholder: '例如：线下沟通后确认标签不准确'
  }).catch(() => null)
  if (reason === null) return
  await removeCustomerTag(selectedUser.value.uid, tag.tagCode, reason.value || undefined)
  const [tagsRes, logsRes] = await Promise.all([
    getCustomerTags(selectedUser.value.uid),
    getCustomerTagCorrectionLogs(selectedUser.value.uid)
  ])
  customerTags.value = tagsRes.data
  tagCorrectionLogs.value = logsRes.data
  ElMessage.success('标签已删除')
}



const maskedPhoneMap = new Map<string, string>()

async function togglePhone(user: Customer) {
  if (!user.phone) return
  const isMasked = user.phone.includes('*')
  
  if (isMasked) {
    try {
      if (!maskedPhoneMap.has(user.uid)) {
        maskedPhoneMap.set(user.uid, user.phone)
      }
      const res = await getCustomerPhone(user.uid)
      user.phone = res.data.phone
    } catch (e) {
      ElMessage.error('获取完整手机号失败')
    }
  } else {
    const masked = maskedPhoneMap.get(user.uid)
    if (masked) {
      user.phone = masked
    }
  }
}


async function openTagTrace(tag: CustomerTag) {
  if (!selectedUser.value?.uid) return
  activeTraceTagName.value = tag.tagName
  tagTraceVisible.value = true
  tagTraceLoading.value = true
  try {
    const res = await getCustomerTagTrace(selectedUser.value.uid, tag.tagCode)
    tagTraceRecords.value = res.data
  } finally {
    tagTraceLoading.value = false
  }
}


const handleDialogBeforeClose = (done: any) => {
  if (!hasUnsavedScoreChanges.value) {
    if (typeof done === 'function') {
      done()
    } else {
      profileDialogVisible.value = false
    }
    return
  }

  ElMessageBox.confirm('评分内容有未保存改动，确定关闭吗？', '未保存提示', {
    confirmButtonText: '仍然关闭',
    cancelButtonText: '继续编辑',
    type: 'warning',
    distinguishCancelAndClose: true
  }).then(() => {
    // Force close
    profileDialogVisible.value = false
    if (typeof done === 'function') done()
  }).catch(() => {
    // Keep open
  })
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

.list-wrap {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.card-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.lead-card {
  border-radius: 12px;
  border: 1px solid #e6e9ef;
  background: #f5f5f0;
  overflow: visible;
  min-height: 315px;
  display: flex;
  flex-direction: column;
  padding: 0 0 12px;
}

.lead-header {
  padding: 12px 12px 8px;
}

.identity {
  display: flex;
  gap: 10px;
  align-items: center;
}

.meta h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
}

.meta p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #8a93a2;
}

.tag-row {
  padding: 0 12px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  min-height: 28px;
  max-height: 56px;
  overflow: hidden;
  align-content: flex-start;
}

.quote {
  margin: 10px 12px 0;
  color: #5f6b7a;
  font-size: 13px;
  line-height: 1.5;
  min-height: 42px;
  max-height: 42px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.metric-row {
  margin-top: 12px;
  border-top: 1px solid #e7ebf2;
  border-bottom: none;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding: 10px 8px;
  background: #f8f9fb;
  border-radius: 0 0 10px 10px;
}

.metric-item {
  text-align: center;
}

.metric-item label {
  color: #9aa3b2;
  display: block;
  font-size: 12px;
}

.metric-item b {
  display: block;
  margin-top: 3px;
  font-size: 20px;
}

.c-intent { color: #11c5bb; }
.c-spending { color: #f59e0b; }
.c-urgency { color: #f43f5e; }

.footer-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: none;
  margin-top: auto;
  background: #f5f5f0;
  margin: auto 12px 0;
  border: 1px solid #d9ded6;
  border-radius: 8px;
  overflow: hidden;
}

.footer-row :deep(.el-button) {
  border-radius: 0;
  padding: 10px 0;
  font-size: 14px;
  background: transparent !important;
}

.footer-row :deep(.el-button + .el-button) {
  margin-left: 0;
  border-left: 1px solid #d9ded6;
}

.footer-row :deep(.el-button:hover),
.footer-row :deep(.el-button:focus) {
  background: rgba(17, 24, 39, 0.04) !important;
}

.dialog-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-head h2 {
  margin: 0;
  font-size: 20px;
}

.last-active {
  margin: 0;
  color: #7b8797;
}

.ai-summary {
  border: 1px solid #d4ece0;
  background: #eaf7ef;
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 10px;
}

.summary-title {
  font-weight: 700;
  color: #128053;
  margin-bottom: 4px;
}

.detail-tabs {
  margin-top: 4px;
}

.dialog-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.panel {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px;
}

.panel h3 {
  margin: 0 0 8px;
  font-size: 15px;
}

.subtle {
  margin: 0 0 8px;
  color: #96a0b0;
  font-size: 12px;
}

.minor-top {
  margin-top: 10px;
}

.quick-add-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 8px;
}

.score-block {
  margin-bottom: 10px;
}

.score-title {
  margin-bottom: 4px;
  font-size: 13px;
  font-weight: 700;
}

.score-main {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px;
}

.score-pill {
  min-width: 56px;
  text-align: center;
  border-radius: 8px;
  padding: 2px 8px;
  color: #fff;
  background: #14b8a6;
  font-size: 12px;
  font-weight: 700;
}

.confirm-row {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.grade-text {
  font-size: 22px;
}

.journey-list {
  max-height: 230px;
  overflow: auto;
}

.journey-item {
  display: flex;
  justify-content: space-between;
  padding: 7px 0;
  border-bottom: 1px solid #eef2f7;
}

.trace-tag {
  cursor: pointer;
}

.trace-head {
  margin-bottom: 6px;
  color: #5f6b7a;
}

.trace-meta {
  margin: 0 0 4px;
  color: #8a93a2;
  font-size: 12px;
}

.trace-context {
  margin: 0;
  color: #2f3a4a;
  line-height: 1.5;
}

:deep(.profile-dialog) {
  max-width: 1180px;
}

@media (max-width: 1400px) {
  .card-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1100px) {
  .card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dialog-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .card-grid {
    grid-template-columns: 1fr;
  }

  .quick-add-row {
    grid-template-columns: 1fr;
  }
}


.phone-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.phone-text {
  font-family: 'Roboto Mono', 'Courier New', Courier, monospace;
  width: 115px;
  font-size: 15px;
  display: inline-block;
}

.reveal-icon {
  cursor: pointer;
  color: #409eff;
  transition: color 0.2s;
  font-size: 14px;
  flex-shrink: 0;

  &:hover {
    color: #66b1ff;
  }
}


</style>
