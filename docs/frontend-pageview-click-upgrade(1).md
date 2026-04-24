# 前端 PAGE_VIEW / CLICK 事件升级文档

更新时间：2026-04-24

## 1. 目标与范围

### 1.1 目标

1. 提升 `PAGE_VIEW` 与 `CLICK` 事件的业务价值，支持后端用户画像、转化分析与路径归因。  
2. 建立统一的前端上报口径，避免“只知道访问了页面，不知道看了多久/为什么点击”。

### 1.2 本次范围

1. 仅升级 `PAGE_VIEW` 与 `CLICK`。  
2. **不改** `ARTICLE_VIEW`（文章详情已具备独立事件模型，本次不重复建设）。
3. 预约行为沿用既有 `APPOINTMENT_INTENT`，本次不新增预约相关 `CLICK` 写入。

### 1.3 接口与鉴权

1. 上报接口：`POST /api/v1/analytics/events/batch`。  
2. 支持两种鉴权方式：  
`Authorization: Bearer <token>`（登录态）或 `X-Analytics-Visitor-Token`（匿名态）。  
3. 匿名凭证接口：`POST /api/v1/analytics/visitor-token`。

### 1.4 当前缺失项（前端需补充）

1. 当前前端 `PAGE_VIEW` 上报普遍缺少流量来源字段，导致“流量分布详情”无法正确计算。  
2. 本次改为前端补充 `metadata.platform` 与 `metadata.scene`，不再强求前端传 `metadata.sourceChannel`。  
3. 最低要求：每个会话首次进入小程序的 `PAGE_VIEW` 必须携带：
`platform=wechat_mini` 与 `scene=<微信场景值>`。  
4. 匿名流量场景需补充 `metadata.visitorId`，并与 `visitor-token` 请求参数保持一致。  
5. 后端会基于 `platform + scene` 自动映射并回填 `sourceChannel`（`mini_search`/`friend_share`/`ai_transfer`/`other`）用于统计看板。

### 1.5 匿名流量接入流程（前端）

1. 小程序首次启动生成并持久化 `visitorId`（UUID v4）。  
2. 调用 `POST /api/v1/analytics/visitor-token` 获取 `visitorToken`。  
3. 匿名上报 `events/batch` 时携带请求头：`X-Analytics-Visitor-Token: <visitorToken>`。  
4. 匿名事件 `metadata` 必须包含 `visitorId`。  
5. 登录后可继续带 `visitorId`（用于前后行为并轨），同时使用 Bearer token。

### 1.6 场景值映射参考（后端默认）

1. `scene=1005` -> `mini_search`。  
2. `scene in [1007,1008,1044]` -> `friend_share`。  
3. 其他场景默认 -> `other`（`ai_transfer` 由后端配置表按场景值扩展）。  
4. 实际映射以后端配置为准，前端只需稳定上报 `platform + scene`。

### 1.7 前端如何获取当前 scene（微信小程序）

1. 冷启动（首次进入）在 `App.onLaunch` 通过 `uni.getLaunchOptionsSync()` 获取 `scene`。  
2. 热启动（从后台回前台）在 `App.onShow(options)` 使用 `options.scene` 更新当前 scene。  
3. 建议将 scene 缓存到全局状态（如 `pinia/globalStore`）并持久化一份（`uni.setStorageSync`），页面上报时统一读取。  
4. 若取不到 scene，按 `0` 上报并记录前端告警日志，避免字段缺失导致首个 `PAGE_VIEW` 被后端拒绝（strict 开启时）。

示例（uni-app）：

```ts
// App.vue / app.ts
onLaunch(() => {
  const launch = uni.getLaunchOptionsSync()
  const scene = Number(launch?.scene ?? 0)
  uni.setStorageSync('analytics_scene', scene)
})

onShow((options) => {
  const scene = Number(options?.scene ?? uni.getStorageSync('analytics_scene') ?? 0)
  uni.setStorageSync('analytics_scene', scene)
})

function buildPageViewMetadata(extra: Record<string, any> = {}) {
  return {
    platform: 'wechat_mini',
    scene: Number(uni.getStorageSync('analytics_scene') ?? 0),
    ...extra
  }
}
```

说明：

1. 页面 `PAGE_VIEW`/`CLICK` 上报时统一复用 `buildPageViewMetadata`，避免每页重复写取值逻辑。  
2. scene 为微信原生数值，前端不做渠道映射；映射由后端统一处理。

---

## 2. 统一事件字段口径

## 2.1 PAGE_VIEW（页面访问）

建议字段：

1. `eventId`：统一使用 UUID（建议 v4，小写字符串，36 位含连字符）。  
2. `eventType`：固定 `PAGE_VIEW`。  
3. `path`：页面路由（如 `/pages/suite-details/index`）。  
4. `pathName`：业务中文名（如 `套房详情`）。  
5. `occurredAt`：ISO8601（带时区）。  
6. `durationSeconds`：本次停留时长（秒）。  
7. `metadata`：页面级业务上下文（见第 3 节）。
8. `metadata.platform`：来源平台（当前统一 `wechat_mini`）。
9. `metadata.scene`：微信原生场景值（整数）。
10. 匿名上报时 `metadata.visitorId` 必填（UUID，与 visitor-token 绑定）。

时长计算规则（建议统一）：

1. 页面可见开始计时：`onShow`。  
2. 页面离开上报：`onHide`/`onUnload`。  
3. 过滤噪音：`durationSeconds < 3` 不上报。  
4. 异常上限：`durationSeconds > 3600` 统一按 `3600` 上报。

## 2.2 CLICK（点击）

建议字段：

1. `eventId`：统一使用 UUID（建议 v4，小写字符串，36 位含连字符）。  
2. `eventType`：固定 `CLICK`。  
3. `path`：点击发生所在页面。  
4. `pathName`：点击发生所在页面中文名。  
5. `occurredAt`：ISO8601（带时区）。  
6. `metadata.elementName`：按钮/卡片中文名。  
7. `metadata.elementId`：稳定元素 ID（前后端可对齐）。  
8. `metadata` 业务字段：按场景补充（见第 4 节）。

---

## 3. PAGE_VIEW 高价值页面清单

以下页面建议优先上报停留时长：

1. `/pages/suite-details/index`（套房详情）  
说明：高转化页面。  
metadata 建议：`suiteId`, `viewType(page|overlay)`, `fromPath`。

2. `/pages/poster/detail`（海报详情）  
说明：投放落地核心页。  
metadata 建议：`posterId`, `utm_source`, `utm_medium`, `utm_campaign`。

3. `/pages/content/index`（内容中心，含 AI 抽屉）  
说明：内容消费 + AI 咨询意向。  
metadata 建议：`viewType(content|ai_chat)`, `sessionId(若在AI场景)`。

4. `/pages/center/detail`（中心板块详情）  
说明：用户对护理/环境模块偏好。  
metadata 建议：`sectionId`, `sectionTitle`。

5. `/pages/center/index`（中心首页）  
说明：从品牌认知到套房点击的中间页。  
metadata 建议：`fromPath`, `utm_*`。

6. `/pages/member/magazine`（杂志）  
说明：长内容深度兴趣。  
metadata 建议：`magazineId`, `topic`。

补充要求：以上 PAGE_VIEW 场景均建议带 `platform + scene`，至少首个入场 PAGE_VIEW 必须带。

说明：`/pages/content/article` 继续走 `ARTICLE_VIEW`，不纳入本次 PAGE_VIEW 升级。

---

## 4. CLICK 高价值点位清单

1. 套房相关入口点击  
页面：`/pages/center/index`、`/pages/suite-details/index`  
metadata 建议：`elementName`, `elementId`, `suiteId`, `sourceSectionId`。

2. 内容中心关键交互  
页面：`/pages/content/index`  
metadata 建议：`elementName`, `elementId`, `tabId` 或 `entryPoint`（如打开 AI、切换分类）。

3. 会员页关键入口点击  
页面：`/pages/member/index`  
metadata 建议：`elementName`, `elementId`, `moduleId`（如 hotline、complaint、faq）。

说明：预约按钮/预约意向统一通过 `APPOINTMENT_INTENT` 事件上报，不纳入 `CLICK`。

---

## 5. 上报样例（仅 PAGE_VIEW / CLICK）

## 5.0 匿名 Token 获取

请求：

```json
{
  "visitorId": "6db4f8db-f1f3-4c8d-8c3e-7162ad59b6bd"
}
```

响应（`code=0`）：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "visitorToken": "eyJhbGciOiJIUzI1NiJ9.xxx.yyy",
    "expiresAt": "2026-04-24T22:10:00+08:00",
    "ttlSeconds": 1800
  }
}
```

## 5.1 PAGE_VIEW：套房详情停留时长

```json
{
  "events": [
    {
      "eventId": "2f8cf95d-a491-4f6f-ae45-7d068ad4f5ce",
      "eventType": "PAGE_VIEW",
      "path": "/pages/suite-details/index",
      "pathName": "套房详情",
      "occurredAt": "2026-04-24T21:20:30+08:00",
      "durationSeconds": 86,
      "metadata": {
        "visitorId": "6db4f8db-f1f3-4c8d-8c3e-7162ad59b6bd",
        "suiteId": "suite_1001",
        "viewType": "page",
        "fromPath": "/pages/center/index",
        "platform": "wechat_mini",
        "scene": 1001
      }
    }
  ]
}
```

## 5.2 PAGE_VIEW：海报详情停留时长

```json
{
  "events": [
    {
      "eventId": "ab6ac26f-2f74-4f9d-8d7e-d0b8ad5517ce",
      "eventType": "PAGE_VIEW",
      "path": "/pages/poster/detail",
      "pathName": "海报详情",
      "occurredAt": "2026-04-24T21:21:00+08:00",
      "durationSeconds": 42,
      "metadata": {
        "visitorId": "6db4f8db-f1f3-4c8d-8c3e-7162ad59b6bd",
        "posterId": "poster_1775432100002",
        "platform": "wechat_mini",
        "scene": 1005
      }
    }
  ]
}
```

## 5.3 CLICK：中心页点击进入套房

```json
{
  "events": [
    {
      "eventId": "613dbf12-642d-45bf-a84c-cc7148c66f41",
      "eventType": "CLICK",
      "path": "/pages/center/index",
      "pathName": "中心首页",
      "occurredAt": "2026-04-24T21:21:20+08:00",
      "metadata": {
        "visitorId": "6db4f8db-f1f3-4c8d-8c3e-7162ad59b6bd",
        "elementName": "套房卡片",
        "elementId": "suite-card",
        "suiteId": "suite_1001",
        "sourceSectionId": "center_suite_zone"
      }
    }
  ]
}
```

## 6. 前端实现注意点

1. `eventId` 统一 UUID（v4）；失败重试必须复用同一个 UUID，避免重复入库。  
2. 批量发送建议 `10-20` 条/批。  
3. `metadata` 统一对象结构，避免字符串拼接。  
4. 路由以实际页面为准，不强制去掉 `/index`。  
5. `ARTICLE_VIEW` 继续按现有逻辑上报，不在本次变更列表。
6. `PAGE_VIEW` 首次入场事件必须包含 `metadata.platform + metadata.scene`，否则无法产出流量分布看板。
7. 匿名事件必须携带 `X-Analytics-Visitor-Token` 请求头与 `metadata.visitorId`。  
8. 前端无需再传 `sourceChannel`，由后端基于 `platform + scene` 自动映射。

---

## 7. 验收清单

1. 套房详情页离开后，可看到 `PAGE_VIEW(durationSeconds + suiteId)`。  
2. 海报详情页离开后，可看到 `PAGE_VIEW(durationSeconds + posterId + utm)`。  
3. 关键点击（套房入口、内容中心关键交互、会员入口）可看到完整 `CLICK metadata`。  
4. 批量接口返回 `code=0`，`accepted > 0`。  
5. 文章页仍由 `ARTICLE_VIEW` 单独承担，不出现重复口径冲突。
6. 抽样检查 `PAGE_VIEW` 请求体，可见 `metadata.platform + metadata.scene`（尤其会话首个事件）。
7. 未登录状态下，携带 `X-Analytics-Visitor-Token` 仍可上报成功。  
8. 匿名事件若缺失 `metadata.visitorId` 或 visitorId 与 token 不一致，应被后端拒绝。
