<template>
  <div class="magazines-page">
    <div class="page-header">
      <h1 class="page-title">杂志管理</h1>
      <el-button type="primary" @click="showEditor()">
        <el-icon><Plus /></el-icon>
        新建杂志
      </el-button>
    </div>
    
    <div class="magazine-grid">
      <div v-for="mag in magazines" :key="mag.id" class="magazine-card card">
        <div class="magazine-cover">
          <el-image :src="mag.cover" fit="cover" />
        </div>
        <div class="magazine-content">
          <div class="magazine-title">{{ mag.title }}</div>
          <div class="magazine-subtitle">{{ mag.subtitle }}</div>
          <div class="magazine-meta">
            <span>{{ mag.author }}</span>
            <span v-if="mag.publishedAt">{{ formatDate(mag.publishedAt) }}</span>
          </div>
          <div class="magazine-status">
            <el-tag :type="mag.status === 'published' ? 'success' : 'warning'" size="small">
              {{ mag.status === 'published' ? '已发布' : '草稿' }}
            </el-tag>
          </div>
          <div class="magazine-actions">
            <el-button type="primary" link @click="showEditor(mag)">编辑</el-button>
            <el-button
              v-if="mag.status === 'draft'"
              type="success"
              link
              @click="publishMagazine(mag)"
            >发布</el-button>
            <el-button type="danger" link @click="deleteMagazineHandle(mag)">删除</el-button>
          </div>
        </div>
      </div>
    </div>
    
    <el-dialog
      v-model="editorVisible"
      :title="editingMagazine ? '编辑杂志' : '新建杂志'"
      width="600px"
      destroy-on-close
    >
      <el-form :model="magazineForm" label-width="80px">
        <el-form-item label="标题" required>
          <el-input v-model="magazineForm.title" placeholder="杂志标题" />
        </el-form-item>
        <el-form-item label="副标题">
          <el-input v-model="magazineForm.subtitle" placeholder="副标题" />
        </el-form-item>
        <el-form-item label="封面" required>
          <ImageUpload v-model="magazineForm.cover" />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="magazineForm.author" placeholder="作者" />
        </el-form-item>
        <el-form-item label="正文">
          <el-input
            v-model="magazineForm.content"
            type="textarea"
            :rows="8"
            placeholder="杂志正文（支持HTML）"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="editorVisible = false">取消</el-button>
        <el-button @click="saveDraft">保存草稿</el-button>
        <el-button type="primary" @click="saveAndPublish">发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { mockMagazines } from '@/mock/data'
import ImageUpload from '@/components/ImageUpload.vue'
import type { Magazine } from '@/types'
import dayjs from 'dayjs'

const magazines = ref<Magazine[]>([])
const editorVisible = ref(false)
const editingMagazine = ref<Magazine | null>(null)

const magazineForm = reactive({
  title: '',
  subtitle: '',
  cover: '',
  author: '',
  content: ''
})

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD')
}

function showEditor(mag?: Magazine) {
  editingMagazine.value = mag || null
  if (mag) {
    Object.assign(magazineForm, {
      title: mag.title,
      subtitle: mag.subtitle || '',
      cover: mag.cover,
      author: mag.author || '',
      content: mag.content
    })
  } else {
    Object.assign(magazineForm, {
      title: '',
      subtitle: '',
      cover: '',
      author: '',
      content: ''
    })
  }
  editorVisible.value = true
}

function saveDraft() {
  ElMessage.success('草稿已保存')
  editorVisible.value = false
}

function saveAndPublish() {
  ElMessage.success('杂志已发布')
  editorVisible.value = false
}

function publishMagazine(mag: Magazine) {
  mag.status = 'published'
  mag.publishedAt = new Date().toISOString()
  ElMessage.success('杂志已发布')
}

function deleteMagazineHandle(mag: Magazine) {
  ElMessageBox.confirm('确定删除该杂志？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = magazines.value.findIndex(m => m.id === mag.id)
    if (index > -1) magazines.value.splice(index, 1)
    ElMessage.success('杂志已删除')
  }).catch(() => {})
}

onMounted(() => {
  magazines.value = [...mockMagazines]
})
</script>

<style scoped lang="scss">
.magazines-page {
  .magazine-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }
  
  .magazine-card {
    overflow: hidden;
    
    .magazine-cover {
      height: 200px;
      
      .el-image {
        width: 100%;
        height: 100%;
      }
    }
    
    .magazine-content {
      padding: 16px;
      
      .magazine-title {
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 4px;
      }
      
      .magazine-subtitle {
        font-size: 13px;
        color: #6b7280;
        margin-bottom: 8px;
      }
      
      .magazine-meta {
        font-size: 12px;
        color: #9ca3af;
        margin-bottom: 8px;
        
        span:not(:last-child)::after {
          content: ' · ';
        }
      }
      
      .magazine-status {
        margin-bottom: 12px;
      }
      
      .magazine-actions {
        display: flex;
        gap: 8px;
      }
    }
  }
}
</style>
