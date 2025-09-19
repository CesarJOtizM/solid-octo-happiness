import request from "supertest";
import app from "../src/app";

describe("Endpoint Simple - Verificación de Funcionamiento", () => {
  it("debería responder correctamente con parámetros válidos", async () => {
    const response = await request(app).get("/business-date").query({
      days: "1",
      hours: "2",
    });

    // El endpoint debería responder (200 si funciona, 503 si hay error en servicio externo)
    expect([200, 503]).toContain(response.status);

    if (response.status === 200) {
      expect(response.body).toHaveProperty("date");
      expect(typeof response.body.date).toBe("string");
      expect(response.body.date).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/
      );
    } else {
      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
    }
  });

  it("debería rechazar parámetros inválidos", async () => {
    const response = await request(app).get("/business-date").query({
      days: "-1",
      hours: "2",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("InvalidParameters");
    expect(response.body.message).toContain("positivo");
  });

  it("debería rechazar cuando no se proporciona days ni hours", async () => {
    const response = await request(app).get("/business-date").query({
      date: "2025-01-01T10:00:00Z",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("InvalidParameters");
    expect(response.body.message).toContain("al menos uno");
  });
});
