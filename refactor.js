const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'admin/src/api/modules');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

// Admin exclusive endpoints that should NOT use apiPrefix (they will just use \ which is fine because if admin calls it, it resolves to /admin. If staff calls it, it resolves to /staff and fails, which is expected since it's admin-exclusive.)
// Exception: if there is an explicit requirement to KEEP it as string '/admin/...', but using \ is safe and uniform.
// But the document says "保持管理员治理页继续调用 /admin/*，不要迁移到 /staff". 
// If we use apiPrefix, it will evaluate to '/admin' for admins. So it naturally stays /admin.

let replacedFiles = 0;

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  if (file === 'auth.ts') {
    content = content.replace(/\/analytics\/users\//g, '/admin/customers/');
  }

  // replace string literals '/admin/something' -> \\/something\
  // Note: we only want to replace the '/admin/ part.
  // if we have get<any>('/admin/foo'), it becomes get<any>(\\/foo\)
  
  // A safe replace strategy:
  // First, replace \/admin/ -> \\/
  content = content.split('\/admin/').join('\\/');
  
  // Next, we need to handle '/admin/...' which are simple strings.
  // We can't just replace with \\ unless we change the closing quote.
  // Actually, we can just use regex to find '/admin/.*?' and change it to \\/... \
  // But regex for that is tricky.
  // Let's do it manually with regex.
  content = content.replace(/'\/admin\/(.*?)'/g, '\\/\\');

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
