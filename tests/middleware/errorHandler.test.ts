import { Request, Response, NextFunction } from "express";
import { ZodError, ZodIssue } from "zod";
import {
  errorHandler,
  notFoundHandler,
  ApiError,
  createValidationError,
  createMissingParameterError,
  createDateFormatError,
  createNumberFormatError,
  createHolidayServiceError,
} from "middleware/errorHandler";
import { ErrorType } from "types/response";
import { HolidayServiceError } from "types/holiday";
import { error as logError } from "utils";

// Mock del logger
jest.mock("utils", () => ({
  error: jest.fn(),
}));

describe("errorHandler", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      method: "GET",
      url: "/api/test",
      get: jest.fn().mockReturnValue("Test-Agent"),
      ip: "127.0.0.1",
      connection: { remoteAddress: "127.0.0.1" } as any,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  describe("✅ Manejo de errores ZodError", () => {
    it("debe manejar errores de validación Zod correctamente", () => {
      // Arrange
      const zodIssue: ZodIssue = {
        code: "invalid_type",
        expected: "string",
        path: ["date"],
        message: "Expected string, received number",
      };
      const zodError = new ZodError([zodIssue]);

      // Act
      errorHandler(
        zodError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(logError).toHaveBeenCalledWith(
        "Error en GET /api/test",
        "ErrorHandler",
        expect.objectContaining({
          error: expect.any(String),
          userAgent: "Test-Agent",
          ip: "127.0.0.1",
          method: "GET",
          url: "/api/test",
        })
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: ErrorType.INVALID_PARAMETERS,
        message: "Parámetro inválido 'date': Expected string, received number",
      });
    });

    it("debe manejar múltiples errores Zod y tomar el primero", () => {
      // Arrange
      const zodIssues: ZodIssue[] = [
        {
          code: "invalid_type",
          expected: "string",
          path: ["date"],
          message: "Expected string, received number",
        },
        {
          code: "invalid_type",
          expected: "number",
          path: ["days"],
          message: "Expected number, received string",
        },
      ];
      const zodError = new ZodError(zodIssues);

      // Act
      errorHandler(
        zodError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: ErrorType.INVALID_PARAMETERS,
        message: "Parámetro inválido 'date': Expected string, received number",
      });
    });
  });

  describe("✅ Manejo de errores ApiError", () => {
    it("debe manejar errores personalizados de la API", () => {
      // Arrange
      const apiError = new ApiError(
        ErrorType.MISSING_PARAMETERS,
        "Parámetro requerido faltante: date",
        400
      );

      // Act
      errorHandler(
        apiError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(logError).toHaveBeenCalledWith(
        "Error en GET /api/test",
        "ErrorHandler",
        expect.objectContaining({
          error: "Parámetro requerido faltante: date",
          stack: expect.any(String),
        })
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: ErrorType.MISSING_PARAMETERS,
        message: "Parámetro requerido faltante: date",
      });
    });

    it("debe manejar errores con códigos de estado personalizados", () => {
      // Arrange
      const apiError = new ApiError(
        ErrorType.HOLIDAY_SERVICE_ERROR,
        "Servicio no disponible",
        503
      );

      // Act
      errorHandler(
        apiError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(503);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: ErrorType.HOLIDAY_SERVICE_ERROR,
        message: "Servicio no disponible",
      });
    });
  });

  describe("✅ Manejo de errores HolidayServiceError", () => {
    it("debe manejar errores del servicio de días festivos", () => {
      // Arrange
      const holidayError: HolidayServiceError = {
        type: "NETWORK_ERROR",
        message: "No se pudo conectar al servicio",
      };

      // Act
      errorHandler(
        holidayError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(503);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: ErrorType.HOLIDAY_SERVICE_ERROR,
        message:
          "Error en servicio de días festivos: No se pudo conectar al servicio",
      });
    });
  });

  describe("✅ Manejo de errores de sintaxis JSON", () => {
    it("debe manejar errores de sintaxis JSON", () => {
      // Arrange
      const syntaxError = new SyntaxError("Unexpected token in JSON");
      (syntaxError as any).body = "invalid json";

      // Act
      errorHandler(
        syntaxError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: ErrorType.INVALID_PARAMETERS,
        message: "Formato JSON inválido en el cuerpo de la petición",
      });
    });
  });

  describe("✅ Manejo de errores de Express", () => {
    it("debe manejar errores de parseo de entidad", () => {
      // Arrange
      const expressError = {
        type: "entity.parse.failed",
        message: "Parse error",
      };

      // Act
      errorHandler(
        expressError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(503);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: ErrorType.HOLIDAY_SERVICE_ERROR,
        message: "Error en servicio de días festivos: Parse error",
      });
    });

    it("debe manejar errores de cuerpo demasiado grande", () => {
      // Arrange
      const expressError = {
        type: "entity.too.large",
        message: "Payload too large",
      };

      // Act
      errorHandler(
        expressError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(503);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: ErrorType.HOLIDAY_SERVICE_ERROR,
        message: "Error en servicio de días festivos: Payload too large",
      });
    });
  });

  describe("✅ Manejo de errores de red", () => {
    it("debe manejar errores de conexión rechazada", () => {
      // Arrange
      const networkError = {
        code: "ECONNREFUSED",
        message: "Connection refused",
      };

      // Act
      errorHandler(
        networkError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(503);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: ErrorType.HOLIDAY_SERVICE_ERROR,
        message: "Servicio externo no disponible",
      });
    });

    it("debe manejar errores de host no encontrado", () => {
      // Arrange
      const networkError = {
        code: "ENOTFOUND",
        message: "Host not found",
      };

      // Act
      errorHandler(
        networkError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(503);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: ErrorType.HOLIDAY_SERVICE_ERROR,
        message: "Servicio externo no disponible",
      });
    });

    it("debe manejar errores de timeout", () => {
      // Arrange
      const networkError = {
        code: "ECONNABORTED",
        message: "Connection timeout",
      };

      // Act
      errorHandler(
        networkError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(504);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: ErrorType.HOLIDAY_SERVICE_ERROR,
        message: "Timeout en servicio externo",
      });
    });
  });

  describe("✅ Manejo de errores genéricos", () => {
    it("debe manejar errores desconocidos como error interno", () => {
      // Arrange
      const unknownError = "Error desconocido";

      // Act
      errorHandler(
        unknownError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: ErrorType.INTERNAL_SERVER_ERROR,
        message: "Error interno del servidor",
      });
    });

    it("debe manejar errores sin stack trace", () => {
      // Arrange
      const errorWithoutStack = { message: "Error sin stack" };

      // Act
      errorHandler(
        errorWithoutStack,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(logError).toHaveBeenCalledWith(
        "Error en GET /api/test",
        "ErrorHandler",
        expect.objectContaining({
          error: expect.any(String),
          stack: undefined,
        })
      );
    });
  });

  describe("✅ Manejo de información de request", () => {
    it("debe extraer información correcta del request para logging", () => {
      // Arrange
      const error = new Error("Test error");
      mockRequest = {
        method: "POST",
        url: "/api/business-dates",
        get: jest.fn().mockReturnValue("Mozilla/5.0"),
        ip: "192.168.1.1",
        connection: { remoteAddress: "192.168.1.1" } as any,
      };

      // Act
      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(logError).toHaveBeenCalledWith(
        "Error en POST /api/business-dates",
        "ErrorHandler",
        expect.objectContaining({
          userAgent: "Mozilla/5.0",
          ip: "192.168.1.1",
          method: "POST",
          url: "/api/business-dates",
        })
      );
    });

    it("debe manejar request sin User-Agent", () => {
      // Arrange
      const error = new Error("Test error");
      mockRequest = {
        method: "GET",
        url: "/api/test",
        get: jest.fn().mockReturnValue(undefined),
        ip: undefined,
        connection: { remoteAddress: undefined } as any,
      };

      // Act
      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(logError).toHaveBeenCalledWith(
        "Error en GET /api/test",
        "ErrorHandler",
        expect.objectContaining({
          userAgent: "Unknown",
          ip: "Unknown",
        })
      );
    });
  });
});

describe("notFoundHandler", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      method: "GET",
      path: "/api/nonexistent",
    };

    mockResponse = {};
    mockNext = jest.fn();
  });

  it("debe crear un error 404 para rutas no encontradas", () => {
    // Arrange
    const expectedError = new ApiError(
      ErrorType.INVALID_PARAMETERS,
      "Ruta no encontrada: GET /api/nonexistent",
      404
    );

    // Act
    notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext);

    // Assert
    expect(mockNext).toHaveBeenCalledWith(expectedError);
  });

  it("debe incluir método y path en el mensaje de error", () => {
    // Arrange
    mockRequest = {
      method: "POST",
      path: "/api/invalid-route",
    };

    // Act
    notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext);

    // Assert
    const calledError = (mockNext as jest.Mock).mock.calls[0][0];
    expect(calledError.message).toBe(
      "Ruta no encontrada: POST /api/invalid-route"
    );
    expect(calledError.statusCode).toBe(404);
    expect(calledError.type).toBe(ErrorType.INVALID_PARAMETERS);
  });
});

describe("Helper functions", () => {
  describe("createValidationError", () => {
    it("debe crear error de validación con mensaje", () => {
      // Arrange
      const message = "Valor inválido";

      // Act
      const error = createValidationError(message);

      // Assert
      expect(error).toBeInstanceOf(ApiError);
      expect(error.type).toBe(ErrorType.INVALID_PARAMETERS);
      expect(error.message).toBe("Valor inválido");
      expect(error.statusCode).toBe(400);
    });

    it("debe crear error de validación con campo específico", () => {
      // Arrange
      const message = "Debe ser un número";
      const field = "days";

      // Act
      const error = createValidationError(message, field);

      // Assert
      expect(error.message).toBe("Campo 'days': Debe ser un número");
    });
  });

  describe("createMissingParameterError", () => {
    it("debe crear error de parámetro faltante", () => {
      // Arrange
      const parameter = "date";

      // Act
      const error = createMissingParameterError(parameter);

      // Assert
      expect(error).toBeInstanceOf(ApiError);
      expect(error.type).toBe(ErrorType.MISSING_PARAMETERS);
      expect(error.message).toBe("Parámetro requerido faltante: date");
      expect(error.statusCode).toBe(400);
    });
  });

  describe("createDateFormatError", () => {
    it("debe crear error de formato de fecha", () => {
      // Arrange
      const date = "invalid-date";

      // Act
      const error = createDateFormatError(date);

      // Assert
      expect(error).toBeInstanceOf(ApiError);
      expect(error.type).toBe(ErrorType.INVALID_DATE_FORMAT);
      expect(error.message).toBe(
        "Formato de fecha inválido: invalid-date. Use formato ISO 8601 con Z (ej: 2025-01-01T10:00:00Z)"
      );
      expect(error.statusCode).toBe(400);
    });
  });

  describe("createNumberFormatError", () => {
    it("debe crear error de formato de número", () => {
      // Arrange
      const value = "abc";
      const field = "days";

      // Act
      const error = createNumberFormatError(value, field);

      // Assert
      expect(error).toBeInstanceOf(ApiError);
      expect(error.type).toBe(ErrorType.INVALID_NUMBER_FORMAT);
      expect(error.message).toBe(
        "Valor numérico inválido para 'days': abc. Debe ser un número entero positivo"
      );
      expect(error.statusCode).toBe(400);
    });
  });

  describe("createHolidayServiceError", () => {
    it("debe crear error del servicio de días festivos", () => {
      // Arrange
      const holidayError: HolidayServiceError = {
        type: "NETWORK_ERROR",
        message: "API no disponible",
      };

      // Act
      const error = createHolidayServiceError(holidayError);

      // Assert
      expect(error).toBeInstanceOf(ApiError);
      expect(error.type).toBe(ErrorType.HOLIDAY_SERVICE_ERROR);
      expect(error.message).toBe(
        "Error en servicio de días festivos: API no disponible"
      );
      expect(error.statusCode).toBe(503);
    });
  });
});
