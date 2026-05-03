<template>
  <div class="video-upload" :class="{ compact }">
    <div v-if="!compact" class="upload-header">
      <el-radio-group v-model="uploadMode" size="small" class="mode-switcher">
        <el-radio-button value="file">本地上传</el-radio-button>
        <el-radio-button value="url">URL 链接</el-radio-button>
      </el-radio-group>
    </div>

    <div class="upload-body">
      <!-- URL Mode -->
      <template v-if="uploadMode === 'url'">
        <div class="url-input-group">
          <el-input
            :model-value="modelValue"
            placeholder="粘贴视频链接..."
            size="default"
            @update:model-value="$emit('update:modelValue', $event)"
          >
            <template #prefix>
              <el-icon><Link /></el-icon>
            </template>
          </el-input>
          <div v-if="modelValue" class="url-preview-card">
            <video :src="modelValue" class="preview-video" controls></video>
            <div class="remove-overlay" @click="$emit('update:modelValue', '')">
              <el-icon><Delete /></el-icon>
            </div>
          </div>
        </div>
      </template>

      <!-- File Mode -->
      <template v-else>
        <el-upload
          class="file-uploader"
          :show-file-list="false"
          :before-upload="beforeUpload"
          :http-request="handleUpload"
          accept="video/*"
        >
          <div v-if="modelValue" class="preview-wrapper">
            <video :src="modelValue" class="preview-video" controls></video>
            <div class="preview-actions">
              <div class="action-btn" @click.stop="handleClear">
                <el-icon><Delete /></el-icon>
                <span>删除</span>
              </div>
            </div>
          </div>
          <div v-else class="upload-trigger" :class="{ 'compact-trigger': compact }">
            <el-icon class="upload-icon"><VideoCamera v-if="compact" /><VideoCameraFilled v-else /></el-icon>
            <template v-if="!compact">
              <span class="upload-text">点击或拖拽上传视频</span>
              <span class="upload-tip">支持 MP4/WebM，小于 100MB</span>
            </template>
            <template v-else>
              <span class="compact-text">上传</span>
            </template>
          </div>
        </el-upload>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Link, VideoCamera, VideoCameraFilled, Delete } from '@element-plus/icons-vue'
import { uploadFile } from '@/api/modules/admin-console'

const props = defineProps<{
  modelValue: string
  bizType: string
  compact?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const uploadMode = ref<'url' | 'file'>('file')

function beforeUpload(file: File) {
  const isVideo = file.type.startsWith('video/')
  if (!isVideo) {
    ElMessage.error('只能上传视频文件')
    return false
  }
  const isLt100M = file.size / 1024 / 1024 < 100
  if (!isLt100M) {
    ElMessage.error('视频大小不能超过 100MB')
    return false
  }
  return true
}

async function handleUpload(options: { file: File }) {
  try {
    const res = await uploadFile(options.file, props.bizType)
    emit('update:modelValue', res.data.url)
    ElMessage.success('上传成功')
  } catch (err: any) {
    ElMessage.error(err?.message || '上传失败')
  }
}

function handleClear() {
  emit('update:modelValue', '')
}
</script>

<style scoped lang="scss">
.video-upload {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &.compact {
    gap: 0;
    width: auto;
  }
}

.upload-header {
  display: flex;
  justify-content: flex-start;
}

.mode-switcher {
  :deep(.el-radio-button__inner) {
    border-radius: 4px !important;
    border: 1px solid #dcdfe6 !important;
    margin-right: 8px;
    padding: 6px 12px;
    background: #f5f7fa;
    color: #606266;
    box-shadow: none !important;
  }
  
  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background-color: #111827 !important;
    border-color: #111827 !important;
    color: #fff !important;
  }
}

.upload-body {
  width: 100%;
}

.url-input-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.url-preview-card {
  position: relative;
  width: 320px;
  height: 180px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  background: #000;

  .preview-video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .remove-overlay {
    position: absolute;
    top: 0;
    right: 0;
    padding: 6px;
    background: rgba(0,0,0,0.5);
    color: #fff;
    cursor: pointer;
    border-bottom-left-radius: 8px;
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 10;
  }

  &:hover .remove-overlay {
    opacity: 1;
  }
}

.file-uploader {
  :deep(.el-upload) {
    width: 100%;
    border: 2px dashed #e5e7eb;
    border-radius: 8px;
    transition: all 0.3s;
    background: #f9fafb;

    &:hover {
      border-color: #111827;
      background: #f3f4f6;
    }
  }
}

.upload-trigger {
  width: 100%;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;

  &.compact-trigger {
    width: 100px;
    height: 100px;
    min-height: auto;
    padding: 0;
  }

  .upload-icon {
    font-size: 32px;
    color: #9ca3af;
    margin-bottom: 8px;
  }

  .upload-text {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
  }

  .upload-tip {
    font-size: 12px;
    color: #9ca3af;
    margin-top: 4px;
  }

  .compact-text {
    font-size: 12px;
    color: #6b7280;
  }
}

.preview-wrapper {
  position: relative;
  width: 320px;
  height: 180px;
  border-radius: 6px;
  overflow: hidden;
  background: #000;

  .preview-video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .preview-actions {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 10;

    .action-btn {
      width: 32px;
      height: 32px;
      background: rgba(0,0,0,0.6);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      cursor: pointer;

      &:hover {
        color: #f87171;
        background: rgba(0,0,0,0.8);
      }

      span {
        display: none;
      }
    }
  }

  &:hover .preview-actions {
    opacity: 1;
  }
}
</style>
