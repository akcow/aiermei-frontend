<template>
  <div class="console-page">
    <div class="page-header">
      <h1 class="page-title">设施字典管理</h1>
      <el-button type="primary" @click="openCreate">新增设施</el-button>
    </div>

    <div class="card console-panel panel">
      <el-table :data="rows" v-loading="loading">
        <el-table-column prop="title" label="标题" min-width="160" />
        <el-table-column prop="desc" label="描述" min-width="220" />
        <el-table-column prop="image" label="图片" min-width="280" show-overflow-tooltip />
        <el-table-column prop="sort" label="排序" width="90" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="remove(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑设施' : '新增设施'" width="640px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="标题" required><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.desc" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="图片" required>
          <div class="upload-row">
            <el-input v-model="form.image" placeholder="上传后自动回填" />
            <el-upload :show-file-list="false" :auto-upload="false" :on-change="onUploadChange" accept="image/*">
              <el-button>上传图片</el-button>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sort" :min="1" :step="1" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createCenterFacility,
  deleteCenterFacility,
  getCenterFacilities,
  updateCenterFacility,
  uploadFile
} from '@/api/modules/admin-console'
import type { CenterFacility } from '@/types'

const loading = ref(false)
const saving = ref(false)
const rows = ref<CenterFacility[]>([])

const dialogVisible = ref(false)
const editingId = ref('')
const form = reactive({ title: '', desc: '', image: '', sort: 1 })

async function load() {
  loading.value = true
  try {
    const res = await getCenterFacilities()
    rows.value = res.data
  } finally {
    loading.value = false
  }
}

function resetForm() {
  Object.assign(form, { title: '', desc: '', image: '', sort: 1 })
}

function openCreate() {
  editingId.value = ''
  resetForm()
  dialogVisible.value = true
}

function openEdit(row: CenterFacility) {
  editingId.value = row.id
  Object.assign(form, {
    title: row.title,
    desc: row.desc || '',
    image: row.image || '',
    sort: row.sort
  })
  dialogVisible.value = true
}

async function onUploadChange(file: any) {
  const raw = file?.raw as File | undefined
  if (!raw) return
  const res = await uploadFile(raw, 'center_facility_image')
  form.image = res.data.url
  ElMessage.success('上传成功')
}

async function save() {
  if (!form.title.trim()) {
    ElMessage.warning('标题不能为空')
    return
  }
  saving.value = true
  try {
    if (editingId.value) {
      await updateCenterFacility(editingId.value, form)
    } else {
      await createCenterFacility(form)
    }
    dialogVisible.value = false
    await load()
    ElMessage.success('保存成功')
  } finally {
    saving.value = false
  }
}

function remove(id: string) {
  ElMessageBox.confirm('确认删除该设施？', '提示', { type: 'warning' })
    .then(async () => {
      await deleteCenterFacility(id)
      await load()
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

onMounted(load)
</script>

<style scoped lang="scss">
.panel { padding: 16px; }
.upload-row { display: flex; gap: 8px; width: 100%; }
</style>
