import { httpRequest } from '@/api/http';
import type { Banner, BannerDetail, CenterSection, CenterSectionDetail, CenterHome, Suite, QrCodeResponse } from '@/types/domain';

export function getBanners() {
  return httpRequest<Banner[]>({ url: '/api/v1/banners' });
}

export function getBannerDetail(bannerId: string) {
  return httpRequest<BannerDetail>({ url: `/api/v1/banners/${bannerId}` });
}

export function getCenterHome() {
  return httpRequest<CenterHome>({ url: '/api/v1/centers/home' });
}

export function getCenterSections() {
  return httpRequest<CenterSection[]>({ url: '/api/v1/centers/sections' });
}

export function getCenterSectionDetail(sectionId: string) {
  return httpRequest<CenterSectionDetail>({ url: `/api/v1/centers/sections/${sectionId}` });
}

export function getSuites() {
  return httpRequest<Suite[]>({ url: '/api/v1/suites' });
}

export function getSuiteDetail(suiteId: string) {
  return httpRequest<Suite>({ url: `/api/v1/suites/${suiteId}` });
}

export function getAppointmentQrCode(sourceType: string, sourceId: string) {
  return httpRequest<QrCodeResponse>({
    url: `/api/v1/appointments/qrcode?sourceType=${sourceType}&sourceId=${sourceId}`
  });
}