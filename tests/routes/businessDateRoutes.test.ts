import request from "supertest";
import express from "express";
import businessDateRoutes from "../../src/routes/businessDateRoutes";
// Tipos simplificados para evitar problemas de compatibilidad

// Mock de middleware/validation
jest.mock("middleware/validation", () => ({
  validateBusinessDateRequest: jest.fn(
    (req: unknown, _res: unknown, next: unknown) => {
      (req as any).validatedParams = {
        days: 5,
        hours: 8,
        date: "2025-01-01T10:00:00Z",
      };
      (next as Function)();
    }
  ),
}));

// Mock de controllers/businessDateController
jest.mock("controllers/businessDateController", () => ({
  getBusinessDate: jest.fn((_req: unknown, res: unknown) => {
    (res as any).status(200).json({
      date: "2025-01-08T18:00:00Z",
    });
  }),
}));

describe("businessDateRoutes", () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use("/api", businessDateRoutes);
  });

  describe("GET /api/business-date", () => {
    describe("✅ Casos exitosos", () => {
      it("debe procesar request exitoso con parámetros válidos", async () => {
        // Arrange
        const queryParams = {
          days: "5",
          hours: "8",
          date: "2025-01-01T10:00:00Z",
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

      it("debe procesar request con solo días", async () => {
        // Arrange
        const queryParams = {
          days: "3",
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

      it("debe procesar request con solo horas", async () => {
        // Arrange
        const queryParams = {
          hours: "6",
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

      it("debe procesar request sin parámetros", async () => {
        // Act
        const response = await request(app).get("/api/business-date");

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          date: "2025-01-08T18:00:00Z",
        });
      });
    });

    describe("❌ Casos de error", () => {
      it("debe manejar error de validación", async () => {
        // Arrange
        const mockValidateBusinessDateRequest =
          require("middleware/validation").validateBusinessDateRequest;
        mockValidateBusinessDateRequest.mockImplementationOnce(
          (_req: unknown, res: unknown, _next: unknown) => {
            (res as any).status(400).json({
              error: "INVALID_PARAMETERS",
              message:
                "Parámetro inválido 'days': Expected string, received number",
            });
          }
        );

        const queryParams = {
          days: 5, // Invalid: should be string
        };

        // Act
        const response = await request(app)
          .get("/api/business-date")
          .query(queryParams);

        // Assert
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          error: "INVALID_PARAMETERS",
          message:
            "Parámetro inválido 'days': Expected string, received number",
        });
      });

      it("debe manejar error del controlador", async () => {
        // Arrange
        const mockGetBusinessDate =
          require("controllers/businessDateController").getBusinessDate;
        mockGetBusinessDate.mockImplementationOnce(
          (_req: unknown, res: unknown) => {
            (res as any).status(503).json({
              error: "HolidayServiceError",
              message:
                "Error al obtener días festivos: No se pudo conectar con la API",
            });
          }
        );

        const queryParams = {
          days: "5",
        };

        // Act
        const response = await request(app)
          .get("/api/business-date")
          .query(queryParams);

        // Assert
        expect(response.status).toBe(503);
        expect(response.body).toEqual({
          error: "HolidayServiceError",
          message:
            "Error al obtener días festivos: No se pudo conectar con la API",
        });
      });

      it("debe manejar error interno del servidor", async () => {
        // Arrange
        const mockGetBusinessDate =
          require("controllers/businessDateController").getBusinessDate;
        mockGetBusinessDate.mockImplementationOnce(
          (_req: unknown, res: unknown) => {
            (res as any).status(500).json({
              error: "InternalServerError",
              message: "Error interno del servidor",
            });
          }
        );

        const queryParams = {
          days: "5",
        };

        // Act
        const response = await request(app)
          .get("/api/business-date")
          .query(queryParams);

        // Assert
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
          error: "InternalServerError",
          message: "Error interno del servidor",
        });
      });
    });

    describe("🔍 Validación de middleware", () => {
      it("debe ejecutar middleware de validación antes del controlador", async () => {
        // Arrange
        const mockValidateBusinessDateRequest =
          require("middleware/validation").validateBusinessDateRequest;
        const mockGetBusinessDate =
          require("controllers/businessDateController").getBusinessDate;

        const queryParams = {
          days: "5",
          hours: "8",
        };

        // Act
        await request(app).get("/api/business-date").query(queryParams);

        // Assert
        expect(mockValidateBusinessDateRequest).toHaveBeenCalled();
        expect(mockGetBusinessDate).toHaveBeenCalled();
      });

      it("debe pasar parámetros validados al controlador", async () => {
        // Arrange
        const mockValidateBusinessDateRequest =
          require("middleware/validation").validateBusinessDateRequest;
        const mockGetBusinessDate =
          require("controllers/businessDateController").getBusinessDate;

        mockValidateBusinessDateRequest.mockImplementationOnce(
          (req: unknown, _res: unknown, next: unknown) => {
            (req as any).validatedParams = {
              days: 3,
              hours: 4,
              date: "2025-01-15T09:00:00Z",
            };
            (next as Function)();
          }
        );

        mockGetBusinessDate.mockImplementationOnce(
          (req: unknown, res: unknown) => {
            expect((req as any).validatedParams).toEqual({
              days: 3,
              hours: 4,
              date: "2025-01-15T09:00:00Z",
            });
            (res as any).status(200).json({ date: "2025-01-18T13:00:00Z" });
          }
        );

        const queryParams = {
          days: "3",
          hours: "4",
          date: "2025-01-15T09:00:00Z",
        };

        // Act
        const response = await request(app)
          .get("/api/business-date")
          .query(queryParams);

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          date: "2025-01-18T13:00:00Z",
        });
      });
    });

    describe("🔍 Validación de integridad", () => {
      it("debe mantener estructura correcta de respuesta exitosa", async () => {
        // Act
        const response = await request(app)
          .get("/api/business-date")
          .query({ days: "5" });

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("date");
        expect(typeof response.body.date).toBe("string");
        expect(response.body.date).toMatch(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
        );
      });

      it("debe mantener estructura correcta de respuesta de error", async () => {
        // Arrange
        const mockGetBusinessDate =
          require("controllers/businessDateController").getBusinessDate;
        mockGetBusinessDate.mockImplementationOnce(
          (_req: unknown, res: unknown) => {
            (res as any).status(400).json({
              error: "ValidationError",
              message: "Error de validación",
            });
          }
        );

        // Act
        const response = await request(app)
          .get("/api/business-date")
          .query({ days: "5" });

        // Assert
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body).toHaveProperty("message");
        expect(typeof response.body.error).toBe("string");
        expect(typeof response.body.message).toBe("string");
      });

      it("debe manejar diferentes métodos HTTP", async () => {
        // Act & Assert
        const getResponse = await request(app).get("/api/business-date");
        expect(getResponse.status).toBe(200);

        const postResponse = await request(app).post("/api/business-date");
        expect(postResponse.status).toBe(404);

        const putResponse = await request(app).put("/api/business-date");
        expect(putResponse.status).toBe(404);

        const deleteResponse = await request(app).delete("/api/business-date");
        expect(deleteResponse.status).toBe(404);
      });

      it("debe manejar rutas inexistentes", async () => {
        // Act
        const response = await request(app).get("/api/nonexistent");

        // Assert
        expect(response.status).toBe(404);
      });
    });

    describe("🔍 Validación de parámetros", () => {
      it("debe aceptar parámetros válidos", async () => {
        // Arrange
        const validParams = [
          { days: "5" },
          { hours: "8" },
          { days: "3", hours: "4" },
          { days: "1", date: "2025-01-01T10:00:00Z" },
          { hours: "2", date: "2025-01-01T10:00:00Z" },
          { days: "5", hours: "8", date: "2025-01-01T10:00:00Z" },
        ];

        for (const params of validParams) {
          // Act
          const response = await request(app)
            .get("/api/business-date")
            .query(params);

          // Assert
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty("date");
        }
      });

      it("debe manejar parámetros opcionales", async () => {
        // Act
        const response = await request(app).get("/api/business-date");

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          date: "2025-01-08T18:00:00Z",
        });
      });
    });
  });
});
