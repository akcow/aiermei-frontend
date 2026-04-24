# 爱儿美月子中心前端项目（小程序 + Admin）

本仓库包含两套前端：

- **小程序端（uni-app）**：`/pages`、`/api`、`/store` 等目录
- **管理后台（Vue3 + Vite + Element Plus）**：`/admin`

适用角色：

- 前端同学：快速上手开发与排查
- 后端同学：明确联调入口、接口约定、常见故障定位
- 测试/产品/新同学：快速运行本地演示（Mock）

---

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
│  ├─ vite.config.ts              # 后台开发代理与构建配置
│  └─ package.json
├─ api/                           # 小程序 API 封装
├─ pages/                         # 小程序页面
├─ store/                         # 小程序状态管理
├─ mock/                          # 小程序 mock 数据/处理
├─ docs/                          # 联调文档、接口映射与约定
├─ backend.openapi(1).json        # 最新后端 OpenAPI（联调基准）
└─ package.json                   # 小程序工程依赖
```

---

## 2. 环境要求

- Node.js 18+
- npm 9+
- 小程序开发工具（微信开发者工具）
- 建议：PowerShell / Windows Terminal

---

## 3. 快速启动

### 3.1 管理后台（admin）

进入 `admin` 目录安装依赖：

```powershell
cd admin
npm install
```

#### A. 真实后端联调模式（默认）

```powershell
npm run dev
```

默认会将 `/api` 代理到 `http://localhost:8080`。
如果后端不是这个地址，见下方 **4.2**。

#### B. 本地全量 Mock 演示模式（推荐演示/走查 UI）

```powershell
$env:VITE_ENABLE_MOCK='true'
npm run dev
```

说明：

- 当前 mock 已覆盖后台主要页面接口（登录、仪表盘、客户、内容、订单、FAQ、热线、中心配置、反馈等）
- 仅在 `VITE_ENABLE_MOCK=true` 时启用，不影响真实联调

#### C. 构建与预览

```powershell
npm run build
npm run preview
```

---

### 3.2 小程序端（uni-app）

本仓库小程序端通常通过 `HBuilderX` 或微信开发者工具运行（非标准 Vite 单命令脚手架）。

建议流程：

1. 用 HBuilderX 打开仓库根目录
2. 运行到微信开发者工具
3. 在小程序开发工具中预览/调试

如需改联调配置，请查看：

- `api/config.ts`
- `docs/integration.md`

---

## 4. 联调配置

### 4.1 Admin 接口基准

后台前端请求基准：

- `baseURL = /api/v1`（见 `admin/src/api/request.ts`）

所以实际请求会是：

- `/api/v1/admin/...`

### 4.2 修改 Admin 代理目标（真实后端地址）

已支持通过环境变量设置代理目标（见 `admin/vite.config.ts`）：

```powershell
cd admin
$env:VITE_API_TARGET='http://你的后端地址:端口'
npm run dev
```

例如：

```powershell
$env:VITE_API_TARGET='http://192.168.1.20:8080'
npm run dev
```

---

## 5. 接口文档与约定

联调时请以以下文档为准：

- 最新 OpenAPI：`backend.openapi(1).json`
- 历史/补充文档：
  - `docs/openapi.yaml`
  - `docs/integration.md`
  - `docs/api-mapping.md`
  - `docs/frontend-response-spec.md`

统一响应结构（约定）：

```json
{
  "code": 0,
  "message": "ok",
  "data": {},
  "requestId": "optional",
  "timestamp": "optional"
}
```

---

## 6. Mock 与真实模式切换说明（Admin）

- `VITE_ENABLE_MOCK=true`：启用 mock adapter，优先返回本地 mock 数据
- 不设置该变量：走真实网络请求 + Vite 代理

建议：

- 联调前后切换模式时，重启 dev server
- 清理登录态避免 token 干扰：

```js
localStorage.removeItem('aiermei_admin_token')
localStorage.removeItem('aiermei_admin_user')
```

---

## 7. 常见问题排查

### 7.1 `http proxy error ECONNREFUSED`

原因：代理目标不可达（后端没启动或地址端口不对）。

排查：

1. 确认后端服务已启动
2. 确认 `VITE_API_TARGET` 或默认 `localhost:8080` 是否正确
3. 重新 `npm run dev`

### 7.2 打开页面报 `500`

优先判断模式是否正确：

- 如果本地演示：是否已设置 `VITE_ENABLE_MOCK=true`
- 如果真实联调：查看 Network 的请求 URL、Authorization、返回 body

### 7.3 Mock 模式仍访问网络

说明某些请求未被 mock 命中或模式未正确开启。

- 检查启动命令是否包含 `VITE_ENABLE_MOCK=true`
- 检查控制台是否有 `Mock Adapter` 日志

---

## 8. 开发规范建议

- 新增接口时同时更新：
  - `api/modules/*.ts`（调用）
  - `types/*.ts`（类型）
  - `docs/*`（必要说明）
- 管理后台页面优先通过 API 模块调用，避免页面内散落裸请求
- 调整返回字段时，优先核对 `backend.openapi(1).json`

---

## 9. 给不同角色的最短路径

### 前端同学

- 看页面效果：`cd admin && $env:VITE_ENABLE_MOCK='true' && npm run dev`
- 联调真实后端：`cd admin && $env:VITE_API_TARGET='http://后端地址:端口' && npm run dev`

### 后端同学

- 先看 `backend.openapi(1).json` 与 `docs/integration.md`
- 若前端报错，优先让前端提供：请求 URL、请求头、响应体、requestId

### 测试/产品同学

- 推荐用 Mock 模式走查主流程与页面交互
- 若验证真实数据，再切换真实联调模式

---

## 10. 维护人提示

如你刚接手本仓库，建议第一天完成：

1. 本地跑通 admin 的 mock 模式
2. 本地跑通 admin 的真实联调模式（可连测试后端）
3. 过一遍 `docs/` 目录和 `backend.openapi(1).json`
4. 记录当前后端可用地址、账号、联调约束

这样后续问题定位会快很多。
