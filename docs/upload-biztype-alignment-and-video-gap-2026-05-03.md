# 视频上传接入 `/files/upload` 问题说明与部分细节问题

更新时间：2026-05-03

## 1. 问题现状

文章管理中的视频能力目前未接入统一上传接口 `POST /api/v1/files/upload`。

当前状态：

1. 后端已支持视频上传类型：`bizType=article_media`。
2. 前端文章页仍使用手工输入 `mediaUrl`。
3. 视频未进入统一上传链路，无法复用后端的 MIME/大小校验与上传审计。

---

## 2. 影响

1. 视频地址来源不统一，容易出现无效 URL 或外链不可用。
2. 无法统一执行后端文件校验策略（类型、大小）。
3. 无法完整记录上传审计（`file_id/object_key/biz_type`）。

---

## 3. 改造建议（前端）

1. 在文章管理（视频类型）增加“上传视频”入口。
2. 选择视频后调用：`POST /api/v1/files/upload`。
3. 上传参数固定：`bizType=article_media`。
4. 上传成功后自动回填 `mediaUrl`，不再要求手工输入。
5. 前端展示上传失败原因（如类型不支持、大小超限）。

---

## 4. 验收标准

1. 视频类型文章可通过上传控件生成 `mediaUrl`。
2. 后端返回结构（`fileId/url/objectKey/mimeType/sizeBytes/bizType/uploadedAt`）被正常消费。
3. 上传记录落库且 `biz_type=article_media`。
4. 手工输入视频 URL 作为可选兜底，不影响上传主流程。

---

## 新增问题标注（P1）- 小程序产后服务空白无提示

问题状态：`待修复`

现象：

1. 小程序进入“会员 -> 产后服务”页面，在无服务数据或接口异常时，页面出现空白区域。
2. 预期应展示空态文案“暂无服务”，但实际未出现提示。

复现条件（高频）：

1. `GET /api/v1/member/postpartum-services` 返回业务失败（如 `code != 0`，`data = null`）。
2. 前端未对 `res.code` 与 `res.data` 做数组校验，直接执行 `services = res.data`。

根因：

1. 页面空态渲染条件依赖 `services.length === 0`。
2. 当 `services` 被赋值为 `null` 或非数组对象时，空态条件失效，导致“无卡片且无提示”的空白表现。

修复建议（前端）：

1. `postpartum` 数据赋值改为安全解包：`services = (res.code === 0 && Array.isArray(res.data)) ? res.data : []`。
2. 业务失败时增加 `toast` 提示：`res.message || '加载失败'`。
3. 保持 `EmptyState` 条件渲染，确保无数据时一定可见。

验证标准：

1. 接口返回空数组：页面展示“暂无服务”空态。
2. 接口返回业务错误：页面展示 toast + 空态，不再出现白屏空白。
3. 接口返回正常数组：列表正常展示。
