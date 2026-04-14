import { API_BASE_URL } from '@/api/config';
import { httpRequest } from '@/api/http';
import type { AiChatReq, Pagination } from '@/types/api';
import type { ContentCategoryItem, ContentItem, FortuneCard, PresetQuestion } from '@/types/domain';

type SseEventPayload = {
  event: string;
  data: string;
};

type AiChatStreamHandlers = {
  onMessage?: (text: string, payload: unknown, event: string) => void;
  onDone?: (payload?: unknown) => void;
  onError?: (message: string, payload?: unknown) => void;
  onSessionId?: (sessionId: string) => void;
};

const TOKEN_KEY = 'aiermei_token';

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function pickText(payload: unknown): string {
  if (typeof payload === 'string') {
    return payload;
  }
  if (!payload || typeof payload !== 'object') {
    return '';
  }
  const data = payload as Record<string, unknown>;
  const candidates = ['delta', 'content', 'message', 'text', 'answer'];
  for (const key of candidates) {
    const value = data[key];
    if (typeof value === 'string' && value) {
      return value;
    }
  }
  return '';
}

function pickError(payload: unknown): string {
  if (typeof payload === 'string') {
    return payload;
  }
  if (!payload || typeof payload !== 'object') {
    return 'AI service error';
  }
  const data = payload as Record<string, unknown>;
  if (typeof data.message === 'string' && data.message) {
    return data.message;
  }
  if (typeof data.error === 'string' && data.error) {
    return data.error;
  }
  return 'AI service error';
}

function decodeChunk(data: unknown) {
  if (typeof data === 'string') {
    return data;
  }
  const source = data as { data?: ArrayBuffer };
  if (source?.data instanceof ArrayBuffer) {
    if (typeof TextDecoder !== 'undefined') {
      return new TextDecoder('utf-8').decode(new Uint8Array(source.data));
    }
    const bytes = new Uint8Array(source.data);
    let text = '';
    for (let i = 0; i < bytes.length; i += 1) {
      text += String.fromCharCode(bytes[i]);
    }
    return text;
  }
  if (data instanceof ArrayBuffer) {
    if (typeof TextDecoder !== 'undefined') {
      return new TextDecoder('utf-8').decode(new Uint8Array(data));
    }
    const bytes = new Uint8Array(data);
    let text = '';
    for (let i = 0; i < bytes.length; i += 1) {
      text += String.fromCharCode(bytes[i]);
    }
    return text;
  }
  return '';
}

function parseSseBuffer(buffer: string) {
  const normalizedBuffer = buffer.replace(/\r\n/g, '\n');
  const events: SseEventPayload[] = [];
  let cursor = 0;
  let boundary = normalizedBuffer.indexOf('\n\n');

  while (boundary >= 0) {
    const block = normalizedBuffer.slice(cursor, boundary).trim();
    cursor = boundary + 2;
    boundary = normalizedBuffer.indexOf('\n\n', cursor);

    if (!block) {
      continue;
    }

    const lines = block.split('\n');
    let event = 'message';
    const dataLines: string[] = [];

    lines.forEach((line) => {
      if (line.startsWith('event:')) {
        event = line.slice(6).trim() || 'message';
      }
      if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trim());
      }
    });

    events.push({ event, data: dataLines.join('\n') });
  }

  return {
    events,
    remain: normalizedBuffer.slice(cursor)
  };
}

function dispatchSseEvent(raw: SseEventPayload, handlers: AiChatStreamHandlers) {
  const payload = parseJson(raw.data);
  if (payload && typeof payload === 'object') {
    const sessionId = (payload as Record<string, unknown>).sessionId;
    if (typeof sessionId === 'string' && sessionId) {
      handlers.onSessionId?.(sessionId);
    }
    const payloadEvent = (payload as Record<string, unknown>).event;
    if (typeof payloadEvent === 'string' && payloadEvent === 'done') {
      handlers.onDone?.(payload);
      return;
    }
  }

  if (raw.event === 'done') {
    handlers.onDone?.(payload);
    return;
  }
  if (raw.event === 'error') {
    handlers.onError?.(pickError(payload), payload);
    return;
  }

  const chunk = pickText(payload);
  if (!chunk) {
    return;
  }
  handlers.onMessage?.(chunk, payload, raw.event);
}

function readToken() {
  return uni.getStorageSync(TOKEN_KEY) as string;
}

export function getTodayFortune() {
  return httpRequest<FortuneCard>({ url: '/api/v1/content/fortune/today' });
}

export function getPresetQuestions(limit = 6) {
  return httpRequest<PresetQuestion[]>({
    url: '/api/v1/content/preset-questions',
    params: { limit }
  });
}

export function getContentCategories() {
  return httpRequest<ContentCategoryItem[]>({ url: '/api/v1/content/categories' });
}

export function getContentArticles(category: string, page = 1, pageSize = 20) {
  return httpRequest<Pagination<ContentItem>>({
    url: '/api/v1/content/articles',
    params: { category, page, pageSize }
  });
}

export async function chatWithAiStream(payload: AiChatReq, handlers: AiChatStreamHandlers = {}) {
  const token = readToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  let doneReceived = false;
  let buffer = '';
  const consumeChunk = (chunkText: string) => {
    if (!chunkText) {
      return;
    }
    buffer += chunkText;
    const parsed = parseSseBuffer(buffer);
    buffer = parsed.remain;
    parsed.events.forEach((eventPayload) => {
      if (eventPayload.event === 'done') {
        doneReceived = true;
      }
      if (eventPayload.event === 'error') {
        doneReceived = true;
      }
      dispatchSseEvent(eventPayload, handlers);
    });
  };

  const url = `${API_BASE_URL}/api/v1/ai/chat`;
  const wxApi = (globalThis as Record<string, unknown>).wx as
    | { request?: (options: Record<string, unknown>) => unknown }
    | undefined;

  try {
    if (wxApi?.request) {
      await new Promise<void>((resolve, reject) => {
        const task = wxApi.request?.({
          url,
          method: 'POST',
          data: payload,
          header: headers,
          enableChunked: true,
          success: () => resolve(),
          fail: (err: unknown) => reject(err)
        }) as { onChunkReceived?: (callback: (chunk: unknown) => void) => void } | undefined;

        task?.onChunkReceived?.((chunk: unknown) => {
          consumeChunk(decodeChunk(chunk));
        });
      });
    } else {
      await new Promise<void>((resolve, reject) => {
        uni.request({
          url,
          method: 'POST',
          data: payload,
          header: headers,
          success: (res) => {
            consumeChunk(typeof res.data === 'string' ? res.data : decodeChunk(res.data));
            resolve();
          },
          fail: reject
        });
      });
    }
  } catch (error) {
    handlers.onError?.('AI request failed, please retry later', error);
    throw error;
  }

  if (buffer.trim()) {
    consumeChunk('\n\n');
  }
  if (!doneReceived) {
    handlers.onDone?.();
  }
}
