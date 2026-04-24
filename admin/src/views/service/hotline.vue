<template>
  <div class="hotline-page">
    <div class="page-header">
      <h1 class="page-title">服务热线管理</h1>
      <el-button type="primary" @click="openHotlineEditor()">新增热线</el-button>
    </div>

    <div class="card section">
      <el-form :model="configForm" label-width="120px">
        <el-form-item label="客服二维码">
          <el-input v-model="configForm.serviceQrCodeUrl" placeholder="https://...">
            <template #append>
              <el-upload
                :show-file-list="false"
                :auto-upload="false"
                :on-change="handleQrChange"
                accept="image/*"
              >
                <el-button type="primary" class="upload-btn">从本地上传</el-button>
              </el-upload>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="二维码提示"><el-input v-model="configForm.serviceQrTips" /></el-form-item>
      </el-form>
      <el-button type="primary" @click="saveConfig">保存配置</el-button>
    </div>

    <div class="card section">
      <el-table :data="hotlines" style="width: 100%">
        <el-table-column prop="label" label="名称" min-width="180" />
        <el-table-column prop="number" label="号码" min-width="180" />
        <el-table-column prop="sort" label="排序" width="90" />
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column label="操作" width="130">
          <template #default="{ row }">
            <el-button type="primary" link @click="openHotlineEditor(row)">编辑</el-button>
            <el-button type="danger" link @click="removeHotline(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="editingHotline ? '编辑热线' : '新增热线'" width="460px">
      <el-form :model="hotlineForm" label-width="80px">
        <el-form-item label="名称" required><el-input v-model="hotlineForm.label" /></el-form-item>
        <el-form-item label="号码" required><el-input v-model="hotlineForm.number" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!canSaveHotline" @click="saveHotline">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { addHotline, deleteHotline, getHotlineConfig, updateHotlineConfig, type Hotline } from '@/api/modules/hotline'

const hotlines = ref<Hotline[]>([])
const configForm = reactive({ serviceQrCodeUrl: '', serviceQrTips: '' })
const handleFileUpload = (file: any, key: 'serviceQrCodeUrl') => {
  const reader = new FileReader()
  reader.onload = (e) => {
    configForm[key] = e.target?.result as string
  }
  reader.readAsDataURL(file.raw)
}
const handleQrChange = (file: any) => handleFileUpload(file, 'serviceQrCodeUrl')

const dialogVisible = ref(false)
const editingHotline = ref<Hotline | null>(null)
const hotlineForm = reactive({ label: '', number: '' })
const canSaveHotline = computed(() => Boolean(hotlineForm.label.trim()) && Boolean(hotlineForm.number.trim()))

async function reloadData() {
  const res = await getHotlineConfig()
  hotlines.value = res.data.hotlines
  configForm.serviceQrCodeUrl = res.data.serviceQrCodeUrl || ''
  configForm.serviceQrTips = res.data.serviceQrTips || ''
}

async function saveConfig() {
  try {
    await updateHotlineConfig({
      serviceQrCodeUrl: configForm.serviceQrCodeUrl,
      serviceQrTips: configForm.serviceQrTips,
      hotlines: hotlines.value
    })
    ElMessage.success('配置已保存')
  } catch {
    ElMessage.error('配置保存失败')
  }
}

function openHotlineEditor(hotline?: Hotline) {
  editingHotline.value = hotline || null
  hotlineForm.label = hotline?.label || ''
  hotlineForm.number = hotline?.number || ''
  dialogVisible.value = true
}

async function saveHotline() {
  if (!canSaveHotline.value) {
    ElMessage.warning('请先填写必填项：名称、号码')
    return
  }
  try {
    if (editingHotline.value) {
      const updated = hotlines.value.map((item) => {
        if (item.id !== editingHotline.value?.id) return item
        return { ...item, label: hotlineForm.label, number: hotlineForm.number }
      })
      await updateHotlineConfig({
        serviceQrCodeUrl: configForm.serviceQrCodeUrl,
        serviceQrTips: configForm.serviceQrTips,
        hotlines: updated
      })
    } else {
      await addHotline({ label: hotlineForm.label, number: hotlineForm.number })
    }
    dialogVisible.value = false
    await reloadData()
    ElMessage.success('热线已保存')
  } catch {
    ElMessage.error('热线保存失败')
  }
}

function removeHotline(id: string) {
  ElMessageBox.confirm('确认删除该热线？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteHotline(id)
      await reloadData()
      ElMessage.success('热线已删除')
    } catch {
      ElMessage.error('热线删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  void reloadData()
})
</script>

<style scoped lang="scss">
.section {
  padding: 14px;
  margin-bottom: 16px;
}

.upload-btn {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  &:active {
    transform: scale(0.92);
    filter: brightness(0.9);
  }
}
</style>
