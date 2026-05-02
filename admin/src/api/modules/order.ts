import { useUserStore } from '@/stores/user'
import { get, post, put } from '../request'
import type { Order, PageResponse } from '@/types'

// 获取订单列表
export function getOrders(params: { 
  page: number; 
  pageSize: number; 
  status?: string;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}) {
  return get<PageResponse<Order>>(`${useUserStore().apiPrefix}/orders`, params)
}

// 获取订单详情
export function getOrderDetail(id: string) {
  return get<Order>(`${useUserStore().apiPrefix}/orders/${id}`)
}

// 确认订单
export function confirmOrder(id: string) {
  return post<Order>(`${useUserStore().apiPrefix}/orders/${id}/confirm`)
}

// 取消订单
export function cancelOrder(id: string, reason: string) {
  return post<Order>(`${useUserStore().apiPrefix}/orders/${id}/cancel`, { reason })
}

// 退款
export function refundOrder(id: string, reason: string) {
  return post<Order>(`${useUserStore().apiPrefix}/orders/${id}/refund`, { reason })
}

// 更新订单备注
export function updateOrderRemark(id: string, remark: string) {
  return put<Order>(`${useUserStore().apiPrefix}/orders/${id}/remark`, { remark })
}

// 获取订单统计
export function getOrderStats() {
  return get<{
    total: number;
    pending: number;
    paid: number;
    completed: number;
    cancelled: number;
    totalRevenue: number;
    totalRevenueLabel: string;
  }>(`${useUserStore().apiPrefix}/orders/stats`)
}
