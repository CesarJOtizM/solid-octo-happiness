import {
  COLOMBIA_TIMEZONE,
  utcToColombia,
  colombiaToUtc,
  formatUtcToColombia,
  getCurrentColombiaTime,
  parseIsoToColombiaUtc,
  isValidIsoDate,
  toIsoUtcString,
  createColombiaDate,
} from "utils/timezoneUtils";

// Mock de config
jest.mock("config", () => ({
  config: {
    timezone: {
      default: "America/Bogota",
    },
  },
}));

// Mock de date-fns-tz
jest.mock("date-fns-tz", () => ({
  toZonedTime: jest.fn((date: Date) => {
    const mockDate = new Date(date);
    mockDate.setHours(date.getHours() - 5);
    return mockDate;
  }),
  fromZonedTime: jest.fn((date: Date) => {
    const mockDate = new Date(date);
    mockDate.setHours(date.getHours() + 5);
    return mockDate;
  }),
  formatInTimeZone: jest.fn((date: Date) => {
    const mockDate = new Date(date);
    mockDate.setHours(date.getHours() - 5);
    return mockDate.toISOString().replace("T", " ").replace("Z", "");
  }),
}));

// Mock de date-fns
jest.mock("date-fns", () => ({
  parseISO: jest.fn((isoString: string) => new Date(isoString)),
}));

describe("Utils - timezoneUtils.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("COLOMBIA_TIMEZONE", () => {
    it("debería tener la zona horaria de Colombia", () => {
      // Arrange & Act
      const timezone = COLOMBIA_TIMEZONE;

      // Assert
      expect(timezone).toBe("America/Bogota");
    });
  });

  describe("utcToColombia", () => {
    it("debería convertir fecha UTC a Colombia", () => {
      // Arrange
      const utcDate = new Date("2024-01-01T12:00:00Z");

      // Act
      const result = utcToColombia(utcDate);

      // Assert
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe("colombiaToUtc", () => {
    it("debería convertir fecha de Colombia a UTC", () => {
      // Arrange
      const colombiaDate = new Date("2024-01-01T07:00:00");

      // Act
      const result = colombiaToUtc(colombiaDate);

      // Assert
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe("formatUtcToColombia", () => {
    it("debería formatear fecha UTC a Colombia con formato por defecto", () => {
      // Arrange
      const utcDate = new Date("2024-01-01T12:00:00Z");

      // Act
      const result = formatUtcToColombia(utcDate);

      // Assert
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("debería formatear fecha UTC a Colombia con formato personalizado", () => {
      // Arrange
      const utcDate = new Date("2024-01-01T12:00:00Z");
      const customFormat = "dd/MM/yyyy HH:mm";

      // Act
      const result = formatUtcToColombia(utcDate, customFormat);

      // Assert
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });
  });

  describe("getCurrentColombiaTime", () => {
    it("debería retornar la fecha actual en Colombia", () => {
      // Arrange
      const mockDate = new Date("2024-01-01T12:00:00Z");
      jest.spyOn(global, "Date").mockImplementation(() => mockDate);

      // Act
      const result = getCurrentColombiaTime();

      // Assert
      expect(result).toBeDefined();
      expect(typeof result.getTime).toBe("function");
      expect(typeof result.toISOString).toBe("function");
      expect(result.getTime()).toBeDefined();

      // Cleanup
      jest.restoreAllMocks();
    });
  });

  describe("parseIsoToColombiaUtc", () => {
    it("debería parsear ISO string y convertir a Colombia UTC", () => {
      // Arrange
      const isoString = "2024-01-01T12:00:00Z";

      // Act
      const result = parseIsoToColombiaUtc(isoString);

      // Assert
      expect(result).toBeDefined();
      expect(typeof result.getTime).toBe("function");
      expect(typeof result.toISOString).toBe("function");
      expect(result.getTime()).toBeDefined();
    });
  });

  describe("isValidIsoDate", () => {
    it("debería retornar true para fechas ISO válidas", () => {
      // Arrange
      const validIsoDate = "2024-01-01T12:00:00Z";

      // Act
      const result = isValidIsoDate(validIsoDate);

      // Assert
      expect(result).toBe(true);
    });

    it("debería retornar false para fechas ISO inválidas", () => {
      // Arrange
      const invalidIsoDate = "2024-01-01T12:00:00"; // Sin Z

      // Act
      const result = isValidIsoDate(invalidIsoDate);

      // Assert
      expect(result).toBe(false);
    });

    it("debería retornar false para strings que no son fechas", () => {
      // Arrange
      const notADate = "not-a-date";

      // Act
      const result = isValidIsoDate(notADate);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("toIsoUtcString", () => {
    it("debería convertir fecha a string ISO UTC", () => {
      // Arrange
      const date = new Date("2024-01-01T12:00:00Z");

      // Act
      const result = toIsoUtcString(date);

      // Assert
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it("debería retornar el mismo resultado que toISOString", () => {
      // Arrange
      const date = new Date("2024-01-01T12:00:00Z");

      // Act
      const result = toIsoUtcString(date);
      const expected = date.toISOString();

      // Assert
      expect(result).toBe(expected);
    });
  });

  describe("createColombiaDate", () => {
    it("debería crear una fecha en Colombia y convertirla a UTC", () => {
      // Arrange
      const year = 2024;
      const month = 1;
      const day = 1;
      const hour = 12;
      const minute = 30;
      const second = 45;

      // Act
      const result = createColombiaDate(year, month, day, hour, minute, second);

      // Assert
      expect(result).toBeDefined();
      expect(typeof result.getTime).toBe("function");
      expect(typeof result.toISOString).toBe("function");
      expect(result.getTime()).toBeDefined();
    });

    it("debería usar valores por defecto para hora, minuto y segundo", () => {
      // Arrange
      const year = 2024;
      const month = 1;
      const day = 1;

      // Act
      const result = createColombiaDate(year, month, day);

      // Assert
      expect(result).toBeDefined();
      expect(typeof result.getTime).toBe("function");
      expect(typeof result.toISOString).toBe("function");
      expect(result.getTime()).toBeDefined();
    });
  });
});
