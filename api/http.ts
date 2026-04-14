import { API_BASE_URL, USE_MOCK } from './config';
import { mockRoute } from '@/mock/handlers';
import type { ApiResponse } from '@/types/api';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: Record<string, any>;
  params?: Record<string, string | number | boolean | undefined | null>;
  header?: Record<string, string>;
}

const TOKEN_KEY = 'aiermei_token';

function buildUrl(url: string, params?: RequestOptions['params']) {
  if (!params) {
    return url;
  }
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  if (!query) {
    return url;
  }
  return `${url}${url.includes('?') ? '&' : '?'}${query}`;
}

export async function httpRequest<T>(options: RequestOptions): Promise<ApiResponse<T>> {
  const method = options.method || 'GET';
  const requestUrl = buildUrl(options.url, options.params);
  const token = uni.getStorageSync(TOKEN_KEY) as string;
  const hasAuthHeader = Boolean(options.header?.Authorization);

  if (USE_MOCK) {
    const mockResult = mockRoute(requestUrl, method, options.data);
    if (mockResult) {
      return Promise.resolve(mockResult as ApiResponse<T>);
    }
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE_URL}${requestUrl}`,
      method,
      data: options.data,
      timeout: 10000,
      header: {
        'Content-Type': 'application/json',
        ...(token && !hasAuthHeader ? { Authorization: `Bearer ${token}` } : {}),
        ...options.header
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const payload = res.data as ApiResponse<T>;
          if (payload && typeof payload === 'object' && payload.code === 4003) {
            uni.removeStorageSync(TOKEN_KEY);
          }
          resolve(payload);
          return;
        }
        reject(new Error(`HTTP ${res.statusCode}`));
      },
      fail: (err) => reject(err)
    });
  });
}
