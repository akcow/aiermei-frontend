# 管理员端前端问题与后端当前契约清单

更新时间：2026-04-24

> 本文档仅记录两类信息：  
> 1. 前端当前问题（现状）  
> 2. 目前后端契约（接口与关键返回口径）  

## 问题总览

| ID | 页面/模块 | 前端当前问题 | 当前状态 |
|---|---|---|---|
| ADM-FE-001 | 数据概览（Dashboard） | 页面仍使用本地 mock，不走真实接口 | 未对接 |
| ADM-FE-002 | 用户管理 | 列表/详情/分析仍走 mock，且标签字段按字符串渲染 | 未对接 |
| ADM-FE-003 | 杂志管理 | 页面仍走 mock，本地模拟发布/删除 | 未对接 |
| ADM-FE-004 | 房型管理 | 页面仍走 mock，本地模拟 CRUD/上下线 | 未对接 |
| ADM-FE-005 | FAQ/服务热线/中心板块 | 有 API 封装，但无页面/路由/菜单入口 | 未落地 |
| ADM-FE-006 | 文章管理（AI标签） | 新建/编辑弹窗缺少 AI 分析与标签增删能力 | 未落地 |

## ADM-FE-001 数据概览（Dashboard）

### 前端当前问题

1. `admin/src/views/dashboard/index.vue` 直接引入 `mockDashboardOverview/mockOrders/mockCustomers`。
2. 页面在 `onMounted` 使用 mock 切片构造“最新订单/最新用户”。
3. 未调用已存在的管理员仪表盘真实接口。

### 当前后端契约

1. `GET /admin/dashboard/overview`
2. 返回 `DashboardOverviewResponse`，核心字段：
   - `activeCustomers`
   - `todayVisits`
   - `orderCount`
   - `revenue`
   - `revenueLabel`
   - `avgStayMinutes`
   - `leadConversionRate`
   - `hotContentTitle`

## ADM-FE-002 用户管理

### 前端当前问题

1. `admin/src/views/users/index.vue` 直接引入 `mockCustomers/mockUserJourney/mockAnalysisResult`。
2. 列表加载使用 `setTimeout + mockCustomers` 模拟分页。
3. 详情抽屉中的“行为路径/AI分析”来自 mock 方法。
4. 标签展示逻辑按字符串数组渲染。

### 当前后端契约

1. `GET /admin/customers`  
   返回分页结构：`list/page/pageSize/total/hasMore`。
2. `GET /admin/customers/{uid}`  
   返回 `AdminCustomerResponse`。
3. `GET /analytics/users/{uid}/journey`  
   返回用户行为路径（`paths`）与最近活跃信息。
4. `POST /admin/users/{uid}/analysis`  
   返回用户分析结果（至少包含 `tags`、`script`）。
5. `AdminCustomerResponse.tags` 当前契约为对象数组 `List<TagItem>`，字段为：
   - `tagCode`
   - `tagName`
   - `source`

## ADM-FE-003 杂志管理

### 前端当前问题

1. `admin/src/views/content/magazines.vue` 直接引入 `mockMagazines`。
2. 页面新建/编辑/发布/删除逻辑均为本地状态模拟。
3. 页面未使用 `admin/src/api/modules/media.ts` 中的真实请求。

### 当前后端契约

1. `GET /admin/content/magazines`  
   返回数组（非分页）`List<AdminMagazineResponse>`。
2. `GET /admin/content/magazines/{id}`  
   返回单条杂志详情 `AdminMagazineResponse`。
3. `POST /admin/content/magazines`
4. `PUT /admin/content/magazines/{id}`
5. `DELETE /admin/content/magazines/{id}`
6. `status` 契约为 `active/inactive`。

## ADM-FE-004 房型管理

### 前端当前问题

1. `admin/src/views/content/suites.vue` 直接引入 `mockSuites`。
2. 页面创建、编辑、上下线、删除均在前端内存态执行。
3. 页面未调用 `media.ts` 中房型真实接口。

### 当前后端契约

1. `GET /admin/content/suites`  
   返回数组 `List<AdminSuiteResponse>`。
2. `POST /admin/content/suites`
3. `PUT /admin/content/suites/{id}`
4. `DELETE /admin/content/suites/{id}`
5. `status` 契约为 `active/inactive`。

## ADM-FE-005 FAQ / 服务热线 / 中心板块

### 前端当前问题

1. 前端已存在 `faq.ts`、`hotline.ts`、`center.ts` API 封装。
2. 目前缺少对应页面文件（`admin/src/views` 下无 FAQ/Hotline/Center 管理页）。
3. `admin/src/router/index.ts` 未注册对应路由。
4. `admin/src/views/layout/index.vue` 侧边栏无对应菜单入口。

### 当前后端契约

1. FAQ 管理
   - `GET /admin/faq/categories`
   - `POST /admin/faq/categories`
   - `PUT /admin/faq/categories/{id}`
   - `DELETE /admin/faq/categories/{id}`
   - `GET /admin/faq/items`
   - `GET /admin/faq/items/{id}`
   - `POST /admin/faq/items`
   - `PUT /admin/faq/items/{id}`
   - `DELETE /admin/faq/items/{id}`
2. 服务热线管理
   - `GET /admin/service/hotlines`
   - `PUT /admin/service/hotlines`
   - `POST /admin/service/hotlines`
   - `DELETE /admin/service/hotlines/{id}`
3. 中心板块管理
   - `GET /admin/centers/home`
   - `PUT /admin/centers/home`
   - `GET /admin/centers/sections`
   - `GET /admin/centers/sections/{id}`
   - `POST /admin/centers/sections`
   - `PUT /admin/centers/sections/{id}`
   - `DELETE /admin/centers/sections/{id}`

## ADM-FE-006 文章管理（AI 标签）

### 前端当前问题

1. `admin/src/views/content/articles.vue` 的新建/编辑文章弹窗中，当前没有“AI分析”按钮。
2. 弹窗中没有 AI 分析标签回显区域（无法展示已提取标签）。
3. 弹窗中没有手动新增标签输入入口，也没有删除错误标签入口。

### 当前后端契约

1. `POST /admin/articles/{articleId}/extract-tags`  
   触发 AI 提取文章标签，返回标签列表。
2. `GET /admin/articles/{articleId}/tags`  
   查询文章标签列表（用于前端回显）。
3. `POST /admin/articles/{articleId}/tags`  
   手动新增标签。
4. `DELETE /admin/articles/{articleId}/tags/{tagCode}`  
   删除错误标签。
5. 标签响应字段：`articleId`、`tagCode`、`tagName`、`source`。
6. `source` 使用规则：
   - 前端按后端原始值使用并透传，不做人工文案映射。
7. 交互约束（当前接口前提）：
   - 新建文章需先保存草稿获得 `articleId`，再可触发 AI 分析。
   - 手动新增按单文本输入约定提交，`tagCode/tagName` 同值，`tagType` 默认为 `TOPIC`。
