export interface HolidayApiResponse {
  holidays: HolidayData[];
  year: number;
  lastUpdated: string;
}

export interface HolidayData {
  date: string;
  name: string;
  type: string;
  fixed: boolean;
}

export interface HolidayCache {
  holidays: HolidayData[];
  lastUpdated: number;
  ttl: number;
}

export interface HolidayServiceConfig {
  apiUrl: string;
  cacheTtlMinutes: number;
  timeoutMs: number;
  maxRetries: number;
}

export interface HolidayServiceError {
  type: "NETWORK_ERROR" | "PARSE_ERROR" | "TIMEOUT_ERROR" | "UNKNOWN_ERROR";
  message: string;
  statusCode?: number;
  url?: string;
}
