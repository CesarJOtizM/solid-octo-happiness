import {
  WORKING_HOURS,
  WORKING_DAYS,
  isWorkingDay,
  isWithinWorkingHours,
  isLunchTime,
  getBusinessDayInfo,
  adjustToPreviousWorkingTime,
  getNextWorkingDay,
  calculateWorkingMinutes,
} from "utils/dateUtils";
import { utcToColombia, colombiaToUtc } from "utils/timezoneUtils";

// Mock de timezoneUtils
jest.mock("utils/timezoneUtils", () => ({
  utcToColombia: jest.fn((date: Date) => {
    // Simular conversión UTC a Colombia (restar 5 horas)
    const colombiaDate = new Date(date);
    colombiaDate.setHours(date.getHours() - 5);
    return colombiaDate;
  }),
  colombiaToUtc: jest.fn((date: Date) => {
    // Simular conversión Colombia a UTC (sumar 5 horas)
    const utcDate = new Date(date);
    utcDate.setHours(date.getHours() + 5);
    return utcDate;
  }),
}));

// Mock de config
jest.mock("config", () => ({
  config: {
    workSchedule: {
      startHour: 8,
      endHour: 17,
      lunchStartHour: 12,
      lunchEndHour: 13,
    },
  },
}));

describe("Utils - dateUtils.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("WORKING_HOURS", () => {
    it("debería tener los horarios laborales correctos", () => {
      // Arrange & Act
      const workingHours = WORKING_HOURS;

      // Assert
      expect(workingHours.start).toBe(8);
      expect(workingHours.end).toBe(17);
      expect(workingHours.lunchStart).toBe(12);
      expect(workingHours.lunchEnd).toBe(13);
    });
  });

  describe("WORKING_DAYS", () => {
    it("debería incluir solo días laborales (lunes a viernes)", () => {
      // Arrange & Act
      const workingDays = WORKING_DAYS;

      // Assert
      expect(workingDays).toEqual([1, 2, 3, 4, 5]);
      expect(workingDays).toHaveLength(5);
    });
  });

  describe("isWorkingDay", () => {
    it("debería retornar true para días laborales", () => {
      // Arrange
      const monday = new Date("2024-01-01T10:00:00Z"); // Lunes
      const tuesday = new Date("2024-01-02T10:00:00Z"); // Martes
      const wednesday = new Date("2024-01-03T10:00:00Z"); // Miércoles
      const thursday = new Date("2024-01-04T10:00:00Z"); // Jueves
      const friday = new Date("2024-01-05T10:00:00Z"); // Viernes

      // Act & Assert
      expect(isWorkingDay(monday)).toBe(true);
      expect(isWorkingDay(tuesday)).toBe(true);
      expect(isWorkingDay(wednesday)).toBe(true);
      expect(isWorkingDay(thursday)).toBe(true);
      expect(isWorkingDay(friday)).toBe(true);
    });

    it("debería retornar false para fines de semana", () => {
      // Arrange
      const saturday = new Date("2024-01-06T10:00:00Z"); // Sábado
      const sunday = new Date("2024-01-07T10:00:00Z"); // Domingo

      // Act & Assert
      expect(isWorkingDay(saturday)).toBe(false);
      expect(isWorkingDay(sunday)).toBe(false);
    });
  });

  describe("isWithinWorkingHours", () => {
    it("debería retornar true para horas dentro del horario laboral", () => {
      // Arrange - Usar fechas que representen horarios de Colombia
      const morningTime = new Date("2024-01-01T10:00:00"); // 10:00 AM Colombia
      const afternoonTime = new Date("2024-01-01T15:00:00"); // 3:00 PM Colombia

      // Act & Assert
      expect(isWithinWorkingHours(morningTime)).toBe(true);
      expect(isWithinWorkingHours(afternoonTime)).toBe(true);
    });

    it("debería retornar false para horas fuera del horario laboral", () => {
      // Arrange - Usar fechas que representen horarios de Colombia
      const earlyMorning = new Date("2024-01-01T07:00:00"); // 7:00 AM Colombia
      const lateEvening = new Date("2024-01-01T18:00:00"); // 6:00 PM Colombia

      // Act & Assert
      expect(isWithinWorkingHours(earlyMorning)).toBe(false);
      expect(isWithinWorkingHours(lateEvening)).toBe(false);
    });

    it("debería retornar false durante el horario de almuerzo", () => {
      // Arrange - Usar fechas que representen horarios de Colombia
      const lunchTime = new Date("2024-01-01T12:30:00"); // 12:30 PM Colombia

      // Act & Assert
      expect(isWithinWorkingHours(lunchTime)).toBe(false);
    });

    it("debería retornar true en el límite del horario laboral", () => {
      // Arrange - Usar fechas que representen horarios de Colombia
      const startTime = new Date("2024-01-01T08:00:00"); // 8:00 AM Colombia
      const endTime = new Date("2024-01-01T16:59:59"); // 4:59:59 PM Colombia

      // Act & Assert
      expect(isWithinWorkingHours(startTime)).toBe(true);
      expect(isWithinWorkingHours(endTime)).toBe(true);
    });
  });

  describe("isLunchTime", () => {
    it("debería retornar true durante el horario de almuerzo", () => {
      // Arrange - Usar fechas que representen horarios de Colombia
      const lunchStart = new Date("2024-01-01T12:00:00"); // 12:00 PM Colombia
      const lunchMiddle = new Date("2024-01-01T12:30:00"); // 12:30 PM Colombia
      const lunchEnd = new Date("2024-01-01T12:59:59"); // 12:59:59 PM Colombia

      // Act & Assert
      expect(isLunchTime(lunchStart)).toBe(true);
      expect(isLunchTime(lunchMiddle)).toBe(true);
      expect(isLunchTime(lunchEnd)).toBe(true);
    });

    it("debería retornar false fuera del horario de almuerzo", () => {
      // Arrange - Usar fechas que representen horarios de Colombia
      const beforeLunch = new Date("2024-01-01T11:59:59"); // 11:59:59 AM Colombia
      const afterLunch = new Date("2024-01-01T13:00:00"); // 1:00 PM Colombia

      // Act & Assert
      expect(isLunchTime(beforeLunch)).toBe(false);
      expect(isLunchTime(afterLunch)).toBe(false);
    });
  });

  describe("getBusinessDayInfo", () => {
    beforeEach(() => {
      (utcToColombia as jest.Mock).mockImplementation((date: Date) => date);
      (colombiaToUtc as jest.Mock).mockImplementation((date: Date) => date);
    });

    it("debería retornar información correcta para un día laboral", () => {
      // Arrange
      const workingDay = new Date("2024-01-01T10:00:00Z"); // Lunes
      const isHolidayFlag = false;

      // Act
      const result = getBusinessDayInfo(workingDay, isHolidayFlag);

      // Assert
      expect(result.isWorkingDay).toBe(true);
      expect(result.isHoliday).toBe(false);
      expect(result.isWeekend).toBe(false);
      expect(result.workingHoursStart).toBeDefined();
      expect(result.workingHoursEnd).toBeDefined();
      expect(result.lunchStart).toBeDefined();
      expect(result.lunchEnd).toBeDefined();
    });

    it("debería retornar información correcta para un día festivo", () => {
      // Arrange
      const workingDay = new Date("2024-01-01T10:00:00Z"); // Lunes
      const isHolidayFlag = true;

      // Act
      const result = getBusinessDayInfo(workingDay, isHolidayFlag);

      // Assert
      expect(result.isWorkingDay).toBe(false);
      expect(result.isHoliday).toBe(true);
      expect(result.isWeekend).toBe(false);
    });

    it("debería retornar información correcta para un fin de semana", () => {
      // Arrange
      const weekendDay = new Date("2024-01-06T10:00:00Z"); // Sábado
      const isHolidayFlag = false;

      // Act
      const result = getBusinessDayInfo(weekendDay, isHolidayFlag);

      // Assert
      expect(result.isWorkingDay).toBe(false);
      expect(result.isHoliday).toBe(false);
      expect(result.isWeekend).toBe(true);
    });
  });

  describe("adjustToPreviousWorkingTime", () => {
    beforeEach(() => {
      (utcToColombia as jest.Mock).mockImplementation((date: Date) => date);
      (colombiaToUtc as jest.Mock).mockImplementation((date: Date) => date);
    });

    it("debería ajustar fin de semana al viernes anterior", () => {
      // Arrange
      const saturday = new Date("2024-01-06T10:00:00Z"); // Sábado
      const isHolidayFlag = false;

      // Act
      const result = adjustToPreviousWorkingTime(saturday, isHolidayFlag);

      // Assert
      expect(result).toBeDefined();
      expect(result.getHours()).toBe(17); // 5:00 PM
    });

    it("debería ajustar día festivo al día laboral anterior", () => {
      // Arrange
      const holiday = new Date("2024-01-01T10:00:00Z"); // Lunes festivo
      const isHolidayFlag = true;

      // Act
      const result = adjustToPreviousWorkingTime(holiday, isHolidayFlag);

      // Assert
      expect(result).toBeDefined();
      expect(result.getHours()).toBe(17); // 5:00 PM
    });

    it("debería ajustar hora antes del horario laboral al día anterior", () => {
      // Arrange
      const earlyMorning = new Date("2024-01-01T07:00:00Z"); // 7:00 AM
      const isHolidayFlag = false;

      // Act
      const result = adjustToPreviousWorkingTime(earlyMorning, isHolidayFlag);

      // Assert
      expect(result).toBeDefined();
      expect(result.getHours()).toBe(17); // 5:00 PM
    });

    it("debería ajustar hora después del horario laboral al final del día", () => {
      // Arrange - Usar fecha UTC que represente 6:00 PM Colombia
      const lateEvening = new Date("2024-01-01T23:00:00Z"); // 6:00 PM Colombia (UTC+5)
      const isHolidayFlag = false;

      // Act
      const result = adjustToPreviousWorkingTime(lateEvening, isHolidayFlag);

      // Assert
      expect(result).toBeDefined();
      expect(result.getHours()).toBe(17); // La función retorna workingHoursEnd que es 17:00 UTC
    });

    it("debería ajustar hora de almuerzo al inicio del almuerzo", () => {
      // Arrange - Usar fecha UTC que represente 12:30 PM Colombia
      const lunchTime = new Date("2024-01-01T17:30:00Z"); // 12:30 PM Colombia (UTC+5)
      const isHolidayFlag = false;

      // Act
      const result = adjustToPreviousWorkingTime(lunchTime, isHolidayFlag);

      // Assert
      expect(result).toBeDefined();
      expect(result.getHours()).toBe(12); // La función retorna lunchStart que es 12:00 UTC
    });

    it("debería mantener la fecha si está dentro del horario laboral", () => {
      // Arrange - Usar fecha UTC que represente 10:00 AM Colombia
      const workingTime = new Date("2024-01-01T15:00:00Z"); // 10:00 AM Colombia (UTC+5)
      const isHolidayFlag = false;

      // Act
      const result = adjustToPreviousWorkingTime(workingTime, isHolidayFlag);

      // Assert
      expect(result).toEqual(workingTime);
    });
  });

  describe("getNextWorkingDay", () => {
    beforeEach(() => {
      (utcToColombia as jest.Mock).mockImplementation((date: Date) => date);
      (colombiaToUtc as jest.Mock).mockImplementation((date: Date) => date);
    });

    it("debería retornar el próximo día laboral", () => {
      // Arrange
      const friday = new Date("2024-01-05T10:00:00Z"); // Viernes

      // Act
      const result = getNextWorkingDay(friday);

      // Assert
      expect(result).toBeDefined();
      expect(result.getHours()).toBe(8); // 8:00 AM
    });

    it("debería saltar el fin de semana para llegar al lunes", () => {
      // Arrange
      const saturday = new Date("2024-01-06T10:00:00Z"); // Sábado

      // Act
      const result = getNextWorkingDay(saturday);

      // Assert
      expect(result).toBeDefined();
      expect(result.getHours()).toBe(8); // 8:00 AM
    });
  });

  describe("calculateWorkingMinutes", () => {
    beforeEach(() => {
      (utcToColombia as jest.Mock).mockImplementation((date: Date) => date);
      (colombiaToUtc as jest.Mock).mockImplementation((date: Date) => date);
    });

    it("debería retornar 0 para días no laborales", () => {
      // Arrange
      const saturday = new Date("2024-01-06T10:00:00Z"); // Sábado
      const endDate = new Date("2024-01-06T15:00:00Z");
      const isHolidayFlag = false;

      // Act
      const result = calculateWorkingMinutes(saturday, endDate, isHolidayFlag);

      // Assert
      expect(result).toBe(0);
    });

    it("debería retornar 0 para días festivos", () => {
      // Arrange
      const holiday = new Date("2024-01-01T10:00:00Z"); // Lunes festivo
      const endDate = new Date("2024-01-01T15:00:00Z");
      const isHolidayFlag = true;

      // Act
      const result = calculateWorkingMinutes(holiday, endDate, isHolidayFlag);

      // Assert
      expect(result).toBe(0);
    });

    it("debería retornar 0 para horas fuera del horario laboral", () => {
      // Arrange
      const earlyMorning = new Date("2024-01-01T07:00:00Z"); // 7:00 AM
      const endDate = new Date("2024-01-01T15:00:00Z");
      const isHolidayFlag = false;

      // Act
      const result = calculateWorkingMinutes(
        earlyMorning,
        endDate,
        isHolidayFlag
      );

      // Assert
      expect(result).toBe(0);
    });

    it("debería retornar 0 para horas de almuerzo", () => {
      // Arrange
      const lunchTime = new Date("2024-01-01T12:30:00Z"); // 12:30 PM
      const endDate = new Date("2024-01-01T15:00:00Z");
      const isHolidayFlag = false;

      // Act
      const result = calculateWorkingMinutes(lunchTime, endDate, isHolidayFlag);

      // Assert
      expect(result).toBe(0);
    });

    it("debería calcular minutos hábiles correctamente", () => {
      // Arrange - Usar fechas UTC que representen horarios de Colombia
      const startTime = new Date("2024-01-01T15:00:00Z"); // 10:00 AM Colombia (UTC+5)
      const endTime = new Date("2024-01-01T20:00:00Z"); // 3:00 PM Colombia (UTC+5)
      const isHolidayFlag = false;

      // Act
      const result = calculateWorkingMinutes(startTime, endTime, isHolidayFlag);

      // Assert
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(300); // Máximo 5 horas
    });

    it("debería limitar el resultado al tiempo total entre fechas", () => {
      // Arrange
      const startTime = new Date("2024-01-01T10:00:00Z"); // 10:00 AM
      const endTime = new Date("2024-01-01T11:00:00Z"); // 11:00 AM (1 hora)
      const isHolidayFlag = false;

      // Act
      const result = calculateWorkingMinutes(startTime, endTime, isHolidayFlag);

      // Assert
      expect(result).toBeLessThanOrEqual(60); // Máximo 1 hora
    });
  });
});
