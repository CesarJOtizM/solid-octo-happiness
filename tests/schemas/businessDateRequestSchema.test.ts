import { businessDateRequestSchema } from "schemas/businessDateRequestSchema";
import { isValidIsoDate } from "utils/timezoneUtils";

// Mock de utils/timezoneUtils
jest.mock("utils/timezoneUtils", () => ({
  isValidIsoDate: jest.fn(),
}));

describe("businessDateRequestSchema", () => {
  const mockIsValidIsoDate = isValidIsoDate as jest.MockedFunction<
    typeof isValidIsoDate
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock por defecto para fechas válidas
    mockIsValidIsoDate.mockReturnValue(true);
  });

  describe("✅ Validación de parámetro 'days'", () => {
    it("debe aceptar days como string numérico válido", () => {
      // Arrange
      const input = { days: "5" };

      // Act
      const result = businessDateRequestSchema.parse(input);

      // Assert
      expect(result.days).toBe(5);
      expect(typeof result.days).toBe("number");
    });

    it("debe aceptar days como number válido", () => {
      // Arrange
      const input = { days: 10 };

      // Act
      const result = businessDateRequestSchema.parse(input);

      // Assert
      expect(result.days).toBe(10);
      expect(typeof result.days).toBe("number");
    });

    it("debe aceptar days como cero", () => {
      // Arrange
      const input = { days: "0" };

      // Act
      const result = businessDateRequestSchema.parse(input);

      // Assert
      expect(result.days).toBe(0);
    });

    it("debe rechazar days como string no numérico", () => {
      // Arrange
      const input = { days: "abc" };

      // Act & Assert
      expect(() => businessDateRequestSchema.parse(input)).toThrow();
    });

    it("debe rechazar days como número decimal", () => {
      // Arrange
      const input = { days: "5.5" };

      // Act & Assert
      expect(() => businessDateRequestSchema.parse(input)).toThrow();
    });

    it("debe rechazar days como número negativo", () => {
      // Arrange
      const input = { days: "-5" };

      // Act & Assert
      expect(() => businessDateRequestSchema.parse(input)).toThrow();
    });

    it("debe rechazar days como null", () => {
      // Arrange
      const input = { days: null };

      // Act & Assert
      expect(() => businessDateRequestSchema.parse(input)).toThrow();
    });

    it("debe rechazar days como undefined", () => {
      // Arrange
      const input = { days: undefined };

      // Act & Assert
      expect(() => businessDateRequestSchema.parse(input)).toThrow();
    });
  });

  describe("✅ Validación de parámetro 'hours'", () => {
    it("debe aceptar hours como string numérico válido", () => {
      // Arrange
      const input = { hours: "8" };

      // Act
      const result = businessDateRequestSchema.parse(input);

      // Assert
      expect(result.hours).toBe(8);
      expect(typeof result.hours).toBe("number");
    });

    it("debe aceptar hours como number válido", () => {
      // Arrange
      const input = { hours: 6 };

      // Act
      const result = businessDateRequestSchema.parse(input);

      // Assert
      expect(result.hours).toBe(6);
      expect(typeof result.hours).toBe("number");
    });

    it("debe aceptar hours como cero", () => {
      // Arrange
      const input = { hours: "0" };

      // Act
      const result = businessDateRequestSchema.parse(input);

      // Assert
      expect(result.hours).toBe(0);
    });

    it("debe rechazar hours como string no numérico", () => {
      // Arrange
      const input = { hours: "xyz" };

      // Act & Assert
      expect(() => businessDateRequestSchema.parse(input)).toThrow();
    });

    it("debe rechazar hours como número decimal", () => {
      // Arrange
      const input = { hours: "3.5" };

      // Act & Assert
      expect(() => businessDateRequestSchema.parse(input)).toThrow();
    });

    it("debe rechazar hours como número negativo", () => {
      // Arrange
      const input = { hours: "-2" };

      // Act & Assert
      expect(() => businessDateRequestSchema.parse(input)).toThrow();
    });

    it("debe rechazar hours como null", () => {
      // Arrange
      const input = { hours: null };

      // Act & Assert
      expect(() => businessDateRequestSchema.parse(input)).toThrow();
    });

    it("debe rechazar hours como undefined", () => {
      // Arrange
      const input = { hours: undefined };

      // Act & Assert
      expect(() => businessDateRequestSchema.parse(input)).toThrow();
    });
  });

  describe("✅ Validación de parámetro 'date'", () => {
    it("debe aceptar date como string ISO 8601 válido", () => {
      // Arrange
      const input = { days: "5", date: "2025-01-01T10:00:00Z" };
      mockIsValidIsoDate.mockReturnValue(true);

      // Act
      const result = businessDateRequestSchema.parse(input);

      // Assert
      expect(result.date).toBe("2025-01-01T10:00:00Z");
      expect(mockIsValidIsoDate).toHaveBeenCalledWith("2025-01-01T10:00:00Z");
    });

    it("debe rechazar date como string ISO 8601 inválido", () => {
      // Arrange
      const input = { days: "5", date: "2025-01-01T10:00:00" };
      mockIsValidIsoDate.mockReturnValue(false);

      // Act & Assert
      expect(() => businessDateRequestSchema.parse(input)).toThrow();
      expect(mockIsValidIsoDate).toHaveBeenCalledWith("2025-01-01T10:00:00");
    });

    it("debe rechazar date como string vacío", () => {
      // Arrange
      const input = { days: "5", date: "" };
      mockIsValidIsoDate.mockReturnValue(false);

      // Act & Assert
      expect(() => businessDateRequestSchema.parse(input)).toThrow();
    });

    it("debe rechazar date como null", () => {
      // Arrange
      const input = { days: "5", date: null };

      // Act & Assert
      expect(() => businessDateRequestSchema.parse(input)).toThrow();
    });

    it("debe aceptar date como undefined cuando es opcional", () => {
      // Arrange
      const input = { days: "5", date: undefined };

      // Act
      const result = businessDateRequestSchema.parse(input);

      // Assert
      expect(result.days).toBe(5);
      expect(result.date).toBeUndefined();
    });

    it("debe rechazar date como número", () => {
      // Arrange
      const input = { days: "5", date: 1234567890 };

      // Act & Assert
      expect(() => businessDateRequestSchema.parse(input)).toThrow();
    });
  });

  describe("✅ Validación de combinaciones de parámetros", () => {
    it("debe aceptar solo days", () => {
      // Arrange
      const input = { days: "5" };

      // Act
      const result = businessDateRequestSchema.parse(input);

      // Assert
      expect(result.days).toBe(5);
      expect(result.hours).toBeUndefined();
      expect(result.date).toBeUndefined();
    });

    it("debe aceptar solo hours", () => {
      // Arrange
      const input = { hours: "8" };

      // Act
      const result = businessDateRequestSchema.parse(input);

      // Assert
      expect(result.hours).toBe(8);
      expect(result.days).toBeUndefined();
      expect(result.date).toBeUndefined();
    });

    it("debe aceptar days y hours juntos", () => {
      // Arrange
      const input = { days: "5", hours: "8" };

      // Act
      const result = businessDateRequestSchema.parse(input);

      // Assert
      expect(result.days).toBe(5);
      expect(result.hours).toBe(8);
      expect(result.date).toBeUndefined();
    });

    it("debe aceptar days y date juntos", () => {
      // Arrange
      const input = { days: "5", date: "2025-01-01T10:00:00Z" };
      mockIsValidIsoDate.mockReturnValue(true);

      // Act
      const result = businessDateRequestSchema.parse(input);

      // Assert
      expect(result.days).toBe(5);
      expect(result.date).toBe("2025-01-01T10:00:00Z");
      expect(result.hours).toBeUndefined();
    });

    it("debe aceptar hours y date juntos", () => {
      // Arrange
      const input = { hours: "8", date: "2025-01-01T10:00:00Z" };
      mockIsValidIsoDate.mockReturnValue(true);

      // Act
      const result = businessDateRequestSchema.parse(input);

      // Assert
      expect(result.hours).toBe(8);
      expect(result.date).toBe("2025-01-01T10:00:00Z");
      expect(result.days).toBeUndefined();
    });

    it("debe aceptar todos los parámetros juntos", () => {
      // Arrange
      const input = {
        days: "5",
        hours: "8",
        date: "2025-01-01T10:00:00Z",
      };
      mockIsValidIsoDate.mockReturnValue(true);

      // Act
      const result = businessDateRequestSchema.parse(input);

      // Assert
      expect(result.days).toBe(5);
      expect(result.hours).toBe(8);
      expect(result.date).toBe("2025-01-01T10:00:00Z");
    });
  });

  describe("❌ Validación de parámetros faltantes", () => {
    it("debe rechazar objeto vacío", () => {
      // Arrange
      const input = {};

      // Act & Assert
      expect(() => businessDateRequestSchema.parse(input)).toThrow();
    });

    it("debe rechazar solo date sin days ni hours", () => {
      // Arrange
      const input = { date: "2025-01-01T10:00:00Z" };
      mockIsValidIsoDate.mockReturnValue(true);

      // Act & Assert
      expect(() => businessDateRequestSchema.parse(input)).toThrow();
    });

    it("debe rechazar parámetros no reconocidos", () => {
      // Arrange
      const input = { unknown: "value" };

      // Act & Assert
      expect(() => businessDateRequestSchema.parse(input)).toThrow();
    });
  });

  describe("🔍 Validación de mensajes de error", () => {
    it("debe mostrar mensaje correcto para days no entero", () => {
      // Arrange
      const input = { days: "5.5" };

      // Act & Assert
      try {
        businessDateRequestSchema.parse(input);
        fail("Se esperaba que lanzara un error");
      } catch (error: any) {
        expect(error.issues[0].message).toBe(
          "El parámetro 'days' debe ser un número entero"
        );
        expect(error.issues[0].path).toEqual(["days"]);
      }
    });

    it("debe mostrar mensaje correcto para days negativo", () => {
      // Arrange
      const input = { days: "-5" };

      // Act & Assert
      try {
        businessDateRequestSchema.parse(input);
        fail("Se esperaba que lanzara un error");
      } catch (error: any) {
        expect(error.issues[0].message).toBe(
          "El parámetro 'days' debe ser un número positivo"
        );
        expect(error.issues[0].path).toEqual(["days"]);
      }
    });

    it("debe mostrar mensaje correcto para hours no entero", () => {
      // Arrange
      const input = { hours: "3.5" };

      // Act & Assert
      try {
        businessDateRequestSchema.parse(input);
        fail("Se esperaba que lanzara un error");
      } catch (error: any) {
        expect(error.issues[0].message).toBe(
          "El parámetro 'hours' debe ser un número entero"
        );
        expect(error.issues[0].path).toEqual(["hours"]);
      }
    });

    it("debe mostrar mensaje correcto para hours negativo", () => {
      // Arrange
      const input = { hours: "-2" };

      // Act & Assert
      try {
        businessDateRequestSchema.parse(input);
        fail("Se esperaba que lanzara un error");
      } catch (error: any) {
        expect(error.issues[0].message).toBe(
          "El parámetro 'hours' debe ser un número positivo"
        );
        expect(error.issues[0].path).toEqual(["hours"]);
      }
    });

    it("debe mostrar mensaje correcto para date inválido", () => {
      // Arrange
      const input = { date: "invalid-date" };
      mockIsValidIsoDate.mockReturnValue(false);

      // Act & Assert
      try {
        businessDateRequestSchema.parse(input);
        fail("Se esperaba que lanzara un error");
      } catch (error: any) {
        expect(error.issues[0].message).toBe(
          "El parámetro 'date' debe ser una fecha válida en formato ISO 8601 UTC (YYYY-MM-DDTHH:mm:ssZ)"
        );
        expect(error.issues[0].path).toEqual(["date"]);
      }
    });

    it("debe mostrar mensaje correcto para parámetros faltantes", () => {
      // Arrange
      const input = {};

      // Act & Assert
      try {
        businessDateRequestSchema.parse(input);
        fail("Se esperaba que lanzara un error");
      } catch (error: any) {
        expect(error.issues[0].message).toBe(
          "Se debe proporcionar al menos uno de los parámetros: days o hours"
        );
        expect(error.issues[0].path).toEqual(["days", "hours"]);
      }
    });
  });

  describe("🔍 Validación de tipos de datos", () => {
    it("debe transformar string a number para days", () => {
      // Arrange
      const input = { days: "10" };

      // Act
      const result = businessDateRequestSchema.parse(input);

      // Assert
      expect(typeof result.days).toBe("number");
      expect(result.days).toBe(10);
    });

    it("debe transformar string a number para hours", () => {
      // Arrange
      const input = { hours: "6" };

      // Act
      const result = businessDateRequestSchema.parse(input);

      // Assert
      expect(typeof result.hours).toBe("number");
      expect(result.hours).toBe(6);
    });

    it("debe mantener string para date", () => {
      // Arrange
      const input = { days: "5", date: "2025-01-01T10:00:00Z" };
      mockIsValidIsoDate.mockReturnValue(true);

      // Act
      const result = businessDateRequestSchema.parse(input);

      // Assert
      expect(typeof result.date).toBe("string");
      expect(result.date).toBe("2025-01-01T10:00:00Z");
    });

    it("debe mantener number para days cuando ya es number", () => {
      // Arrange
      const input = { days: 15 };

      // Act
      const result = businessDateRequestSchema.parse(input);

      // Assert
      expect(typeof result.days).toBe("number");
      expect(result.days).toBe(15);
    });

    it("debe mantener number para hours cuando ya es number", () => {
      // Arrange
      const input = { hours: 12 };

      // Act
      const result = businessDateRequestSchema.parse(input);

      // Assert
      expect(typeof result.hours).toBe("number");
      expect(result.hours).toBe(12);
    });
  });

  describe("🔍 Casos edge", () => {
    it("debe manejar números muy grandes", () => {
      // Arrange
      const input = { days: "999999" };

      // Act
      const result = businessDateRequestSchema.parse(input);

      // Assert
      expect(result.days).toBe(999999);
    });

    it("debe manejar números muy pequeños", () => {
      // Arrange
      const input = { hours: "0" };

      // Act
      const result = businessDateRequestSchema.parse(input);

      // Assert
      expect(result.hours).toBe(0);
    });

    it("debe manejar strings con espacios", () => {
      // Arrange
      const input = { days: " 5 " };

      // Act
      const result = businessDateRequestSchema.parse(input);

      // Assert
      expect(result.days).toBe(5);
    });

    it("debe manejar strings con ceros a la izquierda", () => {
      // Arrange
      const input = { hours: "007" };

      // Act
      const result = businessDateRequestSchema.parse(input);

      // Assert
      expect(result.hours).toBe(7);
    });

    it("debe rechazar strings con caracteres especiales", () => {
      // Arrange
      const input = { days: "5!" };

      // Act & Assert
      expect(() => businessDateRequestSchema.parse(input)).toThrow();
    });

    it("debe aceptar strings con notación científica válida", () => {
      // Arrange
      const input = { hours: "1e3" };

      // Act
      const result = businessDateRequestSchema.parse(input);

      // Assert
      expect(result.hours).toBe(1000);
    });

    it("debe rechazar strings con caracteres no numéricos", () => {
      // Arrange
      const input = { days: "abc123" };

      // Act & Assert
      expect(() => businessDateRequestSchema.parse(input)).toThrow();
    });
  });

  describe("🔍 Validación de integridad del schema", () => {
    it("debe mantener todas las propiedades opcionales", () => {
      // Arrange
      const input = { days: "5" };

      // Act
      const result = businessDateRequestSchema.parse(input);

      // Assert
      expect(result).toHaveProperty("days");
      expect(result.days).toBe(5);
      expect(result.hours).toBeUndefined();
      expect(result.date).toBeUndefined();
    });

    it("debe mantener el orden de las propiedades", () => {
      // Arrange
      const input = {
        date: "2025-01-01T10:00:00Z",
        hours: "8",
        days: "5",
      };
      mockIsValidIsoDate.mockReturnValue(true);

      // Act
      const result = businessDateRequestSchema.parse(input);

      // Assert
      const keys = Object.keys(result);
      expect(keys).toEqual(["days", "hours", "date"]);
    });

    it("debe permitir modificación del objeto resultado", () => {
      // Arrange
      const input = { days: "5", hours: "8" };

      // Act
      const result = businessDateRequestSchema.parse(input);

      // Assert
      expect(result.days).toBe(5);
      expect(result.hours).toBe(8);

      // Modificar el objeto (JavaScript permite esto)
      (result as any).days = 10;
      expect(result.days).toBe(10);
    });
  });
});
