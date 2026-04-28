# 爱儿美月子中心前端项目（小程序 + Admin）

本仓库包含两套前端：

- 小程序端（uni-app）：`/pages`、`/api`、`/store` 等目录
- 管理后台（Vue3 + Vite + Element Plus）：`/admin`

## 1. 目录结构

```text
.
├─ admin/                         # 管理后台（独立 Vite 工程）
│  ├─ src/
│  │  ├─ api/                     # 后台 API 封装
│  │  ├─ views/                   # 后台页面
│  │  ├─ mock/                    # 后台 Mock 适配器与数据
│  │  ├─ stores/                  # Pinia 状态管理
│  │  └─ router/                  # 后台路由
│  ├─ vite.config.ts              # 开发代理与构建配置
│  └─ package.json
├─ api/                           # 小程序 API 封装
├─ pages/                         # 小程序页面
├─ store/                         # 小程序状态
├─ mock/                          # 小程序 mock 数据/处理
├─ docs/                          # 联调文档、需求文档、接口说明
├─ docs/backend.openapi(2).json   # 最新后端 OpenAPI（当前基准）
└─ README.md
```

## 2. 环境要求

- Node.js 18+
- npm 9+
- 小程序开发工具（微信开发者工具）

## 3. 快速启动

### 3.1 管理后台（admin）

```powershell
cd admin
npm install
```

#### A. 真实联调模式（默认）

```powershell
npm run dev
```

默认会将 `/api` 代理到 `http://localhost:8080`。

可通过环境变量改后端地址：

```powershell
$env:VITE_API_TARGET='http://你的后端地址:端口'
npm run dev
```

#### B. 本地 Mock 模式（演示/UI 走查）

```powershell
$env:VITE_ENABLE_MOCK='true'
npm run dev
```

说明：

- 仅在 `VITE_ENABLE_MOCK=true` 时启用 mock adapter。
- 当前管理员控制台相关接口已覆盖 mock（审批池、评分权重、衰减参数、流量来源、设施管理、上传）。

#### C. 构建与预览

```powershell
npm run build
npm run preview
```

### 3.2 小程序端（uni-app）

建议通过 HBuilderX/微信开发者工具运行：

1. 打开仓库根目录
2. 运行到微信开发者工具
3. 在工具内预览与调试

联调配置参考：`api/config.ts`、`docs/integration.md`

## 4. Admin 角色与功能说明

### 4.1 单登录入口 + 双身份

管理后台为单登录入口，登录后按身份自动分流：

- 管理员：进入管理员控制台
- 员工：进入员工后台

并有路由权限隔离：

- 管理员不可访问员工后台路由
- 员工不可访问管理员控制台路由

### 4.2 管理员控制台菜单

当前管理员侧边栏包含：

1. 仪表盘（融合流量来源统计）
2. 标签审批池
3. 评分权重
4. 行为热度衰减设置
5. 设施字典管理

### 4.3 评分权重页交互

- 页面大卡片居中展示（向下偏移，方便视觉聚焦）。
- 三个参数都支持：拖动条 + 数值输入。
- 当前为手动模式（无自动平衡），保存前校验总和必须为 100。

### 4.4 行为热度衰减设置说明

- 页面已使用通俗字段：初始热度、降温速度、最低保留值。
- 行为类型来自后端查询接口 `GET /api/v1/admin/decay-config`。
- 当前接口只支持更新已有类型：`PUT /api/v1/admin/decay-config/{eventType}`。
- 按当前接口契约，不支持前端新建/删除行为类型。

## 5. Mock 模式测试账号

仅在 `VITE_ENABLE_MOCK=true` 下可用：

- 管理员：`admin / admin123`
- 员工：`staff / staff123`

登录页在 Mock 模式会自动显示该提示。

## 6. 接口文档与约定

联调请以以下文档为准：

- `docs/backend.openapi(2).json`
- `docs/frontend-admin-approval-scoring-api.md`
- `docs/frontend-response-spec.md`
- `docs/integration.md`
- `docs/prd.md`

统一响应结构：

```json
{
  "code": 0,
  "message": "ok",
  "data": {},
  "requestId": "optional",
  "timestamp": "optional"
}
```

## 7. 常见问题

### 7.1 `http proxy error ECONNREFUSED`

原因：后端服务不可达（未启动或地址端口不对）。

排查：

1. 确认后端已启动
2. 确认 `VITE_API_TARGET` 或默认 `localhost:8080` 正确
3. 重启 `npm run dev`

### 7.2 Mock 模式仍走网络

排查：

1. 确认已设置 `VITE_ENABLE_MOCK=true`
2. 重启 dev server
3. 检查控制台是否有 Mock Adapter 日志

### 7.3 登录状态异常

可清理本地后台登录态后重试：

```js
localStorage.removeItem('aiermei_admin_token')
localStorage.removeItem('aiermei_admin_user')
```

## 8. 维护建议

- 新增/变更接口时，同步更新：
  - `admin/src/api/modules/*`
  - `admin/src/types/index.ts`
  - 对应页面与 `docs/*` 文档
- 接口字段以 `docs/backend.openapi(2).json` 为基准。
