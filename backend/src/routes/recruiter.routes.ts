import { Router } from "express";
import {
  getRecruiterProfile,
  onboardRecruiter,
  createOpportunity,
  listRecruiterOpportunities,
  getRecruiterMetrics,
} from "../controllers/recruiter.controller";

const router = Router();

router.get("/:id", getRecruiterProfile);
router.put("/:id/onboarding", onboardRecruiter);
router.post("/:id/opportunities", createOpportunity);
router.get("/:id/opportunities", listRecruiterOpportunities);
router.get("/:id/metrics", getRecruiterMetrics);

export default router;
