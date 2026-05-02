import { useUserStore } from '@/stores/user'
import { get, post, put, del } from '../request'
import type { Coupon, PageResponse } from '@/types'

// 获取优惠券列表
export function getCoupons(params: { page: number; pageSize: number; status?: string }) {
  return get<PageResponse<Coupon>>(`${useUserStore().apiPrefix}/coupons`, params)
}

// 获取优惠券详情
export function getCouponDetail(id: string) {
  return get<Coupon>(`${useUserStore().apiPrefix}/coupons/${id}`)
}

// 创建优惠券
export function createCoupon(data: Partial<Coupon>) {
  return post<Coupon>(`${useUserStore().apiPrefix}/coupons`, data)
}

// 更新优惠券
export function updateCoupon(id: string, data: Partial<Coupon>) {
  return put<Coupon>(`${useUserStore().apiPrefix}/coupons/${id}`, data)
}

// 删除优惠券
export function deleteCoupon(id: string) {
  return del<void>(`${useUserStore().apiPrefix}/coupons/${id}`)
}

// 启用/禁用优惠券
export function toggleCouponStatus(id: string, status: 'active' | 'inactive') {
  return put<Coupon>(`${useUserStore().apiPrefix}/coupons/${id}/status`, { status })
}
