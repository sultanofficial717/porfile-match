import { Router } from "express";
import {
  getStudentProfile,
  updateStudentProfile,
  updateStudentPreferences,
  getStudentProfileFile,
} from "../controllers/student.controller";

const router = Router();

router.get("/:id", getStudentProfile);
router.get("/:id/file", getStudentProfileFile);
router.get("/:id/export", getStudentProfileFile);
router.put("/:id", updateStudentProfile);
router.put("/:id/preferences", updateStudentPreferences);

export default router;

