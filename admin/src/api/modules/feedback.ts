import { get, put } from '../request'
import type { Evaluation, Complaint, PageResponse } from '@/types'

// ============ 评价管理 ============

export function getEvaluations(params: { page: number; pageSize: number; score?: number }) {
  return get<PageResponse<Evaluation>>('/admin/feedback/evaluations', params)
}

export function getEvaluationDetail(id: string) {
  return get<Evaluation>(`/admin/feedback/evaluations/${id}`)
}

// ============ 投诉管理 ============

export function getComplaints(params: { page: number; pageSize: number; status?: string }) {
  return get<PageResponse<Complaint>>('/admin/feedback/complaints', params)
}

export function getComplaintDetail(id: string) {
  return get<Complaint>(`/admin/feedback/complaints/${id}`)
}

export function updateComplaintStatus(id: string, status: 'processing' | 'resolved', note?: string) {
  return put<Complaint>(`/admin/feedback/complaints/${id}/status`, { status, note })
}
