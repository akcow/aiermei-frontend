export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  requestId?: string;
  timestamp?: string;
}

export interface Pagination<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore?: boolean;
}

export interface WechatLoginReq {
  code: string;
  encryptedPhoneData?: string;
  iv?: string;
  redirectUri?: string;
}

export interface LoginUserSummary {
  uid?: string;
  name?: string;
  avatar?: string;
  phone?: string;
  memberLevel?: string;
}

export interface WechatLoginResp {
  token: string;
  user?: LoginUserSummary;
  refreshToken?: string;
  expiresIn?: number;
}

export interface EvaluationReq {
  orderId?: string;
  score: number;
  content?: string;
  anonymous?: boolean;
}

export interface ComplaintReq {
  contactName?: string;
  phone?: string;
  content: string;
  relatedService?: string;
  complaintType?: 'SERVICE_QUALITY' | 'FACILITY_ENVIRONMENT' | 'CATERING_SUGGESTION' | 'OTHER';
}

export interface AiChatReq {
  sessionId?: string;
  message: string;
}
