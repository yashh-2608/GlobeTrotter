import { Router } from "express"
import { asyncHandler } from "../utils/async-handler.js"
import { loginController, registerController } from "../controllers/auth.controller.js"

export const authRouter = Router()

authRouter.post("/register", asyncHandler(registerController))
authRouter.post("/login", asyncHandler(loginController))
