const fs = require('fs');

let content = fs.readFileSync('admin/src/views/users/index.vue', 'utf-8');

// 1. Add Icon import
content = content.replace(
  "import dayjs from 'dayjs'",
  "import dayjs from 'dayjs'\nimport { View } from '@element-plus/icons-vue'"
);

// 2. Add API import
content = content.replace(
  "  getCustomerTagTrace,",
  "  getCustomerTagTrace,\n  getCustomerPhone,"
);

// 3. Add revealPhone function
const revealPhoneFunc = `
async function revealPhone(user: Customer) {
  try {
    const res = await getCustomerPhone(user.uid)
    user.phone = res.data.phone
  } catch (e) {
    ElMessage.error('获取完整手机号失败')
  }
}
`;

content = content.replace(
  "async function openTagTrace(tag: CustomerTag) {",
  revealPhoneFunc + "\nasync function openTagTrace(tag: CustomerTag) {"
);

// 4. Update Template - Card
content = content.replace(
  "<p>{{ user.phone || '-' }}</p>",
  `<p class="phone-meta">
                  <span>{{ user.phone || '-' }}</span>
                  <el-icon v-if="user.phone && user.phone.includes('*')" class="reveal-icon" @click.stop="revealPhone(user)"><View /></el-icon>
                </p>`
);

// 5. Update Template - Dialog
content = content.replace(
  "<p>{{ selectedUser.phone || '-' }}</p>",
  `<p class="phone-meta">
                <span>{{ selectedUser.phone || '-' }}</span>
                <el-icon v-if="selectedUser.phone && selectedUser.phone.includes('*')" class="reveal-icon" @click.stop="revealPhone(selectedUser)"><View /></el-icon>
              </p>`
);

// 6. Add CSS
const styles = `
.phone-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.reveal-icon {
  cursor: pointer;
  color: #409eff;
  transition: color 0.2s;
  font-size: 14px;

  &:hover {
    color: #66b1ff;
  }
}
`;

content = content.replace(
  "</style>",
  styles + "\n</style>"
);

fs.writeFileSync('admin/src/views/users/index.vue', content);
console.log('Fixed users index phone reveal');
