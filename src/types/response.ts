export interface BusinessDateSuccessResponse {
  date: string;
}

export interface BusinessDateErrorResponse {
  error: string;
  message: string;
}

export interface BusinessDateError {
  error: string;
  message: string;
}

export type BusinessDateResponse =
  | BusinessDateSuccessResponse
  | BusinessDateErrorResponse;

export enum ErrorType {
  INVALID_PARAMETERS = "InvalidParameters",
  MISSING_PARAMETERS = "MissingParameters",
  INVALID_DATE_FORMAT = "InvalidDateFormat",
  INVALID_NUMBER_FORMAT = "InvalidNumberFormat",
  HOLIDAY_SERVICE_ERROR = "HolidayServiceError",
  INTERNAL_SERVER_ERROR = "InternalServerError",
}
export interface ApiError {
  type: ErrorType;
  message: string;
  statusCode: number;
}
