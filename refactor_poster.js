const fs = require('fs');

let content = fs.readFileSync('pages/poster/detail.vue', 'utf-8');

content = content.replace(
  '<view class="desc">{{ detail.content }}</view>',
  '<rich-text class="desc" :nodes="safeContent"></rich-text>'
);

content = content.replace(
  "import { ref } from 'vue';",
  "import { ref, computed } from 'vue';"
);

content = content.replace(
  /const detail = ref<BannerDetail>\([\s\S]*?\}\);/,
  `const detail = ref<BannerDetail>({
  id: '0',
  title: '',
  content: '',
  image: 'https://picsum.photos/seed/detail/800/1200'
});

const safeContent = computed(() => {
  if (!detail.value.content) return '';
  return detail.value.content.replace(/<script\\b[^<]*(?:(?!<\\/script>)<[^<]*)*<\\/script>/gi, '');
});`
);

fs.writeFileSync('pages/poster/detail.vue', content);
console.log('Fixed poster rich text');
