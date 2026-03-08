import prisma from "../database/prisma.ts";
import { z } from "zod";

const createHabitSchema = z.object({
  name: z.string().min(3, "O nome deve ter no mínimo 3 caracteres").max(200),
  type: z.enum(["checkbox", "amount"]).default("checkbox"),
});

const IdSchema = z.object({
  id: z.string().regex(/^\d+$/, "o ID deve conter apenas números"),
});

const updateHabitSchema = createHabitSchema.partial();

export async function getHabits(req, res) {
  const habits = await prisma.habit.findMany({
    where: {
      id: req.userID,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  res.json(habits);
}

export async function createHabit(req, res) {
  const result = createHabitSchema.safeParse(req.body);
  if (!result.success) return res.status(400).send(result.error);

  const { name, type } = result.data;
  const newHabit = await prisma.habit.create({
    data: {
      userId: req.userId,
      name,
      type,
    },
  });
  res.status(201).json(newHabit);
}
export async function updateHabit(req, res) {
  const result = IdSchema.safeParse(req.params);
  const update = updateHabitSchema.safeParse(req.body);

  if (!result.success) return res.status(400).send(result.error);

  if (!update.success) return res.status(400).send(update.error);

  const { name, type } = req.body;

  const { id } = req.params;

  const updateHabit = await prisma.habit.update({
    where: {
      id: Number(id),
      userId: req.userId,
    },
    data: {
      name,
      type,
    },
  });
  res.json(updateHabit);
}

export async function deleteHabit(req, res) {
  const result = IdSchema.safeParse(req.params);

  if (!result.success) return res.status(400).send(result.error);

  const { id } = req.params;

  await prisma.habit.delete({
    where: {
      id: Number(id), userId: req.userId
    }
  });
  res.status(204).send();
}
