import { get, post, put, del } from '../request'
import type { PageResponse } from '@/types'

/**
 * 账号管理接口模块
 */

// 账号基本字段定义
export interface Account {
  id: string
  username: string
  name: string
  avatar: string
  role: 'admin' | 'staff'
  status: 'ENABLED' | 'DISABLED'
  onlineStatus: 'ONLINE' | 'OFFLINE'
  permissions: string[]
  createdAt: string
  updatedAt: string
  lastLoginAt: string
  lastLoginIp: string
}

export interface AccountQueryParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: string
}

// --- 员工账号接口 ---

export function getStaffAccounts(params: AccountQueryParams) {
  return get<PageResponse<Account>>('/admin/accounts/staff', params)
}

export function getStaffAccountDetail(staffId: string) {
  return get<Account>(`/admin/accounts/staff/${staffId}`)
}

export function createStaffAccount(data: Partial<Account>) {
  return post<Account>('/admin/accounts/staff', data)
}

export function updateStaffAccount(staffId: string, data: Partial<Account>) {
  return put<Account>(`/admin/accounts/staff/${staffId}`, data)
}

export function updateStaffStatus(staffId: string, status: 'ENABLED' | 'DISABLED') {
  return put<Account>(`/admin/accounts/staff/${staffId}/status`, { status })
}

export function resetStaffPassword(staffId: string) {
  return put<{ updatedAt: string }>(`/admin/accounts/staff/${staffId}/password:reset`)
}

export function deleteStaffAccount(staffId: string) {
  return del(`/admin/accounts/staff/${staffId}`)
}

// --- 管理员账号接口 ---

export function getAdminAccounts(params: AccountQueryParams) {
  return get<PageResponse<Account>>('/admin/accounts/admins', params)
}

export function getAdminAccountDetail(adminId: string) {
  return get<Account>(`/admin/accounts/admins/${adminId}`)
}

export function createAdminAccount(data: Partial<Account>) {
  return post<Account>('/admin/accounts/admins', data)
}

export function updateAdminAccount(adminId: string, data: Partial<Account>) {
  return put<Account>(`/admin/accounts/admins/${adminId}`, data)
}

export function updateAdminStatus(adminId: string, status: 'ENABLED' | 'DISABLED') {
  return put<Account>(`/admin/accounts/admins/${adminId}/status`, { status })
}

export function resetAdminPassword(adminId: string) {
  return put<{ updatedAt: string }>(`/admin/accounts/admins/${adminId}/password:reset`)
}

export function deleteAdminAccount(adminId: string) {
  return del<void>(`/admin/accounts/admins/${adminId}`)
}
