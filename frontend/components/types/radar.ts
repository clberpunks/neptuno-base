// frontend/types/radar.d.ts
export interface Stats {
  allow: number;
  block: number;
  limit: number;
  ratelimit: number;
  redirect: number;
  flagged: number;
  other: number;
  total: number;
}

export interface Log {
  id: string;
  timestamp: string;
  ip_address: string;
  user_agent: string;
  referrer: string | null;
  accept_language: string | null;
  sec_ch_ua: string | null;
  sec_ch_ua_mobile: string | null;
  sec_ch_ua_platform: string | null;
  utm_source: string | null;
  fingerprint: string;
  path: string;
  outcome: string;
  rule: string;
  redirect_url?: string | null;
  js_executed: boolean;
}