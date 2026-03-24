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

const getHeatmapSchema = z.object({
  month: z.string().regex(/^(0[1-9]|1[0-2])$/, "Mês deve ser entre 01 e 12"),
  year: z.string().regex(/^\d{4}$/, "Ano deve ter 4 dígitos"),
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

  if (!habitBelongsToUser)
    return res.status(404).send("Hábito não encontrado ou não te pertence.");

  const log = await prisma.habitLog.upsert({
    where: {
      // Usamos a chave composta gerada pelo @@unique([habitId, date]) no schema
      habitId_date: {
        habitId: habitId,
        date: date,
      },
    },
    update: {
      value: value, // Se ja existir um log para esse habito nesse dia, apenas atualiza o valor
    },
    create: {
      userId: req.userId,
      habitId: habitId,
      date: date,
      value: value,
    },
  });
  res.json(log);
}

export async function getHabitLogByDate(req, res) {
  const result = getLogsSchema.safeParse(req.query);

  if (!result.success) return res.status(400).send(result.error);

  const { date } = result.data;

  const [logsDoDia, completados, totalDeHabitos] = await prisma.$transaction([
   prisma.habit.findMany({
     where: {
       userId: req.userId,
     },
     include: {
      logs: {
        where: {
          date: date
        }
      }
     }
   }),
   prisma.habitLog.count({
    where: {
      userId: req.userId,
      date: date,
      value: { not: "false"}
    }
   }),
   prisma.habit.count({
    where: {
      userId: req.userId,
    }
   }),
  ]);

  const porcentagem = totalDeHabitos === 0 ? 0 : Math.round((completados/totalDeHabitos) * 100)

  console.log(logsDoDia)

  const formattedLogs = {
    "habits": logsDoDia,
    "completados": completados,
    "total": totalDeHabitos,
    "porcentagemCompletada": porcentagem,
  }
  res.json(formattedLogs);
}

export async function getHabitHeatmap(req, res) {
  const result = getHeatmapSchema.safeParse(req.query);

  if (!result.success) return res.status(400).send(result.error);

  const { month, year } = result.data;

  const logs = await prisma.habitLog.findMany({
    where: {
      userId: req.userId,
      date: { startsWith: `${year}-${month}` },
      value: { not: "false" },
    },
    include: {
      habit: {
        select: { name: true },
      },
    },
  });

  const heatmapData: Record<string, { count: number; habits: string[] }> = {};

  for (const log of logs) {
    if (!heatmapData[log.date]) {
      heatmapData[log.date] = { count: 0, habits: [] };
    }

    heatmapData[log.date].habits.push(log.habit.name);
    heatmapData[log.date].count += 1;
  }
  res.json(heatmapData);
}
