import prisma from "../database/prisma.ts";
import { z } from "zod";

const toggleLogSchema = z.object({
  habitId: z.number().min(1, "O ID do hábito é obrigatório"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "A data deve estar no formato YYYY-MM-DD"),
  value: z.string().min(1, "O valor é obrigatório"),
});

const getLogsSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "A data deve estar no formato YYYY-MM-DD"),
});

export async function toggleHabitLog(req, res) {
  const result = toggleLogSchema.safeParse(req.body);
  if (!result.success) return res.status(400).send(result.error);

  const { habitId, date, value } = result.data;

  const habitBelongsToUser = await prisma.habit.findUnique({
    where: {
      id: habitId,
      userId: req.userId,
    },
  });

  if (!habitBelongsToUser) return res.status(404).send("Hábito não encontrado ou não te pertence.");

  const log = await prisma.habitLog.upsert({
    where: {
      // Usamos a chave composta gerada pelo @@unique([habitId, date]) no schema
      habitId_date: {
        habitId: habitId,
        date: date
      }
    },
    update: {
      value: value // Se ja existir um log para esse habito nesse dia, apenas atualiza o valor
    },
    create: {
      userId: req.userId,
      habitId: habitId,
      date: date,
      value: value
    }
  });
  res.json(log);
}

export async function getHabitLogByDate(req, res) {
  const result = getLogsSchema.safeParse(req.query);
  console.log(result.data);

  if (!result.success) return res.status(400).send(result.error);

  const { date } = result.data;
  
  const logs = await prisma.habitLog.findMany({
    where: {
      userId: req.userId,
      date: date
    },
  });
  res.json(logs);
}
