export interface BusinessDateRequest {
  days?: number;
  hours?: number;
  date?: string;
}

export interface BusinessDateQueryParams {
  days?: string;
  hours?: string;
  date?: string;
}

export interface ParsedBusinessDateRequest {
  days: number;
  hours: number;
  date: Date;
}
