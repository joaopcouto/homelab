import express from "express";

import {
  getQuickNotes,
  getGlobalQuickNotes,
  createQuickNotes,
  deleteQuickNotes,
  updateQuickNotes,
} from "../controllers/quickNoteController.ts";
import { authMiddleware } from "../middlewares/authMiddleware.ts";

const quickNoteRouter = express.Router();

quickNoteRouter.use((req, res, next) => {
  authMiddleware(req, res, next);
});

quickNoteRouter.get("/", getQuickNotes);

quickNoteRouter.get("/search", getGlobalQuickNotes);

quickNoteRouter.post("/", createQuickNotes);

quickNoteRouter.delete("/:id", deleteQuickNotes);

quickNoteRouter.patch("/:id", updateQuickNotes);

export default quickNoteRouter;
