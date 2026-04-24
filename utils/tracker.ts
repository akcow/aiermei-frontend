import { httpRequest } from '@/api/http';
import { USE_MOCK } from '@/api/config';
import { getToken } from '@/store/session';

export interface AnalyticsEvent {
  eventId: string;
  eventType: string;
  path: string;
  pathName?: string;
  occurredAt: string;
  durationSeconds?: number;
  metadata?: Record<string, any>;
}

interface VisitorTokenPayload {
  visitorToken: string;
  expiresAt?: string;
  ttlSeconds?: number;
}

interface VisitorTokenCache {
  token: string;
  expiresAt: number;
}

class AnalyticsTracker {
  private queue: AnalyticsEvent[] = [];
  private flushTimer: any = null;
  private isFlushing = false;

  private readonly MAX_QUEUE_SIZE = 20;
  private readonly FLUSH_INTERVAL_MS = 30000;
  private readonly MAX_BUFFER_SIZE = 200;
  private readonly MAX_RETRY_DELAY_MS = 5 * 60 * 1000;

  private retryDelayMs = this.FLUSH_INTERVAL_MS;
  private consecutiveFailures = 0;

  private utmParams: Record<string, string> = {};
  private visitorId = '';
  private visitorTokenCache: VisitorTokenCache | null = null;
  private visitorTokenPromise: Promise<string | null> | null = null;
  private sceneFallbackWarned = false;

  private readonly VISITOR_ID_KEY = 'aiermei_visitor_id';
  private readonly VISITOR_TOKEN_KEY = 'aiermei_visitor_token';
  private readonly SCENE_KEY = 'analytics_scene';
  private readonly PLATFORM = 'wechat_mini';
  private readonly VISITOR_TOKEN_REFRESH_AHEAD_MS = 60 * 1000;

  private readonly PATH_NAME_MAP: Record<string, string> = {
    '/pages/home/index': 'Home',
    '/pages/center/index': 'Center Home',
    '/pages/center/detail': 'Center Detail',
    '/pages/suite-details/index': 'Suite Detail',
    '/pages/content/index': 'Content Center',
    '/pages/content/article': 'Article Detail',
    '/pages/poster/detail': 'Poster Detail',
    '/pages/member/index': 'Member Center',
    '/pages/member/magazine': 'Magazine Detail',
    '/pages/member/edit-profile': 'Profile Edit',
    '/pages/member-sub/index': 'Member Subpage'
  };

  constructor() {
    this.utmParams = uni.getStorageSync('aiermei_utm') || {};
    this.visitorId = this.loadOrCreateVisitorId();
    this.loadVisitorTokenCache();
  }

  public setUtmParams(query: Record<string, any>) {
    const utms: Record<string, string> = {};
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'sourceId'];
    let changed = false;
    for (const key of keys) {
      if (query[key]) {
        utms[key] = query[key];
        changed = true;
      }
    }
    if (changed) {
      this.utmParams = { ...this.utmParams, ...utms };
      uni.setStorageSync('aiermei_utm', this.utmParams);
    }
  }

  public getUtmParams() {
    return this.utmParams;
  }

  public updateScene(sceneInput: unknown) {
    const parsed = Number(sceneInput ?? 0);
    const scene = Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
    uni.setStorageSync(this.SCENE_KEY, scene);
  }

  public getPathName(path: string): string {
    return this.PATH_NAME_MAP[path] || path;
  }

  public buildPageViewMetadata(extra: Record<string, any> = {}) {
    return {
      platform: this.PLATFORM,
      scene: this.getScene(),
      visitorId: this.visitorId,
      ...extra
    };
  }

  public track(eventType: string, params: Omit<AnalyticsEvent, 'eventId' | 'occurredAt' | 'eventType'>) {
    const mergedMetadata = {
      ...this.utmParams,
      ...(params.metadata || {})
    };

    const event: AnalyticsEvent = {
      eventId: this.generateUUID(),
      eventType,
      path: params.path,
      pathName: params.pathName,
      occurredAt: this.getISO8601WithTimezone(),
      durationSeconds: params.durationSeconds,
      metadata: this.normalizeMetadata(eventType, mergedMetadata)
    };

    this.queue.push(event);
    if (this.queue.length > this.MAX_BUFFER_SIZE) {
      this.queue.splice(0, this.queue.length - this.MAX_BUFFER_SIZE);
    }

    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      this.flush();
    } else {
      this.resetTimer(this.FLUSH_INTERVAL_MS);
    }
  }

  public async flush() {
    if (this.queue.length === 0 || this.isFlushing) return;

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    // In mock mode, mark batch as accepted locally and avoid network calls.
    if (USE_MOCK) {
      this.queue = [];
      this.onFlushSuccess();
      return;
    }

    this.isFlushing = true;
    const batchSize = Math.min(this.queue.length, this.MAX_QUEUE_SIZE);
    const eventsToSend = this.queue.slice(0, batchSize);

    try {
      const requestHeader = await this.buildAuthHeader();
      if (!requestHeader) {
        this.resetTimer(this.retryDelayMs);
        return;
      }

      const res = await httpRequest({
        url: '/api/v1/analytics/events/batch',
        method: 'POST',
        header: requestHeader,
        data: {
          events: eventsToSend
        }
      });

      if (res.code !== 0) {
        throw new Error(`Business error: ${res.code}`);
      }

      // Remove only the confirmed successful batch.
      this.queue.splice(0, batchSize);
      this.onFlushSuccess();

      if (this.queue.length > 0) {
        this.resetTimer(this.FLUSH_INTERVAL_MS);
      }
    } catch (e) {
      this.onFlushFailure(e);
      this.resetTimer(this.retryDelayMs);
    } finally {
      this.isFlushing = false;
    }
  }

  private onFlushSuccess() {
    this.consecutiveFailures = 0;
    this.retryDelayMs = this.FLUSH_INTERVAL_MS;
  }

  private onFlushFailure(error: unknown) {
    this.consecutiveFailures += 1;
    this.retryDelayMs = Math.min(this.retryDelayMs * 2, this.MAX_RETRY_DELAY_MS);

    // Reduce noisy logs: print first failure and then every 5 failures.
    if (this.consecutiveFailures === 1 || this.consecutiveFailures % 5 === 0) {
      console.error('[Tracker] Failed to send events', error);
    }
  }

  private resetTimer(delayMs: number) {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }
    this.flushTimer = setTimeout(() => {
      this.flush();
    }, delayMs);
  }

  private generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private getISO8601WithTimezone() {
    const tzOffset = -new Date().getTimezoneOffset();
    const diff = tzOffset >= 0 ? '+' : '-';
    const pad = (n: number) => `${Math.floor(Math.abs(n))}`.padStart(2, '0');
    const offsetString = diff + pad(tzOffset / 60) + ':' + pad(tzOffset % 60);

    const now = new Date();
    const localISOTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
      .toISOString()
      .slice(0, -1);

    return localISOTime.split('.')[0] + offsetString;
  }

  private normalizeMetadata(eventType: string, metadata: Record<string, any>) {
    // PAGE_VIEW / CLICK are required to carry platform + scene + visitorId.
    if (eventType === 'PAGE_VIEW' || eventType === 'CLICK') {
      return {
        ...metadata,
        platform: this.PLATFORM,
        scene: this.getScene(),
        visitorId: this.visitorId
      };
    }
    return metadata;
  }

  private getScene(): number {
    const raw = uni.getStorageSync(this.SCENE_KEY);
    if (raw === '' || raw === null || raw === undefined) {
      if (!this.sceneFallbackWarned) {
        console.warn('[Tracker] analytics scene missing, fallback to 0');
        this.sceneFallbackWarned = true;
      }
      return 0;
    }

    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
      if (!this.sceneFallbackWarned) {
        console.warn('[Tracker] analytics scene invalid, fallback to 0');
        this.sceneFallbackWarned = true;
      }
      return 0;
    }

    return Math.trunc(parsed);
  }

  private loadOrCreateVisitorId(): string {
    const stored = uni.getStorageSync(this.VISITOR_ID_KEY);
    if (typeof stored === 'string' && stored) {
      return stored;
    }
    const visitorId = this.generateUUID();
    uni.setStorageSync(this.VISITOR_ID_KEY, visitorId);
    return visitorId;
  }

  private loadVisitorTokenCache() {
    const raw = uni.getStorageSync(this.VISITOR_TOKEN_KEY);
    if (!raw || typeof raw !== 'object') return;
    const token = String((raw as any).token || '');
    const expiresAt = Number((raw as any).expiresAt || 0);
    if (!token || !Number.isFinite(expiresAt)) return;
    this.visitorTokenCache = { token, expiresAt };
  }

  private async buildAuthHeader(): Promise<Record<string, string> | null> {
    const bearerToken = getToken();
    if (bearerToken) {
      return {};
    }

    const visitorToken = await this.ensureVisitorToken();
    if (!visitorToken) {
      return null;
    }

    return {
      'X-Analytics-Visitor-Token': visitorToken
    };
  }

  private async ensureVisitorToken(): Promise<string | null> {
    const now = Date.now();
    if (this.visitorTokenCache && this.visitorTokenCache.expiresAt - now > this.VISITOR_TOKEN_REFRESH_AHEAD_MS) {
      return this.visitorTokenCache.token;
    }

    if (this.visitorTokenPromise) {
      return this.visitorTokenPromise;
    }

    this.visitorTokenPromise = this.requestVisitorToken().finally(() => {
      this.visitorTokenPromise = null;
    });

    return this.visitorTokenPromise;
  }

  private async requestVisitorToken(): Promise<string | null> {
    if (USE_MOCK) {
      const expiresAt = Date.now() + 30 * 60 * 1000;
      this.persistVisitorToken('mock_visitor_token', expiresAt);
      return 'mock_visitor_token';
    }

    try {
      const res = await httpRequest<VisitorTokenPayload>({
        url: '/api/v1/analytics/visitor-token',
        method: 'POST',
        data: {
          visitorId: this.visitorId
        }
      });

      if (res.code !== 0 || !res.data?.visitorToken) {
        throw new Error(`Business error: ${res.code}`);
      }

      const expiresAtMs = this.resolveVisitorTokenExpireAt(res.data);
      this.persistVisitorToken(res.data.visitorToken, expiresAtMs);
      return res.data.visitorToken;
    } catch (error) {
      console.error('[Tracker] Failed to fetch visitor token', error);
      return null;
    }
  }

  private resolveVisitorTokenExpireAt(data: VisitorTokenPayload): number {
    const fromExpiresAt = data.expiresAt ? new Date(data.expiresAt).getTime() : 0;
    if (Number.isFinite(fromExpiresAt) && fromExpiresAt > Date.now()) {
      return fromExpiresAt;
    }

    const ttlSeconds = Number(data.ttlSeconds || 0);
    if (Number.isFinite(ttlSeconds) && ttlSeconds > 0) {
      return Date.now() + ttlSeconds * 1000;
    }

    return Date.now() + 25 * 60 * 1000;
  }

  private persistVisitorToken(token: string, expiresAt: number) {
    this.visitorTokenCache = {
      token,
      expiresAt
    };
    uni.setStorageSync(this.VISITOR_TOKEN_KEY, this.visitorTokenCache);
  }
}

export const tracker = new AnalyticsTracker();

