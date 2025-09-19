// Tipos principales de la API de fechas hábiles
export type {
  WorkingHours,
  BusinessDateConfig,
  DateCalculationResult,
  DateCalculationError,
  DateCalculationResponse,
  TimeAdjustment,
  BusinessDayInfo,
} from "./businessDate.js";

// Tipos para parámetros de request
export type {
  BusinessDateRequest,
  BusinessDateQueryParams,
  ParsedBusinessDateRequest,
} from "./request.js";

// Tipos para respuestas de la API
export type {
  BusinessDateResponse,
  BusinessDateSuccessResponse,
  BusinessDateErrorResponse,
  BusinessDateError,
  ApiError,
} from "./response.js";

export { ErrorType } from "./response.js";

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

// Extensión de tipos de Express
import "./express.js";
