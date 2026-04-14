export type ContentCategory = string;

export interface UserPath {
  path: string;
  timestamp: number;
  duration?: number;
}

export interface UserProfile {
  uid: string;
  name?: string;
  nickname?: string;
  avatar?: string;
  phone?: string;
  memberLevel?: string;
  tags: string[];
  lastActive: number | string;
  isLoggedIn: boolean;
  pregnancyInfo?: {
    type: 'pregnancy' | 'postpartum';
    date: string;
  };
  paths: UserPath[];
}

export interface Banner {
  id: string;
  title: string;
  buttonText: string;
  image: string;
  detailTitle: string;
  detailContent: string;
}

export interface BannerDetail {
  id: string;
  title: string;
  content: string;
  image: string;
}

export interface QrCodeInfo {
  qrCodeUrl: string;
  consultantName: string;
  tips: string;
}

export interface ContentItem {
  id: string;
  title: string;
  cover: string;
  mediaUrl?: string;
  type: 'image' | 'video' | 'article' | string;
  category: ContentCategory;
  author: string;
  likes: number;
}

export interface ContentCategoryItem {
  id: string;
  label: string;
}

export interface FortuneCard {
  date: string;
  suitable: string;
  avoid: string;
  greeting: string;
}

export interface Facility {
  id?: string;
  title: string;
  desc: string;
  image: string;
}

export interface CenterHome {
  heroImage?: string;
  brandTitle?: string;
  brandSubtitle?: string;
  facilities: Facility[];
}

export interface CenterSection {
  id: string;
  title: string;
  desc: string;
  coverImage: string;
}

export interface CenterSectionDetail {
  id: string;
  title: string;
  detailImage: string;
}

export interface Suite {
  id: string;
  name: string;
  price?: string;
  priceLabel?: string;
  size: string;
  features: string[];
  images: string[];
}

export interface PresetQuestion {
  id?: string;
  question: string;
  answer: string;
}

export interface FaqCategory {
  id: string;
  name: string;
}

export interface FaqItem {
  id: string;
  categoryId: string;
  title: string;
  content: string;
}

export interface Coupon {
  id: string | number;
  name: string;
  value?: number;
  valueLabel?: string;
  expiry: string;
  status: string;
}

export interface PostpartumService {
  id: number | string;
  name: string;
  time: string;
  status: string;
  expert: string;
}

export interface HotlineInfo {
  label: string;
  number: string;
}

export interface ServiceHotlines {
  hotlines: HotlineInfo[];
  serviceQrCodeUrl?: string;
  serviceQrTips?: string;
}

export interface AnalysisResult {
  tags: string[];
  script: string;
}
