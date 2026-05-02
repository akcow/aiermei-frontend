const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'admin/src/api/modules');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

let restored = 0;
for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // We need to fix the broken strings.
  // The broken strings look like: '\/something' or \\/something\
  // We want to replace them with \\/something\
  
  // Replace '\/something'
  content = content.replace(/'\\\/(.*?)'/g, '${useUserStore().apiPrefix}/');
  
  // Replace \\/something
  content = content.replace(/\\\//g, '${useUserStore().apiPrefix}/');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    restored++;
    console.log('Fixed', file);
  }
}
console.log('Total fixed:', restored);
