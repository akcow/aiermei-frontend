import type { ApiResponse } from '@/types/api';
import { banners, contentItems, coupons, defaultProfile, faqItems, mockAnalysis, postpartumServices, pregnancyFaqItems, presetQuestions, serviceCategories, suites } from './data';

export function createMockResponse<T>(data: T): ApiResponse<T> {
  return {
    code: 0,
    message: 'ok',
    data,
    requestId: `mock_${Date.now()}`
  };
}

export function mockRoute(url: string, method: string, data?: any): ApiResponse<any> | null {
  const key = `${method.toUpperCase()} ${url}`;

  switch (key) {
    case 'GET /api/v1/banners':
      return createMockResponse(banners);
    case 'GET /api/v1/content/feed':
      return createMockResponse({ list: contentItems, total: contentItems.length, page: 1, pageSize: 20 });
    case 'GET /api/v1/content/questions/preset':
      return createMockResponse(presetQuestions);
    case 'GET /api/v1/center/categories':
      return createMockResponse(serviceCategories);
    case 'GET /api/v1/center/suites':
      return createMockResponse(suites);
    case 'GET /api/v1/member/profile':
      return createMockResponse(defaultProfile);
    case 'GET /api/v1/member/coupons':
      return createMockResponse(coupons);
    case 'GET /api/v1/member/postpartum-services':
      return createMockResponse(postpartumServices);
    case 'GET /api/v1/member/faq':
      return createMockResponse(faqItems);
    case 'GET /api/v1/member/faq/pregnancy':
      return createMockResponse(pregnancyFaqItems);
    case 'POST /api/v1/member/evaluations':
      return createMockResponse({ submitted: true, ...data });
    case 'POST /api/v1/member/complaints':
      return createMockResponse({ submitted: true, ...data });
    case 'POST /api/v1/admin/analyze-profile':
      return createMockResponse(mockAnalysis);
    case 'POST /api/v1/auth/wechat-login':
      return createMockResponse({ token: 'mock-token', refreshToken: 'mock-refresh', expiresIn: 7200 });
    default:
      if (url.startsWith('/api/v1/posters/')) {
        const id = url.split('/').pop();
        const poster = banners.find((item) => item.id === id) || banners[0];
        return createMockResponse(poster);
      }
      if (url.startsWith('/api/v1/center/sections/')) {
        const id = url.split('/').pop();
        return createMockResponse({ id, title: `中心模块 ${id}`, content: '模块详情内容，后端联调后替换。' });
      }
      if (url.startsWith('/api/v1/admin/user-paths/')) {
        return createMockResponse(defaultProfile.paths);
      }
      return null;
  }
}
