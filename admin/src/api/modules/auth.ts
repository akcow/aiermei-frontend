import { get, post } from '../request'
import type { LoginRequest, LoginResponse, AdminUser, DashboardOverview, Customer, PageResponse, UserJourney, AnalysisResult } from '@/types'

// 登录
export function login(data: LoginRequest) {
  return post<LoginResponse>('/admin/auth/login', data)
}

// 获取当前管理员信息
export function getCurrentAdmin() {
  return get<AdminUser>('/admin/auth/me')
}

// 退出登录
export function logout() {
  return post<void>('/admin/auth/logout')
}

// 获取仪表盘概览
export function getDashboardOverview() {
  return get<DashboardOverview>('/admin/dashboard/overview')
}

// 获取用户列表
export function getCustomers(params: { page: number; pageSize: number; keyword?: string }) {
  return get<PageResponse<Customer>>('/admin/customers', params)
}

// 获取用户详情
export function getCustomerDetail(uid: string) {
  return get<Customer>(`/admin/customers/${uid}`)
}

// 获取用户路径
export function getUserJourney(uid: string) {
  return get<UserJourney>(`/analytics/users/${uid}/journey`)
}

// AI 用户分析
export function analyzeUser(uid: string, forceRefresh?: boolean) {
  return post<AnalysisResult>(`/admin/users/${uid}/analysis`, { forceRefresh })
}
