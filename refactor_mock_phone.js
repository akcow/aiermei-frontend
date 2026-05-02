const fs = require('fs');

let content = fs.readFileSync('admin/src/mock/setup.ts', 'utf-8');

const phoneMock = `
    if (normalizedPath.match(/^\\/admin\\/customers\\/[^/]+\\/phone$/) && method === 'GET') {
      const uid = path.split('/')[3]
      const customer = state.customers.find((x) => x.uid === uid)
      const lastFour = uid.slice(-4).padStart(4, '0')
      return createResponse(config, {
        uid,
        phone: \`1398888\${lastFour}\`,
        maskedPhone: customer?.phone || \`139****\${lastFour}\`,
        viewedAt: now()
      })
    }
`;

content = content.replace(
  "if (normalizedPath.match(/^\\/admin\\/customers\\/[^/]+\\/tags$/) && method === 'GET') {",
  phoneMock + "\n    if (normalizedPath.match(/^\\/admin\\/customers\\/[^/]+\\/tags$/) && method === 'GET') {"
);

fs.writeFileSync('admin/src/mock/setup.ts', content);
console.log('Fixed mock for phone reveal');
