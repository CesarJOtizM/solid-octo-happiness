import axios from "axios";
import {
  getHolidays,
  clearCache,
  getCacheInfo,
  isHoliday,
  getHolidaysForYear,
} from "services/holidayService";
import { HolidayServiceConfig } from "types";

// Mock de axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock de config
jest.mock("config", () => ({
  config: {
    holidayApi: {
      url: "https://api.example.com/holidays",
    },
    cache: {
      ttlMinutes: 60,
    },
  },
}));

describe("holidayService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearCache();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-01T10:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("getHolidays", () => {
    describe("✅ Casos exitosos", () => {
      it("debe obtener días festivos desde la API", async () => {
        // Arrange
        const mockResponse = {
          data: ["2025-01-01", "2025-12-25", "2025-04-10"],
        };
        mockedAxios.get.mockResolvedValue(mockResponse);

        // Act
        const result = await getHolidays();

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual([
            "2025-01-01",
            "2025-12-25",
            "2025-04-10",
          ]);
        }
        expect(mockedAxios.get).toHaveBeenCalledWith(
          "https://api.example.com/holidays",
          expect.objectContaining({
            timeout: 10000,
            headers: {
              Accept: "application/json",
              "User-Agent": "BusinessDates-API/1.0.0",
            },
          })
        );
      });

      it("debe usar configuración personalizada", async () => {
        // Arrange
        const customConfig: HolidayServiceConfig = {
          apiUrl: "https://custom-api.com/holidays",
          cacheTtlMinutes: 120,
          timeoutMs: 15000,
          maxRetries: 5,
        };
        const mockResponse = {
          data: ["2025-01-01"],
        };
        mockedAxios.get.mockResolvedValue(mockResponse);

        // Act
        const result = await getHolidays(customConfig);

        // Assert
        expect(result.success).toBe(true);
        expect(mockedAxios.get).toHaveBeenCalledWith(
          "https://custom-api.com/holidays",
          expect.objectContaining({
            timeout: 15000,
          })
        );
      });

      it("debe usar caché cuando está disponible y válido", async () => {
        // Arrange
        const mockResponse = {
          data: ["2025-01-01", "2025-12-25"],
        };
        mockedAxios.get.mockResolvedValue(mockResponse);

        // Primera llamada para poblar caché
        await getHolidays();

        // Segunda llamada debería usar caché
        mockedAxios.get.mockClear();

        // Act
        const result = await getHolidays();

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(["2025-01-01", "2025-12-25"]);
        }
        expect(mockedAxios.get).not.toHaveBeenCalled();
      });

      it("debe validar formato de respuesta de la API", async () => {
        // Arrange
        const mockResponse = {
          data: ["2025-01-01", "2025-12-25"],
        };
        mockedAxios.get.mockResolvedValue(mockResponse);

        // Act
        const result = await getHolidays();

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(["2025-01-01", "2025-12-25"]);
        }
      });
    });

    describe("❌ Casos de error", () => {
      it("debe manejar error de timeout", async () => {
        // Arrange
        const timeoutError = {
          code: "ECONNABORTED",
          config: { url: "https://api.example.com/holidays" },
        };
        mockedAxios.isAxiosError.mockReturnValue(true);
        mockedAxios.get.mockRejectedValue(timeoutError);

        // Act
        const result = await getHolidays();

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.type).toBe("TIMEOUT_ERROR");
          expect(result.error.message).toBe(
            "Timeout al consultar la API de días festivos"
          );
          expect(result.error.url).toBe("https://api.example.com/holidays");
        }
      });

      it("debe manejar error HTTP", async () => {
        // Arrange
        const httpError = {
          response: {
            status: 404,
            statusText: "Not Found",
          },
          config: { url: "https://api.example.com/holidays" },
        };
        mockedAxios.isAxiosError.mockReturnValue(true);
        mockedAxios.get.mockRejectedValue(httpError);

        // Act
        const result = await getHolidays();

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.type).toBe("NETWORK_ERROR");
          expect(result.error.message).toBe("Error HTTP 404: Not Found");
          expect(result.error.statusCode).toBe(404);
        }
      });

      it("debe manejar error de conexión", async () => {
        // Arrange
        const connectionError = {
          request: {},
          config: { url: "https://api.example.com/holidays" },
        };
        mockedAxios.isAxiosError.mockReturnValue(true);
        mockedAxios.get.mockRejectedValue(connectionError);

        // Act
        const result = await getHolidays();

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.type).toBe("NETWORK_ERROR");
          expect(result.error.message).toBe(
            "No se pudo conectar con la API de días festivos"
          );
        }
      });

      it("debe manejar respuesta inválida (no array)", async () => {
        // Arrange
        const mockResponse = {
          data: "invalid response",
        };
        mockedAxios.get.mockResolvedValue(mockResponse);

        // Act
        const result = await getHolidays();

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.type).toBe("PARSE_ERROR");
          expect(result.error.message).toContain("Error al validar respuesta");
        }
      });

      it("debe manejar respuesta con formato de fecha inválido", async () => {
        // Arrange
        const mockResponse = {
          data: ["2025-01-01", "invalid-date", "2025-12-25"],
        };
        mockedAxios.get.mockResolvedValue(mockResponse);

        // Act
        const result = await getHolidays();

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.type).toBe("UNKNOWN_ERROR");
          expect(result.error.message).toContain("Error inesperado");
        }
      });

      it("debe manejar error desconocido", async () => {
        // Arrange
        const unknownError = new Error("Error desconocido");
        mockedAxios.isAxiosError.mockReturnValue(false);
        mockedAxios.get.mockRejectedValue(unknownError);

        // Act
        const result = await getHolidays();

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.type).toBe("UNKNOWN_ERROR");
          expect(result.error.message).toBe(
            "Error inesperado: Error desconocido"
          );
        }
      });
    });

    describe("🔍 Validación de caché", () => {
      it("debe invalidar caché después del TTL", async () => {
        // Arrange
        const mockResponse = {
          data: ["2025-01-01"],
        };
        mockedAxios.get.mockResolvedValue(mockResponse);

        // Primera llamada
        await getHolidays();

        // Avanzar tiempo más allá del TTL (60 minutos)
        jest.advanceTimersByTime(61 * 60 * 1000);

        // Segunda llamada debería hacer nueva petición
        mockedAxios.get.mockClear();
        mockedAxios.get.mockResolvedValue(mockResponse);

        // Act
        const result = await getHolidays();

        // Assert
        expect(result.success).toBe(true);
        expect(mockedAxios.get).toHaveBeenCalled();
      });

      it("debe mantener caché dentro del TTL", async () => {
        // Arrange
        const mockResponse = {
          data: ["2025-01-01"],
        };
        mockedAxios.get.mockResolvedValue(mockResponse);

        // Primera llamada
        await getHolidays();

        // Avanzar tiempo dentro del TTL (30 minutos)
        jest.advanceTimersByTime(30 * 60 * 1000);

        // Segunda llamada debería usar caché
        mockedAxios.get.mockClear();

        // Act
        const result = await getHolidays();

        // Assert
        expect(result.success).toBe(true);
        expect(mockedAxios.get).not.toHaveBeenCalled();
      });
    });
  });

  describe("clearCache", () => {
    it("debe limpiar el caché correctamente", async () => {
      // Arrange
      const mockResponse = {
        data: ["2025-01-01"],
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      // Poblar caché
      await getHolidays();

      // Act
      clearCache();

      // Assert
      const cacheInfo = getCacheInfo();
      expect(cacheInfo.hasCache).toBe(false);
    });

    it("debe forzar nueva petición después de limpiar caché", async () => {
      // Arrange
      const mockResponse = {
        data: ["2025-01-01"],
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      // Poblar caché
      await getHolidays();

      // Limpiar caché
      clearCache();

      // Segunda llamada debería hacer nueva petición
      mockedAxios.get.mockClear();
      mockedAxios.get.mockResolvedValue(mockResponse);

      // Act
      const result = await getHolidays();

      // Assert
      expect(result.success).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalled();
    });
  });

  describe("getCacheInfo", () => {
    it("debe retornar información correcta cuando no hay caché", () => {
      // Arrange
      clearCache();

      // Act
      const cacheInfo = getCacheInfo();

      // Assert
      expect(cacheInfo.hasCache).toBe(false);
      expect(cacheInfo.isValid).toBe(false);
      expect(cacheInfo.lastUpdated).toBeUndefined();
    });

    it("debe retornar información correcta cuando hay caché válido", async () => {
      // Arrange
      const mockResponse = {
        data: ["2025-01-01"],
      };
      mockedAxios.get.mockResolvedValue(mockResponse);
      const startTime = Date.now();

      // Act
      await getHolidays();
      const cacheInfo = getCacheInfo();

      // Assert
      expect(cacheInfo.hasCache).toBe(true);
      expect(cacheInfo.isValid).toBe(true);
      expect(cacheInfo.lastUpdated).toBeGreaterThanOrEqual(startTime);
    });

    it("debe retornar información correcta cuando hay caché expirado", async () => {
      // Arrange
      const mockResponse = {
        data: ["2025-01-01"],
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      // Poblar caché
      await getHolidays();

      // Avanzar tiempo más allá del TTL
      jest.advanceTimersByTime(61 * 60 * 1000);

      // Act
      const cacheInfo = getCacheInfo();

      // Assert
      expect(cacheInfo.hasCache).toBe(true);
      expect(cacheInfo.isValid).toBe(false);
      expect(cacheInfo.lastUpdated).toBeDefined();
    });
  });

  describe("isHoliday", () => {
    it("debe retornar true para día festivo", async () => {
      // Arrange
      const mockResponse = {
        data: ["2025-01-01", "2025-12-25"],
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      // Act
      const result = await isHoliday("2025-01-01");

      // Assert
      expect(result).toBe(true);
    });

    it("debe retornar false para día no festivo", async () => {
      // Arrange
      const mockResponse = {
        data: ["2025-01-01", "2025-12-25"],
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      // Act
      const result = await isHoliday("2025-01-02");

      // Assert
      expect(result).toBe(false);
    });

    it("debe lanzar error cuando falla el servicio", async () => {
      // Arrange
      const error = {
        response: {
          status: 500,
          statusText: "Internal Server Error",
        },
        config: { url: "https://api.example.com/holidays" },
      };
      mockedAxios.isAxiosError.mockReturnValue(true);
      mockedAxios.get.mockRejectedValue(error);

      // Act & Assert
      await expect(isHoliday("2025-01-01")).rejects.toThrow(
        "Error al obtener días festivos"
      );
    });

    it("debe usar configuración personalizada", async () => {
      // Arrange
      const customConfig: HolidayServiceConfig = {
        apiUrl: "https://custom-api.com/holidays",
        cacheTtlMinutes: 120,
        timeoutMs: 15000,
        maxRetries: 5,
      };
      const mockResponse = {
        data: ["2025-01-01"],
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      // Act
      const result = await isHoliday("2025-01-01", customConfig);

      // Assert
      expect(result).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://custom-api.com/holidays",
        expect.objectContaining({
          timeout: 15000,
        })
      );
    });
  });

  describe("getHolidaysForYear", () => {
    it("debe retornar días festivos para año específico", async () => {
      // Arrange
      const mockResponse = {
        data: [
          "2025-01-01",
          "2025-04-10",
          "2025-12-25",
          "2024-01-01",
          "2026-01-01",
        ],
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      // Act
      const result = await getHolidaysForYear(2025);

      // Assert
      expect(result).toEqual(["2025-01-01", "2025-04-10", "2025-12-25"]);
    });

    it("debe retornar array vacío cuando no hay días festivos para el año", async () => {
      // Arrange
      const mockResponse = {
        data: ["2024-01-01", "2026-01-01"],
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      // Act
      const result = await getHolidaysForYear(2025);

      // Assert
      expect(result).toEqual([]);
    });

    it("debe lanzar error cuando falla el servicio", async () => {
      // Arrange
      const error = {
        response: {
          status: 500,
          statusText: "Internal Server Error",
        },
        config: { url: "https://api.example.com/holidays" },
      };
      mockedAxios.isAxiosError.mockReturnValue(true);
      mockedAxios.get.mockRejectedValue(error);

      // Act & Assert
      await expect(getHolidaysForYear(2025)).rejects.toThrow(
        "Error al obtener días festivos"
      );
    });

    it("debe usar configuración personalizada", async () => {
      // Arrange
      const customConfig: HolidayServiceConfig = {
        apiUrl: "https://custom-api.com/holidays",
        cacheTtlMinutes: 120,
        timeoutMs: 15000,
        maxRetries: 5,
      };
      const mockResponse = {
        data: ["2025-01-01"],
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      // Act
      const result = await getHolidaysForYear(2025, customConfig);

      // Assert
      expect(result).toEqual(["2025-01-01"]);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://custom-api.com/holidays",
        expect.objectContaining({
          timeout: 15000,
        })
      );
    });
  });

  describe("🔍 Validación de integridad", () => {
    it("debe mantener consistencia en tipos de respuesta", async () => {
      // Arrange
      const mockResponse = {
        data: ["2025-01-01"],
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      // Act
      const result = await getHolidays();

      // Assert
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data.every(date => typeof date === "string")).toBe(true);
        expect(
          result.data.every(date => /^\d{4}-\d{2}-\d{2}$/.test(date))
        ).toBe(true);
      } else {
        expect(typeof result.error.type).toBe("string");
        expect(typeof result.error.message).toBe("string");
      }
    });

    it("debe manejar múltiples llamadas concurrentes", async () => {
      // Arrange
      const mockResponse = {
        data: ["2025-01-01"],
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      // Act
      const promises = Array.from({ length: 5 }, () => getHolidays());
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(["2025-01-01"]);
        }
      });
      // Debería hacer múltiples peticiones HTTP en llamadas concurrentes
      expect(mockedAxios.get).toHaveBeenCalledTimes(5);
    });

    it("debe manejar configuración por defecto correctamente", async () => {
      // Arrange
      const mockResponse = {
        data: ["2025-01-01"],
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      // Act
      const result = await getHolidays();

      // Assert
      expect(result.success).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://api.example.com/holidays",
        expect.objectContaining({
          timeout: 10000,
          headers: {
            Accept: "application/json",
            "User-Agent": "BusinessDates-API/1.0.0",
          },
        })
      );
    });

    it("debe validar formato de fechas en respuesta", async () => {
      // Arrange
      const mockResponse = {
        data: ["2025-01-01", "2025-12-25"],
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      // Act
      const result = await getHolidays();

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        result.data.forEach(date => {
          expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });
      }
    });
  });
});
