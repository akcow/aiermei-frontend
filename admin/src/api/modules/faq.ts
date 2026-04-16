import { get, post, put, del } from '../request'
import type { PageResponse } from '@/types'

// FAQ 分类
export interface FaqCategory {
  id: string;
  name: string;
  sort: number;
  createdAt: string;
}

// FAQ 条目
export interface FaqItem {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  sort: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

// ============ 分类管理 ============

export function getFaqCategories() {
  return get<FaqCategory[]>('/admin/faq/categories')
}

export function createFaqCategory(data: { name: string; sort: number }) {
  return post<FaqCategory>('/admin/faq/categories', data)
}

export function updateFaqCategory(id: string, data: { name: string; sort: number }) {
  return put<FaqCategory>(`/admin/faq/categories/${id}`, data)
}

export function deleteFaqCategory(id: string) {
  return del<void>(`/admin/faq/categories/${id}`)
}

// ============ 条目管理 ============

export function getFaqItems(params: { page: number; pageSize: number; categoryId?: string }) {
  return get<PageResponse<FaqItem>>('/admin/faq/items', params)
}

export function getFaqItemDetail(id: string) {
  return get<FaqItem>(`/admin/faq/items/${id}`)
}

export function createFaqItem(data: Partial<FaqItem>) {
  return post<FaqItem>('/admin/faq/items', data)
}

export function updateFaqItem(id: string, data: Partial<FaqItem>) {
  return put<FaqItem>(`/admin/faq/items/${id}`, data)
}

export function deleteFaqItem(id: string) {
  return del<void>(`/admin/faq/items/${id}`)
}
