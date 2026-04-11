import { httpRequest } from '@/api/http';
import type { Pagination } from '@/types/api';
import type { ContentItem, PresetQuestion } from '@/types/domain';

export function getContentFeed() {
  return httpRequest<Pagination<ContentItem>>({ url: '/api/v1/content/feed' });
}

export function getPresetQuestions() {
  return httpRequest<PresetQuestion[]>({ url: '/api/v1/content/questions/preset' });
}
