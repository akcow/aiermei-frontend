<template>
  <div class="users-page">
    <div class="page-header">
      <h1 class="page-title">用户管理</h1>
    </div>
    
    <!-- 搜索栏 -->
    <div class="card search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="姓名/手机号"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 用户列表 -->
    <div class="card">
      <el-table :data="users" v-loading="loading" style="width: 100%">
        <el-table-column label="用户" min-width="200">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="40" :src="row.avatar">
                {{ row.name?.charAt(0) }}
              </el-avatar>
              <div class="user-info">
                <span class="user-name">{{ row.name }}</span>
                <span class="user-phone">{{ row.phone }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="会员等级" width="120">
          <template #default="{ row }">
            <el-tag :type="getMemberType(row.memberLevel)" size="small">
              {{ getMemberLabel(row.memberLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="孕期信息" width="140">
          <template #default="{ row }">
            <span v-if="row.pregnancyInfo" class="pregnancy-info">
              {{ row.pregnancyInfo.type === 'pregnancy' ? '怀孕' : '已生产' }} /
              {{ row.pregnancyInfo.date }}
            </span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        
        <el-table-column label="标签" min-width="160">
          <template #default="{ row }">
            <div class="tag-list">
              <el-tag
                v-for="tag in row.tags.slice(0, 3)"
                :key="tag"
                size="small"
                type="info"
                class="tag-item"
              >
                {{ tag }}
              </el-tag>
              <span v-if="row.tags.length > 3" class="tag-more">
                +{{ row.tags.length - 3 }}
              </span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="最后活跃" width="160">
          <template #default="{ row }">
            {{ formatDate(row.lastActive) }}
          </template>
        </el-table-column>
        
        <el-table-column label="注册时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="showUserDetail(row)">
              详情
            </el-button>
            <el-button type="primary" link @click="analyzeUser(row)">
              分析
            </el-button>
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
    
    <!-- 用户详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      title="用户详情"
      direction="rtl"
      size="500px"
    >
      <template v-if="selectedUser">
        <div class="user-profile">
          <div class="profile-header">
            <el-avatar :size="64" :src="selectedUser.avatar">
              {{ selectedUser.name?.charAt(0) }}
            </el-avatar>
            <div class="profile-info">
              <div class="profile-name">{{ selectedUser.name }}</div>
              <div class="profile-phone">{{ selectedUser.phone }}</div>
              <el-tag :type="getMemberType(selectedUser.memberLevel)" size="small">
                {{ getMemberLabel(selectedUser.memberLevel) }}
              </el-tag>
            </div>
          </div>
        </div>
        
        <el-divider content-position="left">行为路径</el-divider>
        <div class="path-list">
          <div v-for="(item, index) in userJourney.paths" :key="index" class="path-item">
            <div class="path-dot"></div>
            <div class="path-content">
              <div class="path-name">{{ item.path }}</div>
              <div class="path-time">{{ formatDate(item.timestamp) }}</div>
            </div>
          </div>
        </div>
        
        <el-divider content-position="left">AI 分析</el-divider>
        <div class="analysis-section">
          <div class="analysis-tags">
            <el-tag
              v-for="tag in analysisResult.tags"
              :key="tag"
              type="primary"
              class="analysis-tag"
            >
              {{ tag }}
            </el-tag>
          </div>
          <div class="analysis-script">
            {{ analysisResult.script }}
          </div>
          <el-button type="primary" size="small" @click="refreshAnalysis">
            重新分析
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { mockCustomers, mockUserJourney, mockAnalysisResult } from '@/mock/data'
import type { Customer, UserJourney, AnalysisResult } from '@/types'
import dayjs from 'dayjs'

const loading = ref(false)
const users = ref<Customer[]>([])
const drawerVisible = ref(false)
const selectedUser = ref<Customer | null>(null)
const userJourney = ref<UserJourney>({ uid: '', paths: [], tags: [], lastActive: '' })
const analysisResult = ref<AnalysisResult>({ tags: [], script: '' })

const searchForm = reactive({
  keyword: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

function getMemberType(level: string) {
  const map: Record<string, string> = {
    normal: 'info',
    gold: 'warning',
    diamond: 'success'
  }
  return map[level] || 'info'
}

function getMemberLabel(level: string) {
  const map: Record<string, string> = {
    normal: '普通会员',
    gold: '金卡会员',
    diamond: '钻石会员'
  }
  return map[level] || level
}

function handleSearch() {
  pagination.page = 1
  loadUsers()
}

function handleReset() {
  searchForm.keyword = ''
  pagination.page = 1
  loadUsers()
}

function loadUsers() {
  loading.value = true
  setTimeout(() => {
    let result = [...mockCustomers]
    
    if (searchForm.keyword) {
      result = result.filter(u => 
        u.name.includes(searchForm.keyword) || 
        u.phone?.includes(searchForm.keyword)
      )
    }
    
    pagination.total = result.length
    const start = (pagination.page - 1) * pagination.pageSize
    users.value = result.slice(start, start + pagination.pageSize)
    loading.value = false
  }, 300)
}

function showUserDetail(user: Customer) {
  selectedUser.value = user
  userJourney.value = mockUserJourney(user.uid)
  analysisResult.value = mockAnalysisResult()
  drawerVisible.value = true
}

function analyzeUser(user: Customer) {
  showUserDetail(user)
}

function refreshAnalysis() {
  analysisResult.value = mockAnalysisResult()
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped lang="scss">
.users-page {
  .search-bar {
    margin-bottom: 20px;
    padding: 16px 20px;
  }
  
  .user-cell {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .user-info {
      .user-name {
        display: block;
        font-size: 14px;
        color: #1f2937;
      }
      
      .user-phone {
        font-size: 12px;
        color: #6b7280;
      }
    }
  }
  
  .pregnancy-info {
    font-size: 13px;
    color: #6b7280;
  }
  
  .text-muted {
    color: #9ca3af;
  }
  
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
    
    .tag-item {
      margin: 0;
    }
    
    .tag-more {
      font-size: 12px;
      color: #6b7280;
    }
  }
}

.user-profile {
  .profile-header {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .profile-info {
      .profile-name {
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 4px;
      }
      
      .profile-phone {
        font-size: 14px;
        color: #6b7280;
        margin-bottom: 8px;
      }
    }
  }
}

.path-list {
  .path-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 8px 0;
    
    .path-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #111827;
      margin-top: 6px;
    }
    
    .path-content {
      flex: 1;
      
      .path-name {
        font-size: 14px;
        color: #1f2937;
      }
      
      .path-time {
        font-size: 12px;
        color: #6b7280;
      }
    }
  }
}

.analysis-section {
  .analysis-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
    
    .analysis-tag {
      margin: 0;
    }
  }
  
  .analysis-script {
    padding: 16px;
    background: #f5f5f0;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.6;
    color: #374151;
    margin-bottom: 16px;
  }
}
</style>
