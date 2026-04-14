import { httpRequest } from '@/api/http';
import type { ComplaintReq, EvaluationReq } from '@/types/api';
import type {
  Coupon,
  FaqCategory,
  FaqItem,
  PostpartumService,
  ServiceHotlines,
  UserProfile
} from '@/types/domain';

export function getMemberProfile() {
  return httpRequest<UserProfile>({ url: '/api/v1/users/me' });
}

export function getMemberCoupons() {
  return httpRequest<Coupon[]>({ url: '/api/v1/member/coupons' });
}

export async function getPostpartumServices() {
  try {
    return await httpRequest<PostpartumService[]>({ url: '/api/v1/member/postpartum-services' });
  } catch {
    return httpRequest<PostpartumService[]>({ url: '/api/v1/member/postpartum' });
  }
}

export function getServiceHotlines() {
  return httpRequest<ServiceHotlines>({ url: '/api/v1/service/hotlines' });
}

export function getFaqCategories() {
  return httpRequest<FaqCategory[]>({ url: '/api/v1/faq/categories' });
}

export function getFaqItems(categoryId: string) {
  return httpRequest<FaqItem[]>({
    url: '/api/v1/faq/items',
    params: { categoryId }
  });
}

export function submitEvaluation(payload: EvaluationReq) {
  return httpRequest<{ evaluationId?: string; submitted: boolean }>({
    url: '/api/v1/feedback/evaluations',
    method: 'POST',
    data: payload
  });
}

export function submitComplaint(payload: ComplaintReq) {
  return httpRequest<{ complaintId?: string; submitted: boolean }>({
    url: '/api/v1/feedback/complaints',
    method: 'POST',
    data: payload
  });
}
