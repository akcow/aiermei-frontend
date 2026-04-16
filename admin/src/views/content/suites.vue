<template>
  <div class="suites-page">
    <div class="page-header">
      <h1 class="page-title">房型管理</h1>
      <el-button type="primary" @click="showEditor()">
        <el-icon><Plus /></el-icon>
        新建房型
      </el-button>
    </div>
    
    <div class="suite-grid">
      <div v-for="suite in suites" :key="suite.id" class="suite-card card">
        <div class="suite-cover">
          <el-image :src="suite.coverImage" fit="cover" />
          <div class="suite-status">
            <el-tag :type="suite.status === 'active' ? 'success' : 'info'" size="small">
              {{ suite.status === 'active' ? '已上线' : '已下线' }}
            </el-tag>
          </div>
        </div>
        <div class="suite-content">
          <div class="suite-name">{{ suite.name }}</div>
          <div class="suite-price">{{ suite.priceLabel }}</div>
          <div class="suite-size">{{ suite.size }}</div>
          <div class="suite-features">
            <el-tag v-for="f in suite.features.slice(0, 3)" :key="f" size="small" type="info">
              {{ f }}
            </el-tag>
          </div>
          <div class="suite-actions">
            <el-button type="primary" link @click="showEditor(suite)">编辑</el-button>
            <el-button
              :type="suite.status === 'active' ? 'warning' : 'success'"
              link
              @click="toggleStatus(suite)"
            >
              {{ suite.status === 'active' ? '下线' : '上线' }}
            </el-button>
            <el-button type="danger" link @click="deleteSuiteHandle(suite)">删除</el-button>
          </div>
        </div>
      </div>
    </div>
    
    <el-dialog
      v-model="editorVisible"
      :title="editingSuite ? '编辑房型' : '新建房型'"
      width="700px"
      destroy-on-close
    >
      <el-form :model="suiteForm" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="名称" required>
              <el-input v-model="suiteForm.name" placeholder="房型名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="面积">
              <el-input v-model="suiteForm.size" placeholder="如：85㎡" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="价格(分)">
              <el-input-number v-model="suiteForm.price" :min="0" :step="10000" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序">
              <el-input-number v-model="suiteForm.sort" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="封面图">
          <ImageUpload v-model="suiteForm.coverImage" />
        </el-form-item>
        
        <el-form-item label="特色">
          <el-select v-model="suiteForm.features" multiple placeholder="选择特色" style="width: 100%">
            <el-option label="全景落地窗" value="全景落地窗" />
            <el-option label="私人管家服务" value="私人管家服务" />
            <el-option label="顶级母婴护理设备" value="顶级母婴护理设备" />
            <el-option label="独立会客区" value="独立会客区" />
            <el-option label="定制月子餐" value="定制月子餐" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="设施">
          <el-select v-model="suiteForm.facilities" multiple placeholder="选择设施" style="width: 100%">
            <el-option label="24h呼叫系统" value="24h呼叫系统" />
            <el-option label="智能马桶" value="智能马桶" />
            <el-option label="空气净化器" value="空气净化器" />
            <el-option label="专业护理床" value="专业护理床" />
            <el-option label="婴儿监护系统" value="婴儿监护系统" />
            <el-option label="私人影院" value="私人影院" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="描述">
          <el-input v-model="suiteForm.description" type="textarea" :rows="3" placeholder="房型描述" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="editorVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSuite">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { mockSuites } from '@/mock/data'
import ImageUpload from '@/components/ImageUpload.vue'
import type { Suite } from '@/types'

const suites = ref<Suite[]>([])
const editorVisible = ref(false)
const editingSuite = ref<Suite | null>(null)

const suiteForm = reactive({
  name: '',
  price: 0,
  size: '',
  coverImage: '',
  features: [] as string[],
  facilities: [] as string[],
  description: '',
  sort: 1
})

function showEditor(suite?: Suite) {
  editingSuite.value = suite || null
  if (suite) {
    Object.assign(suiteForm, {
      name: suite.name,
      price: suite.price,
      size: suite.size,
      coverImage: suite.coverImage,
      features: [...suite.features],
      facilities: suite.facilities ? [...suite.facilities] : [],
      description: suite.description || '',
      sort: suite.sort
    })
  } else {
    Object.assign(suiteForm, {
      name: '',
      price: 0,
      size: '',
      coverImage: '',
      features: [],
      facilities: [],
      description: '',
      sort: suites.value.length + 1
    })
  }
  editorVisible.value = true
}

function saveSuite() {
  if (editingSuite.value) {
    Object.assign(editingSuite.value, suiteForm, {
      priceLabel: `¥${(suiteForm.price / 100).toLocaleString()}起`
    })
    ElMessage.success('房型已更新')
  } else {
    suites.value.push({
      id: 'suite_' + Date.now(),
      ...suiteForm,
      priceLabel: `¥${(suiteForm.price / 100).toLocaleString()}起`,
      status: 'active'
    } as Suite)
    ElMessage.success('房型已创建')
  }
  editorVisible.value = false
}

function toggleStatus(suite: Suite) {
  suite.status = suite.status === 'active' ? 'inactive' : 'active'
  ElMessage.success(suite.status === 'active' ? '房型已上线' : '房型已下线')
}

function deleteSuiteHandle(suite: Suite) {
  ElMessageBox.confirm('确定删除该房型？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = suites.value.findIndex(s => s.id === suite.id)
    if (index > -1) suites.value.splice(index, 1)
    ElMessage.success('房型已删除')
  }).catch(() => {})
}

onMounted(() => {
  suites.value = [...mockSuites]
})
</script>

<style scoped lang="scss">
.suites-page {
  .suite-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
  }
  
  .suite-card {
    overflow: hidden;
    
    .suite-cover {
      position: relative;
      height: 180px;
      
      .el-image {
        width: 100%;
        height: 100%;
      }
      
      .suite-status {
        position: absolute;
        top: 12px;
        right: 12px;
      }
    }
    
    .suite-content {
      padding: 16px;
      
      .suite-name {
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 4px;
      }
      
      .suite-price {
        font-size: 18px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 4px;
      }
      
      .suite-size {
        font-size: 13px;
        color: #6b7280;
        margin-bottom: 12px;
      }
      
      .suite-features {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-bottom: 12px;
      }
      
      .suite-actions {
        display: flex;
        gap: 8px;
      }
    }
  }
}
</style>
