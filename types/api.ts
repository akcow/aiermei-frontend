export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  requestId?: string;
}

export interface Pagination<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface WechatLoginReq {
  code: string;
}

export interface WechatLoginResp {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface EvaluationReq {
  type: string;
  content: string;
}

export interface ComplaintReq {
  type: string;
  content: string;
}
