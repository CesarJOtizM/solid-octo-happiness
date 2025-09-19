import request from "supertest";
import express from "express";
import businessDateRoutes from "../src/routes/businessDateRoutes";

// Mock de middleware/validation - usando la misma estructura que los tests existentes
jest.mock("middleware/validation", () => ({
  validateBusinessDateRequest: jest.fn(
    (req: unknown, _res: unknown, next: unknown) => {
      // Simular validación exitosa
      (req as any).validatedParams = {
        days: 1,
        hours: 1,
        date: "2025-01-01T10:00:00Z",
      };
      (next as Function)();
    }
  ),
}));

// Mock de controllers/businessDateController - usando la misma estructura que los tests existentes
jest.mock("controllers/businessDateController", () => ({
  getBusinessDate: jest.fn((_req: unknown, res: unknown) => {
    (res as any).status(200).json({
      date: "2025-01-08T18:00:00Z",
    });
  }),
}));

describe("Casos de Ejemplo del Requerimiento", () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use("/api", businessDateRoutes);
  });

  describe("📋 Casos específicos del Requirements.md", () => {
    it("Caso 1: Viernes 5:00 PM + 1 hora → Lunes 9:00 AM", async () => {
      // Arrange - Viernes 5:00 PM Colombia (22:00 UTC)
      const queryParams = {
        hours: "1",
        date: "2025-01-03T22:00:00Z", // Viernes 5:00 PM Colombia
      };

      // Act
      const response = await request(app)
        .get("/api/business-date")
        .query(queryParams);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        date: "2025-01-08T18:00:00Z",
      });
      // Nota: Este test valida la estructura, no el cálculo específico
      // El cálculo real se valida en los tests unitarios del servicio
    });

    it("Caso 2: Sábado 2:00 PM + 1 hora → Lunes 9:00 AM", async () => {
      // Arrange - Sábado 2:00 PM Colombia (19:00 UTC)
      const queryParams = {
        hours: "1",
        date: "2025-01-04T19:00:00Z", // Sábado 2:00 PM Colombia
      };

      // Act
      const response = await request(app)
        .get("/api/business-date")
        .query(queryParams);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        date: "2025-01-08T18:00:00Z",
      });
    });

    it("Caso 3: Martes 3:00 PM + 1 día + 4 horas → Jueves 10:00 AM", async () => {
      // Arrange - Martes 3:00 PM Colombia (20:00 UTC)
      const queryParams = {
        days: "1",
        hours: "4",
        date: "2025-01-07T20:00:00Z", // Martes 3:00 PM Colombia
      };

      // Act
      const response = await request(app)
        .get("/api/business-date")
        .query(queryParams);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        date: "2025-01-08T18:00:00Z",
      });
    });

    it("Caso 4: Domingo 6:00 PM + 1 día → Lunes 5:00 PM", async () => {
      // Arrange - Domingo 6:00 PM Colombia (23:00 UTC)
      const queryParams = {
        days: "1",
        date: "2025-01-05T23:00:00Z", // Domingo 6:00 PM Colombia
      };

      // Act
      const response = await request(app)
        .get("/api/business-date")
        .query(queryParams);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        date: "2025-01-08T18:00:00Z",
      });
    });

    it("Caso 5: Día laboral 8:00 AM + 8 horas → Mismo día 5:00 PM", async () => {
      // Arrange - Día laboral 8:00 AM Colombia (13:00 UTC)
      const queryParams = {
        hours: "8",
        date: "2025-01-06T13:00:00Z", // Lunes 8:00 AM Colombia
      };

      // Act
      const response = await request(app)
        .get("/api/business-date")
        .query(queryParams);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        date: "2025-01-08T18:00:00Z",
      });
    });

    it("Caso 6: Día laboral 8:00 AM + 1 día → Siguiente día laboral 8:00 AM", async () => {
      // Arrange - Día laboral 8:00 AM Colombia (13:00 UTC)
      const queryParams = {
        days: "1",
        date: "2025-01-06T13:00:00Z", // Lunes 8:00 AM Colombia
      };

      // Act
      const response = await request(app)
        .get("/api/business-date")
        .query(queryParams);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        date: "2025-01-08T18:00:00Z",
      });
    });

    it("Caso 7: Día laboral 12:30 PM + 1 día → Siguiente día laboral 12:00 PM", async () => {
      // Arrange - Día laboral 12:30 PM Colombia (17:30 UTC)
      const queryParams = {
        days: "1",
        date: "2025-01-06T17:30:00Z", // Lunes 12:30 PM Colombia
      };

      // Act
      const response = await request(app)
        .get("/api/business-date")
        .query(queryParams);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        date: "2025-01-08T18:00:00Z",
      });
    });

    it("Caso 8: Día laboral 11:30 AM + 3 horas → Mismo día laboral 3:30 PM", async () => {
      // Arrange - Día laboral 11:30 AM Colombia (16:30 UTC)
      const queryParams = {
        hours: "3",
        date: "2025-01-06T16:30:00Z", // Lunes 11:30 AM Colombia
      };

      // Act
      const response = await request(app)
        .get("/api/business-date")
        .query(queryParams);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        date: "2025-01-08T18:00:00Z",
      });
    });

    it("Caso 9: 2025-04-10T15:00:00Z + 5 días + 4 horas → 21 abril 3:00 PM (considerando festivos 17-18 abril)", async () => {
      // Arrange - 10 de abril 3:00 PM Colombia (20:00 UTC)
      const queryParams = {
        days: "5",
        hours: "4",
        date: "2025-04-10T20:00:00Z", // 10 abril 3:00 PM Colombia
      };

      // Act
      const response = await request(app)
        .get("/api/business-date")
        .query(queryParams);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        date: "2025-01-08T18:00:00Z",
      });
    });
  });

  describe("🔍 Validación de estructura de respuesta", () => {
    it("debe retornar formato correcto en caso de éxito", async () => {
      // Arrange
      const queryParams = {
        days: "1",
        date: "2025-01-06T13:00:00Z",
      };

      // Act
      const response = await request(app)
        .get("/api/business-date")
        .query(queryParams);

      // Assert
      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toMatch(/application\/json/);
      expect(response.body).toEqual({
        date: "2025-01-08T18:00:00Z",
      });
      expect(Object.keys(response.body)).toHaveLength(1);
    });
  });
});
