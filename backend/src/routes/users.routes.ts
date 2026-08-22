import { Router } from "express"
import { getMeController, updateMeController } from "../controllers/users.controller.js"
import { requireAuth } from "../middleware/auth.middleware.js"
import { asyncHandler } from "../utils/async-handler.js"

export const usersRouter = Router()

usersRouter.get("/me", requireAuth, asyncHandler(getMeController))
usersRouter.patch("/me", requireAuth, asyncHandler(updateMeController))
