const fs = require('fs');

// 1. Update Layout
let layout = fs.readFileSync('admin/src/views/layout/index.vue', 'utf-8');
layout = layout.replace("{ index: '/content/banners', title: 'Banner管理' }", "{ index: '/content/banners', title: '海报管理' }");
fs.writeFileSync('admin/src/views/layout/index.vue', layout);

// 2. Update Router
let router = fs.readFileSync('admin/src/router/index.ts', 'utf-8');
router = router.replace("meta: { title: 'Banner管理', roles: ['editor', 'viewer', 'staff'] }", "meta: { title: '海报管理', roles: ['editor', 'viewer', 'staff'] }");
fs.writeFileSync('admin/src/router/index.ts', router);

// 3. Update Mock Data (add images to suites)
let mockData = fs.readFileSync('admin/src/mock/data.ts', 'utf-8');
if (!mockData.includes('images: [')) {
  mockData = mockData.replace(
    "coverImage: 'https://picsum.photos/seed/suite1/600/400',",
    "coverImage: 'https://picsum.photos/seed/suite1/600/400',\n    images: ['https://picsum.photos/seed/suite1_1/800/600', 'https://picsum.photos/seed/suite1_2/800/600'],"
  );
  mockData = mockData.replace(
    "coverImage: 'https://picsum.photos/seed/suite2/600/400',",
    "coverImage: 'https://picsum.photos/seed/suite2/600/400',\n    images: ['https://picsum.photos/seed/suite2_1/800/600', 'https://picsum.photos/seed/suite2_2/800/600'],"
  );
  mockData = mockData.replace(
    "coverImage: 'https://picsum.photos/seed/suite3/600/400',",
    "coverImage: 'https://picsum.photos/seed/suite3/600/400',\n    images: ['https://picsum.photos/seed/suite3_1/800/600', 'https://picsum.photos/seed/suite3_2/800/600'],"
  );
  fs.writeFileSync('admin/src/mock/data.ts', mockData);
}

// 4. Update Mock Setup (handle /staff prefix)
let mockSetup = fs.readFileSync('admin/src/mock/setup.ts', 'utf-8');

if (!mockSetup.includes('normalizedPath')) {
  // Normalize path to handle /staff and /admin interchangeably in mock logic
  const normalizePathCode = `
    let normalizedPath = path;
    if (path.startsWith('/staff/')) {
      normalizedPath = path.replace('/staff/', '/admin/');
    }
`;

  mockSetup = mockSetup.replace(
    '    const body = parseData(config.data)',
    '    const body = parseData(config.data)\n' + normalizePathCode
  );

  // Use normalizedPath in later checks
  mockSetup = mockSetup.replace(/path === '\/admin/g, "normalizedPath === '/admin");
  mockSetup = mockSetup.replace(/path\.match\(\/\^\\\/admin/g, "normalizedPath.match(/^\\/admin");
  mockSetup = mockSetup.replace(/path\.startsWith\('\/admin'\)/g, "normalizedPath.startsWith('/admin')");

  // Also fix the contentCollections base paths if they use path instead of normalizedPath
  mockSetup = mockSetup.replace(
    'if (path === col.base && method === \'GET\') return createResponse(config, col.data)',
    'if (normalizedPath === col.base && method === \'GET\') return createResponse(config, col.data)'
  );
  mockSetup = mockSetup.replace(
    'if (path === col.base && method === \'POST\') {',
    'if (normalizedPath === col.base && method === \'POST\') {'
  );
  mockSetup = mockSetup.replace(
    'if (path.match(new RegExp(`^${col.base}\\\\/[^/]+$`)) && method === \'GET\') {',
    'if (normalizedPath.match(new RegExp(`^${col.base}\\\\/[^/]+$`)) && method === \'GET\') {'
  );
  mockSetup = mockSetup.replace(
    'if (path.match(new RegExp(`^${col.base}\\\\/[^/]+$`)) && method === \'PUT\') {',
    'if (normalizedPath.match(new RegExp(`^${col.base}\\\\/[^/]+$`)) && method === \'PUT\') {'
  );
  mockSetup = mockSetup.replace(
    'if (path.match(new RegExp(`^${col.base}\\\\/[^/]+$`)) && method === \'DELETE\') {',
    'if (normalizedPath.match(new RegExp(`^${col.base}\\\\/[^/]+$`)) && method === \'DELETE\') {'
  );

  fs.writeFileSync('admin/src/mock/setup.ts', mockSetup);
}
console.log('Admin side changes completed');
