import type { UserProfile } from '@/types/domain';
import { defaultProfile } from '@/mock/data';

const PROFILE_KEY = 'aiermei_profile';
const TOKEN_KEY = 'aiermei_token';

export function getLocalProfile(): UserProfile {
  const raw = uni.getStorageSync(PROFILE_KEY);
  if (!raw) {
    uni.setStorageSync(PROFILE_KEY, defaultProfile);
    return defaultProfile;
  }
  return raw as UserProfile;
}

export function setLocalProfile(profile: UserProfile) {
  uni.setStorageSync(PROFILE_KEY, profile);
}

export function trackPath(path: string) {
  const profile = getLocalProfile();
  profile.paths.push({ path, timestamp: Date.now() });
  profile.lastActive = Date.now();
  setLocalProfile(profile);
}

export function setLoginState(isLoggedIn: boolean) {
  const profile = getLocalProfile();
  profile.isLoggedIn = isLoggedIn;
  if (!isLoggedIn) {
    uni.removeStorageSync(TOKEN_KEY);
  }
  setLocalProfile(profile);
}

export function getAuthToken() {
  return uni.getStorageSync(TOKEN_KEY) as string;
}

export function setAuthToken(token: string) {
  uni.setStorageSync(TOKEN_KEY, token);
}

export function clearAuthToken() {
  uni.removeStorageSync(TOKEN_KEY);
}
