import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.ts";

describe("Middleware de segurança pra rotas de quickNotes", () => {
  it("Deve retornar erro 401 se tentar acessar sem token", async () => {
      const response = await request(app).get("/quickNotes/query");

      expect(response.status).toBe(401);
    });
});
