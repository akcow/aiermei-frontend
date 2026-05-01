<template>
  <div class="profile-page">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span class="title">个人设置</span>
        </div>
      </template>

      <el-tabs v-model="activeTab" v-loading="fetchingInfo">
        <!-- 个人资料 -->
        <el-tab-pane label="个人资料" name="info">
          <el-form
            ref="infoFormRef"
            :model="infoForm"
            :rules="infoRules"
            label-width="100px"
            class="profile-form"
          >
            <el-form-item label="头像">
              <image-upload
                v-model="infoForm.avatar"
                :limit="1"
                biz-type="avatar"
                class="avatar-uploader"
              />
            </el-form-item>
            <el-form-item label="用户名">
              <el-input :model-value="userStore.user?.username" disabled />
            </el-form-item>
            <el-form-item label="姓名" prop="name">
              <el-input v-model="infoForm.name" placeholder="请输入姓名" />
            </el-form-item>
            <el-form-item label="角色">
              <el-tag>{{ userStore.isAdmin ? '管理员' : '员工' }}</el-tag>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="savingInfo" @click="handleSaveInfo">
                保存修改
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 修改密码 -->
        <el-tab-pane label="修改密码" name="password">
          <el-form
            ref="pwdFormRef"
            :model="pwdForm"
            :rules="pwdRules"
            label-width="100px"
            class="profile-form"
          >
            <el-form-item label="原密码" prop="oldPassword">
              <el-input
                v-model="pwdForm.oldPassword"
                type="password"
                show-password
                placeholder="请输入原密码"
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="pwdForm.newPassword"
                type="password"
                show-password
                placeholder="8-32位，包含字母和数字"
              />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="pwdForm.confirmPassword"
                type="password"
                show-password
                placeholder="请再次输入新密码"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="savingPwd" @click="handleSavePwd">
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getCurrentProfile, updateProfile, changePassword } from '@/api/modules/auth'
import ImageUpload from '@/components/ImageUpload.vue'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('info')
const fetchingInfo = ref(false)
const savingInfo = ref(false)
const savingPwd = ref(false)

// 个人资料表单
const infoFormRef = ref<FormInstance>()
const infoForm = reactive({
  name: '',
  avatar: ''
})

const infoRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
}

// 修改密码表单
const pwdFormRef = ref<FormInstance>()
const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPwd = (_rule: any, value: string, callback: any) => {
  if (value !== pwdForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const pwdRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, max: 32, message: '长度在 8 到 32 个字符', trigger: 'blur' },
    { pattern: /^(?=.*[a-zA-Z])(?=.*\d).+$/, message: '必须同时包含字母和数字', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPwd, trigger: 'blur' }
  ]
}

async function fetchUserProfile() {
  fetchingInfo.value = true
  try {
    const type = userStore.isAdmin ? 'admin' : 'staff'
    const res = await getCurrentProfile(type)
    userStore.setUser(res.data)
    
    // 同步表单
    infoForm.name = res.data.name
    infoForm.avatar = res.data.avatar || ''
  } catch (error) {
    console.error('获取用户信息失败:', error)
    // 如果获取失败，降级使用 store 中的旧数据
    if (userStore.user) {
      infoForm.name = userStore.user.name
      infoForm.avatar = userStore.user.avatar || ''
    }
  } finally {
    fetchingInfo.value = false
  }
}

onMounted(() => {
  fetchUserProfile()
})

async function handleSaveInfo() {
  const valid = await infoFormRef.value?.validate().catch(() => false)
  if (!valid) return

  savingInfo.value = true
  try {
    const type = userStore.isAdmin ? 'admin' : 'staff'
    const res = await updateProfile(infoForm, type)
    userStore.setUser(res.data)
    ElMessage.success('个人资料已更新')
  } catch (error) {
    console.error(error)
  } finally {
    savingInfo.value = false
  }
}

async function handleSavePwd() {
  const valid = await pwdFormRef.value?.validate().catch(() => false)
  if (!valid) return

  savingPwd.value = true
  try {
    const type = userStore.isAdmin ? 'admin' : 'staff'
    await changePassword(pwdForm, type)
    ElMessage.success('密码修改成功，请重新登录')
    userStore.logout()
    router.push({ name: 'Login' })
  } catch (error) {
    console.error(error)
  } finally {
    savingPwd.value = false
  }
}
</script>

<style scoped lang="scss">
.profile-page {
  max-width: 800px;
  margin: 0 auto;
}

.profile-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.card-header {
  .title {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
  }
}

.profile-form {
  max-width: 500px;
  padding: 20px 0;
}

.avatar-uploader {
  :deep(.el-upload) {
    border-radius: 50%;
  }
  :deep(.image-preview),
  :deep(.upload-slot) {
    width: 100px;
    height: 100px;
    border-radius: 50%;
  }
}
</style>
