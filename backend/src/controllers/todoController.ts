import prisma from "../database/prisma.ts";
import { z } from "zod";

const createTodoSchema = z.object({
  noteId: z.number().min(1, "O ID do uma nota é obrigatória"),
  title: z
    .string()
    .min(3, "O título deve ter pelo menos 3 caracteres")
    .max(255),
});

const getTodoSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(10),
  sort: z.enum(["asc", "desc"]).default("desc"),
});

const IdSchema = z.object({
  id: z.string().regex(/^\d+$/, "o ID deve conter apenas números"),
});

export async function getTodos(req, res) {
  const result = getTodoSchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).send(result.error);
  }

  const { page, limit, sort } = result.data;

  const skip = (page - 1) * limit;

  const [todos, total] = await prisma.$transaction([
    prisma.todo.findMany({
      where: { userId: req.userId },
      orderBy: {
        createdAt: sort,
      },
      skip,
      take: limit,
    }),
    prisma.todo.count({
      where: {
        userId: req.userId,
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const formattedTodos = todos.map((todo) => {
    const totalTasks = todos.length;
    const completedTasks = todos.filter((todo) => todo.completed).length;

    return {
      ...todos,
      totalTasks,
      completedTasks,
    };
  });

  res.json({
    data: formattedTodos,
    meta: {
        totalItens: total,
        currentPage: page,
        totalPages: totalPages
    }
  });
};

export async function createTodo(req, res) {
  const result = createTodoSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).send(result.error);
  }

  const { noteId, title } = req.body;
  const noteBelongsToUser = await prisma.quicknote.findUnique({
    where: { userId: req.userId, id: noteId },
  });
  if (!noteBelongsToUser) {
    return res.status(404).send("Nota não encontrada");
  }
  const newTodo = await prisma.todo.create({
    data: { userId: req.userId, noteId, title },
  });
  res.json(newTodo);
}

export async function deleteTodo(req, res) {
  const result = IdSchema.safeParse(req.params);
  if (!result.success) {
    return res.status(400).send(result.error);
  }

  const { id } = req.params;
  const deleteTodo = await prisma.todo.delete({
    where: { id: Number(id), userId: req.userId },
  });
  res.json(deleteTodo);
}

export async function updateTodo(req, res) {
  const result = IdSchema.safeParse(req.params);
  if (!result.success) {
    return res.status(400).send(result.error);
  }

  const { id } = req.params;
  const { completed } = req.body;
  const updateTodo = await prisma.todo.update({
    where: { id: Number(id), userId: req.userId },
    data: { completed: completed },
  });
  res.json(updateTodo);
}
