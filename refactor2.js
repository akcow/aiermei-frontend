const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'admin/src/api/modules');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

let replacedFiles = 0;

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  if (file === 'auth.ts') {
    content = content.replace(/\/analytics\/users\//g, '/admin/customers/');
  }

  // Replace `/admin/ -> `${useUserStore().apiPrefix}/
  content = content.split('`/admin/').join('`${useUserStore().apiPrefix}/');
  
  // Replace '/admin/something' -> `${useUserStore().apiPrefix}/something`
  // We use regex to match the string literal correctly.
  content = content.replace(/'\/admin\/(.*?)'/g, '`${useUserStore().apiPrefix}/$1`');

  if (content !== originalContent) {
    if (!content.includes('useUserStore')) {
      content = "import { useUserStore } from '@/stores/user'\n" + content;
    }
    fs.writeFileSync(filePath, content, 'utf-8');
    replacedFiles++;
    console.log('Updated', file);
  }
}
console.log('Total files updated:', replacedFiles);
