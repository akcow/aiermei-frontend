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

export interface SSEEvent {
  event: string;
  data: any;
}

export interface SSEOptions {
  url: string;
  data?: Record<string, any>;
  header?: Record<string, string>;
  onEvent: (event: SSEEvent) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export function createSSEConnection(options: SSEOptions): UniApp.RequestTask {
  const requestTask = uni.request({
    url: `${API_BASE_URL}${options.url}`,
    method: 'POST',
    data: options.data,
    enableChunked: true,
    header: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      ...options.header
    },
    success: () => {
      options.onComplete?.();
    },
    fail: (err) => {
      options.onError?.(new Error(err.errMsg || 'SSE connection failed'));
    }
  });

  requestTask.onChunkReceived?.((response) => {
    try {
      const arrayBuffer = response.data;
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(arrayBuffer);
      parseSSEText(text, options.onEvent);
    } catch (e) {
      console.error('SSE parse error:', e);
    }
  });

  return requestTask;
}

function parseSSEText(text: string, onEvent: (event: SSEEvent) => void) {
  const lines = text.split('\n');
  let currentEvent = 'message';
  let currentData = '';

  for (const line of lines) {
    if (line.startsWith('event:')) {
      currentEvent = line.substring(6).trim();
    } else if (line.startsWith('data:')) {
      currentData = line.substring(5).trim();
      if (currentData) {
        try {
          const parsedData = JSON.parse(currentData);
          onEvent({ event: currentEvent, data: parsedData });
        } catch {
          onEvent({ event: currentEvent, data: currentData });
        }
      }
      currentEvent = 'message';
      currentData = '';
    } else if (line === '' && currentData) {
      try {
        const parsedData = JSON.parse(currentData);
        onEvent({ event: currentEvent, data: parsedData });
      } catch {
        onEvent({ event: currentEvent, data: currentData });
      }
      currentEvent = 'message';
      currentData = '';
    }
  }
}