import { del, get, post, put, request } from '../request'
import type {
  CenterFacility,
  DecayConfigItem,
  PageResponse,
  ScoringWeights,
  TagMention,
  TagPendingDetail,
  TagPendingItem,
  TagReviewRequest,
  TagReviewResult,
  TrafficSourcesStat,
  UploadFileResponse
} from '@/types'

export function getTagPendingList(params: { status?: string; keyword?: string; page: number; pageSize: number }) {
  return get<PageResponse<TagPendingItem>>('/admin/tag-pending', params)
}

export function getTagPendingDetail(pendingId: string) {
  return get<TagPendingDetail>(`/admin/tag-pending/${pendingId}`)
}

export function getTagMentions(pendingId: string, params: { page: number; pageSize: number }) {
  return get<PageResponse<TagMention>>(`/admin/tag-pending/${pendingId}/mentions`, params)
}

export function reviewTagPending(pendingId: string, data: TagReviewRequest) {
  return post<TagReviewResult>(`/admin/tag-pending/${pendingId}/review`, data)
}

export function getScoringWeights() {
  return get<ScoringWeights>('/admin/scoring-weights')
}

export function updateScoringWeights(data: Pick<ScoringWeights, 'conversionIntent' | 'spendingPower' | 'recentActivity'>) {
  return put<ScoringWeights>('/admin/scoring-weights', data)
}

export function getDecayConfigList() {
  return get<DecayConfigItem[]>('/admin/decay-config')
}

export function updateDecayConfig(eventType: string, data: Partial<Pick<DecayConfigItem, 'initialWeight' | 'lambda' | 'minWeight'>>) {
  return put<DecayConfigItem>(`/admin/decay-config/${eventType}`, data)
}

export function getTrafficSources(days: number) {
  return get<TrafficSourcesStat>('/admin/dashboard/traffic-sources', { days })
}

export function getCenterFacilities() {
  return get<CenterFacility[]>('/admin/centers/facilities')
}

export function createCenterFacility(data: Omit<CenterFacility, 'id'>) {
  return post<CenterFacility>('/admin/centers/facilities', data)
}

export function updateCenterFacility(id: string, data: Partial<Omit<CenterFacility, 'id'>>) {
  return put<CenterFacility>(`/admin/centers/facilities/${id}`, data)
}

export function deleteCenterFacility(id: string) {
  return del<void>(`/admin/centers/facilities/${id}`)
}

export function uploadFile(file: File, bizType: string) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('bizType', bizType)
  return request<UploadFileResponse>({
    method: 'POST',
    url: '/files/upload',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
