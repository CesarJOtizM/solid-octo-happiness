import {
  calculateBusinessDate,
  formatBusinessDateResponse,
  formatBusinessDateError,
} from "../../src/services/businessDateService";
import { BusinessDateRequest } from "types/request";
import { DateCalculationResult } from "types";

// Mock de utils/timezoneUtils
jest.mock("utils/timezoneUtils", () => ({
  utcToColombia: jest.fn((date: Date) => date),
  colombiaToUtc: jest.fn((date: Date) => date),
  getCurrentColombiaTime: jest.fn(() => new Date("2025-01-01T10:00:00Z")),
  toIsoUtcString: jest.fn(() => "2025-01-01T10:00:00Z"),
}));

// Mock de utils/dateUtils
jest.mock("utils/dateUtils", () => ({
  adjustToPreviousWorkingTime: jest.fn((date: Date) => date),
  getNextWorkingDay: jest.fn((date: Date) => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
  }),
  getBusinessDayInfo: jest.fn(() => ({ isWorkingDay: true })),
  WORKING_HOURS: {
    start: 9,
    end: 18,
    lunchStart: 13,
    lunchEnd: 14,
  },
}));

// Mock de services/holidayService
jest.mock("../../src/services/holidayService", () => ({
  getHolidays: jest.fn(() =>
    Promise.resolve({
      success: true,
      data: ["2025-01-01", "2025-12-25"],
    })
  ),
}));

// Mock de date-fns
jest.mock("date-fns", () => ({
  addMinutes: jest.fn((date: Date, minutes: number) => {
    const result = new Date(date);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
  }),
}));

describe("businessDateService (Simplified)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("calculateBusinessDate", () => {
    it("debe calcular fecha de negocio con solo días", async () => {
      // Arrange
      const request: BusinessDateRequest = { days: 5 };

      // Act
      const result = await calculateBusinessDate(request);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.addedDays).toBe(5);
        expect(result.addedHours).toBe(0);
      }
    });

    it("debe calcular fecha de negocio con solo horas", async () => {
      // Arrange
      const request: BusinessDateRequest = { hours: 8 };

      // Act
      const result = await calculateBusinessDate(request);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.addedDays).toBe(0);
        expect(result.addedHours).toBe(8);
      }
    });

    it("debe calcular fecha de negocio con días y horas", async () => {
      // Arrange
      const request: BusinessDateRequest = { days: 3, hours: 4 };

      // Act
      const result = await calculateBusinessDate(request);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.addedDays).toBe(3);
        expect(result.addedHours).toBe(4);
      }
    });

    it("debe manejar error del servicio de días festivos", async () => {
      // Arrange
      const mockGetHolidays =
        require("../../src/services/holidayService").getHolidays;
      mockGetHolidays.mockResolvedValueOnce({
        success: false,
        error: {
          type: "NETWORK_ERROR",
          message: "No se pudo conectar con la API",
        },
      });

      const request: BusinessDateRequest = { days: 5 };

      // Act
      const result = await calculateBusinessDate(request);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("HolidayServiceError");
        expect(result.message).toContain("Error al obtener días festivos");
      }
    });
  });

  describe("formatBusinessDateResponse", () => {
    it("debe formatear respuesta exitosa correctamente", () => {
      // Arrange
      const result: DateCalculationResult = {
        success: true,
        resultDate: new Date("2025-01-06T10:00:00Z"),
        originalDate: new Date("2025-01-01T10:00:00Z"),
        addedDays: 5,
        addedHours: 0,
      };

      // Act
      const formatted = formatBusinessDateResponse(result);

      // Assert
      expect(formatted).toEqual({
        date: "2025-01-01T10:00:00Z",
      });
    });
  });

  describe("formatBusinessDateError", () => {
    it("debe formatear error correctamente", () => {
      // Arrange
      const error = {
        success: false as const,
        error: "HolidayServiceError",
        message: "Error al obtener días festivos",
      };

      // Act
      const formatted = formatBusinessDateError(error);

      // Assert
      expect(formatted).toEqual({
        error: "HolidayServiceError",
        message: "Error al obtener días festivos",
      });
    });
  });
});
