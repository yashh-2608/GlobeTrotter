import { Router } from "express"
import {
  listActivitiesController,
  listDestinationsController,
} from "../controllers/explore.controller.js"
import { asyncHandler } from "../utils/async-handler.js"

export const destinationsRouter = Router()
export const activitiesRouter = Router()

destinationsRouter.get("/", asyncHandler(listDestinationsController))
activitiesRouter.get("/", asyncHandler(listActivitiesController))
