import { httpRequest } from '@/api/http';
import type { AnalysisResult, UserPath } from '@/types/domain';

export function getUserPaths(uid: string) {
  return httpRequest<UserPath[]>({ url: `/api/v1/admin/user-paths/${uid}` });
}

export function analyzeProfile(profile: Record<string, any>) {
  return httpRequest<AnalysisResult>({
    url: '/api/v1/admin/analyze-profile',
    method: 'POST',
    data: profile
  });
}
