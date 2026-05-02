const fs = require('fs');
let content = fs.readFileSync('pages/suite-details/index.vue', 'utf-8');

const match = content.match(/<view class="login-prompt" v-else>[\s\S]*?<\/view>/);
if (match) {
  content = content.replace(match[0], '');
  content = content.replace(
    '    <view class="overlay" v-if="selected">',
    match[0] + '\n\n    <view class="overlay" v-if="selected">'
  );
  fs.writeFileSync('pages/suite-details/index.vue', content);
  console.log('Fixed suite details login prompt position');
} else {
  console.log('Not found');
}
