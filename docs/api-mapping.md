# 页面与接口映射

## 首页/中心

| 页面 | 调用接口 | 目的 | 关键字段 |
| --- | --- | --- | --- |
| pages/home/index | GET /api/v1/banners | 首页轮播渲染 | title, image, buttonText |
| pages/poster/detail | GET /api/v1/posters/{posterId} | 海报详情 | detailTitle, detailContent |
| pages/center/index | GET /api/v1/center/categories | 服务分类 | title, desc |
| pages/center/index | GET /api/v1/center/suites | 套房卡片 | name, price, size, images |
| pages/center/detail | GET /api/v1/center/sections/{sectionId} | 模块详情 | title, content |

## 内容中心

| 页面 | 调用接口 | 目的 | 关键字段 |
| --- | --- | --- | --- |
| pages/content/index | GET /api/v1/content/feed | 内容流 | title, cover, author, likes |
| pages/content/index | GET /api/v1/content/questions/preset | 预设问答 | q, a |

## 会员相关

| 页面 | 调用接口 | 目的 | 关键字段 |
| --- | --- | --- | --- |
| pages/member/index | GET /api/v1/member/profile | 会员状态展示 | nickname, isLoggedIn |
| pages/member-sub/index?id=coupon | GET /api/v1/member/coupons | 优惠券列表 | name, value, expiry, status |
| pages/member-sub/index?id=postpartum | GET /api/v1/member/postpartum-services | 产后服务记录 | name, time, status, expert |
| pages/member-sub/index?id=evaluation | POST /api/v1/member/evaluations | 提交评估 | type, content |
| pages/member-sub/index?id=complaint | POST /api/v1/member/complaints | 提交投诉 | type, content |

## 管理后台

| 页面 | 调用接口 | 目的 | 关键字段 |
| --- | --- | --- | --- |
| pages-admin/dashboard/index | GET /api/v1/admin/user-paths/{uid} | 行为路径 | path, timestamp |
| pages-admin/dashboard/index | POST /api/v1/admin/analyze-profile | 画像分析 | tags, script |
