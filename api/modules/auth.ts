import type { WechatLoginReq, WechatLoginResp } from '@/types/api';
import { httpRequest } from '@/api/http';

export function wechatLogin(payload: WechatLoginReq) {
  return httpRequest<WechatLoginResp>({
    url: '/api/v1/auth/wechat/login',
    method: 'POST',
    data: payload
  });
}

export function logout() {
  return httpRequest<void>({
    url: '/api/v1/auth/logout',
    method: 'POST'
  });
}