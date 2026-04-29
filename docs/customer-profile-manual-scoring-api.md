# 客户全景卡片与人工校准接口说明（员工端）

更新时间：2026-04-29  
适用页面：`/users` 客户管理（员工端）

## 1. 现有可复用接口（已在 `backend.openapi(2).json` 中存在）

1. `GET /api/v1/admin/customers`：客户列表  
2. `GET /api/v1/admin/customers/{uid}`：客户详情  
3. `GET /api/v1/analytics/users/{uid}/journey`：行为路径  
4. `POST /api/v1/admin/users/{uid}/analysis`：AI洞察分析  
5. `GET /api/v1/admin/customers/{uid}/tags`：用户标签列表  
6. `POST /api/v1/admin/customers/{uid}/tags`：手动新增用户标签  
7. `DELETE /api/v1/admin/customers/{uid}/tags/{tagCode}`：删除用户标签  

## 2. 现有缺口接口（需后端补齐）

说明：PRD 2.3 中“人工评分确认写库”“标签点击溯源”当前未完全被现有 OpenAPI 覆盖。

### 2.1 查询客户人工评分草稿

- Method: `GET`
- Path: `/api/v1/admin/customers/{uid}/manual-score`
- 作用：打开用户卡片时回填评分面板

### 2.2 提交人工评分确认

- Method: `POST`
- Path: `/api/v1/admin/customers/{uid}/manual-score:confirm`
- 作用：员工点击“确认提交”后落库

请求示例：

```json
{
  "dimensions": [
    { "key": "conversionIntent", "label": "转化意向度", "score": 75 },
    { "key": "spendingPower", "label": "消费能力", "score": 62 },
    { "key": "urgency", "label": "孕产急迫度", "score": 83 }
  ],
  "note": "客户月底前希望确认套餐"
}
```

### 2.3 查询标签纠偏日志

- Method: `GET`
- Path: `/api/v1/admin/customers/{uid}/tag-corrections`
- 作用：展示人工纠偏操作审计记录

### 2.4 查询标签溯源记录（新增，PRD 2.3 关键能力）

- Method: `GET`
- Path: `/api/v1/admin/customers/{uid}/tags/{tagCode}/trace`
- 作用：点击标签后可追溯触发来源，查看“哪一天、哪条记录”触发该标签

响应示例：

```json
{
  "code": 0,
  "message": "ok",
  "data": [
    {
      "id": "trace_001",
      "uid": "user_001",
      "tagCode": "high_intent",
      "tagName": "高意向",
      "sourceType": "AI_CHAT",
      "sourceEventType": "AI_CHAT",
      "sourceEventId": "chat_20260429_01",
      "sourceContext": "AI对话中客户明确询问本周可到店看房时间。",
      "occurredAt": "2026-04-29T09:36:00+08:00"
    },
    {
      "id": "trace_002",
      "uid": "user_001",
      "tagCode": "high_intent",
      "tagName": "高意向",
      "sourceType": "PAGE_VIEW",
      "sourceEventType": "PAGE_VIEW",
      "sourceEventId": "pv_20260429_23",
      "sourceContext": "连续浏览套餐详情页并停留超过 180 秒。",
      "occurredAt": "2026-04-29T10:12:00+08:00"
    }
  ],
  "requestId": "req_xxx",
  "timestamp": "2026-04-29T10:20:00+08:00"
}
```

## 3. 人工纠偏标签的溯源要求

若标签是人工纠偏新增（`sourceType=MANUAL`），仍应能在溯源弹窗正确显示。  
建议后端在 `trace` 接口中返回至少 1 条人工来源记录：

```json
{
  "id": "trace_manual_001",
  "uid": "user_001",
  "tagCode": "manual_budget_limited",
  "tagName": "预算偏谨慎",
  "sourceType": "MANUAL",
  "sourceEventType": "MANUAL_TAG_ADD",
  "sourceEventId": "corr_2059002",
  "sourceContext": "员工线下沟通后确认客户预算有限，手动补录标签。",
  "occurredAt": "2026-04-29T10:06:00+08:00"
}
```

实现建议：

1. `trace` 接口查询时，合并 AI 触发记录 + 人工纠偏日志。  
2. `sourceType` 建议枚举：`AI_CHAT | PAGE_VIEW | ARTICLE_VIEW | MANUAL`。  
3. `sourceEventType` 建议枚举：`AI_CHAT | PAGE_VIEW | ARTICLE_VIEW | MANUAL_TAG_ADD | MANUAL_TAG_REMOVE`。  
4. 对人工记录，`sourceEventId` 可直接回填 `tag-corrections` 的 `id`，便于审计追踪。  

### 2.5 列表卡片画像字段（建议补齐，避免前端临时推导）

现状：`/users` 列表卡片中“意向/消费/急迫”三维百分比与摘要，当前前端使用临时算法/拼接文案展示，不是后端真实数据。  
为接入真实后端，建议二选一：

1. 方案A：扩展 `GET /api/v1/admin/customers` 返回每个客户的轻量画像字段；  
2. 方案B：新增列表画像接口，例如 `GET /api/v1/admin/customers/card-profiles`。

建议字段（每个客户）：

```json
{
  "uid": "user_001",
  "profileSummary": "近期重点关注套餐咨询与到店时间确认。",
  "manualScoreSnapshot": {
    "conversionIntent": 75,
    "spendingPower": 62,
    "urgency": 83,
    "overallGrade": "B"
  }
}
```

字段说明：

1. `profileSummary`：列表卡片摘要（优先使用后端生成或缓存文本）。  
2. `manualScoreSnapshot`：最新人工评分快照（若无人工评分，可返回 AI 初评或 `null`）。  
3. 若后端不返回该字段，前端只能继续展示“推导值”，会与真实决策数据不一致。  
