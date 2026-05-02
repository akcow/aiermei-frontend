const fs = require('fs');

let content = fs.readFileSync('admin/src/views/users/index.vue', 'utf-8');

// 1. Better snapshot initialization and reset logic
content = content.replace(
  "const initialScoreSnapshot = ref('')",
  "const initialScoreSnapshot = ref('')\nconst initialNoteSnapshot = ref('')\n\nconst updateSnapshots = () => {\n  initialScoreSnapshot.value = JSON.stringify(scoreDimensions.map((x) => ({ key: x.key, score: x.score })))\n  initialNoteSnapshot.value = manualScoreNote.value\n}"
);
// Remove the duplicate definition if it exists
content = content.replace("const initialNoteSnapshot = ref('')\n", "");

// 2. Update openProfileDialog to reset state and snapshots
const openProfileDialogRefactor = `
async function openProfileDialog(user: Customer) {
  selectedUser.value = user
  // Reset score dimensions to defaults
  scoreDimensions[0].score = 60
  scoreDimensions[1].score = 55
  scoreDimensions[2].score = 65
  manualScoreNote.value = ''
  updateSnapshots()
  
  profileDialogVisible.value = true
  await loadProfileData(user.uid)
}
`;

content = content.replace(
  /async function openProfileDialog\(user: Customer\) \{[\s\S]*?\}/,
  openProfileDialogRefactor
);

// 3. Update loadProfileData to update snapshots after loading
content = content.replace(
  "initialNoteSnapshot.value = manualScoreNote.value",
  "updateSnapshots()"
);
content = content.replace(
  "initialScoreSnapshot.value = JSON.stringify(scoreDimensions.map((x) => ({ key: x.key, score: x.score })))",
  ""
);

// 4. Robust handleDialogBeforeClose with explicit model update
const handleDialogBeforeCloseRefactor = `
const handleDialogBeforeClose = (done: any) => {
  if (!hasUnsavedScoreChanges.value) {
    if (typeof done === 'function') {
      done()
    } else {
      profileDialogVisible.value = false
    }
    return
  }

  ElMessageBox.confirm('评分内容有未保存改动，确定关闭吗？', '未保存提示', {
    confirmButtonText: '仍然关闭',
    cancelButtonText: '继续编辑',
    type: 'warning',
    distinguishCancelAndClose: true
  }).then(() => {
    // Force close
    profileDialogVisible.value = false
    if (typeof done === 'function') done()
  }).catch(() => {
    // Keep open
  })
}
`;

content = content.replace(
  /function handleDialogBeforeClose\(done: \(\) => void\) \{[\s\S]*?\}/,
  handleDialogBeforeCloseRefactor
);

fs.writeFileSync('admin/src/views/users/index.vue', content);
console.log('Comprehensive fix for dialog closing and snapshots');
