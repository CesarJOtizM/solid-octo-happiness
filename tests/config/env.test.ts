import { env, validateEnv, envSchema } from "config";

// Mock de dotenv
jest.mock("dotenv", () => ({
  config: jest.fn(),
}));

describe("Config - env.ts", () => {
  describe("envSchema", () => {
    describe("PORT", () => {
      it("debería usar el valor por defecto 3000 cuando no se proporciona", () => {
        // Arrange
        const envVars = {};

        // Act
        const result = envSchema.parse(envVars);

        // Assert
        expect(result.PORT).toBe(3000);
      });

      it("debería convertir string a número correctamente", () => {
        // Arrange
        const envVars = { PORT: "8080" };

        // Act
        const result = envSchema.parse(envVars);

        // Assert
        expect(result.PORT).toBe(8080);
      });

      it("debería fallar con puerto inválido (fuera del rango)", () => {
        // Arrange
        const envVars = { PORT: "70000" };

        // Act & Assert
        expect(() => envSchema.parse(envVars)).toThrow(
          "PORT debe ser un número entre 1 y 65535"
        );
      });

      it("debería fallar con puerto negativo", () => {
        // Arrange
        const envVars = { PORT: "-1" };

        // Act & Assert
        expect(() => envSchema.parse(envVars)).toThrow(
          "PORT debe ser un número entre 1 y 65535"
        );
      });
    });

    describe("HOLIDAY_API_URL", () => {
      it("debería usar la URL por defecto cuando no se proporciona", () => {
        // Arrange
        const envVars = {};

        // Act
        const result = envSchema.parse(envVars);

        // Assert
        expect(result.HOLIDAY_API_URL).toBe(
          "https://content.capta.co/Recruitment/WorkingDays.json"
        );
      });

      it("debería aceptar una URL válida", () => {
        // Arrange
        const envVars = { HOLIDAY_API_URL: "https://api.example.com/holidays" };

        // Act
        const result = envSchema.parse(envVars);

        // Assert
        expect(result.HOLIDAY_API_URL).toBe("https://api.example.com/holidays");
      });

      it("debería fallar con URL inválida", () => {
        // Arrange
        const envVars = { HOLIDAY_API_URL: "not-a-url" };

        // Act & Assert
        expect(() => envSchema.parse(envVars)).toThrow(
          "HOLIDAY_API_URL debe ser una URL válida"
        );
      });
    });

    describe("TIMEZONE", () => {
      it("debería usar la zona horaria por defecto cuando no se proporciona", () => {
        // Arrange
        const envVars = {};

        // Act
        const result = envSchema.parse(envVars);

        // Assert
        expect(result.TIMEZONE).toBe("America/Bogota");
      });

      it("debería aceptar una zona horaria válida", () => {
        // Arrange
        const envVars = { TIMEZONE: "America/New_York" };

        // Act
        const result = envSchema.parse(envVars);

        // Assert
        expect(result.TIMEZONE).toBe("America/New_York");
      });

      it("debería fallar con zona horaria inválida", () => {
        // Arrange
        const envVars = { TIMEZONE: "Invalid/Timezone" };

        // Act & Assert
        expect(() => envSchema.parse(envVars)).toThrow(
          "TIMEZONE debe ser una zona horaria válida"
        );
      });
    });

    describe("WORK_START_HOUR", () => {
      it("debería usar el valor por defecto 8 cuando no se proporciona", () => {
        // Arrange
        const envVars = {};

        // Act
        const result = envSchema.parse(envVars);

        // Assert
        expect(result.WORK_START_HOUR).toBe(8);
      });

      it("debería convertir string a número correctamente", () => {
        // Arrange
        const envVars = { WORK_START_HOUR: "9" };

        // Act
        const result = envSchema.parse(envVars);

        // Assert
        expect(result.WORK_START_HOUR).toBe(9);
      });

      it("debería fallar con hora fuera del rango (mayor a 23)", () => {
        // Arrange
        const envVars = { WORK_START_HOUR: "24" };

        // Act & Assert
        expect(() => envSchema.parse(envVars)).toThrow(
          "WORK_START_HOUR debe ser un número entre 0 y 23"
        );
      });

      it("debería fallar con hora negativa", () => {
        // Arrange
        const envVars = { WORK_START_HOUR: "-1" };

        // Act & Assert
        expect(() => envSchema.parse(envVars)).toThrow(
          "WORK_START_HOUR debe ser un número entre 0 y 23"
        );
      });
    });

    describe("WORK_END_HOUR", () => {
      it("debería usar el valor por defecto 17 cuando no se proporciona", () => {
        // Arrange
        const envVars = {};

        // Act
        const result = envSchema.parse(envVars);

        // Assert
        expect(result.WORK_END_HOUR).toBe(17);
      });

      it("debería convertir string a número correctamente", () => {
        // Arrange
        const envVars = { WORK_END_HOUR: "18" };

        // Act
        const result = envSchema.parse(envVars);

        // Assert
        expect(result.WORK_END_HOUR).toBe(18);
      });

      it("debería fallar con hora fuera del rango", () => {
        // Arrange
        const envVars = { WORK_END_HOUR: "25" };

        // Act & Assert
        expect(() => envSchema.parse(envVars)).toThrow(
          "WORK_END_HOUR debe ser un número entre 0 y 23"
        );
      });
    });

    describe("LUNCH_START_HOUR", () => {
      it("debería usar el valor por defecto 12 cuando no se proporciona", () => {
        // Arrange
        const envVars = {};

        // Act
        const result = envSchema.parse(envVars);

        // Assert
        expect(result.LUNCH_START_HOUR).toBe(12);
      });

      it("debería convertir string a número correctamente", () => {
        // Arrange
        const envVars = { LUNCH_START_HOUR: "13" };

        // Act
        const result = envSchema.parse(envVars);

        // Assert
        expect(result.LUNCH_START_HOUR).toBe(13);
      });

      it("debería fallar con hora fuera del rango", () => {
        // Arrange
        const envVars = { LUNCH_START_HOUR: "24" };

        // Act & Assert
        expect(() => envSchema.parse(envVars)).toThrow(
          "LUNCH_START_HOUR debe ser un número entre 0 y 23"
        );
      });
    });

    describe("LUNCH_END_HOUR", () => {
      it("debería usar el valor por defecto 13 cuando no se proporciona", () => {
        // Arrange
        const envVars = {};

        // Act
        const result = envSchema.parse(envVars);

        // Assert
        expect(result.LUNCH_END_HOUR).toBe(13);
      });

      it("debería convertir string a número correctamente", () => {
        // Arrange
        const envVars = { LUNCH_END_HOUR: "14" };

        // Act
        const result = envSchema.parse(envVars);

        // Assert
        expect(result.LUNCH_END_HOUR).toBe(14);
      });

      it("debería fallar con hora fuera del rango", () => {
        // Arrange
        const envVars = { LUNCH_END_HOUR: "25" };

        // Act & Assert
        expect(() => envSchema.parse(envVars)).toThrow(
          "LUNCH_END_HOUR debe ser un número entre 0 y 23"
        );
      });
    });

    describe("CACHE_TTL_MINUTES", () => {
      it("debería usar el valor por defecto 60 cuando no se proporciona", () => {
        // Arrange
        const envVars = {};

        // Act
        const result = envSchema.parse(envVars);

        // Assert
        expect(result.CACHE_TTL_MINUTES).toBe(60);
      });

      it("debería convertir string a número correctamente", () => {
        // Arrange
        const envVars = { CACHE_TTL_MINUTES: "120" };

        // Act
        const result = envSchema.parse(envVars);

        // Assert
        expect(result.CACHE_TTL_MINUTES).toBe(120);
      });

      it("debería fallar con valor negativo", () => {
        // Arrange
        const envVars = { CACHE_TTL_MINUTES: "-10" };

        // Act & Assert
        expect(() => envSchema.parse(envVars)).toThrow(
          "CACHE_TTL_MINUTES debe ser un número positivo"
        );
      });

      it("debería fallar con valor cero", () => {
        // Arrange
        const envVars = { CACHE_TTL_MINUTES: "0" };

        // Act & Assert
        expect(() => envSchema.parse(envVars)).toThrow(
          "CACHE_TTL_MINUTES debe ser un número positivo"
        );
      });
    });

    describe("NODE_ENV", () => {
      it("debería usar el valor por defecto 'development' cuando no se proporciona", () => {
        // Arrange
        const envVars = {};

        // Act
        const result = envSchema.parse(envVars);

        // Assert
        expect(result.NODE_ENV).toBe("development");
      });

      it("debería aceptar 'production'", () => {
        // Arrange
        const envVars = { NODE_ENV: "production" };

        // Act
        const result = envSchema.parse(envVars);

        // Assert
        expect(result.NODE_ENV).toBe("production");
      });

      it("debería aceptar 'test'", () => {
        // Arrange
        const envVars = { NODE_ENV: "test" };

        // Act
        const result = envSchema.parse(envVars);

        // Assert
        expect(result.NODE_ENV).toBe("test");
      });

      it("debería fallar con valor inválido", () => {
        // Arrange
        const envVars = { NODE_ENV: "staging" };

        // Act & Assert
        expect(() => envSchema.parse(envVars)).toThrow();
      });
    });
  });

  describe("validateEnv", () => {
    beforeEach(() => {
      // Limpiar process.env antes de cada test
      Object.keys(process.env).forEach(key => {
        if (
          key.startsWith("PORT") ||
          key.startsWith("HOLIDAY") ||
          key.startsWith("TIMEZONE") ||
          key.startsWith("WORK_") ||
          key.startsWith("LUNCH_") ||
          key.startsWith("CACHE_") ||
          key.startsWith("NODE_")
        ) {
          delete process.env[key];
        }
      });
    });

    it("debería validar configuración válida", () => {
      // Arrange
      process.env["PORT"] = "3000";
      process.env["HOLIDAY_API_URL"] = "https://api.example.com/holidays";
      process.env["TIMEZONE"] = "America/Bogota";
      process.env["WORK_START_HOUR"] = "8";
      process.env["WORK_END_HOUR"] = "17";
      process.env["LUNCH_START_HOUR"] = "12";
      process.env["LUNCH_END_HOUR"] = "13";
      process.env["CACHE_TTL_MINUTES"] = "60";
      process.env["NODE_ENV"] = "development";

      // Act
      const result = validateEnv();

      // Assert
      expect(result).toEqual({
        PORT: 3000,
        HOLIDAY_API_URL: "https://api.example.com/holidays",
        TIMEZONE: "America/Bogota",
        WORK_START_HOUR: 8,
        WORK_END_HOUR: 17,
        LUNCH_START_HOUR: 12,
        LUNCH_END_HOUR: 13,
        CACHE_TTL_MINUTES: 60,
        NODE_ENV: "development",
      });
    });

    it("debería fallar cuando WORK_START_HOUR >= WORK_END_HOUR", () => {
      // Arrange
      process.env["WORK_START_HOUR"] = "17";
      process.env["WORK_END_HOUR"] = "17";

      // Act & Assert
      expect(() => validateEnv()).toThrow(
        "WORK_START_HOUR debe ser menor que WORK_END_HOUR"
      );
    });

    it("debería fallar cuando LUNCH_START_HOUR >= LUNCH_END_HOUR", () => {
      // Arrange
      process.env["LUNCH_START_HOUR"] = "13";
      process.env["LUNCH_END_HOUR"] = "13";

      // Act & Assert
      expect(() => validateEnv()).toThrow(
        "LUNCH_START_HOUR debe ser menor que LUNCH_END_HOUR"
      );
    });

    it("debería fallar cuando el horario de almuerzo está fuera del horario laboral (inicio)", () => {
      // Arrange
      process.env["WORK_START_HOUR"] = "9";
      process.env["WORK_END_HOUR"] = "17";
      process.env["LUNCH_START_HOUR"] = "8"; // Antes del inicio laboral

      // Act & Assert
      expect(() => validateEnv()).toThrow(
        "El horario de almuerzo debe estar dentro del horario laboral"
      );
    });

    it("debería fallar cuando el horario de almuerzo está fuera del horario laboral (fin)", () => {
      // Arrange
      process.env["WORK_START_HOUR"] = "8";
      process.env["WORK_END_HOUR"] = "17";
      process.env["LUNCH_END_HOUR"] = "18"; // Después del fin laboral

      // Act & Assert
      expect(() => validateEnv()).toThrow(
        "El horario de almuerzo debe estar dentro del horario laboral"
      );
    });

    it("debería manejar errores de Zod correctamente", () => {
      // Arrange
      process.env["PORT"] = "invalid";

      // Act & Assert
      expect(() => validateEnv()).toThrow(
        "Error de validación de variables de entorno"
      );
    });

    it("debería propagar errores que no son de Zod", () => {
      // Arrange
      const originalParse = envSchema.parse;
      envSchema.parse = jest.fn().mockImplementation(() => {
        throw new Error("Error personalizado");
      });

      // Act & Assert
      expect(() => validateEnv()).toThrow("Error personalizado");

      // Cleanup
      envSchema.parse = originalParse;
    });
  });

  describe("export env", () => {
    it("debería exportar la configuración validada", () => {
      // Arrange & Act
      // El objeto env ya está exportado y validado

      // Assert
      expect(env).toBeDefined();
      expect(typeof env.PORT).toBe("number");
      expect(typeof env.HOLIDAY_API_URL).toBe("string");
      expect(typeof env.TIMEZONE).toBe("string");
      expect(typeof env.WORK_START_HOUR).toBe("number");
      expect(typeof env.WORK_END_HOUR).toBe("number");
      expect(typeof env.LUNCH_START_HOUR).toBe("number");
      expect(typeof env.LUNCH_END_HOUR).toBe("number");
      expect(typeof env.CACHE_TTL_MINUTES).toBe("number");
      expect(typeof env.NODE_ENV).toBe("string");
    });
  });
});
