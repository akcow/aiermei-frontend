import { useUserStore } from '@/stores/user'
import { get, post, put, del } from '../request'

// 中心板块
export interface CenterSection {
  id: string;
  title: string;
  desc?: string;
  coverImage: string;
  detailImage?: string;
  sort: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

// 中心首页配置
export interface CenterHomeConfig {
  heroImage: string;
  brandTitle: string;
  brandSubtitle: string;
  facilities: {
    id: string;
    title: string;
    desc: string;
    image: string;
    sort: number;
  }[];
}

// ============ 首页配置 ============

export function getCenterHomeConfig() {
  return get<CenterHomeConfig>(`${useUserStore().apiPrefix}/centers/home`)
}

export function updateCenterHomeConfig(data: Partial<CenterHomeConfig>) {
  return put<CenterHomeConfig>(`${useUserStore().apiPrefix}/centers/home`, data)
}

// ============ 板块管理 ============

export function getCenterSections() {
  return get<CenterSection[]>(`${useUserStore().apiPrefix}/centers/sections`)
}

export function getCenterSectionDetail(id: string) {
  return get<CenterSection>(`${useUserStore().apiPrefix}/centers/sections/${id}`)
}

export function createCenterSection(data: Partial<CenterSection>) {
  return post<CenterSection>(`${useUserStore().apiPrefix}/centers/sections`, data)
}

export function updateCenterSection(id: string, data: Partial<CenterSection>) {
  return put<CenterSection>(`${useUserStore().apiPrefix}/centers/sections/${id}`, data)
}

export function deleteCenterSection(id: string) {
  return del<void>(`${useUserStore().apiPrefix}/centers/sections/${id}`)
}
