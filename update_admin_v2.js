const fs = require('fs');

// 1. Update Layout
let layout = fs.readFileSync('admin/src/views/layout/index.vue', 'utf-8');
layout = layout.replace("title: 'Banner管理'", "title: '海报管理'");
fs.writeFileSync('admin/src/views/layout/index.vue', layout);

// 2. Update Router
let router = fs.readFileSync('admin/src/router/index.ts', 'utf-8');
router = router.replace("title: 'Banner管理'", "title: '海报管理'");
fs.writeFileSync('admin/src/router/index.ts', router);

// 3. Update Mock Data (add images to suites)
let mockData = fs.readFileSync('admin/src/mock/data.ts', 'utf-8');
mockData = mockData.replace(
  /coverImage: 'https:\/\/picsum\.photos\/seed\/suite(\d)\/600\/400',/g,
  (match, p1) => `coverImage: 'https://picsum.photos/seed/suite${p1}/600/400',\n    images: ['https://picsum.photos/seed/suite${p1}_1/800/600', 'https://picsum.photos/seed/suite${p1}_2/800/600'],`
);
fs.writeFileSync('admin/src/mock/data.ts', mockData);

// 4. Update Mock Setup (handle /staff prefix)
let mockSetup = fs.readFileSync('admin/src/mock/setup.ts', 'utf-8');

// Add normalizedPath declaration
mockSetup = mockSetup.replace(
  'const body = parseData(config.data)',
  "const body = parseData(config.data)\n\n    let normalizedPath = path;\n    if (path.startsWith('/staff/')) {\n      normalizedPath = path.replace('/staff/', '/admin/');\n    }"
);

// Global replacement of path with normalizedPath in specific contexts
// Use function replacement to avoid $ issues
mockSetup = mockSetup.replace(/path === '\/admin/g, () => "normalizedPath === '/admin");
mockSetup = mockSetup.replace(/path\.match\(\/\^\\\/admin/g, () => "normalizedPath.match(/^\\/admin");
mockSetup = mockSetup.replace(/path\.startsWith\('\/admin'\)/g, () => "normalizedPath.startsWith('/admin')");

// Fix the loop inside setupMock
mockSetup = mockSetup.replace(/if \(path === col\.base && method === 'GET'\)/g, () => "if (normalizedPath === col.base && method === 'GET')");
mockSetup = mockSetup.replace(/if \(path === col\.base && method === 'POST'\)/g, () => "if (normalizedPath === col.base && method === 'POST')");
mockSetup = mockSetup.replace(/if \(path\.match\(new RegExp\(\`\^\$\{col\.base\}\\\\\/\[\^\/\]\+\$\`\|\`\^\$\{col\.base\}\\\\\/\[\^\/\]\+\$\`\)\) && method === 'GET'\)/g, () => "if (normalizedPath.match(new RegExp(`^${col.base}\\\\/[^/]+$`)) && method === 'GET')");
// The suites loop has specific regex, let's be more general
mockSetup = mockSetup.replace(/path\.match\(new RegExp\(\`\^\$\{col\.base\}/g, () => "normalizedPath.match(new RegExp(`^${col.base}");

fs.writeFileSync('admin/src/mock/setup.ts', mockSetup);
console.log('Admin side changes completed successfully');
