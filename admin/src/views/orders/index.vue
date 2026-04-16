<template>
  <div class="orders-page">
    <div class="page-header">
      <h1 class="page-title">订单管理</h1>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="mini-stat">
        <span class="mini-stat-value">{{ stats.pending }}</span>
        <span class="mini-stat-label">待支付</span>
      </div>
      <div class="mini-stat">
        <span class="mini-stat-value">{{ stats.paid }}</span>
        <span class="mini-stat-label">已支付</span>
      </div>
      <div class="mini-stat">
        <span class="mini-stat-value">{{ stats.completed }}</span>
        <span class="mini-stat-label">已完成</span>
      </div>
      <div class="mini-stat">
        <span class="mini-stat-value">{{ stats.cancelled }}</span>
        <span class="mini-stat-label">已取消</span>
      </div>
      <div class="mini-stat highlight">
        <span class="mini-stat-value">{{ stats.totalRevenueLabel }}</span>
        <span class="mini-stat-label">总营收</span>
      </div>
    </div>
    
    <!-- 搜索栏 -->
    <div class="card search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="待支付" value="pending" />
            <el-option label="已支付" value="paid" />
            <el-option label="已确认" value="confirmed" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
            <el-option label="已退款" value="refunded" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="订单号/客户姓名"
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
    
    <!-- 订单列表 -->
    <div class="card">
      <el-table :data="orders" v-loading="loading" style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" width="180" />
        
        <el-table-column label="客户信息" min-width="160">
          <template #default="{ row }">
            <div>
              <div class="customer-name">{{ row.customerName }}</div>
              <div class="customer-phone">{{ row.customerPhone }}</div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="suiteName" label="房型" width="140" />
        
        <el-table-column label="金额" width="140">
          <template #default="{ row }">
            <div class="amount-cell">
              <div class="amount-original">¥{{ (row.originalAmount / 100).toLocaleString() }}</div>
              <div v-if="row.discountAmount > 0" class="amount-discount">
                -¥{{ (row.discountAmount / 100).toLocaleString() }}
              </div>
              <div class="amount-payable">{{ row.payableAmountLabel }}</div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="showOrderDetail(row)">详情</el-button>
            <el-button
              v-if="row.status === 'paid'"
              type="success"
              link
              @click="confirmOrder(row)"
            >确认</el-button>
            <el-button
              v-if="row.status === 'pending' || row.status === 'paid'"
              type="danger"
              link
              @click="cancelOrderHandle(row)"
            >取消</el-button>
            <el-button
              v-if="row.status === 'confirmed'"
              type="warning"
              link
              @click="completeOrder(row)"
            >完成</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="loadOrders"
        @current-change="loadOrders"
      />
    </div>
    
    <!-- 订单详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      title="订单详情"
      direction="rtl"
      size="500px"
    >
      <template v-if="selectedOrder">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="订单号">{{ selectedOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="客户姓名">{{ selectedOrder.customerName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ selectedOrder.customerPhone }}</el-descriptions-item>
          <el-descriptions-item label="房型">{{ selectedOrder.suiteName }}</el-descriptions-item>
          <el-descriptions-item label="原价">¥{{ (selectedOrder.originalAmount / 100).toLocaleString() }}</el-descriptions-item>
          <el-descriptions-item label="优惠金额">¥{{ (selectedOrder.discountAmount / 100).toLocaleString() }}</el-descriptions-item>
          <el-descriptions-item label="实付金额">
            <span class="highlight-amount">{{ selectedOrder.payableAmountLabel }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(selectedOrder.status)">
              {{ getStatusLabel(selectedOrder.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="支付方式">{{ selectedOrder.paymentMethod === 'wechat' ? '微信支付' : '-' }}</el-descriptions-item>
          <el-descriptions-item label="支付时间">{{ selectedOrder.paidAt ? formatDate(selectedOrder.paidAt) : '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(selectedOrder.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ selectedOrder.remark || '-' }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { mockOrders } from '@/mock/data'
import type { Order } from '@/types'
import dayjs from 'dayjs'

const loading = ref(false)
const orders = ref<Order[]>([])
const drawerVisible = ref(false)
const selectedOrder = ref<Order | null>(null)

const stats = reactive({
  pending: 6,
  paid: 6,
  completed: 6,
  cancelled: 6,
  totalRevenue: 12880000,
  totalRevenueLabel: '¥128,800'
})

const searchForm = reactive({
  status: '',
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

function handleSearch() {
  pagination.page = 1
  loadOrders()
}

function handleReset() {
  searchForm.status = ''
  searchForm.keyword = ''
  pagination.page = 1
  loadOrders()
}

function loadOrders() {
  loading.value = true
  setTimeout(() => {
    let result = [...mockOrders]
    
    if (searchForm.status) {
      result = result.filter(o => o.status === searchForm.status)
    }
    
    if (searchForm.keyword) {
      result = result.filter(o => 
        o.orderNo.includes(searchForm.keyword) || 
        o.customerName.includes(searchForm.keyword)
      )
    }
    
    pagination.total = result.length
    const start = (pagination.page - 1) * pagination.pageSize
    orders.value = result.slice(start, start + pagination.pageSize)
    loading.value = false
  }, 300)
}

function showOrderDetail(order: Order) {
  selectedOrder.value = order
  drawerVisible.value = true
}

function confirmOrder(order: Order) {
  ElMessageBox.confirm('确认该订单？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    order.status = 'confirmed'
    ElMessage.success('订单已确认')
  }).catch(() => {})
}

function cancelOrderHandle(order: Order) {
  ElMessageBox.confirm('确定取消该订单？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    order.status = 'cancelled'
    ElMessage.success('订单已取消')
  }).catch(() => {})
}

function completeOrder(order: Order) {
  ElMessageBox.confirm('确认完成该订单？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    order.status = 'completed'
    ElMessage.success('订单已完成')
  }).catch(() => {})
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped lang="scss">
.orders-page {
  .stats-row {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
    
    .mini-stat {
      flex: 1;
      background: #fff;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      
      &.highlight {
        background: #111827;
        color: #fff;
        
        .mini-stat-label {
          color: rgba(255, 255, 255, 0.7);
        }
      }
      
      .mini-stat-value {
        display: block;
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 4px;
      }
      
      .mini-stat-label {
        font-size: 13px;
        color: #6b7280;
      }
    }
  }
  
  .search-bar {
    margin-bottom: 20px;
    padding: 16px 20px;
  }
  
  .customer-name {
    font-size: 14px;
    color: #1f2937;
  }
  
  .customer-phone {
    font-size: 12px;
    color: #6b7280;
  }
  
  .amount-cell {
    .amount-original {
      font-size: 12px;
      color: #9ca3af;
      text-decoration: line-through;
    }
    
    .amount-discount {
      font-size: 12px;
      color: #10b981;
    }
    
    .amount-payable {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
    }
  }
}

.highlight-amount {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}
</style>
