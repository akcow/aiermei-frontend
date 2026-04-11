import type { UserProfile } from '@/types/domain';
import { defaultProfile } from '@/mock/data';

const PROFILE_KEY = 'aiermei_profile';

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
  setLocalProfile(profile);
}
