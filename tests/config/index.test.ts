import { config, type Config, type EnvConfig } from "config";

// Mock del módulo env
jest.mock("config/env", () => ({
  env: {
    PORT: 3000,
    NODE_ENV: "development",
    HOLIDAY_API_URL: "https://content.capta.co/Recruitment/WorkingDays.json",
    TIMEZONE: "America/Bogota",
    WORK_START_HOUR: 8,
    WORK_END_HOUR: 17,
    LUNCH_START_HOUR: 12,
    LUNCH_END_HOUR: 13,
    CACHE_TTL_MINUTES: 60,
  },
}));

describe("Config - index.ts", () => {
  describe("config object", () => {
    it("debería tener la estructura correcta de configuración", () => {
      // Arrange & Act
      const configObject = config;

      // Assert
      expect(configObject).toHaveProperty("server");
      expect(configObject).toHaveProperty("holidayApi");
      expect(configObject).toHaveProperty("timezone");
      expect(configObject).toHaveProperty("workSchedule");
      expect(configObject).toHaveProperty("cache");
    });

    describe("server configuration", () => {
      it("debería mapear correctamente PORT y NODE_ENV", () => {
        // Arrange & Act
        const serverConfig = config.server;

        // Assert
        expect(serverConfig).toEqual({
          port: 3000,
          nodeEnv: "development",
        });
      });

      it("debería tener port como número", () => {
        // Arrange & Act
        const port = config.server.port;

        // Assert
        expect(typeof port).toBe("number");
        expect(port).toBe(3000);
      });

      it("debería tener nodeEnv como string", () => {
        // Arrange & Act
        const nodeEnv = config.server.nodeEnv;

        // Assert
        expect(typeof nodeEnv).toBe("string");
        expect(nodeEnv).toBe("development");
      });
    });

    describe("holidayApi configuration", () => {
      it("debería mapear correctamente HOLIDAY_API_URL", () => {
        // Arrange & Act
        const holidayApiConfig = config.holidayApi;

        // Assert
        expect(holidayApiConfig).toEqual({
          url: "https://content.capta.co/Recruitment/WorkingDays.json",
        });
      });

      it("debería tener url como string", () => {
        // Arrange & Act
        const url = config.holidayApi.url;

        // Assert
        expect(typeof url).toBe("string");
        expect(url).toBe(
          "https://content.capta.co/Recruitment/WorkingDays.json"
        );
      });
    });

    describe("timezone configuration", () => {
      it("debería mapear correctamente TIMEZONE", () => {
        // Arrange & Act
        const timezoneConfig = config.timezone;

        // Assert
        expect(timezoneConfig).toEqual({
          default: "America/Bogota",
        });
      });

      it("debería tener default como string", () => {
        // Arrange & Act
        const defaultTimezone = config.timezone.default;

        // Assert
        expect(typeof defaultTimezone).toBe("string");
        expect(defaultTimezone).toBe("America/Bogota");
      });
    });

    describe("workSchedule configuration", () => {
      it("debería mapear correctamente todas las horas de trabajo", () => {
        // Arrange & Act
        const workScheduleConfig = config.workSchedule;

        // Assert
        expect(workScheduleConfig).toEqual({
          startHour: 8,
          endHour: 17,
          lunchStartHour: 12,
          lunchEndHour: 13,
        });
      });

      it("debería tener startHour como número", () => {
        // Arrange & Act
        const startHour = config.workSchedule.startHour;

        // Assert
        expect(typeof startHour).toBe("number");
        expect(startHour).toBe(8);
      });

      it("debería tener endHour como número", () => {
        // Arrange & Act
        const endHour = config.workSchedule.endHour;

        // Assert
        expect(typeof endHour).toBe("number");
        expect(endHour).toBe(17);
      });

      it("debería tener lunchStartHour como número", () => {
        // Arrange & Act
        const lunchStartHour = config.workSchedule.lunchStartHour;

        // Assert
        expect(typeof lunchStartHour).toBe("number");
        expect(lunchStartHour).toBe(12);
      });

      it("debería tener lunchEndHour como número", () => {
        // Arrange & Act
        const lunchEndHour = config.workSchedule.lunchEndHour;

        // Assert
        expect(typeof lunchEndHour).toBe("number");
        expect(lunchEndHour).toBe(13);
      });
    });

    describe("cache configuration", () => {
      it("debería mapear correctamente CACHE_TTL_MINUTES", () => {
        // Arrange & Act
        const cacheConfig = config.cache;

        // Assert
        expect(cacheConfig).toEqual({
          ttlMinutes: 60,
        });
      });

      it("debería tener ttlMinutes como número", () => {
        // Arrange & Act
        const ttlMinutes = config.cache.ttlMinutes;

        // Assert
        expect(typeof ttlMinutes).toBe("number");
        expect(ttlMinutes).toBe(60);
      });
    });

    it("debería tener tipos correctos (as const)", () => {
      // Arrange & Act
      const configObject = config;

      // Assert - as const hace que los tipos sean literales, no que el objeto sea inmutable
      expect(typeof configObject.server.port).toBe("number");
      expect(typeof configObject.server.nodeEnv).toBe("string");
      expect(typeof configObject.holidayApi.url).toBe("string");
      expect(typeof configObject.timezone.default).toBe("string");
      expect(typeof configObject.workSchedule.startHour).toBe("number");
      expect(typeof configObject.cache.ttlMinutes).toBe("number");
    });
  });

  describe("type exports", () => {
    it("debería exportar el tipo Config", () => {
      // Arrange
      const testConfig: Config = {
        server: {
          port: 3000,
          nodeEnv: "development",
        },
        holidayApi: {
          url: "https://example.com",
        },
        timezone: {
          default: "America/Bogota",
        },
        workSchedule: {
          startHour: 8,
          endHour: 17,
          lunchStartHour: 12,
          lunchEndHour: 13,
        },
        cache: {
          ttlMinutes: 60,
        },
      };

      // Act & Assert
      expect(testConfig).toBeDefined();
      expect(typeof testConfig.server.port).toBe("number");
      expect(typeof testConfig.holidayApi.url).toBe("string");
    });

    it("debería exportar el tipo EnvConfig", () => {
      // Arrange
      const testEnvConfig: EnvConfig = {
        PORT: 3000,
        NODE_ENV: "development",
        HOLIDAY_API_URL: "https://example.com",
        TIMEZONE: "America/Bogota",
        WORK_START_HOUR: 8,
        WORK_END_HOUR: 17,
        LUNCH_START_HOUR: 12,
        LUNCH_END_HOUR: 13,
        CACHE_TTL_MINUTES: 60,
      };

      // Act & Assert
      expect(testEnvConfig).toBeDefined();
      expect(typeof testEnvConfig.PORT).toBe("number");
      expect(typeof testEnvConfig.NODE_ENV).toBe("string");
    });
  });

  describe("integration with env module", () => {
    it("debería usar los valores del módulo env correctamente", () => {
      // Arrange
      const expectedConfig = {
        server: {
          port: 3000,
          nodeEnv: "development",
        },
        holidayApi: {
          url: "https://content.capta.co/Recruitment/WorkingDays.json",
        },
        timezone: {
          default: "America/Bogota",
        },
        workSchedule: {
          startHour: 8,
          endHour: 17,
          lunchStartHour: 12,
          lunchEndHour: 13,
        },
        cache: {
          ttlMinutes: 60,
        },
      };

      // Act
      const actualConfig = config;

      // Assert
      expect(actualConfig).toEqual(expectedConfig);
    });

    it("debería mantener la referencia a los valores originales de env", () => {
      // Arrange & Act
      const serverPort = config.server.port;
      const workStartHour = config.workSchedule.startHour;
      const cacheTtl = config.cache.ttlMinutes;

      // Assert
      expect(serverPort).toBe(3000);
      expect(workStartHour).toBe(8);
      expect(cacheTtl).toBe(60);
    });
  });
});
