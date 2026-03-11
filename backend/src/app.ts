import "dotenv/config";
import express from "express";
import cors from "cors";
import todoRouter from "./routes/todoRoutes.ts";
import quickNoteRouter from "./routes/quickNoteRoutes.ts";
import authRouter from "./routes/authRoutes.ts";
import { globalErrorHandler } from "./middlewares/errorHandler.ts";
import habitRouter from "./routes/habitRoutes.ts";
import { processUndo } from "./controllers/undoController.ts";
import { authMiddleware } from "./middlewares/authMiddleware.ts";

process.on("unhandledRejection", (reason, p) => {
  console.error("Unhandled Rejection at:", p, "reason:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

const app = express();

app.use(cors());
app.use(express.json());

app.use("/todos", todoRouter);
app.use("/quickNotes", quickNoteRouter);
app.use("/habits", habitRouter);
app.post("/undo/:type", authMiddleware, processUndo);
app.use("/auth", authRouter);

app.use(globalErrorHandler);
export default app;
