import { httpRequest } from '@/api/http';
import type {
  Banner,
  BannerDetail,
  CenterHome,
  CenterSection,
  CenterSectionDetail,
  QrCodeInfo,
  Suite
} from '@/types/domain';

export function getBanners() {
  return httpRequest<Banner[]>({ url: '/api/v1/banners' });
}

export async function getBannerDetail(bannerId: string) {
  try {
    return await httpRequest<BannerDetail>({ url: `/api/v1/banners/${bannerId}` });
  } catch {
    const response = await httpRequest<any>({ url: `/api/v1/posters/${bannerId}` });
    const raw = response.data || {};
    return {
      ...response,
      data: {
        id: raw.id || bannerId,
        title: raw.title || raw.detailTitle || '',
        content: raw.content || raw.detailContent || '',
        image: raw.image || ''
      }
    };
  }
}

export function getCenterHome() {
  return httpRequest<CenterHome>({ url: '/api/v1/centers/home' });
}

export function getCenterSections() {
  return httpRequest<CenterSection[]>({ url: '/api/v1/centers/sections' });
}

export function getCenterSectionDetail(sectionId: string) {
  return httpRequest<CenterSectionDetail>({
    url: `/api/v1/centers/sections/${sectionId}`
  });
}

export async function getSuites() {
  try {
    return await httpRequest<Suite[]>({ url: '/api/v1/suites' });
  } catch {
    return httpRequest<Suite[]>({ url: '/api/v1/center/suites' });
  }
}

export function getAppointmentQrCode(sourceType: string, sourceId: string) {
  return httpRequest<QrCodeInfo>({
    url: '/api/v1/appointments/qrcode',
    params: { sourceType, sourceId }
  });
}
