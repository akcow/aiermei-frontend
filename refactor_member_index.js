const fs = require('fs');
let content = fs.readFileSync('pages/member/index.vue', 'utf-8');

// Change const articles = memberArticles; to ref
content = content.replace(
  'const articles = memberArticles;',
  'const articles = ref([...memberArticles]);'
);

// Import getMemberHome
content = content.replace(
  'import { getCurrentUser } from \'@/api/modules/member\';',
  'import { getCurrentUser, getMemberHome } from \'@/api/modules/member\';'
);

// Add API call in onShow
const onShowCode = `onShow(async () => {
  profile.value = getLocalProfile();
  const token = getToken();

  // 获取云端杂志列表
  try {
    const homeRes = await getMemberHome();
    if (homeRes.code === 0 && homeRes.data && homeRes.data.magazines && homeRes.data.magazines.length > 0) {
      articles.value = homeRes.data.magazines.map((m: any) => ({
        id: m.id,
        title: m.title,
        subtitle: m.subtitle,
        desc: m.desc,
        image: m.cover
      }));
    }
  } catch (e) {
    console.error('Failed to fetch member home:', e);
  }

  // 检查登录状态：profile.isLoggedIn 或 token 存在`;

content = content.replace(
  `onShow(async () => {
  profile.value = getLocalProfile();
  const token = getToken();

  // 检查登录状态：profile.isLoggedIn 或 token 存在`,
  onShowCode
);

fs.writeFileSync('pages/member/index.vue', content);
console.log('Member index modified.');
