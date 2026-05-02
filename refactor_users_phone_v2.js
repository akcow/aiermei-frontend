const fs = require('fs');

let content = fs.readFileSync('admin/src/views/users/index.vue', 'utf-8');

// 1. Add Hide icon import
content = content.replace(
  "import { View } from '@element-plus/icons-vue'",
  "import { View, Hide } from '@element-plus/icons-vue'"
);

// 2. Add togglePhone function and map
const togglePhoneFunc = `
const maskedPhoneMap = new Map<string, string>()

async function togglePhone(user: Customer) {
  if (!user.phone) return
  const isMasked = user.phone.includes('*')
  
  if (isMasked) {
    try {
      if (!maskedPhoneMap.has(user.uid)) {
        maskedPhoneMap.set(user.uid, user.phone)
      }
      const res = await getCustomerPhone(user.uid)
      user.phone = res.data.phone
    } catch (e) {
      ElMessage.error('获取完整手机号失败')
    }
  } else {
    const masked = maskedPhoneMap.get(user.uid)
    if (masked) {
      user.phone = masked
    }
  }
}
`;

content = content.replace(
  /async function revealPhone\(user: Customer\) \{[\s\S]*?\}/,
  togglePhoneFunc
);

// 4. Update Template - Card
content = content.replace(
  /<p class="phone-meta">[\s\S]*?<\/p>/,
  `<p class="phone-meta">
                  <span class="phone-text">{{ user.phone || '-' }}</span>
                  <el-icon v-if="user.phone && user.phone !== '-'" class="reveal-icon" @click.stop="togglePhone(user)">
                    <View v-if="user.phone.includes('*')" />
                    <Hide v-else />
                  </el-icon>
                </p>`
);

// 5. Update Template - Dialog
content = content.replace(
  /<p class="phone-meta">[\s\S]*?<\/p>/,
  `<p class="phone-meta">
                <span class="phone-text">{{ selectedUser.phone || '-' }}</span>
                <el-icon v-if="selectedUser.phone && selectedUser.phone !== '-'" class="reveal-icon" @click.stop="togglePhone(selectedUser)">
                  <View v-if="selectedUser.phone.includes('*')" />
                  <Hide v-else />
                </el-icon>
              </p>`
);

// 6. Update CSS
const newStyles = `
.phone-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.phone-text {
  font-family: 'Roboto Mono', 'Courier New', Courier, monospace;
  width: 105px;
  display: inline-block;
}

.reveal-icon {
  cursor: pointer;
  color: #409eff;
  transition: color 0.2s;
  font-size: 14px;
  flex-shrink: 0;

  &:hover {
    color: #66b1ff;
  }
}
`;

content = content.replace(
  /\.phone-meta \{[\s\S]*?\}\n\n\.reveal-icon \{[\s\S]*?\}\n/,
  newStyles
);

fs.writeFileSync('admin/src/views/users/index.vue', content);
console.log('Updated phone toggle and styles');
