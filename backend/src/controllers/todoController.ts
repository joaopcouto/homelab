import prisma from '../database/prisma.ts';
import { z } from 'zod';

const createTodoSchema = z.object({
    noteId: z.number().min(1, "O ID do uma nota é obrigatória"),
    title: z.string().min(3, "O título deve ter pelo menos 3 caracteres").max(255)
});

const IdSchema = z.object({
    id: z.string().regex(/^\d+$/, "o ID deve conter apenas números")
});

export async function getTodos(req, res) {
    try {
        const todos = await prisma.todo.findMany();
        res.json(todos);
    } catch (e) {
        console.error(e);
        res.status(500).send("Erro interno no servidor");
    }
}

export async function createTodo(req, res) {
    const result = createTodoSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).send(result.error)
    }

    try {
        const { noteId, title } = req.body;
        const newTodo = await prisma.todo.create({ data: { noteId, title } });
        res.json(newTodo);
    } catch (e) {
        res.status(500).send("Erro interno no servidor");
    }
}

export async function deleteTodo(req, res) {
    const result = IdSchema.safeParse(req.params);
    if (!result.success) {
        return res.status(400).send(result.error);
    }
    try {
        const { id } = req.params;
        const deleteTodo = await prisma.todo.delete({ where: { id: Number(id) } });
        res.json(deleteTodo);
    } catch (e) {
        if (e.code === 'P2025') {
            return res.status(404).send("Tarefa não encontrada")
        }
        console.error(e);
        res.status(500).send("Erro interno no servidor" + e);
    }
}

export async function updateTodo(req, res) {
    const result = IdSchema.safeParse(req.params);
    if (!result.success) {
        return res.status(400).send(result.error);
    }
    try {
        const { id } = req.params;
        const todoCompleted = await prisma.todo.findUnique({ where: { id: Number(id) } });
        if (todoCompleted) {
            const changedTodo = !todoCompleted.completed;
            const updateTodo = await prisma.todo.update({ where: { id: Number(id) }, data: { completed: changedTodo } });
            res.json(updateTodo);
        }
        else {
            res.status(404).send("Tarefa não encontrada");
        }
    } catch (e) {
        res.status(500).send("Erro interno no servidor");
    }
}
