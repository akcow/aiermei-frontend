<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="brand">AI ER MEI</div>
        <div class="subtitle">月子中心管理后台</div>
      </div>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="用户名"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-tip">
        测试账号：admin / admin123
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { mockLogin } from '@/mock/data'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

async function handleLogin() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  
  loading.value = true
  try {
    // 使用 Mock 数据
    const { token, user } = await mockLogin(form.username, form.password)
    userStore.login(token, user)
    
    ElMessage.success('登录成功')
    
    const redirect = route.query.redirect as string
    router.push(redirect || { name: 'Dashboard' })
  } catch (error: unknown) {
    const err = error as Error
    ElMessage.error(err.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #111827 0%, #374151 100%);
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
  
  .brand {
    font-size: 32px;
    font-weight: 600;
    color: #111827;
    letter-spacing: 4px;
  }
  
  .subtitle {
    font-size: 14px;
    color: #6b7280;
    margin-top: 8px;
    letter-spacing: 1px;
  }
}

.login-form {
  :deep(.el-input__wrapper) {
    border-radius: 8px;
  }
}

.login-btn {
  width: 100%;
  border-radius: 8px;
  font-size: 16px;
  letter-spacing: 2px;
}

.login-tip {
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
  margin-top: 16px;
}
</style>
