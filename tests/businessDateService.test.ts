import { calculateBusinessDate } from "../src/services/businessDateService";
import { BusinessDateRequest } from "../src/types/request";

// Mock del servicio de días festivos
jest.mock("../src/services/holidayService", () => ({
  getHolidays: jest.fn().mockResolvedValue({
    success: true,
    data: ["2025-04-17", "2025-04-18"], // Festivos de ejemplo
  }),
}));

describe("BusinessDateService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Validación de parámetros", () => {
    it("debe retornar error cuando no se proporcionan days ni hours", async () => {
      const request: BusinessDateRequest = {};

      const result = await calculateBusinessDate(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("InvalidParameters");
        expect(result.message).toContain(
          "Se debe proporcionar al menos uno de los parámetros"
        );
      }
    });

    it("debe retornar error cuando days es negativo", async () => {
      const request: BusinessDateRequest = { days: -1 };

      const result = await calculateBusinessDate(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("InvalidParameters");
        expect(result.message).toContain("número positivo");
      }
    });

    it("debe retornar error cuando hours es negativo", async () => {
      const request: BusinessDateRequest = { hours: -1 };

      const result = await calculateBusinessDate(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("InvalidParameters");
        expect(result.message).toContain("número positivo");
      }
    });

    it("debe retornar error cuando date tiene formato inválido", async () => {
      const request: BusinessDateRequest = {
        days: 1,
        date: "2025-01-01T10:00:00", // Sin Z al final
      };

      const result = await calculateBusinessDate(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("InvalidParameters");
        expect(result.message).toContain("formato ISO 8601 UTC");
      }
    });
  });

  describe("Cálculo de fechas hábiles", () => {
    it("debe calcular correctamente cuando se agregan solo días", async () => {
      const request: BusinessDateRequest = {
        days: 1,
        date: "2025-01-06T08:00:00Z", // Lunes 8:00 AM Colombia
      };

      const result = await calculateBusinessDate(request);

      expect(result.success).toBe(true);
      if (result.success) {
        // Debería ser martes 8:00 AM Colombia (convertido a UTC)
        expect(result.resultDate).toBeDefined();
        expect(result.addedDays).toBe(1);
        expect(result.addedHours).toBe(0);
      }
    });

    it("debe calcular correctamente cuando se agregan solo horas", async () => {
      const request: BusinessDateRequest = {
        hours: 2,
        date: "2025-01-06T08:00:00Z", // Lunes 8:00 AM Colombia
      };

      const result = await calculateBusinessDate(request);

      expect(result.success).toBe(true);
      if (result.success) {
        // Debería ser lunes 10:00 AM Colombia (convertido a UTC)
        expect(result.resultDate).toBeDefined();
        expect(result.addedDays).toBe(0);
        expect(result.addedHours).toBe(2);
      }
    });

    it("debe calcular correctamente cuando se agregan días y horas", async () => {
      const request: BusinessDateRequest = {
        days: 1,
        hours: 4,
        date: "2025-01-06T15:00:00Z", // Lunes 3:00 PM Colombia
      };

      const result = await calculateBusinessDate(request);

      expect(result.success).toBe(true);
      if (result.success) {
        // Debería ser miércoles 10:00 AM Colombia (convertido a UTC)
        expect(result.resultDate).toBeDefined();
        expect(result.addedDays).toBe(1);
        expect(result.addedHours).toBe(4);
      }
    });

    it("debe manejar correctamente fechas fuera del horario laboral", async () => {
      const request: BusinessDateRequest = {
        hours: 1,
        date: "2025-01-04T22:00:00Z", // Viernes 5:00 PM Colombia (fuera del horario)
      };

      const result = await calculateBusinessDate(request);

      expect(result.success).toBe(true);
      if (result.success) {
        // Debería ajustar al viernes 5:00 PM y luego agregar 1 hora al lunes 9:00 AM
        expect(result.resultDate).toBeDefined();
        expect(result.addedDays).toBe(0);
        expect(result.addedHours).toBe(1);
      }
    });

    it("debe manejar correctamente fines de semana", async () => {
      const request: BusinessDateRequest = {
        hours: 1,
        date: "2025-01-05T14:00:00Z", // Sábado 2:00 PM Colombia
      };

      const result = await calculateBusinessDate(request);

      expect(result.success).toBe(true);
      if (result.success) {
        // Debería ajustar al viernes 5:00 PM y luego agregar 1 hora al lunes 9:00 AM
        expect(result.resultDate).toBeDefined();
        expect(result.addedDays).toBe(0);
        expect(result.addedHours).toBe(1);
      }
    });

    it("debe manejar correctamente el horario de almuerzo", async () => {
      const request: BusinessDateRequest = {
        hours: 1,
        date: "2025-01-06T12:30:00Z", // Lunes 12:30 PM Colombia (durante almuerzo)
      };

      const result = await calculateBusinessDate(request);

      expect(result.success).toBe(true);
      if (result.success) {
        // Debería ajustar al final del almuerzo (1:00 PM) y luego agregar 1 hora
        expect(result.resultDate).toBeDefined();
        expect(result.addedDays).toBe(0);
        expect(result.addedHours).toBe(1);
      }
    });
  });

  describe("Casos edge", () => {
    it("debe manejar correctamente cuando se agregan 0 días y 0 horas", async () => {
      const request: BusinessDateRequest = {
        days: 0,
        hours: 0,
        date: "2025-01-06T10:00:00Z",
      };

      const result = await calculateBusinessDate(request);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.resultDate).toBeDefined();
        expect(result.addedDays).toBe(0);
        expect(result.addedHours).toBe(0);
      }
    });

    it("debe usar fecha actual cuando no se proporciona date", async () => {
      const request: BusinessDateRequest = {
        hours: 1,
      };

      const result = await calculateBusinessDate(request);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.resultDate).toBeDefined();
        expect(result.addedDays).toBe(0);
        expect(result.addedHours).toBe(1);
      }
    });
  });

  describe("Validación con Zod", () => {
    it("debe validar correctamente números decimales", async () => {
      const request: BusinessDateRequest = {
        days: 1.5, // Número decimal
      };

      const result = await calculateBusinessDate(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("InvalidParameters");
        expect(result.message).toContain("número entero");
      }
    });

    it("debe validar correctamente strings en lugar de números", async () => {
      const request: BusinessDateRequest = {
        days: "1" as any, // String en lugar de número
      };

      const result = await calculateBusinessDate(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("InvalidParameters");
        expect(result.message).toContain("expected number");
      }
    });

    it("debe validar correctamente fechas con formato incorrecto", async () => {
      const request: BusinessDateRequest = {
        days: 1,
        date: "2025-01-01", // Sin hora ni Z
      };

      const result = await calculateBusinessDate(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("InvalidParameters");
        expect(result.message).toContain("ISO 8601 UTC");
      }
    });
  });
});
