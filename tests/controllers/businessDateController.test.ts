import { Request, Response } from "express";
import { getBusinessDate } from "../../src/controllers/businessDateController";
import { BusinessDateRequest } from "../../src/types/request";

// Mock de utils/logger
jest.mock("utils", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock de services/businessDateService
jest.mock("../../src/services/businessDateService", () => ({
  calculateBusinessDate: jest.fn(),
  formatBusinessDateResponse: jest.fn(),
  formatBusinessDateError: jest.fn(),
}));

describe("businessDateController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockLogger: any;
  let mockCalculateBusinessDate: jest.MockedFunction<any>;
  let mockFormatBusinessDateResponse: jest.MockedFunction<any>;
  let mockFormatBusinessDateError: jest.MockedFunction<any>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      validatedParams: {
        days: 5,
        hours: 8,
        date: "2025-01-01T10:00:00Z",
      } as BusinessDateRequest,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockLogger = require("utils").logger;
    mockCalculateBusinessDate =
      require("../../src/services/businessDateService").calculateBusinessDate;
    mockFormatBusinessDateResponse =
      require("../../src/services/businessDateService").formatBusinessDateResponse;
    mockFormatBusinessDateError =
      require("../../src/services/businessDateService").formatBusinessDateError;
  });

  describe("getBusinessDate", () => {
    describe("✅ Casos exitosos", () => {
      it("debe procesar request exitoso con días y horas", async () => {
        // Arrange
        const validatedParams: BusinessDateRequest = {
          days: 5,
          hours: 8,
          date: "2025-01-01T10:00:00Z",
        };
        const calculationResult = {
          success: true,
          resultDate: new Date("2025-01-08T18:00:00Z"),
          originalDate: new Date("2025-01-01T10:00:00Z"),
          addedDays: 5,
          addedHours: 8,
        };
        const formattedResponse = {
          date: "2025-01-08T18:00:00Z",
        };

        mockRequest.validatedParams = validatedParams;
        mockCalculateBusinessDate.mockResolvedValue(calculationResult);
        mockFormatBusinessDateResponse.mockReturnValue(formattedResponse);

        // Act
        await getBusinessDate(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockLogger.info).toHaveBeenCalledWith(
          `Calculando fecha hábil para: ${JSON.stringify(validatedParams)}`,
          "BusinessDateController"
        );
        expect(mockCalculateBusinessDate).toHaveBeenCalledWith(validatedParams);
        expect(mockFormatBusinessDateResponse).toHaveBeenCalledWith(
          calculationResult
        );
        expect(mockLogger.info).toHaveBeenCalledWith(
          `Fecha hábil calculada: ${formattedResponse.date}`,
          "BusinessDateController"
        );
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(formattedResponse);
      });

      it("debe procesar request exitoso solo con días", async () => {
        // Arrange
        const validatedParams: BusinessDateRequest = { days: 3 };
        const calculationResult = {
          success: true,
          resultDate: new Date("2025-01-04T10:00:00Z"),
          originalDate: new Date("2025-01-01T10:00:00Z"),
          addedDays: 3,
          addedHours: 0,
        };
        const formattedResponse = {
          date: "2025-01-04T10:00:00Z",
        };

        mockRequest.validatedParams = validatedParams;
        mockCalculateBusinessDate.mockResolvedValue(calculationResult);
        mockFormatBusinessDateResponse.mockReturnValue(formattedResponse);

        // Act
        await getBusinessDate(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockCalculateBusinessDate).toHaveBeenCalledWith(validatedParams);
        expect(mockFormatBusinessDateResponse).toHaveBeenCalledWith(
          calculationResult
        );
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(formattedResponse);
      });

      it("debe procesar request exitoso solo con horas", async () => {
        // Arrange
        const validatedParams: BusinessDateRequest = { hours: 6 };
        const calculationResult = {
          success: true,
          resultDate: new Date("2025-01-01T16:00:00Z"),
          originalDate: new Date("2025-01-01T10:00:00Z"),
          addedDays: 0,
          addedHours: 6,
        };
        const formattedResponse = {
          date: "2025-01-01T16:00:00Z",
        };

        mockRequest.validatedParams = validatedParams;
        mockCalculateBusinessDate.mockResolvedValue(calculationResult);
        mockFormatBusinessDateResponse.mockReturnValue(formattedResponse);

        // Act
        await getBusinessDate(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockCalculateBusinessDate).toHaveBeenCalledWith(validatedParams);
        expect(mockFormatBusinessDateResponse).toHaveBeenCalledWith(
          calculationResult
        );
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(formattedResponse);
      });

      it("debe procesar request exitoso sin parámetros", async () => {
        // Arrange
        const validatedParams: BusinessDateRequest = {};
        const calculationResult = {
          success: true,
          resultDate: new Date("2025-01-01T10:00:00Z"),
          originalDate: new Date("2025-01-01T10:00:00Z"),
          addedDays: 0,
          addedHours: 0,
        };
        const formattedResponse = {
          date: "2025-01-01T10:00:00Z",
        };

        mockRequest.validatedParams = validatedParams;
        mockCalculateBusinessDate.mockResolvedValue(calculationResult);
        mockFormatBusinessDateResponse.mockReturnValue(formattedResponse);

        // Act
        await getBusinessDate(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockCalculateBusinessDate).toHaveBeenCalledWith(validatedParams);
        expect(mockFormatBusinessDateResponse).toHaveBeenCalledWith(
          calculationResult
        );
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(formattedResponse);
      });
    });

    describe("❌ Casos de error", () => {
      it("debe manejar error del servicio de días festivos", async () => {
        // Arrange
        const validatedParams: BusinessDateRequest = { days: 5 };
        const calculationResult = {
          success: false,
          error: "HolidayServiceError",
          message:
            "Error al obtener días festivos: No se pudo conectar con la API",
        };
        const errorResponse = {
          error: "HolidayServiceError",
          message:
            "Error al obtener días festivos: No se pudo conectar con la API",
        };

        mockRequest.validatedParams = validatedParams;
        mockCalculateBusinessDate.mockResolvedValue(calculationResult);
        mockFormatBusinessDateError.mockReturnValue(errorResponse);

        // Act
        await getBusinessDate(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockCalculateBusinessDate).toHaveBeenCalledWith(validatedParams);
        expect(mockFormatBusinessDateError).toHaveBeenCalledWith(
          calculationResult
        );
        expect(mockLogger.warn).toHaveBeenCalledWith(
          `Error en cálculo de fecha hábil: ${errorResponse.message}`,
          "BusinessDateController"
        );
        expect(mockResponse.status).toHaveBeenCalledWith(503);
        expect(mockResponse.json).toHaveBeenCalledWith(errorResponse);
      });

      it("debe manejar error de cálculo", async () => {
        // Arrange
        const validatedParams: BusinessDateRequest = { days: 5 };
        const calculationResult = {
          success: false,
          error: "CalculationError",
          message: "Error durante el cálculo: Fecha inválida",
        };
        const errorResponse = {
          error: "CalculationError",
          message: "Error durante el cálculo: Fecha inválida",
        };

        mockRequest.validatedParams = validatedParams;
        mockCalculateBusinessDate.mockResolvedValue(calculationResult);
        mockFormatBusinessDateError.mockReturnValue(errorResponse);

        // Act
        await getBusinessDate(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockCalculateBusinessDate).toHaveBeenCalledWith(validatedParams);
        expect(mockFormatBusinessDateError).toHaveBeenCalledWith(
          calculationResult
        );
        expect(mockLogger.warn).toHaveBeenCalledWith(
          `Error en cálculo de fecha hábil: ${errorResponse.message}`,
          "BusinessDateController"
        );
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(errorResponse);
      });

      it("debe manejar error inesperado en el controlador", async () => {
        // Arrange
        const validatedParams: BusinessDateRequest = { days: 5 };
        const unexpectedError = new Error("Error inesperado");

        mockRequest.validatedParams = validatedParams;
        mockCalculateBusinessDate.mockRejectedValue(unexpectedError);

        // Act
        await getBusinessDate(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockCalculateBusinessDate).toHaveBeenCalledWith(validatedParams);
        expect(mockLogger.error).toHaveBeenCalledWith(
          `Error inesperado en controlador: ${unexpectedError.message}`,
          "BusinessDateController",
          { error: unexpectedError }
        );
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          error: "InternalServerError",
          message: "Error interno del servidor",
        });
      });

      it("debe manejar error desconocido en el controlador", async () => {
        // Arrange
        const validatedParams: BusinessDateRequest = { days: 5 };
        const unknownError = "Error desconocido";

        mockRequest.validatedParams = validatedParams;
        mockCalculateBusinessDate.mockRejectedValue(unknownError);

        // Act
        await getBusinessDate(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockCalculateBusinessDate).toHaveBeenCalledWith(validatedParams);
        expect(mockLogger.error).toHaveBeenCalledWith(
          "Error inesperado en controlador: Error desconocido",
          "BusinessDateController",
          { error: unknownError }
        );
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          error: "InternalServerError",
          message: "Error interno del servidor",
        });
      });
    });

    describe("🔍 Validación de códigos de estado", () => {
      it("debe retornar 503 para HolidayServiceError", async () => {
        // Arrange
        const validatedParams: BusinessDateRequest = { days: 5 };
        const calculationResult = {
          success: false,
          error: "HolidayServiceError",
          message: "Error al obtener días festivos",
        };
        const errorResponse = {
          error: "HolidayServiceError",
          message: "Error al obtener días festivos",
        };

        mockRequest.validatedParams = validatedParams;
        mockCalculateBusinessDate.mockResolvedValue(calculationResult);
        mockFormatBusinessDateError.mockReturnValue(errorResponse);

        // Act
        await getBusinessDate(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(503);
      });

      it("debe retornar 400 para otros errores", async () => {
        // Arrange
        const validatedParams: BusinessDateRequest = { days: 5 };
        const calculationResult = {
          success: false,
          error: "ValidationError",
          message: "Error de validación",
        };
        const errorResponse = {
          error: "ValidationError",
          message: "Error de validación",
        };

        mockRequest.validatedParams = validatedParams;
        mockCalculateBusinessDate.mockResolvedValue(calculationResult);
        mockFormatBusinessDateError.mockReturnValue(errorResponse);

        // Act
        await getBusinessDate(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
      });
    });

    describe("🔍 Validación de logging", () => {
      it("debe loggear información de request correctamente", async () => {
        // Arrange
        const validatedParams: BusinessDateRequest = {
          days: 5,
          hours: 8,
          date: "2025-01-01T10:00:00Z",
        };
        const calculationResult = {
          success: true,
          resultDate: new Date("2025-01-08T18:00:00Z"),
          originalDate: new Date("2025-01-01T10:00:00Z"),
          addedDays: 5,
          addedHours: 8,
        };
        const formattedResponse = {
          date: "2025-01-08T18:00:00Z",
        };

        mockRequest.validatedParams = validatedParams;
        mockCalculateBusinessDate.mockResolvedValue(calculationResult);
        mockFormatBusinessDateResponse.mockReturnValue(formattedResponse);

        // Act
        await getBusinessDate(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockLogger.info).toHaveBeenCalledWith(
          `Calculando fecha hábil para: ${JSON.stringify(validatedParams)}`,
          "BusinessDateController"
        );
        expect(mockLogger.info).toHaveBeenCalledWith(
          `Fecha hábil calculada: ${formattedResponse.date}`,
          "BusinessDateController"
        );
      });

      it("debe loggear warning para errores de cálculo", async () => {
        // Arrange
        const validatedParams: BusinessDateRequest = { days: 5 };
        const calculationResult = {
          success: false,
          error: "CalculationError",
          message: "Error durante el cálculo",
        };
        const errorResponse = {
          error: "CalculationError",
          message: "Error durante el cálculo",
        };

        mockRequest.validatedParams = validatedParams;
        mockCalculateBusinessDate.mockResolvedValue(calculationResult);
        mockFormatBusinessDateError.mockReturnValue(errorResponse);

        // Act
        await getBusinessDate(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockLogger.warn).toHaveBeenCalledWith(
          `Error en cálculo de fecha hábil: ${errorResponse.message}`,
          "BusinessDateController"
        );
      });

      it("debe loggear error para errores inesperados", async () => {
        // Arrange
        const validatedParams: BusinessDateRequest = { days: 5 };
        const unexpectedError = new Error("Error inesperado");

        mockRequest.validatedParams = validatedParams;
        mockCalculateBusinessDate.mockRejectedValue(unexpectedError);

        // Act
        await getBusinessDate(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockLogger.error).toHaveBeenCalledWith(
          `Error inesperado en controlador: ${unexpectedError.message}`,
          "BusinessDateController",
          { error: unexpectedError }
        );
      });
    });

    describe("🔍 Validación de integridad", () => {
      it("debe mantener consistencia en tipos de respuesta", async () => {
        // Arrange
        const validatedParams: BusinessDateRequest = { days: 5 };
        const calculationResult = {
          success: true,
          resultDate: new Date("2025-01-06T10:00:00Z"),
          originalDate: new Date("2025-01-01T10:00:00Z"),
          addedDays: 5,
          addedHours: 0,
        };
        const formattedResponse = {
          date: "2025-01-06T10:00:00Z",
        };

        mockRequest.validatedParams = validatedParams;
        mockCalculateBusinessDate.mockResolvedValue(calculationResult);
        mockFormatBusinessDateResponse.mockReturnValue(formattedResponse);

        // Act
        await getBusinessDate(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockResponse.json).toHaveBeenCalledWith(formattedResponse);
        expect(typeof formattedResponse.date).toBe("string");
      });

      it("debe manejar request sin validatedParams", async () => {
        // Arrange
        mockRequest.validatedParams = undefined as any;
        const calculationResult = {
          success: true,
          resultDate: new Date("2025-01-01T10:00:00Z"),
          originalDate: new Date("2025-01-01T10:00:00Z"),
          addedDays: 0,
          addedHours: 0,
        };
        const formattedResponse = {
          date: "2025-01-01T10:00:00Z",
        };

        mockCalculateBusinessDate.mockResolvedValue(calculationResult);
        mockFormatBusinessDateResponse.mockReturnValue(formattedResponse);

        // Act
        await getBusinessDate(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockCalculateBusinessDate).toHaveBeenCalledWith(undefined);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(formattedResponse);
      });

      it("debe mantener orden de operaciones correcto", async () => {
        // Arrange
        const validatedParams: BusinessDateRequest = { days: 5 };
        const calculationResult = {
          success: true,
          resultDate: new Date("2025-01-06T10:00:00Z"),
          originalDate: new Date("2025-01-01T10:00:00Z"),
          addedDays: 5,
          addedHours: 0,
        };
        const formattedResponse = {
          date: "2025-01-06T10:00:00Z",
        };

        mockRequest.validatedParams = validatedParams;
        mockCalculateBusinessDate.mockResolvedValue(calculationResult);
        mockFormatBusinessDateResponse.mockReturnValue(formattedResponse);

        // Act
        await getBusinessDate(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockCalculateBusinessDate).toHaveBeenCalled();
        expect(mockFormatBusinessDateResponse).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalled();
      });
    });
  });
});
