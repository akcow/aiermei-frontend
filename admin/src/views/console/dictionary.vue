<template>
  <div class="console-page">
    <div class="page-header">
      <h1 class="page-title">字典管理</h1>
      <div class="header-actions">
        <el-input
          v-model="queryParams.keyword"
          placeholder="搜索标签名称/编码"
          clearable
          style="width: 240px"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </div>
    </div>

    <div class="card console-panel panel">
      <el-table 
        :data="tags" 
        v-loading="loading" 
        style="width: 100%"
        header-cell-class-name="table-header-cell"
        row-class-name="table-row"
      >
        <el-table-column prop="tagCode" label="标签编码" min-width="160">
          <template #default="{ row }">
            <code class="tag-code">{{ row.tagCode }}</code>
          </template>
        </el-table-column>
        <el-table-column prop="tagName" label="标签名称" min-width="150">
          <template #default="{ row }">
            <span class="tag-name-text">{{ row.tagName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="description-text">{{ row.description || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="useCount" label="使用次数" width="160" align="center" sortable>
          <template #default="{ row }">
            <el-statistic :value="row.useCount" :value-style="{ fontSize: '14px', fontWeight: '600' }" />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="150">
          <template #default="{ row }">
            <div class="status-indicator" :class="row.status === 'ACTIVE' ? 'active' : 'inactive'">
              <span class="dot"></span>
              <span class="text">{{ row.status === 'ACTIVE' ? '已启用' : '已禁用' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)" class="edit-btn">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" title="编辑标签" width="520px" destroy-on-close class="custom-dialog">
      <el-form :model="form" label-width="80px" label-position="left">
        <el-form-item label="标签编码">
          <el-input v-model="form.tagCode" disabled class="disabled-input" />
        </el-form-item>
        <el-form-item label="标签名称">
          <el-input v-model="form.tagName" disabled class="disabled-input" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入标签的详细业务描述..." 
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-segmented 
            v-model="form.status" 
            :options="[{ label: '启用', value: 'ACTIVE' }, { label: '禁用', value: 'INACTIVE' }]" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" round>取消</el-button>
          <el-button type="primary" :loading="saving" @click="handleSubmit" round class="submit-btn">提交更新</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getTagDictionary, updateTagDictionary } from '@/api/modules/admin-console'
import type { AdminTagDictItem } from '@/types'

const loading = ref(false)
const saving = ref(false)
const tags = ref<AdminTagDictItem[]>([])
const queryParams = reactive({
  keyword: '',
  status: ''
})

const dialogVisible = ref(false)
const form = reactive({
  tagCode: '',
  tagName: '',
  description: '',
  status: 'ACTIVE'
})

async function fetchTags() {
  loading.value = true
  try {
    const res = await getTagDictionary(queryParams)
    tags.value = Array.isArray(res.data) ? res.data : []
  } catch (error) {
    console.error('Failed to fetch tags:', error)
    ElMessage.error('获取标签字典失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  fetchTags()
}

function handleEdit(row: AdminTagDictItem) {
  form.tagCode = row.tagCode
  form.tagName = row.tagName
  form.description = row.description || ''
  form.status = row.status || 'ACTIVE'
  dialogVisible.value = true
}

async function handleSubmit() {
  saving.value = true
  try {
    await updateTagDictionary(form.tagCode, {
      description: form.description,
      status: form.status
    })
    ElMessage.success('标签更新成功')
    dialogVisible.value = false
    fetchTags()
  } catch (error) {
    console.error('Failed to update tag:', error)
    ElMessage.error('更新标签失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchTags()
})
</script>

<style scoped lang="scss">
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.panel {
  padding: 0;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* 表格样式美化 */
:deep(.table-header-cell) {
  background-color: #f9fafb !important;
  color: #374151 !important;
  font-weight: 600 !important;
  height: 50px;
}

:deep(.table-row) {
  height: 60px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f3f4f6 !important;
  }
}

.tag-code {
  font-family: 'Fira Code', 'Courier New', Courier, monospace;
  background-color: #f1f5f9;
  color: #475569;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
}

.tag-name-text {
  font-weight: 500;
  color: #111827;
}

.description-text {
  color: #6b7280;
  font-size: 14px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  
  .text {
    font-size: 13px;
  }
  
  &.active {
    .dot { background-color: #10b981; box-shadow: 0 0 6px rgba(16, 185, 129, 0.4); }
    .text { color: #059669; }
  }
  
  &.inactive {
    .dot { background-color: #9ca3af; }
    .text { color: #6b7280; }
  }
}

.edit-btn {
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
}

/* 弹窗与表单样式 */
.disabled-input {
  :deep(.el-input__inner) {
    background-color: #f9fafb;
    color: #9ca3af;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
}

.submit-btn {
  padding-left: 24px;
  padding-right: 24px;
  background-color: #111827;
  border-color: #111827;
  
  &:hover {
    background-color: #1f2937;
    border-color: #1f2937;
  }
}
</style>
