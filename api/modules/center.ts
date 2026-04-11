import { httpRequest } from '@/api/http';
import type { Banner, ServiceCategory, Suite } from '@/types/domain';

export function getBanners() {
  return httpRequest<Banner[]>({ url: '/api/v1/banners' });
}

export function getPosterDetail(posterId: string) {
  return httpRequest<Banner>({ url: `/api/v1/posters/${posterId}` });
}

export function getCenterCategories() {
  return httpRequest<ServiceCategory[]>({ url: '/api/v1/center/categories' });
}

export function getSuites() {
  return httpRequest<Suite[]>({ url: '/api/v1/center/suites' });
}

export function getCenterSection(sectionId: string) {
  return httpRequest<{ id: string; title: string; content: string }>({
    url: `/api/v1/center/sections/${sectionId}`
  });
}
