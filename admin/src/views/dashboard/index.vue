<template>
  <div class="dashboard-page">
    <div class="page-header">
      <h1 class="page-title">数据概览</h1>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6;">
          <el-icon :size="24"><User /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">活跃用户</div>
          <div class="stat-value">{{ overview.activeCustomers }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">
          <el-icon :size="24"><View /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">今日访问</div>
          <div class="stat-value">{{ overview.todayVisits }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">
          <el-icon :size="24"><Document /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">订单数</div>
          <div class="stat-value">{{ overview.orderCount }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(239, 68, 68, 0.1); color: #ef4444;">
          <el-icon :size="24"><Money /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">营收金额</div>
          <div class="stat-value">{{ overview.revenueLabel }}</div>
        </div>
      </div>
    </div>
    
    <!-- 详细数据 -->
    <div class="data-grid">
      <!-- 用户分析 -->
      <div class="card data-card">
        <div class="card-header">
          <span class="title">用户行为</span>
        </div>
        <div class="card-body">
          <div class="metric-row">
            <span class="metric-label">平均停留时长</span>
            <span class="metric-value">{{ overview.avgStayMinutes }} min</span>
          </div>
          <div class="metric-row">
            <span class="metric-label">转化率</span>
            <span class="metric-value">{{ overview.leadConversionRate }}%</span>
          </div>
          <div class="metric-row">
            <span class="metric-label">热门内容</span>
            <span class="metric-value">{{ overview.hotContentTitle }}</span>
          </div>
        </div>
      </div>
      
      <!-- 最新订单 -->
      <div class="card data-card">
        <div class="card-header">
          <span class="title">最新订单</span>
          <el-button type="primary" link @click="$router.push('/orders')">
            查看全部
          </el-button>
        </div>
        <div class="card-body">
          <div v-for="order in recentOrders" :key="order.id" class="order-item">
            <div class="order-info">
              <span class="order-no">{{ order.orderNo }}</span>
              <span class="order-customer">{{ order.customerName }}</span>
            </div>
            <div class="order-meta">
              <span class="order-amount">{{ order.payableAmountLabel }}</span>
              <el-tag :type="getStatusType(order.status)" size="small">
                {{ getStatusLabel(order.status) }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 最新用户 -->
      <div class="card data-card">
        <div class="card-header">
          <span class="title">最新用户</span>
          <el-button type="primary" link @click="$router.push('/users')">
            查看全部
          </el-button>
        </div>
        <div class="card-body">
          <div v-for="user in recentUsers" :key="user.uid" class="user-item">
            <el-avatar :size="36" :src="user.avatar">
              {{ user.name?.charAt(0) }}
            </el-avatar>
            <div class="user-info">
              <span class="user-name">{{ user.name }}</span>
              <span class="user-level">{{ getMemberLabel(user.memberLevel) }}</span>
            </div>
            <div class="user-tags">
              <el-tag v-for="tag in user.tags.slice(0, 2)" :key="tag" size="small" type="info">
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 内容统计 -->
      <div class="card data-card">
        <div class="card-header">
          <span class="title">内容统计</span>
        </div>
        <div class="card-body">
          <div class="content-stats">
            <div class="content-stat">
              <span class="stat-num">{{ contentStats.articles }}</span>
              <span class="stat-label">文章</span>
            </div>
            <div class="content-stat">
              <span class="stat-num">{{ contentStats.banners }}</span>
              <span class="stat-label">海报</span>
            </div>
            <div class="content-stat">
              <span class="stat-num">{{ contentStats.magazines }}</span>
              <span class="stat-label">杂志</span>
            </div>
            <div class="content-stat">
              <span class="stat-num">{{ contentStats.suites }}</span>
              <span class="stat-label">房型</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { User, View, Document, Money } from '@element-plus/icons-vue'
import { mockDashboardOverview, mockOrders, mockCustomers } from '@/mock/data'
import type { Order, Customer } from '@/types'

const overview = ref(mockDashboardOverview)
const recentOrders = ref<Order[]>([])
const recentUsers = ref<Customer[]>([])
const contentStats = ref({
  articles: 30,
  banners: 3,
  magazines: 2,
  suites: 3
})

function getStatusType(status: string) {
  const map: Record<string, string> = {
    pending: 'warning',
    paid: 'primary',
    confirmed: 'primary',
    completed: 'success',
    cancelled: 'info',
    refunded: 'danger'
  }
  return map[status] || 'info'
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    confirmed: '已确认',
    completed: '已完成',
    cancelled: '已取消',
    refunded: '已退款'
  }
  return map[status] || status
}

function getMemberLabel(level: string) {
  const map: Record<string, string> = {
    normal: '普通会员',
    gold: '金卡会员',
    diamond: '钻石会员'
  }
  return map[level] || level
}

onMounted(() => {
  // 获取最新5个订单
  recentOrders.value = mockOrders.slice(0, 5)
  // 获取最新5个用户
  recentUsers.value = mockCustomers.slice(0, 5)
})
</script>

<style scoped lang="scss">
.dashboard-page {
  .stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 24px;
    
    @media (max-width: 1200px) {
      grid-template-columns: repeat(2, 1fr);
    }
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
  
  .stat-card {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .stat-content {
      flex: 1;
      
      .stat-label {
        font-size: 13px;
        color: #6b7280;
        margin-bottom: 4px;
      }
      
      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: #1f2937;
      }
    }
  }
  
  .data-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    
    @media (max-width: 992px) {
      grid-template-columns: 1fr;
    }
  }
  
  .data-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(17, 24, 39, 0.08);
      
      .title {
        font-size: 16px;
        font-weight: 500;
        color: #1f2937;
      }
    }
    
    .card-body {
      padding: 16px 20px;
    }
  }
  
  .metric-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid rgba(17, 24, 39, 0.04);
    
    &:last-child {
      border-bottom: none;
    }
    
    .metric-label {
      color: #6b7280;
      font-size: 14px;
    }
    
    .metric-value {
      color: #1f2937;
      font-weight: 500;
      font-size: 14px;
    }
  }
  
  .order-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid rgba(17, 24, 39, 0.04);
    
    &:last-child {
      border-bottom: none;
    }
    
    .order-info {
      .order-no {
        font-size: 14px;
        color: #1f2937;
        font-weight: 500;
      }
      
      .order-customer {
        font-size: 12px;
        color: #6b7280;
        margin-left: 8px;
      }
    }
    
    .order-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .order-amount {
        font-size: 14px;
        font-weight: 500;
        color: #111827;
      }
    }
  }
  
  .user-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid rgba(17, 24, 39, 0.04);
    
    &:last-child {
      border-bottom: none;
    }
    
    .user-info {
      flex: 1;
      
      .user-name {
        font-size: 14px;
        color: #1f2937;
        display: block;
      }
      
      .user-level {
        font-size: 12px;
        color: #6b7280;
      }
    }
    
    .user-tags {
      display: flex;
      gap: 4px;
    }
  }
  
  .content-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    text-align: center;
    
    .content-stat {
      .stat-num {
        display: block;
        font-size: 28px;
        font-weight: 600;
        color: #111827;
      }
      
      .stat-label {
        font-size: 13px;
        color: #6b7280;
      }
    }
  }
}
</style>
