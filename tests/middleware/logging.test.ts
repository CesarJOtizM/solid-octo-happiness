import { Request, Response, NextFunction } from "express";
import { loggingMiddleware } from "middleware/logging";
import { logger } from "utils/logger";

// Mock del logger
jest.mock("utils/logger", () => ({
  logger: {
    apiRequest: jest.fn(),
    apiResponse: jest.fn(),
  },
}));

describe("loggingMiddleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockRequest = {
      method: "GET",
      url: "/api/business-dates",
      query: { days: "5", date: "2025-01-01T10:00:00Z" },
      body: {},
    };

    mockResponse = {
      on: jest.fn(),
      statusCode: 200,
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("✅ Logging de requests", () => {
    it("debe loggear información de request correctamente", () => {
      // Arrange
      const expectedRequestData = {
        query: { days: "5", date: "2025-01-01T10:00:00Z" },
        body: {},
      };

      // Act
      loggingMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(logger.apiRequest).toHaveBeenCalledWith(
        "GET",
        "/api/business-dates",
        expectedRequestData
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it("debe loggear request con body", () => {
      // Arrange
      mockRequest = {
        method: "POST",
        url: "/api/business-dates",
        query: {},
        body: { days: 5, date: "2025-01-01T10:00:00Z" },
      };

      const expectedRequestData = {
        query: {},
        body: { days: 5, date: "2025-01-01T10:00:00Z" },
      };

      // Act
      loggingMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(logger.apiRequest).toHaveBeenCalledWith(
        "POST",
        "/api/business-dates",
        expectedRequestData
      );
    });

    it("debe loggear request sin query ni body", () => {
      // Arrange
      mockRequest = {
        method: "GET",
        url: "/api/health",
        query: {},
        body: {},
      };

      const expectedRequestData = {
        query: {},
        body: {},
      };

      // Act
      loggingMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(logger.apiRequest).toHaveBeenCalledWith(
        "GET",
        "/api/health",
        expectedRequestData
      );
    });

    it("debe loggear diferentes métodos HTTP", () => {
      // Arrange
      const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

      methods.forEach(method => {
        jest.clearAllMocks();
        mockRequest.method = method;
        mockRequest.url = `/api/test-${method.toLowerCase()}`;

        // Act
        loggingMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(logger.apiRequest).toHaveBeenCalledWith(
          method,
          `/api/test-${method.toLowerCase()}`,
          expect.any(Object)
        );
      });
    });
  });

  describe("✅ Logging de responses", () => {
    it("debe registrar listener para evento finish y loggear response", () => {
      // Arrange
      const mockOn = mockResponse.on as jest.Mock;
      let finishCallback: () => void;

      // Act
      loggingMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockOn).toHaveBeenCalledWith("finish", expect.any(Function));

      // Simular el callback del evento finish
      finishCallback = mockOn.mock.calls[0][1];
      finishCallback();

      expect(logger.apiResponse).toHaveBeenCalledWith(200, expect.any(Number));
    });

    it("debe calcular tiempo de respuesta correctamente", () => {
      // Arrange
      const mockOn = mockResponse.on as jest.Mock;
      const startTime = Date.now();
      jest.setSystemTime(startTime);

      // Act
      loggingMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Simular tiempo transcurrido
      jest.advanceTimersByTime(150); // 150ms
      const finishCallback = mockOn.mock.calls[0][1];
      finishCallback();

      // Assert
      expect(logger.apiResponse).toHaveBeenCalledWith(200, 150);
    });

    it("debe loggear diferentes códigos de estado", () => {
      // Arrange
      const statusCodes = [200, 201, 400, 404, 500];
      const mockOn = mockResponse.on as jest.Mock;

      statusCodes.forEach(statusCode => {
        jest.clearAllMocks();
        mockResponse.statusCode = statusCode;

        // Act
        loggingMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Simular respuesta
        const finishCallback = mockOn.mock.calls[0][1];
        finishCallback();

        // Assert
        expect(logger.apiResponse).toHaveBeenCalledWith(
          statusCode,
          expect.any(Number)
        );
      });
    });

    it("debe manejar response time de 0ms", () => {
      // Arrange
      const mockOn = mockResponse.on as jest.Mock;
      const startTime = Date.now();
      jest.setSystemTime(startTime);

      // Act
      loggingMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // No avanzar tiempo
      const finishCallback = mockOn.mock.calls[0][1];
      finishCallback();

      // Assert
      expect(logger.apiResponse).toHaveBeenCalledWith(200, 0);
    });
  });

  describe("✅ Flujo completo del middleware", () => {
    it("debe ejecutar todo el flujo correctamente", () => {
      // Arrange
      const mockOn = mockResponse.on as jest.Mock;
      const startTime = Date.now();
      jest.setSystemTime(startTime);

      // Act
      loggingMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Simular tiempo transcurrido
      jest.advanceTimersByTime(75);
      const finishCallback = mockOn.mock.calls[0][1];
      finishCallback();

      // Assert
      expect(logger.apiRequest).toHaveBeenCalledWith(
        "GET",
        "/api/business-dates",
        {
          query: { days: "5", date: "2025-01-01T10:00:00Z" },
          body: {},
        }
      );
      expect(logger.apiResponse).toHaveBeenCalledWith(200, 75);
      expect(mockNext).toHaveBeenCalled();
    });

    it("debe continuar con next() después de configurar logging", () => {
      // Arrange
      const mockOn = mockResponse.on as jest.Mock;

      // Act
      loggingMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockOn).toHaveBeenCalledWith("finish", expect.any(Function));
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe("✅ Manejo de edge cases", () => {
    it("debe manejar request con query complejo", () => {
      // Arrange
      mockRequest = {
        method: "GET",
        url: "/api/business-dates",
        query: {
          days: "5",
          hours: "8",
          date: "2025-01-01T10:00:00Z",
          timezone: "America/Mexico_City",
        },
        body: {},
      };

      // Act
      loggingMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(logger.apiRequest).toHaveBeenCalledWith(
        "GET",
        "/api/business-dates",
        {
          query: {
            days: "5",
            hours: "8",
            date: "2025-01-01T10:00:00Z",
            timezone: "America/Mexico_City",
          },
          body: {},
        }
      );
    });

    it("debe manejar request con body complejo", () => {
      // Arrange
      mockRequest = {
        method: "POST",
        url: "/api/business-dates",
        query: {},
        body: {
          days: 5,
          hours: 8,
          date: "2025-01-01T10:00:00Z",
          timezone: "America/Mexico_City",
          includeHolidays: true,
        },
      };

      // Act
      loggingMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(logger.apiRequest).toHaveBeenCalledWith(
        "POST",
        "/api/business-dates",
        {
          query: {},
          body: {
            days: 5,
            hours: 8,
            date: "2025-01-01T10:00:00Z",
            timezone: "America/Mexico_City",
            includeHolidays: true,
          },
        }
      );
    });

    it("debe manejar URLs con parámetros de ruta", () => {
      // Arrange
      mockRequest = {
        method: "GET",
        url: "/api/business-dates/123/calculate",
        query: { days: "5" },
        body: {},
      };

      // Act
      loggingMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(logger.apiRequest).toHaveBeenCalledWith(
        "GET",
        "/api/business-dates/123/calculate",
        {
          query: { days: "5" },
          body: {},
        }
      );
    });

    it("debe manejar URLs con query strings complejos", () => {
      // Arrange
      mockRequest = {
        method: "GET",
        url: "/api/business-dates?days=5&hours=8&date=2025-01-01T10:00:00Z&timezone=America/Mexico_City",
        query: {
          days: "5",
          hours: "8",
          date: "2025-01-01T10:00:00Z",
          timezone: "America/Mexico_City",
        },
        body: {},
      };

      // Act
      loggingMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(logger.apiRequest).toHaveBeenCalledWith(
        "GET",
        "/api/business-dates?days=5&hours=8&date=2025-01-01T10:00:00Z&timezone=America/Mexico_City",
        {
          query: {
            days: "5",
            hours: "8",
            date: "2025-01-01T10:00:00Z",
            timezone: "America/Mexico_City",
          },
          body: {},
        }
      );
    });
  });

  describe("🔍 Validación de tipos y estructura", () => {
    it("debe pasar datos correctos al logger de request", () => {
      // Arrange
      mockRequest = {
        method: "POST",
        url: "/api/test",
        query: { param1: "value1" },
        body: { param2: "value2" },
      };

      // Act
      loggingMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      const requestCall = (logger.apiRequest as jest.Mock).mock.calls[0];
      expect(requestCall[0]).toBe("POST");
      expect(requestCall[1]).toBe("/api/test");
      expect(requestCall[2]).toEqual({
        query: { param1: "value1" },
        body: { param2: "value2" },
      });
    });

    it("debe pasar datos correctos al logger de response", () => {
      // Arrange
      const mockOn = mockResponse.on as jest.Mock;
      mockResponse.statusCode = 201;

      // Act
      loggingMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Simular respuesta
      const finishCallback = mockOn.mock.calls[0][1];
      finishCallback();

      // Assert
      const responseCall = (logger.apiResponse as jest.Mock).mock.calls[0];
      expect(responseCall[0]).toBe(201);
      expect(typeof responseCall[1]).toBe("number");
      expect(responseCall[1]).toBeGreaterThanOrEqual(0);
    });
  });
});
