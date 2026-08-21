import { Router } from "express";
import {
  getStudentMatches,
  getMatchExplanation,
} from "../controllers/match.controller";

const router = Router();

router.get("/student/:studentId", getStudentMatches);
router.get("/explanation/:studentId/:opportunityId", getMatchExplanation);

export default router;
