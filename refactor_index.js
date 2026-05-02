const fs = require('fs');

let content = fs.readFileSync('pages/content/index.vue', 'utf-8');

// 1. Add historyRequestVersion
content = content.replace(
  'let aiChatTrackedForCurrentSend = false;',
  'let aiChatTrackedForCurrentSend = false;\nlet historyRequestVersion = 0;'
);

// 2. modify openAIChat
content = content.replace(
  '  isAIChatOpen.value = true;\n\n  // 尝试恢复会话',
  '  isAIChatOpen.value = true;\n  historyRequestVersion++;\n  messages.value = [];\n\n  // 尝试恢复会话'
);

// 3. modify loadHistoryMessages
content = content.replace(
  /async function loadHistoryMessages\(cursor\?: string\) {[\s\S]*?isLoadingHistory\.value = false;\n  }\n}/,
  `async function loadHistoryMessages(cursor?: string) {
  if (!currentSessionId || isLoadingHistory.value) return;

  const currentVersion = historyRequestVersion;
  isLoadingHistory.value = true;
  try {
    const res = await getAiSessionMessages(currentSessionId, cursor, 20);
    if (currentVersion !== historyRequestVersion) return; // 版本不一致则丢弃

    if (res.code === 0 && res.data) {
      const historyMessages = res.data.list.map(msg => ({
        role: msg.role === 'USER' ? 'user' : 'ai',
        text: msg.content,
        seqNo: msg.seqNo
      }));

      if (cursor) {
        // 加载更多历史，合并去重
        const newMessages = [...historyMessages, ...messages.value];
        const map = new Map();
        newMessages.forEach(m => {
          const key = m.seqNo ? \`\${m.seqNo}_\${m.role}\` : \`\${Date.now()}_\${Math.random()}\`;
          if (!map.has(key)) map.set(key, m);
        });
        messages.value = Array.from(map.values()).sort((a, b) => (a.seqNo || 0) - (b.seqNo || 0));
      } else {
        // 首次加载历史
        messages.value = historyMessages;
        if (messages.value.length === 0) {
          messages.value = [
            { role: 'ai', text: '你好，我是你的产后照护助手。' },
            { role: 'ai', text: '你可以问我恢复、喂养、情绪或套餐问题。' }
          ];
        }
        nextTick(() => scrollToBottom());
      }

      nextCursor = res.data.nextCursor;
      hasMoreHistory = res.data.hasMore;
    }
  } catch (e) {
    console.error('Failed to load history messages:', e);
    if (currentVersion !== historyRequestVersion) return;
    if (messages.value.length === 0) {
      messages.value = [
        { role: 'ai', text: '你好，我是你的产后照护助手。' },
        { role: 'ai', text: '你可以问我恢复、喂养、情绪或套餐问题。' }
      ];
    }
  } finally {
    if (currentVersion === historyRequestVersion) {
      isLoadingHistory.value = false;
    }
  }
}`
);

// 4. modify closeAIChat
content = content.replace(
  '  isAIChatOpen.value = false;\n  if (sseConnection) {',
  '  isAIChatOpen.value = false;\n  historyRequestVersion++;\n  if (sseConnection) {'
);

// 5. modify handleSSEEvent delta
content = content.replace(
  "    case 'delta':\n      // 关闭等待动画\n      messages.value[messageIndex].isLoading = false;\n      messages.value[messageIndex].text += event.data.content;\n      scrollToBottom();\n      break;",
  "    case 'delta':\n      // 关闭等待动画\n      messages.value[messageIndex].isLoading = false;\n      const contentStr = typeof event.data === 'string' ? event.data : (event.data.content || '');\n      messages.value[messageIndex].text += contentStr;\n      scrollToBottom();\n      break;"
);

// 6. modify handleSSEEvent done
content = content.replace(
  "    case 'done':\n      sseConnection?.abort();\n      sseConnection = null;\n      break;",
  "    case 'done':\n      sseConnection?.abort();\n      sseConnection = null;\n      if (!messages.value[messageIndex].text) {\n        messages.value.pop();\n        historyRequestVersion++;\n        loadHistoryMessages();\n      }\n      break;"
);

fs.writeFileSync('pages/content/index.vue', content);
console.log('Done refactoring index.vue');
