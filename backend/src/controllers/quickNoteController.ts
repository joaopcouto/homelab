import prisma from "../database/prisma.ts";
import { z } from "zod";
import { cacheService } from "../lib/redis.ts";

const createQuickNoteSchema = z.object({
  title: z
    .string()
    .min(3, "O título deve ter pelo menos 3 caracteres")
    .max(255),
  content: z
    .string()
    .min(3, "O conteúdo deve ter pelo menos 3 caracteres")
    .max(500),
  category: z
    .string()
    .min(3, "A categoria deve ter pelo menos 3 caracteres")
    .max(255),
});

const updateSchema = createQuickNoteSchema.partial();

const IdSchema = z.object({
  id: z.string().regex(/^\d+$/, "o ID deve conter apenas números"),
});

const getNotesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(10),
  sort: z.enum(["asc", "desc"]).default("desc"),
});

export async function getGlobalQuickNotes(req, res) {
  const q = req.query.q;

  if (!q) {
    return res.status(404).send("É necessário um termo para busca");
  }

  const key = `user:${req.userId}:search:${q}`;

  const cachedData = await cacheService.get(key);

  if (cachedData) {
    console.log("Cache Hit! 🚀", cachedData);
    return res.json(cachedData);
  }

  const freshData = await prisma.quicknote.findMany({
    where: {
      userId: req.userId,
      OR: [
        { title: { contains: String(q), mode: "insensitive" } },
        { content: { contains: String(q), mode: "insensitive" } },
        { category: { contains: String(q), mode: "insensitive" } },
      ],
    },
  });
  await cacheService.set(key, freshData);
  res.json(freshData);
}

export async function getQuickNotes(req, res) {
  const result = getNotesQuerySchema.safeParse(req.query);
  if (!result.success) return res.status(400).send(result.error);

  const { sort, page, limit } = result.data;
  const skip = (page - 1) * limit;

  const [notes, total] = await prisma.$transaction([
        prisma.quicknote.findMany({
          where: {
            userId: req.userId,
          },
          include: { todos: true },
          orderBy: {
            createdAt: sort,
          },
          skip,
          take: limit,
        }),
    prisma.quicknote.count({
      where: {
        userId: req.userId,
      },
    }),
  ]);
  const totalPages = Math.ceil(total / limit);

  const formattedNotes = notes.map((note) => {
    const totalTasks = note.todos.length;
    const completedTasks = note.todos.filter((todo) => todo.completed).length;

    return {
      ...note,
      totalTasks,
      completedTasks,
    };
  });

  return res.json({
    data: formattedNotes,
    meta: {
      totalItens: total,
      currentPage: page,
      totalPages: totalPages,
    },
  });
}

export async function createQuickNotes(req, res) {
  const result = createQuickNoteSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).send(result.error);
  }

  const { title, content, category } = req.body;
  const newQuickNote = await prisma.quicknote.create({
    data: { userId: req.userId, title, content, category },
  });
  res.json(newQuickNote);
}

export async function deleteQuickNotes(req, res) {
  const result = IdSchema.safeParse(req.params);

  if (!result.success) {
    return res.status(400).send(result.error);
  }
  const { id } = req.params;
  await prisma.quicknote.delete({
    where: { id: Number(id), userId: req.userId },
  });
  res.status(204).send();
}

export async function updateQuickNotes(req, res) {
  const result = IdSchema.safeParse(req.params);
  const update = updateSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).send(result.error);
  }

  if (!update.success) {
    return res.status(400).send(update.error);
  }

  const { id } = req.params;
  const { title, content, category } = req.body;
  const updateQuickNote = await prisma.quicknote.update({
    where: { id: Number(id), userId: req.userId },
    data: { title, content, category },
  });
  res.json(updateQuickNote);
}
