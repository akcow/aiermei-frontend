import { get, post, put, del } from '../request'
import type { Article, ContentCategory, PageResponse } from '@/types'

// 获取文章列表
export function getArticles(params: { 
  page: number; 
  pageSize: number; 
  category?: string; 
  status?: string;
  keyword?: string;
}) {
  return get<PageResponse<Article>>('/admin/content/articles', params)
}

// 获取文章详情
export function getArticleDetail(id: string) {
  return get<Article>(`/admin/content/articles/${id}`)
}

// 创建文章
export function createArticle(data: Partial<Article>) {
  return post<Article>('/admin/content/articles', data)
}

// 更新文章
export function updateArticle(id: string, data: Partial<Article>) {
  return put<Article>(`/admin/content/articles/${id}`, data)
}

// 删除文章
export function deleteArticle(id: string) {
  return del<void>(`/admin/content/articles/${id}`)
}

// 发布文章
export function publishArticle(id: string) {
  return post<Article>(`/admin/content/articles/${id}/publish`)
}

// 归档文章
export function archiveArticle(id: string) {
  return post<Article>(`/admin/content/articles/${id}/archive`)
}

// 获取分类列表
export function getCategories() {
  return get<ContentCategory[]>('/admin/content/categories')
}

// 创建分类
export function createCategory(data: { label: string; sort: number }) {
  return post<ContentCategory>('/admin/content/categories', data)
}

// 更新分类
export function updateCategory(id: string, data: { label: string; sort: number }) {
  return put<ContentCategory>(`/admin/content/categories/${id}`, data)
}

// 删除分类
export function deleteCategory(id: string) {
  return del<void>(`/admin/content/categories/${id}`)
}
