import type { Request, Response, NextFunction } from "express";

export function globalErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log("🚨 ERRO CAPTURADO:", error);

  if (error.name === "PrismaClientKnownRequestError") {

    const prismaError = error as any;
    // P2002: Unique constraint failed (Ex: E-mail já existe)
    if (prismaError.code === "P2002") {
      return res.status(409).json({
        message: "Conflito: Este registro já existe no banco de dados.",
      });
    }

    // P2025: Record to update/delete not found
    if (prismaError.code === "P2025") {
      return res.status(404).json({
        message: "Não encontrado: O registro solicitado não existe.",
      });
    }
  }

  if (error.name === "ZodError") {
    return res.status(400).json({
      message: "Erro de validação nos dados enviados.",
      // @ts-ignore - Temporário só para extrair os detalhes do Zod
      issues: error.issues,
    });
  }

  // Se não for do Prisma nem do Zod, é um erro desconhecido (Fallback)
  return res.status(500).json({ message: "Erro interno no servidor" });
}
