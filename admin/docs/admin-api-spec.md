# 爱儿美管理后台 API 接口规范

> 本文档定义了管理后台系统所需的后端 API 接口规范，供后端开发参考。

## 1. 通用约定

### 1.1 Base URL

```
/api/v1/admin
```

### 1.2 认证方式

所有管理后台接口需要在请求头中携带 Token：

```
Authorization: Bearer <token>
```

### 1.3 统一响应结构

```json
{
  "code": 0,
  "message": "ok",
  "data": {},
  "requestId": "req_xxx",
  "timestamp": "2026-04-16T10:00:00+08:00"
}
```

### 1.4 分页请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | integer | 否 | 页码，默认 1 |
| pageSize | integer | 否 | 每页数量，默认 10 |

### 1.5 分页响应结构

```json
{
  "list": [],
  "page": 1,
  "pageSize": 10,
  "total": 100,
  "hasMore": true
}
```

---

## 2. 认证接口

### 2.1 管理员登录

**POST /admin/auth/login**

请求：
```json
{
  "username": "admin",
  "password": "password123"
}
```

响应：
```json
{
  "token": "jwt_token",
  "user": {
    "id": "admin_001",
    "username": "admin",
    "name": "管理员",
    "avatar": "https://cdn.xxx/avatar.png",
    "role": "admin",
    "permissions": ["*"],
    "createdAt": "2026-01-01T00:00:00+08:00"
  }
}
```

### 2.2 获取当前管理员信息

**GET /admin/auth/me**

响应：同上 user 对象

### 2.3 退出登录

**POST /admin/auth/logout**

---

## 3. 仪表盘接口

### 3.1 获取概览数据

**GET /admin/dashboard/overview**

响应：
```json
{
  "activeCustomers": 124,
  "todayVisits": 89,
  "orderCount": 23,
  "revenue": 12880000,
  "revenueLabel": "¥128,800",
  "avgStayMinutes": 12.5,
  "leadConversionRate": 42,
  "hotContentTitle": "产后28天黄金修复期"
}
```

---

## 4. 用户管理接口

### 4.1 获取用户列表

**GET /admin/customers**

请求参数：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | integer | 否 | 页码 |
| pageSize | integer | 否 | 每页数量 |
| keyword | string | 否 | 搜索关键词（姓名/手机号） |

响应：
```json
{
  "list": [
    {
      "uid": "user_001",
      "name": "101房间号宝妈",
      "avatar": "https://cdn.xxx/avatar.png",
      "phone": "138****0000",
      "memberLevel": "gold",
      "pregnancyInfo": {
        "type": "pregnancy",
        "date": "2026-08-15"
      },
      "tags": ["高意向", "套房咨询"],
      "lastActive": "2026-04-16T10:00:00+08:00",
      "createdAt": "2026-03-01T00:00:00+08:00"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 50,
  "hasMore": true
}
```

### 4.2 获取用户详情

**GET /admin/customers/{uid}**

### 4.3 获取用户路径

**GET /analytics/users/{uid}/journey**

响应：
```json
{
  "uid": "user_001",
  "paths": [
    { "path": "首页", "timestamp": "2026-04-16T10:00:00+08:00" },
    { "path": "月子中心", "timestamp": "2026-04-16T10:05:00+08:00" }
  ],
  "tags": ["高净值客户", "套房意向强"],
  "lastActive": "2026-04-16T10:30:00+08:00"
}
```

### 4.4 AI 用户分析

**POST /admin/users/{uid}/analysis**

请求：
```json
{
  "forceRefresh": false
}
```

响应：
```json
{
  "tags": ["高净值客户", "套房意向强", "关注产后康复"],
  "script": "建议先介绍行政套房，重点突出私密性和专业护理团队..."
}
```

---

## 5. 订单管理接口

### 5.1 获取订单列表

**GET /admin/orders**

请求参数：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | integer | 否 | 页码 |
| pageSize | integer | 否 | 每页数量 |
| status | string | 否 | 订单状态 |
| keyword | string | 否 | 订单号/客户姓名 |
| startDate | string | 否 | 开始日期 |
| endDate | string | 否 | 结束日期 |

响应：
```json
{
  "list": [
    {
      "id": "order_001",
      "orderNo": "AEM202604160001",
      "customerId": "user_001",
      "customerName": "101房间号宝妈",
      "customerPhone": "138****0000",
      "suiteId": "luxury",
      "suiteName": "尊享至尊套房",
      "originalAmount": 12880000,
      "discountAmount": 50000,
      "payableAmount": 12830000,
      "payableAmountLabel": "¥128,300",
      "status": "paid",
      "paymentMethod": "wechat",
      "paidAt": "2026-04-16T10:00:00+08:00",
      "createdAt": "2026-04-16T09:00:00+08:00",
      "remark": "预计下周到店咨询"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 30,
  "hasMore": false
}
```

### 5.2 获取订单详情

**GET /admin/orders/{id}**

### 5.3 确认订单

**POST /admin/orders/{id}/confirm**

### 5.4 取消订单

**POST /admin/orders/{id}/cancel**

请求：
```json
{
  "reason": "客户申请取消"
}
```

### 5.5 退款

**POST /admin/orders/{id}/refund**

请求：
```json
{
  "reason": "客户申请退款"
}
```

### 5.6 更新订单备注

**PUT /admin/orders/{id}/remark**

请求：
```json
{
  "remark": "备注内容"
}
```

### 5.7 获取订单统计

**GET /admin/orders/stats**

响应：
```json
{
  "total": 30,
  "pending": 6,
  "paid": 6,
  "completed": 12,
  "cancelled": 4,
  "refunded": 2,
  "totalRevenue": 12880000,
  "totalRevenueLabel": "¥128,800"
}
```

---

## 6. 文章管理接口

### 6.1 获取文章列表

**GET /admin/content/articles**

请求参数：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | integer | 否 | 页码 |
| pageSize | integer | 否 | 每页数量 |
| category | string | 否 | 分类 ID |
| status | string | 否 | 状态 |
| keyword | string | 否 | 标题关键词 |

响应：
```json
{
  "list": [
    {
      "id": "article_001",
      "title": "产后28天黄金修复期",
      "cover": "https://cdn.xxx/cover.jpg",
      "mediaUrl": "https://cdn.xxx/video.mp4",
      "type": "image",
      "category": "postpartum",
      "categoryLabel": "月子",
      "author": "专业营养师",
      "likes": 856,
      "views": 5200,
      "status": "published",
      "content": "<p>正文...</p>",
      "publishedAt": "2026-04-01T10:00:00+08:00",
      "createdAt": "2026-03-20T00:00:00+08:00",
      "updatedAt": "2026-04-01T10:00:00+08:00"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 30,
  "hasMore": true
}
```

### 6.2 获取文章详情

**GET /admin/content/articles/{id}**

### 6.3 创建文章

**POST /admin/content/articles**

请求：
```json
{
  "title": "文章标题",
  "category": "postpartum",
  "type": "image",
  "cover": "https://cdn.xxx/cover.jpg",
  "mediaUrl": "",
  "author": "作者名称",
  "content": "<p>正文内容</p>"
}
```

### 6.4 更新文章

**PUT /admin/content/articles/{id}**

### 6.5 删除文章

**DELETE /admin/content/articles/{id}**

### 6.6 发布文章

**POST /admin/content/articles/{id}/publish**

### 6.7 归档文章

**POST /admin/content/articles/{id}/archive**

### 6.8 获取分类列表

**GET /admin/content/categories**

响应：
```json
[
  { "id": "pregnancy", "label": "孕期", "sort": 1 },
  { "id": "postpartum", "label": "月子", "sort": 2 },
  { "id": "parenting", "label": "育儿", "sort": 3 },
  { "id": "nanny", "label": "月嫂", "sort": 4 }
]
```

---

## 7. 海报管理接口

### 7.1 获取海报列表

**GET /admin/content/banners**

响应：
```json
[
  {
    "id": "1",
    "title": "爱儿美品牌故事",
    "buttonText": "了解更多",
    "image": "https://cdn.xxx/banner.jpg",
    "detailTitle": "品牌故事详情",
    "detailContent": "详情内容...",
    "sort": 1,
    "status": "active",
    "createdAt": "2026-01-01T00:00:00+08:00"
  }
]
```

### 7.2 创建海报

**POST /admin/content/banners**

### 7.3 更新海报

**PUT /admin/content/banners/{id}**

### 7.4 删除海报

**DELETE /admin/content/banners/{id}**

---

## 8. 杂志管理接口

### 8.1 获取杂志列表

**GET /admin/content/magazines**

### 8.2 创建杂志

**POST /admin/content/magazines**

### 8.3 更新杂志

**PUT /admin/content/magazines/{id}**

### 8.4 删除杂志

**DELETE /admin/content/magazines/{id}**

---

## 9. 房型管理接口

### 9.1 获取房型列表

**GET /admin/content/suites**

响应：
```json
[
  {
    "id": "luxury",
    "name": "尊享至尊套房",
    "price": 12880000,
    "priceLabel": "¥128,800起",
    "size": "85㎡",
    "features": ["全景落地窗", "私人管家服务"],
    "coverImage": "https://cdn.xxx/suite.jpg",
    "images": ["https://cdn.xxx/1.jpg"],
    "description": "房型描述...",
    "facilities": ["24h呼叫系统", "智能马桶"],
    "status": "active",
    "sort": 1
  }
]
```

### 9.2 创建房型

**POST /admin/content/suites**

### 9.3 更新房型

**PUT /admin/content/suites/{id}**

### 9.4 删除房型

**DELETE /admin/content/suites/{id}**

---

## 10. 优惠券管理接口

### 10.1 获取优惠券列表

**GET /admin/coupons**

### 10.2 创建优惠券

**POST /admin/coupons**

请求：
```json
{
  "name": "产后康复代金券",
  "value": 50000,
  "minAmount": 0,
  "expiry": "2026-12-31",
  "totalCount": 100
}
```

### 10.3 更新优惠券

**PUT /admin/coupons/{id}**

### 10.4 删除优惠券

**DELETE /admin/coupons/{id}**

### 10.5 启用/禁用优惠券

**PUT /admin/coupons/{id}/status**

请求：
```json
{
  "status": "active"
}
```

---

## 11. 反馈管理接口

### 11.1 获取评价列表

**GET /admin/feedback/evaluations**

请求参数：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | integer | 否 | 页码 |
| pageSize | integer | 否 | 每页数量 |
| score | integer | 否 | 评分筛选 |

### 11.2 获取投诉列表

**GET /admin/feedback/complaints**

请求参数：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | integer | 否 | 页码 |
| pageSize | integer | 否 | 每页数量 |
| status | string | 否 | 状态筛选 |

### 11.3 更新投诉状态

**PUT /admin/feedback/complaints/{id}/status**

请求：
```json
{
  "status": "resolved",
  "note": "处理说明"
}
```

---

## 12. 状态枚举

### 订单状态
| 值 | 说明 |
|----|------|
| pending | 待支付 |
| paid | 已支付 |
| confirmed | 已确认 |
| completed | 已完成 |
| cancelled | 已取消 |
| refunded | 已退款 |

### 文章状态
| 值 | 说明 |
|----|------|
| draft | 草稿 |
| published | 已发布 |
| archived | 已归档 |

### 投诉状态
| 值 | 说明 |
|----|------|
| pending | 待处理 |
| processing | 处理中 |
| resolved | 已解决 |

### 投诉类型
| 值 | 说明 |
|----|------|
| SERVICE_QUALITY | 服务质量 |
| FACILITY_ENVIRONMENT | 设施环境 |
| CATERING_SUGGESTION | 餐饮建议 |
| OTHER | 其他 |

---

## 13. FAQ 管理接口

### 13.1 获取分类列表

**GET /admin/faq/categories**

响应：
```json
[
  { "id": "pregnancy", "name": "我的孕期", "sort": 1, "createdAt": "..." },
  { "id": "common", "name": "常见问题", "sort": 2, "createdAt": "..." }
]
```

### 13.2 创建分类

**POST /admin/faq/categories**

请求：
```json
{ "name": "分类名称", "sort": 1 }
```

### 13.3 更新分类

**PUT /admin/faq/categories/{id}**

### 13.4 删除分类

**DELETE /admin/faq/categories/{id}**

### 13.5 获取条目列表

**GET /admin/faq/items**

请求参数：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | integer | 否 | 页码 |
| pageSize | integer | 否 | 每页数量 |
| categoryId | string | 否 | 分类筛选 |

响应：
```json
{
  "list": [
    {
      "id": "faq_001",
      "categoryId": "common",
      "title": "隐私条款及账户问题",
      "content": "内容...",
      "sort": 1,
      "status": "active",
      "createdAt": "..."
    }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 20,
  "hasMore": true
}
```

### 13.6 创建条目

**POST /admin/faq/items**

### 13.7 更新条目

**PUT /admin/faq/items/{id}**

### 13.8 删除条目

**DELETE /admin/faq/items/{id}**

---

## 14. 服务热线管理接口

### 14.1 获取热线配置

**GET /admin/service/hotlines**

响应：
```json
{
  "hotlines": [
    { "id": "1", "label": "24小时尊享热线", "number": "400-106-1080", "sort": 1, "status": "active" },
    { "id": "2", "label": "前台预约咨询", "number": "010-8888-9999", "sort": 2, "status": "active" }
  ],
  "serviceQrCodeUrl": "https://cdn.xxx/service-qrcode.png",
  "serviceQrTips": "添加您的专属私教顾问"
}
```

### 14.2 更新热线配置

**PUT /admin/service/hotlines**

请求：
```json
{
  "hotlines": [...],
  "serviceQrCodeUrl": "...",
  "serviceQrTips": "..."
}
```

### 14.3 添加热线

**POST /admin/service/hotlines**

请求：
```json
{ "label": "新热线", "number": "400-xxx-xxxx" }
```

### 14.4 删除热线

**DELETE /admin/service/hotlines/{id}**

---

## 15. 中心板块管理接口

### 15.1 获取首页配置

**GET /admin/centers/home**

响应：
```json
{
  "heroImage": "https://cdn.xxx/storefront.jpg",
  "brandTitle": "AI ER MEI",
  "brandSubtitle": "RESIDENCES",
  "facilities": [
    {
      "id": "fac_1",
      "title": "智能恒温育婴室",
      "desc": "全天候恒温恒湿...",
      "image": "https://cdn.xxx/fac1.jpg",
      "sort": 1
    }
  ]
}
```

### 15.2 更新首页配置

**PUT /admin/centers/home**

### 15.3 获取板块列表

**GET /admin/centers/sections**

响应：
```json
[
  {
    "id": "env",
    "title": "爱儿美·环境",
    "desc": "奢华私密空间，极致舒适体验",
    "coverImage": "https://cdn.xxx/env-cover.jpg",
    "detailImage": "https://cdn.xxx/env-long.jpg",
    "sort": 1,
    "status": "active",
    "createdAt": "..."
  }
]
```

### 15.4 创建板块

**POST /admin/centers/sections**

### 15.5 更新板块

**PUT /admin/centers/sections/{id}**

### 15.6 删除板块

**DELETE /admin/centers/sections/{id}**
