import {
  LogLevel,
  LogEntry,
  debug,
  info,
  warn,
  error,
  apiRequest,
  apiResponse,
  businessDateCalculation,
  holidayService,
  holidayServiceError,
  logger,
} from "utils/logger";

// Mock de chalk
jest.mock("chalk", () => ({
  gray: jest.fn((text: string) => text),
  blue: jest.fn((text: string) => text),
  yellow: jest.fn((text: string) => text),
  red: jest.fn((text: string) => text),
  cyan: jest.fn((text: string) => text),
}));

// Mock de console.log
const mockConsoleLog = jest.spyOn(console, "log").mockImplementation();

describe("Utils - logger.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Resetear NODE_ENV
    delete process.env["NODE_ENV"];
    // Limpiar el mock de console.log
    mockConsoleLog.mockClear();
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
  });

  describe("LogLevel enum", () => {
    it("debería tener los niveles de log correctos", () => {
      // Arrange & Act
      const levels = Object.values(LogLevel);

      // Assert
      expect(levels).toContain("DEBUG");
      expect(levels).toContain("INFO");
      expect(levels).toContain("WARN");
      expect(levels).toContain("ERROR");
      expect(levels).toHaveLength(4);
    });
  });

  describe("LogEntry interface", () => {
    it("debería crear un LogEntry válido", () => {
      // Arrange
      const entry: LogEntry = {
        level: LogLevel.INFO,
        message: "Test message",
        timestamp: new Date(),
        context: "TestContext",
        data: { test: "data" },
      };

      // Act & Assert
      expect(entry.level).toBe(LogLevel.INFO);
      expect(entry.message).toBe("Test message");
      expect(entry.timestamp).toBeInstanceOf(Date);
      expect(entry.context).toBe("TestContext");
      expect(entry.data).toEqual({ test: "data" });
    });
  });

  describe("debug", () => {
    beforeEach(() => {
      process.env["NODE_ENV"] = "development";
    });

    it("debería loggear mensaje de debug en desarrollo", () => {
      // Arrange
      const message = "Debug message";
      const context = "TestContext";
      const data = { test: "data" };

      // Act
      debug(message, context, data);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("Debug message")
      );
    });

    it("debería loggear sin contexto y datos", () => {
      // Arrange
      const message = "Debug message";

      // Act
      debug(message);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("Debug message")
      );
    });

    it("no debería loggear en producción", () => {
      // Arrange
      const originalEnv = process.env["NODE_ENV"];
      process.env["NODE_ENV"] = "production";

      // Re-importar el módulo para que tome el nuevo NODE_ENV
      jest.resetModules();
      const { debug: debugProd } = require("utils/logger");

      const message = "Debug message";

      // Act
      debugProd(message);

      // Assert
      expect(mockConsoleLog).not.toHaveBeenCalled();

      // Cleanup
      process.env["NODE_ENV"] = originalEnv;
      jest.resetModules();
    });
  });

  describe("info", () => {
    beforeEach(() => {
      process.env["NODE_ENV"] = "development";
    });

    it("debería loggear mensaje de info en desarrollo", () => {
      // Arrange
      const message = "Info message";
      const context = "TestContext";

      // Act
      info(message, context);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("Info message")
      );
    });

    it("no debería loggear en producción", () => {
      // Arrange
      const originalEnv = process.env["NODE_ENV"];
      process.env["NODE_ENV"] = "production";

      // Re-importar el módulo para que tome el nuevo NODE_ENV
      jest.resetModules();
      const { info: infoProd } = require("utils/logger");

      const message = "Info message";

      // Act
      infoProd(message);

      // Assert
      expect(mockConsoleLog).not.toHaveBeenCalled();

      // Cleanup
      process.env["NODE_ENV"] = originalEnv;
      jest.resetModules();
    });
  });

  describe("warn", () => {
    it("debería loggear mensaje de warning en cualquier entorno", () => {
      // Arrange
      process.env["NODE_ENV"] = "production";
      const message = "Warning message";

      // Act
      warn(message);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("Warning message")
      );
    });

    it("debería loggear con contexto y datos", () => {
      // Arrange
      const message = "Warning message";
      const context = "TestContext";
      const data = { warning: "data" };

      // Act
      warn(message, context, data);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("Warning message")
      );
    });
  });

  describe("error", () => {
    it("debería loggear mensaje de error en cualquier entorno", () => {
      // Arrange
      process.env["NODE_ENV"] = "production";
      const message = "Error message";

      // Act
      error(message);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("Error message")
      );
    });

    it("debería loggear con contexto y datos", () => {
      // Arrange
      const message = "Error message";
      const context = "TestContext";
      const data = { error: "data" };

      // Act
      error(message, context, data);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("Error message")
      );
    });
  });

  describe("apiRequest", () => {
    beforeEach(() => {
      process.env["NODE_ENV"] = "development";
    });

    it("debería loggear request de API", () => {
      // Arrange
      const method = "GET";
      const url = "/api/test";
      const params = { id: 123 };

      // Act
      apiRequest(method, url, params);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("API Request: GET /api/test")
      );
    });

    it("debería loggear sin parámetros", () => {
      // Arrange
      const method = "POST";
      const url = "/api/test";

      // Act
      apiRequest(method, url);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("API Request: POST /api/test")
      );
    });
  });

  describe("apiResponse", () => {
    it("debería loggear response exitosa como INFO", () => {
      // Arrange
      process.env["NODE_ENV"] = "development";
      const statusCode = 200;
      const responseTime = 150;
      const data = { result: "success" };

      // Act
      apiResponse(statusCode, responseTime, data);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("API Response: 200 (150ms)")
      );
    });

    it("debería loggear response de error como ERROR", () => {
      // Arrange
      process.env["NODE_ENV"] = "production";
      const statusCode = 500;
      const responseTime = 300;
      const data = { error: "Internal server error" };

      // Act
      apiResponse(statusCode, responseTime, data);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("API Response: 500 (300ms)")
      );
    });

    it("debería loggear sin datos", () => {
      // Arrange
      process.env["NODE_ENV"] = "development";
      const statusCode = 404;
      const responseTime = 50;

      // Act
      apiResponse(statusCode, responseTime);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("API Response: 404 (50ms)")
      );
    });
  });

  describe("businessDateCalculation", () => {
    beforeEach(() => {
      process.env["NODE_ENV"] = "development";
    });

    it("debería loggear cálculo de fecha laboral", () => {
      // Arrange
      const startDate = new Date("2024-01-01T08:00:00Z");
      const endDate = new Date("2024-01-05T17:00:00Z");
      const days = 4;
      const hours = 32;

      // Act
      businessDateCalculation(startDate, endDate, days, hours);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("Business Date Calculation:")
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("2024-01-01T08:00:00.000Z")
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("2024-01-05T17:00:00.000Z")
      );
    });
  });

  describe("holidayService", () => {
    beforeEach(() => {
      process.env["NODE_ENV"] = "development";
    });

    it("debería loggear acción del servicio de festivos", () => {
      // Arrange
      const action = "fetch holidays";
      const data = { year: 2024 };

      // Act
      holidayService(action, data);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("Holiday Service: fetch holidays")
      );
    });

    it("debería loggear sin datos", () => {
      // Arrange
      const action = "clear cache";

      // Act
      holidayService(action);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("Holiday Service: clear cache")
      );
    });
  });

  describe("holidayServiceError", () => {
    it("debería loggear error del servicio de festivos", () => {
      // Arrange
      process.env["NODE_ENV"] = "production";
      const errorMessage = "Failed to fetch holidays";
      const data = { status: 500 };

      // Act
      holidayServiceError(errorMessage, data);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining(
          "Holiday Service Error: Failed to fetch holidays"
        )
      );
    });

    it("debería loggear sin datos", () => {
      // Arrange
      process.env["NODE_ENV"] = "production";
      const errorMessage = "Network timeout";

      // Act
      holidayServiceError(errorMessage);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("Holiday Service Error: Network timeout")
      );
    });
  });

  describe("logger object", () => {
    it("debería exportar todas las funciones de logging", () => {
      // Arrange & Act
      const loggerFunctions = Object.keys(logger);

      // Assert
      expect(loggerFunctions).toContain("debug");
      expect(loggerFunctions).toContain("info");
      expect(loggerFunctions).toContain("warn");
      expect(loggerFunctions).toContain("error");
      expect(loggerFunctions).toContain("apiRequest");
      expect(loggerFunctions).toContain("apiResponse");
      expect(loggerFunctions).toContain("businessDateCalculation");
      expect(loggerFunctions).toContain("holidayService");
      expect(loggerFunctions).toContain("holidayServiceError");
    });

    it("debería tener las mismas funciones que las exportaciones individuales", () => {
      // Arrange & Act
      const loggerDebug = logger.debug;
      const loggerInfo = logger.info;
      const loggerWarn = logger.warn;
      const loggerError = logger.error;

      // Assert
      expect(loggerDebug).toBe(debug);
      expect(loggerInfo).toBe(info);
      expect(loggerWarn).toBe(warn);
      expect(loggerError).toBe(error);
    });
  });

  describe("formatting tests", () => {
    beforeEach(() => {
      process.env["NODE_ENV"] = "development";
    });

    it("debería incluir timestamp en el formato", () => {
      // Arrange
      const message = "Test message";

      // Act
      info(message);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringMatching(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}/)
      );
    });

    it("debería incluir nivel de log en el formato", () => {
      // Arrange
      const message = "Test message";

      // Act
      warn(message);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("[WARN]")
      );
    });

    it("debería incluir contexto en el formato", () => {
      // Arrange
      const message = "Test message";
      const context = "TestContext";

      // Act
      info(message, context);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("[TestContext]")
      );
    });

    it("debería incluir datos en formato JSON", () => {
      // Arrange
      const message = "Test message";
      const data = { test: "data", number: 123 };

      // Act
      info(message, undefined, data);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"test": "data"')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"number": 123')
      );
    });
  });

  describe("environment behavior", () => {
    it("debería comportarse diferente en desarrollo vs producción", () => {
      // Arrange
      const message = "Test message";
      const originalEnv = process.env["NODE_ENV"];

      // Act - Desarrollo
      process.env["NODE_ENV"] = "development";
      jest.resetModules();
      const { info: infoDev } = require("utils/logger");
      infoDev(message);
      const devCalls = mockConsoleLog.mock.calls.length;

      // Act - Producción
      process.env["NODE_ENV"] = "production";
      jest.resetModules();
      const { info: infoProd } = require("utils/logger");
      infoProd(message);
      const prodCalls = mockConsoleLog.mock.calls.length;

      // Assert
      expect(devCalls).toBe(1);
      expect(prodCalls).toBe(1); // No cambia porque info no se loggea en producción

      // Cleanup
      process.env["NODE_ENV"] = originalEnv;
      jest.resetModules();
    });

    it("debería loggear warnings y errores en producción", () => {
      // Arrange
      process.env["NODE_ENV"] = "production";
      const warnMessage = "Warning message";
      const errorMessage = "Error message";

      // Act
      warn(warnMessage);
      error(errorMessage);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledTimes(2);
    });
  });
});
