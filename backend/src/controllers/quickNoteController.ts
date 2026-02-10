import prisma from '../database/prisma.ts';
import { z } from 'zod';

const createQuickNoteSchema = z.object({
    title: z.string().min(3, "O título deve ter pelo menos 3 caracteres").max(255),
    content: z.string().min(3, "O conteúdo deve ter pelo menos 3 caracteres").max(500),
    category: z.string().min(3, "A categoria deve ter pelo menos 3 caracteres").max(255)
});

const updateSchema = createQuickNoteSchema.partial();

const IdSchema = z.object({
    id: z.string().regex(/^\d+$/, "o ID deve conter apenas números")
});

export async function getGlobalQuickNotes(req, res) {
    const { keyword } = req.query;

    if (!keyword) {
        return res.status(404).send("É necessário um termo para busca");
    }

    try {
        const keywordInNote = await prisma.quicknote.findMany({
            where: { 
                OR: 
                [{ title: { contains: String(keyword), mode: 'insensitive' } }, 
                 { content: { contains: String(keyword), mode: 'insensitive' } }] } });
        res.json(keywordInNote);
    } catch (e) {
        console.error(e)
        res.status(500).send("Erro interno no servidor");
    }
}

export async function getQuickNotes(req, res) {
    try {
        const quickNotes = await prisma.quicknote.findMany();
        res.json(quickNotes);
    } catch (e) {
        console.error(e)
        res.status(500).send("Erro interno no servidor");
    }
}

export async function createQuickNotes(req, res) {
    const result = createQuickNoteSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).send(result.error);
    }
    try {
        const { title, content, category } = req.body;
        const newQuickNote = await prisma.quicknote.create({ data: { title, content, category } });
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
        const deleteQuickNote = await prisma.quicknote.delete({ where: { id: Number(id) } });
        res.status(204).send();
    } catch (e) {
        if (e.code === 'P2025') {
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
        const findQuickNote = await prisma.quicknote.findUnique({ where: { id: Number(id) } });
        if (findQuickNote) {
            const { title, content, category } = req.body;
            const updateQuickNote = await prisma.quicknote.update({ where: { id: Number(id) }, data: { title, content, category } });
            res.json(updateQuickNote);
        } else {
            res.status(404).send("Nota não encontrada");
        }
    } catch (e) {
        console.error(e);
        res.status(500).send("Erro interno no servidor");
    }
}