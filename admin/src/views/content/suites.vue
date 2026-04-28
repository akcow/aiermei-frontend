<template>
  <div class="suites-page">
    <div class="page-header">
      <h1 class="page-title">套餐管理</h1>
      <el-button type="primary" @click="showEditor()">新增套餐</el-button>
    </div>

    <div class="grid">
      <div v-for="suite in suites" :key="suite.id" class="card suite-card">
        <el-image :src="suite.coverImage" fit="cover" class="cover" />
        <div class="body">
          <div class="name">{{ suite.name }}</div>
          <div class="price">{{ suite.priceLabel }}</div>
          <div class="meta">{{ suite.size || '-' }}</div>
          <div class="tags">
            <el-tag v-for="feature in suite.features.slice(0, 3)" :key="feature" size="small" type="info">{{ feature }}</el-tag>
          </div>
          <el-tag :type="suite.status === 'active' ? 'success' : 'info'" size="small">{{ suite.status === 'active' ? '启用' : '停用' }}</el-tag>
          <div class="actions">
            <el-button type="primary" link @click="showEditor(suite)">编辑</el-button>
            <el-button :type="suite.status === 'active' ? 'warning' : 'success'" link @click="toggleStatus(suite)">
              {{ suite.status === 'active' ? '停用' : '启用' }}
            </el-button>
            <el-button type="danger" link @click="deleteSuiteHandle(suite)">删除</el-button>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="editorVisible" :title="editingSuite ? '编辑套餐' : '新增套餐'" width="700px" destroy-on-close>
      <el-form :model="suiteForm" label-width="90px">
        <el-row :gutter="12">
          <el-col :span="12"><el-form-item label="名称" required><el-input v-model="suiteForm.name" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="面积"><el-input v-model="suiteForm.size" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12"><el-form-item label="价格(分)"><el-input-number v-model="suiteForm.price" :min="0" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="排序"><el-input-number v-model="suiteForm.sort" :min="1" style="width:100%" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="封面" required><ImageUpload v-model="suiteForm.coverImage" biz-type="suite_cover" /></el-form-item>
        <el-form-item label="特色"><el-select v-model="suiteForm.features" multiple allow-create filterable style="width:100%" /></el-form-item>
        <el-form-item label="设施"><el-select v-model="suiteForm.facilities" multiple allow-create filterable style="width:100%" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="suiteForm.description" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editorVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!canSaveSuite" @click="saveSuite">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createSuite, deleteSuite, getSuites, updateSuite } from '@/api/modules/media'
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

const canSaveSuite = computed(() => Boolean(suiteForm.name.trim()) && Boolean(suiteForm.coverImage.trim()))

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

async function saveSuite() {
  if (!canSaveSuite.value) {
    ElMessage.warning('请先填写必填项：名称、封面')
    return
  }
  const payload: Partial<Suite> = {
    name: suiteForm.name,
    price: suiteForm.price,
    size: suiteForm.size,
    coverImage: suiteForm.coverImage,
    features: suiteForm.features,
    facilities: suiteForm.facilities,
    description: suiteForm.description,
    sort: suiteForm.sort
  }

  try {
    if (editingSuite.value) {
      await updateSuite(editingSuite.value.id, payload)
      ElMessage.success('套餐已更新')
    } else {
      await createSuite({ ...payload, status: 'active' })
      ElMessage.success('套餐已创建')
    }
    editorVisible.value = false
    await loadSuites()
  } catch {
    ElMessage.error('操作失败')
  }
}

async function toggleStatus(suite: Suite) {
  try {
    await updateSuite(suite.id, { status: suite.status === 'active' ? 'inactive' : 'active' })
    ElMessage.success('状态已更新')
    await loadSuites()
  } catch {
    ElMessage.error('状态更新失败')
  }
}

function deleteSuiteHandle(suite: Suite) {
  ElMessageBox.confirm('确认删除该套餐？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteSuite(suite.id)
      ElMessage.success('套餐已删除')
      await loadSuites()
    } catch {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

async function loadSuites() {
  const res = await getSuites()
  suites.value = res.data
}

onMounted(() => {
  void loadSuites()
})
</script>

<style scoped lang="scss">
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.suite-card {
  overflow: hidden;
}

.cover {
  width: 100%;
  height: 180px;
}

.body {
  padding: 12px;
}

.name {
  font-size: 16px;
  font-weight: 600;
}

.price {
  font-size: 18px;
  font-weight: 600;
  margin: 4px 0;
}

.meta {
  color: #6b7280;
  font-size: 13px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 8px 0;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
</style>
