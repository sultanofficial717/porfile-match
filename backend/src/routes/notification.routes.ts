import { Router } from "express";
import {
  getStudentNotifications,
  listAllEmailLogs,
} from "../controllers/notification.controller";

const router = Router();

router.get("/student/:studentId", getStudentNotifications);
router.get("/emails", listAllEmailLogs);

export default router;
