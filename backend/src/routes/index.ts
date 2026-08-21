import { Router } from "express";
import authRoutes from "./auth.routes";
import studentRoutes from "./student.routes";
import recruiterRoutes from "./recruiter.routes";
import adminRoutes from "./admin.routes";
import opportunityRoutes from "./opportunity.routes";
import matchRoutes from "./match.routes";
import notificationRoutes from "./notification.routes";
import healthRoutes from "./health.routes";

const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/students", studentRoutes);
apiRouter.use("/recruiters", recruiterRoutes);
apiRouter.use("/admin", adminRoutes);
apiRouter.use("/opportunities", opportunityRoutes);
apiRouter.use("/matches", matchRoutes);
apiRouter.use("/notifications", notificationRoutes);
apiRouter.use("/system", healthRoutes);

export default apiRouter;
