import { useUserStore } from '@/stores/user'
import { get, put } from '../request'
import type { Evaluation, Complaint, PageResponse } from '@/types'

// ============ 评价管理 ============

export function getEvaluations(params: { page: number; pageSize: number; score?: number }) {
  return get<PageResponse<Evaluation>>(`${useUserStore().apiPrefix}/feedback/evaluations`, params)
}

export function getEvaluationDetail(id: string) {
  return get<Evaluation>(`${useUserStore().apiPrefix}/feedback/evaluations/${id}`)
}

// ============ 投诉管理 ============

export function getComplaints(params: { page: number; pageSize: number; status?: string }) {
  return get<PageResponse<Complaint>>(`${useUserStore().apiPrefix}/feedback/complaints`, params)
}

export function getComplaintDetail(id: string) {
  return get<Complaint>(`${useUserStore().apiPrefix}/feedback/complaints/${id}`)
}

export function updateComplaintStatus(id: string, status: 'processing' | 'resolved', note?: string) {
  return put<Complaint>(`${useUserStore().apiPrefix}/feedback/complaints/${id}/status`, { status, note })
}
