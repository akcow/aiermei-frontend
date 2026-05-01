<template>
  <div class="account-table-container">
    <div class="filter-bar">
      <el-input
        v-model="queryParams.keyword"
        placeholder="搜索用户名/姓名"
        class="search-input"
        clearable
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="queryParams.status" placeholder="账号状态" clearable @change="handleSearch" class="status-select">
        <el-option label="启用" value="ENABLED" />
        <el-option label="禁用" value="DISABLED" />
      </el-select>
      <el-button type="primary" @click="handleSearch">查询</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" style="width: 100%" class="premium-table">
      <el-table-column label="账号信息" min-width="200">
        <template #default="{ row }">
          <div class="user-info">
            <el-avatar :size="40" :src="row.avatar" class="avatar" />
            <div class="details">
              <div class="name">{{ row.name }}</div>
              <div class="username">@{{ row.username }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column prop="role" label="角色" width="120">
        <template #default="{ row }">
          <el-tag :type="row.role === 'admin' ? 'danger' : 'success'" effect="light">
            {{ row.role === 'admin' ? '管理员' : '员工' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="在线状态" width="120">
        <template #default="{ row }">
          <div class="status-dot-container">
            <span class="status-dot" :class="row.onlineStatus === 'ONLINE' ? 'online' : 'offline'"></span>
            <span class="status-text">{{ row.onlineStatus === 'ONLINE' ? '在线' : '离线' }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="账号状态" width="100">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            active-value="ENABLED"
            inactive-value="DISABLED"
            :disabled="isSelf(row)"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>

      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>

      <el-table-column label="最后登录" width="180">
        <template #default="{ row }">
          <div class="login-info">
            <div>{{ formatDate(row.lastLoginAt) || '-' }}</div>
            <div class="ip">{{ row.lastLoginIp || '' }}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="$emit('edit', row)">编辑</el-button>
          <el-divider direction="vertical" />
          <el-dropdown trigger="click" @command="handleCommand($event, row)">
            <el-button link type="primary">
              更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="reset">重置密码</el-dropdown-item>
                <el-dropdown-item 
                  command="delete" 
                  divided 
                  type="danger" 
                  :disabled="isSelf(row) || (role === 'admin' && tableData.length <= 1 && row.status === 'ENABLED')"
                >
                  删除账号
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="queryParams.page"
      v-model:page-size="queryParams.pageSize"
      :total="total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSearch"
      @current-change="fetchData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, ArrowDown } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import * as accountApi from '@/api/modules/account'
import { Account } from '@/api/modules/account'
import { useUserStore } from '@/stores/user'
import dayjs from 'dayjs'

const props = defineProps<{
  role: 'staff' | 'admin'
}>()

const emit = defineEmits(['edit'])

const userStore = useUserStore()
const loading = ref(false)
const tableData = ref<Account[]>([])
const total = ref(0)

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  keyword: '',
  status: ''
})

const isSelf = (row: Account) => {
  return row.username === userStore.user?.username
}

const formatDate = (date: string) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : ''
}

const fetchData = async () => {
  loading.value = true
  try {
    const apiCall = props.role === 'staff' ? accountApi.getStaffAccounts : accountApi.getAdminAccounts
    const res = await apiCall(queryParams)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

const handleStatusChange = async (row: Account) => {
  const statusText = row.status === 'ENABLED' ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确定要${statusText}账号「${row.name}」吗？`, '提示', {
      type: 'warning'
    })
    const apiCall = props.role === 'staff' ? accountApi.updateStaffStatus : accountApi.updateAdminStatus
    await apiCall(row.id, row.status)
    ElMessage.success(`${statusText}成功`)
  } catch {
    // 恢复状态
    row.status = row.status === 'ENABLED' ? 'DISABLED' : 'ENABLED'
  }
}

const handleCommand = (command: string | number | object, row: Account) => {
  const cmd = command as string
  if (cmd === 'reset') {
    handleResetPassword(row)
  } else if (cmd === 'delete') {
    handleDelete(row)
  }
}

const handleResetPassword = async (row: Account) => {
  try {
    await ElMessageBox.confirm(`确定要重置账号「${row.name}」的密码吗？重置后需告知用户及时修改。`, '重置密码', {
      type: 'warning'
    })
    const apiCall = props.role === 'staff' ? accountApi.resetStaffPassword : accountApi.resetAdminPassword
    await apiCall(row.id)
    ElMessage.success('密码重置成功')
  } catch {}
}

const handleDelete = async (row: Account) => {
  try {
    await ElMessageBox.confirm(`删除账号「${row.name}」后不可恢复，确定删除吗？`, '警告', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'error'
    })
    const apiCall = props.role === 'staff' ? accountApi.deleteStaffAccount : accountApi.deleteAdminAccount
    await apiCall(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {}
}

onMounted(() => {
  fetchData()
})

defineExpose({ fetchData })
</script>

<style lang="scss" scoped>
.account-table-container {
  padding-top: 10px;

  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;

    .search-input {
      width: 240px;
    }
    .status-select {
      width: 120px;
    }
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .details {
      .name {
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
      .username {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  .status-dot-container {
    display: flex;
    align-items: center;
    gap: 6px;

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      
      &.online {
        background-color: var(--el-color-success);
        box-shadow: 0 0 8px var(--el-color-success);
      }
      &.offline {
        background-color: var(--el-text-color-placeholder);
      }
    }
    .status-text {
      font-size: 13px;
    }
  }

  .login-info {
    font-size: 13px;
    .ip {
      font-size: 11px;
      color: var(--el-text-color-secondary);
    }
  }

  .premium-table {
    border-radius: 8px;
    overflow: hidden;
    
    :deep(.el-table__header-wrapper) {
      th {
        background-color: #f8fafc;
        font-weight: 600;
      }
    }
  }
}
</style>
