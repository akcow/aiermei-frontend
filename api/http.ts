import { API_BASE_URL, USE_MOCK } from './config';
import { mockRoute } from '@/mock/handlers';
import type { ApiResponse } from '@/types/api';
import { getToken, clearSession } from '@/store/session';

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

  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.header
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE_URL}${options.url}`,
      method,
      data: options.data,
      timeout: 10000,
      header: headers,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const data = res.data as ApiResponse<T>;
          // 处理业务层未授权
          if (data.code === 4003) {
            clearSession();
            uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
            reject(new Error('Unauthorized'));
            return;
          }
          resolve(data);
          return;
        }
        // 处理 HTTP 层未授权
        if (res.statusCode === 401) {
          clearSession();
          uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
          reject(new Error('Unauthorized'));
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

// SSE buffer 用于处理跨 chunk 半包/粘包
let sseBuffer = '';

export function createSSEConnection(options: SSEOptions): UniApp.RequestTask {
  // 重置 buffer
  sseBuffer = '';

  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
    ...options.header
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const requestTask = uni.request({
    url: `${API_BASE_URL}${options.url}`,
    method: 'POST',
    data: options.data,
    enableChunked: true,
    header: headers,
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
  // 将新数据追加到 buffer
  sseBuffer += text;

  // 按双换行符分割事件（SSE 规范：事件以 \n\n 分隔）
  const events = sseBuffer.split('\n\n');

  // 最后一个可能是不完整的事件，保留在 buffer 中
  sseBuffer = events.pop() || '';

  for (const eventText of events) {
    if (!eventText.trim()) continue;

    const lines = eventText.split('\n');
    let currentEvent = 'message';
    let currentData = '';

    for (const line of lines) {
      if (line.startsWith('event:')) {
        currentEvent = line.substring(6).trim();
      } else if (line.startsWith('data:')) {
        const dataContent = line.substring(5).trim();
        if (currentData) {
          currentData += '\n' + dataContent;
        } else {
          currentData = dataContent;
        }
      }
    }

    if (currentData) {
      try {
        // 尝试解析为 JSON 对象
        const parsedData = JSON.parse(currentData);
        onEvent({ event: currentEvent, data: parsedData });
      } catch {
        // 如果不是 JSON，直接作为字符串传递
        onEvent({ event: currentEvent, data: currentData });
      }
    }
  }
}