import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // 1. O segurança pede a pulseira
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send("Token não fornecido");
  }

  // 2. O segurança tira a palavra "Bearer " para analisar só o código
  const [, token] = authHeader.split(" ");

  try {
    // DESAFIO AQUI:
    // 3. Use jwt.verify(token, SUA_SENHA_MESTRE) para validar o token.

    // 4. Se a linha de cima não der erro, significa que o token é válido!
    // Chame a função next() para deixar o usuário entrar.
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {userId: number};
    req.userId = decoded.userId;
    next();
  } catch (error) {
    // Se o token for inventado ou estiver expirado, o jwt.verify joga um erro e cai aqui.
    return res.status(401).send("Token inválido ou expirado");
  }
}
