import { httpRequest } from '@/api/http';
import type { WechatLoginReq, WechatLoginResp } from '@/types/api';

export async function wechatLogin(payload: WechatLoginReq) {
  try {
    return await httpRequest<WechatLoginResp>({
      url: '/api/v1/auth/wechat/login',
      method: 'POST',
      data: payload
    });
  } catch {
    return httpRequest<WechatLoginResp>({
      url: '/api/v1/auth/wechat-login',
      method: 'POST',
      data: payload
    });
  }
}
