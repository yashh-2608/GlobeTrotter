import { Router } from "express"
import {
  commentPostController,
  createCommunityController,
  likePostController,
  listCommunityController,
} from "../controllers/community.controller.js"
import { requireAuth } from "../middleware/auth.middleware.js"
import { asyncHandler } from "../utils/async-handler.js"

export const communityRouter = Router()

communityRouter.get("/", asyncHandler(listCommunityController))
communityRouter.post("/", requireAuth, asyncHandler(createCommunityController))
communityRouter.post("/:id/like", requireAuth, asyncHandler(likePostController))
communityRouter.post("/:id/comment", requireAuth, asyncHandler(commentPostController))
