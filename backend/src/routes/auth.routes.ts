import { Router } from "express";
import { signup, login, getSession } from "../controllers/auth.controller";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/session", getSession);

export default router;
