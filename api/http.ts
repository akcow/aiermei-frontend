import { API_BASE_URL, USE_MOCK } from './config';
import { mockRoute } from '@/mock/handlers';
import type { ApiResponse } from '@/types/api';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: Record<string, any>;
  header?: Record<string, string>;
}

export async function httpRequest<T>(options: RequestOptions): Promise<ApiResponse<T>> {
  const method = options.method || 'GET';

  if (USE_MOCK) {
    const mockResult = mockRoute(options.url, method, options.data);
    if (mockResult) {
      return Promise.resolve(mockResult as ApiResponse<T>);
    }
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE_URL}${options.url}`,
      method,
      data: options.data,
      timeout: 10000,
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as ApiResponse<T>);
          return;
        }
        reject(new Error(`HTTP ${res.statusCode}`));
      },
      fail: (err) => reject(err)
    });
  });
}
