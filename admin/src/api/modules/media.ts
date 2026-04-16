import { get, post, put, del } from '../request'
import type { Banner, Magazine, Suite, PageResponse } from '@/types'

// ============ 海报管理 ============

export function getBanners() {
  return get<Banner[]>('/admin/content/banners')
}

export function getBannerDetail(id: string) {
  return get<Banner>(`/admin/content/banners/${id}`)
}

export function createBanner(data: Partial<Banner>) {
  return post<Banner>('/admin/content/banners', data)
}

export function updateBanner(id: string, data: Partial<Banner>) {
  return put<Banner>(`/admin/content/banners/${id}`, data)
}

export function deleteBanner(id: string) {
  return del<void>(`/admin/content/banners/${id}`)
}

// ============ 杂志管理 ============

export function getMagazines(params: { page: number; pageSize: number; status?: string }) {
  return get<PageResponse<Magazine>>('/admin/content/magazines', params)
}

export function getMagazineDetail(id: string) {
  return get<Magazine>(`/admin/content/magazines/${id}`)
}

export function createMagazine(data: Partial<Magazine>) {
  return post<Magazine>('/admin/content/magazines', data)
}

export function updateMagazine(id: string, data: Partial<Magazine>) {
  return put<Magazine>(`/admin/content/magazines/${id}`, data)
}

export function deleteMagazine(id: string) {
  return del<void>(`/admin/content/magazines/${id}`)
}

// ============ 房型管理 ============

export function getSuites() {
  return get<Suite[]>('/admin/content/suites')
}

export function getSuiteDetail(id: string) {
  return get<Suite>(`/admin/content/suites/${id}`)
}

export function createSuite(data: Partial<Suite>) {
  return post<Suite>('/admin/content/suites', data)
}

export function updateSuite(id: string, data: Partial<Suite>) {
  return put<Suite>(`/admin/content/suites/${id}`, data)
}

export function deleteSuite(id: string) {
  return del<void>(`/admin/content/suites/${id}`)
}
