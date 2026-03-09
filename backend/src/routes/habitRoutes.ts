import express from "express";
import {
  createHabit,
  getHabits,
  updateHabit,
  deleteHabit,
} from "../controllers/habitController.ts";
import { authMiddleware } from "../middlewares/authMiddleware.ts";
import {
  getHabitLogByDate,
  toggleHabitLog,
} from "../controllers/habitLogController.ts";

const habitRouter = express.Router();

habitRouter.use((req, res, next) => {
  authMiddleware(req, res, next);
});

habitRouter.get("/", getHabits);

habitRouter.get("/logs", getHabitLogByDate);

habitRouter.post("/logs", toggleHabitLog);

habitRouter.post("/", createHabit);

habitRouter.delete("/:id", deleteHabit);

habitRouter.patch("/:id", updateHabit);

export default habitRouter;
