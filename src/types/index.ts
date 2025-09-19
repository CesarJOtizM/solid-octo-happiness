// Tipos principales de la API de fechas hábiles
export type {
  WorkingHours,
  BusinessDateConfig,
  DateCalculationResult,
  DateCalculationError,
  DateCalculationResponse,
  TimeAdjustment,
  BusinessDayInfo,
} from "./businessDate";

// Tipos para parámetros de request
export type {
  BusinessDateRequest,
  BusinessDateQueryParams,
  ParsedBusinessDateRequest,
} from "./request";

// Tipos para respuestas de la API
export type {
  BusinessDateResponse,
  BusinessDateSuccessResponse,
  BusinessDateErrorResponse,
  BusinessDateError,
  ApiError,
} from "./response";

export { ErrorType } from "./response";

export type {
  HolidayApiResponse,
  HolidayData,
  HolidayCache,
  HolidayServiceConfig,
  HolidayServiceError,
  CacheResult,
  HolidayResult,
} from "./holiday";

// Tipos de health check
export type { HealthCheckResponse, HealthCheckDetails } from "./health";

// Extensión de tipos de Express
import "./express";
