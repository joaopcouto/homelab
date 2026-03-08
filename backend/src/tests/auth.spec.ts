import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.ts";

describe("Autenticação de usuários", () => {
  it("Deve retornar erro 400 se tentar logar com body vazio", async () => {
    const response = await request(app).post("/auth/signin").send({});
    
    expect(response.status).toBe(400);
    expect(response.body.name).toBe("ZodError");
  });

  it("Deve retornar erro 401 se tentar logar com credenciais inválidas", async () => {
    const response = await request(app).post("/auth/signin").send({"email": "hacker@gmail.com", "password": "senha123456"
    });

    expect(response.status).toBe(401);
  })
});
