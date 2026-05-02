const fs = require('fs');

let content = fs.readFileSync('admin/src/views/content/suites.vue', 'utf-8');

// 1. Add images to form UI
const imagesTemplate = `
        <el-form-item label="封面" required><ImageUpload v-model="suiteForm.coverImage" biz-type="suite_cover" /></el-form-item>
        <el-form-item label="相册图">
          <div style="display: flex; flex-direction: column; width: 100%;">
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">
              <div v-for="(img, idx) in suiteForm.images" :key="idx" style="position: relative; width: 100px; height: 100px;">
                <el-image :src="img" fit="cover" style="width:100%; height:100%; border-radius: 4px;" />
                <el-button type="danger" circle size="small" @click="suiteForm.images.splice(idx, 1)" style="position: absolute; top: -5px; right: -5px; padding: 4px;"><el-icon><Delete /></el-icon></el-button>
              </div>
            </div>
            <ImageUpload v-model="tempImage" biz-type="suite_images" @update:modelValue="addSuiteImage" />
          </div>
        </el-form-item>
`;

content = content.replace(
  '<el-form-item label="封面" required><ImageUpload v-model="suiteForm.coverImage" biz-type="suite_cover" /></el-form-item>',
  imagesTemplate
);

// 2. Add Delete icon import and tempImage ref
content = content.replace(
  "import { ElMessage, ElMessageBox } from 'element-plus'",
  "import { ElMessage, ElMessageBox } from 'element-plus'\nimport { Delete } from '@element-plus/icons-vue'"
);

content = content.replace(
  "const suiteForm = reactive({",
  "const tempImage = ref('')\n\nfunction addSuiteImage(url: string) {\n  if (url) {\n    suiteForm.images.push(url)\n    tempImage.value = ''\n  }\n}\n\nconst suiteForm = reactive({"
);

// 3. Add images to reactive form
content = content.replace(
  "coverImage: '',",
  "coverImage: '',\n  images: [] as string[],"
);

// 4. Update assign for editing
content = content.replace(
  "coverImage: suite.coverImage,",
  "coverImage: suite.coverImage,\n      images: suite.images ? [...suite.images] : [],"
);

// 5. Update assign for creating
content = content.replace(
  "coverImage: '',",
  "coverImage: '',\n      images: [],"
);

// 6. Update payload
content = content.replace(
  "coverImage: suiteForm.coverImage,",
  "coverImage: suiteForm.coverImage,\n    images: suiteForm.images,"
);

fs.writeFileSync('admin/src/views/content/suites.vue', content);
console.log('Fixed admin suites images');
