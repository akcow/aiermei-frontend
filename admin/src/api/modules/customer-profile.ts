import { del, get, post } from '../request'
import type {
  CustomerManualScoreDraft,
  CustomerManualScoreSubmitRequest,
  CustomerManualScoreSubmitResponse,
  CustomerTag,
  CustomerTagCorrectionLog,
  CustomerTagTraceRecord
} from '@/types'

export function getCustomerTags(uid: string) {
  return get<CustomerTag[]>(`/admin/customers/${uid}/tags`)
}

export function addCustomerTag(uid: string, data: { tagName: string; reason?: string }) {
  return post<CustomerTag>(`/admin/customers/${uid}/tags`, data)
}

export function removeCustomerTag(uid: string, tagCode: string, reason?: string) {
  return del<void>(`/admin/customers/${uid}/tags/${encodeURIComponent(tagCode)}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`)
}

export function getCustomerManualScoreDraft(uid: string) {
  return get<CustomerManualScoreDraft>(`/admin/customers/${uid}/manual-score`)
}

export function submitCustomerManualScore(uid: string, data: CustomerManualScoreSubmitRequest) {
  return post<CustomerManualScoreSubmitResponse>(`/admin/customers/${uid}/manual-score:confirm`, data)
}

export function getCustomerTagCorrectionLogs(uid: string) {
  return get<CustomerTagCorrectionLog[]>(`/admin/customers/${uid}/tag-corrections`)
}

export function getCustomerTagTrace(uid: string, tagCode: string) {
  return get<CustomerTagTraceRecord[]>(`/admin/customers/${uid}/tags/${encodeURIComponent(tagCode)}/trace`)
}
