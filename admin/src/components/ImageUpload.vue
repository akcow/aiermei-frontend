<template>
  <div class="image-upload">
    <div class="upload-tabs">
      <el-radio-group v-model="uploadMode" size="small">
        <el-radio-button value="url">URL 输入</el-radio-button>
        <el-radio-button value="file">本地上传</el-radio-button>
      </el-radio-group>
    </div>
    
    <!-- URL 输入模式 -->
    <div v-if="uploadMode === 'url'" class="url-input">
      <el-input
        :model-value="modelValue"
        placeholder="请输入图片URL"
        @update:model-value="$emit('update:modelValue', $event)"
      >
        <template #prepend>
          <el-icon><Link /></el-icon>
        </template>
      </el-input>
    </div>
    
    <!-- 本地上传模式 -->
    <div v-else class="file-upload">
      <el-upload
        class="uploader"
        :show-file-list="false"
        :before-upload="beforeUpload"
        :http-request="handleUpload"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,image/bmp"
      >
        <div v-if="modelValue" class="preview-wrapper">
          <el-image :src="modelValue" fit="cover" class="preview-image" />
          <div class="preview-actions">
            <el-icon class="action-icon" @click.stop="handleClear"><Delete /></el-icon>
          </div>
        </div>
        <div v-else class="upload-trigger">
          <el-icon class="upload-icon"><Plus /></el-icon>
          <span class="upload-text">点击上传</span>
          <span class="upload-tip">支持 JPG / PNG / GIF / WebP / SVG</span>
        </div>
      </el-upload>
    </div>
    
    <!-- 预览（URL模式下） -->
    <div v-if="uploadMode === 'url' && modelValue" class="url-preview">
      <el-image :src="modelValue" fit="cover" class="preview-image-small">
        <template #error>
          <div class="image-error">
            <el-icon><Picture /></el-icon>
            <span>加载失败</span>
          </div>
        </template>
      </el-image>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Link, Plus, Delete, Picture } from '@element-plus/icons-vue'

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const uploadMode = ref<'url' | 'file'>('url')

// 校验文件
function beforeUpload(file: File) {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp'
  ]
  
  const isImage = allowedTypes.includes(file.type)
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传 JPG / PNG / GIF / WebP / SVG / BMP 格式的图片')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB')
    return false
  }
  
  return true
}

// 处理上传
async function handleUpload(options: { file: File }) {
  try {
    // 将文件转换为 base64 DataURL（实际项目中应上传到服务器）
    const base64 = await fileToBase64(options.file)
    emit('update:modelValue', base64)
    ElMessage.success('图片上传成功')
  } catch (error) {
    ElMessage.error('图片上传失败')
  }
}

// 文件转 Base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 清除图片
function handleClear() {
  emit('update:modelValue', '')
}
</script>

<style scoped lang="scss">
.image-upload {
  .upload-tabs {
    margin-bottom: 12px;
  }
  
  .url-input {
    width: 100%;
  }
  
  .url-preview {
    margin-top: 12px;
    
    .preview-image-small {
      width: 120px;
      height: 90px;
      border-radius: 6px;
      border: 1px solid #dcdfe6;
      overflow: hidden;
    }
  }
  
  .file-upload {
    .uploader {
      :deep(.el-upload) {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: border-color 0.2s;
        
        &:hover {
          border-color: #111827;
        }
      }
    }
    
    .upload-trigger {
      width: 200px;
      height: 150px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #fafafa;
      
      .upload-icon {
        font-size: 28px;
        color: #8c939d;
        margin-bottom: 8px;
      }
      
      .upload-text {
        font-size: 14px;
        color: #606266;
        margin-bottom: 4px;
      }
      
      .upload-tip {
        font-size: 12px;
        color: #909399;
      }
    }
    
    .preview-wrapper {
      width: 200px;
      height: 150px;
      position: relative;
      
      .preview-image {
        width: 100%;
        height: 100%;
      }
      
      .preview-actions {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s;
        
        .action-icon {
          font-size: 20px;
          color: #fff;
          cursor: pointer;
          
          &:hover {
            color: #f56c6c;
          }
        }
      }
      
      &:hover .preview-actions {
        opacity: 1;
      }
    }
  }
  
  .image-error {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;
    color: #909399;
    font-size: 12px;
    
    .el-icon {
      font-size: 24px;
      margin-bottom: 4px;
    }
  }
}
</style>
