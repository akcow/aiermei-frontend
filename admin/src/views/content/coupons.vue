<template>
  <div class="coupons-page">
    <div class="page-header">
      <h1 class="page-title">优惠券管理</h1>
      <el-button type="primary" @click="showEditor()">
        <el-icon><Plus /></el-icon>
        新建优惠券
      </el-button>
    </div>
    
    <div class="card">
      <el-table :data="coupons" style="width: 100%">
        <el-table-column prop="name" label="名称" min-width="160" />
        
        <el-table-column label="面值" width="120">
          <template #default="{ row }">
            <span class="coupon-value">{{ row.valueLabel }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="门槛" width="120">
          <template #default="{ row }">
            {{ row.minAmount ? `满¥${row.minAmount / 100}` : '无门槛' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="expiry" label="有效期" width="120" />
        
        <el-table-column label="使用情况" width="140">
          <template #default="{ row }">
            {{ row.usedCount }} / {{ row.totalCount }}
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="showEditor(row)">编辑</el-button>
            <el-button
              :type="row.status === 'active' ? 'warning' : 'success'"
              link
              @click="toggleStatus(row)"
            >
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" link @click="deleteCouponHandle(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <el-dialog
      v-model="editorVisible"
      :title="editingCoupon ? '编辑优惠券' : '新建优惠券'"
      width="500px"
      destroy-on-close
    >
      <el-form :model="couponForm" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="couponForm.name" placeholder="优惠券名称" />
        </el-form-item>
        
        <el-form-item label="面值(分)" required>
          <el-input-number v-model="couponForm.value" :min="1" :step="1000" style="width: 100%" />
        </el-form-item>
        
        <el-form-item label="门槛(分)">
          <el-input-number v-model="couponForm.minAmount" :min="0" :step="10000" style="width: 100%" />
        </el-form-item>
        
        <el-form-item label="有效期">
          <el-date-picker
            v-model="couponForm.expiry"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="发放数量">
          <el-input-number v-model="couponForm.totalCount" :min="1" style="width: 100%" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="editorVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!canSaveCoupon" @click="saveCoupon">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { mockCoupons } from '@/mock/data'
import type { Coupon } from '@/types'
import dayjs from 'dayjs'

const coupons = ref<Coupon[]>([])
const editorVisible = ref(false)
const editingCoupon = ref<Coupon | null>(null)

const couponForm = reactive({
  name: '',
  value: 10000,
  minAmount: 0,
  expiry: '',
  totalCount: 100
})

const canSaveCoupon = computed(() => Boolean(couponForm.name.trim()) && couponForm.value > 0)

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD')
}

function showEditor(coupon?: Coupon) {
  editingCoupon.value = coupon || null
  if (coupon) {
    Object.assign(couponForm, {
      name: coupon.name,
      value: coupon.value,
      minAmount: coupon.minAmount || 0,
      expiry: coupon.expiry,
      totalCount: coupon.totalCount
    })
  } else {
    Object.assign(couponForm, {
      name: '',
      value: 10000,
      minAmount: 0,
      expiry: dayjs().add(1, 'year').format('YYYY-MM-DD'),
      totalCount: 100
    })
  }
  editorVisible.value = true
}

function saveCoupon() {
  if (!canSaveCoupon.value) {
    ElMessage.warning('请先填写必填项：名称、面值')
    return
  }
  if (editingCoupon.value) {
    Object.assign(editingCoupon.value, couponForm, {
      valueLabel: `¥${couponForm.value / 100}`
    })
    ElMessage.success('优惠券已更新')
  } else {
    coupons.value.push({
      id: 'coupon_' + Date.now(),
      ...couponForm,
      valueLabel: `¥${couponForm.value / 100}`,
      status: 'active',
      usedCount: 0,
      createdAt: new Date().toISOString()
    } as Coupon)
    ElMessage.success('优惠券已创建')
  }
  editorVisible.value = false
}

function toggleStatus(coupon: Coupon) {
  coupon.status = coupon.status === 'active' ? 'inactive' : 'active'
  ElMessage.success(coupon.status === 'active' ? '优惠券已启用' : '优惠券已禁用')
}

function deleteCouponHandle(coupon: Coupon) {
  ElMessageBox.confirm('确定删除该优惠券？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = coupons.value.findIndex(c => c.id === coupon.id)
    if (index > -1) coupons.value.splice(index, 1)
    ElMessage.success('优惠券已删除')
  }).catch(() => {})
}

onMounted(() => {
  coupons.value = [...mockCoupons]
})
</script>

<style scoped lang="scss">
.coupons-page {
  .coupon-value {
    font-size: 16px;
    font-weight: 600;
    color: #ef4444;
  }
}
</style>
