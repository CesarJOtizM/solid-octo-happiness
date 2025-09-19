import { Request, Response, NextFunction } from "express";
import { validateBusinessDateRequest } from "middleware/validation";
import { BusinessDateRequest } from "types/request";
import { ZodError } from "zod";

// Mock del schema
jest.mock("schemas/businessDateRequestSchema", () => ({
  businessDateRequestSchema: {
    parse: jest.fn(),
  },
}));

// Mock de utils/timezoneUtils
jest.mock("utils/timezoneUtils", () => ({
  isValidIsoDate: jest.fn(),
}));

describe("validateBusinessDateRequest", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockSchema: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      query: {},
    };

    mockResponse = {};
    mockNext = jest.fn();

    // Mock del schema
    mockSchema =
      require("schemas/businessDateRequestSchema").businessDateRequestSchema;
  });

  describe("✅ Validación exitosa", () => {
    it("debe validar parámetros correctos y agregarlos al request", () => {
      // Arrange
      const queryParams = {
        days: "5",
        hours: "8",
        date: "2025-01-01T10:00:00Z",
      };
      const validatedParams: BusinessDateRequest = {
        days: 5,
        hours: 8,
        date: "2025-01-01T10:00:00Z",
      };

      mockRequest.query = queryParams;
      mockSchema.parse.mockReturnValue(validatedParams);

      // Act
      validateBusinessDateRequest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockSchema.parse).toHaveBeenCalledWith(queryParams);
      expect(mockRequest.validatedParams).toEqual(validatedParams);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("debe validar solo parámetro days", () => {
      // Arrange
      const queryParams = { days: "10" };
      const validatedParams: BusinessDateRequest = { days: 10 };

      mockRequest.query = queryParams;
      mockSchema.parse.mockReturnValue(validatedParams);

      // Act
      validateBusinessDateRequest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockSchema.parse).toHaveBeenCalledWith(queryParams);
      expect(mockRequest.validatedParams).toEqual(validatedParams);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("debe validar solo parámetro hours", () => {
      // Arrange
      const queryParams = { hours: "6" };
      const validatedParams: BusinessDateRequest = { hours: 6 };

      mockRequest.query = queryParams;
      mockSchema.parse.mockReturnValue(validatedParams);

      // Act
      validateBusinessDateRequest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockSchema.parse).toHaveBeenCalledWith(queryParams);
      expect(mockRequest.validatedParams).toEqual(validatedParams);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("debe validar solo parámetro date", () => {
      // Arrange
      const queryParams = { date: "2025-01-01T10:00:00Z" };
      const validatedParams: BusinessDateRequest = {
        date: "2025-01-01T10:00:00Z",
      };

      mockRequest.query = queryParams;
      mockSchema.parse.mockReturnValue(validatedParams);

      // Act
      validateBusinessDateRequest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockSchema.parse).toHaveBeenCalledWith(queryParams);
      expect(mockRequest.validatedParams).toEqual(validatedParams);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("debe validar combinación de days y date", () => {
      // Arrange
      const queryParams = {
        days: "3",
        date: "2025-01-01T10:00:00Z",
      };
      const validatedParams: BusinessDateRequest = {
        days: 3,
        date: "2025-01-01T10:00:00Z",
      };

      mockRequest.query = queryParams;
      mockSchema.parse.mockReturnValue(validatedParams);

      // Act
      validateBusinessDateRequest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockSchema.parse).toHaveBeenCalledWith(queryParams);
      expect(mockRequest.validatedParams).toEqual(validatedParams);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("debe validar combinación de hours y date", () => {
      // Arrange
      const queryParams = {
        hours: "4",
        date: "2025-01-01T10:00:00Z",
      };
      const validatedParams: BusinessDateRequest = {
        hours: 4,
        date: "2025-01-01T10:00:00Z",
      };

      mockRequest.query = queryParams;
      mockSchema.parse.mockReturnValue(validatedParams);

      // Act
      validateBusinessDateRequest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockSchema.parse).toHaveBeenCalledWith(queryParams);
      expect(mockRequest.validatedParams).toEqual(validatedParams);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("debe manejar parámetros undefined correctamente", () => {
      // Arrange
      const queryParams = {
        days: "5",
        hours: undefined,
        date: undefined,
      };
      const validatedParams: BusinessDateRequest = { days: 5 };

      mockRequest.query = queryParams;
      mockSchema.parse.mockReturnValue(validatedParams);

      // Act
      validateBusinessDateRequest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockSchema.parse).toHaveBeenCalledWith({ days: "5" });
      expect(mockRequest.validatedParams).toEqual(validatedParams);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe("❌ Manejo de errores de validación", () => {
    it("debe pasar error de Zod al next middleware", () => {
      // Arrange
      const queryParams = { days: "invalid" };
      const zodError = new ZodError([
        {
          code: "custom",
          message: "El parámetro 'days' debe ser un número entero",
          path: ["days"],
        },
      ]);

      mockRequest.query = queryParams;
      mockSchema.parse.mockImplementation(() => {
        throw zodError;
      });

      // Act
      validateBusinessDateRequest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockSchema.parse).toHaveBeenCalledWith(queryParams);
      expect(mockRequest.validatedParams).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith(zodError);
    });

    it("debe manejar error de validación de fecha", () => {
      // Arrange
      const queryParams = { date: "invalid-date" };
      const zodError = new ZodError([
        {
          code: "custom",
          message:
            "El parámetro 'date' debe ser una fecha válida en formato ISO 8601 UTC",
          path: ["date"],
        },
      ]);

      mockRequest.query = queryParams;
      mockSchema.parse.mockImplementation(() => {
        throw zodError;
      });

      // Act
      validateBusinessDateRequest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockSchema.parse).toHaveBeenCalledWith(queryParams);
      expect(mockNext).toHaveBeenCalledWith(zodError);
    });

    it("debe manejar error de parámetros faltantes", () => {
      // Arrange
      const queryParams = {};
      const zodError = new ZodError([
        {
          code: "custom",
          message:
            "Se debe proporcionar al menos uno de los parámetros: days o hours",
          path: ["days", "hours"],
        },
      ]);

      mockRequest.query = queryParams;
      mockSchema.parse.mockImplementation(() => {
        throw zodError;
      });

      // Act
      validateBusinessDateRequest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockSchema.parse).toHaveBeenCalledWith({});
      expect(mockNext).toHaveBeenCalledWith(zodError);
    });

    it("debe manejar error de número negativo", () => {
      // Arrange
      const queryParams = { days: "-5" };
      const zodError = new ZodError([
        {
          code: "custom",
          message: "El parámetro 'days' debe ser un número positivo",
          path: ["days"],
        },
      ]);

      mockRequest.query = queryParams;
      mockSchema.parse.mockImplementation(() => {
        throw zodError;
      });

      // Act
      validateBusinessDateRequest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockSchema.parse).toHaveBeenCalledWith(queryParams);
      expect(mockNext).toHaveBeenCalledWith(zodError);
    });

    it("debe manejar error de número decimal", () => {
      // Arrange
      const queryParams = { hours: "5.5" };
      const zodError = new ZodError([
        {
          code: "custom",
          message: "El parámetro 'hours' debe ser un número entero",
          path: ["hours"],
        },
      ]);

      mockRequest.query = queryParams;
      mockSchema.parse.mockImplementation(() => {
        throw zodError;
      });

      // Act
      validateBusinessDateRequest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockSchema.parse).toHaveBeenCalledWith(queryParams);
      expect(mockNext).toHaveBeenCalledWith(zodError);
    });
  });

  describe("🔍 Preparación de parámetros", () => {
    it("debe preparar objeto de parámetros solo con valores definidos", () => {
      // Arrange
      mockRequest.query = {
        days: "5",
        hours: undefined,
        date: "2025-01-01T10:00:00Z",
        extra: "ignored",
      };

      // Act
      validateBusinessDateRequest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockSchema.parse).toHaveBeenCalledWith({
        days: "5",
        date: "2025-01-01T10:00:00Z",
      });
    });

    it("debe ignorar parámetros no reconocidos", () => {
      // Arrange
      mockRequest.query = {
        days: "5",
        unknownParam: "value",
        anotherParam: "another",
      };

      // Act
      validateBusinessDateRequest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockSchema.parse).toHaveBeenCalledWith({
        days: "5",
      });
    });

    it("debe manejar query vacío", () => {
      // Arrange
      mockRequest.query = {};

      // Act
      validateBusinessDateRequest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockSchema.parse).toHaveBeenCalledWith({});
    });

    it("debe manejar query con valores null", () => {
      // Arrange
      mockRequest.query = {
        days: undefined,
        hours: "5",
        date: undefined,
      };

      // Act
      validateBusinessDateRequest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockSchema.parse).toHaveBeenCalledWith({
        hours: "5",
      });
    });
  });

  describe("🔍 Tipado y estructura", () => {
    it("debe agregar validatedParams con tipo correcto", () => {
      // Arrange
      const queryParams = { days: "5", hours: "8" };
      const validatedParams: BusinessDateRequest = { days: 5, hours: 8 };

      mockRequest.query = queryParams;
      mockSchema.parse.mockReturnValue(validatedParams);

      // Act
      validateBusinessDateRequest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockRequest.validatedParams).toBeDefined();
      expect(typeof mockRequest.validatedParams).toBe("object");
      expect(mockRequest.validatedParams).toEqual(validatedParams);
    });

    it("debe mantener referencia al request original", () => {
      // Arrange
      const originalQuery = { days: "5" };
      mockRequest.query = originalQuery;
      mockSchema.parse.mockReturnValue({ days: 5 });

      // Act
      validateBusinessDateRequest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockRequest.query).toBe(originalQuery);
      expect(mockRequest.validatedParams).toBeDefined();
    });

    it("debe llamar next() sin argumentos en caso de éxito", () => {
      // Arrange
      mockRequest.query = { days: "5" };
      mockSchema.parse.mockReturnValue({ days: 5 });

      // Act
      validateBusinessDateRequest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("debe llamar next() con error en caso de fallo", () => {
      // Arrange
      const error = new Error("Validation failed");
      mockRequest.query = { days: "invalid" };
      mockSchema.parse.mockImplementation(() => {
        throw error;
      });

      // Act
      validateBusinessDateRequest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe("🔍 Casos edge", () => {
    it("debe manejar query con strings vacíos", () => {
      // Arrange
      mockRequest.query = {
        days: "",
        hours: "",
        date: "",
      };

      // Act
      validateBusinessDateRequest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockSchema.parse).toHaveBeenCalledWith({
        days: "",
        hours: "",
        date: "",
      });
    });

    it("debe manejar query con arrays", () => {
      // Arrange
      mockRequest.query = {
        days: ["5", "10"],
        hours: "8",
      };

      // Act
      validateBusinessDateRequest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockSchema.parse).toHaveBeenCalledWith({
        days: ["5", "10"],
        hours: "8",
      });
    });

    it("debe manejar query con objetos", () => {
      // Arrange
      mockRequest.query = {
        days: { value: "5" },
        hours: "8",
      };

      // Act
      validateBusinessDateRequest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockSchema.parse).toHaveBeenCalledWith({
        days: { value: "5" },
        hours: "8",
      });
    });
  });
});
