import express from 'express';

import {getQuickNotes, getGlobalQuickNotes, createQuickNotes, deleteQuickNotes, updateQuickNotes} from '../controllers/quickNoteController.ts';

const quickNoteRouter = express.Router();

quickNoteRouter.get('/', getQuickNotes);

quickNoteRouter.get('/search', getGlobalQuickNotes);

quickNoteRouter.post('/', createQuickNotes);

quickNoteRouter.delete('/:id', deleteQuickNotes);

quickNoteRouter.patch('/:id', updateQuickNotes);

export default quickNoteRouter;