import prisma from "../database/prisma.ts";
import { z } from "zod";

const createQuickNoteSchema = z.object({
  user: z.number().min(1, "É necessário fornecer um ID"),
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
  page: z.coerce.number().min(1).default(1), // force any input to become a number
  limit: z.coerce.number().min(1).default(10),
  sort: z.enum(["asc", "desc"]).default("desc"),
});

export async function getNotesQuery(req, res) {
  const result = getNotesQuerySchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).send(result.error);
  }
  const { sort, page, limit } = result.data;
  const skip = (page - 1) * limit;

  try {
    const [notes, total] = await prisma.$transaction([
      prisma.quicknote.findMany({
        where: {
          userId: req.userId 
        }, 
        orderBy: {
        createdAt: sort,
      },
      skip,
      take: limit,
    }),
    prisma.quicknote.count({
      where: {
        userId: req.userId
      }
    }),
   ]);

   const totalPages = Math.ceil(total / limit);

   res.json({ data: notes,
       meta: {
      "totalItems": total,
      "currentPage": page ,
      "totalPages": totalPages
    }
      })
  } catch (e) {
    res.status(500).send("Erro interno no servidor");
  }
}

export async function getGlobalQuickNotes(req, res) {
  const q = req.query.q;

  if (!q) {
    return res.status(404).send("É necessário um termo para busca");
  }
  //
  try {
    const keywordInNote = await prisma.quicknote.findMany({
      where: {
        userId: req.userId,
        OR: [
          { title: { contains: String(q), mode: "insensitive" } },
          { content: { contains: String(q), mode: "insensitive" } },
          { category: { contains: String(q), mode: "insensitive" } },
        ],
      },
    });
    res.json(keywordInNote);
  } catch (e) {
    console.error(e);
    res.status(500).send("Erro interno no servidor");
  }
}

export async function getQuickNotes(req, res) {
  try {
    const quickNotes = await prisma.quicknote.findMany({
      include: { todos: true },
    });
    for (let j = 0; j < quickNotes.length; j++) {
      const totalTasks = quickNotes[j]?.todos.length;
      const completedTasks = quickNotes[j].todos.filter(
        (todo) => todo.completed === true,
      ).length;
      quickNotes[j].totalTasks = totalTasks;
      quickNotes[j].completedTasks = completedTasks;
    }
    res.json(quickNotes);
  } catch (e) {
    console.error(e);
    res.status(500).send("Erro interno no servidor");
  }
}

export async function createQuickNotes(req, res) {
  const result = createQuickNoteSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).send(result.error);
  }
  try {
    const { user, title, content, category } = req.body;
    const newQuickNote = await prisma.quicknote.create({
      data: { userId: user, title, content, category },
    });
    res.json(newQuickNote);
  } catch (e) {
    console.error(e);
    res.status(500).send("Erro interno no servidor");
  }
}

export async function deleteQuickNotes(req, res) {
  const result = IdSchema.safeParse(req.params);

  if (!result.success) {
    return res.status(400).send(result.error);
  }

  try {
    const { id } = req.params;
    const deleteQuickNote = await prisma.quicknote.delete({
      where: { id: Number(id), userId: req.userId },
    });
    res.status(204).send();
  } catch (e) {
    if (e.code === "P2025") {
      return res.status(404).send("Nota não encontrada");
    }
    console.error(e);
    res.status(500).send("Erro interno no servidor" + e);
  }
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

  try {
    const { id } = req.params;
    const findQuickNote = await prisma.quicknote.findUnique({
      where: { id: Number(id) },
    });
    if (findQuickNote) {
      const { title, content, category } = req.body;
      const updateQuickNote = await prisma.quicknote.update({
        where: { id: Number(id), userId: req.userId },
        data: { title, content, category },
      });
      res.json(updateQuickNote);
    } else {
      res.status(404).send("Nota não encontrada");
    }
  } catch (e) {
    console.error(e);
    res.status(500).send("Erro interno no servidor");
  }
}
