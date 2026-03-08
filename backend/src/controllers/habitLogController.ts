import prisma from "../database/prisma.ts";
import { z } from "zod";

const toggleLogSchema = z.object({
  habitId: z.number().min(1, "O ID do hábito é obrigatório"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "A data deve estar no formato YYYY-MM-DD"),
  value: z.string().min(1, "O valor é obrigatório"),
});

const getLogsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "A data deve estar no formato YYYY-MM-DD")
});

const IdSchema = z.object({
  id: z.string().regex(/^\d+$/, "o ID deve conter apenas números"),
});

const updateHabitLogSchema = toggleLogSchema.partial();



export async function getHabitLog(req, res) {
  const habitLogs = await prisma.habitLog.findMany({
    where: {
      id: req.userId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  res.json(habitLogs);
}

export async function createHabitLog(req, res) {
  const result = toggleLogSchema.safeParse(req.body);
  if (!result.success) return res.status(400).send(result.error);

  const { habitId, date, value } = result.data;





  const createHabitLog = await prisma.habitLog.create({
    data: {
      userId: req.userId,
      habitId,
      date,
      value,
    },
  });
  res.status(201).json(createHabitLog);
}





export async function updateHabitLog(req, res) {
  const result = IdSchema.safeParse(req.params);
  const update = updateHabitLogSchema.safeParse(req.body);
  if (!result.success) return res.status(400).send(result.error);
  if (!update.success) return res.status(400).send(update.error);

  const { habitId, date, value } = req.body;

  const id = req.params;

  const updateHabitLog = await prisma.habitLog.update({
    where: {
      id: Number(id),
      userId: req.userId,
    },
    data: {
      habitId,
      date,
      value,
    },
  });
  res.json(updateHabitLog);
}

export async function deleteHabitLog(req, res) {
  const result = IdSchema.safeParse(req.params);
  if (!result.success) return res.status(400).send(result.error);

  const id = req.params;

  await prisma.habitLog.delete({
    where: {
        userId: req.userId,
        id: Number(id)
    },
  });
  res.status(204).send();
}
