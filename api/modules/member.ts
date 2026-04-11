import { httpRequest } from '@/api/http';
import type { ComplaintReq, EvaluationReq } from '@/types/api';
import type { Coupon, PostpartumService, UserProfile } from '@/types/domain';

export function getMemberProfile() {
  return httpRequest<UserProfile>({ url: '/api/v1/member/profile' });
}

export function getMemberCoupons() {
  return httpRequest<Coupon[]>({ url: '/api/v1/member/coupons' });
}

export function getPostpartumServices() {
  return httpRequest<PostpartumService[]>({ url: '/api/v1/member/postpartum-services' });
}

export function submitEvaluation(payload: EvaluationReq) {
  return httpRequest<{ submitted: boolean }>({
    url: '/api/v1/member/evaluations',
    method: 'POST',
    data: payload
  });
}

export function submitComplaint(payload: ComplaintReq) {
  return httpRequest<{ submitted: boolean }>({
    url: '/api/v1/member/complaints',
    method: 'POST',
    data: payload
  });
}
