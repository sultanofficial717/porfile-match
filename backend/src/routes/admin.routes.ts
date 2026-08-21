import { Router } from "express";
import {
  getRecruiterApprovalQueue,
  updateRecruiterStatus,
  getOpportunityReviewQueue,
  reviewOpportunity,
  listAllUsers,
  getPlatformMetrics,
} from "../controllers/admin.controller";

const router = Router();

router.get("/recruiters/pending", getRecruiterApprovalQueue);
router.put("/recruiters/:id/status", updateRecruiterStatus);
router.get("/opportunities/pending", getOpportunityReviewQueue);
router.put("/opportunities/:id/review", reviewOpportunity);
router.get("/users", listAllUsers);
router.get("/metrics", getPlatformMetrics);

export default router;
