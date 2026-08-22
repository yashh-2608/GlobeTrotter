import { Router } from "express"
import { adminStatsController } from "../controllers/admin.controller.js"
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js"
import { asyncHandler } from "../utils/async-handler.js"

export const adminRouter = Router()

adminRouter.get("/stats", requireAuth, requireAdmin, asyncHandler(adminStatsController))
