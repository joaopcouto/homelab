import prisma from "../database/prisma.ts";
import { z } from "zod";
import { cacheService } from "../lib/redis.ts";

const undoSchema = z.object({
  type: z.enum(["todos", "quickNotes"]),
});

export async function processUndo(req, res) {
  const result = undoSchema.safeParse(req.params);
  if (!result.success) return res.status(400).send(result.error);
  const route = result.data.type;

  const stackKey = `user:${req.userId}:undo_${route}`;
  const lastDeletedData = await cacheService.popFromStack(stackKey);
  if (!lastDeletedData)
    return res.status(404).send("Não há nada para desfazer.");

  if (route === "todos") {
    const restore = await prisma.todo.create({
      data: {
        id: lastDeletedData.id,
        userId: lastDeletedData.userId,
        noteId: lastDeletedData.noteId,
        title: lastDeletedData.title,
        completed: lastDeletedData.completed,
        dueDate: lastDeletedData.dueDate,
        isPriority: lastDeletedData.isPriority,
      },
    });
    res.json(restore);
  } else if (route === "quickNotes") {
    const restore = await prisma.quicknote.create({
      data: {
        id: lastDeletedData.id,
        userId: lastDeletedData.userId,
        title: lastDeletedData.title,
        content: lastDeletedData.content,
        category: lastDeletedData.category,
      },
    });
    res.json(restore);
  }
}
