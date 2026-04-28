# 管理员端联调接口文档（审批 + 评分常数 + 衰减常数 + 流量统计 + 文件上传）

本文档用于本期管理员端联调，覆盖以下五类接口：
1. 标签审批池（管理员审批相关）
2. 评分常数配置（管理员设置）
3. 衰减常数配置（管理员设置）
4. 流量统计（管理员看板）
5. 文件上传（管理员业务图片/视频）

## 1. 通用约定

### 1.1 基础路径
- 统一前缀：`/api/v1`

### 1.2 统一响应包
所有接口均返回：

```json
{
  "code": 0,
  "message": "ok",
  "data": {},
  "requestId": "req_1777777777777",
  "timestamp": "2026-04-26T00:30:00+08:00"
}
```

### 1.3 分页结构
分页接口 `data` 结构：

```json
{
  "list": [],
  "page": 1,
  "pageSize": 20,
  "total": 0,
  "hasMore": false
}
```

### 1.4 鉴权说明
- `admin/*` 接口：生产建议带 `Authorization: Bearer <token>`  
  本地如果 `aiermei.auth.admin-enabled=false`，可放行联调。
- `POST /files/upload`：必须登录；若上传管理员业务 `bizType`，需管理员登录态（`ADMIN_PASSWORD`）。

## 2. 标签审批池（管理员）

控制器：`/api/v1/admin/tag-pending`

### 2.1 查询待审批列表
- 方法：`GET /api/v1/admin/tag-pending`
- Query 参数：
  - `status`（可选，默认后端按 `PENDING`）
  - `keyword`（可选，按 `tagName/tagCode` 模糊匹配）
  - `page`（可选，默认 1）
  - `pageSize`（可选，默认 20，最大 100）

示例响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "list": [
      {
        "pendingId": "205001",
        "tagCode": "auto_1177456945",
        "tagName": "新手妈妈焦虑",
        "aiReason": "多条咨询内容体现焦虑情绪",
        "similarTag": "产后情绪支持",
        "similarity": 0.62122,
        "mentionCount": 8,
        "firstSeenAt": "2026-04-25T11:46:43+08:00",
        "lastSeenAt": "2026-04-25T11:47:28+08:00",
        "status": "PENDING",
        "candidateCount": 2,
        "topCandidate": {
          "tagCode": "postpartum_emotion_support",
          "tagName": "产后情绪支持",
          "similarity": 0.62122,
          "rankNo": 1
        }
      }
    ],
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "hasMore": false
  },
  "requestId": "req_xxx",
  "timestamp": "2026-04-26T00:00:00+08:00"
}
```

### 2.2 查询审批详情（含候选近义词）
- 方法：`GET /api/v1/admin/tag-pending/{pendingId}`
- Path 参数：`pendingId`

示例响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "pendingId": "205001",
    "tagCode": "auto_1177456945",
    "tagName": "新手妈妈焦虑",
    "aiReason": "多条咨询内容体现焦虑情绪",
    "similarTag": "产后情绪支持",
    "similarity": 0.62122,
    "mentionCount": 8,
    "firstSeenAt": "2026-04-25T11:46:43+08:00",
    "lastSeenAt": "2026-04-25T11:47:28+08:00",
    "status": "PENDING",
    "reviewedBy": null,
    "reviewedAt": null,
    "reviewAction": null,
    "mergedToTagCode": null,
    "candidateCount": 2,
    "candidates": [
      {
        "tagCode": "postpartum_emotion_support",
        "tagName": "产后情绪支持",
        "similarity": 0.62122,
        "rankNo": 1
      },
      {
        "tagCode": "new_mother_anxiety",
        "tagName": "新手妈妈焦虑",
        "similarity": 0.59012,
        "rankNo": 2
      }
    ]
  },
  "requestId": "req_xxx",
  "timestamp": "2026-04-26T00:00:00+08:00"
}
```

### 2.3 查询提及明细
- 方法：`GET /api/v1/admin/tag-pending/{pendingId}/mentions`
- Query 参数：
  - `page`（可选，默认 1）
  - `pageSize`（可选，默认 20）

示例响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "list": [
      {
        "uid": "2043507206234288129",
        "userName": null,
        "articleId": null,
        "sourceType": "AI_CHAT",
        "sourceContext": "宝宝又感冒了",
        "sourceEventId": "17770001",
        "sourceEventType": "AI_CHAT",
        "chatSessionId": "chat_2047",
        "chatMessageId": "2048123456789012345",
        "chatMessageSeqNo": 10,
        "analysisRecordId": "205123456789",
        "createdAt": "2026-04-25T11:47:28+08:00"
      }
    ],
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "hasMore": false
  },
  "requestId": "req_xxx",
  "timestamp": "2026-04-26T00:00:00+08:00"
}
```

说明：`userName` 字段当前后端未填充，现阶段可能为 `null`。

### 2.4 审批操作（APPROVE / REJECT / MERGE）
- 方法：`POST /api/v1/admin/tag-pending/{pendingId}/review`
- Path 参数：`pendingId`
- Body：

```json
{
  "action": "MERGE",
  "targetTagCode": "postpartum_emotion_support",
  "description": "并入现有标签"
}
```

字段说明：
- `action` 必填：`APPROVE` / `REJECT` / `MERGE`
- `targetTagCode`：`MERGE` 时必填，其它操作可不传
- `description`：可选

示例响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "pendingId": "205001",
    "finalStatus": "APPROVED",
    "resolvedTagCode": "postpartum_emotion_support",
    "backfilledUserCount": 3,
    "removedPendingUserTagCount": 3
  },
  "requestId": "req_xxx",
  "timestamp": "2026-04-26T00:00:00+08:00"
}
```

错误场景：
- `action` 非法 -> `code=4000`
- `MERGE` 未传 `targetTagCode` -> `code=4000`
- `pendingId` 不存在或已处理 -> `code=4000`

## 3. 评分常数（管理员配置）

### 3.1 管理员查询评分常数
- 方法：`GET /api/v1/admin/scoring-weights`

### 3.2 管理员更新评分常数
- 方法：`PUT /api/v1/admin/scoring-weights`
- Body：

```json
{
  "conversionIntent": 50,
  "spendingPower": 30,
  "recentActivity": 20
}
```

校验规则：
- 三个字段都必填
- 每项 `0~100` 整数
- 总和必须 `100`

管理员查询/更新响应结构一致：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "conversionIntent": 50,
    "spendingPower": 30,
    "recentActivity": 20,
    "total": 100,
    "updatedAt": "2026-04-26T00:00:00+08:00",
    "updatedBy": "admin_001"
  },
  "requestId": "req_xxx",
  "timestamp": "2026-04-26T00:00:00+08:00"
}
```

错误场景：
- 字段缺失/越界/格式错误 -> `code=4000`
- 三项总和不等于 100 -> `code=4000`

## 4. 衰减常数接口（管理员配置）

控制器：`/api/v1/admin/decay-config`

### 4.1 查询衰减参数列表
- 方法：`GET /api/v1/admin/decay-config`

示例响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": [
    {
      "eventType": "PAGE_VIEW",
      "eventLabel": "页面浏览",
      "initialWeight": 1.00,
      "lambda": 0.030000,
      "minWeight": 0.01
    },
    {
      "eventType": "AI_CHAT",
      "eventLabel": "AI对话",
      "initialWeight": 2.00,
      "lambda": 0.020000,
      "minWeight": 0.01
    }
  ],
  "requestId": "req_xxx",
  "timestamp": "2026-04-26T01:20:00+08:00"
}
```

### 4.2 更新单个事件类型衰减参数
- 方法：`PUT /api/v1/admin/decay-config/{eventType}`
- Path 参数：`eventType`（如 `PAGE_VIEW`、`CLICK`、`ARTICLE_VIEW`、`AI_CHAT`、`APPOINTMENT_INTENT`）
- Body（支持部分更新，传入字段才会被更新）：

```json
{
  "initialWeight": 1.20,
  "lambda": 0.028000,
  "minWeight": 0.02
}
```

示例响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "eventType": "PAGE_VIEW",
    "eventLabel": "页面浏览",
    "initialWeight": 1.20,
    "lambda": 0.028000,
    "minWeight": 0.02
  },
  "requestId": "req_xxx",
  "timestamp": "2026-04-26T01:20:00+08:00"
}
```

错误场景：
- `eventType` 不存在 -> `code=4000`
- 请求体字段格式非法（如非数字）-> `code=4000`

## 5. 流量统计接口（管理员看板）

控制器：`/api/v1/admin/dashboard`

### 5.1 查询流量来源分布
- 方法：`GET /api/v1/admin/dashboard/traffic-sources`
- Query 参数：
  - `days`（可选，默认 `7`，后端会限制在 `1~90`）

示例请求：

```http
GET /api/v1/admin/dashboard/traffic-sources?days=7
```

示例响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "days": 7,
    "total": 100,
    "sources": [
      {
        "sourceChannel": "mini_search",
        "label": "小程序搜索",
        "count": 45,
        "ratio": 0.45
      },
      {
        "sourceChannel": "friend_share",
        "label": "朋友圈裂变",
        "count": 32,
        "ratio": 0.32
      },
      {
        "sourceChannel": "ai_transfer",
        "label": "AI客服转接",
        "count": 23,
        "ratio": 0.23
      }
    ]
  },
  "requestId": "req_xxx",
  "timestamp": "2026-04-26T01:35:00+08:00"
}
```

字段说明：
- `total`：统计窗口内归因后总人数（身份去重口径）
- `sources[].sourceChannel`：`mini_search` / `friend_share` / `ai_transfer` / `other`
- `sources[].ratio`：`count / total`（小数）

### 5.2 统计口径（前端需知）
1. 仅统计 `PAGE_VIEW` 事件。
2. 去重身份键：`uid`（登录）或 `metadata.visitorId`（匿名）。
3. 每个身份在统计窗口内按首个可识别来源归因一次。
4. 来源映射由后端根据 `metadata.platform + metadata.scene` 自动计算并回填 `sourceChannel`。
5. 前端无需自行计算 `sourceChannel`，但建议稳定上报 `platform + scene`。

## 6. 文件上传接口（管理员场景）

控制器：`/api/v1/files`

### 6.1 统一上传接口
- 方法：`POST /api/v1/files/upload`
- Content-Type：`multipart/form-data`
- 表单字段：
  - `file`（必填，文件）
  - `bizType`（必填，字符串）

说明：
- 此接口是统一上传入口，管理员端与 C 端共用同一路径。

请求示例（curl）：

```bash
curl -X POST "http://127.0.0.1:8080/api/v1/files/upload" \
  -H "Authorization: Bearer <admin-token>" \
  -F "bizType=banner_image" \
  -F "file=@D:/tmp/banner.jpg"
```

响应示例：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "fileId": "2058888888888888888",
    "url": "https://cdn.example.com/dev/banner_image/2026/04/26/xxxx.jpg",
    "objectKey": "dev/banner_image/2026/04/26/xxxx.jpg",
    "mimeType": "image/jpeg",
    "sizeBytes": 128034,
    "bizType": "banner_image",
    "uploadedAt": "2026-04-26T01:10:00+08:00"
  },
  "requestId": "req_xxx",
  "timestamp": "2026-04-26T01:10:00+08:00"
}
```

### 6.2 本期管理员可用 bizType
- 图片类：
  - `banner_image`
  - `article_cover`
  - `magazine_cover`
  - `suite_cover`
  - `suite_gallery`
  - `center_hero`
  - `center_facility_image`
  - `center_section_cover`
  - `center_section_detail`
  - `service_qrcode`
- 视频类：
  - `article_media`

说明：
- `user_avatar` 为 C 端头像上传类型（普通登录用户可用）。

### 6.3 C 端头像上传（user_avatar）
- 方法：`POST /api/v1/files/upload`
- `bizType` 固定：`user_avatar`
- 鉴权：普通用户登录态即可（不要求管理员）。

请求示例（curl）：

```bash
curl -X POST "http://127.0.0.1:8080/api/v1/files/upload" \
  -H "Authorization: Bearer <user-token>" \
  -F "bizType=user_avatar" \
  -F "file=@D:/tmp/avatar.png"
```

响应结构与管理员上传一致（`fileId/url/objectKey/mimeType/sizeBytes/bizType/uploadedAt`）。

### 6.4 上传校验规则
- `bizType` 非法 -> `code=4000`
- 未登录 -> `code=4003`
- 非管理员上传管理员 `bizType` -> `code=4001`
- MIME 不支持 -> `code=4001`
- 文件过大 -> `code=4001`

默认大小上限（可配置）：
- 图片：10MB
- 视频：200MB

## 7. 前端联调建议（管理员端）

1. 审批池列表页：调用 `GET /admin/tag-pending`，支持 `status/keyword/page/pageSize`。
2. 详情弹窗：调用 `GET /admin/tag-pending/{pendingId}` + `GET /mentions`。
3. 审批按钮：
   - 通过 -> `action=APPROVE`
   - 拒绝 -> `action=REJECT`
   - 并入 -> `action=MERGE` 且传 `targetTagCode`
4. 评分权重页：
   - 首屏拉取 `GET /admin/scoring-weights`
   - 提交 `PUT /admin/scoring-weights`
5. 衰减常数页：
   - 首屏拉取 `GET /admin/decay-config`
   - 按事件类型提交 `PUT /admin/decay-config/{eventType}`
6. 流量分布卡片：
   - 调用 `GET /admin/dashboard/traffic-sources?days=7`
   - 使用返回的 `sources` 渲染占比条与图例
7. 设施管理页：
   - 查询 `GET /admin/centers/facilities`
   - 新增 `POST /admin/centers/facilities`
   - 编辑 `PUT /admin/centers/facilities/{id}`
   - 删除 `DELETE /admin/centers/facilities/{id}`
8. 各管理页面素材上传统一使用 `POST /files/upload`，拿到 `url` 后再回填到业务提交接口。
9. C 端头像上传同样使用 `POST /files/upload`，`bizType=user_avatar`。

## 8. 中心设施独立 CRUD（管理员）

控制器：`/api/v1/admin/centers/facilities`

### 8.1 查询设施列表
- 方法：`GET /api/v1/admin/centers/facilities`
- 说明：按 `sort` 升序返回。

示例响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": [
    {
      "id": "205888001",
      "title": "瑜伽室",
      "desc": "产后康复课程空间",
      "image": "https://cdn.xxx/facility-yoga.jpg",
      "sort": 1
    },
    {
      "id": "205888002",
      "title": "婴儿游泳区",
      "desc": "宝宝抚触与游泳",
      "image": "https://cdn.xxx/facility-swim.jpg",
      "sort": 2
    }
  ],
  "requestId": "req_xxx",
  "timestamp": "2026-04-26T12:00:00+08:00"
}
```

### 8.2 新增设施
- 方法：`POST /api/v1/admin/centers/facilities`
- Body：

```json
{
  "title": "母婴护理站",
  "desc": "24小时护士值守",
  "image": "https://cdn.xxx/facility-nurse.jpg",
  "sort": 3
}
```

校验规则：
- `title` 必填，不能为空字符串。

### 8.3 编辑设施
- 方法：`PUT /api/v1/admin/centers/facilities/{id}`
- Path 参数：`id`（设施业务ID）
- Body：支持部分更新，仅传入字段会更新。

```json
{
  "title": "母婴护理站（升级）",
  "desc": "新增夜间巡检服务",
  "sort": 4
}
```

说明：
- 若请求里传了 `title`，则不能为空字符串。

### 8.4 删除设施
- 方法：`DELETE /api/v1/admin/centers/facilities/{id}`
- Path 参数：`id`
- 响应：`data=null` 表示删除成功。

### 8.5 错误场景
- 设施不存在 -> `code=4004`
- `title` 为空或请求体非法 -> `code=4000`
