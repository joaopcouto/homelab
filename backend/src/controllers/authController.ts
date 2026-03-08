import bcrypt from "bcrypt";
import prisma from "../database/prisma.ts";
import { z } from "zod";
import jwt from "jsonwebtoken";

const createUserSchema = z.object({
  name: z.string().min(3, "O nome deve ter no mínimo 3 letras").max(100),
  email: z.string().min(1, "Enderço de email é obrigatório").email(),
  password: z
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .max(20, "A senha deve ter no máximo 20 caracteres"),
});

const loginUserSchema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(8).max(20),
});

export async function handleSignUp(req, res) {
  const result = createUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).send(result.error);
  }

  console.log(result.data.email);
  const hashedPassword = await bcrypt.hash(result.data.password, 10);
  const createUser = await prisma.user.create({
    data: {
      name: result.data.name,
      email: result.data.email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
  return res.json(createUser);
}

export async function handleSignIn(req, res) {
  const result = loginUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).send(result.error);
  }

  const verifyUser = await prisma.user.findUnique({
    where: {
      email: result.data.email,
    },
    select: {
      id: true,
      password: true,
    },
  });
  if (!verifyUser) {
    return res.status(401).send("Credenciais inválidas");
  }
  const isPasswordValid = await bcrypt.compare(
    result.data.password,
    verifyUser.password,
  );
  if (isPasswordValid) {
    const token = jwt.sign(
      { userId: verifyUser.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );
    return res.json({ token });
  } else {
    return res.status(401).send("Credenciais inválidas");
  }
}
