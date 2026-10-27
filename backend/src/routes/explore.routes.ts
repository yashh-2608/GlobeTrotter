import { Router } from "express"
import {
  listActivitiesController,
  listDestinationsController,
  getDestinationController,
} from "../controllers/explore.controller.js"
import { asyncHandler } from "../utils/async-handler.js"

export const destinationsRouter = Router()
export const activitiesRouter = Router()

destinationsRouter.get("/", asyncHandler(listDestinationsController))
destinationsRouter.get("/:id", asyncHandler(getDestinationController))
activitiesRouter.get("/", asyncHandler(listActivitiesController))
