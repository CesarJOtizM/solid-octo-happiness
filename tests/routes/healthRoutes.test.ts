import request from "supertest";
import express from "express";
import healthRoutes from "../../src/routes/healthRoutes";
// Tipos simplificados para evitar problemas de compatibilidad

// Mock de controllers/healthController
jest.mock("controllers/healthController", () => ({
  getHealthCheck: jest.fn((_req: unknown, res: unknown) => {
    (res as any).json({
      name: "API de Fechas Hábiles - Colombia",
      version: "1.0.0",
      status: "healthy",
      timestamp: "2025-01-01T10:00:00.000Z",
      uptime: 3600,
      environment: "test",
    });
  }),
}));

describe("healthRoutes", () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use("/health", healthRoutes);
  });

  describe("GET /health/", () => {
    describe("✅ Casos exitosos", () => {
      it("debe retornar health check exitoso", async () => {
        // Act
        const response = await request(app).get("/health/");

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          name: "API de Fechas Hábiles - Colombia",
          version: "1.0.0",
          status: "healthy",
          timestamp: "2025-01-01T10:00:00.000Z",
          uptime: 3600,
          environment: "test",
        });
      });

      it("debe retornar health check con estructura correcta", async () => {
        // Act
        const response = await request(app).get("/health/");

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("name");
        expect(response.body).toHaveProperty("version");
        expect(response.body).toHaveProperty("status");
        expect(response.body).toHaveProperty("timestamp");
        expect(response.body).toHaveProperty("uptime");
        expect(response.body).toHaveProperty("environment");
        expect(typeof response.body.name).toBe("string");
        expect(typeof response.body.version).toBe("string");
        expect(typeof response.body.status).toBe("string");
        expect(typeof response.body.timestamp).toBe("string");
        expect(typeof response.body.uptime).toBe("number");
        expect(typeof response.body.environment).toBe("string");
      });

      it("debe retornar valores constantes correctos", async () => {
        // Act
        const response = await request(app).get("/health/");

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.name).toBe("API de Fechas Hábiles - Colombia");
        expect(response.body.version).toBe("1.0.0");
        expect(response.body.status).toBe("healthy");
      });
    });

    describe("❌ Casos de error", () => {
      it("debe manejar error del controlador", async () => {
        // Arrange
        const mockGetHealthCheck =
          require("controllers/healthController").getHealthCheck;
        mockGetHealthCheck.mockImplementationOnce(
          (_req: unknown, res: unknown) => {
            (res as any).status(500).json({
              name: "API de Fechas Hábiles - Colombia",
              version: "1.0.0",
              status: "unhealthy",
              timestamp: "2025-01-01T10:00:00.000Z",
              uptime: 3600,
              environment: "test",
              error: "Internal server error",
            });
          }
        );

        // Act
        const response = await request(app).get("/health/");

        // Assert
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
          name: "API de Fechas Hábiles - Colombia",
          version: "1.0.0",
          status: "unhealthy",
          timestamp: "2025-01-01T10:00:00.000Z",
          uptime: 3600,
          environment: "test",
          error: "Internal server error",
        });
      });

      it("debe manejar error interno del servidor", async () => {
        // Arrange
        const mockGetHealthCheck =
          require("controllers/healthController").getHealthCheck;
        mockGetHealthCheck.mockImplementationOnce(
          (_req: unknown, res: unknown) => {
            (res as any).status(500).json({
              error: "InternalServerError",
              message: "Error interno del servidor",
            });
          }
        );

        // Act
        const response = await request(app).get("/health/");

        // Assert
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
          error: "InternalServerError",
          message: "Error interno del servidor",
        });
      });
    });

    describe("🔍 Validación de integridad", () => {
      it("debe mantener estructura correcta de respuesta exitosa", async () => {
        // Act
        const response = await request(app).get("/health/");

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("name");
        expect(response.body).toHaveProperty("version");
        expect(response.body).toHaveProperty("status");
        expect(response.body).toHaveProperty("timestamp");
        expect(response.body).toHaveProperty("uptime");
        expect(response.body).toHaveProperty("environment");
      });

      it("debe mantener estructura correcta de respuesta de error", async () => {
        // Arrange
        const mockGetHealthCheck =
          require("controllers/healthController").getHealthCheck;
        mockGetHealthCheck.mockImplementationOnce(
          (_req: unknown, res: unknown) => {
            (res as any).status(500).json({
              name: "API de Fechas Hábiles - Colombia",
              version: "1.0.0",
              status: "unhealthy",
              timestamp: "2025-01-01T10:00:00.000Z",
              uptime: 3600,
              environment: "test",
              error: "Internal server error",
            });
          }
        );

        // Act
        const response = await request(app).get("/health/");

        // Assert
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty("name");
        expect(response.body).toHaveProperty("version");
        expect(response.body).toHaveProperty("status");
        expect(response.body).toHaveProperty("timestamp");
        expect(response.body).toHaveProperty("uptime");
        expect(response.body).toHaveProperty("environment");
        expect(response.body).toHaveProperty("error");
      });

      it("debe manejar diferentes métodos HTTP", async () => {
        // Act & Assert
        const getResponse = await request(app).get("/health/");
        expect(getResponse.status).toBe(200);

        const postResponse = await request(app).post("/health/");
        expect(postResponse.status).toBe(404);

        const putResponse = await request(app).put("/health/");
        expect(putResponse.status).toBe(404);

        const deleteResponse = await request(app).delete("/health/");
        expect(deleteResponse.status).toBe(404);
      });

      it("debe manejar rutas inexistentes", async () => {
        // Act
        const response = await request(app).get("/health/nonexistent");

        // Assert
        expect(response.status).toBe(404);
      });

      it("debe manejar rutas con parámetros", async () => {
        // Act
        const response = await request(app).get("/health/test");

        // Assert
        expect(response.status).toBe(404);
      });
    });

    describe("🔍 Validación de tipos de datos", () => {
      it("debe retornar tipos de datos correctos", async () => {
        // Act
        const response = await request(app).get("/health/");

        // Assert
        expect(response.status).toBe(200);
        expect(typeof response.body.name).toBe("string");
        expect(typeof response.body.version).toBe("string");
        expect(typeof response.body.status).toBe("string");
        expect(typeof response.body.timestamp).toBe("string");
        expect(typeof response.body.uptime).toBe("number");
        expect(typeof response.body.environment).toBe("string");
      });

      it("debe retornar timestamp en formato ISO válido", async () => {
        // Act
        const response = await request(app).get("/health/");

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.timestamp).toMatch(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
        );
        expect(new Date(response.body.timestamp).toISOString()).toBe(
          response.body.timestamp
        );
      });

      it("debe retornar uptime como número positivo", async () => {
        // Act
        const response = await request(app).get("/health/");

        // Assert
        expect(response.status).toBe(200);
        expect(typeof response.body.uptime).toBe("number");
        expect(response.body.uptime).toBeGreaterThanOrEqual(0);
      });
    });

    describe("🔍 Validación de comportamiento", () => {
      it("debe ser una ruta síncrona", async () => {
        // Act
        const startTime = Date.now();
        const response = await request(app).get("/health/");
        const endTime = Date.now();

        // Assert
        expect(response.status).toBe(200);
        expect(endTime - startTime).toBeLessThan(1000); // Should be fast
      });

      it("debe manejar múltiples requests concurrentes", async () => {
        // Arrange
        const requests = Array(5)
          .fill(null)
          .map(() => request(app).get("/health/"));

        // Act
        const responses = await Promise.all(requests);

        // Assert
        responses.forEach(response => {
          expect(response.status).toBe(200);
          expect(response.body.status).toBe("healthy");
        });
      });

      it("debe mantener consistencia en múltiples llamadas", async () => {
        // Act
        const response1 = await request(app).get("/health/");
        const response2 = await request(app).get("/health/");
        const response3 = await request(app).get("/health/");

        // Assert
        expect(response1.status).toBe(200);
        expect(response2.status).toBe(200);
        expect(response3.status).toBe(200);
        expect(response1.body.name).toBe(response2.body.name);
        expect(response2.body.name).toBe(response3.body.name);
        expect(response1.body.version).toBe(response2.body.version);
        expect(response2.body.version).toBe(response3.body.version);
      });
    });
  });
});
