const fs = require('fs');

let content = fs.readFileSync('pages/content/article.vue', 'utf-8');

const newToggleLike = `async function toggleLike() {
  if (!article.value || isLiking.value) return;

  if (!getToken()) {
    uni.showToast({ title: '请先登录后再点赞', icon: 'none' });
    return;
  }

  isLiking.value = true;
  const originalLiked = article.value.liked;
  const originalLikes = article.value.likes || 0;

  // 乐观更新
  article.value.liked = !originalLiked;
  article.value.likes = originalLiked ? Math.max(0, originalLikes - 1) : originalLikes + 1;

  try {
    let res;
    if (originalLiked) {
      res = await unlikeArticle(article.value.id);
    } else {
      res = await likeArticle(article.value.id);
    }
    if (res.code === 0 && res.data) {
      article.value.liked = res.data.liked === true;
      article.value.likes = res.data.likes;
    } else {
      article.value.liked = originalLiked;
      article.value.likes = originalLikes;
    }
  } catch (e: any) {
    article.value.liked = originalLiked;
    article.value.likes = originalLikes;
    if (e?.code === 4003) {
      uni.showToast({ title: '请先登录后再点赞', icon: 'none' });
    } else {
      uni.showToast({ title: '操作失败，请稍后重试', icon: 'none' });
    }
  } finally {
    isLiking.value = false;
  }
}`;

content = content.replace(
  /async function toggleLike\(\) {[\s\S]*?finally {\n    isLiking\.value = false;\n  }\n}/,
  newToggleLike
);

fs.writeFileSync('pages/content/article.vue', content);
console.log('Optimistic update added');
