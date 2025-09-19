import { validateEnvironment } from "middleware/envValidation";
import { logger } from "utils";

// Mock del logger
jest.mock("utils", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock del módulo config
jest.mock("config", () => ({
  config: {
    server: {
      nodeEnv: "test",
      port: 3000,
    },
    timezone: {
      default: "America/Mexico_City",
    },
    workSchedule: {
      startHour: 9,
      endHour: 18,
      lunchStartHour: 13,
      lunchEndHour: 14,
    },
    holidayApi: {
      url: "https://api.example.com/holidays",
    },
    cache: {
      ttlMinutes: 60,
    },
  },
}));

describe("validateEnvironment", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Resetear el mock de process.exit
    jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("✅ Casos exitosos", () => {
    it("debe validar las variables de entorno correctamente", () => {
      // Arrange
      const mockConfig = require("config").config;

      // Act
      validateEnvironment();

      // Assert
      expect(logger.info).toHaveBeenCalledWith(
        "✅ Variables de entorno validadas correctamente",
        "Environment"
      );
      expect(logger.info).toHaveBeenCalledWith(
        `🌍 Entorno: ${mockConfig.server.nodeEnv}`,
        "Environment"
      );
      expect(logger.info).toHaveBeenCalledWith(
        `🚀 Puerto: ${mockConfig.server.port}`,
        "Environment"
      );
      expect(logger.info).toHaveBeenCalledWith(
        `⏰ Zona horaria: ${mockConfig.timezone.default}`,
        "Environment"
      );
      expect(logger.info).toHaveBeenCalledWith(
        `🏢 Horario laboral: ${mockConfig.workSchedule.startHour}:00 - ${mockConfig.workSchedule.endHour}:00`,
        "Environment"
      );
      expect(logger.info).toHaveBeenCalledWith(
        `🍽️ Horario de almuerzo: ${mockConfig.workSchedule.lunchStartHour}:00 - ${mockConfig.workSchedule.lunchEndHour}:00`,
        "Environment"
      );
      expect(logger.info).toHaveBeenCalledWith(
        `📡 API de días festivos: ${mockConfig.holidayApi.url}`,
        "Environment"
      );
      expect(logger.info).toHaveBeenCalledWith(
        `💾 TTL de caché: ${mockConfig.cache.ttlMinutes} minutos`,
        "Environment"
      );
    });

    it("debe mostrar información completa de configuración", () => {
      // Arrange
      const expectedLogs = [
        "✅ Variables de entorno validadas correctamente",
        "🌍 Entorno: test",
        "🚀 Puerto: 3000",
        "⏰ Zona horaria: America/Mexico_City",
        "🏢 Horario laboral: 9:00 - 18:00",
        "🍽️ Horario de almuerzo: 13:00 - 14:00",
        "📡 API de días festivos: https://api.example.com/holidays",
        "💾 TTL de caché: 60 minutos",
      ];

      // Act
      validateEnvironment();

      // Assert
      expectedLogs.forEach((expectedLog, index) => {
        expect(logger.info).toHaveBeenNthCalledWith(
          index + 1,
          expectedLog,
          "Environment"
        );
      });
    });
  });

  describe("🔍 Validación de estructura de logs", () => {
    it("debe usar el formato correcto para todos los logs", () => {
      // Arrange
      const expectedLogFormat = /^[✅🌍🚀⏰🏢🍽️📡💾].*/;

      // Act
      validateEnvironment();

      // Assert
      const infoCalls = (logger.info as jest.Mock).mock.calls;
      infoCalls.forEach(call => {
        expect(call[0]).toMatch(expectedLogFormat);
        expect(call[1]).toBe("Environment");
      });
    });

    it("debe incluir todos los componentes de configuración en los logs", () => {
      // Arrange
      const requiredComponents = [
        "Entorno",
        "Puerto",
        "Zona horaria",
        "Horario laboral",
        "Horario de almuerzo",
        "API de días festivos",
        "TTL de caché",
      ];

      // Act
      validateEnvironment();

      // Assert
      const infoCalls = (logger.info as jest.Mock).mock.calls;
      const logMessages = infoCalls.map(call => call[0]);

      requiredComponents.forEach(component => {
        expect(logMessages.some(message => message.includes(component))).toBe(
          true
        );
      });
    });
  });
});
