import { Router } from "express";
import {
  listOpportunities,
  getOpportunityById,
} from "../controllers/opportunity.controller";

const router = Router();

router.get("/", listOpportunities);
router.get("/:id", getOpportunityById);

export default router;
