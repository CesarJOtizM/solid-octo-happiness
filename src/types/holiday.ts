export type HolidayApiResponse = string[];

export interface HolidayData {
  date: string;
}

export interface HolidayCache {
  holidays: string[];
  lastUpdated: number;
  ttl: number;
}

export interface HolidayServiceConfig {
  apiUrl: string;
  cacheTtlMinutes: number;
  timeoutMs: number;
  maxRetries: number;
}

export type HolidayResult =
  | { success: true; data: string[] }
  | { success: false; error: HolidayServiceError };

export type CacheResult = { hit: true; data: string[] } | { hit: false };

export interface HolidayServiceError {
  type: "NETWORK_ERROR" | "PARSE_ERROR" | "TIMEOUT_ERROR" | "UNKNOWN_ERROR";
  message: string;
  statusCode?: number;
  url?: string;
}
