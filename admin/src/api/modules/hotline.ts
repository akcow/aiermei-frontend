import { useUserStore } from '@/stores/user'
﻿import { del, get, post, put } from '../request'

export interface Hotline {
  id: string
  label: string
  number: string
  sort: number
  status: 'active' | 'inactive'
}

export interface HotlineConfig {
  hotlines: Hotline[]
  serviceQrCodeUrl: string
  serviceQrTips: string
}

export function getHotlineConfig() {
  return get<HotlineConfig>(`${useUserStore().apiPrefix}/service/hotlines`)
}

export function updateHotlineConfig(data: Partial<HotlineConfig>) {
  return put<HotlineConfig>(`${useUserStore().apiPrefix}/service/hotlines`, data)
}

export function addHotline(data: { label: string; number: string }) {
  return post<Hotline>(`${useUserStore().apiPrefix}/service/hotlines`, data)
}

export function deleteHotline(id: string) {
  return del<void>(`${useUserStore().apiPrefix}/service/hotlines/${id}`)
}
