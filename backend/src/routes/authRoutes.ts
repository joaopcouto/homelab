import express from "express";
import { handleSignUp, handleSignIn } from "../controllers/authController.ts";

const authRouter = express.Router();

authRouter.post("/signup", handleSignUp);

authRouter.post("/signin", handleSignIn);

export default authRouter;
