import request from "supertest";
import app from "../src/app";

describe("App", () => {
  it("should respond to GET /", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "API de Fechas Hábiles - Colombia",
    });
  });
});
