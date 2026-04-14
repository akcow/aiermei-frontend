# 爱儿美前端响应文档

更新日期：2026-04-14

本文档面向前端联调，重点描述页面需要什么接口、接口返回什么字段、前端如何消费这些数据。

## 1. 通用约定

### 1.1 Base URL

```text
/api/v1
```

### 1.2 统一响应结构

```json
{
  "code": 0,
  "message": "ok",
  "data": {},
  "requestId": "req_20260401_xxx",
  "timestamp": "2026-04-01T14:30:00+08:00"
}
```

### 1.3 前端通用状态处理

| 错误码段 | 含义 | 前端处理逻辑 | 典型场景 |
| --- | --- | --- | --- |
| `0` | 成功 | 正常渲染数据 | 接口请求成功 |
| `4000` | 参数校验失败 | 提示具体字段错误 | 手机号格式错误、评价分数越界 |
| `4001` | 业务操作非法 | 弹出 Toast 提示 | 重复领取优惠券、订单状态不可取消 |
| `4003` | 未登录 / 授权失效 | 强制跳转登录页或弹出授权弹窗 | Token 过期或未携带 |
| `4004` | 资源完全不存在 | 跳转 404 或展示空态页 | 访问了不存在的房型 ID |
| `41xx` | 交易域专项错误 | 引导用户刷新或重新选券 | 价格发生变动、预定日期冲突 |
| `42xx` | 优惠券专项错误 | 提示券不可用原因 | 券已核销、不满足满减门槛 |
| `5xxx` | 服务器系统异常 | 报错并允许用户重试 | 数据库连接超时、三方接口挂了 |

### 1.4 金额字段约定

- **所有金额字段统一使用“分”作为单位，下发和提交都不得按“元”解释。**
- 示例：`price = 12880000` 表示 `¥128,800.00`，`value = 50000` 表示 `¥500.00`
- 所有展示文案统一使用 `priceLabel`、`valueLabel`、`payableAmountLabel` 等派生字段，前端不要自行拼接币种格式

### 1.5 流式响应约定

- AI 问答接口 `POST /ai/chat` 使用 `text/event-stream`（SSE）返回流式数据，不是一次性 JSON
- 前端按事件顺序消费并逐段追加渲染，实现打字机输出效果
- 流结束以 `event: done` 为准；若收到 `event: error`，前端应终止渲染并提示错误

### 1.6 下单链路约定

- 下单必须先调用 `POST /orders/preview` 获取最新算价结果，再调用 `POST /orders/submit`
- `POST /orders/submit` 必须原样提交 `previewToken`，后端据此校验价格、防止前端改价
- 订单相关金额字段统一使用 `originalAmount`、`discountAmount`、`payableAmount`，单位均为分

### 1.7 时间字段约定

- 场景一：系统绝对时间。适用于订单创建时间、支付时间、记录更新时间、聊天消息发送时间等客观已发生事件，统一使用带时区的 ISO 8601 字符串：`YYYY-MM-DDTHH:mm:ss+08:00`
- 场景二：纯日历时间。适用于预产期、生日、优惠券有效截止日等不带时分秒的抽象日期，统一使用字符串：`YYYY-MM-DD`
- 场景三：本地墙上时间。适用于产康预约时间、预计入住时间等绑定物理地点的未来计划，统一使用字符串：`YYYY-MM-DD HH:mm` 或 `YYYY-MM-DD HH:mm:ss`
- 前端禁止对场景二和场景三做时区换算；只有场景一允许按用户所在时区转换展示
- 第三方支付 SDK 的原样透传字段不受本规范约束，例如微信支付的 `payment.timeStamp` 仍按微信字段要求返回

### 1.8 登录态请求头约定

- 登录成功后，前端需缓存后端返回的 `token`
- 访问受保护接口时，统一携带请求头：`Authorization: Bearer <token>`
- 当前受保护接口至少包括：`GET /users/me`、`POST /auth/logout`、`GET /member/coupons`、`POST /orders/preview`、`POST /feedback/evaluations`
- 若后端返回 `4003`，前端应清理本地 token 并重新唤起登录

## 2. 页面与接口映射

| 页面 | 路由 | 主要接口 |
| --- | --- | --- |
| 首页 | `/` | `GET /banners` |
| 海报详情 | `/poster/:id` | `GET /posters/{id}`、`GET /appointments/qrcode` |
| 月子中心 | `/center` | `GET /centers/home`、`GET /centers/sections`、`GET /suites` |
| 月子中心板块详情 | `/center/:id` | `GET /centers/sections/{id}` |
| 下单确认 | `/booking` | `POST /orders/preview`、`POST /orders/submit` |
| 内容中心 | `/content` | `GET /content/fortune/today`、`GET /content/preset-questions`、`GET /content/categories`、`GET /content/articles`、`GET /content/articles/{id}` |
| 文章详情 | `/content/article/:id` | `GET /content/articles/{id}` |
| AI 问答弹层 | 内容中心弹层 | `POST /ai/chat` |
| 会员中心 | `/member` | `GET /member/home` |
| 杂志详情 | `/member/magazine/:id` | `GET /member/magazines/{id}` |
| 我的套餐 | `/member-sub/package` | `GET /member/packages`、`GET /member/packages/{id}` |
| 我的礼券 | `/member-sub/coupon` | `GET /member/coupons` |
| 我的产康 | `/member-sub/postpartum` | `GET /member/postpartum-services` |
| 服务热线 | `/member-sub/hotline` | `GET /service/hotlines` |
| 服务评价 | `/member-sub/evaluation` | `POST /feedback/evaluations` |
| 常见问题 | `/member-sub/faq` | `GET /faq/categories`、`GET /faq/items` |
| 管理后台 | `/admin` | `GET /admin/dashboard/overview`、`GET /analytics/users/{uid}/journey`、`POST /admin/users/{uid}/analysis` |

## 3. 登录与用户

### 3.1 微信登录

`POST /auth/wechat-login`

前端用途：

- 用户授权手机号或登录后换取 token
- 恢复受保护页面跳转

请求参数：

| 参数名 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| code | body | string | 是 | 微信登录凭证，前端通过微信授权获取 |
| encryptedPhoneData | body | string | 否 | 加密手机号数据，授权手机号场景传入 |
| iv | body | string | 否 | 解密手机号所需初始向量，授权手机号场景传入 |
| redirectUri | body | string | 否 | 登录成功后前端计划恢复跳转的页面地址 |

响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "token": "jwt_token",
    "refreshToken": "refresh_xxx",
    "expiresIn": 604800
  }
}
```

### 3.2 获取当前用户

`GET /users/me`

前端用途：

- 页面初始化恢复登录状态
- 会员中心顶部信息展示

请求参数：

| 参数名 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| Authorization | header | string | 是 | 登录态令牌，格式：`Bearer <token>` |

响应 `data`：

```json
{
  "uid": "user_123",
  "name": "111房间号宝妈",
  "avatar": "https://cdn.xxx/avatar.png",
  "phone": "138****0000",
  "memberLevel": "gold",
  "isLoggedIn": true,
  "pregnancyInfo": {
    "type": "pregnancy",
    "date": "2026-08-15"
  },
  "tags": [],
  "lastActive": "2026-04-01T14:30:00+08:00"
}
```

### 3.3 退出登录

`POST /auth/logout`

前端用途：

- 用户主动退出当前登录态
- 清理当前设备上的后端会话

请求参数：

| 参数名 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| Authorization | header | string | 是 | 当前登录态令牌，格式：`Bearer <token>` |

请求体：无

响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": null,
  "requestId": "req_20260413_xxx",
  "timestamp": "2026-04-13T09:50:00+08:00"
}
```

说明：

- 退出登录只失效当前 token 对应的 Redis session，不会批量踢掉同 UID 的其他活跃设备
- 前端在收到成功响应后，应立即清理本地 token、用户缓存和受保护页面状态

## 4. 首页与品牌内容

### 4.1 获取首页海报列表

`GET /banners`

前端用途：

- 首页轮播

请求参数：无

响应 `data`：

```json
[
  {
    "id": "1",
    "title": "爱儿美：给宝宝的第一份珍贵礼物",
    "buttonText": "品牌故事",
    "image": "https://cdn.xxx/poster1.jpg",
    "detailTitle": "爱儿美品牌故事",
    "detailContent": "爱儿美（Ai Er Mei）作为母婴护理行业的领军品牌..."
  }
]
```

### 4.2 获取海报详情

`GET /posters/{id}`

前端用途：

- 海报详情页图文展示

请求参数：

| 参数名 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | path | string | 是 | 海报 ID |

响应 `data`：

```json
{
  "id": "1",
  "title": "爱儿美品牌故事",
  "content": "这里是海报点击进入后的详细内容展示...",
  "image": "https://cdn.xxx/banner-detail.jpg"
}
```

兼容说明：

- 当前后端兼容 `GET /posters/{id}` 与 `GET /banners/{id}`，前端统一使用 `/posters/{id}`。

### 4.3 获取预约二维码

`GET /appointments/qrcode?sourceType=banner&sourceId=1`

前端用途：

- 海报详情页、房型详情页“立即预约”弹层

请求参数：

| 参数名 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| sourceType | query | string | 是 | 来源类型，例如 `banner`、`suite` |
| sourceId | query | string | 是 | 对应来源资源 ID |

响应 `data`：

```json
{
  "qrCodeUrl": "https://cdn.xxx/qrcode.png",
  "consultantName": "专属顾问A",
  "tips": "添加专属顾问，开启尊享服务"
}
```

## 5. 月子中心与房型套餐

### 5.1 获取月子中心首页

`GET /centers/home`

前端用途：

- 门店主视觉
- 品牌说明
- 设施简介区

请求参数：无

响应 `data`：

```json
{
  "heroImage": "https://cdn.xxx/storefront.jpg",
  "brandTitle": "AI ER MEI",
  "brandSubtitle": "RESIDENCES",
  "facilities": [
    {
      "id": "fac_1",
      "title": "智能恒温育婴室",
      "desc": "全天候恒温恒湿，配备专业育婴师及24小时监控系统。",
      "image": "https://cdn.xxx/fac1.jpg"
    }
  ]
}
```

### 5.2 获取中心板块列表

`GET /centers/sections`

前端用途：

- 月子中心页横向卡片滑动区

请求参数：无

响应 `data`：

```json
[
  {
    "id": "env",
    "title": "爱儿美·环境",
    "desc": "奢华私密空间，极致舒适体验",
    "coverImage": "https://cdn.xxx/env-cover.jpg"
  }
]
```

### 5.3 获取中心板块详情

`GET /centers/sections/{id}`

前端用途：

- `/center/:id` 长图详情页

请求参数：

| 参数名 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | path | string | 是 | 中心板块 ID |

响应 `data`：

```json
{
  "id": "env",
  "title": "爱儿美·环境",
  "detailImage": "https://cdn.xxx/env-long.jpg"
}
```

### 5.4 获取房型列表

`GET /suites`

前端用途：

- 月子中心页尊享套餐列表
- 会员中心“我的套餐”列表

请求参数：无

响应 `data`：

```json
[
  {
    "id": "luxury",
    "name": "尊享至尊套房",
    "price": 12880000,
    "priceLabel": "¥128,800起",
    "size": "85㎡",
    "features": ["全景落地窗", "私人管家服务", "顶级母婴护理设备"],
    "coverImage": "https://cdn.xxx/suite-cover.jpg"
  }
]
```

### 5.5 获取房型详情

`GET /suites/{id}`

前端用途：

- 房型详情弹层

请求参数：

| 参数名 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | path | string | 是 | 房型 ID |

响应 `data`：

```json
{
  "id": "luxury",
  "name": "尊享至尊套房",
  "price": 12880000,
  "priceLabel": "¥128,800起",
  "size": "85㎡",
  "features": ["全景落地窗", "私人管家服务", "顶级母婴护理设备"],
  "images": [
    "https://cdn.xxx/suite2-1.jpg",
    "https://cdn.xxx/suite2-2.jpg"
  ],
  "description": "该房型由国际知名设计师团队打造...",
  "facilities": ["24h呼叫系统", "智能马桶", "空气净化器", "专业护理床"]
}
```

### 5.6 预下单算价

`POST /orders/preview`

前端用途：

- 房型与礼券组合算价
- 下单确认页展示原价、优惠、应付金额
- 生成提交订单所需的 `previewToken`

请求参数：

| 参数名 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| suiteId | body | string | 是 | 购买的房型 ID |
| couponIds | body | array<string> | 否 | 本次勾选使用的礼券 ID 列表 |
| sourceType | body | string | 否 | 下单来源，例如 `banner`、`suite`、`member` |
| sourceId | body | string | 否 | 来源资源 ID，便于归因统计 |

请求：

```json
{
  "suiteId": "luxury",
  "couponIds": ["coupon_500"],
  "sourceType": "suite",
  "sourceId": "luxury"
}
```

响应 `data`：

```json
{
  "previewToken": "preview_20260402_xxx",
  "suite": {
    "id": "luxury",
    "name": "尊享至尊套房",
    "price": 12880000,
    "priceLabel": "¥128,800起"
  },
  "appliedCoupons": [
    {
      "id": "coupon_500",
      "name": "产后康复代金券",
      "discountAmount": 50000,
      "discountAmountLabel": "-¥500"
    }
  ],
  "originalAmount": 12880000,
  "discountAmount": 50000,
  "payableAmount": 12830000,
  "payableAmountLabel": "¥128,300",
  "expireAt": "2026-04-02T18:00:00+08:00"
}
```

### 5.7 提交订单并唤起支付

`POST /orders/submit`

前端用途：

- 基于预下单结果创建正式订单
- 返回微信支付参数，前端据此唤起支付

请求参数：

| 参数名 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| previewToken | body | string | 是 | `POST /orders/preview` 返回的预览令牌，提交时必须原样透传 |
| clientOrderNo | body | string | 是 | 前端生成的幂等单号，避免重复提交 |
| payChannel | body | string | 是 | 支付渠道，当前固定为 `wechat_miniapp` |
| agreementAccepted | body | boolean | 是 | 是否确认服务协议与支付须知 |
| remark | body | string | 否 | 下单备注 |

请求：

```json
{
  "previewToken": "preview_20260402_xxx",
  "clientOrderNo": "client_order_202604020001",
  "payChannel": "wechat_miniapp",
  "agreementAccepted": true,
  "remark": "预计下周到店咨询"
}
```

响应 `data`：

```json
{
  "orderId": "order_1001",
  "orderNo": "AEM202604020001",
  "payableAmount": 12830000,
  "paymentRequired": true,
  "expireAt": "2026-04-02T18:15:00+08:00",
  "payment": {
    "appId": "wx1234567890",
    "timeStamp": "1775116800",
    "nonceStr": "nonce_xxx",
    "package": "prepay_id=wx201410272009395522657a690389285100",
    "signType": "RSA",
    "paySign": "signature_xxx"
  }
}
```

## 6. 内容中心与 AI 问答

### 6.1 获取今日好运签

`GET /content/fortune/today`

前端用途：

- 内容中心顶部卡片

请求参数：无

响应 `data`：

```json
{
  "date": "2026-04-01",
  "suitable": "散步、听音乐",
  "avoid": "过度劳累",
  "greeting": "中午好，亲爱的宝妈。今天阳光明媚..."
}
```

说明：

- `fortune_card` 模板表内部以 JSON 数组维护候选项，后端按用户孕期阶段命中模板池，并基于“日期 + UID”固定抽取结果，组装为本接口字符串字段返回

### 6.2 获取预设问答

`GET /content/preset-questions?limit=2`

前端用途：

- 内容中心问答快捷入口

请求参数：

| 参数名 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| limit | query | integer | 否 | 返回的预设问答数量，默认 `2` |

响应 `data`：

```json
[
  {
    "id": "qa_1",
    "question": "产后脱发怎么办？",
    "answer": "产后脱发通常是由于激素水平变化引起的..."
  }
]
```

### 6.3 获取内容分类

`GET /content/categories`

请求参数：无

响应 `data`：

```json
[
  { "id": "pregnancy", "label": "孕期" },
  { "id": "postpartum", "label": "月子" },
  { "id": "parenting", "label": "育儿" },
  { "id": "nanny", "label": "月嫂" }
]
```

### 6.4 获取文章列表

`GET /content/articles?category=postpartum&page=1&pageSize=10`

前端用途：

- 内容中心 tab 切换后的文章列表

请求参数：

| 参数名 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| category | query | string | 是 | 文章分类 ID，对应 `/content/categories` 返回值 |
| page | query | integer | 否 | 页码，默认 `1` |
| pageSize | query | integer | 否 | 每页数量，默认 `10` |

响应 `data`：

```json
{
  "list": [
    {
      "id": "2",
      "title": "产后28天黄金修复期，你应该知道这些",
      "cover": "https://cdn.xxx/content.jpg",
      "type": "image",
      "category": "postpartum",
      "author": "专业营养师",
      "likes": 856
    }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 28,
  "hasMore": true
}
```

### 6.5 获取文章详情

`GET /content/articles/{id}`

前端用途：

- 内容中心文章卡片点击后进入详情页
- 展示图文正文或视频内容

请求参数：

| 参数名 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | path | string | 是 | 文章 ID（对应 `/content/articles` 列表项 `id`） |

响应 `data`：

```json
{
  "id": "article_001",
  "title": "产后28天黄金修复期，你应该知道这些",
  "cover": "https://cdn.xxx/content.jpg",
  "mediaUrl": "https://cdn.xxx/content.mp4",
  "type": "image",
  "category": "postpartum",
  "author": "专业营养师",
  "likes": 856,
  "content": "<p>正文内容...</p>",
  "publishedAt": "2026-04-14T10:00:00+08:00"
}
```

### 6.6 AI 问答（SSE 流式）

`POST /ai/chat`

前端用途：

- 内容中心 AI 问答弹层
- 按流式片段逐步渲染回复内容

请求参数：

| 参数名 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| sessionId | body | string | 否 | 会话 ID，续聊时传入；首次提问可不传，由后端创建 |
| message | body | string | 是 | 用户当前输入的问题内容 |

请求：

```json
{
  "sessionId": "chat_001",
  "message": "产后如何恢复？"
}
```

响应协议：

- `Content-Type: text/event-stream; charset=utf-8`
- 事件流由后端持续推送，前端需按到达顺序消费 `delta` 事件并追加文本

事件定义：

| event | data 示例 | 说明 |
| --- | --- | --- |
| start | `{"sessionId":"chat_001"}` | 流开始，返回会话 ID |
| delta | `{"content":"建议先保证休息，"}` | 增量文本片段，前端直接追加渲染 |
| suggestion | `{"items":["月子餐怎么吃？","如何科学开奶？"]}` | 推荐追问，通常在回答尾部返回 |
| done | `{"finishReason":"stop"}` | 正常结束，前端据此收口 |
| error | `{"code":5001,"message":"生成失败"}` | 流内错误，前端提示并中止 |

响应示例：

```text
event: start
data: {"sessionId":"chat_001"}

event: delta
data: {"content":"建议先保证休息，"}

event: delta
data: {"content":"再根据身体状态逐步开展产后修复。"}

event: suggestion
data: {"items":["月子餐怎么吃？","如何科学开奶？"]}

event: done
data: {"finishReason":"stop"}
```

## 7. 会员中心

### 7.1 获取会员中心首页

`GET /member/home`

前端用途：

- 用户基本信息
- 精选杂志轮播
- 快捷入口

请求参数：无

响应 `data`：

```json
{
  "user": {
    "uid": "user_123",
    "name": "111房间号宝妈",
    "avatar": "https://cdn.xxx/avatar.png",
    "memberLevel": "gold"
  },
  "magazines": [
    {
      "id": "mag_1",
      "title": "ECHOES of HER",
      "subtitle": "聆听她的新生之旅",
      "desc": "开启杂志",
      "cover": "https://cdn.xxx/mag1.jpg"
    }
  ],
  "serviceEntries": [
    { "id": "package", "label": "我的套餐" },
    { "id": "coupon", "label": "我的礼券" },
    { "id": "postpartum", "label": "我的产康" }
  ],
  "quickLinks": [
    { "id": "hotline", "label": "服务热线" },
    { "id": "evaluation", "label": "服务及评价" },
    { "id": "faq", "label": "常见问题" }
  ]
}
```

### 7.2 获取杂志详情

`GET /member/magazines/{id}`

前端用途：

- 会员中心杂志轮播卡片点击后进入详情页
- 展示杂志封面、摘要与正文

请求参数：

| 参数名 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| id | path | string | 是 | 杂志 ID（对应会员中心 `magazines` 列表项 `id`） |

响应 `data`：

```json
{
  "id": "mag_1",
  "title": "ECHOES OF HER",
  "subtitle": "聆听她的新生之旅",
  "cover": "https://cdn.xxx/mag1.jpg",
  "author": "爱儿美编辑部",
  "content": "<p>杂志正文内容...</p>",
  "publishedAt": "2026-04-14T10:00:00+08:00"
}
```

### 7.3 获取我的套餐

`GET /member/packages`

请求参数：无

响应 `data`：

```json
[
  {
    "id": "luxury",
    "name": "尊享至尊套房",
    "priceLabel": "¥128,800起",
    "size": "85㎡",
    "features": ["全景落地窗", "私人管家服务"],
    "coverImage": "https://cdn.xxx/suite-cover.jpg"
  }
]
```

### 7.4 获取我的礼券

`GET /member/coupons`

请求参数：无

响应 `data`：

```json
[
  {
    "id": 1,
    "name": "产后康复代金券",
    "value": 50000,
    "valueLabel": "¥500",
    "expiry": "2026-12-31",
    "status": "unused"
  }
]
```

### 7.5 获取我的产康服务

`GET /member/postpartum-services`

请求参数：无

响应 `data`：

```json
[
  {
    "id": 1,
    "name": "骨盆修复",
    "time": "2026-04-10 14:00",
    "status": "pending",
    "expert": "张老师"
  }
]
```

### 7.6 获取服务热线

`GET /service/hotlines`

请求参数：无

响应 `data`：

```json
{
  "hotlines": [
    { "label": "24小时尊享热线", "number": "400-106-1080" },
    { "label": "前台预约咨询", "number": "010-8888-9999" }
  ],
  "serviceQrCodeUrl": "https://cdn.xxx/service-qrcode.png",
  "serviceQrTips": "添加您的专属私教顾问"
}
```

### 7.7 获取 FAQ 分类

`GET /faq/categories`

请求参数：无

响应 `data`：

```json
[
  { "id": "pregnancy", "name": "我的孕期" },
  { "id": "common", "name": "常见问题" }
]
```

### 7.8 获取 FAQ 列表

`GET /faq/items?categoryId=common`

请求参数：

| 参数名 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| categoryId | query | string | 是 | FAQ 分类 ID，对应 `/faq/categories` 返回值 |

响应 `data`：

```json
[
  {
    "id": "faq_1",
    "categoryId": "common",
    "title": "隐私条款及账户问题",
    "content": "..."
  }
]
```

## 8. 评价与投诉

### 8.1 提交服务评价

`POST /feedback/evaluations`

前端用途：

- 服务评价表单提交

请求参数：

| 参数名 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| orderId | body | string | 否 | 关联的订单或服务单 ID |
| score | body | integer | 是 | 评分，建议范围 `1-5` |
| content | body | string | 否 | 文字评价内容 |
| anonymous | body | boolean | 否 | 是否匿名提交，默认 `false` |

成功响应 `data`：

```json
{
  "evaluationId": "eval_1001",
  "submitted": true
}
```

### 8.2 提交投诉建议

`POST /feedback/complaints`

前端用途：

- 预留投诉建议页

请求参数：

| 参数名 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| contactName | body | string | 否 | 联系人姓名 |
| phone | body | string | 否 | 联系电话，便于回访 |
| content | body | string | 是 | 投诉或建议内容 |
| relatedService | body | string | 否 | 关联服务名称或场景 |

成功响应 `data`：

```json
{
  "complaintId": "complaint_1001",
  "submitted": true
}
```

## 9. 管理后台

### 9.1 获取后台概览

`GET /admin/dashboard/overview`

请求参数：无

响应 `data`：

```json
{
  "activeCustomers": 124,
  "avgStayMinutes": 12.5,
  "leadConversionRate": 42,
  "hotContentTitle": "行政套房揭秘"
}
```

### 9.2 获取用户路径

`GET /analytics/users/{uid}/journey`

请求参数：

| 参数名 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| uid | path | string | 是 | 用户唯一 ID |

响应 `data`：

```json
{
  "uid": "user_123",
  "paths": [
    { "path": "首页", "timestamp": "2026-04-01T14:30:00+08:00" },
    { "path": "/content", "timestamp": "2026-04-01T14:31:40+08:00" }
  ],
  "tags": [],
  "lastActive": "2026-04-01T14:33:20+08:00"
}
```

### 9.3 AI 路径分析

`POST /admin/users/{uid}/analysis`

请求参数：

| 参数名 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| uid | path | string | 是 | 用户唯一 ID |
| forceRefresh | body | boolean | 否 | 是否忽略缓存并强制重新生成分析结果 |

响应 `data`：

```json
{
  "tags": ["高净值客户", "套房意向强"],
  "script": "建议先介绍行政套房，再补充产后康复服务价值。"
}
```

## 10. 登录拦截页面

以下页面或动作建议前端统一做登录校验：

- `/suite-details`
- `/booking`
- `/reminders`
- `/meals`
- `/mall`
- `/butler`

后端在这些接口上返回 `4003` 时，前端应弹出授权登录，并在登录成功后恢复目标动作。
