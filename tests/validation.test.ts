import request from "supertest";
import app from "../src/app";

describe("Middleware de Validación", () => {
  describe("validateBusinessDateRequest", () => {
    it("debería validar correctamente parámetros válidos", async () => {
      const response = await request(app).get("/business-date").query({
        days: "5",
        hours: "3",
        date: "2025-01-01T10:00:00Z",
      });

      // Si llega aquí sin error 400, la validación pasó
      expect(response.status).not.toBe(400);
    });

    it("debería rechazar días negativos", async () => {
      const response = await request(app).get("/business-date").query({
        days: "-1",
        hours: "3",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("InvalidParameters");
      expect(response.body.message).toContain("days");
      expect(response.body.message).toContain("positivo");
    });

    it("debería rechazar horas negativas", async () => {
      const response = await request(app).get("/business-date").query({
        days: "5",
        hours: "-2",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("InvalidParameters");
      expect(response.body.message).toContain("hours");
      expect(response.body.message).toContain("positivo");
    });

    it("debería rechazar días decimales", async () => {
      const response = await request(app).get("/business-date").query({
        days: "5.5",
        hours: "3",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("InvalidParameters");
      expect(response.body.message).toContain("entero");
    });

    it("debería rechazar horas decimales", async () => {
      const response = await request(app).get("/business-date").query({
        days: "5",
        hours: "3.7",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("InvalidParameters");
      expect(response.body.message).toContain("entero");
    });

    it("debería rechazar formato de fecha inválido", async () => {
      const response = await request(app).get("/business-date").query({
        days: "5",
        hours: "3",
        date: "2025-01-01 10:00:00", // Formato incorrecto
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("InvalidParameters");
      expect(response.body.message).toContain("ISO 8601");
    });

    it("debería rechazar fecha sin Z", async () => {
      const response = await request(app).get("/business-date").query({
        days: "5",
        hours: "3",
        date: "2025-01-01T10:00:00", // Sin Z
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("InvalidParameters");
      expect(response.body.message).toContain("ISO 8601");
    });

    it("debería rechazar fecha inválida", async () => {
      const response = await request(app).get("/business-date").query({
        days: "5",
        hours: "3",
        date: "2025-13-01T10:00:00Z", // Mes inválido
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("InvalidParameters");
      expect(response.body.message).toContain("ISO 8601");
    });

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
        days: "5",
      });

      expect(response.status).not.toBe(400);
    });

    it("debería aceptar solo hours", async () => {
      const response = await request(app).get("/business-date").query({
        hours: "3",
      });

      expect(response.status).not.toBe(400);
    });

    it("debería rechazar valores no numéricos para days", async () => {
      const response = await request(app).get("/business-date").query({
        days: "abc",
        hours: "3",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("InvalidParameters");
      expect(response.body.message).toContain("entero");
    });

    it("debería rechazar valores no numéricos para hours", async () => {
      const response = await request(app).get("/business-date").query({
        days: "5",
        hours: "xyz",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("InvalidParameters");
      expect(response.body.message).toContain("entero");
    });

    it("debería aceptar cero para days", async () => {
      const response = await request(app).get("/business-date").query({
        days: "0",
        hours: "3",
      });

      expect(response.status).not.toBe(400);
    });

    it("debería aceptar cero para hours", async () => {
      const response = await request(app).get("/business-date").query({
        days: "5",
        hours: "0",
      });

      expect(response.status).not.toBe(400);
    });
  });

  describe("Casos edge de validación", () => {
    it("debería manejar parámetros vacíos", async () => {
      const response = await request(app).get("/business-date").query({
        days: "",
        hours: "",
      });

      // Los parámetros vacíos se convierten a 0, que es válido
      expect(response.status).toBe(200);
      expect(response.body.validatedParams.days).toBe(0);
      expect(response.body.validatedParams.hours).toBe(0);
    });

    it("debería manejar parámetros undefined", async () => {
      const response = await request(app).get("/business-date").query({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("al menos uno");
    });

    it("debería manejar espacios en blanco", async () => {
      const response = await request(app).get("/business-date").query({
        days: "  5  ",
        hours: "  3  ",
      });

      // Los espacios deberían ser manejados por Number()
      expect(response.status).not.toBe(400);
    });
  });
});
