import { Request, Response } from "express";
import { getHealthCheck } from "../../src/controllers/healthController";

// Mock de utils/logger
jest.mock("utils/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe("healthController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-01T10:00:00Z"));

    mockRequest = {};

    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    // Mock process.uptime
    jest.spyOn(process, "uptime").mockReturnValue(3600); // 1 hour
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe("getHealthCheck", () => {
    it("debe retornar health check exitoso", () => {
      // Act
      getHealthCheck(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "API de Fechas Hábiles - Colombia",
          version: "1.0.0",
          status: "healthy",
          timestamp: "2025-01-01T10:00:00.000Z",
          uptime: 3600,
        })
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("debe manejar error durante health check", () => {
      // Arrange
      const mockLogger = require("utils/logger").logger;
      const error = new Error("Error durante health check");
      mockLogger.info.mockImplementation(() => {
        throw error;
      });

      // Act
      getHealthCheck(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error in health check",
        "HealthCheck",
        error
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "API de Fechas Hábiles - Colombia",
          version: "1.0.0",
          status: "unhealthy",
          error: "Internal server error",
        })
      );
    });

    it("debe mantener estructura correcta de respuesta", () => {
      // Act
      getHealthCheck(mockRequest as Request, mockResponse as Response);

      // Assert
      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(responseCall).toHaveProperty("name");
      expect(responseCall).toHaveProperty("version");
      expect(responseCall).toHaveProperty("status");
      expect(responseCall).toHaveProperty("timestamp");
      expect(responseCall).toHaveProperty("uptime");
      expect(responseCall).toHaveProperty("environment");
      expect(typeof responseCall.name).toBe("string");
      expect(typeof responseCall.version).toBe("string");
      expect(typeof responseCall.status).toBe("string");
      expect(typeof responseCall.timestamp).toBe("string");
      expect(typeof responseCall.uptime).toBe("number");
      expect(typeof responseCall.environment).toBe("string");
    });

    it("debe ser una función síncrona", () => {
      // Act
      const result = getHealthCheck(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(result).toBeUndefined();
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });
});
