# 前后端联调说明

## 1. 当前运行模式

- 前端默认启用 Mock：`api/config.ts` 中 `USE_MOCK = true`
- Mock 响应由 `mock/handlers.ts` 根据 `method + url` 匹配返回

## 2. 切换到真实后端

1. 打开 `api/config.ts`
2. 修改：
   - `USE_MOCK = false`
   - `API_BASE_URL = 你的后端域名`
3. 确认后端返回结构为统一格式：

```json
{
  "code": 0,
  "message": "ok",
  "data": {},
  "requestId": "optional"
}
```

## 3. 鉴权约定

- 登录接口：`POST /api/v1/auth/wechat-login`
- 建议后端返回 `token + refreshToken + expiresIn`
- 前端已预留统一请求头注入位置：`api/http.ts`

## 4. 错误处理建议

- 业务失败：`code != 0`
- HTTP 失败：由 `uni.request` 的 `statusCode` 处理
- 页面建议处理四态：`loading / success / empty / error`

## 5. 文档与代码一致性

- 接口契约：`docs/openapi.yaml`
- TS 类型：`types/api.ts` + `types/domain.ts`
- 接口调用：`api/modules/*.ts`

后端变更字段时，请同步更新以上三处，避免联调漂移。
