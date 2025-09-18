export type {
  BusinessDateRequest,
  BusinessDateQueryParams,
  ParsedBusinessDateRequest,
} from "./request.js";

export type {
  BusinessDateSuccessResponse,
  BusinessDateErrorResponse,
  BusinessDateResponse,
  ApiError,
} from "./response.js";

export { ErrorType } from "./response.js";

export type {
  BusinessHours,
  BusinessDayInfo,
  TimeCalculation,
  DateRange,
  HolidayInfo,
} from "./businessDate.js";

export type {
  HolidayApiResponse,
  HolidayData,
  HolidayCache,
  HolidayServiceConfig,
  HolidayServiceError,
  CacheResult,
  HolidayResult,
} from "./holiday.js";

// Tipos de health check
export type { HealthCheckResponse, HealthCheckDetails } from "./health.js";
