import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { BusinessDateErrorResponse, ErrorType } from "types/response";
import { HolidayServiceError } from "types/holiday";
import { error as logError } from "utils";

export class ApiError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    type: ErrorType,
    message: string,
    statusCode: number = 400,
    isOperational: boolean = true
  ) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Función pura para crear respuesta de error estándar
const createErrorResponse = (
  error: string,
  message: string
): BusinessDateErrorResponse => ({
  error,
  message,
});

// Función pura para determinar el tipo de error y código de estado
const categorizeError = (
  error: unknown
): {
  type: ErrorType;
  statusCode: number;
  message: string;
} => {
  // Error de validación de Zod
  if (error instanceof ZodError) {
    const firstError = error.issues[0];
    const field = firstError?.path.join(".");
    const message = firstError?.message ?? "Error de validación";

    return {
      type: ErrorType.INVALID_PARAMETERS,
      statusCode: 400,
      message: `Parámetro inválido '${field}': ${message}`,
    };
  }

  // Error personalizado de la API
  if (error instanceof ApiError) {
    return {
      type: error.type,
      statusCode: error.statusCode,
      message: error.message,
    };
  }

  // Error del servicio de días festivos
  if (error && typeof error === "object" && "type" in error) {
    const holidayError = error as HolidayServiceError;

    return {
      type: ErrorType.HOLIDAY_SERVICE_ERROR,
      statusCode: 503,
      message: `Error en servicio de días festivos: ${holidayError.message}`,
    };
  }

  // Error de sintaxis JSON
  if (error instanceof SyntaxError && "body" in error) {
    return {
      type: ErrorType.INVALID_PARAMETERS,
      statusCode: 400,
      message: "Formato JSON inválido en el cuerpo de la petición",
    };
  }

  // Error de validación de Express
  if (error && typeof error === "object" && "type" in error) {
    const expressError = error;

    if (expressError.type === "entity.parse.failed") {
      return {
        type: ErrorType.INVALID_PARAMETERS,
        statusCode: 400,
        message: "Formato de datos inválido",
      };
    }

    if (expressError.type === "entity.too.large") {
      return {
        type: ErrorType.INVALID_PARAMETERS,
        statusCode: 413,
        message: "Cuerpo de la petición demasiado grande",
      };
    }
  }

  // Error de conexión o timeout
  if (error && typeof error === "object" && "code" in error) {
    const networkError = error;

    if (
      networkError.code === "ECONNREFUSED" ||
      networkError.code === "ENOTFOUND"
    ) {
      return {
        type: ErrorType.HOLIDAY_SERVICE_ERROR,
        statusCode: 503,
        message: "Servicio externo no disponible",
      };
    }

    if (networkError.code === "ECONNABORTED") {
      return {
        type: ErrorType.HOLIDAY_SERVICE_ERROR,
        statusCode: 504,
        message: "Timeout en servicio externo",
      };
    }
  }

  // Error genérico
  return {
    type: ErrorType.INTERNAL_SERVER_ERROR,
    statusCode: 500,
    message: "Error interno del servidor",
  };
};

// Función pura para loggear errores usando el logger
const logErrorDetails = (error: unknown, req: Request): void => {
  const method = req.method;
  const url = req.url;
  const userAgent = req.get("User-Agent") ?? "Unknown";
  const ip = req.ip ?? req.connection.remoteAddress ?? "Unknown";

  const errorData = {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    userAgent,
    ip,
    method,
    url,
  };

  logError(`Error en ${method} ${url}`, "ErrorHandler", errorData);
};

// Middleware principal de manejo de errores
export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Loggear el error usando el logger
  logErrorDetails(error, req);

  // Categorizar el error
  const { type, statusCode, message } = categorizeError(error);

  // Crear respuesta de error
  const errorResponse = createErrorResponse(type, message);

  // Enviar respuesta
  res.status(statusCode).json(errorResponse);
};

// Middleware para manejar rutas no encontradas
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const error = new ApiError(
    ErrorType.INVALID_PARAMETERS,
    `Ruta no encontrada: ${req.method} ${req.path}`,
    404
  );

  next(error);
};

// Función helper para crear errores de validación
export const createValidationError = (
  message: string,
  field?: string
): ApiError => {
  const fullMessage = field ? `Campo '${field}': ${message}` : message;
  return new ApiError(ErrorType.INVALID_PARAMETERS, fullMessage, 400);
};

// Función helper para crear errores de parámetros faltantes
export const createMissingParameterError = (parameter: string): ApiError => {
  return new ApiError(
    ErrorType.MISSING_PARAMETERS,
    `Parámetro requerido faltante: ${parameter}`,
    400
  );
};

// Función helper para crear errores de formato de fecha
export const createDateFormatError = (date: string): ApiError => {
  return new ApiError(
    ErrorType.INVALID_DATE_FORMAT,
    `Formato de fecha inválido: ${date}. Use formato ISO 8601 con Z (ej: 2025-01-01T10:00:00Z)`,
    400
  );
};

// Función helper para crear errores de formato de número
export const createNumberFormatError = (
  value: string,
  field: string
): ApiError => {
  return new ApiError(
    ErrorType.INVALID_NUMBER_FORMAT,
    `Valor numérico inválido para '${field}': ${value}. Debe ser un número entero positivo`,
    400
  );
};

// Función helper para crear errores del servicio de días festivos
export const createHolidayServiceError = (
  error: HolidayServiceError
): ApiError => {
  return new ApiError(
    ErrorType.HOLIDAY_SERVICE_ERROR,
    `Error en servicio de días festivos: ${error.message}`,
    503
  );
};
