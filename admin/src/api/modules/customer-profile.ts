import { useUserStore } from '@/stores/user'
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
  return get<CustomerTag[]>(`${useUserStore().apiPrefix}/customers/${uid}/tags`)
}

export function addCustomerTag(uid: string, data: { tagName: string; reason?: string }) {
  return post<CustomerTag>(`${useUserStore().apiPrefix}/customers/${uid}/tags`, data)
}

export function removeCustomerTag(uid: string, tagCode: string, reason?: string) {
  return del<void>(`${useUserStore().apiPrefix}/customers/${uid}/tags/${encodeURIComponent(tagCode)}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`)
}

export function getCustomerManualScoreDraft(uid: string) {
  return get<CustomerManualScoreDraft>(`${useUserStore().apiPrefix}/customers/${uid}/manual-score`)
}

export function submitCustomerManualScore(uid: string, data: CustomerManualScoreSubmitRequest) {
  return post<CustomerManualScoreSubmitResponse>(`${useUserStore().apiPrefix}/customers/${uid}/manual-score:confirm`, data)
}

export function getCustomerTagCorrectionLogs(uid: string) {
  return get<CustomerTagCorrectionLog[]>(`${useUserStore().apiPrefix}/customers/${uid}/tag-corrections`)
}

export function getCustomerTagTrace(uid: string, tagCode: string) {
  return get<CustomerTagTraceRecord[]>(`${useUserStore().apiPrefix}/customers/${uid}/tags/${encodeURIComponent(tagCode)}/trace`)
}
