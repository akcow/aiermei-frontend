export type ContentCategory = 'pregnancy' | 'postpartum' | 'parenting' | 'nanny';

export interface UserPath {
  path: string;
  timestamp: number;
  duration?: number;
}

export interface UserProfile {
  uid: string;
  nickname: string;
  tags: string[];
  lastActive: number;
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

export interface ContentItem {
  id: string;
  title: string;
  cover: string;
  type: 'image' | 'video';
  category: ContentCategory;
  author: string;
  likes: number;
}

export interface ServiceCategory {
  id: string;
  title: string;
  desc: string;
}

export interface Suite {
  id: string;
  name: string;
  price: string;
  size: string;
  features: string[];
  images: string[];
}

export interface PresetQuestion {
  q: string;
  a: string;
}

export interface Coupon {
  id: number;
  name: string;
  value: string;
  expiry: string;
  status: '可用' | '已过期';
}

export interface PostpartumService {
  id: number;
  name: string;
  time: string;
  status: '待服务' | '已完成';
  expert: string;
}

export interface AnalysisResult {
  tags: string[];
  script: string;
}
