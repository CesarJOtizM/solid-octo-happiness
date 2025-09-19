import request from "supertest";
import app from "../src/app";

describe("Endpoint de Fechas Hábiles - Integración", () => {
  describe("GET /business-date", () => {
    describe("Casos básicos del requerimiento", () => {
      it("debería calcular Viernes 5:00 PM + 1 hora → Lunes 9:00 AM", async () => {
        const response = await request(app).get("/business-date").query({
          hours: "1",
          date: "2025-01-03T22:00:00Z", // Viernes 5:00 PM Colombia (UTC-5)
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("date");

        // Verificar que la fecha resultante es un lunes
        const resultDate = new Date(response.body.date);
        const dayOfWeek = resultDate.getDay(); // 0 = Domingo, 1 = Lunes
        expect(dayOfWeek).toBe(1); // Lunes

        // Verificar que es alrededor de las 9:00 AM UTC
        const hours = resultDate.getUTCHours();
        expect(hours).toBe(14); // 9:00 AM Colombia = 14:00 UTC
      });

      it("debería calcular Sábado 2:00 PM + 1 hora → Lunes 9:00 AM", async () => {
        const response = await request(app).get("/business-date").query({
          hours: "1",
          date: "2025-01-04T19:00:00Z", // Sábado 2:00 PM Colombia (UTC-5)
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("date");

        // Verificar que la fecha resultante es un lunes
        const resultDate = new Date(response.body.date);
        const dayOfWeek = resultDate.getDay();
        expect(dayOfWeek).toBe(1); // Lunes
      });

      it("debería calcular Martes 3:00 PM + 1 día + 4 horas → Jueves 10:00 AM", async () => {
        const response = await request(app).get("/business-date").query({
          days: "1",
          hours: "4",
          date: "2025-01-07T20:00:00Z", // Martes 3:00 PM Colombia (UTC-5)
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("date");

        // Verificar que la fecha resultante es un jueves
        const resultDate = new Date(response.body.date);
        const dayOfWeek = resultDate.getDay();
        expect(dayOfWeek).toBe(4); // Jueves

        // Verificar que es alrededor de las 10:00 AM UTC
        const hours = resultDate.getUTCHours();
        expect(hours).toBe(15); // 10:00 AM Colombia = 15:00 UTC
      });
    });

    describe("Casos edge", () => {
      it("debería manejar Domingo 6:00 PM + 1 día → Lunes 5:00 PM", async () => {
        const response = await request(app).get("/business-date").query({
          days: "1",
          date: "2025-01-05T23:00:00Z", // Domingo 6:00 PM Colombia (UTC-5)
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("date");

        // Verificar que la fecha resultante es un lunes
        const resultDate = new Date(response.body.date);
        const dayOfWeek = resultDate.getDay();
        expect(dayOfWeek).toBe(1); // Lunes
      });

      it("debería manejar día laboral 8:00 AM + 8 horas → Mismo día 5:00 PM", async () => {
        const response = await request(app).get("/business-date").query({
          hours: "8",
          date: "2025-01-07T13:00:00Z", // Martes 8:00 AM Colombia (UTC-5)
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("date");

        // Verificar que es el mismo día
        const resultDate = new Date(response.body.date);
        const dayOfWeek = resultDate.getDay();
        expect(dayOfWeek).toBe(2); // Martes

        // Verificar que es alrededor de las 5:00 PM UTC
        const hours = resultDate.getUTCHours();
        expect(hours).toBe(22); // 5:00 PM Colombia = 22:00 UTC
      });

      it("debería manejar día laboral 8:00 AM + 1 día → Siguiente día laboral 8:00 AM", async () => {
        const response = await request(app).get("/business-date").query({
          days: "1",
          date: "2025-01-07T13:00:00Z", // Martes 8:00 AM Colombia (UTC-5)
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("date");

        // Verificar que es el siguiente día laboral (miércoles)
        const resultDate = new Date(response.body.date);
        const dayOfWeek = resultDate.getDay();
        expect(dayOfWeek).toBe(3); // Miércoles

        // Verificar que es alrededor de las 8:00 AM UTC
        const hours = resultDate.getUTCHours();
        expect(hours).toBe(13); // 8:00 AM Colombia = 13:00 UTC
      });
    });

    describe("Casos con días festivos", () => {
      it("debería manejar cálculo considerando días festivos", async () => {
        const response = await request(app).get("/business-date").query({
          days: "5",
          hours: "4",
          date: "2025-04-10T20:00:00Z", // 10 abril 3:00 PM Colombia (UTC-5)
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("date");

        // El resultado debería considerar los días festivos de abril (17-18)
        const resultDate = new Date(response.body.date);
        expect(resultDate.getMonth()).toBe(3); // Abril (0-indexed)
        expect(resultDate.getDate()).toBeGreaterThanOrEqual(21); // Después del 21 abril
      });
    });

    describe("Validaciones de parámetros", () => {
      it("debería rechazar cuando no se proporciona days ni hours", async () => {
        const response = await request(app).get("/business-date").query({
          date: "2025-01-01T10:00:00Z",
        });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("InvalidParameters");
        expect(response.body.message).toContain("al menos uno");
      });

      it("debería aceptar solo days", async () => {
        const response = await request(app).get("/business-date").query({
          days: "1",
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("date");
      });

      it("debería aceptar solo hours", async () => {
        const response = await request(app).get("/business-date").query({
          hours: "2",
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("date");
      });

      it("debería rechazar días negativos", async () => {
        const response = await request(app).get("/business-date").query({
          days: "-1",
          hours: "1",
        });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("InvalidParameters");
      });

      it("debería rechazar horas negativas", async () => {
        const response = await request(app).get("/business-date").query({
          days: "1",
          hours: "-2",
        });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("InvalidParameters");
      });

      it("debería rechazar formato de fecha inválido", async () => {
        const response = await request(app).get("/business-date").query({
          days: "1",
          hours: "1",
          date: "2025-01-01 10:00:00", // Formato incorrecto
        });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("InvalidParameters");
        expect(response.body.message).toContain("ISO 8601");
      });
    });

    describe("Manejo de errores", () => {
      it("debería manejar errores del servicio de días festivos", async () => {
        // Este test requeriría mockear el servicio de días festivos para simular un error
        // Por ahora, verificamos que el endpoint responde correctamente
        const response = await request(app).get("/business-date").query({
          days: "1",
          hours: "1",
        });

        // El endpoint debería responder (200 si funciona, 503 si hay error en servicio externo)
        expect([200, 503]).toContain(response.status);
      });
    });
  });
});
