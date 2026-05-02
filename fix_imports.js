const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'admin/src/api/modules');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  if (content.includes('useUserStore') && !content.includes("import { useUserStore }")) {
    content = "import { useUserStore } from '@/stores/user'\n" + content;
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Added import to', file);
  }
}
