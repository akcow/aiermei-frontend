import type { ApiResponse } from '@/types/api';
import {
  banners,
  centerFacilities,
  centerSections,
  contentItems,
  coupons,
  defaultProfile,
  faqCategories,
  faqItems,
  fortuneCard,
  hotlineList,
  mockAnalysis,
  postpartumServices,
  presetQuestions,
  suites
} from './data';

export function createMockResponse<T>(data: T): ApiResponse<T> {
  return {
    code: 0,
    message: 'ok',
    data,
    requestId: `mock_${Date.now()}`
  };
}

function getQueryValue(url: string, key: string) {
  const query = url.split('?')[1];
  if (!query) {
    return '';
  }
  const pairs = query.split('&');
  for (const pair of pairs) {
    const [rawKey, rawValue = ''] = pair.split('=');
    if (decodeURIComponent(rawKey) === key) {
      return decodeURIComponent(rawValue);
    }
  }
  return '';
}

export function mockRoute(url: string, method: string, data?: any): ApiResponse<any> | null {
  const key = `${method.toUpperCase()} ${url.split('?')[0]}`;

  switch (key) {
    case 'GET /api/v1/banners':
      return createMockResponse(banners);
    case 'GET /api/v1/content/fortune/today':
      return createMockResponse(fortuneCard);
    case 'GET /api/v1/content/preset-questions':
      return createMockResponse(presetQuestions);
    case 'GET /api/v1/content/categories':
      return createMockResponse([
        { id: 'pregnancy', label: 'Pregnancy' },
        { id: 'postpartum', label: 'Postpartum' },
        { id: 'parenting', label: 'Parenting' },
        { id: 'nanny', label: 'Nanny' }
      ]);
    case 'GET /api/v1/content/articles': {
      const category = getQueryValue(url, 'category');
      const list = category ? contentItems.filter((item) => item.category === category) : contentItems;
      return createMockResponse({ list, total: list.length, page: 1, pageSize: 20, hasMore: false });
    }
    case 'GET /api/v1/centers/home':
      return createMockResponse({
        heroImage: 'https://picsum.photos/seed/storefront/1080/1920',
        brandTitle: 'AI ER MEI',
        brandSubtitle: 'RESIDENCES',
        facilities: centerFacilities
      });
    case 'GET /api/v1/centers/sections':
      return createMockResponse(centerSections);
    case 'GET /api/v1/suites':
      return createMockResponse(suites);
    case 'GET /api/v1/member/coupons':
      return createMockResponse(coupons);
    case 'GET /api/v1/member/postpartum-services':
      return createMockResponse(postpartumServices);
    case 'GET /api/v1/faq/categories':
      return createMockResponse(faqCategories);
    case 'GET /api/v1/faq/items': {
      const categoryId = getQueryValue(url, 'categoryId');
      return createMockResponse(faqItems.filter((item) => item.categoryId === categoryId));
    }
    case 'GET /api/v1/service/hotlines':
      return createMockResponse({
        hotlines: hotlineList,
        serviceQrCodeUrl: 'https://picsum.photos/seed/qr2/360/360',
        serviceQrTips: 'Scan to contact service consultant'
      });
    case 'POST /api/v1/feedback/evaluations':
      return createMockResponse({ submitted: true, ...data });
    case 'POST /api/v1/feedback/complaints':
      return createMockResponse({ submitted: true, ...data });
    case 'POST /api/v1/admin/analyze-profile':
      return createMockResponse(mockAnalysis);
    case 'POST /api/v1/auth/wechat/login':
    case 'POST /api/v1/auth/wechat-login':
      return createMockResponse({
        token: 'mock-token',
        user: { uid: defaultProfile.uid, name: defaultProfile.name }
      });
    case 'GET /api/v1/users/me':
      return createMockResponse(defaultProfile);
    default:
      if (url.startsWith('/api/v1/banners/')) {
        const id = url.split('/').pop();
        const banner = banners.find((item) => item.id === id) || banners[0];
        return createMockResponse({
          id: banner.id,
          title: banner.detailTitle || banner.title,
          content: banner.detailContent,
          image: banner.image
        });
      }
      if (url.startsWith('/api/v1/posters/')) {
        const id = url.split('/').pop();
        const banner = banners.find((item) => item.id === id) || banners[0];
        return createMockResponse({
          id: banner.id,
          title: banner.detailTitle || banner.title,
          content: banner.detailContent,
          image: banner.image
        });
      }
      if (url.startsWith('/api/v1/centers/sections/')) {
        const id = url.split('/').pop();
        const section = centerSections.find((item) => item.id === id) || centerSections[0];
        return createMockResponse({
          id: section.id,
          title: section.title,
          detailImage: section.coverImage
        });
      }
      if (url.startsWith('/api/v1/appointments/qrcode')) {
        return createMockResponse({
          qrCodeUrl: 'https://picsum.photos/seed/qr/360/360',
          consultantName: 'Consultant A',
          tips: 'Scan and send "visit" for schedule'
        });
      }
      if (url.startsWith('/api/v1/admin/user-paths/')) {
        return createMockResponse(defaultProfile.paths);
      }
      return null;
  }
}
