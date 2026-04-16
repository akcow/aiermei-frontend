import { get, put } from '../request'

// 服务热线
export interface Hotline {
  id: string;
  label: string;
  number: string;
  sort: number;
  status: 'active' | 'inactive';
}

// 服务热线配置
export interface HotlineConfig {
  hotlines: Hotline[];
  serviceQrCodeUrl: string;
  serviceQrTips: string;
}

// 获取服务热线配置
export function getHotlineConfig() {
  return get<HotlineConfig>('/admin/service/hotlines')
}

// 更新服务热线配置
export function updateHotlineConfig(data: Partial<HotlineConfig>) {
  return put<HotlineConfig>('/admin/service/hotlines', data)
}

// 添加热线
export function addHotline(data: { label: string; number: string }) {
  return post<Hotline>('/admin/service/hotlines', data)
}

// 删除热线
export function deleteHotline(id: string) {
  return del<void>(`/admin/service/hotlines/${id}`)
}

import { post, del } from '../request'
